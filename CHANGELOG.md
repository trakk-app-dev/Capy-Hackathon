## 2026-03-28 — Add /goals (Commitments) Feature

### What Changed
- Built `/goals` page with three sections: create commitment (AI scanning UX), active commitments (countdown cards with urgency colors + inline proof submission), and collapsible history
- Added `CommitmentData` type and 5 CRUD functions + `failOverdueCommitments()` to `db.ts`
- Added `POST /api/commitments` route — AI refines user input into verifiable commitment or hard-rejects vague tasks; mock fallback when no API key
- Proof submission reuses existing `/api/verify` route and `uploadMultipleImages` storage flow
- Deadline enforcement runs on mount in both `/goals` and `/home` — auto-fails overdue commitments with XP penalty
- Added "Goals" target icon to `AppSidebar.tsx` and `SidebarNav.tsx` between Dashboard and Settings/Closet
- Extended `deleteAccount()` and `exportUserData()` to include commitments collection
- Added `.gradient-goals` CSS class to `globals.css`

### Files Created
- `src/app/goals/page.tsx` — Full goals page with create/active/proof/history flows
- `src/app/api/commitments/route.ts` — AI commitment refinement endpoint

### Files Modified
- `src/lib/db.ts` — Added `CommitmentData`, commitment CRUD, `failOverdueCommitments`, extended `deleteAccount`/`exportUserData`
- `src/components/AppSidebar.tsx` — Added Goals nav item with target SVG icon
- `src/components/SidebarNav.tsx` — Added Goals nav item
- `src/app/home/page.tsx` — Calls `failOverdueCommitments` on mount
- `src/app/globals.css` — Added `.gradient-goals` gradient
- `CLAUDE.md` — Updated screen table, directory structure, Firestore schema

### No New Dependencies
All features built with existing packages (Motion, react-dropzone, Anthropic SDK).

### Design Decisions
- **AI hard-rejects vague tasks** — "be productive" or "study more" gets blocked with a specific suggestion
- **Inline proof submission** — proof panel expands inside the commitment card instead of navigating to a separate page
- **Reuses /api/verify** — same Claude vision verification as timer sessions, no new verification endpoint
- **Deadline auto-fail is idempotent** — only transitions `active` → `failed`, safe to call on every page load
- **Client-side filtering** — fetches all user commitments and filters in memory (no composite Firestore index needed at this scale)
- **Urgency color coding** — green >48h, amber <48h, red <12h with subtle pulse

---

## 2026-03-23 — Add /settings Page

### What Changed
- Built a comprehensive `/settings` page with 5 tabbed sections (Account, Preferences, Subscription, Data & Privacy, About)
- Added 4 new database helpers to `db.ts`: `deleteAccount()`, `resetPet()`, `deleteAllSessions()`, `exportUserData()`
- Added "Settings" gear icon to `AppSidebar.tsx` nav between Dashboard and Closet
- Added `.toggle-switch`, `.toggle-dot`, and `.gradient-settings` CSS to `globals.css`
- User preferences (sound effects, timer tick, spark mode, reduce animations) stored in `localStorage['capy_preferences']`

### Files Created
- `src/app/settings/page.tsx` — Full settings page (~650 lines)

### Files Modified
- `src/lib/db.ts` — Added `deleteAccount`, `resetPet`, `deleteAllSessions`, `exportUserData`
- `src/components/AppSidebar.tsx` — Added Settings nav item with gear SVG icon
- `src/app/globals.css` — Added toggle switch styles and settings gradient

### No New Dependencies
All features built with existing packages (Motion, React).

### Design Decisions
- **Single-file page** — consistent with existing page pattern; all other pages are single-file
- **Preferences in localStorage** — device-local settings (sounds, animations) don't belong in user database
- **Premium subscription placeholder** — pricing card shows "Payments coming soon!" toast since Stripe isn't integrated yet
- **Promo codes placeholder** — input exists, shows "coming soon!" toast
- **Delete account uses type-to-confirm** — user must type "delete" to enable the danger button
- **Reset pet triggers re-onboarding** — sets `onboardingComplete: false` so the egg hatch experience replays
