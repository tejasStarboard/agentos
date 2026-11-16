# 50 — Auth account settings panel (proper user account UI)

**Status:** in-progress

## Goal

Replace the Auth secondary Activity Bar page’s minimal “signed in as… / Sign out” surface with a **proper user account settings panel**: profile summary, editable display name, roles readout, change-password (when signed in), and a clear sign-out action — still distinct from the topbar **settings** extension (ticket **48**).

Today `packages/core/builtins/auth/ui/page.tsx` is a thin session dump + one button. Ticket **43** correctly moved public auth to Shell gate routes; this ticket owns making the **in-app account** surface feel like a real settings panel.

## Depends on

- Ticket **43** (auth gate + account page exists) — done / in-progress
- Ticket **15** / **21** (builtin auth + API kit auth)
- Ticket **48** (builtin settings) — **orthogonal**; do not merge account into app settings

## Done when

- [x] `builtins/auth/ui/page.tsx` (and optional `ui/` components under kebab-case files) presents a structured **Account** panel, not a single paragraph + Sign out
- [x] **Profile** section: show email (read-only), display name; allow updating name via Auth API when Better Auth supports it
- [x] **Roles** section: list session roles (read-only); empty state when none
- [x] **Security** section: change password while signed in (current + new + confirm), or a clear “use forgot-password” path if in-session change is deferred — document choice
- [x] **Session** section: Sign out (existing behavior → redirect `/login`); loading / error / unsigned-in states stay clear
- [x] Auth API gains any missing routes (e.g. update profile / change password) under `/api/ext/auth/*`; use Better Auth APIs, no second auth stack
- [x] UI from `@agentos/ui` (`Card` / `Separator` / `Input` / `Button` / `Badge` / `Label` as needed); no native controls
- [x] Tests: account page render states; new API routes round-trip where added
- [x] Docs: `builtins.md` / cookbook note Auth secondary = full account panel (vs Settings = app prefs)

## Notes

- Keep Activity Bar **secondary** auth entry = **account**. Ticket **48** settings = theme / branding / app prefs.
- Prefer composing small presentational pieces under `builtins/auth/ui/` (`account-profile-section.tsx`, etc.) over one giant page file.
- Do not put public `/login` / `/register` UI back into the extension iframe.
- Secrets / Better Auth server config stay in extension env; no customer `DATABASE_URL`.

## Verify

- `agentos dev` → Auth secondary → account panel shows profile, roles, security, sign out
- Update name / change password (if shipped) persist; sign out → `/login`
- `bun test` auth builtin + any shell/UI tests touched
