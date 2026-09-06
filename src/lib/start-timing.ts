// Pure timing and status copy for the /start consideration transition.
// No React, no Firebase — safe to import anywhere.
//
// The status ladder describes elapsed time only. It never names a stage,
// a confidence, a percentage, or what the model is doing.

export type ConsiderKind = 'guide' | 'review';
export type ConsiderTier = 'full' | 'light';

/** Minimum time the FULL stage stays on screen, measured from submit (one breath). */
export const CONSIDER_FULL_FLOOR_MS = 1400;
/** Minimum time the LIGHT pending bubbles stay on screen, measured from submit. */
export const CONSIDER_LIGHT_FLOOR_MS = 500;
/** Stage settle (exit) duration on a successful return. */
export const CONSIDER_SETTLE_MS = 260;
/** Delay from release to the +XP pill and sound, so the evidence lands first. */
export const CONSIDER_CELEBRATE_DELAY_MS = 900;
/** How long the neutral "Stopped" notice stays under the input. */
export const CONSIDER_NOTICE_MS = 6000;
/** Elapsed-time thresholds for the status ladder. Stop becomes available at rung 1. */
export const CONSIDER_RUNGS_MS = [0, 10_000, 20_000, 45_000] as const;
export type ConsiderRung = 0 | 1 | 2 | 3;

export function considerRung(elapsedMs: number): ConsiderRung {
  let rung: ConsiderRung = 0;
  for (let i = 1; i < CONSIDER_RUNGS_MS.length; i++) {
    if (elapsedMs >= CONSIDER_RUNGS_MS[i]) rung = i as ConsiderRung;
  }
  return rung;
}

/** Dwell floor for a tier; 0 under reduced motion (nothing waits). */
export function considerFloor(tier: ConsiderTier, reduced: boolean): number {
  if (reduced) return 0;
  return tier === 'full' ? CONSIDER_FULL_FLOOR_MS : CONSIDER_LIGHT_FLOOR_MS;
}

export function considerStatus(kind: ConsiderKind, withImages: boolean, rung: ConsiderRung): { text: string; sub: string } {
  if (kind === 'review') {
    switch (rung) {
      case 0:
        return { text: 'Looking at your work…', sub: 'Checking it against what we agreed.' };
      case 1:
        return { text: 'Still working on it.', sub: 'Your work is safe here.' };
      case 2:
        return { text: 'Taking longer than usual.', sub: 'Your work is safe here either way.' };
      case 3:
        return { text: 'Still trying.', sub: 'Stopping keeps everything you typed.' };
    }
  }
  switch (rung) {
    case 0:
      return {
        text: withImages ? 'Reading your instructions…' : 'Thinking through your next step…',
        sub: 'Using what you’ve shared with me.',
      };
    case 1:
      return { text: 'Still working on it.', sub: 'Your message is safe here.' };
    case 2:
      return { text: 'Taking longer than usual.', sub: 'You can wait, or stop and send it again.' };
    case 3:
      return { text: 'Still trying.', sub: 'Stopping keeps everything you typed.' };
  }
}

/** Resolves after `ms` (clamped to ≥ 0). */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
}
