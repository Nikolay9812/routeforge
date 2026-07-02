# Memory - RF-ADM-007 Couriers List UI

Last updated: 2026-07-02 06:45 +02:00

## What was built

- Completed `RF-ADM-007 - Couriers List UI`.
- Added the admin couriers list route:
  - `apps/admin/app/admin/couriers/page.tsx`
- Added courier-list mock data:
  - `apps/admin/lib/mock/adminCouriers.ts`
- Updated RouteForge tracking and UI registry:
  - `context/progress-tracker.md`
  - `context/ui-registry.md`
- The `/admin/couriers` page includes a hero, invite courier action, summary tiles, static search/depot/status/payment filters, reset/apply visual controls and a dense courier table.
- The table shows name/contact, depot, profile status, payment mode, last shift, document status and actions for profile/documents.

## Decisions made

- `RF-ADM-007` remains UI-first and mock-only. No InsForge query, auth/session work, route protection, RLS change, filter state, invitation creation, courier approval, document upload or audit-log write was added.
- The page is a Server Component using static mock data.
- Courier rows are company-scoped for the admin mock view. Real dispatcher views must be depot-scoped by backend/RLS before data is loaded.
- Profile links point at planned `/admin/couriers/[id]` routes owned by `RF-ADM-008`.
- The invite courier action points at the planned `/admin/invitations` route; actual invitation creation belongs to later features.
- Styling uses RouteForge semantic token classes only. No hardcoded hex values or raw Tailwind color utilities were added in touched admin files.

## Problems solved

- The admin sidebar `Kuriere` route now resolves to a real UI page instead of a missing route.
- `context/progress-tracker.md` now marks `RF-ADM-007` complete and sets the next feature to `RF-ADM-008 - Courier Profile Admin UI`.
- `context/ui-registry.md` now includes the `Admin Couriers List Screen` pattern and marks the planned courier table pattern implemented.
- Verification passed:
  - `& 'C:\Program Files\nodejs\npm.cmd' --workspace admin run typecheck`
  - `& 'C:\Program Files\nodejs\npm.cmd' --workspace admin run lint`
  - token/raw-color scan against `apps/admin/app/admin/couriers` and `apps/admin/lib/mock/adminCouriers.ts`
  - non-ASCII scan against `apps/admin/app/admin/couriers` and `apps/admin/lib/mock/adminCouriers.ts`
  - live route probe for `http://127.0.0.1:3000/admin/couriers`
  - `git -c safe.directory='C:/Users/Nikolay/Desktop/routeforge' diff --check`
- `diff --check` had no whitespace errors; it only reported LF-to-CRLF warnings for `context/progress-tracker.md`, `context/ui-registry.md` and `memory.md`.

## Current state

- Phase 5 - Admin Panel UI With Mock Data is complete through `RF-ADM-007`.
- Expected uncommitted work from this session:
  - `apps/admin/app/admin/couriers/page.tsx`
  - `apps/admin/lib/mock/adminCouriers.ts`
  - `context/progress-tracker.md`
  - `context/ui-registry.md`
  - `memory.md`
- Git status may still show user-level ignore permission warnings for `C:\Users\Nikolay/.config/git/ignore`; this did not block checks.

## Next session starts with

Start `RF-ADM-008 - Courier Profile Admin UI`.

Before implementing:

- Read required RouteForge context in `AGENTS.md` order.
- Because the feature touches `apps/admin`, inspect the installed Next.js docs under `apps/admin/node_modules/next/dist/docs/` before changing app routes/components.
- Reuse the admin courier list patterns from `context/ui-registry.md`.

Expected next scope:

- Build `/admin/couriers/[id]` as a mock-only courier profile/admin detail page.
- Include courier header, status badge, approve/suspend buttons, personal data, payment mode card, depot assignment, documents list, recent shifts and notes.
- Do not add real backend mutation, RLS change, approval action, suspension action, document upload or audit-log write yet.

## Open questions

- None currently blocking `RF-ADM-008`.
