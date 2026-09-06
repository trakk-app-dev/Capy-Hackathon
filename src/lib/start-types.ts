// Pure types, constants, and helpers for the /start flow. No Firebase import —
// safe to use from API routes (server) and pages (client) alike.
import type { Timestamp } from 'firebase/firestore';

// ─── Constants ───────────────────────────────────────────────────

/** XP granted the first time a start's agreed step is supported. Never negative. */
export const START_XP = 15;
export const START_DEFAULT_MINUTES = 3;
export const START_MIN_MINUTES = 1;
export const START_MAX_MINUTES = 15;
/** Model calls (guidance + review) allowed per start. */
export const START_MAX_CALLS = 40;
/** Context images allowed per start; per message; proof images per submission. */
export const START_MAX_CONTEXT_IMAGES = 4;
export const START_MAX_IMAGES_PER_TURN = 2;
export const START_MAX_PROOF_IMAGES = 2;
/** Trace entries kept on the document. */
export const START_MAX_TRACE = 20;
/** Aggregate conversation text kept on one Firestore doc (1 MiB cap). */
export const START_MAX_CONVERSATION_CHARS = 60_000;
/** Recent messages sent to the model; older turns are carried by contextSummary. */
export const START_MODEL_WINDOW = 12;
/** Active starts older than this are treated as abandoned. */
export const START_STALE_MS = 7 * 24 * 60 * 60 * 1000;
/** sessionStorage key for the typed work draft: JSON { startId, text }. */
export const START_DRAFT_KEY = 'capy_start_draft';

export type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
export const START_IMAGE_TYPES: ImageMediaType[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// ─── Types ───────────────────────────────────────────────────────

export type StartPhase = 'conversation' | 'proposal' | 'working' | 'result';

export interface StartMessage {
  role: 'user' | 'assistant';
  text: string;
  imageUrls?: string[];
}

export interface FirstAction {
  title: string;
  action: string;
  where: string;
  enough: string;
  evidenceInstructions: string;
  minutes: number;
}

export type StartReviewStatus = 'supported' | 'not_yet_supported' | 'unable_to_assess';

export interface StartReview {
  status: StartReviewStatus;
  observation: string;
  quote: string;
  next: string;
}

export interface StartTrace {
  operation: 'guidance' | 'review';
  promptVersion: string;
  model: string;
  milliseconds: number;
  inputTokens: number;
  outputTokens: number;
  at: number;
}

export interface StartAgreement extends FirstAction {
  version: number;
  acceptedAt: number;
}

export interface StartData {
  status: 'active' | 'done';
  phase: StartPhase;
  /** The first thing the user said — used as the display title. */
  taskInput: string;
  messages: StartMessage[];
  contextSummary: string;
  contextImageUrls: string[];
  options: string[];
  proposal: FirstAction | null;
  agreement: StartAgreement | null;
  /** Epoch ms when the agreed check-in window ends. */
  deadlineAt: number | null;
  proofText: string;
  proofImageUrls: string[];
  review: StartReview | null;
  reviewCount: number;
  /** Epoch ms of the latest review; equals the `at` of its trace entry when the model ran. */
  reviewedAt: number | null;
  calls: number;
  xpAwarded: number;
  trace: StartTrace[];
  /** Optimistic-concurrency counter; every write checks and increments it. */
  version: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Everything the page writes. `status`, `version`, and timestamps are managed
 * by start.ts so a page patch can never reactivate a closed start.
 */
export type StartPatch = Omit<StartData, 'status' | 'version' | 'createdAt' | 'updatedAt'>;

/** Wire shapes returned by the two /api/start routes. */
export interface GuideResponse {
  kind: 'ask' | 'propose';
  message: string;
  contextSummary: string;
  options: string[];
  proposal: FirstAction | null;
  trace: Omit<StartTrace, 'at' | 'operation'> | null;
}

export interface ReviewResponse extends StartReview {
  trace: Omit<StartTrace, 'at' | 'operation'> | null;
}

// ─── Helpers ─────────────────────────────────────────────────────

export function newStartData(): StartData {
  return {
    status: 'active',
    phase: 'conversation',
    taskInput: '',
    messages: [],
    contextSummary: '',
    contextImageUrls: [],
    options: [],
    proposal: null,
    agreement: null,
    deadlineAt: null,
    proofText: '',
    proofImageUrls: [],
    review: null,
    reviewCount: 0,
    reviewedAt: null,
    calls: 0,
    xpAwarded: 0,
    trace: [],
    version: 0,
  };
}

export function toPatch(data: StartData): StartPatch {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { status, version, createdAt, updatedAt, ...patch } = data;
  return patch;
}

export function appendTrace(trace: StartTrace[], entry: StartTrace): StartTrace[] {
  return [...trace, entry].slice(-START_MAX_TRACE);
}

export function conversationChars(messages: StartMessage[]): number {
  return messages.reduce((n, m) => n + m.text.length, 0);
}

export function formatCheckIn(remainingSeconds: number): string {
  const s = Math.max(0, remainingSeconds);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
