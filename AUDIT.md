# Codebase Audit Report

## 1. What Actually Exists — Implemented and Working

| Route | File | Status |
|---|---|---|
| `/` Landing | `src/app/page.tsx` | Working. Hero, how-it-works, testimonials, CTA, footer, dev reset button. |
| `/signup` | `src/app/signup/page.tsx` | Working. Google/email/guest auth, split layout, sign-in/sign-up toggle. |
| `/onboarding` | `src/app/onboarding/page.tsx` | Working. **2 quiz slides** (not 4), 2 info slides, color picker + name, egg hatch, final. Mobile adds "best on PC" slide. |
| `/home` | `src/app/home/page.tsx` | Working. Pet display, task input, context upload, time slider, goal linking, overdue commitment check. |
| `/evaluate` | `src/app/evaluate/page.tsx` | Working. Scanning → optional context Q&A → deal screen → 3-2-1 countdown. Creates Firestore session on GO. |
| `/timer` | `src/app/timer/page.tsx` | Working. Real `setInterval`, continuous gradient that shifts from warm→deep purple→red, overtime, multi-photo proof upload. Handles page refresh via `timerStartedAt` in sessionStorage. |
| `/verify` | `src/app/verify/page.tsx` | Working. Scanning → verdict → streaming feedback → pet XP reaction. Handles goal-linked sessions. |
| `/dashboard` | `src/app/dashboard/page.tsx` | Working. Two tabs (Sessions + Goals), XP-over-time chart (recharts), time filters, expandable cards, stats (streak, success rate, focus time, trend, categories). |
| `/closet` | `src/app/closet/page.tsx` | Working. Hats/clothes/colors tabs, live pet preview, equip/unequip, inline pet renaming. |
| `/goals` | `src/app/goals/page.tsx` | Working. AI-refined commitments, deadline, urgency colors, inline proof + verification, history. |
| `/settings` | `src/app/settings/page.tsx` | Working. 5 tabs (Account, Preferences, Subscription, Data & Privacy, About). Custom toast, not sonner. |
| `/feedback` | `src/app/feedback/page.tsx` | **Fully built** — text + email + image upload, posts to `/api/feedback`. NOT a stub. |
| `/how-it-works` | `src/app/how-it-works/page.tsx` | **Fully built** — 5-step visual guide with capybara illustrations. NOT a stub. |
| `/privacy` | `src/app/privacy/page.tsx` | Working. Full privacy policy page. |
| `/terms` | `src/app/terms/page.tsx` | Working. Full terms of service page. |

**API routes:**
| Endpoint | File | Real AI + Mock fallback |
|---|---|---|
| `POST /api/evaluate` | `src/app/api/evaluate/route.ts` | Yes — claude-sonnet-4-20250514 with image base64 conversion |
| `POST /api/evaluate/refine` | `src/app/api/evaluate/refine/route.ts` | Yes — chat-style criteria refinement |
| `POST /api/verify` | `src/app/api/verify/route.ts` | Yes — multi-image vision verification |
| `POST /api/commitments` | `src/app/api/commitments/route.ts` | Yes — AI commitment refinement/rejection |
| `POST /api/commitments/refine` | `src/app/api/commitments/refine/route.ts` | Yes — chat-style goal criteria refinement |
| `POST /api/feedback` | `src/app/api/feedback/route.ts` | Exists (nodemailer-based) |

**Components:**
- `CapyTeacher` (143 lines): SVG with glasses, 5 expressions, scanning animation
- `CapyPet` (539 lines): SVG with 6 expressions, layered hat/clothes/color, idle animations
- `AppShell`: Auth guard + desktop sidebar + mobile hamburger
- `AppSidebar`: Desktop rail sidebar (hover to expand)
- `SidebarNav`: Mobile sliding overlay nav
- `CriteriaRefineChat`: Reusable chat widget for refining AI task/goal criteria

**Supporting libs:**
- `items.ts`: 15 hats, 12 clothes, 15 colors (significantly expanded from spec)
- `sounds.ts`: Web Audio API synthesized sounds (hatch, session-start, tick, approved, level-up, failure)
- `db.ts`: Full Firestore CRUD + XP system + commitment lifecycle + `failExpiredSessions` + `failOverdueCommitments`

---

## 2. What's Stubbed or Mocked

**Nothing is stubbed or mocked anymore.** The entire mock layer described in CLAUDE.md has been replaced:

- `src/lib/firebase.ts` — **Real Firebase** initialization (`firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/storage`). Points to project `capy-app-unbanned`.
- `src/lib/auth.ts` — **Real Firebase Auth** (`signInWithPopup`, `createUserWithEmailAndPassword`, etc.). No localStorage mock.
- `src/lib/db.ts` — **Real Firestore** (`getDoc`, `setDoc`, `addDoc`, `getDocs`, `writeBatch`, etc.). No localStorage mock.
- `src/lib/storage.ts` — **Real Firebase Storage** (`uploadBytes`, `getDownloadURL`). No `URL.createObjectURL` mock.

The API routes still have **mock fallbacks** when `ANTHROPIC_API_KEY` is not set — these are working and intentional for local dev without a key.

---

## 3. What's Missing

| Missing Feature | Where it should be | Impact |
|---|---|---|
| **Active session recovery on login** | `src/app/home/page.tsx` | `failExpiredSessions()` exists in `db.ts:241` but is **never called** from any page. Users who close the browser mid-timer have no recovery prompt and no auto-fail. Abandoned sessions stay `status: 'active'` forever. |
| **Guest → full account upgrade UI** | `src/app/closet/page.tsx` or a modal | `upgradeAnonymousToGoogle()` and `upgradeAnonymousToEmail()` exist in `auth.ts:78-93` but no UI triggers them. Anonymous users can access closet with no prompt. |
| **(i) info button** | Every protected page | Spec describes a pulsing coral (i) button on every screen with contextual help text. **Not implemented anywhere.** |
| **`sonner` toast library** | Global | In `package.json` but **never imported or used**. Settings page rolled its own inline toast. Dead dependency. |
| **`gsap` library** | Landing page | In `package.json` but **zero imports anywhere in src/**. 100% dead dependency. CLAUDE.md spec mentions "GSAP cinematic landing page" in git log but motion/framer-motion is used instead. |
| **Zero test files** | Anywhere | No `__tests__`, no `*.test.ts`, no `*.spec.ts`. No testing framework in devDependencies. |
| **No error boundaries** | App-wide | No React error boundary. Firestore/network errors will crash the white screen. |

---

## 4. Drift Between Docs and Reality

### CLAUDE.md claims Firebase is mocked — **it isn't**

This is the single largest doc/code discrepancy. CLAUDE.md § "THE MOCK LAYER" (~30 lines of documentation) describes a localStorage-backed mock system. **Every word of it is wrong for the current state.** The code uses real Firebase with project `capy-app-unbanned`. The "revert to Firebase" instructions are backwards — reverting would break things because you're already on real Firebase.

**Files affected:** `src/lib/firebase.ts:1-22`, `src/lib/auth.ts:1-108`, `src/lib/db.ts:1-447`, `src/lib/storage.ts:1-111`, `src/components/AuthProvider.tsx` (the file exists but is never imported — also a drift).

### CLAUDE.md says 9 onboarding slides with 4 quiz questions — code has 8 (desktop) with 2 quiz questions

- **Doc says slides 1-4 are quiz** (procrastinate?, trigger?, productive time?, feeling after?)
- **Code has 2 quiz questions** (`src/app/onboarding/page.tsx:14-23`): "biggest study struggle" and "what motivates you"
- The original 4 questions are not present
- Mobile adds a "Best on PC" slide making it 9 total on mobile, 8 on desktop

### CLAUDE.md route table says `/evaluate`, but spec body says `/session`

The spec body (Screen 5-7) describes a single `/session` route with three phases. The actual implementation splits these into three separate routes: `/evaluate`, `/timer`, `/verify`. The route table in the "CURRENT STATE BRIEFING" was updated to match code, but the spec body was never updated.

### Items data is massively expanded from spec

- **Spec:** 6 hats, 5 clothes, 8 colors
- **Code (`items.ts`):** 15 hats (added beret, flower, headband, tophat, wizard, santa, chef, fedora, viking), 12 clothes (added bow_tie, vest, uniform, apron, cape, raincoat, lab_coat), 15 colors (added orange, coral_red, white, gold, purple, teal, charcoal)

### `FILE_TREE.md` inaccuracies

- Says "10-slide onboarding quiz" — it's 8/9 slides
- Says "SidebarNav.tsx — Legacy sliding overlay sidebar (unused)" — `AppShell.tsx:107` actively uses it for mobile nav
- Doesn't list: `CriteriaRefineChat.tsx`, `sounds.ts`, `/api/evaluate/refine/`, `/api/commitments/refine/`, `/api/feedback/`, `/privacy`, `/terms`, `/goals`

### CLAUDE.md says feedback + how-it-works are stubs

Both are **fully implemented pages**. Feedback has a form that posts to `/api/feedback` with image upload. How-it-works has a 5-step visual guide with capybara illustrations.

### Session data key names differ

- **Spec:** `capy_session_data`
- **Code:** `capy_session_setup` (`src/app/home/page.tsx:157`, `src/app/evaluate/page.tsx:117`)

### Dashboard filters differ

- **Spec:** "Today / This Week / This Month / All Time"
- **Code (`dashboard/page.tsx:386`):** "All time / This week / This month" — no "Today" filter

### `AuthProvider.tsx` is orphaned

- Listed in CLAUDE.md's architecture as using `MockUser` type
- **Never imported anywhere** — `AppShell.tsx` calls `onAuthStateChanged` directly
- 27 lines of dead code

### Undocumented features in code

| Feature | Location | Not in any .md |
|---|---|---|
| `CriteriaRefineChat` component | `src/components/CriteriaRefineChat.tsx` | Interactive chat to refine AI criteria before session/goal start |
| `sounds.ts` | `src/lib/sounds.ts` | Web Audio synthesized sound effects |
| `recharts` XP chart | `src/app/dashboard/page.tsx:357` | Area chart in dashboard |
| `failExpiredSessions` | `src/lib/db.ts:241` | Session expiry logic (defined but uncalled) |
| Evaluate refine API | `src/app/api/evaluate/refine/route.ts` | Chat refinement endpoint |
| Commitment refine API | `src/app/api/commitments/refine/route.ts` | Chat refinement endpoint |
| `nodemailer` feedback API | `src/app/api/feedback/route.ts` | Email-based feedback submission |
| Privacy + Terms pages | `src/app/privacy/`, `src/app/terms/` | Full legal pages |
| Goal-linked sessions | `evaluate/page.tsx`, `timer/page.tsx`, `verify/page.tsx` | Sessions can link to commitments, carrying goal XP stakes |

---

## 5. Top 5 Risks Before Launch

### 1. Abandoned sessions never fail and never clean up
`failExpiredSessions()` in `db.ts:241` is **never called**. If a user starts a session and closes the browser, that session stays `status: 'active'` in Firestore forever. No XP penalty is applied. No recovery prompt is shown on next login. This undermines the entire accountability model.
**Fix:** Call `failExpiredSessions(uid, ALL_ITEMS)` in `home/page.tsx` on mount, same as `failOverdueCommitments`.

### 2. `.env.local` contains live API keys and email credentials
`C:\Users\realr\OneDrive\capy\.env.local` has a real Anthropic API key, Firebase credentials, and an email password in plaintext. While `.env*` is gitignored, this file lives in OneDrive sync. If anyone accesses this machine or the OneDrive folder, all keys are exposed. The Anthropic key alone could rack up charges.
**Fix:** Rotate all keys. Move secrets to a secrets manager or at minimum verify they never synced.

### 3. No error handling for Firebase operations in page components
Every Firestore call is wrapped in a try/catch that just `console.error`s. There are no user-facing error toasts (sonner is installed but unused). A Firestore permission error, quota limit, or network failure will silently fail, leaving the user confused. The timer page is especially dangerous — if `updateSession` fails when submitting proof, the proof upload succeeds but the session record isn't updated.

### 4. CLAUDE.md is dangerously stale and will mislead the next developer
Any developer (or AI agent) reading CLAUDE.md will believe Firebase is mocked, that feedback/how-it-works are stubs, that there are 9 onboarding slides with 4 quiz questions, and that the session flow uses a single `/session` route. Every one of these is wrong. The "revert to Firebase" instructions would actually break the app.

### 5. No tests, no CI, no type checking in pipeline
Zero test files. No testing framework. `npm run build` is the only quality gate. No CI pipeline visible. TypeScript catches type errors at build time but logic bugs (XP miscalculation, race conditions in timer, concurrent session creation) have no automated coverage.

---

## 6. The 3 Files to Read First

1. **`src/lib/db.ts`** — The heart of the app. Every data type, every Firestore operation, the XP system, level-up logic, commitment lifecycle, session cleanup. Read this to understand what data flows where.

2. **`src/app/evaluate/page.tsx`** — The most complex page. Shows how session data flows from home → evaluate → timer → verify. Contains the AI API call, context Q&A phase, criteria refinement chat, countdown, and Firestore session creation.

3. **`src/components/AppShell.tsx`** — The auth guard and layout wrapper. Shows which routes are public vs. protected, how mobile vs. desktop navigation works, and the auth checking pattern every page follows.
