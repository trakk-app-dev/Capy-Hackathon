@AGENTS.md

--------
## ⚠️ CURRENT STATE BRIEFING (Last updated: 2026-03-28)
### READ THIS SECTION FIRST BEFORE TOUCHING ANYTHING

This section describes the **exact current state** of the codebase as of the date above. Everything below the horizontal rule is the original build specification — read it for requirements, but treat THIS section as ground truth for what has already been built and how it currently works.

---

### WHAT HAS BEEN BUILT (all screens complete)

Every screen described in the spec below is **fully implemented and functional**:

| Screen | Route | Status | Notes |
|--------|-------|--------|-------|
| Landing page | `/` | ✅ Complete | Hero, how-it-works, testimonials, CTA, footer |
| Sign up | `/signup` | ✅ Complete | Google/email/guest auth, split layout, lavender right panel |
| Onboarding | `/onboarding` | ✅ Complete | 9 slides: 4 quiz, 2 info, color picker, egg hatch, final |
| Home | `/home` | ✅ Complete | Pet display, task input, context upload, time slider |
| AI Evaluation | `/evaluate` | ✅ Complete | Scanning → context Q&A → deal screen → countdown |
| Timer | `/timer` | ✅ Complete | Real setInterval, pet reactions, proof upload |
| Verification | `/verify` | ✅ Complete | Scanning → verdict → streaming feedback → pet reaction |
| Dashboard | `/dashboard` | ✅ Complete | Session history, stats, filtering, expandable cards |
| Closet | `/closet` | ✅ Complete | Category tabs, item grid, live pet preview, equip |
| Settings | `/settings` | ✅ Complete | 5-tab layout: Account, Preferences, Subscription, Data & Privacy, About |
| Goals | `/goals` | ✅ Complete | Create AI-refined commitments, active cards with countdown + proof, history |

---

### THE MOCK LAYER (critical to understand)

**Firebase is temporarily inaccessible** (lost Google account). ALL Firebase dependencies have been replaced with a **local mock layer**. The mock layer is a **complete, functional drop-in replacement** — every function signature is identical to the original. When Firebase access is restored, revert 5 files and everything works again.

#### Files in mock mode (revert these to restore Firebase):
```
src/lib/firebase.ts  → empty stub (original: Firebase app initialization)
src/lib/auth.ts      → localStorage-backed mock auth
src/lib/db.ts        → localStorage-backed mock database
src/lib/storage.ts   → URL.createObjectURL() mock storage
src/components/AuthProvider.tsx → uses MockUser type instead of Firebase User
```

#### To revert to real Firebase (when access is restored):
```bash
git checkout src/lib/firebase.ts
git checkout src/lib/auth.ts
git checkout src/lib/db.ts
git checkout src/lib/storage.ts
git checkout src/components/AuthProvider.tsx
```
Zero page/component changes needed.

#### How the mock auth works:
- Auth state stored in `localStorage['capy_auth']` as JSON
- `signInWithGoogle()` → instantly resolves with `{ uid: 'mock-user-1', displayName: 'Test User', email: 'test@capy.app', isAnonymous: false }`
- `signUpWithEmail(email, password)` → resolves with same uid, display name = email prefix
- `signInWithEmail(email, password)` → resolves with same mock user
- `signInAnonymously()` → resolves with `{ uid: 'mock-guest-1', displayName: 'Guest', email: null, isAnonymous: true }`
- `onAuthStateChanged(callback)` → fires callback immediately via `queueMicrotask`, returns unsubscribe fn
- `signOut()` → clears localStorage, fires null to all callbacks
- `MockUser` type exported as `User` alias so existing type imports still compile

#### How the mock database works:
- All user data stored at `localStorage['capy_db_{uid}']` as a JSON blob
- Structure: `{ profile: {...}, pet: {...}, sessions: { [id]: {...} } }`
- Session IDs are random strings generated with `Math.random().toString(36)`
- `Timestamp` is a mock object `{ toDate: () => Date, seconds: number, nanoseconds: number }` — compatible with how pages use `timestamp?.toDate?.()` (dashboard filtering)
- `getAllSessions()` sorts by `timestamp.seconds` descending
- `deleteAccount(uid)` — removes entire user localStorage blob
- `resetPet(uid, defaultItems)` — resets pet to level 1, 0 XP, default unlocks; sets `onboardingComplete: false`
- `deleteAllSessions(uid)` — wipes all sessions, keeps profile + pet
- `exportUserData(uid)` — returns JSON-serializable blob of all user data
- All functions are `async` and return `Promise.resolve()` — behavior is synchronous but API is identical to Firestore

#### User Preferences:
- Stored in `localStorage['capy_preferences']` as JSON (device-local, not in DB)
- Keys: `soundEffects` (default: true), `timerTick` (default: false), `sparkMode` (default: false), `reduceAnimations` (default: false)
- Auto-detects `prefers-reduced-motion` system setting

#### How mock storage works:
- `uploadImage(uid, file, folder)` → returns `URL.createObjectURL(file)`
- Object URLs are valid for the current browser session only
- Images DO NOT persist across page reloads — expected behavior, fine for UI iteration
- Compression logic is preserved and still runs before creating the object URL

#### How mock AI API routes work:
- `/api/evaluate` and `/api/verify` check `process.env.ANTHROPIC_API_KEY` at request time
- **If key IS set**: real Claude API call runs (claude-sonnet-4-20250514) exactly as before
- **If key is NOT set**: returns dynamic mock JSON after a short delay (800ms for evaluate, 1200ms for verify)
- Mock evaluate response: scales xpReward by timeEstimate (more time = more XP), references taskTitle in descriptions
- Mock verify response: always approves with `completionLevel: 'full'`, includes taskDescription in feedback
- The full user flow (evaluate → timer → verify → XP reward → dashboard) works end-to-end with no API key

#### Dev reset button:
- Landing page (`/`) renders a small `🔄 reset mock` button in the **bottom-right corner**
- Only visible when `process.env.NODE_ENV === 'development'`
- Clicking it clears all `capy_*` keys from localStorage and reloads the page
- This simulates a **brand new user** — the next sign-in will go through full onboarding
- Use this to walk through the complete first-time-user experience as many times as needed

---

### ARCHITECTURE OVERVIEW

#### Directory structure:
```
src/
  app/
    page.tsx                 Landing page (public)
    signup/page.tsx          Auth page (public)
    onboarding/page.tsx      9-slide onboarding (requires auth)
    home/page.tsx            Main session setup (requires auth)
    evaluate/page.tsx        AI evaluation phases (requires auth)
    timer/page.tsx           Countdown timer + proof upload (requires auth)
    verify/page.tsx          AI verification + XP reward (requires auth)
    dashboard/page.tsx       Session history + stats (requires auth)
    closet/page.tsx          Pet customization (requires auth)
    goals/page.tsx           Long-term commitments: create, active, proof, history (requires auth)
    feedback/page.tsx        Stub page
    how-it-works/page.tsx    Stub page
    api/
      evaluate/route.ts      POST — evaluates task with Claude, returns XP stakes
      verify/route.ts        POST — verifies proof with Claude vision
      commitments/route.ts   POST — refines user input into verifiable commitment or rejects vague
  lib/
    firebase.ts              ⚠️ STUB — see mock layer above
    auth.ts                  ⚠️ MOCK — see mock layer above
    db.ts                    ⚠️ MOCK — see mock layer above
    storage.ts               ⚠️ MOCK — see mock layer above
    items.ts                 Item definitions (hats, clothes, colors) — REAL, no Firebase
    utils.ts                 Utility functions — REAL, no Firebase
  components/
    CapyTeacher.tsx          SVG capybara teacher with expressions (neutral/thinking/happy/stern/scanning)
    CapyPet.tsx              SVG capybara pet with expressions, hat/clothes layers, idle animations
    AppShell.tsx             Auth guard + hamburger menu wrapper for all protected routes
    AppSidebar.tsx           Sliding sidebar (Home/Closet/Dashboard/How it works/Feedback)
    AuthProvider.tsx         ⚠️ MOCK — React context for auth state, uses MockUser type
    SidebarNav.tsx           Navigation link components inside sidebar
    FeedbackForm.tsx         Feedback form component
    ui/                      shadcn/ui components
```

#### Session flow (data passing between pages):
Data flows between pages via `sessionStorage` (not localStorage). Keys used:
- `capy_pending_task` — task text from landing page, picked up by home page
- `capy_session_data` — full session config (task, context, time, image URLs) passed home → evaluate
- `capy_active_session` — active session ID, passed evaluate → timer → verify
- `capy_timer_result` — `'submitted'` or `'expired'`, passed timer → verify

#### Auth guard pattern:
Every protected page uses this pattern:
```tsx
useEffect(() => {
  const unsub = onAuthStateChanged(async (user) => {
    if (!user) { router.push('/signup'); return; }
    // load data and set state
  });
  return unsub;
}, [router]);
```
`AppShell.tsx` also guards at the layout level.

---

### IMPORTANT IMPLEMENTATION DETAILS

#### Typography:
- Headlines: Georgia, serif, always italic AND bold — applied inline with `style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700 }}`
- Body: `var(--font-body)` (DM Sans) — loaded via `next/font/google` in layout.tsx
- Timer digits: `var(--font-mono)` (JetBrains Mono) — loaded via `next/font/google` in layout.tsx
- NEVER use Inter, Arial, or Roboto

#### Color system (CSS variables in globals.css):
- `--color-coral: #FF7E5F` → `bg-coral`, `text-coral`
- `--color-peach: #FEB47B` → `bg-peach`
- `--color-lavender: #C4A7E7` → `bg-lavender`
- `--color-cream: #FFF8F0` → `bg-cream`
- `--color-near-black: #1E1E2E` → `text-near-black`, `bg-near-black`
- `--color-amber: #FFB347` → `bg-amber`
- `--color-success: #22C55E` → for XP gains
- `--color-failure: #EF4444` → for XP losses

#### Gradient backgrounds (CSS classes in globals.css):
- `.gradient-landing` — coral + peach + lavender pools on warm cream
- `.gradient-signup` — lavender/soft blue (right panel of signup)
- `.gradient-evaluation` — deeper peach/amber
- `.gradient-timer` — maximum heat: deep coral + vibrant orange + amber
- `.gradient-verify` — muted warm gray with spotlight
- `.gradient-celebration` — golden warmth (level-up only)

#### Animation patterns:
- All page content enters with `initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}`
- `AnimatePresence` wraps ALL conditional renders
- Stagger children: `staggerChildren: 0.1` on container variants
- Hover: `whileHover={{ scale: 1.02 }}` on buttons and cards
- Timer glow: CSS `box-shadow` that intensifies via inline style changes on each tick
- Pet transitions: 0.5s CSS transition on the SVG expression changes

#### XP system:
- Levels: `[0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500]` (Level 1–10)
- XP never goes below 0. Levels never decrease.
- `applyXPChange(uid, xpChange, items)` in db.ts handles all XP logic and returns `{ pet, leveledUp, newLevel, newUnlocks }`
- On level-up: scan ALL items where `unlockLevel <= newLevel`, add new ones to `pet.unlockedItems`

#### Items system (`src/lib/items.ts`):
- `HATS`: beanie (L1), cowboy (L1), party (L1), graduation (L3), crown (L5), baseball (L4)
- `CLOTHES`: tshirt (L1), hoodie (L1), scarf (L2), jacket (L3), suit (L6)
- `COLORS`: tan (L1), pink (L1), blue (L1), mint (L1), lavender (L2), polkadot (L4), striped (L5), neon (L7)
- `DEFAULT_UNLOCKED_ITEMS`: items where `unlockLevel === 1` — given to pet on onboarding completion
- `ALL_ITEMS`: flat array of all items, used by `applyXPChange` to check unlocks

#### CapyPet component:
Props: `size: number`, `color: string` (hex), `expression: 'happy'|'curious'|'worried'|'panicking'|'sad'|'celebrating'`, `hat: string|null`, `clothes: string|null`, `animated: boolean`
- SVG with layered z-index: body → color fill → clothes → hat → eyes/mouth
- Color is applied as SVG fill to the body path
- Hat/clothes are separate SVG groups positioned on head/body
- `animated=true`: floating bob, eye drift, occasional arm raise

#### CapyTeacher component:
Props: `size: number`, `expression: 'neutral'|'thinking'|'happy'|'stern'|'scanning'`, `animated: boolean`
- Round capybara with small round GLASSES (two circles — signature feature)
- Gradient fill: coral → peach → lavender
- Scanning animation: eyes narrow/widen rhythmically, slight body rock

---

### KNOWN ISSUES / TODO

1. **Active session recovery** — Home page has a TODO comment for detecting and recovering abandoned sessions on login. `getActiveSessions()` is called but the recovery modal UI is not implemented.
2. **Guest → full account upgrade** — `upgradeAnonymousToGoogle()` and `upgradeAnonymousToEmail()` are implemented in auth.ts but there's no UI to trigger them.
3. **Feedback and how-it-works pages** — These exist but are stubs without real content.
4. **Hamburger menu info button** — The pulsing (i) button is referenced in the spec but may not be fully wired in all screens.

---

### GIT HISTORY (for context)
- `a7928a2` — sudden account suspension (2026-03-21): Firebase replaced with mock layer, build fixed
- `84dab07` — setup-1: initial project scaffolding and lib setup
- `707d6bb` — feat: initial commit — all 9 screens implemented with real Firebase
- `f57cc93` — Initial commit from Create Next App

---

# CAPY — Production Build Specification
## The AI accountability app with a virtual capybara pet.
## THIS IS A REAL APP. Not a demo. Not a prototype. Real users will use this.

Read this ENTIRE document before writing a single line of code. Then build screen by screen, in order. Every screen must be fully functional before moving to the next.

---

## WHAT YOU'RE BUILDING

Capy is a production web app where students upload assignment context, race a timer, upload proof of their work, and an AI capybara teacher verifies if they actually did it. If approved, their virtual capybara pet earns XP and levels up. If they fail, the pet loses XP. Users customize their pet with hats, clothes, and colors they unlock by leveling up. Multiple users can sign up, each with their own account, their own pet, their own history.

---

## TECH STACK — PRODUCTION GRADE

**Framework:** Next.js 14 (app router) + TypeScript + Tailwind CSS
**Animation:** Motion (framer-motion) — for ALL transitions, enter/exit animations, hover interactions, staggered reveals
**UI Components:** shadcn/ui (button, dialog, slider, progress, tabs, tooltip)
**File Upload:** react-dropzone for drag-and-drop image uploads
**Toasts:** sonner for notifications
**AI:** Claude API (claude-sonnet-4-20250514) with vision capability — called via Next.js API routes
**Auth:** Firebase Authentication — Google sign-in + email/password + anonymous guest sessions
**Database:** Cloud Firestore — stores ALL user data: pet info, session history, onboarding answers, equipped items, XP, level
**File Storage:** Firebase Storage — stores uploaded context images and proof images as real files with download URLs
**Hosting:** Vercel (deploy via GitHub)

### Environment Variables (.env.local)
```
ANTHROPIC_API_KEY=your_anthropic_key

NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Firebase Setup Files Needed:
- `src/lib/firebase.ts` — initialize Firebase app, export auth, db (Firestore), storage
- `src/lib/auth.ts` — signInWithGoogle(), signInWithEmail(), signUpWithEmail(), signInAnonymously(), signOut(), onAuthStateChanged listener
- `src/lib/db.ts` — functions for reading/writing user data to Firestore
- `src/lib/storage.ts` — functions for uploading images to Firebase Storage and getting download URLs

### Firestore Data Structure:
```
users/{uid}/
  profile: {
    displayName: string
    email: string | null
    isAnonymous: boolean
    createdAt: timestamp
    onboardingAnswers: string[]
    onboardingComplete: boolean
  }
  pet: {
    name: string
    color: string
    level: number
    xp: number
    equippedHat: string | null
    equippedClothes: string | null
    unlockedItems: string[]
  }
  sessions/{sessionId}: {
    taskTitle: string
    contextText: string
    contextImageUrls: string[]  // Firebase Storage URLs
    proofImageUrl: string | null  // Firebase Storage URL
    proofText: string
    aiTaskDescription: string
    xpReward: number
    xpPenalty: number
    xpChange: number  // actual XP gained or lost
    approved: boolean
    completionLevel: 'full' | 'partial' | 'none'
    aiFeedback: string
    timeEstimate: number  // seconds
    timeActual: number  // seconds
    timerStartedAt: timestamp  // when GO was pressed — for session recovery
    status: 'active' | 'completed' | 'failed'  // for detecting abandoned sessions
    timestamp: timestamp
  }
  commitments/{commitmentId}: {
    title: string               // AI-refined clear task
    originalInput: string       // What the user originally typed
    description: string         // AI-generated verifiable criteria
    verificationMethod: 'photo' | 'text' | 'both'
    deadline: timestamp
    status: 'active' | 'completed' | 'failed'
    xpReward: number
    xpPenalty: number
    proofImageUrls: string[]
    proofText: string
    aiFeedback: string
    approved: boolean
    createdAt: timestamp
    completedAt?: timestamp
  }
```

### XP Rules:
- XP minimum is 0. Pet XP can NEVER go negative. If penalty would drop below 0, set to 0.
- Levels are PERMANENT. If XP drops below the current level's threshold (e.g., Level 2 at 100 XP, XP drops to 88), the pet stays Level 2. Levels never decrease.
- On level up: check ALL items where unlockLevel <= new level, add any new ones to unlockedItems.

### Auth Flow:
- Landing page: no auth required (public)
- Sign up: Firebase Auth creates the user. On success, create the user document in Firestore.
- Guest: Firebase anonymous auth. User gets a temporary UID. Can upgrade to full account later.
- On every app page load: check auth state. If not logged in, redirect to landing. If logged in, load user data from Firestore.
- Pet data, session history, equipped items — ALL read from and written to Firestore. Nothing in localStorage except maybe auth persistence tokens that Firebase handles automatically.

### Image Upload Flow:
1. User selects image via react-dropzone
2. Show local preview immediately (FileReader → base64 for instant display)
3. On session start or proof submit: upload to Firebase Storage at path `users/{uid}/context/{timestamp}_{filename}` or `users/{uid}/proof/{timestamp}_{filename}`
4. Get the download URL back from Firebase Storage
5. Save the download URL to the Firestore session document
6. When displaying images later (dashboard), load from the download URLs

### API Routes:

#### POST /api/evaluate
Called when user starts a session. Evaluates the assignment.

Input body:
```json
{
  "taskTitle": "Bio lab report",
  "contextText": "5-page lab report on enzyme kinetics...",
  "contextImageUrls": ["https://firebase-storage-url/..."],
  "timeEstimate": 1800
}
```

System prompt for Claude:
"You are the Capy Teacher — a nerdy, encouraging capybara who holds students accountable. A student wants to work on their assignment. Evaluate it and respond in JSON ONLY (no markdown, no backticks, just raw JSON):
{
  \"xpReward\": number between 30-150 based on task difficulty and scope,
  \"xpPenalty\": negative number roughly 20% of xpReward,
  \"taskDescription\": \"clear 1-2 sentence description of exactly what they need to complete and what proof to submit\",
  \"isScreenshottable\": true/false (can the result be photographed? false for reading/studying/listening tasks),
  \"timeFlag\": null if the time seems reasonable OR a string message if it seems too long or too short for this task
}"

If contextImageUrls are provided, the API route must FETCH each image from the Firebase Storage URL (using fetch()), convert the response to a base64 Buffer, then include as image content blocks in the Claude API call. You CANNOT pass URLs directly to Claude — it needs base64 image data.

Response: parse the JSON and return it.

#### POST /api/verify
Called when user submits proof. Verifies their work using vision.

Input body:
```json
{
  "taskDescription": "Write the methodology section including enzyme details",
  "proofImageUrl": "https://firebase-storage-url/...",
  "proofText": "",
  "contextText": "5-page lab report on enzyme kinetics...",
  "contextImageUrls": ["https://firebase-storage-url/..."]
}
```

System prompt for Claude:
"You are the Capy Teacher verifying a student's work. They were supposed to: [taskDescription].

Look at their uploaded proof carefully. Respond in JSON ONLY (no markdown, no backticks, just raw JSON):
{
  \"approved\": true/false,
  \"completionLevel\": \"full\" or \"partial\" or \"none\",
  \"feedbackText\": \"4-6 sentences. Reference SPECIFIC things you can see in their proof. If approved: be encouraging, specific, validating. If not approved: be honest but kind. Always mention what they DID do, even if incomplete.\"
}"

Include the proof image as an image content block — the API route must FETCH the image from the Firebase Storage URL, convert to base64 Buffer, then include. Same for context images. You CANNOT pass URLs directly to Claude.

Response: parse the JSON and return it.

---

## THE AESTHETIC — USE THE FRONTEND-DESIGN SKILL

Before coding ANY screen, commit to Capy's bold aesthetic direction:

**Purpose:** AI accountability app for students. Must feel premium, warm, alive, emotionally engaging.
**Tone:** Organic/natural warmth × playful gamification × luxury quality. NOT corporate SaaS. NOT generic productivity. NOT childish pixel art.
**Differentiation:** Two capybara characters with real personality. No other productivity app has this.

### Typography
- Headlines: Georgia, serif — ALWAYS italic, ALWAYS bold. The editorial signature.
- Body: DM Sans (import via next/font/google). Light to regular weight. NEVER Inter, Arial, Roboto.
- Timer: JetBrains Mono (import via next/font/google). Extra bold.
- Caps labels: DM Sans, weight 600, letter-spacing 0.15em, uppercase.
- NEVER the same font for headlines and body.

### Colors
VIBRANT and WARM. Barely any neutral space. Every background has gradient warmth.

- Coral: #FF7E5F — primary energy, buttons, accents. DOMINATES.
- Peach: #FEB47B — warm secondary
- Lavender: #C4A7E7 — cool contrast, sign-up page
- Warm Amber: #FFB347 — XP, rewards, celebration
- Near-black: #1E1E2E — text, primary buttons (NOT pure #000)
- Warm cream: #FFF8F0 — base "white" (NEVER use pure #fff anywhere)
- Success green: #22C55E
- Failure red: #EF4444

### Gradient Backgrounds (layered radial gradients per screen)
Each screen has a DISTINCT emotional gradient:
- Landing/Home: warm inviting — coral + peach + lavender pools on warm cream
- Sign-up right side: lavender/soft blue
- Onboarding: gentle warmth building
- AI Evaluation: deeper peach/amber, something is about to happen
- Timer: MAXIMUM HEAT — deep coral, vibrant orange, amber saturating everything
- Verification scanning: muted warm gray, quiet, spotlight
- Celebration/level-up: GOLDEN warmth — appears ONLY here
- Dashboard/Closet: softer, warm cream with subtle accents, content-focused

### Animation System — NO HARD CUTS EVER
- Screen transitions: gradient shifts 1.2-1.5s CSS transition. Content fades out with Motion, new content fades in.
- Content enters: translateY(20px) → 0, opacity 0 → 1, 0.5s ease-out (Motion animate)
- Content exits: translateY(0) → -10px, opacity 1 → 0, 0.4s (Motion exit)
- AI text: streams word by word, Motion staggerChildren ~30ms per word
- ALL buttons: hover scale(1.02-1.04) + color deepens + shadow appears, transition 150ms
- ALL cards: hover translateY(-2px) + shadow deepens, transition 200ms
- ALL inputs: focus border shifts to coral + subtle glow, transition 200ms
- Upload zone: dragover makes border solid + background brightens
- (i) button: pulsing coral glow, box-shadow animation infinite 2.5s
- Timer glow: pulsing box-shadow that intensifies and reddens as time drops
- Pet expressions: smooth 0.5s CSS transition between emotional states
- Page loads: staggered reveal, elements fade in with 100ms delays
- Use Motion's AnimatePresence for EVERY screen transition

Timing: hovers 150ms, micro-interactions 200ms, content 400-500ms, screens 600-800ms, gradients 1200-1500ms, dramatic moments 2000-3500ms.

### Anti-Slop Rules
NEVER: pure white backgrounds, pure black text, Inter/Arial/Roboto, purple gradients on white, three-card grids, default browser form elements, flat lifeless pages, cookie-cutter layouts, predictable component patterns, dashed-border upload boxes, hard cuts between screens.

ALWAYS: warm tinted backgrounds, layered gradient meshes, Georgia italic headlines, generous whitespace, rounded-2xl corners, soft shadows, frosted glass effects where appropriate, smooth transitions, hover effects on EVERYTHING interactive.

---

## TWO CAPYBARA CHARACTERS — Build as Reusable React Components

### CapyTeacher Component
Props: size, expression ('neutral' | 'thinking' | 'happy' | 'stern' | 'scanning'), animated (boolean)

Build as SVG:
- Round/oval body (capybara silhouette — rounded rectangle with small ears on top)
- Small round glasses (TWO circles on the face — this is the signature)
- Warm gradient fill: coral → peach → lavender
- Simple dot eyes behind glasses, small nose, simple mouth that changes per expression
- Optional: tiny pointer stick or clipboard accessory
- Expression changes: mouth shape, eye shape, eyebrow position
- Scanning animation: eyes narrow and widen rhythmically, slight body rock (CSS animation)
- Thinking animation: eyes look up and to the side, one eyebrow raised

### CapyPet Component
Props: size, color, expression ('happy' | 'curious' | 'worried' | 'panicking' | 'sad' | 'celebrating'), hat (string | null), clothes (string | null), animated (boolean)

Build as SVG with layered z-index:
- Base layer: round/oval body shape, SIMPLER than teacher, cuter, no glasses
- Color layer: fill with user-selected color (applied to body path)
- Clothes layer: SVG group positioned on body area. Each clothing item is a separate SVG path/group.
- Hat layer: SVG group positioned on head area. Each hat is a separate SVG path/group.
- Eyes: large, round, expressive. Position changes for expressions.
- Mouth: simple curve that changes per expression.
- Arms: small, can animate (raise up for panicking, wave for celebrating)

Expression states:
- happy: big eyes, smile, slight upward tilt
- curious: wide eyes, slight head tilt, neutral mouth
- worried: eyes angled down, small mouth, eyebrows up
- panicking: HUGE eyes, mouth open, arms raised, slight shake animation
- sad: eyes half-closed, downturned mouth, drooping posture
- celebrating: sparkle eyes (star shapes), huge smile, bouncing animation, arms up

Idle animations (when animated=true):
- Eyes drift left and right (CSS animation, 4s infinite)
- Occasional arm lift (every 6s, CSS keyframes)
- Facial expression cycles between happy and curious (every 8s)
- Subtle float/bob (translateY ±3px, 3s infinite ease-in-out)

### Accessory Items Data Structure:
```typescript
const ITEMS = {
  hats: [
    { id: 'beanie', name: 'Beanie', unlockLevel: 1, svg: '...' },
    { id: 'cowboy', name: 'Cowboy Hat', unlockLevel: 1, svg: '...' },
    { id: 'party', name: 'Party Hat', unlockLevel: 1, svg: '...' },
    { id: 'graduation', name: 'Graduation Cap', unlockLevel: 3, svg: '...' },
    { id: 'crown', name: 'Crown', unlockLevel: 5, svg: '...' },
    { id: 'baseball', name: 'Baseball Cap', unlockLevel: 4, svg: '...' },
  ],
  clothes: [
    { id: 'tshirt', name: 'T-Shirt', unlockLevel: 1, svg: '...' },
    { id: 'hoodie', name: 'Hoodie', unlockLevel: 1, svg: '...' },
    { id: 'scarf', name: 'Scarf', unlockLevel: 2, svg: '...' },
    { id: 'jacket', name: 'Jacket', unlockLevel: 3, svg: '...' },
    { id: 'suit', name: 'Suit & Tie', unlockLevel: 6, svg: '...' },
  ],
  colors: [
    { id: 'tan', name: 'Default Tan', unlockLevel: 1, hex: '#D2B48C' },
    { id: 'pink', name: 'Pastel Pink', unlockLevel: 1, hex: '#FFB6C1' },
    { id: 'blue', name: 'Sky Blue', unlockLevel: 1, hex: '#87CEEB' },
    { id: 'mint', name: 'Mint Green', unlockLevel: 1, hex: '#98FB98' },
    { id: 'lavender', name: 'Lavender', unlockLevel: 2, hex: '#C4A7E7' },
    { id: 'polkadot', name: 'Polka Dot', unlockLevel: 4, hex: 'pattern' },
    { id: 'striped', name: 'Striped', unlockLevel: 5, hex: 'pattern' },
    { id: 'neon', name: 'Neon Green', unlockLevel: 7, hex: '#39FF14' },
  ],
}
```

### XP & Leveling
XP assigned by AI (30-150 range per task). On failure, lose ~20% of potential reward.
Level thresholds: [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500]
XP bar shows progress between current and next threshold.
On level up: check which new items are unlocked, add to user's unlockedItems array in Firestore.

---

## SCREENS — BUILD IN THIS EXACT ORDER

### SCREEN 1: LANDING PAGE (Public, no auth required)

Full viewport height hero over warm mesh gradient background (layered radial gradients — coral, peach, lavender pools on warm cream base).

**Floating frosted nav bar** near top: pill-shaped container (rounded-full, bg-white/80, backdrop-blur-md, subtle shadow), horizontally centered with margin. Inside: "CAPY" wordmark + small capybara icon left, "How it works" center link, "Get Started" coral button right.

**Hero centered content:**
- Capy Teacher illustration (medium, ~100px), friendly expression
- Georgia italic bold headline (~2.75rem): "Meet the pet that won't let you procrastinate."
- Body text subtext: "What do you need to finish today?"
- Frosted glass input (bg-white/70, backdrop-blur-sm, rounded-2xl, shadow-lg). Textarea with placeholder "I need to finish my bio essay..." Coral arrow submit button (disabled gray when empty, coral when text).
- Tiny muted suggestions: "Try: 'Stats homework' · 'English assignment' · 'Study for exam'"

**Below fold (scroll):**
- "How Capy works" section — Georgia italic heading + coral accent. Three steps in visually distinct cards (NOT identical grid): "Upload your assignment" → "Race the clock" → "Capy checks your proof"
- Pull quote: "Other apps trust you. Capy doesn't." Georgia italic, muted.
- Social proof: "Trusted by students at Stanford · MIT · UCLA · NYU" + 2-3 testimonial cards
- CTA section: warm coral gradient block, "Ready to stop procrastinating?" white Georgia italic, "Get Started — it's free" button
- Footer: minimal, "© 2026 Capy" + links

On submit → navigate to /signup, pass task input via query param or state.

---

### SCREEN 2: SIGN UP PAGE (/signup)

Split layout.

**Left (~45%):** Clean warm cream background.
- "CAPY" coral caps wordmark
- "Create your account" bold sans-serif heading
- "Sign up with Google" button → calls Firebase signInWithPopup(GoogleAuthProvider)
- OR divider
- Email input + Password input → calls Firebase createUserWithEmailAndPassword
- "Sign Up" button (near-black)
- "Continue as guest" → calls Firebase signInAnonymously
- "Already have an account? Log in" → shows login variant (signInWithEmailAndPassword)

**Right (~55%):** Lavender/soft blue gradient.
- Georgia italic large white text: "Make accountability 10x easier."
- Capy Teacher small

On successful auth: create user document in Firestore (if new user) → navigate to /onboarding.

---

### SCREEN 3: ONBOARDING (/onboarding — requires auth)

Check: if user's profile.onboardingComplete === true, redirect to /home.

9 slides with progress bar at top. Smooth Motion transitions between slides.

**Slides 1-4:** Quiz questions (stacked option cards, selected fills coral + white text, "Continue" button disabled until selection). Save each answer to state.

Slide 1: "Do you procrastinate?" — "Yes, definitely" / "Yeah, more than I'd like" / "Sometimes" / "Not really"
Slide 2: "What's your biggest trigger?" — "My phone" / "I just can't start" / "I get overwhelmed by big tasks" / "I wait until the last minute"
Slide 3: "When are you most productive?" — "Morning" / "Afternoon" / "Night" / "Whenever the deadline is tomorrow"
Slide 4: "How do you feel after procrastinating?" — "Guilty" / "Stressed" / "I don't care until it's too late" / "All of the above"

**Slide 5:** "Here's how Capy keeps you accountable" — 4 step visual with icons
**Slide 6:** "What makes Capy different" — "Other apps trust you. Capy doesn't." Bold, centered.

**Slide 7:** Egg with wobble animation. Color picker (6-8 swatches). "Name your Capy" text input (placeholder: "Mochi"). Egg changes color on selection.

**Slide 8:** EGG HATCHES — crack animation, pet appears in chosen color. "Meet [name]!" Celebration animation. The pet does a happy bounce.

**Slide 9:** "Let's go" with the pet visible. Big button.

On complete: write to Firestore:
- users/{uid}/profile: { onboardingAnswers, onboardingComplete: true }
- users/{uid}/pet: { name, color, level: 1, xp: 0, equippedHat: null, equippedClothes: null, unlockedItems: ['beanie','cowboy','party','tshirt','hoodie','tan','pink','blue','mint'] }

Navigate to /home.

---

### SCREEN 4: HOME (/home — requires auth)

Load user profile and pet data from Firestore on mount.

**Hamburger menu** top-left → slides in sidebar: Home, Closet, Dashboard, How Capy Works, Feedback link. Smooth 300ms slide.
**(i) button** bottom-left → modal: "Upload your assignment details and set a timer. Capy Teacher evaluates the task and holds you accountable."

**LEFT SIDE (~42%):**
- Capy Teacher upper area, speech: "Ready to start a session?" (or dynamic greeting)
- User's Pet lower area — LARGE, idle animations running, wearing equipped items, showing current color
- Pet name + Level + XP progress bar

**RIGHT SIDE (~58%):**
- "What are you working on?" text input (pre-filled if came from landing page)
- "Upload as much context as possible" textarea + image upload (react-dropzone, multiple images allowed)
- Time slider: 10/20/30/45/60/90/120 min stops + "Custom" button for free input
- "Start Session" button — disabled until title + time set

On Start Session: upload context images to Firebase Storage → get URLs → navigate to /session with session data in state.

---

### SCREEN 5: AI EVALUATION + XP PREVIEW (/session — phase 1)

**Transition:** Gradient deepens from home warmth to deeper peach/amber over 1.2s.

**Phase 1 — Scanning (3s minimum):**
- Capy Teacher LARGE, centered, scanning animation
- "Capy Teacher is evaluating your assignment..." streaming word by word
- Pet small in corner, nervous
- Call POST /api/evaluate with task data. Wait for response. Hold minimum 3 seconds even if API is fast.

**Phase 2 — The Deal (fades in):**
- "Here's the deal." bold heading from teacher
- XP reward: large green (+85 XP)
- XP risk: red (-17 XP)
- Time: "30 minutes"
- Task description in warm card: AI-generated exact requirements
- If time flagged: teacher note with adjust option. MAX 2 TIME FLAGS — if user insists twice, auto-accept their time.
- "3... 2... 1... GO" dramatic button

On GO: create session document in Firestore (with status: 'active') → gradient explodes hot → advance to timer phase.

---

### SCREEN 6: TIMER SESSION (/session — phase 2)

**Background:** MAXIMUM HEAT gradient. Subtly pulses.

**LEFT (top to bottom):**
- TOP: Capy Teacher small + task description text — always visible
- MIDDLE: Pet LARGE, animated reactions:
  - >5 min: curious, idle
  - <5 min: worried, fidgeting
  - <1 min: PANICKING, shaking, arms up
  - Smooth 0.5s transitions between states
- BOTTOM: Timer — LARGE GLOWING monospace digits.
  - Real setInterval(1000) countdown
  - Warm glow (box-shadow) pulsing, intensifying as time drops
  - <1 min: red glow, red digits, timer PULSES (scale animation)
  - 0:00: flash → "OVERTIME" → 60s red countdown → hard stop
  - Thin progress bar below

**RIGHT:**
- Upload zone (premium design — warm background, rounded-2xl, clean icon, NOT ugly dashed box)
  - If AI flagged isScreenshottable=false: show textarea instead/alongside
- "Upload from mobile" link
- "SUBMIT PROOF" button (disabled until proof added, glowing when ready)

On SUBMIT: upload proof image to Firebase Storage → get URL → stop timer → advance to verification.
On overtime expire: update Firestore session with approved:false, xpChange: penalty → pet loses XP in Firestore → show failure verification.

---

### SCREEN 7: VERIFICATION (/session — phase 3)

**Transition:** Hot gradient COOLS to muted warm gray over 1.5s.

**Phase 1 — Scanning (3s, auto-animated):**
- Teacher LARGE (~180px), scanning animation
- "Capy Teacher is checking your work..." streaming
- Pet small, nervous
- Call POST /api/verify with proof image URL + task data

**Phase 2 — Verdict (auto, 1.5s hold):**
- APPROVED: golden flash, "✅ APPROVED!" scale-up bounce animation
- NOT APPROVED: muted, "❌ Not quite."

**Phase 3 — Breakdown (user clicks Continue):**
- Uploaded proof image displayed in clean frame
- Teacher feedback streaming word by word, 4-6 sentences, SPECIFIC to uploaded content
- "Continue →" button

**Phase 4 — Pet Reaction (auto-animated):**

APPROVED + LEVEL UP:
- Golden gradient (ONLY here). Pet CENTER, LARGE.
- SPIN animation + sparkles + glow + XP flies in (+85 XP green)
- "LEVEL UP!" + level change shown
- New unlocks: "🔓 Unlocked: Cowboy Hat!"
- Update Firestore: pet.xp, pet.level, pet.unlockedItems
- Update Firestore session: approved:true, xpChange, aiFeedback

APPROVED, NO LEVEL UP:
- Softer gold. Pet bounces. XP shown. Progress bar.
- Update Firestore same as above.

NOT APPROVED:
- Muted. Pet sad. XP lost in red.
- Teacher: "That's okay. [petName] believes in you."
- Update Firestore with failure data.

"Continue" → navigate to /home.

---

### SCREEN 8: DASHBOARD (/dashboard — requires auth)

Load all sessions from Firestore: users/{uid}/sessions, ordered by timestamp desc.
Calculate stats from session data: total count, success count, streak, total XP.

**LEFT (~30%) — Stats:**
- Pet name, level, XP bar
- Total sessions, success rate %, current streak, all-time XP

**RIGHT (~70%) — Session Log:**
- Filter pills: Today / This Week / This Month / All Time
- Session cards (reverse chronological). Each shows:
  - Task title, verdict badge (green ✅ / red ❌), XP change, date
  - Expandable: click reveals context images (loaded from Firebase Storage URLs), proof image, AI feedback text
  - Failed = red left border
- "Start New Session" button

Hamburger menu + (i) button present.

---

### SCREEN 9: CLOSET (/closet — requires auth)

Load pet data from Firestore.

**Top:** Category tabs: 🎩 Hats | 👕 Clothes | 🎨 Colors. Smooth underline indicator.

**Left (~50%) — Item Grid:**
- 4 per row. Unlocked: full color, hover glow. Locked: grayed + lock icon + "Lvl X".
- Equipped: coral border + checkmark.
- Tap to preview on pet (right side updates live).

**Right (~50%) — Pet Preview:**
- Pet LARGE, wearing current + preview item
- Name, level, XP bar
- "Equip" button

On equip: update Firestore pet.equippedHat / pet.equippedClothes.

Hamburger menu + (i) button present.

---

## GLOBAL ELEMENTS (all in-app screens)

**Hamburger menu (top-left):** On click → sidebar slides in (Motion, 300ms). Sections: Home, Closet, Dashboard, How Capy Works, Give Feedback. Click outside or X to close.

**(i) button (bottom-left, fixed):** Pulsing coral glow circle. Click → modal with contextual help for current screen.

**(i) content per screen:**
- Home: "Upload your assignment details and set a timer. Capy Teacher evaluates the task and holds you accountable."
- AI Evaluation: "Capy Teacher is analyzing your assignment to set fair XP stakes. The harder the task, the more XP you can earn — but the more you risk losing."
- Timer: "The countdown triggers your brain's focus chemical — norepinephrine. It's the same thing that makes you productive the night before a deadline. Capy creates that focus on demand."
- Verification: "The knowledge that Capy Teacher will check your work changes how you work. It's called social facilitation — even the perception of being observed improves performance."
- Dashboard: "Your complete history. Green means you delivered. Red means you didn't. No hiding from the record."
- Closet: "Level up by completing sessions to unlock new hats, clothes, and colors for your pet."

**Auth guard:** Every /home, /session, /dashboard, /closet page checks auth state on mount. If not authenticated, redirect to landing page.

**Loading states:** Show skeleton screens or the Capy Teacher with a "Loading..." animation while Firestore data loads. Never show a blank white page.

---

## EDGE CASES TO HANDLE

- Empty context upload → teacher nudges but doesn't block
- BS/irrelevant context → AI will note it in evaluation
- Timer expires no upload → automatic failure, pet loses XP, saved to Firestore
- Very short time (<5 min) → teacher warning but allows
- Very long time (>3 hours) → teacher pushes back twice, then accepts
- Non-screenshotable task → AI detects, shows text input for evidence
- Unrelated proof image → AI catches during verification
- Large image files → compress client-side before uploading to Firebase Storage (max 5MB)
- User refreshes mid-session → session data should be recoverable from Firestore (session doc has status: 'active')
- User closes browser mid-timer → on next login, check for active sessions, offer to resume or abandon
- Anonymous user tries to access closet → prompt to create full account
- Network error during API call → show friendly error toast, retry button
- Firebase quota exceeded → graceful error handling

---

## THE PREMIUM TEST

Before any screen is done, ask: "Would a design-conscious college student pay for this and screenshot it to show their friends?" If it looks like a template, a developer designed it, or AI generated it — add more warmth, animation, personality, vibrant color, and rounded corners.

Every surface: WARM and ALIVE. No flat dead spaces. No cold whites. No sharp edges. No browser defaults.

This is a REAL product that REAL people will use. Build it like you're proud of it. 🐹
