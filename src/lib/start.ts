// Firestore CRUD for the /start flow — users/{uid}/starts/{id}.
// Types and constants live in ./start-types (no Firebase import) so API
// routes can share them without pulling the client Firebase SDK server-side.
import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  runTransaction,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { getLevelFromXP, type PetData } from './db';
import { START_STALE_MS, type StartData, type StartPatch } from './start-types';

export * from './start-types';

/** Thrown when another tab has written or closed this start since we last read it. */
export class StaleStartError extends Error {
  constructor() {
    super('STALE_START');
    this.name = 'StaleStartError';
  }
}

export async function createStart(uid: string, data: StartPatch): Promise<{ id: string; version: number }> {
  const version = 1;
  const ref = await addDoc(collection(db, 'users', uid, 'starts'), {
    ...data,
    status: 'active',
    version,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: ref.id, version };
}

export async function getStart(uid: string, startId: string): Promise<StartData | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'starts', startId));
  return snap.exists() ? (snap.data() as StartData) : null;
}

/**
 * Version-checked write. Rejects with StaleStartError if the stored version
 * differs from `expectedVersion` or the start is no longer active, so a stale
 * tab can neither clobber a newer agreement nor reopen a closed start.
 * Returns the new version.
 */
export async function updateStart(
  uid: string,
  startId: string,
  expectedVersion: number,
  patch: Partial<StartPatch>
): Promise<number> {
  const ref = doc(db, 'users', uid, 'starts', startId);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new StaleStartError();
    const current = snap.data() as StartData;
    if (current.version !== expectedVersion || current.status !== 'active') throw new StaleStartError();
    const version = expectedVersion + 1;
    tx.update(ref, { ...patch, version, updatedAt: serverTimestamp() });
    return version;
  });
}

export interface ReviewCommit {
  version: number;
  awarded: number;
  pet: PetData | null;
  leveledUp: boolean;
  newLevel: number;
}

/**
 * Persist a review result and, when `award` is given and this start has not
 * paid out yet, grant the pet XP in the same transaction. Uses the same
 * floor-at-zero / levels-never-drop / unlock rules as applyXPChange, but
 * atomically, so a retry or a second tab cannot double-award.
 */
export async function commitStartReview(
  uid: string,
  startId: string,
  expectedVersion: number,
  patch: Partial<StartPatch>,
  award: { xp: number; items: { id: string; unlockLevel: number }[] } | null
): Promise<ReviewCommit> {
  const startRef = doc(db, 'users', uid, 'starts', startId);
  const petRef = doc(db, 'users', uid, 'pet', 'main');
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(startRef);
    if (!snap.exists()) throw new StaleStartError();
    const current = snap.data() as StartData;
    if (current.version !== expectedVersion || current.status !== 'active') throw new StaleStartError();

    let result: Omit<ReviewCommit, 'version'> = { awarded: 0, pet: null, leveledUp: false, newLevel: 0 };
    let xpAwarded = current.xpAwarded;

    if (award && current.xpAwarded === 0 && award.xp > 0) {
      const petSnap = await tx.get(petRef);
      if (petSnap.exists()) {
        const pet = petSnap.data() as PetData;
        const newXP = Math.max(0, pet.xp + award.xp);
        const newLevel = Math.max(pet.level, getLevelFromXP(newXP));
        const unlocked = new Set(pet.unlockedItems);
        for (const item of award.items) {
          if (item.unlockLevel <= newLevel) unlocked.add(item.id);
        }
        const updatedPet: PetData = { ...pet, xp: newXP, level: newLevel, unlockedItems: Array.from(unlocked) };
        tx.update(petRef, { ...updatedPet });
        xpAwarded = award.xp;
        result = { awarded: award.xp, pet: updatedPet, leveledUp: newLevel > pet.level, newLevel };
      }
    }

    const version = expectedVersion + 1;
    tx.update(startRef, { ...patch, xpAwarded, version, updatedAt: serverTimestamp() });
    return { ...result, version };
  });
}

/**
 * The most recently updated active start that is not stale, if any. Every
 * other active start (duplicates from other tabs, abandoned ones older than
 * START_STALE_MS) is closed — with a version bump, so any tab still holding
 * it gets a StaleStartError on its next write.
 */
export async function getActiveStart(uid: string): Promise<(StartData & { id: string }) | null> {
  const q = query(collection(db, 'users', uid, 'starts'), where('status', '==', 'active'));
  const snap = await getDocs(q);
  const active = snap.docs.map((d) => ({ id: d.id, ...(d.data() as StartData) }));
  if (active.length === 0) return null;

  const now = Date.now();
  const millis = (s: StartData) => (s.updatedAt?.seconds ?? 0) * 1000;
  active.sort((a, b) => millis(b) - millis(a));
  const latest = active[0];
  const fresh = millis(latest) === 0 || now - millis(latest) < START_STALE_MS;
  const toClose = fresh ? active.slice(1) : active;

  if (toClose.length > 0) {
    const batch = writeBatch(db);
    toClose.forEach((s) =>
      batch.update(doc(db, 'users', uid, 'starts', s.id), { status: 'done', version: increment(1), updatedAt: serverTimestamp() })
    );
    await batch.commit();
  }
  return fresh ? latest : null;
}

/** Close a start. Bumps the version so stale tabs cannot reactivate it. Missing docs are ignored. */
export async function markStartDone(uid: string, startId: string): Promise<void> {
  const ref = doc(db, 'users', uid, 'starts', startId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const current = snap.data() as StartData;
    if (current.status === 'done') return;
    tx.update(ref, { status: 'done', version: current.version + 1, updatedAt: serverTimestamp() });
  });
}

export async function getAllStarts(uid: string): Promise<(StartData & { id: string })[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'starts'));
  const results = snap.docs.map((d) => ({ id: d.id, ...(d.data() as StartData) }));
  results.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
  return results;
}
