'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, MotionConfig, useReducedMotion, type Variants } from 'motion/react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { ArrowUp, ArrowRight, Paperclip, Check, Clock3, Plus, X, RotateCcw, Eye } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from '@/lib/auth';
import { getUserProfile, getPet, type PetData } from '@/lib/db';
import { uploadMultipleImages } from '@/lib/storage';
import { ALL_ITEMS } from '@/lib/items';
import { playSound } from '@/lib/sounds';
import CapyPet, { type PetExpression } from '@/components/CapyPet';
import {
  ConsiderationStage,
  ConsiderationBubble,
  CONSIDER_EASE_OUT,
  CONSIDER_EASE_IN_OUT,
  type ConsiderationEcho,
  type ConsiderationReference,
} from '@/components/StartConsideration';
import { considerFloor, sleep, CONSIDER_CELEBRATE_DELAY_MS, CONSIDER_NOTICE_MS, type ConsiderKind, type ConsiderTier } from '@/lib/start-timing';
import {
  createStart,
  getStart,
  getActiveStart,
  updateStart,
  commitStartReview,
  markStartDone,
  StaleStartError,
  newStartData,
  toPatch,
  appendTrace,
  conversationChars,
  formatCheckIn,
  START_XP,
  START_MAX_CALLS,
  START_MAX_CONTEXT_IMAGES,
  START_MAX_IMAGES_PER_TURN,
  START_MAX_PROOF_IMAGES,
  START_MAX_CONVERSATION_CHARS,
  START_MIN_MINUTES,
  START_MAX_MINUTES,
  START_DEFAULT_MINUTES,
  START_DRAFT_KEY,
  type StartData,
  type StartMessage,
  type FirstAction,
  type GuideResponse,
  type ReviewResponse,
} from '@/lib/start';

type Busy = 'guide' | 'review' | 'save' | null;

/** A model call in flight, with everything the consideration transition needs captured at submit. */
type Consider = {
  tier: ConsiderTier;
  kind: ConsiderKind;
  startedAt: number;
  /** start.messages.length at submit; the LIGHT optimistic bubbles render only while it still holds. */
  baseline: number;
  first: boolean;
  withImages: boolean;
  fromProposal: boolean;
  echo: ConsiderationEcho;
  reference: ConsiderationReference;
  minHeight: number;
};
/** Which outcome the mounting view is arriving from; drives its staged enter. */
type Arrival = 'ask' | 'propose' | 'result' | null;
type ShownMessage = StartMessage & { i: number; pending?: boolean };

const BODY = { fontFamily: 'var(--font-body)', fontStyle: 'normal' } as const;
const GENERIC_ERROR = 'That didn’t go through. Your work is still here. Please try again.';
const TIMEOUT_ERROR = 'That took too long to come back. Your message is still here — send it again.';
const LIMIT_ERROR = 'This start has used up its turns. Start something else to keep going.';
const LONG_ERROR = 'This conversation is getting long. Start something else to keep going.';
const STALE_ERROR = 'This start changed in another tab. Showing the latest step.';
const IMAGE_ACCEPT = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
};

function stripAgreement(a: FirstAction & { version?: number; acceptedAt?: number }): FirstAction {
  return {
    title: a.title,
    action: a.action,
    where: a.where,
    enough: a.enough,
    evidenceInstructions: a.evidenceInstructions,
    minutes: a.minutes,
  };
}

/**
 * True when the most recent check actually ran the model. A review that
 * short-circuited (no work, unreadable photo, no key) appends no trace entry,
 * so a review trace can only be current if it was added by the latest review.
 */
function usedModelForLastReview(s: StartData): boolean {
  const last = s.trace[s.trace.length - 1];
  return Boolean(last && last.operation === 'review' && s.reviewedAt !== null && last.at === s.reviewedAt);
}

function readDraft(startId: string): string | null {
  try {
    const raw = sessionStorage.getItem(START_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { startId?: string; text?: string };
    return parsed.startId === startId && typeof parsed.text === 'string' ? parsed.text : null;
  } catch {
    return null;
  }
}

function writeDraft(startId: string, text: string) {
  try {
    sessionStorage.setItem(START_DRAFT_KEY, JSON.stringify({ startId, text }));
  } catch {
    /* storage full — the text stays in the textarea */
  }
}

function clearDraft() {
  try {
    sessionStorage.removeItem(START_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

async function jsonHeaders(): Promise<Record<string, string>> {
  const token = await auth.currentUser?.getIdToken();
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

/** A platform timeout returns a non-JSON body; never surface that raw text. */
async function readJson<T>(res: Response): Promise<T & { error?: string }> {
  try {
    return (await res.json()) as T & { error?: string };
  } catch {
    throw new Error(GENERIC_ERROR);
  }
}

function rejectionMessage(rejections: FileRejection[], perTurn: number): string {
  const tooMany = rejections.some((r) => r.errors.some((e) => e.code === 'too-many-files'));
  return tooMany ? `You can add up to ${perTurn} images at a time.` : 'Choose a PNG, JPEG, WebP, or GIF under 10 MB.';
}

// ─── Small pieces ────────────────────────────────────────────────

function Thumbs({ files, onRemove, label }: { files: File[]; onRemove: (i: number) => void; label: string }) {
  if (files.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {files.map((file, i) => (
        <div key={`${file.name}-${i}`} className="relative group w-14 h-14 rounded-lg overflow-hidden bg-near-black/5">
          <img src={URL.createObjectURL(file)} alt={`${label} ${i + 1}: ${file.name}`} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onRemove(i)}
            aria-label={`Remove ${file.name}`}
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity flex items-center justify-center text-white"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function isAbort(e: unknown): boolean {
  return e instanceof DOMException && e.name === 'AbortError';
}

// ─── Consideration transition variants ───────────────────────────
// Phase views leave toward the companion on a FULL departure (AnimatePresence
// `custom` carries the axis); saves keep today's plain fade.
const deckVariants: Variants = {
  exit: (c: { toward?: boolean; axis?: 'x' | 'y' } | undefined) =>
    c?.toward
      ? c.axis === 'y'
        ? { y: -12, opacity: 0, scale: 0.985, transition: { duration: 0.4, ease: CONSIDER_EASE_IN_OUT } }
        : { x: -24, opacity: 0, scale: 0.985, transition: { duration: 0.4, ease: CONSIDER_EASE_IN_OUT } }
      : { opacity: 0 },
};
/** Rows inside the proposal card, staggered by the article on a `propose` return. */
const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: CONSIDER_EASE_OUT } },
};
const chip: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: CONSIDER_EASE_OUT } },
};

function ConfirmNewStart({ open, busy, onConfirm, onCancel }: { open: boolean; busy: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/25 z-[200] flex items-center justify-center px-6"
          onClick={onCancel}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="start-new-title"
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="glass-strong rounded-2xl p-6 w-full max-w-sm"
            style={{ boxShadow: 'var(--shadow-xl)' }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onCancel();
            }}
          >
            <h3 id="start-new-title" className="text-lg text-near-black mb-2">Start a different task?</h3>
            <p className="text-sm text-near-black/60 leading-relaxed mb-4" style={BODY}>
              Copy anything you want to keep first. This task will leave the view, but your history stays saved.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                autoFocus
                className="flex-1 py-2.5 rounded-xl text-sm text-near-black/60 hover:bg-near-black/5 transition-colors"
                style={BODY}
              >
                Stay here
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={busy}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-coral hover:bg-coral/90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                style={BODY}
              >
                Start a new task <RotateCcw size={14} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Page ────────────────────────────────────────────────────────

export default function StartPage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [pet, setPet] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const [start, setStart] = useState<StartData>(() => newStartData());
  const [startId, setStartId] = useState<string | null>(null);
  const [pendingPrefill, setPendingPrefill] = useState('');

  const [input, setInput] = useState('');
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [proof, setProof] = useState('');
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [minutes, setMinutes] = useState(START_DEFAULT_MINUTES);

  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState('');
  const [now, setNow] = useState(0);
  const [celebrate, setCelebrate] = useState<{ xp: number; leveledUp: boolean; newLevel: number } | null>(null);
  const [confirmNew, setConfirmNew] = useState(false);

  /** Set while a model call runs its consideration transition (never for saves). */
  const [consider, setConsider] = useState<Consider | null>(null);
  /** How the stage leaves: `settle` hands over to an answer, `fade` on error or stop. */
  const [ending, setEnding] = useState<'settle' | 'fade'>('settle');
  const [arrival, setArrival] = useState<Arrival>(null);
  const [notice, setNotice] = useState('');
  const [retryAction, setRetryAction] = useState<ConsiderKind | null>(null);
  /** The last check-in's "next" line, carried into the working view (local only). */
  const [lastNext, setLastNext] = useState('');

  const [prefReduced, setPrefReduced] = useState(false);
  const systemReduced = useReducedMotion();
  const reduced = prefReduced || Boolean(systemReduced);

  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const workRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const celebrateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const levelUpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Which element to focus once the next phase view (or the stage) has actually mounted. */
  const focusTarget = useRef<'work' | 'composer' | 'proposal' | 'result' | 'stage' | 'retry' | null>(null);
  /** The control that opened the confirm dialog, so focus can return to it. */
  const openerRef = useRef<HTMLElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  /** Wraps the phase AnimatePresence; measured so the stage can hold the departing view's height. */
  const deckRef = useRef<HTMLDivElement | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** LIGHT tier: the composer never unmounts, so focus it once `busy` clears instead of via attachComposer. */
  const lightFocus = useRef(false);

  // Phase views mount only after AnimatePresence finishes the exit animation,
  // so focus is requested from the mounting element rather than a timer.
  const attachWork = useCallback((el: HTMLTextAreaElement | null) => {
    workRef.current = el;
    if (el && focusTarget.current === 'work') {
      focusTarget.current = null;
      el.focus({ preventScroll: true });
    }
  }, []);
  const attachComposer = useCallback((el: HTMLTextAreaElement | null) => {
    composerRef.current = el;
    if (el && focusTarget.current === 'composer') {
      focusTarget.current = null;
      el.focus({ preventScroll: true });
    }
  }, []);
  const attachProposal = useCallback((el: HTMLElement | null) => {
    if (el && focusTarget.current === 'proposal') {
      focusTarget.current = null;
      el.focus({ preventScroll: true });
    }
  }, []);
  const attachResult = useCallback((el: HTMLHeadingElement | null) => {
    if (el && focusTarget.current === 'result') {
      focusTarget.current = null;
      el.focus({ preventScroll: true });
    }
  }, []);
  const attachStage = useCallback((el: HTMLDivElement | null) => {
    if (el && focusTarget.current === 'stage') {
      focusTarget.current = null;
      el.focus({ preventScroll: true });
    }
  }, []);
  const attachRetry = useCallback((el: HTMLButtonElement | null) => {
    if (el && focusTarget.current === 'retry') {
      focusTarget.current = null;
      el.focus({ preventScroll: true });
    }
  }, []);

  const cancelCelebration = useCallback(() => {
    if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
    if (levelUpTimer.current) clearTimeout(levelUpTimer.current);
    celebrateTimer.current = null;
    levelUpTimer.current = null;
    setCelebrate(null);
  }, []);

  const started = start.messages.length > 0;
  const phase = start.phase;
  const agreement = start.agreement;
  const remaining = start.deadlineAt && now ? Math.max(0, Math.ceil((start.deadlineAt - now) / 1000)) : 0;
  const expired = Boolean(start.deadlineAt) && now > 0 && remaining === 0;
  const lastCapy = [...start.messages].reverse().find((m) => m.role === 'assistant');
  const tooLong = conversationChars(start.messages) > START_MAX_CONVERSATION_CHARS;

  // ── Load: auth, profile, pet, active start, prefill, prefs ─────
  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 1023px)').matches);
    try {
      const raw = localStorage.getItem('capy_preferences');
      if (raw) setPrefReduced(Boolean(JSON.parse(raw).reduceAnimations));
    } catch {
      /* preferences are optional */
    }

    const unsub = onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/signup');
        return;
      }
      setUid(user.uid);
      try {
        const [prof, petData, active] = await Promise.all([
          getUserProfile(user.uid),
          getPet(user.uid),
          getActiveStart(user.uid),
        ]);
        if (!prof?.onboardingComplete) {
          router.push('/onboarding');
          return;
        }
        setPet(petData);

        const prefill = sessionStorage.getItem('capy_start_prefill') ?? '';

        if (active) {
          const { id, ...data } = active;
          setStartId(id);
          setStart(data);
          if (data.proposal) setMinutes(data.proposal.minutes);
          setProof(readDraft(id) ?? data.proofText);
          // A title typed elsewhere stays in sessionStorage until
          // "Start something else" consumes it.
          setPendingPrefill(prefill);
        } else {
          setInput(prefill);
          if (prefill) sessionStorage.removeItem('capy_start_prefill');
        }
      } catch (err) {
        console.error('Failed to load start:', err);
        setError('Capy couldn’t load your last start. Refresh to try again.');
      } finally {
        setLoading(false);
      }
    });
    return () => {
      unsub();
      if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
      if (levelUpTimer.current) clearTimeout(levelUpTimer.current);
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, [router]);

  // ── Check-in tick ──────────────────────────────────────────────
  useEffect(() => {
    if (!start.deadlineAt || phase !== 'working') return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [start.deadlineAt, phase]);

  // ── Draft autosave (this tab only; the doc keeps the last submitted text) ──
  useEffect(() => {
    if (!startId) return;
    writeDraft(startId, proof);
  }, [proof, startId]);

  // ── Keep the newest message in view while talking ──────────────
  useEffect(() => {
    // `consider` also brings the LIGHT tier's optimistic and pending bubbles into view.
    if (phase === 'conversation' && (started || consider)) {
      messagesEndRef.current?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'nearest' });
    }
  }, [start.messages.length, phase, started, reduced, consider]);

  // ── LIGHT tier: the composer stayed mounted, so refocus it once it is enabled again ──
  useEffect(() => {
    if (busy || !lightFocus.current) return;
    lightFocus.current = false;
    composerRef.current?.focus({ preventScroll: true });
  }, [busy]);

  // ── Persistence: version-checked write-through ─────────────────
  const persist = useCallback(
    async (next: StartData): Promise<string> => {
      if (!uid) throw new Error(GENERIC_ERROR);
      if (startId) {
        const version = await updateStart(uid, startId, start.version, toPatch(next));
        setStart({ ...next, version });
        return startId;
      }
      const created = await createStart(uid, toPatch(next));
      setStartId(created.id);
      setStart({ ...next, version: created.version });
      return created.id;
    },
    [uid, startId, start.version]
  );

  /** Another tab moved this start on: show its state instead of ours. */
  const recoverStale = useCallback(async () => {
    if (!uid || !startId) return;
    try {
      const latest = await getStart(uid, startId);
      if (latest) {
        setStart(latest);
        if (latest.proposal) setMinutes(latest.proposal.minutes);
        setProof(readDraft(startId) ?? latest.proofText);
      }
    } catch (err) {
      console.error('Failed to reload start:', err);
    }
    setError(STALE_ERROR);
  }, [uid, startId]);

  const fail = useCallback(
    async (e: unknown) => {
      if (e instanceof StaleStartError) {
        await recoverStale();
        return;
      }
      setError(e instanceof Error ? e.message : GENERIC_ERROR);
    },
    [recoverStale]
  );

  // ── Dropzones ──────────────────────────────────────────────────
  const onDropContext = useCallback((files: File[]) => {
    setContextFiles((prev) => [...prev, ...files].slice(0, START_MAX_IMAGES_PER_TURN));
    setError('');
  }, []);
  const contextZone = useDropzone({
    onDrop: onDropContext,
    onDropRejected: (rejections) => setError(rejectionMessage(rejections, START_MAX_IMAGES_PER_TURN)),
    accept: IMAGE_ACCEPT,
    maxFiles: START_MAX_IMAGES_PER_TURN,
    maxSize: 10 * 1024 * 1024,
    noClick: true,
    noKeyboard: true,
  });
  const onDropProof = useCallback((files: File[]) => {
    setProofFiles((prev) => [...prev, ...files].slice(0, START_MAX_PROOF_IMAGES));
    setError('');
  }, []);
  const proofZone = useDropzone({
    onDrop: onDropProof,
    onDropRejected: (rejections) => setError(rejectionMessage(rejections, START_MAX_PROOF_IMAGES)),
    accept: IMAGE_ACCEPT,
    maxFiles: START_MAX_PROOF_IMAGES,
    maxSize: 10 * 1024 * 1024,
    noClick: true,
    noKeyboard: true,
  });

  // ── Consideration transition helpers ───────────────────────────
  /** Stagger delay in seconds; 0 under reduced motion. */
  const d = (ms: number) => (reduced ? 0 : ms / 1000);
  const showNotice = (text: string) => {
    setNotice(text);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(''), CONSIDER_NOTICE_MS);
  };
  /** The stage takes the departing view's height so the frame does not jump. */
  const measureDeck = () => {
    const h = deckRef.current?.offsetHeight ?? 0;
    const floor = isMobile ? Math.round(window.innerHeight * 0.52) : 280;
    return Math.min(560, Math.max(floor, h));
  };
  const cancelConsider = () => abortRef.current?.abort();
  /** FULL tier: focus the stage on mount and bring the section back into view if it scrolled off. */
  const beginFullDeparture = () => {
    focusTarget.current = 'stage';
    const top = sectionRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) sectionRef.current?.scrollIntoView({ block: 'start', behavior: reduced ? 'instant' : 'smooth' });
  };

  // ── Actions ────────────────────────────────────────────────────
  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if ((!trimmed && contextFiles.length === 0) || busy || !uid) return;
    if (start.calls >= START_MAX_CALLS) {
      setError(LIMIT_ERROR);
      return;
    }
    if (tooLong) {
      setError(LONG_ERROR);
      return;
    }
    if (start.contextImageUrls.length + contextFiles.length > START_MAX_CONTEXT_IMAGES) {
      setError(`This start already has ${START_MAX_CONTEXT_IMAGES} images of instructions. Start something else to use different materials.`);
      return;
    }
    const startedAt = Date.now();
    const first = start.messages.length === 0;
    const withImages = contextFiles.length > 0;
    const fromProposal = phase === 'proposal';
    // Departure tier is decided by what the user did; the return is staged by what comes back.
    const tier: ConsiderTier = first || withImages || fromProposal ? 'full' : 'light';
    const urls = contextFiles.map((f) => URL.createObjectURL(f));
    setArrival(null);
    setEnding('settle');
    setRetryAction(null);
    setNotice('');
    setConsider({
      tier,
      kind: 'guide',
      startedAt,
      baseline: start.messages.length,
      first,
      withImages,
      fromProposal,
      echo: { label: trimmed ? 'You said' : 'You sent', text: trimmed, urls },
      reference:
        fromProposal && start.proposal
          ? { label: 'The step we’re changing', value: start.proposal.title, serif: true }
          : first
            ? { label: 'Finding a start', value: '', serif: false }
            : { label: 'Working on', value: start.taskInput, serif: false },
      minHeight: measureDeck(),
    });
    if (tier === 'full') beginFullDeparture();
    setBusy('guide');
    setError('');
    try {
      const imageUrls = contextFiles.length > 0 ? await uploadMultipleImages(uid, contextFiles, 'context') : [];
      const userMessage: StartMessage = imageUrls.length
        ? { role: 'user', text: trimmed || 'Here are the task instructions.', imageUrls }
        : { role: 'user', text: trimmed };
      const messages = [...start.messages, userMessage];
      const contextImageUrls = [...start.contextImageUrls, ...imageUrls];

      const controller = new AbortController();
      abortRef.current = controller;
      const res = await fetch('/api/start/guide', {
        method: 'POST',
        headers: await jsonHeaders(),
        body: JSON.stringify({
          messages,
          contextSummary: start.contextSummary,
          contextImageUrls,
          currentProposal: start.proposal,
        }),
        signal: controller.signal,
      });
      // A Stop pressed from here on is a no-op: there is nothing left to abort.
      abortRef.current = null;
      if (res.status === 504) throw new Error(TIMEOUT_ERROR);
      const data = await readJson<GuideResponse>(res);
      if (!res.ok || data.error) throw new Error(data.error || GENERIC_ERROR);

      // Persist during the dwell; the frame fills in as Capy learns the task.
      await persist({
        ...start,
        taskInput: start.taskInput || trimmed || 'Task instructions',
        messages: [...messages, { role: 'assistant', text: data.message }],
        contextSummary: data.contextSummary || start.contextSummary,
        contextImageUrls,
        options: data.kind === 'ask' ? data.options : [],
        proposal: data.proposal,
        phase: data.proposal ? 'proposal' : 'conversation',
        calls: start.calls + 1,
        trace: data.trace ? appendTrace(start.trace, { operation: 'guidance', ...data.trace, at: Date.now() }) : start.trace,
      });
      if (data.proposal) setMinutes(data.proposal.minutes);
      await sleep(considerFloor(tier, reduced) - (Date.now() - startedAt));
      setArrival(data.proposal ? 'propose' : 'ask');
      if (data.proposal) focusTarget.current = 'proposal';
      else if (tier === 'light') lightFocus.current = true;
      else focusTarget.current = 'composer';
      // The stage's exit is the settle; the view returns from the companion's side.
      setConsider(null);
      setInput('');
      setContextFiles([]);
    } catch (e) {
      setEnding('fade');
      setConsider(null);
      if (isAbort(e)) {
        // Their words and files are untouched; this is a choice, not a failure.
        if (tier === 'light') lightFocus.current = true;
        else focusTarget.current = 'composer';
        showNotice('Stopped. Your message is still here — send it whenever you’re ready.');
        return;
      }
      if (e instanceof StaleStartError) {
        focusTarget.current = 'composer';
      } else {
        setRetryAction('guide');
        focusTarget.current = 'retry';
      }
      await fail(e);
    } finally {
      setBusy(null);
      abortRef.current = null;
    }
  };

  const accept = async () => {
    if (!start.proposal || busy) return;
    const m = Math.min(START_MAX_MINUTES, Math.max(START_MIN_MINUTES, minutes));
    setArrival(null);
    setRetryAction(null);
    setNotice('');
    setBusy('save');
    setError('');
    try {
      const acceptedAt = Date.now();
      await persist({
        ...start,
        agreement: { ...start.proposal, minutes: m, version: (start.agreement?.version ?? 0) + 1, acceptedAt },
        deadlineAt: acceptedAt + m * 60_000,
        phase: 'working',
        review: null,
        proofImageUrls: [],
        options: [],
      });
      playSound('session-start');
      focusTarget.current = 'work';
    } catch (e) {
      await fail(e);
    } finally {
      setBusy(null);
    }
  };

  const revise = async () => {
    if (busy) return;
    setArrival(null);
    setRetryAction(null);
    setNotice('');
    setLastNext('');
    setBusy('save');
    setError('');
    try {
      cancelCelebration();
      const proposal = start.agreement ? stripAgreement(start.agreement) : start.proposal;
      await persist({ ...start, phase: 'proposal', proposal, deadlineAt: null, review: null });
      if (proposal) setMinutes(proposal.minutes);
    } catch (e) {
      await fail(e);
    } finally {
      setBusy(null);
    }
  };

  const review = async () => {
    if (!uid || !startId || !agreement || busy) return;
    const text = proof.trim();
    if (!text && proofFiles.length === 0) {
      setError('Show me the part you worked on — type it in, or add a photo of your work.');
      workRef.current?.focus();
      return;
    }
    if (start.calls >= START_MAX_CALLS) {
      setError(LIMIT_ERROR);
      return;
    }
    const startedAt = Date.now();
    const urls = proofFiles.map((f) => URL.createObjectURL(f));
    setArrival(null);
    setEnding('settle');
    setRetryAction(null);
    setNotice('');
    setLastNext('');
    setConsider({
      tier: 'full',
      kind: 'review',
      startedAt,
      baseline: start.messages.length,
      first: false,
      withImages: proofFiles.length > 0,
      fromProposal: false,
      echo: { label: 'Your work', text, urls },
      reference: { label: 'The step we agreed', value: agreement.title, serif: true },
      minHeight: measureDeck(),
    });
    beginFullDeparture();
    setBusy('review');
    setError('');
    cancelCelebration();
    try {
      const proofImageUrls = proofFiles.length > 0 ? await uploadMultipleImages(uid, proofFiles, 'proof') : [];
      const controller = new AbortController();
      abortRef.current = controller;
      const res = await fetch('/api/start/review', {
        method: 'POST',
        headers: await jsonHeaders(),
        body: JSON.stringify({
          agreement: stripAgreement(agreement),
          contextSummary: start.contextSummary,
          messages: start.messages,
          contextImageUrls: start.contextImageUrls,
          proofText: text,
          proofImageUrls,
        }),
        signal: controller.signal,
      });
      abortRef.current = null;
      if (res.status === 504) throw new Error(TIMEOUT_ERROR);
      const data = await readJson<ReviewResponse>(res);
      if (!res.ok || data.error) throw new Error(data.error || GENERIC_ERROR);

      const usedModel = Boolean(data.trace && data.trace.model !== 'none');
      const reviewedAt = Date.now();
      const next: StartData = {
        ...start,
        phase: 'result',
        proofText: text,
        proofImageUrls,
        review: { status: data.status, observation: data.observation, quote: data.quote, next: data.next },
        reviewCount: start.reviewCount + 1,
        reviewedAt,
        calls: usedModel ? start.calls + 1 : start.calls,
        trace: data.trace && usedModel ? appendTrace(start.trace, { operation: 'review', ...data.trace, at: reviewedAt }) : start.trace,
      };

      // One transaction: persist the result and, on the first supported
      // review of this start, pay the pet — so a retry cannot double-award.
      const commit = await commitStartReview(
        uid,
        startId,
        start.version,
        toPatch(next),
        data.status === 'supported' ? { xp: START_XP, items: ALL_ITEMS } : null
      );
      setStart({ ...next, xpAwarded: commit.awarded > 0 ? commit.awarded : start.xpAwarded, version: commit.version });
      setProofFiles([]);
      clearDraft();
      await sleep(considerFloor('full', reduced) - (Date.now() - startedAt));
      setArrival('result');
      focusTarget.current = 'result';
      setConsider(null);

      // Measured from release: the observation and the quote land first; the celebration follows.
      if (commit.awarded > 0) {
        if (commit.pet) setPet(commit.pet);
        celebrateTimer.current = setTimeout(() => {
          celebrateTimer.current = null;
          setCelebrate({ xp: commit.awarded, leveledUp: commit.leveledUp, newLevel: commit.newLevel });
          playSound('approved');
          if (commit.leveledUp) {
            levelUpTimer.current = setTimeout(() => {
              levelUpTimer.current = null;
              playSound('level-up');
            }, 700);
          }
        }, CONSIDER_CELEBRATE_DELAY_MS);
      }
    } catch (e) {
      setEnding('fade');
      setConsider(null);
      if (isAbort(e)) {
        focusTarget.current = 'work';
        showNotice('Stopped. Your work is still here — check it whenever you’re ready.');
        return;
      }
      if (e instanceof StaleStartError) {
        focusTarget.current = 'work';
      } else {
        setRetryAction('review');
        focusTarget.current = 'retry';
      }
      await fail(e);
    } finally {
      setBusy(null);
      abortRef.current = null;
    }
  };

  const backToWork = async () => {
    if (!agreement || busy) return;
    setArrival(null);
    setRetryAction(null);
    setNotice('');
    setLastNext(start.review?.next ?? '');
    setBusy('save');
    setError('');
    try {
      cancelCelebration();
      await persist({ ...start, phase: 'working', review: null, deadlineAt: Date.now() + agreement.minutes * 60_000 });
      focusTarget.current = 'work';
    } catch (e) {
      await fail(e);
    } finally {
      setBusy(null);
    }
  };

  const startOver = async () => {
    if (!uid || busy) return;
    setArrival(null);
    setRetryAction(null);
    setNotice('');
    setLastNext('');
    setBusy('save');
    setError('');
    try {
      cancelCelebration();
      if (startId) await markStartDone(uid, startId);
      clearDraft();
      let prefill = pendingPrefill;
      try {
        prefill = sessionStorage.getItem('capy_start_prefill') ?? pendingPrefill;
        sessionStorage.removeItem('capy_start_prefill');
      } catch {
        /* ignore */
      }
      setStartId(null);
      setStart(newStartData());
      setInput(prefill);
      setPendingPrefill('');
      setContextFiles([]);
      setProof('');
      setProofFiles([]);
      setMinutes(START_DEFAULT_MINUTES);
      setConfirmNew(false);
      focusTarget.current = 'composer';
    } catch (e) {
      await fail(e);
    } finally {
      setBusy(null);
    }
  };

  // ── Derived display ────────────────────────────────────────────
  const petExpression: PetExpression = celebrate ? 'celebrating' : busy ? 'curious' : 'happy';
  /** One small nod as the proposed step's title lands. */
  const present = arrival === 'propose' && !busy && !reduced;

  // Dwell lines come from `consider` (captured at submit), so persist flipping
  // `started` mid-dwell cannot change them.
  const companionLine = consider
    ? consider.kind === 'review'
      ? 'Let’s look at what you did.'
      : consider.withImages
        ? 'Reading what you sent.'
        : consider.fromProposal
          ? 'Fair. Let me rework it.'
          : consider.first
            ? 'Let me take this in.'
            : 'I’m taking a look.'
    : notice
      ? 'No problem. Whenever you’re ready.'
      : error && retryAction
        ? 'Still here. Let’s try that again.'
        : phase === 'working'
          ? 'I’ll be here when you’re ready.'
          : phase === 'result' && start.review?.status === 'supported'
            ? 'There’s your beginning.'
            : phase === 'result' && start.review?.status === 'not_yet_supported'
              ? 'One more pass and we’ll check again.'
              : phase === 'result'
                ? 'Show me a bit more and I’ll look again.'
                : phase === 'proposal'
                  ? 'We can start right here.'
                  : started
                    ? 'One thing I want to check.'
                    : 'We’ll start where you are.';

  const canSend = !busy && !loading && !tooLong && (input.trim().length > 0 || contextFiles.length > 0);

  // Views arriving from a consideration enter from the companion's side; otherwise today's enters.
  const arrivalInitial = reduced ? { opacity: 0 } : { x: isMobile ? 0 : -16, y: isMobile ? -10 : 0, opacity: 0 };
  const arrivalTransition = { duration: 0.42, ease: CONSIDER_EASE_OUT };
  /** Result-view rows: staged only when arriving from a review. */
  const enter = (ms: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay: arrival === 'result' ? d(ms) : 0, ease: CONSIDER_EASE_OUT },
  });

  // The thread: all messages in conversation, the last exchange in proposal, plus the
  // LIGHT tier's optimistic user bubble keyed exactly as its persisted twin will be.
  const shownOffset = phase === 'proposal' ? Math.max(0, start.messages.length - 2) : 0;
  const shownMessages: ShownMessage[] = (phase === 'proposal' ? start.messages.slice(-2) : start.messages).map((m, k) => ({ ...m, i: k + shownOffset }));
  const lightPending = consider?.tier === 'light' && start.messages.length === consider.baseline;
  if (lightPending) shownMessages.push({ role: 'user', text: consider.echo.text, i: consider.baseline, pending: true });

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="gradient-start min-h-screen flex items-center justify-center">
        <div className="flex gap-1.5" role="status" aria-label="Loading">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-coral animate-pulse motion-reduce:animate-none" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    );
  }

  // ── Error banner + stop notice (mount under the input they belong to) ──
  const errorBanner = error ? (
    <div role="alert" className="mt-3 flex items-start gap-3 rounded-xl border border-failure/30 bg-failure/5 px-4 py-3 text-xs text-failure leading-relaxed" style={BODY}>
      <span className="flex-1">{error}</span>
      {retryAction && (
        <button
          type="button"
          ref={attachRetry}
          onClick={() => (retryAction === 'review' ? void review() : void sendMessage(input))}
          className="flex-shrink-0 font-semibold underline underline-offset-4 hover:opacity-70"
        >
          Try again
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          const target = retryAction === 'review' ? workRef : composerRef;
          setError('');
          setRetryAction(null);
          target.current?.focus({ preventScroll: true });
        }}
        aria-label="Dismiss"
        className="flex-shrink-0 mt-0.5 hover:opacity-70"
      >
        <X size={14} />
      </button>
    </div>
  ) : null;
  const noticeLine = notice ? (
    <p role="status" className="mt-2 text-xs text-near-black/55" style={BODY}>
      {notice}
    </p>
  ) : null;

  // ── Composer (shared by welcome + conversation + proposal) ─────
  // LIGHT tier: the card dims and the text turns transparent (state untouched) so
  // the words appear once, in the optimistic bubble, and are visibly back on error or stop.
  const lightSending = consider?.tier === 'light';
  const composer = (
    <>
      <div
        {...contextZone.getRootProps()}
        className={`glass-strong rounded-2xl p-3 transition-shadow focus-within:ring-2 focus-within:ring-coral/40 ${contextZone.isDragActive ? 'ring-2 ring-coral/40' : ''} ${lightSending ? 'opacity-60' : ''}`}
        style={{ boxShadow: 'var(--shadow-md)' }}
      >
        <input {...contextZone.getInputProps()} />
        <label htmlFor="start-composer" className="sr-only">
          {started ? 'Reply to Capy' : 'What are you trying to start?'}
        </label>
        <textarea
          id="start-composer"
          ref={attachComposer}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              void sendMessage(input);
            }
          }}
          placeholder={started ? 'Tell me a little more…' : 'I need to start my bio worksheet, but…'}
          rows={started ? 2 : 3}
          maxLength={10000}
          disabled={Boolean(busy)}
          className={`w-full bg-transparent px-2 py-2 text-sm placeholder-near-black/30 resize-none outline-none ${lightSending ? 'text-transparent' : 'text-near-black'}`}
          style={{ fontFamily: 'var(--font-body)' }}
        />
        <Thumbs files={contextFiles} label="Instructions" onRemove={(i) => setContextFiles((p) => p.filter((_, n) => n !== i))} />
        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={contextZone.open}
            disabled={Boolean(busy)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-near-black/50 hover:text-coral transition-colors"
            style={BODY}
          >
            <Paperclip size={14} /> Add instructions
          </button>
          <span className="ml-auto text-[10px] text-near-black/50 hidden sm:inline" style={BODY}>
            {tooLong ? LONG_ERROR : 'Shift + Enter for a new line'}
          </span>
          <button
            type="button"
            onClick={() => void sendMessage(input)}
            disabled={!canSend}
            aria-label={consider ? 'Sent to Capy' : 'Send to Capy'}
            className={`btn-hover flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              canSend || consider ? 'bg-coral text-white' : 'bg-near-black/10 text-near-black/30 cursor-not-allowed'
            }`}
          >
            {/* Acknowledge in the same frame as the tap: the arrow becomes a check. */}
            <motion.span key={consider ? 'sent' : 'send'} initial={{ scale: 0.85 }} animate={{ scale: 1 }} transition={{ duration: 0.12 }} className="flex">
              {consider ? <Check size={18} /> : <ArrowUp size={18} />}
            </motion.span>
          </button>
        </div>
      </div>
      {errorBanner}
      {noticeLine}
    </>
  );

  const journeyStep = (label: string, active: boolean) => (
    <span className={active ? 'text-coral font-semibold' : 'text-near-black/55'} style={BODY}>
      {label}
    </span>
  );

  const openConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
    openerRef.current = e.currentTarget;
    setConfirmNew(true);
  };
  const closeConfirm = () => {
    setConfirmNew(false);
    openerRef.current?.focus();
  };

  const lastReviewTrace = [...start.trace].reverse().find((t) => t.operation === 'review');

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'user'}>
      <div className="gradient-start min-h-screen overflow-x-clip">
        <div className="px-4 sm:px-5 lg:px-6 py-6 lg:py-8 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.3fr)] gap-5 lg:gap-8 items-start">
            {/* ═══ LEFT: Companion ═══ */}
            <motion.aside
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              aria-label="Your companion"
              className="lg:sticky lg:top-8"
            >
              <div className="glass-strong rounded-2xl p-5 lg:p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
                <div className="flex lg:flex-col items-center gap-4 lg:gap-3">
                  <motion.div
                    className="flex-shrink-0"
                    animate={busy && !reduced ? { y: [0, -5, 0], scale: [1, 1.02, 1] } : present ? { y: [0, -6, 0], scale: 1 } : { y: 0, scale: 1 }}
                    transition={
                      busy
                        ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
                        : present
                          ? { duration: 0.42, delay: 0.44, ease: CONSIDER_EASE_OUT }
                          : { duration: 0.4 }
                    }
                  >
                    <CapyPet
                      size={isMobile ? 84 : 170}
                      color={pet?.color || 'tan'}
                      expression={petExpression}
                      hat={pet?.equippedHat}
                      clothes={pet?.equippedClothes}
                      animated={!reduced}
                    />
                  </motion.div>
                  <div className="min-w-0 flex-1 lg:text-center">
                    <p className="text-[10px] uppercase tracking-widest text-near-black/40 font-semibold" style={BODY}>
                      Your accountability partner
                    </p>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={companionLine}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.3 }}
                        className="text-base lg:text-lg font-medium text-near-black mt-1 leading-snug"
                        style={BODY}
                      >
                        {companionLine}
                      </motion.p>
                    </AnimatePresence>
                    {pet && (
                      <p className="text-xs text-near-black/45 mt-1" style={BODY}>
                        {pet.name} · Level {pet.level} · {pet.xp} XP
                      </p>
                    )}
                  </div>
                </div>

                {started && (
                  <div className="hidden lg:block border-t border-near-black/5 mt-5 pt-4">
                    <p className="text-[10px] uppercase tracking-widest text-near-black/40 font-semibold" style={BODY}>
                      What we’re working on
                    </p>
                    <p className="text-xs text-near-black/65 leading-relaxed mt-1.5 line-clamp-4" style={BODY}>
                      {start.contextSummary || start.taskInput}
                    </p>
                    {start.contextImageUrls.length > 0 && (
                      <div className="flex gap-1.5 mt-2">
                        {start.contextImageUrls.slice(0, 4).map((u, n) => (
                          <img key={u} src={u} alt={`Instructions image ${n + 1}`} className="w-7 h-7 rounded-md object-cover bg-near-black/5" />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.aside>

            {/* ═══ RIGHT: The step ═══ */}
            <motion.section
              ref={sectionRef}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              aria-label="Start a task with Capy"
              aria-busy={Boolean(consider)}
              className="min-w-0 [overflow-wrap:anywhere]"
            >
              {started && (
                <div className="flex items-center gap-3 text-xs mb-4">
                  {journeyStep('Find a start', phase === 'conversation' || phase === 'proposal')}
                  <span className="w-5 h-px bg-near-black/10" aria-hidden="true" />
                  {journeyStep('Take the step', phase === 'working')}
                  <span className="w-5 h-px bg-near-black/10" aria-hidden="true" />
                  {journeyStep('Check in', phase === 'result')}
                  <button
                    type="button"
                    onClick={openConfirm}
                    aria-label="Start a different task"
                    title="Start a different task"
                    className="ml-auto w-8 h-8 rounded-full border border-near-black/10 flex items-center justify-center text-near-black/45 hover:text-coral hover:border-coral/40 transition-colors"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              )}

              <div ref={deckRef}>
              <AnimatePresence mode="wait" custom={{ toward: consider?.tier === 'full', axis: isMobile ? 'y' : 'x', ending }}>
                {/* ── Consideration stage (FULL tier) ── */}
                {consider?.tier === 'full' && (
                  <ConsiderationStage
                    key="consider"
                    kind={consider.kind}
                    withImages={consider.withImages}
                    startedAt={consider.startedAt}
                    reference={consider.reference}
                    echo={consider.echo}
                    minHeight={consider.minHeight}
                    reduced={reduced}
                    onCancel={cancelConsider}
                    attachRoot={attachStage}
                  />
                )}

                {/* ── Welcome ── */}
                {!started && consider?.tier !== 'full' && (
                  <motion.div key="welcome" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} variants={deckVariants} exit="exit" transition={{ duration: 0.45 }}>
                    <p className="text-[10px] uppercase tracking-widest text-near-black/40 font-semibold mb-3" style={BODY}>
                      One thing at a time
                    </p>
                    <h1 className="text-4xl sm:text-5xl text-near-black leading-[1.05] mb-3">
                      Let’s make a <span className="text-coral">start.</span>
                    </h1>
                    <p className="text-sm sm:text-base text-near-black/60 leading-relaxed mb-5" style={BODY}>
                      What are you trying to start? Tell me what’s on your mind and we’ll find a way in.
                    </p>
                    {composer}
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={BODY}>
                      <span className="text-near-black/35">You can start with:</span>
                      {['I know what to do, I just haven’t started', 'I’m not sure where to begin'].map((hint) => (
                        <button
                          key={hint}
                          type="button"
                          onClick={() => {
                            setInput(hint);
                            composerRef.current?.focus();
                          }}
                          className="text-near-black/55 underline decoration-near-black/20 underline-offset-4 hover:text-coral transition-colors"
                        >
                          “{hint}”
                        </button>
                      ))}
                    </div>
                    <p className="mt-6 text-xs text-near-black/60" style={BODY}>
                      A first step that fits you. A check-in with Capy. No stakes, no penalties.
                    </p>
                  </motion.div>
                )}

                {/* ── Conversation / Proposal ── */}
                {started && (phase === 'conversation' || phase === 'proposal') && consider?.tier !== 'full' && (
                  <motion.div
                    key="conversation"
                    initial={arrival ? arrivalInitial : { y: 10, opacity: 0 }}
                    animate={{ x: 0, y: 0, opacity: 1 }}
                    variants={deckVariants}
                    exit="exit"
                    transition={arrival ? arrivalTransition : { duration: 0.35 }}
                  >
                    {phase === 'proposal' && start.messages.length > 2 && (
                      <details className="mb-4 text-xs text-near-black/55" style={BODY}>
                        <summary className="cursor-pointer text-near-black/45 hover:text-near-black/70">Our conversation so far</summary>
                        <div className="mt-2 space-y-2 pl-1">
                          {start.messages.slice(0, -2).map((m, i) => (
                            <p key={i} className="leading-relaxed">
                              <strong className="font-semibold text-near-black/70">{m.role === 'user' ? 'You' : 'Capy'}:</strong> {m.text}
                            </p>
                          ))}
                        </div>
                      </details>
                    )}

                    <section className={`space-y-4 ${phase === 'conversation' ? 'max-h-[46vh] overflow-y-auto pr-1' : ''}`} aria-label="Conversation">
                      {shownMessages.map((m) => (
                        <motion.div
                          key={`${m.role}-${m.i}-${m.text.slice(0, 12)}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: m.pending ? 0.6 : m.role === 'user' && phase === 'proposal' ? 0.85 : 1, y: 0 }}
                          transition={{ duration: 0.25, delay: m.role === 'assistant' && m.i === start.messages.length - 1 && arrival ? d(90) : 0 }}
                          className={m.role === 'user' ? 'ml-6 sm:ml-12 bg-coral/15 rounded-2xl rounded-br-md px-4 py-3' : 'bg-near-black/5 rounded-2xl rounded-bl-md px-4 py-3 mr-6 sm:mr-12'}
                        >
                          <span className="block text-[10px] uppercase tracking-widest font-semibold text-near-black/40" style={BODY}>
                            {m.role === 'user' ? 'You' : 'Capy'}
                            {m.pending && <span className="sr-only"> (sending)</span>}
                          </span>
                          <p
                            className={`${
                              m.role === 'user' ? (phase === 'proposal' ? 'text-xs text-near-black/85' : 'text-sm text-near-black/85') : 'text-sm sm:text-base text-near-black/85'
                            } whitespace-pre-wrap break-words mt-1 leading-relaxed`}
                            style={BODY}
                          >
                            {m.text}
                          </p>
                          {m.imageUrls && m.imageUrls.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {m.imageUrls.map((u, n) => (
                                <img key={u} src={u} alt={`Instructions image ${n + 1}`} className="w-12 h-12 rounded-lg object-cover bg-near-black/5" />
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))}
                      <AnimatePresence>
                        {lightPending && (
                          <ConsiderationBubble
                            key="pending-capy"
                            kind="guide"
                            withImages={false}
                            startedAt={consider.startedAt}
                            reduced={reduced}
                            onCancel={cancelConsider}
                          />
                        )}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </section>

                    {phase === 'proposal' && start.proposal && (
                      <motion.article
                        ref={attachProposal}
                        tabIndex={-1}
                        variants={{
                          hidden: { opacity: 0, y: 16, scale: 0.985 },
                          show: {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            transition: {
                              duration: 0.45,
                              delay: arrival === 'propose' ? d(180) : 0,
                              delayChildren: arrival === 'propose' ? d(180) : 0,
                              staggerChildren: arrival === 'propose' ? d(60) : 0,
                            },
                          },
                        }}
                        initial="hidden"
                        animate="show"
                        aria-labelledby="start-proposal-title"
                        className="glass-strong rounded-2xl p-5 sm:p-6 mt-5 border border-coral/20 outline-none"
                        style={{ boxShadow: 'var(--shadow-lg)' }}
                      >
                        <motion.div variants={item}>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[10px] uppercase tracking-widest font-semibold text-coral" style={BODY}>Your first step</span>
                            <span className="text-xs text-near-black/40" style={BODY}>Just this for now</span>
                          </div>
                          <h2 id="start-proposal-title" className="text-2xl sm:text-3xl text-near-black mt-3 mb-2 leading-tight">{start.proposal.title}</h2>
                        </motion.div>
                        <motion.p variants={item} className="text-sm sm:text-base text-near-black/80 leading-relaxed" style={BODY}>{start.proposal.action}</motion.p>
                        <motion.dl variants={item} className="mt-4 grid grid-cols-[88px_1fr] gap-x-3 gap-y-2 text-xs" style={BODY}>
                          <dt className="text-near-black/45">Where</dt>
                          <dd className="text-near-black/75">{start.proposal.where}</dd>
                          <dt className="text-near-black/45">Enough for now</dt>
                          <dd className="text-near-black/75">{start.proposal.enough}</dd>
                        </motion.dl>
                        <motion.div variants={item} className="mt-4 pt-4 border-t border-coral/10 flex items-start gap-2 text-xs text-near-black/65" style={BODY}>
                          <Check size={15} className="text-coral flex-shrink-0 mt-0.5" />
                          <p className="leading-relaxed"><span className="font-semibold text-near-black/75">Capy will check:</span> {start.proposal.evidenceInstructions}</p>
                        </motion.div>
                        <motion.div variants={item} className="mt-5 flex flex-wrap items-center justify-between gap-3">
                          <label className="flex items-center gap-2 text-xs text-near-black/60" style={BODY}>
                            <Clock3 size={15} className="text-near-black/40" />
                            Check in after
                            <select
                              aria-label="Check-in minutes"
                              value={minutes}
                              onChange={(e) => setMinutes(Number(e.target.value))}
                              className="input-glow bg-white rounded-lg px-2 py-1.5 text-xs text-near-black"
                              style={{ boxShadow: 'var(--shadow-sm)' }}
                            >
                              {Array.from({ length: START_MAX_MINUTES - START_MIN_MINUTES + 1 }, (_, i) => i + START_MIN_MINUTES).map((m) => (
                                <option key={m} value={m}>{m} min</option>
                              ))}
                            </select>
                          </label>
                          <button
                            type="button"
                            onClick={() => void accept()}
                            disabled={Boolean(busy)}
                            className="btn-hover bg-coral text-white rounded-xl px-5 py-3 text-sm font-bold flex items-center gap-2 disabled:opacity-40 w-full sm:w-auto justify-center"
                            style={{ boxShadow: 'var(--shadow-glow)' }}
                          >
                            Let’s start <ArrowRight size={16} />
                          </button>
                        </motion.div>
                        <motion.div variants={item}>
                          <button
                            type="button"
                            onClick={() => void sendMessage('That still feels like too much. Help me make the first step easier.')}
                            disabled={Boolean(busy)}
                            className="mt-3 text-xs text-near-black/45 underline underline-offset-4 hover:text-coral transition-colors"
                            style={BODY}
                          >
                            Make this easier
                          </button>
                        </motion.div>
                      </motion.article>
                    )}

                    <AnimatePresence>
                      {!busy && phase === 'conversation' && start.options.length > 0 && (
                        <motion.div
                          key="chips"
                          variants={{
                            hidden: { opacity: 0 },
                            show: { opacity: 1, transition: { delay: arrival ? d(220) : 0, delayChildren: arrival ? d(220) : 0, staggerChildren: d(50) } },
                          }}
                          initial="hidden"
                          animate="show"
                          exit={{ opacity: 0, y: -4, transition: { duration: 0.16 } }}
                          className="flex flex-wrap gap-2 mt-4"
                        >
                          {start.options.map((option) => (
                            <motion.div key={option} variants={chip}>
                              <button
                                type="button"
                                onClick={() => void sendMessage(option)}
                                className="btn-hover glass rounded-xl px-3 py-2 text-xs text-near-black/75 hover:text-coral flex items-center gap-2"
                                style={BODY}
                              >
                                {option} <ArrowUp size={12} />
                              </button>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div className="mt-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: arrival === 'propose' ? d(300) : 0 }}>
                      {phase === 'proposal' && (
                        <p className="text-xs text-near-black/45 mb-2" style={BODY}>Want to change something? Tell me.</p>
                      )}
                      {composer}
                    </motion.div>
                  </motion.div>
                )}

                {/* ── Working ── */}
                {phase === 'working' && agreement && consider?.tier !== 'full' && (
                  <motion.div key="working" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} variants={deckVariants} exit="exit" transition={{ duration: 0.4 }}>
                    <p className="text-[10px] uppercase tracking-widest text-near-black/40 font-semibold mb-2" style={BODY}>You and one small step</p>
                    <h1 className="text-3xl sm:text-4xl text-near-black leading-tight mb-2">{agreement.title}</h1>
                    <p className="text-sm sm:text-base text-near-black/80 leading-relaxed mb-3" style={BODY}>{agreement.action}</p>
                    <div className="border-l-2 border-coral/30 pl-3 text-xs text-near-black/60 leading-relaxed mb-5" style={BODY}>
                      <span className="font-semibold text-near-black/70">{agreement.where}</span>
                      <p className="mt-0.5">{agreement.enough}</p>
                    </div>
                    {lastNext && (
                      <div className="mb-5 text-xs" style={BODY}>
                        <span className="text-[10px] uppercase tracking-widest text-near-black/40 font-semibold">From our check-in</span>
                        <p className="text-near-black/70 mt-0.5 leading-relaxed">{lastNext}</p>
                      </div>
                    )}

                    {/* One calm timer style for the whole window: no escalation, no ticks, digits hold at 00:00. */}
                    <div className="glass-strong rounded-xl px-4 py-3 flex items-center justify-between mb-2" style={{ boxShadow: 'var(--shadow-sm)' }}>
                      <div className="flex items-center gap-2 text-xs text-near-black/60" style={BODY}>
                        <Clock3 size={15} className="text-coral/70" />
                        {expired ? 'Ready to check in?' : 'Our check-in'}
                      </div>
                      <strong className="text-2xl font-extrabold tabular-nums text-near-black/80" style={{ fontFamily: 'var(--font-mono)' }}>
                        <span aria-hidden="true">{formatCheckIn(remaining)}</span>
                        <span className="sr-only">
                          {expired ? 'Check-in time reached' : `${Math.floor(remaining / 60)} minutes ${remaining % 60} seconds until check-in`}
                        </span>
                      </strong>
                    </div>
                    {expired && (
                      <p role="status" className="text-xs text-near-black/55 mb-4" style={BODY}>
                        No rush. Show me where you got to, or keep going a little longer.
                      </p>
                    )}

                    <div className="mt-4">
                      <label htmlFor="start-work" className="text-xs text-near-black/70 font-semibold block" style={BODY}>Your work</label>
                      <p className="text-xs text-near-black/70 mt-1 mb-2 leading-relaxed" style={BODY}>{agreement.evidenceInstructions}</p>
                      <div
                        {...proofZone.getRootProps()}
                        className={`glass-strong rounded-2xl p-3 focus-within:ring-2 focus-within:ring-coral/40 ${proofZone.isDragActive ? 'ring-2 ring-coral/40' : ''}`}
                        style={{ boxShadow: 'var(--shadow-md)' }}
                      >
                        <input {...proofZone.getInputProps()} />
                        <textarea
                          id="start-work"
                          ref={attachWork}
                          value={proof}
                          onChange={(e) => setProof(e.target.value)}
                          rows={6}
                          maxLength={12000}
                          disabled={Boolean(busy)}
                          placeholder="Write your attempt here, or paste the part you worked on."
                          className="w-full bg-transparent px-2 py-2 text-sm text-near-black placeholder-near-black/30 resize-y outline-none leading-relaxed"
                          style={{ fontFamily: 'var(--font-body)' }}
                        />
                        <Thumbs files={proofFiles} label="Work photo" onRemove={(i) => setProofFiles((p) => p.filter((_, n) => n !== i))} />
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <button
                            type="button"
                            onClick={proofZone.open}
                            disabled={Boolean(busy)}
                            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-near-black/50 hover:text-coral transition-colors"
                            style={BODY}
                          >
                            <Paperclip size={14} /> Add a photo of your work
                          </button>
                          <span className="text-[10px] text-near-black/50" style={BODY}>Draft saved in this tab</span>
                        </div>
                      </div>
                      {errorBanner}
                      {noticeLine}
                    </div>

                    <div className="mt-5 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => void revise()}
                        disabled={Boolean(busy)}
                        className="text-xs text-near-black/45 underline underline-offset-4 hover:text-coral transition-colors text-left"
                        style={BODY}
                      >
                        This step needs adjusting
                      </button>
                      <button
                        type="button"
                        onClick={() => void review()}
                        disabled={Boolean(busy)}
                        className="btn-hover bg-coral text-white rounded-xl px-5 py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
                        style={{ boxShadow: 'var(--shadow-glow)' }}
                      >
                        Check my first step <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── Result ── */}
                {phase === 'result' && start.review && consider?.tier !== 'full' && (
                  <motion.div
                    key="result"
                    initial={arrival ? arrivalInitial : { y: 14, opacity: 0 }}
                    animate={{ x: 0, y: 0, opacity: 1 }}
                    variants={deckVariants}
                    exit="exit"
                    transition={arrival ? arrivalTransition : { duration: 0.4 }}
                  >
                    <motion.p {...enter(0)} className="text-[10px] uppercase tracking-widest text-near-black/40 font-semibold mb-2" style={BODY}>Our check-in</motion.p>
                    <motion.h1 {...enter(60)} ref={attachResult} tabIndex={-1} className="text-3xl sm:text-4xl text-near-black leading-tight mb-3 outline-none">
                      {start.review.status === 'supported'
                        ? 'There’s your start.'
                        : start.review.status === 'unable_to_assess'
                          ? 'Let’s take another look.'
                          : 'We can take it from here.'}
                    </motion.h1>
                    <motion.p {...enter(120)} className="text-sm sm:text-base text-near-black/75 leading-relaxed mb-4" style={BODY}>{start.review.observation}</motion.p>

                    {start.review.quote ? (
                      <motion.blockquote {...enter(240)} className="relative rounded-r-2xl bg-amber/10 px-5 py-4 mb-4">
                        {/* Evidence first: the amber border draws in before any reward appears. */}
                        <motion.span
                          aria-hidden="true"
                          className="absolute left-0 inset-y-0 w-[3px] bg-amber"
                          initial={{ scaleY: reduced ? 1 : 0 }}
                          animate={{ scaleY: 1 }}
                          style={{ originY: 0 }}
                          transition={{ duration: 0.3, delay: arrival === 'result' ? d(300) : 0 }}
                        />
                        <span className="text-[10px] uppercase tracking-widest font-semibold text-near-black/45" style={BODY}>From your work</span>
                        <p className="text-base sm:text-lg text-near-black leading-relaxed mt-1 whitespace-pre-wrap break-words" style={BODY}>“{start.review.quote}”</p>
                      </motion.blockquote>
                    ) : start.proofImageUrls.length > 0 ? (
                      <motion.div {...enter(240)} className="flex gap-2 mb-4">
                        {start.proofImageUrls.map((u, n) => (
                          <img key={u} src={u} alt={`Your work photo ${n + 1}`} className="w-20 h-20 rounded-xl object-cover bg-near-black/5" />
                        ))}
                      </motion.div>
                    ) : null}

                    <motion.div {...enter(360)} className={`rounded-xl px-4 py-3 flex items-start gap-3 mb-4 ${start.review.status === 'supported' ? 'bg-success/10' : 'bg-near-black/5'}`}>
                      {start.review.status === 'supported' ? (
                        <Check size={16} className="flex-shrink-0 mt-0.5 text-success" aria-hidden="true" />
                      ) : start.review.status === 'unable_to_assess' ? (
                        <Eye size={16} className="flex-shrink-0 mt-0.5 text-near-black/60" aria-hidden="true" />
                      ) : (
                        <RotateCcw size={16} className="flex-shrink-0 mt-0.5 text-near-black/60" aria-hidden="true" />
                      )}
                      <div>
                        <p className="text-xs font-semibold text-near-black" style={BODY}>
                          {start.review.status === 'supported'
                            ? 'Your agreed first step is supported'
                            : start.review.status === 'unable_to_assess'
                              ? 'I couldn’t assess this yet'
                              : 'This step isn’t confirmed yet'}
                        </p>
                        <p className="text-xs text-near-black/75 mt-0.5 leading-relaxed" style={BODY}>{agreement?.enough}</p>
                      </div>
                    </motion.div>

                    <AnimatePresence>
                      {celebrate && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                          className="inline-flex items-center gap-3 rounded-xl bg-amber/15 px-4 py-2 mb-4"
                        >
                          <span className="text-xl font-extrabold text-success" style={{ fontFamily: 'var(--font-mono)' }}>+{celebrate.xp} XP</span>
                          {celebrate.leveledUp && (
                            <span className="text-base text-golden" style={{ textShadow: '0 0 12px rgba(255,215,0,0.4)' }}>Level {celebrate.newLevel}!</span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.p {...enter(420)} className="text-sm text-near-black/80 leading-relaxed mb-5" style={BODY}>{start.review.next}</motion.p>

                    <motion.div {...enter(480)} className="flex flex-wrap items-center gap-4">
                      <button
                        type="button"
                        onClick={() => void backToWork()}
                        disabled={Boolean(busy)}
                        className="btn-hover bg-coral text-white rounded-xl px-5 py-3 text-sm font-bold flex items-center gap-2 disabled:opacity-40"
                        style={{ boxShadow: 'var(--shadow-glow)' }}
                      >
                        {start.review.status === 'supported' ? 'Keep working' : 'Back to my work'} <ArrowRight size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void revise()}
                        disabled={Boolean(busy)}
                        className="text-xs text-near-black/45 underline underline-offset-4 hover:text-coral transition-colors"
                        style={BODY}
                      >
                        Adjust the next attempt
                      </button>
                      <button
                        type="button"
                        onClick={openConfirm}
                        disabled={Boolean(busy)}
                        className="text-xs text-near-black/55 underline underline-offset-4 hover:text-coral transition-colors"
                        style={BODY}
                      >
                        Start something else
                      </button>
                    </motion.div>

                    <motion.details {...enter(480)} className="mt-6 text-xs text-near-black/55" style={BODY}>
                      <summary className="cursor-pointer text-near-black/45 hover:text-near-black/70">What did Capy check?</summary>
                      <div className="mt-2 rounded-xl bg-near-black/[0.03] p-4 space-y-2 leading-relaxed">
                        <p><strong className="font-semibold text-near-black/70">The agreement:</strong> {agreement?.action}</p>
                        <p><strong className="font-semibold text-near-black/70">The check:</strong> {agreement?.evidenceInstructions}</p>
                        <p><strong className="font-semibold text-near-black/70">Result:</strong> {start.review.status.replaceAll('_', ' ')}</p>
                        <p className="text-xs text-near-black/60">
                          This check looks at the work you shared and this one first step. It doesn’t judge authorship, whether the work is new, or the whole task.
                        </p>
                        <p className="text-xs text-near-black/55">
                          {lastReviewTrace && usedModelForLastReview(start)
                            ? `${lastReviewTrace.model} · ${lastReviewTrace.promptVersion} · ${lastReviewTrace.milliseconds} ms`
                            : 'No model call was made for this check.'}
                        </p>
                      </div>
                    </motion.details>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>

              {/* Save errors on the result view; every other banner sits under its input. */}
              {phase === 'result' && (
                <>
                  {errorBanner}
                  {noticeLine}
                </>
              )}

              {lastCapy && (
                <span className="sr-only" role="status" aria-live="polite">
                  {lastCapy.text}
                  {phase === 'proposal' && start.proposal ? ` Capy proposed a first step: ${start.proposal.title}` : ''}
                </span>
              )}
            </motion.section>
          </div>
        </div>

        <ConfirmNewStart open={confirmNew} busy={Boolean(busy)} onConfirm={() => void startOver()} onCancel={closeConfirm} />
      </div>
    </MotionConfig>
  );
}
