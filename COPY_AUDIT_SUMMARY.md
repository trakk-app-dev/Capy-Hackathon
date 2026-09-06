# Capy Copy Audit — Executive Summary

Generated: 2026-04-16

## The Numbers

- **Total copy entries:** 273 sequentially numbered `### Entry n` records in [COPY_AUDIT.md](./COPY_AUDIT.md), plus **Sections 7–16 file inventories** for remaining literals not expanded line-by-line (dashboard, settings, legal, etc.).
- **🟢 Identity-aligned:** 9 (3.3% of tagged entry lines in the automated pass)
- **🟡 Neutral:** 263 (96.3%)
- **🔴 Off-brand / study-tool vibes:** 12 (4.4%)
- **🎯 High-leverage entries flagged (secondary on any line):** 12
- **⚠️ Character drift instances (secondary):** 11

> Counts are computed from **Tag:** lines in Sections 1–6 + Section 5 of `COPY_AUDIT.md` (same pass as the generator script). Expand Sections 7–16 to full entry-by-entry tagging to increase totals.

## The Verdict

The product is **strongest** where it sells **proof-based accountability** and the **“Other apps trust you. Capy doesn’t.”** differentiator ([`src/app/page.tsx`](src/app/page.tsx)). The **AI evaluation and verification prompts** are detailed, student-realistic, and generous about digital proof — that aligns well with an anti-honor-system promise.

The brand is **weakest** wherever copy **centers “procrastination” as the user’s defining trait**, uses **commanding “stop / don’t let them down” pressure**, or slips into **generic praise** (“Excellent work!”, “Great work!”) without tying praise to visible evidence. **Onboarding** mixes helpful clarity with **shame-adjacent hustle phrases** (“Zero excuses”, “No cheating”). **Settings → About** still describes Capy as helping students “stop procrastinating,” which fights the identity thesis. **Mock verification** copy is especially off-brand because many users will see it without an API key.

**Coverage caveat:** [COPY_AUDIT.md](./COPY_AUDIT.md) expands **every** `items.ts` display name, **full** Section 5 prompts, **API error strings**, **transactional email templates**, **SEO metadata**, and line-by-line tagging for **landing → onboarding → core session flow → closet**. Dashboard, goals (beyond overlaps), settings (beyond paywall/meta), legal pages, feedback/how-it-works pages, and shell/nav are indexed in **Sections 7–16** so nothing is “missing” as a file pointer — a follow-up pass can explode those files into the same five-field entry format if you need literal completeness there too.

## Top 10 Highest-Priority Rewrites

Ranked by 🎯 high-leverage first, then 🔴 severity, then emotional peak proximity.

### 1. Landing hero headline — procrastination frame

- **Current:** `Meet the pet that won't let you procrastinate.`
- **Location:** [`src/app/page.tsx:102`](src/app/page.tsx)
- **Why it matters:** First brand promise visitors see; it labels the user as “a procrastinator” and uses external control (“won’t let you”) instead of systems/self-trust framing.

### 2. Landing CTA — “stop procrastinating”

- **Current:** `Ready to stop procrastinating?`
- **Location:** [`src/app/page.tsx:327`](src/app/page.tsx)
- **Why it matters:** Bottom-of-funnel CTA repeats moralized “procrastination” language at a conversion moment.

### 3. Mock verification feedback — hollow excellence praise

- **Current:** `Excellent work! Your proof clearly shows you completed "…". I can see you put in genuine effort…`
- **Location:** [`src/app/api/verify/route.ts:8`](src/app/api/verify/route.ts) (template literal body)
- **Why it matters:** Shapes the emotional peak (approval) when `ANTHROPIC_API_KEY` is unset; reads like generic praise, not evidence-first Capy Teacher voice.

### 4. Evaluate system prompt — “strict” Capy Teacher

- **Current:** `You are the Capy Teacher — a strict but encouraging capybara tutor…`
- **Location:** [`src/app/api/evaluate/route.ts:86-111`](src/app/api/evaluate/route.ts) (full text in [COPY_AUDIT.md](./COPY_AUDIT.md) Section 5)
- **Why it matters:** Highest-leverage invisible copy: sets tone for stakes, shame vs support, and how students feel “seen.”

### 5. Verify reaction line — “Great work!”

- **Current:** `Great work!`
- **Location:** [`src/app/verify/page.tsx:455`](src/app/verify/page.tsx)
- **Why it matters:** Post-verdict XP moment; hollow congratulation undercuts the “proof as self-esteem evidence” thesis.

### 6. Onboarding “How Capy works” subhead — “Zero excuses”

- **Current:** `Four steps. Zero excuses.`
- **Location:** [`src/app/onboarding/page.tsx:331`](src/app/onboarding/page.tsx)
- **Why it matters:** First-run emotional contract; reads as hustle culture / moral pressure vs systems empathy.

### 7. Onboarding step copy — “No cheating” + pet guilt

- **Current:** `No cheating.` (in XP bullet) and landing-adjacent “don’t let them down” / timer “don’t let them down” patterns
- **Location:** [`src/app/onboarding/page.tsx:337`](src/app/onboarding/page.tsx); see also [`src/app/page.tsx:194`](src/app/page.tsx)
- **Why it matters:** “No cheating” is compliance policing; pet guilt lines blur **pet as silent anchor** vs **judge**.

### 8. Goals saved confirmation — “No backing out”

- **Current:** `Commitment locked in. No backing out now.`
- **Location:** [`src/app/goals/page.tsx:633`](src/app/goals/page.tsx)
- **Why it matters:** Stakes should feel real, but this sounds like intimidation rather than chosen commitment.

### 9. Settings About blurb — “stop procrastinating”

- **Current:** `Capy is an AI-powered accountability partner that helps students stop procrastinating.`
- **Location:** [`src/app/settings/page.tsx:806`](src/app/settings/page.tsx)
- **Why it matters:** Canonical product definition in settings; should match identity thesis for returning users.

### 10. Verify timer-expired feedback — disappointed pet

- **Current:** `Time ran out before you could submit your proof. Your capybara is disappointed, but not giving up on you.`
- **Location:** [`src/app/verify/page.tsx:127`](src/app/verify/page.tsx)
- **Why it matters:** Failure peak; “disappointed” anthropomorphizes the pet into a moral judge (character drift + shame risk).

## Every 🔴 Flagged Entry (grouped by section)

### Marketing / Landing

- [`src/app/page.tsx:102`](src/app/page.tsx) — `Meet the pet that won't let you procrastinate.`
- [`src/app/page.tsx:194`](src/app/page.tsx) — `don't let them down` (inside `Race the clock` description)
- [`src/app/page.tsx:327`](src/app/page.tsx) — `Ready to stop procrastinating?`
- [`src/app/settings/page.tsx:806`](src/app/settings/page.tsx) — `helps students stop procrastinating` (About blurb)

### Onboarding

- [`src/app/onboarding/page.tsx:21`](src/app/onboarding/page.tsx) — `Not letting someone down` (quiz option)
- [`src/app/onboarding/page.tsx:331`](src/app/onboarding/page.tsx) — `Four steps. Zero excuses.`
- [`src/app/onboarding/page.tsx:337`](src/app/onboarding/page.tsx) — `No cheating.`

### Session / Verify / Evaluate UI

- [`src/app/verify/page.tsx:127`](src/app/verify/page.tsx) — `Your capybara is disappointed…`
- [`src/app/verify/page.tsx:300`](src/app/verify/page.tsx) — `Approved!` (context: verdict flash; generic triumph vs proof-earned)
- [`src/app/verify/page.tsx:455`](src/app/verify/page.tsx) — `Great work!`
- [`src/app/verify/page.tsx:456`](src/app/verify/page.tsx) — `Better luck next time.` (dismissive / luck framing)

### Goals

- [`src/app/goals/page.tsx:633`](src/app/goals/page.tsx) — `Commitment locked in. No backing out now.`

### AI system strings (API)

- [`src/app/api/evaluate/route.ts:86`](src/app/api/evaluate/route.ts) — `strict but encouraging`
- [`src/app/api/commitments/route.ts:87`](src/app/api/commitments/route.ts) — `strict but encouraging`
- [`src/app/api/verify/route.ts:8`](src/app/api/verify/route.ts) — mock `Excellent work!…`
- [`src/app/api/verify/route.ts:128`](src/app/api/verify/route.ts) — `Be encouraging even when giving partial credit` (can encourage hollow warmth if model over-applies)

### Paywall / Premium (placeholder)

- [`src/app/settings/page.tsx:618`](src/app/settings/page.tsx) — `Unlock unlimited sessions, exclusive accessories, and priority AI verification.` (generic SaaS benefit stack)

*(See [COPY_AUDIT.md](./COPY_AUDIT.md) for the full 🔴 list including legal-page “study accountability” framing, testimonial quotes, and additional API helper strings.)*

## AI System Prompt Audit (special focus)

### Prompt: Evaluate (session stakes + task scope)

- **Location:** [`src/app/api/evaluate/route.ts:86-111`](src/app/api/evaluate/route.ts)
- **Current tone:** Competent TA / tutor: rules-heavy, fairness-oriented, emphasizes scope clarity and digital-proof flexibility; opens with **“strict but encouraging.”**
- **Identity thesis alignment:** **Partial.** Scope clarity and anti-vagueness support a **systems** lens; “strict” and accountability-as-enforcement can feel **character-judgment-adjacent** without careful model behavior.
- **Specific drift issues:** “Capy Teacher” is not explicitly **nerdy / glasses** persona here; voice reads closer to **rubric engine** than a named character.
- **Character consistency check:** **Weak nerdy-capy flavor**; anti-shame depends heavily on model interpreting “encouraging” over “strict.”

### Prompt: Evaluate refine (pre-timer plan edits)

- **Location:** [`src/app/api/evaluate/refine/route.ts:73-89`](src/app/api/evaluate/refine/route.ts)
- **Current tone:** Operational JSON updater with light in-world framing (“Capy Teacher”, “FOCUS SESSION”).
- **Identity thesis alignment:** **Neutral-to-good**; low emotional risk; little identity language.
- **Character drift:** Minimal; also minimal **persona**.

### Prompt: Verify (vision verdict)

- **Location:** [`src/app/api/verify/route.ts:111-129`](src/app/api/verify/route.ts) (system string; also dynamic insertion of `taskDescription` at line 111)
- **Current tone:** Fair verifier: generous partial credit, digital-proof realism, asks for **specific visible evidence** in feedback — aligns well with **proof-based self-trust**.
- **Identity thesis alignment:** **Strong** on “evidence over vibes.”
- **Character drift:** Still not strongly **nerdy capybara**; more “good TA.”

### Prompt: Commitments create (goal gatekeeper)

- **Location:** [`src/app/api/commitments/route.ts:87-122`](src/app/api/commitments/route.ts)
- **Current tone:** Gatekeep + refine; rejects vagueness with examples; “strict but encouraging” again.
- **Identity thesis alignment:** **Mixed** — specificity supports executive-dysfunction-friendly clarity; strictness can read as **lecture energy** if rejection reasons aren’t warm.

### Prompt: Commitments refine

- **Location:** [`src/app/api/commitments/refine/route.ts:70-86`](src/app/api/commitments/refine/route.ts)
- **Current tone:** Explicit **“nerdy, encouraging capybara”**; warmest persona match in API set.
- **Identity thesis alignment:** **Best match** among prompts.

## Patterns I Noticed

- **Procrastination-as-identity shows up in marketing, About, and mock AI**, even while other screens talk about proof and systems — thesis drift between channels.
- **Pet is sometimes a moral agent** (“disappointed”, “don’t let them down”) which conflicts with “silent emotional anchor” positioning.
- **Generic triumph/fail labels** (`Approved!`, `Not quite`, `Great work!`) appear at peak emotion moments where specificity would reinforce identity evidence.
- **API prompts prioritize evaluation correctness** over **distinctive Capy Teacher voice**; refine/commitments routes are slightly warmer than evaluate/verify.
- **Paywall/premium strings** read like a generic SaaS upgrade card (unlimited / priority), not the differentiated “seen + proof” story.

## What’s Already Working

- **Differentiator line** “Other apps trust you. Capy doesn’t.” ([`src/app/page.tsx:240`](src/app/page.tsx)) is memorable and on-thesis 🟢 🎯.
- **Verify prompt** insistence on citing **specific visible details** from proof ([`src/app/api/verify/route.ts:121-128`](src/app/api/verify/route.ts)) matches “identity evidence” better than most student apps 🟢.
- **How-it-works** route explains the loop with concrete mechanics (timer behavior, proof upload placement) — useful, non-mythic 🟡/🟢 depending on line.
