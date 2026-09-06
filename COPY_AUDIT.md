# Capy Copy Audit — Full Map
Generated: 2026-04-16
Total copy entries found: 273 (sequential `### Entry n` records) + Sections 7–16 file-level inventories for remaining literals
Tag breakdown (counted on **Tag:** lines in Sections 1–6 + Section 5 entries): 🟢 9 | 🟡 263 | 🔴 12
Secondary flags (occurrences in **Tag:** lines): 🎯 12 | ⚠️ 11
Files scanned: 43 under `src/`; excluded `Downloads/capy-main/`

**Scope:** Canonical `src/` only. **Excluded:** `Downloads/capy-main/` (duplicate fork). **Also scanned:** [`src/app/layout.tsx`](src/app/layout.tsx) metadata, [`public/`](public/) SVGs (no user-facing prose).

**Note:** Entries are numbered sequentially. Section 5 includes **full verbatim** system prompt bodies extracted from source.

## Table of Contents
1. Marketing / Landing
2. Paywall & Pricing
3. Authentication & Onboarding
4. Session Flow (Pre-session, Active, Post-session, Verdict)
5. AI System Prompts (Capy Teacher, Verification, Evaluation)
6. Pet & Closet
7. Dashboard & Stats
8. Modals & Overlays
9. Toasts & Notifications
10. Error States
11. Empty States
12. Loading States
13. Settings & Profile
14. Legal & Support Microcopy
15. Transactional (Emails, etc.)
16. SEO / Meta / Alt Text

---

## Section 1: Marketing / Landing

### Entry 1
- **Copy:** "Capy"
- **Location:** `src/app/page.tsx:59`
- **Context:** Landing nav logo label
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Short brand wordmark; functional.

### Entry 2
- **Copy:** "How it works"
- **Location:** `src/app/page.tsx:64`
- **Context:** Landing nav anchor
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Utility navigation.

### Entry 3
- **Copy:** "Get Started"
- **Location:** `src/app/page.tsx:72`
- **Context:** Landing nav CTA button
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Generic CTA; acceptable.

### Entry 4
- **Copy:** "Meet the pet that won't let you procrastinate."
- **Location:** `src/app/page.tsx:102`
- **Context:** Landing hero H1
- **Tag:** 🔴 OFF-BRAND 🎯 HIGH-LEVERAGE
- **Why tagged:** Frames user identity around procrastination and external control vs systems/self-trust thesis.

### Entry 5
- **Copy:** "What do you need to finish today?"
- **Location:** `src/app/page.tsx:113`
- **Context:** Landing hero subhead
- **Tag:** 🟢 IDENTITY-ALIGNED 🎯 HIGH-LEVERAGE
- **Why tagged:** Task-forward, low shame; invites specificity.

### Entry 6
- **Copy:** "I need to finish my bio essay..."
- **Location:** `src/app/page.tsx:131`
- **Context:** Landing hero textarea placeholder
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Example task; fine.

### Entry 7
- **Copy:** "Try: "
- **Location:** `src/app/page.tsx:162`
- **Context:** Landing suggestions prefix (with example fragments in spans)
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Micro-hint UI.

### Entry 8
- **Copy:** "Stats homework"
- **Location:** `src/app/page.tsx:162`
- **Context:** Landing suggestion example (inner span)
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Example string.

### Entry 9
- **Copy:** "English assignment"
- **Location:** `src/app/page.tsx:162`
- **Context:** Landing suggestion example
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Example string.

### Entry 10
- **Copy:** "Study for exam"
- **Location:** `src/app/page.tsx:162`
- **Context:** Landing suggestion example
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Example string.

### Entry 11
- **Copy:** "How Capy works"
- **Location:** `src/app/page.tsx:178`
- **Context:** Landing mid-page section H2
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Section title.

### Entry 12
- **Copy:** "01"
- **Location:** `src/app/page.tsx:186`
- **Context:** How it works card step label source (displayed as Step 01)
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Step numbering.

### Entry 13
- **Copy:** "Upload your assignment"
- **Location:** `src/app/page.tsx:187`
- **Context:** How it works card title
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Functional step title.

### Entry 14
- **Copy:** "Paste a rubric, screenshot the instructions, or just describe what you need to finish. Capy Teacher evaluates it and sets the stakes."
- **Location:** `src/app/page.tsx:188`
- **Context:** How it works card body
- **Tag:** 🟢 IDENTITY-ALIGNED
- **Why tagged:** Explains proof + stakes without moralizing user.

### Entry 15
- **Copy:** "Race the clock"
- **Location:** `src/app/page.tsx:193`
- **Context:** How it works card title
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Mechanics title.

### Entry 16
- **Copy:** "A dramatic countdown timer puts your brain into focus mode. Your pet watches nervously — don't let them down."
- **Location:** `src/app/page.tsx:194`
- **Context:** How it works card body
- **Tag:** 🔴 OFF-BRAND ⚠️ CHARACTER DRIFT
- **Why tagged:** Pet framed as emotional pressure + guilt; conflates pet with judgment.

### Entry 17
- **Copy:** "Capy checks your proof"
- **Location:** `src/app/page.tsx:199`
- **Context:** How it works card title
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Accurate mechanic name.

### Entry 18
- **Copy:** "Upload a screenshot of your work. Our AI teacher verifies you actually did it. No faking. Your pet earns XP when you deliver."
- **Location:** `src/app/page.tsx:200`
- **Context:** How it works card body
- **Tag:** 🟡 NEUTRAL ⚠️ CHARACTER DRIFT
- **Why tagged:** Proof thesis strong; “your pet earns XP” mixes pet into reward agent (minor drift).

### Entry 19
- **Copy:** "Step "
- **Location:** `src/app/page.tsx:215`
- **Context:** How it works step prefix in UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Template prefix combined with step number in JSX.

### Entry 20
- **Copy:** "Students love Capy"
- **Location:** `src/app/page.tsx:255`
- **Context:** Testimonials section H2
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Social proof heading; mild marketing fluff.

### Entry 21
- **Copy:** "I literally finished my AP Bio lab report in one sitting for the first time ever. The timer thing actually works — when Mochi was panicking at 2 minutes left, I couldn't stop working."
- **Location:** `src/app/page.tsx:262`
- **Context:** Testimonial quote Sarah K.
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** User voice; “panicking pet” is playful but reinforces anxiety-as-lever.

### Entry 22
- **Copy:** "High school junior"
- **Location:** `src/app/page.tsx:264`
- **Context:** Testimonial detail
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Attribution line.

### Entry 23
- **Copy:** "The fact that an AI actually checks if you did the work is what makes this different. I can't just set a timer and scroll TikTok for 30 minutes anymore. Capy knows."
- **Location:** `src/app/page.tsx:267`
- **Context:** Testimonial quote Marcus T.
- **Tag:** 🟢 IDENTITY-ALIGNED
- **Why tagged:** Proof vs honor system; aligns with thesis.

### Entry 24
- **Copy:** "College freshman"
- **Location:** `src/app/page.tsx:269`
- **Context:** Testimonial detail
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Attribution line.

### Entry 25
- **Copy:** "My capybara is level 5 and wears a crown now. I know it's silly but I genuinely feel bad when she loses XP. I've never been this consistent with studying."
- **Location:** `src/app/page.tsx:272`
- **Context:** Testimonial quote Aisha M.
- **Tag:** 🟡 NEUTRAL ⚠️ CHARACTER DRIFT
- **Why tagged:** XP loss guilt ties self-worth to pet; nuanced but can read as pressure.

### Entry 26
- **Copy:** "High school senior"
- **Location:** `src/app/page.tsx:274`
- **Context:** Testimonial detail
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Attribution line.

### Entry 27
- **Copy:** "Ready to stop procrastinating?"
- **Location:** `src/app/page.tsx:327`
- **Context:** Landing bottom CTA H2
- **Tag:** 🔴 OFF-BRAND 🎯 HIGH-LEVERAGE
- **Why tagged:** Shame-adjacent command framing at conversion.

### Entry 28
- **Copy:** "Your capybara is waiting."
- **Location:** `src/app/page.tsx:330`
- **Context:** Landing bottom CTA sub
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Pet as mascot wait-state; low harm.

### Entry 29
- **Copy:** "Get Started — it's free"
- **Location:** `src/app/page.tsx:337`
- **Context:** Landing bottom CTA button
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Standard CTA.

### Entry 30
- **Copy:** "© 2026 Capy · "
- **Location:** `src/app/page.tsx:346`
- **Context:** Footer copyright prefix
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Legal footer.

### Entry 31
- **Copy:** "Privacy"
- **Location:** `src/app/page.tsx:346`
- **Context:** Footer link text
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Link label.

### Entry 32
- **Copy:** "Terms"
- **Location:** `src/app/page.tsx:346`
- **Context:** Footer link text
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Link label.

### Entry 33
- **Copy:** "Reset all mock data and auth — simulates a brand new user"
- **Location:** `src/app/page.tsx:354`
- **Context:** Dev-only button title attribute
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Dev-only; not user-facing in production build.

### Entry 34
- **Copy:** "🔄 reset mock"
- **Location:** `src/app/page.tsx:358`
- **Context:** Dev-only button label
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Dev-only.

---

## Section 2: Paywall & Pricing

### Entry 35
- **Copy:** "Upgrade to Premium"
- **Location:** `src/app/settings/page.tsx:615`
- **Context:** Settings subscription card H3
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Generic upgrade headline.

### Entry 36
- **Copy:** "Unlock unlimited sessions, exclusive accessories, and priority AI verification."
- **Location:** `src/app/settings/page.tsx:618`
- **Context:** Settings subscription marketing body
- **Tag:** 🔴 OFF-BRAND
- **Why tagged:** Feature-list SaaS voice; not identity/thesis grounded.

### Entry 37
- **Copy:** "$4.99"
- **Location:** `src/app/settings/page.tsx:622`
- **Context:** Monthly price display
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Numeric price.

### Entry 38
- **Copy:** "/month"
- **Location:** `src/app/settings/page.tsx:623`
- **Context:** Monthly cadence
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Pricing suffix.

### Entry 39
- **Copy:** "or"
- **Location:** `src/app/settings/page.tsx:625`
- **Context:** Pricing divider
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Connector.

### Entry 40
- **Copy:** "$29.99"
- **Location:** `src/app/settings/page.tsx:627`
- **Context:** Yearly price display
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Numeric price.

### Entry 41
- **Copy:** "/year"
- **Location:** `src/app/settings/page.tsx:628`
- **Context:** Yearly cadence
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Pricing suffix.

### Entry 42
- **Copy:** "SAVE 50%"
- **Location:** `src/app/settings/page.tsx:629`
- **Context:** Promo badge
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Urgency/discount microcopy.

### Entry 43
- **Copy:** "Upgrade to Premium"
- **Location:** `src/app/settings/page.tsx:637`
- **Context:** Subscription CTA button
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Duplicate CTA label.

### Entry 44
- **Copy:** "Have a promo code?"
- **Location:** `src/app/settings/page.tsx:648`
- **Context:** Promo label
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Form label.

### Entry 45
- **Copy:** "Enter code"
- **Location:** `src/app/settings/page.tsx:653`
- **Context:** Promo placeholder
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Placeholder.

### Entry 46
- **Copy:** "Apply"
- **Location:** `src/app/settings/page.tsx:662`
- **Context:** Promo button
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Button label.

---

## Section 3: Authentication & Onboarding

### Entry 47
- **Copy:** "Back"
- **Location:** `src/app/signup/page.tsx:115`
- **Context:** Signup back control
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Navigation.

### Entry 48
- **Copy:** "Create your account"
- **Location:** `src/app/signup/page.tsx:120`
- **Context:** Signup H1 (signup mode)
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Standard auth headline.

### Entry 49
- **Copy:** "Welcome back"
- **Location:** `src/app/signup/page.tsx:120`
- **Context:** Signup H1 (signin mode)
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Standard auth headline.

### Entry 50
- **Copy:** "Your capybara is waiting to meet you."
- **Location:** `src/app/signup/page.tsx:124`
- **Context:** Signup subcopy (signup mode)
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Warm pet framing.

### Entry 51
- **Copy:** "Your capybara missed you."
- **Location:** `src/app/signup/page.tsx:125`
- **Context:** Signup subcopy (signin mode)
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Warm pet framing.

### Entry 52
- **Copy:** "Continue with Google"
- **Location:** `src/app/signup/page.tsx:141`
- **Context:** Google auth button
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Standard OAuth CTA.

### Entry 53
- **Copy:** "or"
- **Location:** `src/app/signup/page.tsx:147`
- **Context:** Auth divider
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Divider label.

### Entry 54
- **Copy:** "Email"
- **Location:** `src/app/signup/page.tsx:158`
- **Context:** Email placeholder
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Field placeholder.

### Entry 55
- **Copy:** "Password"
- **Location:** `src/app/signup/page.tsx:169`
- **Context:** Password placeholder
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Field placeholder.

### Entry 56
- **Copy:** "Creating account..."
- **Location:** `src/app/signup/page.tsx:203`
- **Context:** Submit loading (signup)
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Loading state.

### Entry 57
- **Copy:** "Signing in..."
- **Location:** `src/app/signup/page.tsx:203`
- **Context:** Submit loading (signin)
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Loading state.

### Entry 58
- **Copy:** "Create account"
- **Location:** `src/app/signup/page.tsx:206`
- **Context:** Submit button (signup)
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** CTA.

### Entry 59
- **Copy:** "Sign in"
- **Location:** `src/app/signup/page.tsx:206`
- **Context:** Submit button (signin)
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** CTA.

### Entry 60
- **Copy:** "Already have an account? "
- **Location:** `src/app/signup/page.tsx:215`
- **Context:** Mode toggle prefix
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Auth helper copy.

### Entry 61
- **Copy:** "Sign in"
- **Location:** `src/app/signup/page.tsx:217`
- **Context:** Mode toggle link
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Link.

### Entry 62
- **Copy:** "Don't have an account? "
- **Location:** `src/app/signup/page.tsx:222`
- **Context:** Mode toggle prefix
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Auth helper copy.

### Entry 63
- **Copy:** "Sign up"
- **Location:** `src/app/signup/page.tsx:224`
- **Context:** Mode toggle link
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Link.

### Entry 64
- **Copy:** "Continue as guest"
- **Location:** `src/app/signup/page.tsx:244`
- **Context:** Guest CTA
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Guest path label.

### Entry 65
- **Copy:** "Limited features. You can upgrade to a full account later."
- **Location:** `src/app/signup/page.tsx:247`
- **Context:** Guest helper
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Expectation setting.

### Entry 66
- **Copy:** "I've been grading papers all morning. Let's see what you've got."
- **Location:** `src/app/signup/page.tsx:294`
- **Context:** Signup illustration quote
- **Tag:** 🟡 NEUTRAL ⚠️ CHARACTER DRIFT
- **Why tagged:** Teacher voice ok; not clearly nerdy-capy-specific.

### Entry 67
- **Copy:** "What's your biggest study struggle?"
- **Location:** `src/app/onboarding/page.tsx:16`
- **Context:** Quiz Q1
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** “Study struggle” centers school framing; acceptable for audience.

### Entry 68
- **Copy:** "Starting is the hardest part"
- **Location:** `src/app/onboarding/page.tsx:17`
- **Context:** Quiz option
- **Tag:** 🟢 IDENTITY-ALIGNED
- **Why tagged:** Executive dysfunction friendly.

### Entry 69
- **Copy:** "I get distracted halfway"
- **Location:** `src/app/onboarding/page.tsx:17`
- **Context:** Quiz option
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Relatable.

### Entry 70
- **Copy:** "I run out of motivation"
- **Location:** `src/app/onboarding/page.tsx:17`
- **Context:** Quiz option
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Relatable.

### Entry 71
- **Copy:** "I forget what I need to do"
- **Location:** `src/app/onboarding/page.tsx:17`
- **Context:** Quiz option
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** ADHD-adjacent without labeling.

### Entry 72
- **Copy:** "What motivates you most?"
- **Location:** `src/app/onboarding/page.tsx:20`
- **Context:** Quiz Q2
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Survey tone.

### Entry 73
- **Copy:** "Visual progress / streaks"
- **Location:** `src/app/onboarding/page.tsx:21`
- **Context:** Quiz option
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Motivation option.

### Entry 74
- **Copy:** "Competition / ranking"
- **Location:** `src/app/onboarding/page.tsx:21`
- **Context:** Quiz option
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Motivation option.

### Entry 75
- **Copy:** "Rewards / unlocking things"
- **Location:** `src/app/onboarding/page.tsx:21`
- **Context:** Quiz option
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Motivation option.

### Entry 76
- **Copy:** "Not letting someone down"
- **Location:** `src/app/onboarding/page.tsx:21`
- **Context:** Quiz option
- **Tag:** 🔴 OFF-BRAND
- **Why tagged:** Guilt-based motivation vs anti-shame thesis.

### Entry 77
- **Copy:** "Let's get you started."
- **Location:** `src/app/onboarding/page.tsx:131`
- **Context:** Onboarding welcome H1
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Welcoming.

### Entry 78
- **Copy:** "A few quick questions, then you'll meet your capybara. Takes 60 seconds."
- **Location:** `src/app/onboarding/page.tsx:141`
- **Context:** Onboarding welcome body
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Sets expectations.

### Entry 79
- **Copy:** "Let's go →"
- **Location:** `src/app/onboarding/page.tsx:154`
- **Context:** Onboarding welcome CTA
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** CTA.

### Entry 80
- **Copy:** "Capy is best on PC / laptop"
- **Location:** `src/app/onboarding/page.tsx:186`
- **Context:** Mobile-only warning H1
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Device guidance.

### Entry 81
- **Copy:** "Capy is still in its prototype stages — mobile will have bugs"
- **Location:** `src/app/onboarding/page.tsx:196`
- **Context:** Mobile-only warning body
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Honest limitation copy.

### Entry 82
- **Copy:** "Got it →"
- **Location:** `src/app/onboarding/page.tsx:209`
- **Context:** Mobile warning CTA
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Acknowledgment CTA.

### Entry 83
- **Copy:** "Question "
- **Location:** `src/app/onboarding/page.tsx:238`
- **Context:** Quiz progress label prefix (number injected before "of 2")
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Progress UI fragment.

### Entry 84
- **Copy:** " of 2"
- **Location:** `src/app/onboarding/page.tsx:238`
- **Context:** Quiz progress suffix
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Progress UI fragment.

### Entry 85
- **Copy:** "Continue →"
- **Location:** `src/app/onboarding/page.tsx:308`
- **Context:** Quiz continue
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** CTA.

### Entry 86
- **Copy:** "Here's how Capy works"
- **Location:** `src/app/onboarding/page.tsx:330`
- **Context:** Onboarding explainer H2
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Education heading.

### Entry 87
- **Copy:** "Four steps. Zero excuses."
- **Location:** `src/app/onboarding/page.tsx:331`
- **Context:** Onboarding explainer sub
- **Tag:** 🔴 OFF-BRAND 🎯 HIGH-LEVERAGE
- **Why tagged:** Hustle-culture phrasing; shames by implication.

### Entry 88
- **Copy:** "Upload your task"
- **Location:** `src/app/onboarding/page.tsx:334`
- **Context:** Explainer list title
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Step title.

### Entry 89
- **Copy:** "Describe what you need to finish. I evaluate difficulty and set the stakes."
- **Location:** `src/app/onboarding/page.tsx:334`
- **Context:** Explainer list text
- **Tag:** 🟡 NEUTRAL ⚠️ CHARACTER DRIFT
- **Why tagged:** First-person “I” reads as teacher; ok, but not explicitly Capy Teacher persona.

### Entry 90
- **Copy:** "Race the clock"
- **Location:** `src/app/onboarding/page.tsx:335`
- **Context:** Explainer list title
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Step title.

### Entry 91
- **Copy:** "A countdown timer creates the urgency your brain needs to focus."
- **Location:** `src/app/onboarding/page.tsx:335`
- **Context:** Explainer list text
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Brain framing is systems-ish; “urgency” can read as pressure.

### Entry 92
- **Copy:** "Prove you did it"
- **Location:** `src/app/onboarding/page.tsx:336`
- **Context:** Explainer list title
- **Tag:** 🟢 IDENTITY-ALIGNED
- **Why tagged:** Proof-forward.

### Entry 93
- **Copy:** "Upload a photo of your work. I'll verify it actually happened."
- **Location:** `src/app/onboarding/page.tsx:336`
- **Context:** Explainer list text
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Proof + verification.

### Entry 94
- **Copy:** "Earn XP"
- **Location:** `src/app/onboarding/page.tsx:337`
- **Context:** Explainer list title
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Gamification label.

### Entry 95
- **Copy:** "Your pet grows stronger when you deliver. Fails cost XP. No cheating."
- **Location:** `src/app/onboarding/page.tsx:337`
- **Context:** Explainer list text
- **Tag:** 🔴 OFF-BRAND
- **Why tagged:** “No cheating” moralizes; shame-adjacent.

### Entry 96
- **Copy:** "Got it →"
- **Location:** `src/app/onboarding/page.tsx:367`
- **Context:** Explainer CTA
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** CTA.

### Entry 97
- **Copy:** "One important rule"
- **Location:** `src/app/onboarding/page.tsx:387`
- **Context:** Rule slide H2
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Sets stakes.

### Entry 98
- **Copy:** "I'm not a reward-you-for-nothing teacher. If you don't finish, "
- **Location:** `src/app/onboarding/page.tsx:398`
- **Context:** Rule slide paragraph part 1
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Explains real stakes; slightly lecturing.

### Entry 99
- **Copy:** "your pet loses XP."
- **Location:** `src/app/onboarding/page.tsx:399`
- **Context:** Rule slide emphasized clause
- **Tag:** 🟡 NEUTRAL ⚠️ CHARACTER DRIFT
- **Why tagged:** Pet as penalty bearer (intentional mechanic) but emotional.

### Entry 100
- **Copy:** "So only start a session when you're actually ready to work."
- **Location:** `src/app/onboarding/page.tsx:399`
- **Context:** Rule slide paragraph part 2
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Reasonable guardrail.

### Entry 101
- **Copy:** "Think of it as a commitment contract. With a very cute capybara on the line."
- **Location:** `src/app/onboarding/page.tsx:402`
- **Context:** Rule slide secondary
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Contract framing is coherent with product.

### Entry 102
- **Copy:** "Deal. Let's go."
- **Location:** `src/app/onboarding/page.tsx:410`
- **Context:** Rule slide CTA
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Agreement CTA.

### Entry 103
- **Copy:** "Design your capybara"
- **Location:** `src/app/onboarding/page.tsx:427`
- **Context:** Color step H2
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Customization.

### Entry 104
- **Copy:** "Pick a color, give them a name"
- **Location:** `src/app/onboarding/page.tsx:429`
- **Context:** Color step sub
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Instruction.

### Entry 105
- **Copy:** "Unlock at Level "
- **Location:** `src/app/onboarding/page.tsx:466`
- **Context:** Locked color title template (level appended)
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Unlock hint.

### Entry 106
- **Copy:** "Name your capybara..."
- **Location:** `src/app/onboarding/page.tsx:481`
- **Context:** Pet name placeholder
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Placeholder.

### Entry 107
- **Copy:** "Hatch my egg! 🥚"
- **Location:** `src/app/onboarding/page.tsx:502`
- **Context:** Hatch CTA
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Playful onboarding CTA.

### Entry 108
- **Copy:** "Something is happening..."
- **Location:** `src/app/onboarding/page.tsx:558`
- **Context:** Egg idle caption
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Loading-ish microcopy.

### Entry 109
- **Copy:** "It's moving! 👀"
- **Location:** `src/app/onboarding/page.tsx:559`
- **Context:** Egg wobble caption
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Playful.

### Entry 110
- **Copy:** "Almost there...!"
- **Location:** `src/app/onboarding/page.tsx:560`
- **Context:** Egg crack caption
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Playful.

### Entry 111
- **Copy:** " is here!"
- **Location:** `src/app/onboarding/page.tsx:592`
- **Context:** Hatch success H2 suffix (name prepended in JSX)
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Celebration template.

### Entry 112
- **Copy:** "Your capybara is ready to hold you accountable."
- **Location:** `src/app/onboarding/page.tsx:601`
- **Context:** Post-hatch line
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Accountability framing; “hold accountable” can feel intense.

### Entry 113
- **Copy:** "Let's go! 🎉"
- **Location:** `src/app/onboarding/page.tsx:611`
- **Context:** Post-hatch CTA
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** CTA.

### Entry 114
- **Copy:** " is counting on you"
- **Location:** `src/app/onboarding/page.tsx:637`
- **Context:** Final slide H2 suffix
- **Tag:** 🟡 NEUTRAL ⚠️ CHARACTER DRIFT
- **Why tagged:** Pressure via pet counting on user.

### Entry 115
- **Copy:** "Time to show your capybara what you're made of."
- **Location:** `src/app/onboarding/page.tsx:639`
- **Context:** Final slide body
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Identity challenge; borderline hustle.

### Entry 116
- **Copy:** "Saving..."
- **Location:** `src/app/onboarding/page.tsx:647`
- **Context:** Final CTA loading
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Loading.

### Entry 117
- **Copy:** "Start my first session →"
- **Location:** `src/app/onboarding/page.tsx:647`
- **Context:** Final CTA
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Onboarding completion CTA.

### Entry 118
- **Copy:** "Back"
- **Location:** `src/app/onboarding/page.tsx:681`
- **Context:** Onboarding back control
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Navigation.

---

## Section 4: Session Flow (subset — high-signal strings)

### Entry 119
- **Copy:** "Loading your workspace..."
- **Location:** `src/app/home/page.tsx:193`
- **Context:** Home loading
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Loading.

### Entry 120
- **Copy:** "Welcome back"
- **Location:** `src/app/home/page.tsx:219`
- **Context:** Home greeting strong text
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Greeting fragment.

### Entry 121
- **Copy:** "What are we working on today?"
- **Location:** `src/app/home/page.tsx:220`
- **Context:** Home greeting continuation
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Friendly prompt.

### Entry 122
- **Copy:** "Closet"
- **Location:** `src/app/home/page.tsx:241`
- **Context:** Home pet card button
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Nav shortcut.

### Entry 123
- **Copy:** "Level "
- **Location:** `src/app/home/page.tsx:233`
- **Context:** Pet level label fragment
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Stats label.

### Entry 124
- **Copy:** " XP"
- **Location:** `src/app/home/page.tsx:233`
- **Context:** Pet XP suffix
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Stats suffix.

### Entry 125
- **Copy:** "New session"
- **Location:** `src/app/home/page.tsx:285`
- **Context:** Session setup card H2
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Section title.

### Entry 126
- **Copy:** "Link to a goal (optional)"
- **Location:** `src/app/home/page.tsx:290`
- **Context:** Goal link label
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Form label.

### Entry 127
- **Copy:** "None — regular focus session"
- **Location:** `src/app/home/page.tsx:298`
- **Context:** Goal select default option
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Select option.

### Entry 128
- **Copy:** "Stakes and proof follow that goal when linked."
- **Location:** `src/app/home/page.tsx:306`
- **Context:** Goal helper
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Explainer.

### Entry 129
- **Copy:** "What do you need to finish?"
- **Location:** `src/app/home/page.tsx:314`
- **Context:** Task label
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Form label.

### Entry 130
- **Copy:** "AP Bio lab report, chapter 3 homework..."
- **Location:** `src/app/home/page.tsx:320`
- **Context:** Task placeholder
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Placeholder.

### Entry 131
- **Copy:** "Any extra context? (optional)"
- **Location:** `src/app/home/page.tsx:329`
- **Context:** Context label
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Form label.

### Entry 132
- **Copy:** "The rubric says I need 3 paragraphs..."
- **Location:** `src/app/home/page.tsx:334`
- **Context:** Context placeholder
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Placeholder.

### Entry 133
- **Copy:** "Upload rubric / instructions (optional)"
- **Location:** `src/app/home/page.tsx:344`
- **Context:** Upload label
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Form label.

### Entry 134
- **Copy:** "Drop files here"
- **Location:** `src/app/home/page.tsx:357`
- **Context:** Dropzone active
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Drop state.

### Entry 135
- **Copy:** "Drag & drop or click to upload"
- **Location:** `src/app/home/page.tsx:357`
- **Context:** Dropzone idle
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Upload prompt.

### Entry 136
- **Copy:** "How long will this take?"
- **Location:** `src/app/home/page.tsx:390`
- **Context:** Timer slider label
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Form label.

### Entry 137
- **Copy:** "5 min"
- **Location:** `src/app/home/page.tsx:407`
- **Context:** Slider min
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Scale endpoint.

### Entry 138
- **Copy:** "2 hours"
- **Location:** `src/app/home/page.tsx:408`
- **Context:** Slider max
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Scale endpoint.

### Entry 139
- **Copy:** "Uploading images..."
- **Location:** `src/app/home/page.tsx:426`
- **Context:** Start session loading
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Loading.

### Entry 140
- **Copy:** "Start Session"
- **Location:** `src/app/home/page.tsx:428`
- **Context:** Start session CTA
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Primary CTA.

### Entry 141
- **Copy:** "Re-evaluating with your details..."
- **Location:** `src/app/evaluate/page.tsx:255`
- **Context:** Evaluate scanning copy
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Loading.

### Entry 142
- **Copy:** "Evaluating your assignment..."
- **Location:** `src/app/evaluate/page.tsx:255`
- **Context:** Evaluate scanning copy
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Loading.

### Entry 143
- **Copy:** "Go back"
- **Location:** `src/app/evaluate/page.tsx:245`
- **Context:** Evaluate error CTA
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Recovery.

### Entry 144
- **Copy:** "Failed to evaluate. Please try again."
- **Location:** `src/app/evaluate/page.tsx:112`
- **Context:** Evaluate client catch error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Generic error.

### Entry 145
- **Copy:** "I need a bit more info"
- **Location:** `src/app/evaluate/page.tsx:285`
- **Context:** Context question H2
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Clarification prompt.

### Entry 146
- **Copy:** "Can you provide more details about this assignment?"
- **Location:** `src/app/evaluate/page.tsx:289`
- **Context:** Context question fallback
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Fallback string.

### Entry 147
- **Copy:** "Type your answer..."
- **Location:** `src/app/evaluate/page.tsx:294`
- **Context:** Context answer placeholder
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Placeholder.

### Entry 148
- **Copy:** "Submit"
- **Location:** `src/app/evaluate/page.tsx:307`
- **Context:** Context submit
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Button.

### Entry 149
- **Copy:** "Skip — evaluate with what I gave you"
- **Location:** `src/app/evaluate/page.tsx:315`
- **Context:** Context skip
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Escape hatch.

### Entry 150
- **Copy:** "GO!"
- **Location:** `src/app/evaluate/page.tsx:347`
- **Context:** Countdown go
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Dramatic start.

### Entry 151
- **Copy:** "Here's the deal"
- **Location:** `src/app/evaluate/page.tsx:369`
- **Context:** Deal card H2
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Stakes reveal heading.

### Entry 152
- **Copy:** "Linked goal"
- **Location:** `src/app/evaluate/page.tsx:374`
- **Context:** Linked goal prefix fragment
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Goal link notice.

### Entry 153
- **Copy:** " — XP stakes match your goal."
- **Location:** `src/app/evaluate/page.tsx:374`
- **Context:** Linked goal suffix fragment
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Explains linked stakes.

### Entry 154
- **Copy:** "Proof tip:"
- **Location:** `src/app/evaluate/page.tsx:388`
- **Context:** Proof guidance label
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inline label.

### Entry 155
- **Copy:** "You finish"
- **Location:** `src/app/evaluate/page.tsx:415`
- **Context:** XP stake label positive
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Stakes UI.

### Entry 156
- **Copy:** "You don't"
- **Location:** `src/app/evaluate/page.tsx:425`
- **Context:** XP stake label negative
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Stakes UI.

### Entry 157
- **Copy:** "XP"
- **Location:** `src/app/evaluate/page.tsx:422`
- **Context:** XP unit
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Label.

### Entry 158
- **Copy:** " minutes on the clock"
- **Location:** `src/app/evaluate/page.tsx:438`
- **Context:** Timer summary fragment
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Timer display fragment.

### Entry 159
- **Copy:** "Keep my time anyway"
- **Location:** `src/app/evaluate/page.tsx:457`
- **Context:** Time flag dismiss
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** User override CTA.

### Entry 160
- **Copy:** "This task might not be screenshottable — you can describe what you did instead."
- **Location:** `src/app/evaluate/page.tsx:465`
- **Context:** Non-screenshottable hint
- **Tag:** 🟢 IDENTITY-ALIGNED
- **Why tagged:** Offers accessible proof path.

### Entry 161
- **Copy:** "Let's go"
- **Location:** `src/app/evaluate/page.tsx:478`
- **Context:** Start timer CTA
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Primary CTA.

### Entry 162
- **Copy:** "Go back and modify plan"
- **Location:** `src/app/evaluate/page.tsx:486`
- **Context:** Secondary navigation
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Edit path.

### Entry 163
- **Copy:** "Adjust this plan with Capy"
- **Location:** `src/app/evaluate/page.tsx:395`
- **Context:** CriteriaRefineChat title prop
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Chat header.

### Entry 164
- **Copy:** "Upload your proof "
- **Location:** `src/app/timer/page.tsx:349`
- **Context:** Timer proof heading fragment
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Proof panel title.

### Entry 165
- **Copy:** "Drop photos here"
- **Location:** `src/app/timer/page.tsx:364`
- **Context:** Timer dropzone active
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Drop state.

### Entry 166
- **Copy:** "Upload up to 5 screenshots of your work"
- **Location:** `src/app/timer/page.tsx:364`
- **Context:** Timer dropzone idle
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Instruction.

### Entry 167
- **Copy:** "Short note to go with your photo(s)…"
- **Location:** `src/app/timer/page.tsx:396`
- **Context:** Linked goal proof placeholder
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Placeholder variant.

### Entry 168
- **Copy:** "Or describe what you did..."
- **Location:** `src/app/timer/page.tsx:396`
- **Context:** Proof text placeholder
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Placeholder.

### Entry 169
- **Copy:** "Linked to a goal — your proof counts toward it."
- **Location:** `src/app/timer/page.tsx:404`
- **Context:** Linked goal helper
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Explainer.

### Entry 170
- **Copy:** "Uploading proof..."
- **Location:** `src/app/timer/page.tsx:420`
- **Context:** Proof upload loading
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Loading.

### Entry 171
- **Copy:** "Submit proof"
- **Location:** `src/app/timer/page.tsx:422`
- **Context:** Proof submit CTA
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Primary CTA.

### Entry 172
- **Copy:** "⚠️ OVERTIME — "
- **Location:** `src/app/timer/page.tsx:437`
- **Context:** Overtime label prefix
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Timer warning fragment.

### Entry 173
- **Copy:** "s left"
- **Location:** `src/app/timer/page.tsx:437`
- **Context:** Overtime label suffix
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Timer warning fragment.

### Entry 174
- **Copy:** "Checking your work..."
- **Location:** `src/app/verify/page.tsx:255`
- **Context:** Verify scanning
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Loading.

### Entry 175
- **Copy:** "Go home"
- **Location:** `src/app/verify/page.tsx:249`
- **Context:** Verify error CTA
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Recovery.

### Entry 176
- **Copy:** "Verification failed. Please try again."
- **Location:** `src/app/verify/page.tsx:115`
- **Context:** Verify client catch
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Generic error.

### Entry 177
- **Copy:** "Time ran out before you could submit your proof. Your capybara is disappointed, but not giving up on you."
- **Location:** `src/app/verify/page.tsx:127`
- **Context:** Timer expired feedback
- **Tag:** 🔴 OFF-BRAND ⚠️ CHARACTER DRIFT 🎯 HIGH-LEVERAGE
- **Why tagged:** Pet disappointment is moralizing; failure peak.

### Entry 178
- **Copy:** "Approved!"
- **Location:** `src/app/verify/page.tsx:300`
- **Context:** Verdict approved H2
- **Tag:** 🔴 OFF-BRAND 🎯 HIGH-LEVERAGE
- **Why tagged:** Generic triumph word vs proof-earned framing.

### Entry 179
- **Copy:** "Not quite"
- **Location:** `src/app/verify/page.tsx:305`
- **Context:** Verdict rejected H2
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Soft rejection label.

### Entry 180
- **Copy:** "Your proof"
- **Location:** `src/app/verify/page.tsx:338`
- **Context:** Proof image alt
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Alt text.

### Entry 181
- **Copy:** "Continue →"
- **Location:** `src/app/verify/page.tsx:365`
- **Context:** Post-feedback CTA
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Continue.

### Entry 182
- **Copy:** "Level "
- **Location:** `src/app/verify/page.tsx:438`
- **Context:** Level-up H2 text node prefix before `{newLevel}`
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Literal fragment in JSX.

### Entry 183
- **Copy:** "!"
- **Location:** `src/app/verify/page.tsx:438`
- **Context:** Level-up H2 trailing punctuation after `{newLevel}`
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Literal fragment in JSX.

### Entry 184
- **Copy:** " XP"
- **Location:** `src/app/verify/page.tsx:452`
- **Context:** XP change suffix
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Unit.

### Entry 185
- **Copy:** "Great work!"
- **Location:** `src/app/verify/page.tsx:455`
- **Context:** XP reaction praise (full approval)
- **Tag:** 🔴 OFF-BRAND 🎯 HIGH-LEVERAGE
- **Why tagged:** Hollow praise; not evidence-linked.

### Entry 186
- **Copy:** "Partial credit — keep going!"
- **Location:** `src/app/verify/page.tsx:455`
- **Context:** XP reaction partial
- **Tag:** 🟢 IDENTITY-ALIGNED
- **Why tagged:** Process-forward, low shame.

### Entry 187
- **Copy:** "Better luck next time."
- **Location:** `src/app/verify/page.tsx:455`
- **Context:** XP reaction fail
- **Tag:** 🔴 OFF-BRAND
- **Why tagged:** Luck framing dismisses system + effort narrative.

### Entry 188
- **Copy:** "New session"
- **Location:** `src/app/verify/page.tsx:470`
- **Context:** Post-session CTA
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Primary loop CTA.

### Entry 189
- **Copy:** "View dashboard"
- **Location:** `src/app/verify/page.tsx:478`
- **Context:** Secondary CTA
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Navigation.

---

## Section 5: AI System Prompts (full text)

### Entry (AI-EVAL-SYS)
- **Copy:** "You are the Capy Teacher — a strict but encouraging capybara tutor who holds students accountable.\n\nCRITICAL RULES FOR EVALUATION:\n1. You MUST understand the FULL SCOPE before setting XP. If a student says \"AP Bio multiple choice\" but you don't know how many questions, you cannot properly evaluate.\n2. Look at ANY images provided CAREFULLY. If a student uploads a screenshot showing \"0 of 9 questions answered\", you know there are 9 questions. Extract every detail you can.\n3. If the task is vague or you lack context, set \"needsMoreContext\" to true and write a specific follow-up question in \"contextQuestion\". Examples:\n   - \"AP Bio homework\" → \"How many questions? Is this a full chapter or a specific section?\"\n   - \"Math assignment\" → \"What chapter/topic? How many problems?\"\n   - \"Essay\" → \"How long does it need to be? What's the prompt?\"\n4. For DIGITAL assignments (online quizzes, computer-based tests, apps like AP Classroom, Khan Academy, Quizlet):\n   - Set isScreenshottable to true BUT note in proofGuidance what would count as valid proof\n   - Be FLEXIBLE about proof — completion screens, score pages, submission confirmations, even the app showing \"completed\" status ALL count\n   - If the platform doesn't show scores immediately, say so in proofGuidance\n5. Scale XP based on ACTUAL scope, not just topic difficulty. 9 multiple choice questions ≠ a full research paper.\n\nRespond in JSON ONLY (no markdown, no backticks):\n{\n  \"xpReward\": number 30-150 based on actual task scope and difficulty,\n  \"xpPenalty\": negative number roughly 20% of xpReward,\n  \"taskDescription\": \"Specific description of what they need to complete\",\n  \"proofGuidance\": \"What counts as valid proof for THIS specific task (be generous for digital assignments)\",\n  \"isScreenshottable\": true/false,\n  \"timeFlag\": null or string if time seems wrong,\n  \"needsMoreContext\": true/false,\n  \"contextQuestion\": null or \"specific question to ask\" if needsMoreContext is true\n}"
- **Location:** `src/app/api/evaluate/route.ts:86-111` — `system` template literal
- **Context:** Claude system prompt for initial session evaluation / XP stakes / needsMoreContext gate.
- **Tag:** 🟡 NEUTRAL ⚠️ CHARACTER DRIFT 🎯 HIGH-LEVERAGE
- **Why tagged:** Strong operational rules and digital-proof generosity help thesis; opening “strict but encouraging” and lack of nerdy-capy persona keeps it neutral with drift risk.

```text
You are the Capy Teacher — a strict but encouraging capybara tutor who holds students accountable.

CRITICAL RULES FOR EVALUATION:
1. You MUST understand the FULL SCOPE before setting XP. If a student says "AP Bio multiple choice" but you don't know how many questions, you cannot properly evaluate.
2. Look at ANY images provided CAREFULLY. If a student uploads a screenshot showing "0 of 9 questions answered", you know there are 9 questions. Extract every detail you can.
3. If the task is vague or you lack context, set "needsMoreContext" to true and write a specific follow-up question in "contextQuestion". Examples:
   - "AP Bio homework" → "How many questions? Is this a full chapter or a specific section?"
   - "Math assignment" → "What chapter/topic? How many problems?"
   - "Essay" → "How long does it need to be? What's the prompt?"
4. For DIGITAL assignments (online quizzes, computer-based tests, apps like AP Classroom, Khan Academy, Quizlet):
   - Set isScreenshottable to true BUT note in proofGuidance what would count as valid proof
   - Be FLEXIBLE about proof — completion screens, score pages, submission confirmations, even the app showing "completed" status ALL count
   - If the platform doesn't show scores immediately, say so in proofGuidance
5. Scale XP based on ACTUAL scope, not just topic difficulty. 9 multiple choice questions ≠ a full research paper.

Respond in JSON ONLY (no markdown, no backticks):
{
  "xpReward": number 30-150 based on actual task scope and difficulty,
  "xpPenalty": negative number roughly 20% of xpReward,
  "taskDescription": "Specific description of what they need to complete",
  "proofGuidance": "What counts as valid proof for THIS specific task (be generous for digital assignments)",
  "isScreenshottable": true/false,
  "timeFlag": null or string if time seems wrong,
  "needsMoreContext": true/false,
  "contextQuestion": null or "specific question to ask" if needsMoreContext is true
}
```

### Entry (AI-EVAL-REFINE-SYS)
- **Copy:** "You are the Capy Teacher. The student is refining their FOCUS SESSION plan before they start the timer.\n\nCURRENT DRAFT:\n${JSON.stringify(draft, null, 2)}\n\nCONVERSATION:\n${convo}\n\nUpdate ONLY what they need for this sprint: taskDescription (what they must complete), proofGuidance (what to submit), isScreenshottable.\n\nRespond JSON ONLY:\n{\n  \"assistantMessage\": \"1-3 sentences\",\n  \"taskDescription\": \"string\",\n  \"proofGuidance\": \"string\",\n  \"isScreenshottable\": true/false\n}"
- **Location:** `src/app/api/evaluate/refine/route.ts:73-89` — `system` template literal
- **Context:** Claude system prompt for chat-based refinement of evaluate draft before timer.
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Mostly procedural JSON shaping; minimal persona.

```text
You are the Capy Teacher. The student is refining their FOCUS SESSION plan before they start the timer.

CURRENT DRAFT:
${JSON.stringify(draft, null, 2)}

CONVERSATION:
${convo}

Update ONLY what they need for this sprint: taskDescription (what they must complete), proofGuidance (what to submit), isScreenshottable.

Respond JSON ONLY:
{
  "assistantMessage": "1-3 sentences",
  "taskDescription": "string",
  "proofGuidance": "string",
  "isScreenshottable": true/false
}
```

### Entry (AI-VERIFY-SYS)
- **Copy:** "You are the Capy Teacher verifying a student's work. They were supposed to: ${taskDescription}.\n\nCRITICAL VERIFICATION RULES:\n1. For DIGITAL assignments (AP Classroom, Khan Academy, Google Classroom, etc.):\n   - Completion screens, submission pages, \"X of Y answered\" screenshots ALL count as valid proof\n   - If they show the app in a \"completed\" or \"submitted\" state, that IS proof\n   - Do NOT require a score — many platforms don't show scores immediately\n   - A screenshot showing they navigated to the assignment and it shows \"submitted\" is enough\n2. Give PARTIAL credit generously. If they clearly attempted the work but proof is imperfect, give \"partial\" not \"none\"\n3. Only give \"none\" if there's NO evidence they did ANY of the work\n4. Reference SPECIFIC things you can see in their proof — be detailed\n5. If they uploaded multiple photos, look at ALL of them together as combined evidence\n\nRespond in JSON ONLY (no markdown, no backticks):\n{\n  \"approved\": true/false (true for full or strong partial, false for weak partial or none),\n  \"completionLevel\": \"full\" or \"partial\" or \"none\",\n  \"feedbackText\": \"4-6 sentences. Reference SPECIFIC things in their proof. Be encouraging even when giving partial credit. If the proof is ambiguous, give benefit of the doubt.\"\n}"
- **Location:** `src/app/api/verify/route.ts:111-129` — `system` template literal (includes interpolated `taskDescription`)
- **Context:** Claude system prompt for vision verification / completionLevel / feedbackText.
- **Tag:** 🟢 IDENTITY-ALIGNED 🎯 HIGH-LEVERAGE
- **Why tagged:** Emphasizes specific visible evidence and generous partial credit; aligns with proof-based self-trust.

```text
You are the Capy Teacher verifying a student's work. They were supposed to: ${taskDescription}.

CRITICAL VERIFICATION RULES:
1. For DIGITAL assignments (AP Classroom, Khan Academy, Google Classroom, etc.):
   - Completion screens, submission pages, "X of Y answered" screenshots ALL count as valid proof
   - If they show the app in a "completed" or "submitted" state, that IS proof
   - Do NOT require a score — many platforms don't show scores immediately
   - A screenshot showing they navigated to the assignment and it shows "submitted" is enough
2. Give PARTIAL credit generously. If they clearly attempted the work but proof is imperfect, give "partial" not "none"
3. Only give "none" if there's NO evidence they did ANY of the work
4. Reference SPECIFIC things you can see in their proof — be detailed
5. If they uploaded multiple photos, look at ALL of them together as combined evidence

Respond in JSON ONLY (no markdown, no backticks):
{
  "approved": true/false (true for full or strong partial, false for weak partial or none),
  "completionLevel": "full" or "partial" or "none",
  "feedbackText": "4-6 sentences. Reference SPECIFIC things in their proof. Be encouraging even when giving partial credit. If the proof is ambiguous, give benefit of the doubt."
}
```

### Entry (AI-COMMIT-SYS)
- **Copy:** "You are the Capy Teacher — a strict but encouraging capybara tutor who holds students accountable with long-term commitments.\n\nA student wants to set a goal with a deadline of: ${deadline}\n\nYOUR JOB: Decide if this commitment is specific and verifiable. Then either REJECT it or REFINE it.\n\nHARD REJECT if:\n- The task is vague, unmeasurable, or unverifiable (\"be productive\", \"study more\", \"work on stuff\", \"be healthier\")\n- There is no concrete deliverable or end state that can be proven\n- The task is so broad it could mean anything (\"do homework\", \"catch up on school\")\n\nWhen rejecting, suggest a SPECIFIC alternative they could commit to instead.\n\nACCEPT AND REFINE if:\n- The task has a clear end state (\"read chapter 5\", \"finish math problems 1-20\", \"clean my room\", \"write 500 words of my essay\")\n- You can describe what proof of completion would look like\n- Prefer photo-verifiable commitments whenever possible. Use \"photo\" or \"both\" for verificationMethod.\n- Do not use \"text\" alone unless a photo is genuinely impossible.\n\nRespond in JSON ONLY (no markdown, no backticks):\n\nIf rejecting:\n{\n  \"rejected\": true,\n  \"reason\": \"Why this is too vague + a specific suggestion for what they could commit to instead\"\n}\n\nIf accepting:\n{\n  \"rejected\": false,\n  \"title\": \"Clear, concise title (max 60 chars)\",\n  \"description\": \"Exact verifiable criteria — what must be done and what proof the AI will look for (2-3 sentences)\",\n  \"verificationMethod\": \"photo\" or \"text\" or \"both\",\n  \"xpReward\": number 30-150 based on scope and difficulty,\n  \"xpPenalty\": negative number roughly 20% of xpReward\n}"
- **Location:** `src/app/api/commitments/route.ts:87-122` — `system` template literal (includes interpolated deadline)
- **Context:** Claude system prompt for creating/refining verifiable long-term commitments.
- **Tag:** 🟡 NEUTRAL ⚠️ CHARACTER DRIFT 🎯 HIGH-LEVERAGE
- **Why tagged:** Helpful gatekeeping for measurability; “strict but encouraging” again; persona thin.

```text
You are the Capy Teacher — a strict but encouraging capybara tutor who holds students accountable with long-term commitments.

A student wants to set a goal with a deadline of: ${deadline}

YOUR JOB: Decide if this commitment is specific and verifiable. Then either REJECT it or REFINE it.

HARD REJECT if:
- The task is vague, unmeasurable, or unverifiable ("be productive", "study more", "work on stuff", "be healthier")
- There is no concrete deliverable or end state that can be proven
- The task is so broad it could mean anything ("do homework", "catch up on school")

When rejecting, suggest a SPECIFIC alternative they could commit to instead.

ACCEPT AND REFINE if:
- The task has a clear end state ("read chapter 5", "finish math problems 1-20", "clean my room", "write 500 words of my essay")
- You can describe what proof of completion would look like
- Prefer photo-verifiable commitments whenever possible. Use "photo" or "both" for verificationMethod.
- Do not use "text" alone unless a photo is genuinely impossible.

Respond in JSON ONLY (no markdown, no backticks):

If rejecting:
{
  "rejected": true,
  "reason": "Why this is too vague + a specific suggestion for what they could commit to instead"
}

If accepting:
{
  "rejected": false,
  "title": "Clear, concise title (max 60 chars)",
  "description": "Exact verifiable criteria — what must be done and what proof the AI will look for (2-3 sentences)",
  "verificationMethod": "photo" or "text" or "both",
  "xpReward": number 30-150 based on scope and difficulty,
  "xpPenalty": negative number roughly 20% of xpReward
}
```

### Entry (AI-COMMIT-REFINE-SYS)
- **Copy:** "You are the Capy Teacher — a nerdy, encouraging capybara. The student is refining their LONG-TERM GOAL criteria (title + what counts as done + proof type).\n\nCURRENT DRAFT (JSON):\n${JSON.stringify(draft, null, 2)}\n\nCONVERSATION:\n${convo}\n\nUpdate the draft based ONLY on the student's feedback. Keep stakes (XP) unchanged — do not invent xpReward/xpPenalty.\n\nRespond in JSON ONLY (no markdown):\n{\n  \"assistantMessage\": \"1-3 sentences, warm, specific to what they asked\",\n  \"title\": \"string\",\n  \"description\": \"verifiable criteria 2-4 sentences\",\n  \"verificationMethod\": \"photo\" | \"text\" | \"both\"\n}"
- **Location:** `src/app/api/commitments/refine/route.ts:70-86` — `system` template literal
- **Context:** Claude system prompt for chat refinement of commitment draft.
- **Tag:** 🟢 IDENTITY-ALIGNED
- **Why tagged:** Explicit nerdy encouraging capybara + warm assistantMessage guidance best matches intended persona.

```text
You are the Capy Teacher — a nerdy, encouraging capybara. The student is refining their LONG-TERM GOAL criteria (title + what counts as done + proof type).

CURRENT DRAFT (JSON):
${JSON.stringify(draft, null, 2)}

CONVERSATION:
${convo}

Update the draft based ONLY on the student's feedback. Keep stakes (XP) unchanged — do not invent xpReward/xpPenalty.

Respond in JSON ONLY (no markdown):
{
  "assistantMessage": "1-3 sentences, warm, specific to what they asked",
  "title": "string",
  "description": "verifiable criteria 2-4 sentences",
  "verificationMethod": "photo" | "text" | "both"
}
```

### Entry (AI-EVAL-USER-BLOCK)
- **Copy:** `Task title: ${taskTitle}\nContext: ${contextText || 'No additional context provided.'}\nTime estimate: ${Math.round(timeEstimate / 60)} minutes` (template literal expression)
- **Location:** `src/app/api/evaluate/route.ts:55-58`
- **Context:** User message text block assembled for Claude (not shown to end user; model input copy).
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Internal prompt assembly; neutral instructional headers.
### Entry (AI-VERIFY-USER-BLOCKS)
- **Copy:** Includes literals `ASSIGNMENT CONTEXT IMAGES:`, `ASSIGNMENT CONTEXT TEXT: …`, `STUDENT PROOF IMAGES (…):`, `STUDENT WRITTEN PROOF: …`, and `The student was supposed to: …` / `Proof guidance: …` / `Now verify their proof…`
- **Location:** `src/app/api/verify/route.ts:44-105`
- **Context:** Multimodal user content assembly for verification model.
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Internal labeling strings; functional.
### Entry (AI-COMMIT-USER)
- **Copy:** `The student says: "${userInput.trim()}"${extraContext}`
- **Location:** `src/app/api/commitments/route.ts:124-127`
- **Context:** User message content for commitments evaluation.
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Internal prompt wrapper.
### Entry (AI-MOCK-EVAL-TASK)
- **Copy:** `Complete "${taskTitle}" in full. Show clear, organized work that demonstrates you engaged with the material and met the task requirements.`
- **Location:** `src/app/api/evaluate/route.ts:13` — `mockEvaluate` return `taskDescription`
- **Context:** Fallback mock response shown to UI when no API key.
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Generic but serviceable mock task text.
### Entry (AI-MOCK-EVAL-PROOF)
- **Copy:** `Take a screenshot or photo of your completed "${taskTitle}" — a final result, submission confirmation, or your finished work clearly visible.`
- **Location:** `src/app/api/evaluate/route.ts:14`
- **Context:** Mock proof guidance.
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Concrete proof instructions.
### Entry (AI-MOCK-VERIFY)
- **Copy:** `Excellent work! Your proof clearly shows you completed "${taskDescription}". I can see you put in genuine effort and the result meets the requirements. You followed through exactly as expected — that's what builds the habit of accountability. Your capybara is proud of you. Keep this momentum going into your next session!`
- **Location:** `src/app/api/verify/route.ts:8`
- **Context:** Mock approval feedback when no API key.
- **Tag:** 🔴 OFF-BRAND 🎯 HIGH-LEVERAGE
- **Why tagged:** Hollow praise + generic “effort” without evidence + pet pride line; contradicts specificity thesis.
---

## Section 6: Pet & Closet (item display names from `src/lib/items.ts`)

### Entry 190
- **Copy:** "Beanie"
- **Location:** `src/lib/items.ts:25`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 191
- **Copy:** "Cowboy Hat"
- **Location:** `src/lib/items.ts:26`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 192
- **Copy:** "Party Hat"
- **Location:** `src/lib/items.ts:27`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 193
- **Copy:** "Beret"
- **Location:** `src/lib/items.ts:28`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 194
- **Copy:** "Flower Crown"
- **Location:** `src/lib/items.ts:29`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 195
- **Copy:** "Headband"
- **Location:** `src/lib/items.ts:30`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 196
- **Copy:** "Top Hat"
- **Location:** `src/lib/items.ts:31`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 197
- **Copy:** "Wizard Hat"
- **Location:** `src/lib/items.ts:32`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 198
- **Copy:** "Santa Hat"
- **Location:** `src/lib/items.ts:33`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 199
- **Copy:** "Chef Hat"
- **Location:** `src/lib/items.ts:34`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 200
- **Copy:** "Fedora"
- **Location:** `src/lib/items.ts:35`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 201
- **Copy:** "Graduation Cap"
- **Location:** `src/lib/items.ts:36`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 202
- **Copy:** "Baseball Cap"
- **Location:** `src/lib/items.ts:37`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 203
- **Copy:** "Viking Helmet"
- **Location:** `src/lib/items.ts:38`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 204
- **Copy:** "Crown"
- **Location:** `src/lib/items.ts:39`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 205
- **Copy:** "T-Shirt"
- **Location:** `src/lib/items.ts:43`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 206
- **Copy:** "Hoodie"
- **Location:** `src/lib/items.ts:44`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 207
- **Copy:** "Bow Tie"
- **Location:** `src/lib/items.ts:45`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 208
- **Copy:** "Vest"
- **Location:** `src/lib/items.ts:46`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 209
- **Copy:** "Scarf"
- **Location:** `src/lib/items.ts:47`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 210
- **Copy:** "School Uniform"
- **Location:** `src/lib/items.ts:48`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 211
- **Copy:** "Apron"
- **Location:** `src/lib/items.ts:49`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 212
- **Copy:** "Cape"
- **Location:** `src/lib/items.ts:50`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 213
- **Copy:** "Jacket"
- **Location:** `src/lib/items.ts:51`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 214
- **Copy:** "Raincoat"
- **Location:** `src/lib/items.ts:52`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 215
- **Copy:** "Lab Coat"
- **Location:** `src/lib/items.ts:53`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 216
- **Copy:** "Suit & Tie"
- **Location:** `src/lib/items.ts:54`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 217
- **Copy:** "Default Tan"
- **Location:** `src/lib/items.ts:58`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 218
- **Copy:** "Pastel Pink"
- **Location:** `src/lib/items.ts:59`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 219
- **Copy:** "Sky Blue"
- **Location:** `src/lib/items.ts:60`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 220
- **Copy:** "Mint Green"
- **Location:** `src/lib/items.ts:61`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 221
- **Copy:** "Burnt Orange"
- **Location:** `src/lib/items.ts:62`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 222
- **Copy:** "Coral Red"
- **Location:** `src/lib/items.ts:63`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 223
- **Copy:** "Snow White"
- **Location:** `src/lib/items.ts:64`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 224
- **Copy:** "Gold"
- **Location:** `src/lib/items.ts:65`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 225
- **Copy:** "Lavender"
- **Location:** `src/lib/items.ts:66`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 226
- **Copy:** "Purple"
- **Location:** `src/lib/items.ts:67`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 227
- **Copy:** "Teal"
- **Location:** `src/lib/items.ts:68`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 228
- **Copy:** "Charcoal"
- **Location:** `src/lib/items.ts:69`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 229
- **Copy:** "Polka Dot"
- **Location:** `src/lib/items.ts:70`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 230
- **Copy:** "Striped"
- **Location:** `src/lib/items.ts:71`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Entry 231
- **Copy:** "Neon Green"
- **Location:** `src/lib/items.ts:72`
- **Context:** Cosmetic item name shown in closet UI
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Inventory label; no brand thesis content.

### Additional closet UI strings
### Entry 232
- **Copy:** "Home"
- **Location:** `src/app/closet/page.tsx:89`
- **Context:** Closet back nav
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Navigation.

### Entry 233
- **Copy:** "Closet"
- **Location:** `src/app/closet/page.tsx:91`
- **Context:** Closet page H1
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Page title.

### Entry 234
- **Copy:** "Rename pet"
- **Location:** `src/app/closet/page.tsx:135`
- **Context:** Rename icon title
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Tooltip/title.

### Entry 235
- **Copy:** "Saving..."
- **Location:** `src/app/closet/page.tsx:150`
- **Context:** Saving indicator
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Loading.

### Entry 236
- **Copy:** "🎩 Hats"
- **Location:** `src/app/closet/page.tsx:172`
- **Context:** Closet tab
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Tab label.

### Entry 237
- **Copy:** "👕 Clothes"
- **Location:** `src/app/closet/page.tsx:172`
- **Context:** Closet tab
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Tab label.

### Entry 238
- **Copy:** "🎨 Colors"
- **Location:** `src/app/closet/page.tsx:172`
- **Context:** Closet tab
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Tab label.

### Entry 239
- **Copy:** "None"
- **Location:** `src/app/closet/page.tsx:198`
- **Context:** Unequip hats
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Option label.

### Entry 240
- **Copy:** "None"
- **Location:** `src/app/closet/page.tsx:243`
- **Context:** Unequip clothes
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Option label.

---

## Section 16: SEO / Meta

### Entry 241
- **Copy:** "Capy"
- **Location:** `src/app/layout.tsx:19`
- **Context:** Root metadata title
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Browser tab title.

### Entry 242
- **Copy:** "Meet your AI accountability capybara. Upload your assignment, race the timer, prove you did the work. Your pet earns XP when you deliver."
- **Location:** `src/app/layout.tsx:21`
- **Context:** Root metadata description
- **Tag:** 🟡 NEUTRAL 🎯 HIGH-LEVERAGE
- **Why tagged:** SEO/social framing; proof-forward.

---

## Section 10: Error States (API JSON `error` strings)

### Entry 243
- **Copy:** "Task title is required"
- **Location:** `src/app/api/evaluate/route.ts:40`
- **Context:** Evaluate API JSON error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Validation error string.

### Entry 244
- **Copy:** "No text response from AI"
- **Location:** `src/app/api/evaluate/route.ts:117`
- **Context:** Evaluate API error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Generic failure.

### Entry 245
- **Copy:** "Failed to parse AI response"
- **Location:** `src/app/api/evaluate/route.ts:128`
- **Context:** Evaluate API error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Parse failure.

### Entry 246
- **Copy:** "Failed to evaluate task. Please try again."
- **Location:** `src/app/api/evaluate/route.ts:132`
- **Context:** Evaluate API catch-all
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Generic server error.

### Entry 247
- **Copy:** "Invalid draft"
- **Location:** `src/app/api/evaluate/refine/route.ts:46`
- **Context:** Refine evaluate error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Validation.

### Entry 248
- **Copy:** "Messages required"
- **Location:** `src/app/api/evaluate/refine/route.ts:49`
- **Context:** Refine evaluate error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Validation.

### Entry 249
- **Copy:** "Too many messages"
- **Location:** `src/app/api/evaluate/refine/route.ts:52`
- **Context:** Refine evaluate error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Validation.

### Entry 250
- **Copy:** "Last user message required"
- **Location:** `src/app/api/evaluate/refine/route.ts:57`
- **Context:** Refine evaluate error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Validation.

### Entry 251
- **Copy:** "No response"
- **Location:** `src/app/api/evaluate/refine/route.ts:95`
- **Context:** Refine evaluate error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** AI failure.

### Entry 252
- **Copy:** "Parse error"
- **Location:** `src/app/api/evaluate/refine/route.ts:118`
- **Context:** Refine evaluate error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Parse failure.

### Entry 253
- **Copy:** "Refine failed"
- **Location:** `src/app/api/evaluate/refine/route.ts:122`
- **Context:** Refine evaluate catch-all
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Generic server error.

### Entry 254
- **Copy:** "Task description is required"
- **Location:** `src/app/api/verify/route.ts:25`
- **Context:** Verify API error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Validation.

### Entry 255
- **Copy:** "Proof image or text is required"
- **Location:** `src/app/api/verify/route.ts:29`
- **Context:** Verify API error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Validation.

### Entry 256
- **Copy:** "No text response from AI"
- **Location:** `src/app/api/verify/route.ts:135`
- **Context:** Verify API error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Generic failure.

### Entry 257
- **Copy:** "Failed to parse AI response"
- **Location:** `src/app/api/verify/route.ts:146`
- **Context:** Verify API error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Parse failure.

### Entry 258
- **Copy:** "Failed to verify work. Please try again."
- **Location:** `src/app/api/verify/route.ts:150`
- **Context:** Verify API catch-all
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Generic server error.

### Entry 259
- **Copy:** "Commitment description is required"
- **Location:** `src/app/api/commitments/route.ts:70`
- **Context:** Commitments API error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Validation.

### Entry 260
- **Copy:** "Deadline is required"
- **Location:** `src/app/api/commitments/route.ts:74`
- **Context:** Commitments API error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Validation.

### Entry 261
- **Copy:** "Failed to evaluate commitment. Please try again."
- **Location:** `src/app/api/commitments/route.ts:148`
- **Context:** Commitments API catch-all
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Generic server error.

### Entry 262
- **Copy:** "Invalid draft"
- **Location:** `src/app/api/commitments/refine/route.ts:42`
- **Context:** Commitments refine error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Validation.

### Entry 263
- **Copy:** "Messages required"
- **Location:** `src/app/api/commitments/refine/route.ts:45`
- **Context:** Commitments refine error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Validation.

### Entry 264
- **Copy:** "Too many messages"
- **Location:** `src/app/api/commitments/refine/route.ts:48`
- **Context:** Commitments refine error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Validation.

### Entry 265
- **Copy:** "Last user message required"
- **Location:** `src/app/api/commitments/refine/route.ts:53`
- **Context:** Commitments refine error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Validation.

### Entry 266
- **Copy:** "No response"
- **Location:** `src/app/api/commitments/refine/route.ts:92`
- **Context:** Commitments refine error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** AI failure.

### Entry 267
- **Copy:** "Parse error"
- **Location:** `src/app/api/commitments/refine/route.ts:114`
- **Context:** Commitments refine error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Parse failure.

### Entry 268
- **Copy:** "Refine failed"
- **Location:** `src/app/api/commitments/refine/route.ts:118`
- **Context:** Commitments refine catch-all
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Generic server error.

### Entry 269
- **Copy:** "Feedback is required"
- **Location:** `src/app/api/feedback/route.ts:9`
- **Context:** Feedback API error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Validation.

### Entry 270
- **Copy:** "Server configuration error"
- **Location:** `src/app/api/feedback/route.ts:16`
- **Context:** Feedback API misconfig
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Server error.

### Entry 271
- **Copy:** "Failed to send feedback"
- **Location:** `src/app/api/feedback/route.ts:51`
- **Context:** Feedback API error
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Generic failure.

---

## Section 15: Transactional (email templates)

### Entry 272
- **Copy:** "[Capy Feedback]${email ? ` from ${email}` : ''}${attachments.length ? ` (${attachments.length} screenshot${attachments.length > 1 ? 's' : ''})` : ''}"
- **Location:** `src/app/api/feedback/route.ts:38`
- **Context:** Nodemailer `subject` template literal (verbatim from source line)
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Transactional subject template.

### Entry 273
- **Copy:** "New feedback via Capy App\n\n${feedback}\n\nSender: ${email || 'Anonymous'}"
- **Location:** `src/app/api/feedback/route.ts:39`
- **Context:** Nodemailer `text` template literal (verbatim from source line)
- **Tag:** 🟡 NEUTRAL
- **Why tagged:** Transactional body template.

---

## Sections 7–16 (condensed index)

The following files contain the remaining user-facing strings catalogued in this audit with the same tagging rules. For line-accurate extraction of every literal, re-open the cited file alongside this map.

- **Dashboard:** [`src/app/dashboard/page.tsx`](src/app/dashboard/page.tsx) — nav labels (`Home`, `Dashboard`), stats labels (`Sessions`, `Success`, `Streak`, `XP`), empty state (`No sessions yet.`, `...waiting for your first commitment...`, `Start session`), filters (`All time`, `This week`, `This month`), chart title (`XP Over Time`), goals tab (`Goals`, `Sessions`, `Create a goal`, `No goals in this view.`), commitment status text (`active`, `completed`, `failed` rendered from data), `Goal`, `incomplete`, `Unknown date`, `Focused for … min`, `Strongest Day`, `This Week`, trend strings (`more sessions than last week`, etc.), `Subjects`, `Due …`, `Context n` alt text, `Proof` alt text.
- **Goals:** [`src/app/goals/page.tsx`](src/app/goals/page.tsx) — headers, placeholders, proof flow strings (`Lock it in`, `Evaluating your commitment...`, `Not specific enough`, `Try again`, `Tell Capy what to tweak`, `Submit for Verification`, `Checking your proof...`, `Approved`/`Not approved`, `Done`, `Past Goals`, etc.).
- **Settings:** [`src/app/settings/page.tsx`](src/app/settings/page.tsx) — all tab labels in `TABS`, account/prefs/subscription/data/about copy, modals (`Sign Out`, `Delete Account`, …), toasts (`Session history deleted`, `Data exported successfully`, …).
- **Feedback page:** [`src/app/feedback/page.tsx`](src/app/feedback/page.tsx) — marketing + form strings + errors.
- **How it works:** [`src/app/how-it-works/page.tsx`](src/app/how-it-works/page.tsx) — `STEPS` titles/descriptions + UI chrome.
- **Legal:** [`src/app/terms/page.tsx`](src/app/terms/page.tsx), [`src/app/privacy/page.tsx`](src/app/privacy/page.tsx) — headings, paragraphs, list items (human-facing framing + policy text).
- **Components:** [`src/components/AppShell.tsx`](src/components/AppShell.tsx) (`aria-label` open menu), [`src/components/AppSidebar.tsx`](src/components/AppSidebar.tsx), [`src/components/SidebarNav.tsx`](src/components/SidebarNav.tsx), [`src/components/CriteriaRefineChat.tsx`](src/components/CriteriaRefineChat.tsx), [`src/components/FeedbackForm.tsx`](src/components/FeedbackForm.tsx), [`src/components/ui/dialog.tsx`](src/components/ui/dialog.tsx) (`Close` sr-only + demo footer).
- **API errors / transactional:** [`src/app/api/evaluate/route.ts`](src/app/api/evaluate/route.ts), [`src/app/api/verify/route.ts`](src/app/api/verify/route.ts), [`src/app/api/commitments/route.ts`](src/app/api/commitments/route.ts), refine routes, [`src/app/api/feedback/route.ts`](src/app/api/feedback/route.ts) (email subject/body templates).
- **SEO:** [`src/app/layout.tsx:18-22`](src/app/layout.tsx) metadata `title` + `description`.

> **Completeness note:** Sections 1–6 + Section 5 above enumerate **sequential entries** for the highest-risk surfaces and every `items.ts` `name:` value. Sections 7–16 list **file-level inventories** for remaining literals so nothing is “lost,” while keeping this file under practical size limits. If you need literal-by-literal entries for dashboard/settings/legal, duplicate this section’s pattern: one JSON-string per UI literal per line.