@AGENTS.md

# CAPY — Project Ground Truth

> Last verified: 2026-09-05
> Source of truth: this file. If code disagrees with this file, update this file.

## What CAPY Is

Capy is a **production web app** where students upload assignment context, race a timer, upload proof of their work, and an AI capybara teacher (Claude) verifies completion via vision. Approved work earns XP for a virtual capybara pet; failure loses XP. Users customize their pet with cosmetics unlocked by leveling up.

Since 2026-09-05 the **primary promise is task initiation**: Capy helps a person take the *first step* on a task they're stuck on, then checks the step they agreed to. That lives at `/start` (see "First-Step Flow" below). The original session flow (race a timer, prove the whole task) remains at `/home`.

**Primary user:** College/high-school students who procrastinate — with an explicit ADHD / accessibility focus for the first-step flow.
**Business goal:** Paid subscriptions (not yet wired — Stripe placeholder exists in settings).
**Differentiator:** AI-verified accountability with an emotional pet mechanic. "Other apps trust you. Capy doesn't."

---

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (app router) | 16.2.1 |
| Language | TypeScript (strict) | 5.x |
| React | React + React Compiler | 19.2.4 |
| Styling | Tailwind CSS | v4 |
| Animation | Motion (framer-motion) | 12.x |
| UI kit | shadcn/ui (radix-nova) | button, dialog, progress, slider, tabs, tooltip |
| AI (legacy routes) | Anthropic Claude `claude-sonnet-4-20250514` (hardcoded in 5 routes) | via `@anthropic-ai/sdk` |
| AI (/start routes) | `CAPY_MODEL` env var, default `claude-opus-5` | via `@anthropic-ai/sdk` |
| Auth | Firebase Auth | Google, email/password, anonymous |
| Database | Cloud Firestore | project: `capy-app-unbanned` |
| Storage | Firebase Storage | image uploads with client-side compression |
| Charts | Recharts | dashboard XP chart |
| File upload | react-dropzone | multi-image drag-and-drop |
| Email | nodemailer | feedback route only |
| Sound | Web Audio API | synthesized effects (`src/lib/sounds.ts`) |
| Fonts | DM Sans (body), JetBrains Mono (timer), Georgia (headlines) | via `next/font/google` |

---

## How to Run

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint
npm run lint
```

### Environment Variables (`.env.local`)

```
ANTHROPIC_API_KEY=...          # Optional — mock fallback works without it (except /start review, see below)
CAPY_MODEL=claude-opus-5       # Optional — model for /api/start/*; set claude-sonnet-5 for faster demos
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

**No API key?** The legacy `/home` session flow (evaluate/verify) runs on mock responses end-to-end. The `/start` flow walks up to the review step only: a `supported` result, the +15 XP, and the celebration require a real key (see "API Routes — Mock Behavior").

### Tests

**None exist.** No test framework, no test files, no CI pipeline. `npm run build` is the only automated quality gate.

### Deploy

Push to `main` on `trakk-app-dev/capy` → Vercel auto-deploys.

---

## Directory Structure

```
src/
  app/
    page.tsx                        Landing (public)
    layout.tsx                      Root layout: fonts + AppShell wrapper
    globals.css                     Full design system (colors, shadows, gradients, animations)
    signup/page.tsx                 Auth: Google/email/guest
    onboarding/page.tsx             8-9 slides: quiz + pet creation + egg hatch
    start/page.tsx                  First-step flow: guidance chat → agreed step → check-in → evidence review
    home/page.tsx                   Session setup: task input, context upload, time slider
    evaluate/page.tsx               AI evaluation: scanning → context Q&A → deal → countdown
    timer/page.tsx                  Countdown + proof upload (multi-photo)
    verify/page.tsx                 AI verification → XP reward/penalty → level-up
    dashboard/page.tsx              Session/goal history, stats, XP chart
    closet/page.tsx                 Pet cosmetics: hats/clothes/colors
    goals/page.tsx                  Long-term commitments: create, active, proof, history
    settings/page.tsx               5-tab settings (Account, Preferences, Subscription, Data, About)
    feedback/page.tsx               Feedback form + image upload → /api/feedback
    how-it-works/page.tsx           5-step visual guide
    privacy/page.tsx                Privacy policy
    terms/page.tsx                  Terms of service
    api/
      evaluate/route.ts             POST: Claude evaluates task, sets XP stakes (+ mock fallback)
      evaluate/refine/route.ts      POST: Chat-style criteria refinement
      verify/route.ts               POST: Claude vision verifies proof (+ mock fallback)
      commitments/route.ts          POST: AI refines commitment or rejects vague input
      commitments/refine/route.ts   POST: Chat-style goal criteria refinement
      feedback/route.ts             POST: nodemailer feedback submission
      start/guide/route.ts          POST: Claude asks one question or proposes a first action (auth required)
      start/review/route.ts         POST: Claude reviews work against the accepted step (auth required; never mocks success)
  components/
    AppShell.tsx                    Auth guard + layout: mobile hamburger / desktop sidebar
    AppSidebar.tsx                  Desktop rail sidebar (hover to expand)
    SidebarNav.tsx                  Mobile sliding overlay nav (used by AppShell)
    CapyPet.tsx                     SVG pet: 6 expressions, layered hat/clothes/color, idle animations
    CapyTeacher.tsx                 SVG teacher: glasses, 5 expressions, scanning animation
    CriteriaRefineChat.tsx          Reusable chat widget for refining AI criteria
    FeedbackForm.tsx                Feedback form component
    AuthProvider.tsx                ⚠️ DEAD CODE — never imported. See known issues.
    ui/                             shadcn/ui: button, dialog, progress, slider, tabs, tooltip
  lib/
    firebase.ts                     Firebase app init (real — project capy-app-unbanned)
    auth.ts                         Firebase Auth: Google, email, anonymous, upgrade functions
    db.ts                           Firestore CRUD + XP system + commitment lifecycle
    storage.ts                      Firebase Storage upload + client-side compression
    items.ts                        Item definitions: 15 hats, 12 clothes, 15 colors
    sounds.ts                       Web Audio synthesized effects (hatch, session-start, tick, etc.)
    utils.ts                        cn() utility for Tailwind class merging
    start-types.ts                  /start types, constants, pure helpers (no Firebase import)
    start.ts                        /start Firestore CRUD: version-checked transactions, atomic XP commit
    start-prompts.ts                /start guidance + review prompts, versioned
    start-server.ts                 /start server helpers: ID-token auth, image fetch, model call, validators
scripts/
  start-eval.ts                     Live prompt evaluation for /start (npx tsx scripts/start-eval.ts; real API calls)
```

---

## Core User Flow

```
Landing (/) → Signup (/signup) → Onboarding (/onboarding)
  → Home (/home) → Evaluate (/evaluate) → Timer (/timer) → Verify (/verify)
  → [loop back to Home]

Side routes: Dashboard (/dashboard), Closet (/closet), Goals (/goals), Settings (/settings)
```

### First-step flow (`/start`)

```
Entrances: landing input → /signup → (onboarding) → /home forwards to /start
           /home "Stuck on starting?" card → /start
           sidebar "Start" (first item)

conversation ──(Capy asks, ≤3 reply chips, or proposes)──▶ proposal
proposal ──"Let's start" (1–15 min check-in, default 3)──▶ working
working ──"Check my first step"──▶ result (supported / not_yet_supported / unable_to_assess)
result ──"Keep working"/"Back to my work"──▶ working   ·   "Adjust the next attempt" ──▶ proposal
any ──"Start something else"──▶ marks the start done, fresh conversation
```

Rules the flow must keep (from the hackathon concept, founder-approved):
- A known action gets no intake interview. A vague goal gets one question at a time. Capy never invents an assignment, question, or destination.
- Every proposed step states what to do, where, and what is enough. The check is agreed before work.
- Review compares evidence to the accepted step only. Saying "done" is never supported. A supported result must carry an exact quote from the work or a photo the model actually received. No API key, or missing/unreadable evidence → `unable_to_assess`. A model or network failure → a 502/503 error that keeps the working phase and the draft. Neither path can produce `supported`.
- Check-in expiry only invites a check. No panic, no penalties, no failure sound, no pet suffering. The timer has one calm style for the whole window.
- Supported first step → `START_XP` (15) once per start, applied atomically with the result. XP is never negative here.
- One companion: the user's own `CapyPet` (not `CapyTeacher`). Expressions: happy / curious (busy) / celebrating (after a supported result, delayed so the evidence lands first).
- Reduced motion: `/start` is the first consumer of `capy_preferences.reduceAnimations` (plus `useReducedMotion()`), via `MotionConfig`.
- Consideration transition (`/start` only): FULL (content slides toward the companion, centred breathing mark, staged return) on the first message, any message with images, pushback from the proposal, and review; LIGHT (in-thread optimistic bubble + considering bubble, no slide) on interview replies; none on saves. Tier never changes mid-dwell. Floors 1400 ms FULL / 500 ms LIGHT from submit, 0 under reduced motion (mark static, opacity-only crossfade, staggers 0). Status ladder in `src/lib/start-timing.ts` at 0/10/20/45 s describes elapsed time only — never stages, confidence, or model internals. Stop (link from 10 s, button from 20 s, Escape from 10 s on the stage) aborts the fetch and keeps input and files; it shows a neutral notice, not the error alert. Persist runs during the dwell; the celebration timer (900 ms) starts at release. Error banner mounts under the input it belongs to with Try again. No page-level gradient tint; no second character in the stage. UI lives in `src/components/StartConsideration.tsx`.
- Writes are version-checked transactions (`updateStart` / `commitStartReview`) that also refuse closed starts; closing (`markStartDone`, the duplicate-close in `getActiveStart`) bumps the version too. A stale tab gets "This start changed in another tab" and reloads.
- Images: up to `START_MAX_IMAGES_PER_TURN` (2) per message, `START_MAX_CONTEXT_IMAGES` (4) per start, `START_MAX_PROOF_IMAGES` (2) per submission; PNG/JPEG/WebP/GIF under 10 MB. The routes tell the model how many images it actually received.

### Data flow between pages

Data passes between pages via `sessionStorage` keys:
- `capy_pending_task` — landing → signup → home, which forwards it to `/start` as `capy_start_prefill` (after onboarding)
- `capy_start_prefill` — home → start (seeds the composer and is removed; if a start is already active it stays in sessionStorage until "Start something else" consumes it)
- `capy_start_draft` — start page only: JSON `{ startId, text }` of the typed work draft (this tab; cleared on review/new start)
- `capy_session_setup` — home → evaluate (full session config)
- `capy_active_session` — evaluate → timer → verify (active session ID)
- `capy_timer_result` — timer → verify (`'submitted'` or `'expired'`)

### Auth guard

`AppShell.tsx` guards all non-public routes. Public routes: `/`, `/signup`, `/terms`, `/privacy`. Onboarding has auth but no sidebar. All other routes get desktop sidebar + mobile hamburger.

---

## Design System Conventions

### Typography
- **Headlines:** Georgia, serif — always italic AND bold. Applied inline: `style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700 }}`
- **Body:** `var(--font-body)` (DM Sans) via `next/font/google`
- **Timer digits:** `var(--font-mono)` (JetBrains Mono) via `next/font/google`
- **NEVER** use Inter, Arial, or Roboto

### Colors (CSS variables in `globals.css`)
- `--color-coral: #FF7E5F` — primary energy, buttons, accents
- `--color-peach: #FEB47B` — warm secondary
- `--color-lavender: #C4A7E7` — cool contrast
- `--color-amber: #FFB347` — XP, rewards
- `--color-cream: #FFF8F0` — base "white" (never use pure `#fff`)
- `--color-near-black: #1E1E2E` — text (never use pure `#000`)
- `--color-success: #22C55E` — XP gains
- `--color-failure: #EF4444` — XP losses

### Gradient backgrounds (one per screen)
Each page has its own CSS gradient class in `globals.css`:
`gradient-landing`, `gradient-signup`, `gradient-onboarding`, `gradient-home`, `gradient-evaluation`, `gradient-timer`, `gradient-verification`, `gradient-golden`, `gradient-dashboard`, `gradient-closet`, `gradient-goals`, `gradient-how-it-works`, `gradient-testimonials`, `gradient-settings`, `gradient-start` (calm; never reuse the timer's escalation classes on `/start`)

### Animation patterns
- Page content enter: `initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}`
- `AnimatePresence` wraps all conditional renders
- Stagger children: `staggerChildren: 0.1`
- Hover: `whileHover={{ scale: 1.02 }}` on buttons/cards
- Pet expressions: 0.5s CSS transition between states
- All animations use `motion/react` (the Motion library)

---

## XP & Leveling System

- Level thresholds: `[0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500]` (L1–L10)
- XP never goes below 0. Levels never decrease.
- `applyXPChange(uid, xpChange, items)` in `db.ts` handles all XP logic for sessions and goals
- `/start` pays `START_XP` (15) inside `commitStartReview` in `start.ts` with the same rules, atomically, once per start
- On level-up: scan ALL items where `unlockLevel <= newLevel`, add new ones to `pet.unlockedItems`

## Items System (`src/lib/items.ts`)

- **15 hats** (beanie, cowboy, party, beret, flower, headband at L1; tophat, wizard, santa at L2; chef, fedora, graduation at L3; baseball, viking at L4; crown at L5)
- **12 clothes** (tshirt, hoodie, bow_tie at L1; vest, scarf, uniform, apron at L2; cape, jacket, raincoat at L3; lab_coat at L4; suit at L6)
- **15 colors** (tan, pink, blue, mint, orange, coral_red at L1; white, gold, lavender at L2; purple, teal at L3; charcoal, polkadot at L4; striped at L5; neon at L7)
- `DEFAULT_UNLOCKED_ITEMS`: all items with `unlockLevel <= 1`
- `ALL_ITEMS`: flat array used by `applyXPChange` for unlock checks

---

## Firestore Data Structure

```
users/{uid}/
  profile/main: { displayName, email, isAnonymous, createdAt, onboardingAnswers[], onboardingComplete }
  pet/main: { name, color, level, xp, equippedHat, equippedClothes, unlockedItems[] }
  sessions/{id}: { taskTitle, contextText, contextImageUrls[], proofImageUrl,
                   proofText, aiTaskDescription, xpReward, xpPenalty, xpChange,
                   approved, completionLevel, aiFeedback, timeEstimate, timeActual,
                   timerStartedAt, status, timestamp, isScreenshottable,
                   commitmentId?, goalTitleSnapshot? }
  commitments/{id}: { title, originalInput, description, verificationMethod,
                      deadline, status, xpReward, xpPenalty, proofImageUrls[],
                      proofText, aiFeedback, approved, createdAt, completedAt?,
                      linkedSessionIds? }
  starts/{id}: { status: 'active'|'done', phase, taskInput, messages[{role,text,imageUrls?}],
                 contextSummary, contextImageUrls[], options[], proposal, agreement{...,version,acceptedAt},
                 deadlineAt (epoch ms), proofText, proofImageUrls[], review{status,observation,quote,next},
                 reviewCount, reviewedAt (epoch ms), calls, xpAwarded, trace[≤20], version, createdAt, updatedAt }
```

`starts` are included in account deletion and data export. "Delete all session history" in Settings leaves starts untouched. Active starts older than 7 days are auto-closed on the next `/start` load.

---

## Known Issues

1. **Abandoned sessions never fail** — `failExpiredSessions()` is exported from `db.ts` but never called from any page. Users who close the browser mid-timer have no cleanup.
2. **Dead code: `AuthProvider.tsx`** — Never imported anywhere. `AppShell.tsx` calls `onAuthStateChanged` directly.
3. **Dead dependencies** — `gsap` (zero imports), `sonner` (zero imports). Settings page has its own inline toast.
4. **Guest → full account upgrade** — `upgradeAnonymousToGoogle()`/`upgradeAnonymousToEmail()` exist in `auth.ts` but no UI triggers them.
5. **No (i) info button** — Spec describes a pulsing coral info button on every screen. Not implemented.
6. **No error boundaries** — Firestore/network errors crash to white screen.
7. **`Downloads/capy-main/`** — 67 git-tracked files from a co-founder's fork. Should be deleted.
8. **Stale docs** — `FILE_TREE.md` and `file_lines.txt` describe outdated state. This `CLAUDE.md` is now the source of truth.
9. **Onboarding still precedes `/start` for landing-funnel users** — 8–9 slides including "Zero excuses", "No cheating", and "your pet loses XP", which contradict the first-step promise. Not yet trimmed or reworded.
10. **Old-product copy elsewhere** — `/how-it-works` ("Race the clock", "Capy Teacher verifies") and Settings › About ("stop procrastinating") still describe the session flow only. See `COPY_AUDIT_SUMMARY.md`.
11. **Legacy routes' model is hardcoded** — the five original AI routes use `claude-sonnet-4-20250514`; only `/api/start/*` reads `CAPY_MODEL`.
12. **Landing testimonials are illustrative** — the three quotes were rewritten to match the first-step promise but are not from real users.

---

## API Routes — Mock Behavior

Both `/api/evaluate` and `/api/verify` check `process.env.ANTHROPIC_API_KEY`:
- **Key set:** Real Claude API call (claude-sonnet-4-20250514) with base64 image conversion
- **Key not set:** Dynamic mock JSON after short delay (800ms evaluate, 1200ms verify)
- Mock evaluate: scales XP by time estimate, references task title
- Mock verify: always approves with `completionLevel: 'full'`

`/api/start/*` behaves differently on purpose:
- Both routes require `Authorization: Bearer <Firebase ID token>` (verified via Identity Toolkit, no Admin SDK) and only accept image URLs from this project's Storage bucket under the caller's own `users/{uid}/` folder.
- **Key not set, guide:** a labelled "(Mock mode)" reply that asks one question, or proposes a step built only from the user's own words. The mock never invents task specifics.
- **Key not set, review:** returns `unable_to_assess` ("Capy can't look at your work until its AI connection is set up"). It never approves. So the `supported` UI, the +15 XP, and the celebration are only reachable with a real key.
- Model calls pass `max_tokens: 8000` (thinking shares that budget on current models) and `output_config.effort` on models that support it. `scripts/start-eval.ts` exercises both prompts live.

---

## Safe Change Rules

1. **Small diffs.** One concern per change. Don't refactor adjacent code "because you're there."
2. **Match existing patterns.** Every page uses the same auth guard, same Motion animation patterns, same Georgia italic headlines. Follow them.
3. **No drive-by reformats.** Don't change indentation, quotes, or import order in files you're not modifying.
4. **Test your changes.** Run `npm run build` at minimum. Check the browser. There are no automated tests.
5. **Update this file** if you change behavior, add routes, modify data structures, or add env vars.
6. **sessionStorage keys** are the contract between pages. Don't rename them without updating all consumers.

---

## Skill Routing

When a request matches one of these patterns, use the corresponding skill instead of improvising:

| Request pattern | Skill |
|----------------|-------|
| "Build...", "Add feature...", "Implement..." | `.claude/skills/build-feature/SKILL.md` |
| "Fix...", "Bug...", "Broken...", "Used to work..." | `.claude/skills/debug-regression/SKILL.md` |
| "Refactor...", "Clean up...", "Reorganize..." | `.claude/skills/refactor-safely/SKILL.md` |
| "Polish...", "UI...", "Looks wrong...", "Spacing..." | `.claude/skills/ui-polish/SKILL.md` |
| "Deploy...", "Ship...", "Ready to merge?", "PR..." | `.claude/skills/deploy-check/SKILL.md` |
| "Update docs...", "Docs are wrong...", "Document..." | `.claude/skills/docs-update/SKILL.md` |

---

## How to Ask (Examples of Good Requests)

```
"Add a toast notification when Firestore operations fail on the timer page.
Acceptance: user sees a sonner toast on network error, timer keeps running,
proof upload retries once. Don't touch other pages."

"The onboarding color picker doesn't show the new colors added to items.ts.
Repro: go through onboarding, only see 6 colors instead of 15.
Expected: all unlockLevel 1 colors visible."

"Polish the dashboard — the expandable cards feel janky on mobile.
Focus on the session cards only, don't redesign the stats sidebar."
```
