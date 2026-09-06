# Capy — File Tree

```
src/
  app/
    page.tsx                      — Landing page (public, no auth)
    layout.tsx                    — Root layout, loads fonts + AppShell wrapper
    globals.css                   — Full design system (shadows, gradients, animations, toggles)
    favicon.ico                   — App favicon
    signup/
      page.tsx                    — Sign up with Google/email/guest
    onboarding/
      page.tsx                    — 10-slide onboarding quiz + pet creation + egg hatch
    home/
      page.tsx                    — Session setup (task input, image upload, time slider)
    evaluate/
      page.tsx                    — AI evaluation phases (scanning, context Q, result, countdown)
    timer/
      page.tsx                    — Countdown timer + proof upload (screenshots/text)
    verify/
      page.tsx                    — AI verification + XP reward/penalty + level-up
    dashboard/
      page.tsx                    — Session history log + stats (streak, success rate)
    closet/
      page.tsx                    — Pet customization (hats, clothes, colors)
    settings/
      page.tsx                    — Settings (Account, Preferences, Subscription, Data & Privacy, About)
    feedback/
      page.tsx                    — Feedback page (stub)
    how-it-works/
      page.tsx                    — How It Works page (stub)
    api/
      evaluate/
        route.ts                  — POST: evaluate task with Claude AI (or mock)
      verify/
        route.ts                  — POST: verify proof with Claude AI vision (or mock)
  components/
    AppShell.tsx                  — Auth guard + sidebar layout wrapper
    AppSidebar.tsx                — Expandable rail sidebar (hover to expand)
    AuthProvider.tsx              — React context for auth state
    CapyPet.tsx                   — SVG pet with 6 expressions, 15 hats, 12 clothes, 15 colors
    CapyTeacher.tsx               — SVG teacher capybara with glasses + 5 expressions
    SidebarNav.tsx                — Legacy sliding overlay sidebar (unused)
    FeedbackForm.tsx              — Feedback modal via mailto
    ui/                           — shadcn/ui component library
  lib/
    firebase.ts                   — Firebase stub (exports null, mocked)
    auth.ts                       — Auth functions (localStorage mock)
    db.ts                         — Database read/write (localStorage mock)
    storage.ts                    — File upload (URL.createObjectURL mock)
    items.ts                      — Item definitions: 15 hats, 12 clothes, 15 colors
    utils.ts                      — cn() utility for Tailwind class merging
CLAUDE.md                         — Full product spec + current state
CAPY_USER_STORY.md                — User stories with gap analysis
CHANGELOG.md                      — Change history
FILE_TREE.md                      — This file
AGENTS.md                         — Next.js agent rules
package.json                      — Dependencies and scripts
next.config.ts                    — Next.js configuration
tsconfig.json                     — TypeScript configuration
postcss.config.mjs                — PostCSS configuration
eslint.config.mjs                 — ESLint configuration
components.json                   — shadcn/ui configuration
.env.local                        — Environment variables (ANTHROPIC_API_KEY)
```
