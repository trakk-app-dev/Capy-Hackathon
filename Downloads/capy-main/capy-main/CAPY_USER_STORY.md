# CAPY — COMPLETE USER STORY WITH TECHNICAL CITATIONS
## Every function. Every edge case. Every data write. Cross-referenced to build spec.
### If it's not cited, it doesn't exist. If it's flagged 🔴, it needs human review.

---

## HOW TO READ THIS DOCUMENT

Each step cites the source document + line/section:
- **[CLAUDE §Screen X]** = CLAUDE.md, Screen X section
- **[JOURNEY §Moment X]** = CAPY_FINAL_JOURNEY.md, Moment X section
- **✅ COVERED** = fully specified in both docs, ready to build
- **⚠️ MINOR GAP** = small detail missing but won't block build
- **🔴 NEEDS REVIEW** = ambiguity or conflict that could cause bugs

---

## STORY 1: BRAND NEW USER — FULL HAPPY PATH

### Step 1: User lands on capy.app
**What happens:** User sees the landing page. No auth required.

| Element | Spec | Status |
|---------|------|--------|
| Warm mesh gradient background | [CLAUDE §Screen 1, line 305] + [JOURNEY §Moment 1, line 63-66] | ✅ COVERED |
| Floating frosted nav bar with "CAPY" wordmark + "How it works" + "Get Started" | [CLAUDE §Screen 1, line 307] + [JOURNEY §Moment 1, line 68] | ✅ COVERED |
| Capy Teacher illustration above headline | [CLAUDE §Screen 1, line 310] + [JOURNEY §Moment 1, line 70] | ✅ COVERED |
| Headline: "Meet the pet that won't let you procrastinate." | [CLAUDE §Screen 1, line 311] + [JOURNEY §Moment 1, line 71] | ✅ COVERED |
| Subtext: "What do you need to finish today?" | [CLAUDE §Screen 1, line 312] + [JOURNEY §Moment 1, line 72] | ✅ COVERED |
| Frosted glass input with placeholder | [CLAUDE §Screen 1, line 313] + [JOURNEY §Moment 1, line 73] | ✅ COVERED |
| Coral arrow button (gray when empty, coral when text) | [CLAUDE §Screen 1, line 313] + [JOURNEY §Moment 1, line 75] | ✅ COVERED |
| Suggestion text below | [CLAUDE §Screen 1, line 314] + [JOURNEY §Moment 1, line 76] | ✅ COVERED |
| Below fold: 3 steps + pull quote + social proof + CTA + footer | [CLAUDE §Screen 1, lines 316-321] + [JOURNEY §Moment 1, lines 78-82] | ✅ COVERED |

**User types:** "bio essay due friday"
**User clicks submit arrow.**

**Data flow:** Task input stored in React state or query param. Navigate to /signup.
[CLAUDE §Screen 1, line 323]

**Edge case — empty submit:** Shake animation, don't proceed. [CLAUDE §Edge Cases, line 552]

---

### Step 2: Sign Up Page
**What happens:** User creates an account.

| Element | Spec | Status |
|---------|------|--------|
| Split layout: left form, right gradient | [CLAUDE §Screen 2, lines 327-344] + [JOURNEY §Moment 2, lines 90-110] | ✅ COVERED |
| "Sign up with Google" → Firebase signInWithPopup | [CLAUDE §Screen 2, line 334] | ✅ COVERED |
| Email + Password → Firebase createUserWithEmailAndPassword | [CLAUDE §Screen 2, line 336] | ✅ COVERED |
| "Continue as guest" → Firebase signInAnonymously | [CLAUDE §Screen 2, line 338] | ✅ COVERED |
| "Already have an account? Log in" | [CLAUDE §Screen 2, line 339] | ✅ COVERED |
| Right side: lavender gradient + "Make accountability 10x easier." | [CLAUDE §Screen 2, lines 341-343] + [JOURNEY §Moment 2, lines 106-108] | ✅ COVERED |

**User clicks "Sign up with Google."**

**Data flow:** Firebase Auth creates user → create Firestore doc at users/{uid}/profile with initial fields → navigate to /onboarding.
[CLAUDE §Screen 2, line 345] + [CLAUDE §Auth Flow, lines 86-89]

**Edge case — auth failure:** Show error toast, retry. [CLAUDE §Edge Cases, line 563]
**Edge case — email exists:** Show "Already have an account?" [CLAUDE §Screen 2, line 339]

---

### Step 3: Onboarding (9 slides)
**What happens:** User answers 4 questions, sees 2 education slides, picks pet color + name, watches egg hatch.

| Slide | Content | Spec | Status |
|-------|---------|------|--------|
| 1 | "Do you procrastinate?" + 4 options | [CLAUDE §Screen 3, line 357] + [JOURNEY §Slide 1, line 118-119] | ✅ COVERED |
| 2 | "What's your biggest trigger?" + 4 options | [CLAUDE §Screen 3, line 358] + [JOURNEY §Slide 2, line 121-122] | ✅ COVERED |
| 3 | "When are you most productive?" + 4 options | [CLAUDE §Screen 3, line 359] + [JOURNEY §Slide 3, line 124-125] | ✅ COVERED |
| 4 | "How do you feel after procrastinating?" + 4 options | [CLAUDE §Screen 3, line 360] + [JOURNEY §Slide 4, line 127-128] | ✅ COVERED |
| 5 | "Here's how Capy keeps you accountable" — visual flow | [CLAUDE §Screen 3, line 362] + [JOURNEY §Slide 5, line 134-135] | ✅ COVERED |
| 6 | "What makes Capy different" — differentiator | [CLAUDE §Screen 3, line 363] + [JOURNEY §Slide 6, line 137-139] | ✅ COVERED |
| 7 | Egg wobble + color picker + name input | [CLAUDE §Screen 3, line 365] + [JOURNEY §Slide 7, lines 141-144] | ✅ COVERED |
| 8 | EGG HATCHES — crack animation, pet appears | [CLAUDE §Screen 3, line 367] + [JOURNEY §Slide 8, lines 146-149] | ✅ COVERED |
| 9 | "Let's go" + pet visible + big button | [CLAUDE §Screen 3, line 369] + [JOURNEY §Slide 9, line 151-153] | ✅ COVERED |

**User picks "Pastel Pink" and names pet "Mochi". Egg hatches. User clicks "Let's go."**

**Data flow on complete:** Write to Firestore:
- `users/{uid}/profile`: onboardingAnswers (array of 4 strings), onboardingComplete: true
- `users/{uid}/pet`: name: "Mochi", color: "pink", level: 1, xp: 0, equippedHat: null, equippedClothes: null, unlockedItems: ['beanie','cowboy','party','tshirt','hoodie','tan','pink','blue','mint']
[CLAUDE §Screen 3, lines 371-374]

Navigate to /home.

🔴 **NEEDS REVIEW — Color picker scope:** [JOURNEY §Slide 7] says "6-8 color swatches." [CLAUDE §Items data, lines 280-289] defines 8 colors total but only 4 have unlockLevel: 1. **Decision needed:** Does the egg color picker show all 8 (with locked ones grayed out to tease upgrades) or just the 4 unlocked ones? **My recommendation:** Show 6 — the 4 unlocked + 2 locked with "🔒 Lvl 2" indicators. Creates desire to level up from the start.

---

### Step 4: Home Screen
**What happens:** User sees their pet, teacher greeting, and session setup form.

| Element | Spec | Status |
|---------|------|--------|
| Hamburger menu top-left | [CLAUDE §Screen 4, line 383] + [CLAUDE §Global, line 540] + [JOURNEY §Moment 4, line 165] | ✅ COVERED |
| (i) button bottom-left | [CLAUDE §Screen 4, line 384] + [CLAUDE §Global, line 542] | ✅ COVERED |
| LEFT: Capy Teacher upper + Pet lower + name/level/XP | [CLAUDE §Screen 4, lines 386-389] + [JOURNEY §Moment 4, lines 167-171] | ✅ COVERED |
| RIGHT: Task title input + context textarea/upload + time slider + "Start Session" | [CLAUDE §Screen 4, lines 391-395] + [JOURNEY §Moment 4, lines 173-177] | ✅ COVERED |
| Task pre-filled from landing page | [CLAUDE §Screen 4, line 392] + [JOURNEY §Moment 4, line 174] | ✅ COVERED |
| Pet idle animations | [CLAUDE §CapyPet, lines 256-260] + [JOURNEY §Pet Idle, lines 39-46] | ⚠️ MINOR GAP |

⚠️ **MINOR GAP — Pet idle animations:** [JOURNEY §Pet Idle, lines 39-46] lists specific animations: "holds lollipop, lifts arm to lick it" / "holds tiny clock, checks time" / "holds tiny iPad, taps on it." [CLAUDE §CapyPet, lines 256-260] only mentions generic: "eyes drift left and right" / "occasional arm lift" / "expression cycles" / "subtle float/bob." **The lollipop/clock/iPad are character-defining details. Claude Code will use CLAUDE.md which lacks these.** Adding to the user story so the builder sees the full vision, but the actual SVG implementation may need iteration.

**User types "bio essay" in title, pastes rubric text in context area, uploads a screenshot of the assignment, sets time to 30 min, clicks "Start Session."**

**Data flow:**
1. Upload context image to Firebase Storage at `users/{uid}/context/{timestamp}_{filename}` [CLAUDE §Image Upload, lines 93-98]
2. Get download URL
3. Navigate to /session with session data (taskTitle, contextText, contextImageUrls, timeEstimate: 1800) in React state

---

### Step 5: AI Evaluation + XP Preview
**What happens:** Two-phase screen. Teacher evaluates, then presents "the deal."

| Element | Spec | Status |
|---------|------|--------|
| Gradient deepens to peach/amber | [CLAUDE §Screen 5, line 403] + [JOURNEY §Moment 5, line 188] | ✅ COVERED |
| Phase 1: Teacher large + scanning animation + streaming text | [CLAUDE §Screen 5, lines 405-409] + [JOURNEY §Moment 5, lines 190-194] | ✅ COVERED |
| Pet small + nervous in corner | [CLAUDE §Screen 5, line 408] + [JOURNEY §Moment 5 — implied by pet reaction system] | ✅ COVERED |
| 3 second minimum hold | [CLAUDE §Screen 5, line 409] + [JOURNEY §Moment 5, line 190] | ✅ COVERED |
| API call: POST /api/evaluate | [CLAUDE §Screen 5, line 409] + [CLAUDE §API Routes, lines 102-127] | ✅ COVERED |
| Phase 2: "Here's the deal" + XP reward/risk + time + task description | [CLAUDE §Screen 5, lines 411-418] + [JOURNEY §Moment 5, lines 196-208] | ✅ COVERED |
| Time flag warning if unrealistic | [CLAUDE §Screen 5, line 417] + [JOURNEY §Moment 5, line 204] | ✅ COVERED |
| "3... 2... 1... GO" button | [CLAUDE §Screen 5, line 418] + [JOURNEY §Moment 5, line 207] | ✅ COVERED |

🔴 **NEEDS REVIEW — Time validation pushback limit:** [JOURNEY §Moment 5, line 204] specifies "max 2 pushbacks, then auto-accept." [CLAUDE.md] says "If time flagged: teacher note with adjust option" but doesn't specify the 2-pushback limit. **This could cause the AI to push back infinitely. CLAUDE.md needs a note that time validation allows max 2 flags, then accepts.** This is a logic detail the builder needs to implement in the /api/evaluate route.

🔴 **NEEDS REVIEW — API image handling:** [CLAUDE §API /api/evaluate, line 125] says "include [contextImageUrls] as image content blocks in the Claude API call." But these are Firebase Storage download URLs, not base64. **The API route needs to: (1) fetch the image from the Firebase Storage URL, (2) convert to base64, (3) send to Claude API as image content blocks.** This is not explicitly stated and a builder might try to send the URL directly, which won't work. Same issue for /api/verify [line 153].

**User sees: +85 XP reward, -17 XP risk, 30 minutes, AI-generated task description. User clicks "3... 2... 1... GO"**

**Data flow on GO:**
1. Create Firestore session doc at `users/{uid}/sessions/{sessionId}` with all fields from the evaluate response + status: 'active'
[CLAUDE §Screen 5, line 420]

🔴 **NEEDS REVIEW — Session status field:** [CLAUDE §Screen 5, line 420] says "create session document in Firestore (with status: 'active')." But the Firestore schema [CLAUDE lines 47-83] does NOT include a `status` field. **Need to add `status: 'active' | 'completed' | 'failed'` to the session schema.** This field is critical for the session recovery feature (detecting abandoned sessions on login).

**Gradient EXPLODES to maximum heat coral/orange over 1.5s → advance to timer.**
[CLAUDE §Screen 5, line 420] + [JOURNEY §Moment 5, line 209]

---

### Step 6: Timer Session
**What happens:** User races the clock. Pet reacts. User uploads proof.

| Element | Spec | Status |
|---------|------|--------|
| Maximum heat gradient, subtly pulsing | [CLAUDE §Screen 6, line 426] + [JOURNEY §Moment 6, line 216] | ✅ COVERED |
| LEFT TOP: Teacher small + task description | [CLAUDE §Screen 6, lines 429-430] + [JOURNEY §Moment 6, lines 220-222] | ✅ COVERED |
| LEFT MIDDLE: Pet large with expression changes | [CLAUDE §Screen 6, lines 431-434] + [JOURNEY §Moment 6, lines 224-229] | ✅ COVERED |
| Pet >5min: curious. <5min: worried. <1min: PANICKING | [CLAUDE §Screen 6, lines 432-434] + [JOURNEY §Moment 6, lines 227-229] | ✅ COVERED |
| LEFT BOTTOM: Large glowing timer (JetBrains Mono) | [CLAUDE §Screen 6, lines 435-440] + [JOURNEY §Moment 6, lines 231-241] | ✅ COVERED |
| Timer: warm glow, intensifying, red <1min, pulse, overtime | [CLAUDE §Screen 6, lines 437-439] + [JOURNEY §Moment 6, lines 236-240] | ✅ COVERED |
| Overtime: 0:00 → flash → "OVERTIME" → 60s countdown → hard stop | [CLAUDE §Screen 6, line 439] + [JOURNEY §Moment 6, line 240] | ✅ COVERED |
| RIGHT: Premium upload zone (NOT dashed box) | [CLAUDE §Screen 6, lines 443-444] + [JOURNEY §Moment 6, lines 245-249] | ✅ COVERED |
| Non-screenshotable: AI detects, shows textarea | [CLAUDE §Screen 6, line 444] + [JOURNEY §Moment 6, lines 253-258] | ✅ COVERED |
| "Upload from mobile" link | [CLAUDE §Screen 6, line 445] | ✅ COVERED |
| "SUBMIT PROOF" button (disabled until proof added) | [CLAUDE §Screen 6, line 446] + [JOURNEY §Moment 6, lines 260-263] | ✅ COVERED |

**User works for 22 minutes. Takes screenshot. Uploads image. Clicks "SUBMIT PROOF."**

**Data flow on submit:**
1. Upload proof image to Firebase Storage at `users/{uid}/proof/{timestamp}_{filename}`
2. Get download URL
3. Stop timer
4. Record timeActual = 1320 seconds (22 min)
5. Advance to verification
[CLAUDE §Screen 6, line 448]

**Edge case — timer expires no upload:**
- Auto-fail. Update Firestore: approved: false, xpChange: penalty, completionLevel: 'none'
- Pet loses XP in Firestore
- Show failure verification
[CLAUDE §Screen 6, line 449] + [CLAUDE §Edge Cases, line 554]

**Edge case — user closes browser mid-timer:**
- On next login, check for sessions with status: 'active'
- Offer to resume or abandon
[CLAUDE §Edge Cases, lines 560-561]

⚠️ **MINOR GAP — "Upload from mobile" QR code flow:** Both docs mention this link but neither provides technical detail. For MVP, this could be a simple text saying "Take a photo on your phone and upload it here" rather than a full QR code → session sync system. **Recommendation: defer QR code to v2. Just have the link open a file picker optimized for mobile camera.**

---

### Step 7: Verification (4 phases)
**What happens:** Teacher scans proof, announces verdict, shows feedback, pet reacts.

| Phase | Element | Spec | Status |
|-------|---------|------|--------|
| Transition | Hot gradient COOLS to muted warm gray over 1.5s | [CLAUDE §Screen 7, line 455] + [JOURNEY §Moment 7, line 281-283] | ✅ COVERED |
| Phase 1 | Teacher large (~180px) + scanning animation + streaming text + pet nervous | [CLAUDE §Screen 7, lines 457-461] + [JOURNEY §Moment 7, lines 285-292] | ✅ COVERED |
| Phase 1 | 3s minimum hold + API call /api/verify | [CLAUDE §Screen 7, line 461] | ✅ COVERED |
| Phase 2 | APPROVED: golden flash + "✅ APPROVED!" scale bounce | [CLAUDE §Screen 7, lines 463-464] + [JOURNEY §Moment 7, lines 294-295] | ✅ COVERED |
| Phase 2 | NOT APPROVED: muted + "❌ Not quite." | [CLAUDE §Screen 7, line 465] + [JOURNEY §Moment 7, line 295] | ✅ COVERED |
| Phase 2 | 1.5s hold | [CLAUDE §Screen 7, line 463] + [JOURNEY §Moment 7, implied] | ✅ COVERED |
| Phase 3 | Proof image displayed + teacher feedback streaming word-by-word | [CLAUDE §Screen 7, lines 467-470] + [JOURNEY §Moment 7, lines 298-303] | ✅ COVERED |
| Phase 3 | Feedback: 4-6 sentences, SPECIFIC to content | [CLAUDE §Screen 7, line 469] + [JOURNEY §Moment 7, line 301] | ✅ COVERED |
| Phase 3 | "Continue →" button | [CLAUDE §Screen 7, line 470] | ✅ COVERED |
| Phase 4a | APPROVED + LEVEL UP: golden gradient, pet CENTER, SPIN + sparkles + glow + XP flies in | [CLAUDE §Screen 7, lines 474-480] + [JOURNEY §Moment 7, lines 307-316] | ✅ COVERED |
| Phase 4a | "LEVEL UP!" + level change + new unlocks | [CLAUDE §Screen 7, lines 477-478] + [JOURNEY §Moment 7, lines 312-314] | ✅ COVERED |
| Phase 4b | APPROVED no level up: softer gold, pet bounces, XP shown, progress bar | [CLAUDE §Screen 7, lines 482-484] + [JOURNEY §Moment 7, lines 318-321] | ✅ COVERED |
| Phase 4c | NOT APPROVED: muted, pet sad, XP lost in red, teacher encouragement | [CLAUDE §Screen 7, lines 486-489] + [JOURNEY §Moment 7, lines 323-329] | ✅ COVERED |

**User sees: APPROVED. +85 XP. No level up yet (42/100 XP to Level 2). Pet bounces happily.**

**Data flow:**
1. Update Firestore `users/{uid}/pet`: xp += 85 (now 85)
2. Check level thresholds [0, 100, 300...]. 85 < 100, no level up.
3. Update Firestore session: approved: true, xpChange: 85, aiFeedback: "...", completionLevel: 'full', status: 'completed'
[CLAUDE §Screen 7, lines 479-480]

**User clicks "Continue" → navigate to /home.**
[CLAUDE §Screen 7, line 491]

---

### Step 8: Second Session (Returning User)
**What happens:** User is back on home screen. Pet now has 85 XP. Everything loads from Firestore.

**Data flow on mount:**
1. Check auth state (onAuthStateChanged listener)
2. Load `users/{uid}/profile` from Firestore
3. Load `users/{uid}/pet` from Firestore
4. Pet displays with current XP (85), level (1), equipped items (none), color (pink)
[CLAUDE §Screen 4, line 381]

**User starts another session. Gets +45 XP this time. Total: 130 XP. Crosses 100 threshold → LEVEL UP to Level 2.**

**On level up:**
1. pet.level = 2
2. pet.xp = 130
3. Check new unlocks: 'lavender' color (unlockLevel: 2) and 'scarf' (unlockLevel: 2)
4. Add to pet.unlockedItems: push 'lavender', 'scarf'
5. Write to Firestore
[CLAUDE §XP & Leveling, lines 293-297]

**Verification Phase 4 shows:** FULL SCREEN golden gradient. "LEVEL UP!" Pet spins, sparkles, glow. "🔓 Unlocked: Lavender" + "🔓 Unlocked: Scarf"
[CLAUDE §Screen 7, lines 474-480]

---

### Step 9: Closet
**What happens:** User opens hamburger menu → clicks "Closet" → navigates to /closet.

| Element | Spec | Status |
|---------|------|--------|
| Category tabs: Hats / Clothes / Colors | [CLAUDE §Screen 9, line 520] + [JOURNEY §Moment 9, lines 369-372] | ✅ COVERED |
| Left (~50%): Item grid, 4 per row | [CLAUDE §Screen 9, lines 522-525] + [JOURNEY §Moment 9, lines 374-379] | ✅ COVERED |
| Unlocked: full color, hover glow. Locked: grayed + lock + "Lvl X" | [CLAUDE §Screen 9, line 523] + [JOURNEY §Moment 9, lines 376-377] | ✅ COVERED |
| Equipped: coral border + checkmark | [CLAUDE §Screen 9, line 524] + [JOURNEY §Moment 9, line 378] | ✅ COVERED |
| Right (~50%): Pet preview, large, live updates | [CLAUDE §Screen 9, lines 528-531] + [JOURNEY §Moment 9, lines 381-386] | ✅ COVERED |
| "Equip" button | [CLAUDE §Screen 9, line 531] + [JOURNEY §Moment 9, line 386] | ✅ COVERED |

**User taps "Beanie" → pet preview updates live to show beanie → clicks "Equip"**

**Data flow:**
1. Update Firestore `users/{uid}/pet`: equippedHat: 'beanie'
[CLAUDE §Screen 9, line 532]

**User is Level 2. They see:** Beanie ✅, Cowboy ✅, Party ✅, Graduation 🔒 Lvl 3, Crown 🔒 Lvl 5, Baseball 🔒 Lvl 4.

---

### Step 10: Dashboard
**What happens:** User opens hamburger → "Dashboard" → navigates to /dashboard.

| Element | Spec | Status |
|---------|------|--------|
| LEFT (~30%): Pet name, level, XP bar, stats | [CLAUDE §Screen 8, lines 500-501] + [JOURNEY §Moment 8, lines 339-342] | ✅ COVERED |
| Stats: total sessions, success rate %, streak, all-time XP | [CLAUDE §Screen 8, line 501] + [JOURNEY §Moment 8, line 342] | ✅ COVERED |
| RIGHT (~70%): Filter pills + session cards | [CLAUDE §Screen 8, lines 503-510] + [JOURNEY §Moment 8, lines 344-355] | ✅ COVERED |
| Filter: Today / This Week / This Month / All Time | [CLAUDE §Screen 8, line 505] + [JOURNEY §Moment 8, line 345] | ✅ COVERED |
| Card: title + verdict badge + XP change + date | [CLAUDE §Screen 8, line 507] | ✅ COVERED |
| Expandable: context images + proof + AI feedback | [CLAUDE §Screen 8, line 508] + [JOURNEY §Moment 8, lines 348-354] | ✅ COVERED |
| Failed sessions: red left border | [CLAUDE §Screen 8, line 509] + [JOURNEY §Moment 8, line 355] | ✅ COVERED |

**Data flow:**
1. Firestore query: `collection(users/{uid}/sessions).orderBy('timestamp', 'desc')`
2. Calculate stats client-side from session data
[CLAUDE §Screen 8, lines 496-498]

---

## STORY 2: FAILURE PATH — USER DOESN'T UPLOAD PROOF

### Timer reaches 0:00
1. Dramatic flash animation [CLAUDE §Screen 6, line 439]
2. "OVERTIME" text appears [CLAUDE §Screen 6, line 439]
3. 60-second red countdown begins [CLAUDE §Screen 6, line 439] + [JOURNEY §Moment 6, line 240]
4. If overtime expires: hard stop [CLAUDE §Screen 6, line 439]

### Overtime expires with no upload
1. Firestore session updated: approved: false, xpChange: -17, completionLevel: 'none', status: 'failed'
2. Pet XP reduced in Firestore: pet.xp -= 17 (but never below 0)
3. Verification Phase 4c shows: muted gradient, sad pet, XP lost in red
4. Teacher: "That's okay. Mochi believes in you. Try again next session."
[CLAUDE §Screen 7, lines 486-489] + [CLAUDE §Screen 6, line 449]

🔴 **NEEDS REVIEW — XP floor:** Can pet XP go negative? If user has 10 XP and loses 17, is it 0 or -7? **Recommendation: Floor at 0. Never negative.** This isn't specified anywhere.

🔴 **NEEDS REVIEW — Can pet de-level?** If user is Level 2 (threshold: 100 XP) and XP drops from 105 to 88 after a failure, does the pet drop back to Level 1? **Recommendation: No. Levels are permanent. XP bar just shows 88/300 progress toward Level 3.** This isn't specified anywhere.

---

## STORY 3: GUEST USER PATH

1. User clicks "Continue as guest" on sign-up → Firebase signInAnonymously [CLAUDE §Screen 2, line 338]
2. Gets temporary UID, Firestore doc created, full onboarding runs
3. All features work normally — sessions, pet, closet, dashboard
4. **Edge case: Guest tries to access closet** → prompt to create full account [CLAUDE §Edge Cases, line 562]

⚠️ **MINOR GAP:** The "prompt to create full account" for guest + closet is mentioned as an edge case but no screen spec exists for what this prompt looks like. **Recommendation: A simple modal — "Create an account to save your progress and customize Mochi!" with Google + email sign-up, using Firebase anonymous-to-permanent account linking.**

---

## STORY 4: RETURNING USER — SESSION RECOVERY

1. User was in a timer session, closed browser
2. User logs in next time
3. App checks Firestore for sessions with status: 'active' for this user
4. If found: show prompt "You were working on [task] with [X] minutes left. Resume or abandon?"
[CLAUDE §Edge Cases, lines 560-561]

🔴 **NEEDS REVIEW — Resume mechanics:** If user resumes, does the timer restart from where it was? This requires storing `timerStartedAt` timestamp and `timeEstimate` in the session doc, then calculating remaining time on resume. **Not currently in the Firestore schema.** Need to add: `timerStartedAt: timestamp` to session schema.

---

## STORY 5: NON-SCREENSHOTABLE WORK

1. User sets task: "Read chapter 5 of biology textbook"
2. AI evaluation returns `isScreenshottable: false` [CLAUDE §API /api/evaluate, line 121]
3. Timer screen shows textarea instead of image upload [CLAUDE §Screen 6, line 444]
4. Teacher note: "We detected this task can't be screenshotted..." [JOURNEY §Moment 6, lines 255-258]
5. Text requires 100+ characters [JOURNEY §Moment 6, line 257]
6. AI pushes back on vague descriptions [JOURNEY §Moment 6, line 258]

✅ COVERED across both docs.

---

## COMPLETE GAP ANALYSIS

### 🔴 CRITICAL — Must fix before build

| # | Gap | Location | Fix |
|---|-----|----------|-----|
| 1 | **API routes need to fetch images from Firebase URLs and convert to base64 before sending to Claude** | CLAUDE §API Routes | Add explicit step: "In the API route, fetch the image from the Firebase Storage URL using node-fetch, convert response to base64 Buffer, then include as image content block" |
| 2 | **Session status field missing from Firestore schema** | CLAUDE §Firestore Data Structure | Add `status: 'active' \| 'completed' \| 'failed'` to session schema |
| 3 | **XP floor not specified** | Nowhere | Add rule: XP minimum is 0, never negative |
| 4 | **Level permanence not specified** | Nowhere | Add rule: Levels never decrease, only XP within current level can drop |
| 5 | **Time validation 2-pushback limit missing from CLAUDE.md** | CLAUDE §Screen 5 | Add: "If AI flags time as unrealistic, show teacher warning with adjust option. Max 2 flags, then auto-accept" |
| 6 | **timerStartedAt missing from session schema** | CLAUDE §Firestore Data Structure | Add `timerStartedAt: timestamp` for session recovery calculation |

### ⚠️ MINOR — Won't block build but should be noted

| # | Gap | Impact |
|---|-----|--------|
| 7 | Pet idle animations in CLAUDE.md lack the charming details (lollipop, clock, iPad) from Journey | Pet will have generic idle instead of character-defining animations. Can iterate post-build. |
| 8 | "How Capy Works" page has no screen spec | Hamburger menu links to it but no design exists. Can be a simple page with the 3-step flow from landing page. |
| 9 | (i) button content only specified for home screen in CLAUDE.md | Journey had per-screen content for Cale's (i) button. For Capy, need (i) content for: home, timer, evaluation, verification, closet, dashboard |
| 10 | QR code mobile upload flow has no technical spec | Defer to v2. Simple file picker for now. |
| 11 | Guest → full account upgrade flow has no screen spec | Simple modal will suffice. |
| 12 | Color picker on egg (onboarding) — unclear how many to show | Show 6: 4 unlocked + 2 locked as teasers |

---

## FIXED CLAUDE.md PATCHES

I'll apply these fixes to CLAUDE.md now.
