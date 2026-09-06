import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp,
  writeBatch,
  Timestamp as FirestoreTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { StartData } from './start-types';

export type { Timestamp };

// ─── Types ───────────────────────────────────────────────────────

export interface UserProfile {
  displayName: string;
  email: string | null;
  isAnonymous: boolean;
  createdAt?: Timestamp;
  onboardingAnswers?: string[];
  onboardingComplete?: boolean;
}

export interface PetData {
  name: string;
  color: string;
  level: number;
  xp: number;
  equippedHat: string | null;
  equippedClothes: string | null;
  unlockedItems: string[];
}

export interface SessionData {
  taskTitle: string;
  contextText: string;
  contextImageUrls: string[];
  proofImageUrl: string | null;
  proofText: string;
  aiTaskDescription: string;
  xpReward: number;
  xpPenalty: number;
  xpChange: number;
  approved: boolean;
  completionLevel: 'full' | 'partial' | 'none';
  aiFeedback: string;
  timeEstimate: number;
  timeActual: number;
  timerStartedAt?: Timestamp;
  status: 'active' | 'completed' | 'failed';
  timestamp?: Timestamp;
  isScreenshottable?: boolean;
  commitmentId?: string;
  goalTitleSnapshot?: string;
}

export interface CommitmentData {
  title: string;
  originalInput: string;
  userDescription?: string;
  description: string;
  verificationMethod: 'photo' | 'text' | 'both';
  deadline: Timestamp;
  status: 'active' | 'completed' | 'failed';
  xpReward: number;
  xpPenalty: number;
  proofImageUrls: string[];
  proofText: string;
  aiFeedback: string;
  approved: boolean;
  createdAt?: Timestamp;
  completedAt?: Timestamp;
  linkedSessionIds?: string[];
}

// ─── User Profile ────────────────────────────────────────────────

export async function createUserProfile(
  uid: string,
  data: { displayName: string; email: string | null; isAnonymous: boolean }
): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'profile', 'main'), {
    ...data,
    createdAt: serverTimestamp(),
    onboardingAnswers: [],
    onboardingComplete: false,
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'profile', 'main'));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  // setDoc+merge rather than updateDoc: a partial update still applies, but a
  // missing profile doc (e.g. a rare interrupted-signup account) self-heals
  // instead of throwing "No document to update".
  await setDoc(doc(db, 'users', uid, 'profile', 'main'), data, { merge: true });
}

// ─── Pet Data ────────────────────────────────────────────────────

export async function createPet(uid: string, data: PetData): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'pet', 'main'), data);
}

export async function getPet(uid: string): Promise<PetData | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'pet', 'main'));
  return snap.exists() ? (snap.data() as PetData) : null;
}

export async function updatePet(uid: string, data: Partial<PetData>): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'pet', 'main'), data);
}

// ─── Sessions ────────────────────────────────────────────────────

export async function createSession(uid: string, data: Partial<SessionData>): Promise<string> {
  const sessionsRef = collection(db, 'users', uid, 'sessions');
  const docRef = await addDoc(sessionsRef, {
    ...data,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
}

export async function getSession(uid: string, sessionId: string): Promise<SessionData | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'sessions', sessionId));
  return snap.exists() ? (snap.data() as SessionData) : null;
}

export async function updateSession(
  uid: string,
  sessionId: string,
  data: Partial<SessionData>
): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'sessions', sessionId), data);
}

export async function getAllSessions(uid: string): Promise<(SessionData & { id: string })[]> {
  const sessionsRef = collection(db, 'users', uid, 'sessions');
  const q = query(sessionsRef, orderBy('timestamp', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as SessionData) }));
}

export async function getActiveSessions(uid: string): Promise<(SessionData & { id: string })[]> {
  const sessionsRef = collection(db, 'users', uid, 'sessions');
  const q = query(sessionsRef, where('status', '==', 'active'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as SessionData) }));
}

// ─── Commitments ─────────────────────────────────────────────────

export async function createCommitment(uid: string, data: Partial<CommitmentData>): Promise<string> {
  const commitmentsRef = collection(db, 'users', uid, 'commitments');
  const docRef = await addDoc(commitmentsRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getCommitment(uid: string, commitmentId: string): Promise<CommitmentData | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'commitments', commitmentId));
  return snap.exists() ? (snap.data() as CommitmentData) : null;
}

export async function getAllCommitments(uid: string): Promise<(CommitmentData & { id: string })[]> {
  const commitmentsRef = collection(db, 'users', uid, 'commitments');
  const snap = await getDocs(commitmentsRef);
  const results = snap.docs.map((d) => ({ id: d.id, ...(d.data() as CommitmentData) }));
  results.sort((a, b) => {
    const aTime = a.createdAt?.seconds ?? 0;
    const bTime = b.createdAt?.seconds ?? 0;
    return bTime - aTime;
  });
  return results;
}

export async function updateCommitment(
  uid: string,
  commitmentId: string,
  data: Partial<CommitmentData>
): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'commitments', commitmentId), data);
}

export async function deleteCommitment(uid: string, commitmentId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'commitments', commitmentId));
}

/**
 * Check active commitments for overdue deadlines. Marks them failed and applies XP penalty.
 * Idempotent: only transitions active → failed.
 * Returns titles of newly-failed commitments for toast display.
 */
export async function failOverdueCommitments(
  uid: string,
  items: { id: string; unlockLevel: number }[]
): Promise<string[]> {
  const all = await getAllCommitments(uid);
  const now = Date.now();
  const failed: string[] = [];

  for (const c of all) {
    if (c.status !== 'active') continue;
    const deadlineMs = c.deadline?.toDate?.()
      ? c.deadline.toDate().getTime()
      : (c.deadline as unknown as { seconds: number })?.seconds
        ? (c.deadline as unknown as { seconds: number }).seconds * 1000
        : null;
    if (deadlineMs === null || deadlineMs > now) continue;

    await updateCommitment(uid, c.id, {
      status: 'failed',
      approved: false,
      aiFeedback: 'Deadline passed without proof submission.',
      completedAt: FirestoreTimestamp.fromMillis(now),
    });
    await applyXPChange(uid, c.xpPenalty, items);
    failed.push(c.title);
  }

  return failed;
}

/**
 * Check active sessions for expired timers. Marks them failed and applies XP penalty.
 * If multiple valid (non-expired) sessions exist, keeps only the most recent one.
 * Returns the still-valid session (if any) and list of failed sessions.
 */
export async function failExpiredSessions(
  uid: string,
  items: { id: string; unlockLevel: number }[]
): Promise<{
  failedSessions: (SessionData & { id: string })[];
  validSession: (SessionData & { id: string }) | null;
}> {
  const active = await getActiveSessions(uid);
  const now = Date.now();
  const failed: (SessionData & { id: string })[] = [];
  const valid: (SessionData & { id: string })[] = [];

  for (const s of active) {
    const startMs = s.timerStartedAt?.toDate?.()
      ? s.timerStartedAt.toDate().getTime()
      : (s.timerStartedAt as unknown as { seconds: number })?.seconds
        ? (s.timerStartedAt as unknown as { seconds: number }).seconds * 1000
        : null;

    const expired =
      startMs === null || now - startMs >= (s.timeEstimate + 60) * 1000;

    if (expired) {
      await updateSession(uid, s.id, {
        status: 'failed',
        timeActual: s.timeEstimate + 60,
      });
      await applyXPChange(uid, s.xpPenalty, items);
      failed.push(s);
    } else {
      valid.push(s);
    }
  }

  // If multiple valid sessions, keep only the most recent — fail the rest
  if (valid.length > 1) {
    valid.sort((a, b) => {
      const ta = a.timerStartedAt?.toDate?.()?.getTime() ?? 0;
      const tb = b.timerStartedAt?.toDate?.()?.getTime() ?? 0;
      return tb - ta;
    });
    for (let i = 1; i < valid.length; i++) {
      await updateSession(uid, valid[i].id, {
        status: 'failed',
        timeActual: valid[i].timeEstimate + 60,
      });
      await applyXPChange(uid, valid[i].xpPenalty, items);
      failed.push(valid[i]);
    }
  }

  return {
    failedSessions: failed,
    validSession: valid.length > 0 ? valid[0] : null,
  };
}

// ─── XP & Leveling ──────────────────────────────────────────────

export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500];

export function getLevelFromXP(xp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}

export function getXPForNextLevel(level: number): number {
  if (level >= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  return LEVEL_THRESHOLDS[level];
}

export function getXPProgress(xp: number, level: number): { current: number; needed: number; percentage: number } {
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const current = xp - currentThreshold;
  const needed = nextThreshold - currentThreshold;
  const percentage = Math.min((current / needed) * 100, 100);
  return { current, needed, percentage };
}

/**
 * Apply XP change to pet. Returns updated pet data + whether a level-up occurred + newly unlocked items.
 * XP floors at 0, levels never decrease.
 */
export async function applyXPChange(
  uid: string,
  xpChange: number,
  items: { id: string; unlockLevel: number }[]
): Promise<{ pet: PetData; leveledUp: boolean; newLevel: number; newUnlocks: string[] }> {
  const pet = await getPet(uid);
  if (!pet) throw new Error('Pet not found');

  // Apply XP with floor at 0
  const newXP = Math.max(0, pet.xp + xpChange);
  const oldLevel = pet.level;

  // Calculate new level (levels only go UP)
  const calculatedLevel = getLevelFromXP(newXP);
  const newLevel = Math.max(oldLevel, calculatedLevel);
  const leveledUp = newLevel > oldLevel;

  // Check for new unlocks
  const newUnlocks: string[] = [];
  const currentUnlocked = new Set(pet.unlockedItems);
  for (const item of items) {
    if (item.unlockLevel <= newLevel && !currentUnlocked.has(item.id)) {
      newUnlocks.push(item.id);
      currentUnlocked.add(item.id);
    }
  }

  const updatedPet: PetData = {
    ...pet,
    xp: newXP,
    level: newLevel,
    unlockedItems: Array.from(currentUnlocked),
  };

  await updatePet(uid, updatedPet);

  return { pet: updatedPet, leveledUp, newLevel, newUnlocks };
}

// ─── Settings Page Helpers ───────────────────────────────────────

/**
 * Delete all user data from Firestore (profile, pet, sessions, commitments).
 */
export async function deleteAccount(uid: string): Promise<void> {
  const batch = writeBatch(db);

  batch.delete(doc(db, 'users', uid, 'profile', 'main'));
  batch.delete(doc(db, 'users', uid, 'pet', 'main'));

  const sessionsRef = collection(db, 'users', uid, 'sessions');
  const sessionsSnap = await getDocs(sessionsRef);
  sessionsSnap.docs.forEach((d) => batch.delete(d.ref));

  const commitmentsRef = collection(db, 'users', uid, 'commitments');
  const commitmentsSnap = await getDocs(commitmentsRef);
  commitmentsSnap.docs.forEach((d) => batch.delete(d.ref));

  const startsRef = collection(db, 'users', uid, 'starts');
  const startsSnap = await getDocs(startsRef);
  startsSnap.docs.forEach((d) => batch.delete(d.ref));

  await batch.commit();
}

/**
 * Reset pet to level 1, 0 XP, default unlocked items. Keeps name and color.
 * Also sets onboardingComplete to false so user re-hatches.
 */
export async function resetPet(uid: string, defaultUnlockedItems: string[]): Promise<void> {
  const pet = await getPet(uid);
  if (!pet) throw new Error('Pet not found');

  await updatePet(uid, {
    level: 1,
    xp: 0,
    equippedHat: null,
    equippedClothes: null,
    unlockedItems: defaultUnlockedItems,
  });

  await updateUserProfile(uid, { onboardingComplete: false });
}

/**
 * Delete all session history while preserving profile and pet.
 */
export async function deleteAllSessions(uid: string): Promise<void> {
  const sessionsRef = collection(db, 'users', uid, 'sessions');
  const snap = await getDocs(sessionsRef);

  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

/**
 * Export all user data as a JSON-serializable object.
 */
export async function exportUserData(uid: string): Promise<{
  exportedAt: string;
  profile: UserProfile | null;
  pet: PetData | null;
  sessions: (SessionData & { id: string })[];
  commitments: (CommitmentData & { id: string })[];
  starts: (StartData & { id: string })[];
}> {
  const profile = await getUserProfile(uid);
  const pet = await getPet(uid);
  const sessions = await getAllSessions(uid);
  const commitments = await getAllCommitments(uid);
  const startsSnap = await getDocs(collection(db, 'users', uid, 'starts'));
  const starts = startsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as StartData) }));

  return {
    exportedAt: new Date().toISOString(),
    profile,
    pet,
    sessions,
    commitments,
    starts,
  };
}
