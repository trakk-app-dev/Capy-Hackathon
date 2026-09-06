// Mock auth layer — localStorage-backed. Replace with real Firebase auth when credentials available.
// To restore: git checkout src/lib/auth.ts

export interface MockUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  isAnonymous: boolean;
}

export type User = MockUser;
export type Unsubscribe = () => void;

const STORAGE_KEY = 'capy_auth';
const listeners: Array<(user: MockUser | null) => void> = [];

function getStoredUser(): MockUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredUser(user: MockUser | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  listeners.forEach((cb) => cb(user));
}

export async function signInWithGoogle(): Promise<MockUser> {
  const user: MockUser = { uid: 'mock-user-1', displayName: 'Test User', email: 'test@capy.app', isAnonymous: false };
  setStoredUser(user);
  return user;
}

export async function signUpWithEmail(email: string, _password: string): Promise<MockUser> {
  const user: MockUser = { uid: 'mock-user-1', displayName: email.split('@')[0], email, isAnonymous: false };
  setStoredUser(user);
  return user;
}

export async function signInWithEmail(_email: string, _password: string): Promise<MockUser> {
  const user: MockUser = { uid: 'mock-user-1', displayName: 'Test User', email: _email, isAnonymous: false };
  setStoredUser(user);
  return user;
}

export async function signInAnonymously(): Promise<MockUser> {
  const user: MockUser = { uid: 'mock-guest-1', displayName: 'Guest', email: null, isAnonymous: true };
  setStoredUser(user);
  return user;
}

export async function upgradeAnonymousToGoogle(): Promise<MockUser> {
  const user: MockUser = { uid: 'mock-user-1', displayName: 'Test User', email: 'test@capy.app', isAnonymous: false };
  setStoredUser(user);
  return user;
}

export async function upgradeAnonymousToEmail(email: string, _password: string): Promise<MockUser> {
  const user: MockUser = { uid: 'mock-user-1', displayName: email.split('@')[0], email, isAnonymous: false };
  setStoredUser(user);
  return user;
}

export async function signOut(): Promise<void> {
  setStoredUser(null);
}

export function onAuthStateChanged(callback: (user: MockUser | null) => void): Unsubscribe {
  listeners.push(callback);
  queueMicrotask(() => callback(getStoredUser()));
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

export function getCurrentUser(): MockUser | null {
  return getStoredUser();
}
