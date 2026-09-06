import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  linkWithPopup,
  linkWithCredential,
  deleteUser,
  EmailAuthProvider,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { auth } from './firebase';
import { createUserProfile, getUserProfile } from './db';

export type { User, Unsubscribe };

const googleProvider = new GoogleAuthProvider();

// ─── Sign in with Google ─────────────────────────────────────────
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Create Firestore profile if new user
  const existingProfile = await getUserProfile(user.uid);
  if (!existingProfile) {
    await createUserProfile(user.uid, {
      displayName: user.displayName || 'Capy User',
      email: user.email,
      isAnonymous: false,
    });
  }

  return user;
}

// ─── Sign up with email/password ─────────────────────────────────
export async function signUpWithEmail(email: string, password: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const user = result.user;

  try {
    await createUserProfile(user.uid, {
      displayName: email.split('@')[0],
      email: user.email,
      isAnonymous: false,
    });
  } catch (err) {
    // The Firestore profile write failed (e.g. denied by security rules).
    // Roll back the just-created auth account so it isn't left orphaned —
    // otherwise a retry hits "email-already-in-use" and the account never
    // gets a profile/pet. If the delete itself fails, at least sign out so the
    // user isn't stranded in an authenticated, profile-less session.
    try {
      await deleteUser(user);
    } catch {
      await firebaseSignOut(auth).catch(() => {});
    }
    throw err;
  }

  return user;
}

// ─── Sign in with email/password ─────────────────────────────────
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const user = result.user;

  // Self-heal: an account whose profile write never completed (e.g. an
  // interrupted signup) gets its profile created now, so downstream pages
  // never read a null profile. Best-effort — a transient Firestore failure
  // here must NOT turn a successful sign-in into a hard error; routeAfterAuth()
  // and the /home guard still sort out where to send the user.
  try {
    const existingProfile = await getUserProfile(user.uid);
    if (!existingProfile) {
      await createUserProfile(user.uid, {
        displayName: email.split('@')[0],
        email: user.email,
        isAnonymous: false,
      });
    }
  } catch (err) {
    console.error('Profile self-heal skipped:', err);
  }

  return user;
}

// ─── Sign in anonymously (guest) ─────────────────────────────────
export async function signInAnonymously(): Promise<User> {
  const result = await firebaseSignInAnonymously(auth);
  const user = result.user;

  const existingProfile = await getUserProfile(user.uid);
  if (!existingProfile) {
    await createUserProfile(user.uid, {
      displayName: 'Guest',
      email: null,
      isAnonymous: true,
    });
  }

  return user;
}

// ─── Upgrade anonymous → full account ────────────────────────────
export async function upgradeAnonymousToGoogle(): Promise<User> {
  const user = auth.currentUser;
  if (!user || !user.isAnonymous) throw new Error('No anonymous user to upgrade');

  const result = await linkWithPopup(user, googleProvider);
  return result.user;
}

export async function upgradeAnonymousToEmail(email: string, password: string): Promise<User> {
  const user = auth.currentUser;
  if (!user || !user.isAnonymous) throw new Error('No anonymous user to upgrade');

  const credential = EmailAuthProvider.credential(email, password);
  const result = await linkWithCredential(user, credential);
  return result.user;
}

// ─── Post-auth routing ───────────────────────────────────────────
// Decides where to send a user after any sign-in/sign-up: to /onboarding if
// they haven't finished it yet (no pet), otherwise /home. Used for every auth
// method so returning users never get dropped back into onboarding (which
// would reset their pet to level 1).
export async function routeAfterAuth(uid: string): Promise<'/home' | '/onboarding'> {
  try {
    const profile = await getUserProfile(uid);
    return profile?.onboardingComplete ? '/home' : '/onboarding';
  } catch {
    // A profile-read failure must not block navigation after a successful auth.
    // Default to /home, whose own guard re-routes incomplete profiles to
    // /onboarding once the read recovers.
    return '/home';
  }
}

// ─── Sign out ────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// ─── Auth state listener ─────────────────────────────────────────
export function onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe {
  return firebaseOnAuthStateChanged(auth, callback);
}

// ─── Get current user ────────────────────────────────────────────
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
