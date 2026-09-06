'use client';

// /start consideration transition: the stage shown while Capy works on a
// FULL-tier message, the in-thread pending bubble for LIGHT-tier replies,
// and the abstract breathing mark they share. The companion itself stays in
// the aside — the mark is a shape, not a character.

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { considerRung, considerStatus, type ConsiderKind, type ConsiderRung } from '@/lib/start-timing';

const BODY = { fontFamily: 'var(--font-body)', fontStyle: 'normal' } as const;
const SERIF = { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700 } as const;

/** Arrivals (things landing). */
export const CONSIDER_EASE_OUT: [number, number, number, number] = [0.2, 0.8, 0.2, 1];
/** Departures and the settle. */
export const CONSIDER_EASE_IN_OUT: [number, number, number, number] = [0.4, 0, 0.2, 1];
/** Matches the pet's busy float in page.tsx so the two breathe at one tempo. */
const BREATH = { duration: 3.2, repeat: Infinity, ease: 'easeInOut' as const };

export interface ConsiderationEcho {
  label: 'You said' | 'Your work' | 'You sent';
  text: string;
  /** Object URLs created once at submit; the stage revokes them on unmount. */
  urls: string[];
}

export interface ConsiderationReference {
  label: string;
  value: string;
  serif: boolean;
}

/** 1 s tick → status rung. Owned here so the page never re-renders per tick. */
function useRung(startedAt: number): ConsiderRung {
  const [rung, setRung] = useState<ConsiderRung>(0);
  useEffect(() => {
    const t = setInterval(() => setRung(considerRung(Date.now() - startedAt)), 1000);
    return () => clearInterval(t);
  }, [startedAt]);
  return rung;
}

// ─── Mark ────────────────────────────────────────────────────────

/** One calm coral shape. 96: halo + body loops; 20: body only. Fully static when reduced. */
export function ConsiderationMark({ size, reduced }: { size: 96 | 20; reduced: boolean }) {
  if (size === 20) {
    return reduced ? (
      <span aria-hidden="true" className="consider-body block flex-shrink-0 w-5 h-5" />
    ) : (
      <motion.span aria-hidden="true" className="consider-body block flex-shrink-0 w-5 h-5" animate={{ scale: [1, 1.06, 1] }} transition={BREATH} />
    );
  }
  return (
    <div aria-hidden="true" className="relative flex items-center justify-center" style={{ width: 176, height: 176 }}>
      {reduced ? (
        <>
          <span className="consider-halo absolute inset-0" style={{ opacity: 0.7 }} />
          <span className="consider-body relative block" style={{ width: 96, height: 96 }} />
        </>
      ) : (
        <>
          <motion.span
            className="consider-halo absolute inset-0"
            animate={{ scale: [1, 1.12, 1], opacity: [0.9, 0.55, 0.9] }}
            transition={BREATH}
          />
          <motion.span className="consider-body relative block" style={{ width: 96, height: 96 }} animate={{ scale: [1, 1.06, 1] }} transition={BREATH} />
        </>
      )}
    </div>
  );
}

// ─── Stage (FULL tier) ───────────────────────────────────────────

const stageVariants: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.28, ease: CONSIDER_EASE_OUT } },
  exit: (c: { ending?: 'settle' | 'fade' } | undefined) =>
    c?.ending === 'fade'
      ? { opacity: 0, transition: { duration: 0.2 } }
      : { opacity: 0, scale: 0.92, transition: { duration: 0.26, ease: CONSIDER_EASE_IN_OUT } },
};

const stageVariantsReduced: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

function StopButton({ filled, onCancel }: { filled: boolean; onCancel: () => void }) {
  return (
    <button
      type="button"
      onClick={onCancel}
      className={
        filled
          ? 'bg-coral/10 text-coral rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-coral/15 transition-colors'
          : 'text-xs underline underline-offset-4 text-near-black/50 hover:text-coral transition-colors'
      }
      style={BODY}
    >
      Stop and keep my message
    </button>
  );
}

/** Ladder text; cross-fades only when the rung changes, so the live region announces only then. */
function StatusLines({ rung, text, sub, center }: { rung: ConsiderRung; text: string; sub: string; center: boolean }) {
  return (
    <div role="status" aria-live="polite" className={center ? 'text-center' : ''}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={rung} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <p className="text-sm font-semibold text-near-black/80" style={BODY}>{text}</p>
          <p className="text-xs text-near-black/45 mt-0.5" style={BODY}>{sub}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function ConsiderationStage({
  kind,
  withImages,
  startedAt,
  reference,
  echo,
  minHeight,
  reduced,
  onCancel,
  attachRoot,
}: {
  kind: ConsiderKind;
  withImages: boolean;
  startedAt: number;
  reference: ConsiderationReference;
  echo: ConsiderationEcho;
  minHeight: number;
  reduced: boolean;
  onCancel: () => void;
  attachRoot: (el: HTMLDivElement | null) => void;
}) {
  const rung = useRung(startedAt);
  const status = considerStatus(kind, withImages, rung);
  const canStop = rung >= 1;

  // The echo thumbnails were created once at submit; free them when the stage leaves.
  useEffect(() => {
    const urls = echo.urls;
    return () => {
      for (const u of urls) URL.revokeObjectURL(u);
    };
  }, [echo.urls]);

  const child = (delayMs: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.24, delay: reduced ? 0 : delayMs / 1000, ease: CONSIDER_EASE_OUT },
  });

  return (
    <motion.div
      ref={attachRoot}
      tabIndex={-1}
      role="group"
      aria-label={kind === 'review' ? 'Capy is looking at your work' : 'Capy is working on your reply'}
      variants={reduced ? stageVariantsReduced : stageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && canStop) {
          e.preventDefault();
          onCancel();
        }
      }}
      className="flex flex-col outline-none"
      style={{ minHeight }}
    >
      {/* Task reference — the one line that keeps a phone user oriented while the aside summary is off-screen. */}
      <motion.div {...child(0)} className="self-start max-w-full">
        <p className="text-[10px] uppercase tracking-widest text-near-black/40 font-semibold" style={BODY}>{reference.label}</p>
        {reference.value && (
          <p
            className={reference.serif ? 'text-sm text-near-black/80 line-clamp-1 mt-0.5' : 'text-xs text-near-black/65 line-clamp-1 mt-0.5'}
            style={reference.serif ? SERIF : BODY}
          >
            {reference.value}
          </p>
        )}
      </motion.div>

      {/* Echo — the user's just-sent message, styled like the thread's user bubble so the returning bubble lands where it was. */}
      <motion.div {...child(0)} className="ml-6 sm:ml-12 bg-coral/15 rounded-2xl rounded-br-md px-4 py-3 mt-3">
        <span className="block text-[10px] uppercase tracking-widest font-semibold text-near-black/40" style={BODY}>{echo.label}</span>
        {echo.text && (
          <p className="text-sm text-near-black/85 line-clamp-3 whitespace-pre-wrap break-words mt-1 leading-relaxed" style={BODY}>
            {echo.text}
          </p>
        )}
        {echo.urls.length > 0 && (
          <div className="flex gap-2 mt-2">
            {echo.urls.map((u) => (
              <img key={u} src={u} alt="" className="w-10 h-10 rounded-lg object-cover bg-near-black/5" />
            ))}
          </div>
        )}
      </motion.div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div {...child(80)} className="my-8">
          <ConsiderationMark size={96} reduced={reduced} />
        </motion.div>

        <motion.div {...child(160)}>
          <StatusLines rung={rung} text={status.text} sub={status.sub} center />
        </motion.div>

        <AnimatePresence>
          {canStop && (
            <motion.div
              key="stop"
              initial={{ opacity: 0, y: reduced ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
              className="mt-5"
            >
              <StopButton filled={rung >= 2} onCancel={onCancel} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Pending bubble (LIGHT tier) ─────────────────────────────────

// Handing over to the real reply (`settle`): leave at once so two Capy bubbles never
// stack or shove each other; on error or stop (`fade`) there is nothing to hand over to.
const bubbleVariants: Variants = {
  exit: (c: { ending?: 'settle' | 'fade' } | undefined) =>
    c?.ending === 'fade' ? { opacity: 0, transition: { duration: 0.18 } } : { opacity: 0, transition: { duration: 0 } },
};

export function ConsiderationBubble({
  kind,
  withImages,
  startedAt,
  reduced,
  onCancel,
}: {
  kind: ConsiderKind;
  withImages: boolean;
  startedAt: number;
  reduced: boolean;
  /** Same recovery as the stage, from rung 1 — so the ladder's "stop" copy is always true. */
  onCancel?: () => void;
}) {
  const rung = useRung(startedAt);
  const status = considerStatus(kind, withImages, rung);
  const canStop = Boolean(onCancel) && rung >= 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      variants={bubbleVariants}
      exit="exit"
      transition={{ duration: 0.28, delay: reduced ? 0 : 0.2, ease: CONSIDER_EASE_OUT }}
      className="bg-near-black/5 rounded-2xl rounded-bl-md px-4 py-3 mr-6 sm:mr-12"
    >
      <span className="block text-[10px] uppercase tracking-widest font-semibold text-near-black/40" style={BODY}>Capy</span>
      <div className="flex items-center gap-3 mt-2">
        <ConsiderationMark size={20} reduced={reduced} />
        <StatusLines rung={rung} text={status.text} sub={status.sub} center={false} />
      </div>
      <AnimatePresence>
        {canStop && onCancel && (
          <motion.div key="stop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.24 }} className="mt-3">
            <StopButton filled={rung >= 2} onCancel={onCancel} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
