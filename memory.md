# Memory - RF-ADM-021 and RF-ADM-022 Admin Local Logic

Last updated: 2026-07-05 05:05 +02:00

## What was built

- Completed `RF-ADM-021 - Invitation Local Logic`.
  - Added `apps/admin/components/invitations/InvitationLocalLogic.tsx`.
  - Updated `apps/admin/app/admin/invitations/page.tsx` to keep the route shell server-rendered and delegate local invitation behavior to the client component.
  - Updated `context/progress-tracker.md` and `context/ui-registry.md`.
- The invitations page now supports editable local invite draft fields, generated invite-code placeholder, local row creation, local revocation for active invites, dynamic summary counts and expired badge simulation.
- Completed `RF-ADM-022 - Export Preview Local Logic`.
  - Added `apps/admin/components/exports/ExportPreviewLocalLogic.tsx`.
  - Updated `apps/admin/app/admin/exports/page.tsx` to keep the route shell server-rendered and delegate local export preview behavior to the client component.
  - Updated `context/progress-tracker.md` and `context/ui-registry.md`.
- The exports page now supports local month, depot and payment-mode filters, approved-only preview rows, dynamic totals, an empty-preview state and local CSV/XLSX prepare actions.

## Decisions made

- RF-ADM-021 remains local/mock-only. No backend invitation insert, email sending, invite-code validation, profile creation, revocation mutation, route protection, RLS change or real audit-log write was added.
- RF-ADM-022 remains local/mock-only. No backend query, real CSV generation, real XLSX generation, file download, route protection, RLS change or real audit-log write was added.
- Admin feature pages continue to keep route shells as Server Components and isolate browser-local workflow state inside focused client components.
- Real invitation creation and revocation must later be company-scoped, permission-checked server-side and audit logged.
- Real accountant export generation must later be admin-permissioned by default, company-scoped, approved-shifts-only, based on `billable_minutes` and audit logged server-side.
- Admin client components should avoid runtime imports from workspace shared modules until the admin bundling path is hardened; use type-only imports or local UI guards in local mock components.

## Problems solved

- Static invitations UI is now an interactive local workflow.
- Static export preview UI is now locally filterable and recalculates totals from mock approved rows.
- A `/admin/exports` runtime `500` was fixed by removing a runtime `@routeforge/shared` import from the client component and using a local approved-status guard.
- Verification for the latest features passed:
  - `& 'C:\Program Files\nodejs\npm.cmd' --workspace admin run typecheck` with `C:\Program Files\nodejs` added to `PATH`
  - `& 'C:\Program Files\nodejs\npm.cmd' --workspace admin run lint` with `C:\Program Files\nodejs` added to `PATH`
  - token/raw-color scans against touched admin invitation/export files
  - non-ASCII scans against touched admin invitation/export code files
  - live route probe for `http://127.0.0.1:3000/admin/invitations`
  - live route probe for `http://127.0.0.1:3000/admin/exports`
  - `& 'C:\Program Files\Git\cmd\git.exe' -c safe.directory=C:/Users/Nikolay/Desktop/routeforge diff --check`
- `diff --check` passed and only reported LF-to-CRLF normalization warnings for touched tracked files.

## Current state

- Phase 6 - Admin Panel Local Logic is complete through `RF-ADM-022`.
- `context/progress-tracker.md` marks `RF-ADM-022` complete, moves the project to Phase 7 and sets the next feature to `RF-BE-001 - InsForge Auth Integration`.
- Expected uncommitted work from the latest features:
  - `apps/admin/app/admin/invitations/page.tsx`
  - `apps/admin/components/invitations/InvitationLocalLogic.tsx`
  - `apps/admin/app/admin/exports/page.tsx`
  - `apps/admin/components/exports/ExportPreviewLocalLogic.tsx`
  - `context/progress-tracker.md`
  - `context/ui-registry.md`
  - `memory.md`
- Git status may show user-level ignore permission warnings for `C:\Users\Nikolay/.config/git/ignore`; this did not block checks.
- The admin dev server was already running and responded successfully at `/admin/invitations` and `/admin/exports`.
- Full admin build remains expected to be blocked in the sandbox by `next/font` Google Fonts access unless fonts/network are handled; feature-level typecheck and lint are clean.

## Next session starts with

Start `RF-BE-001 - InsForge Auth Integration`.

Before implementing:

- Read required RouteForge context in `AGENTS.md` order.
- Because the feature touches backend/auth and likely app route protection, use the InsForge-related skills if applicable and inspect existing InsForge project files, migrations and shared permission helpers before editing.
- Because the admin app uses Next.js, inspect installed Next.js docs under `apps/admin/node_modules/next/dist/docs/` before changing app routes, server/client boundaries, middleware or auth-related files.
- Keep tenant boundaries explicit: admin has company access, dispatcher is depot-scoped, courier is self-scoped.
- Do not add external auth providers, analytics, AI tooling, scraping or tracking libraries.

Expected RF-BE-001 scope from the tracker/build plan should be confirmed before edits. Likely work is auth integration groundwork and protected route/session handling, not invitation backend logic yet.

## Open questions

- Confirm the exact intended scope for `RF-BE-001 - InsForge Auth Integration` from `context/build-plan.md` before implementation, because Phase 7 starts real backend/auth work and should not be guessed.
