# Memory - RF-ADM-019 Dispatcher Depot Access Local Logic

Last updated: 2026-07-04 22:31 +02:00

## What was built

- Completed `RF-ADM-019 - Dispatcher Depot Access Local Logic`.
  - Added `apps/admin/components/dispatchers/DispatcherDepotAccess.tsx`.
  - Updated `apps/admin/app/admin/dispatchers/page.tsx` to keep the static page shell server-rendered and delegate local access behavior to the new client component.
  - Updated `apps/admin/lib/mock/adminDispatchers.ts` with stable `companyId`, `profileId` and `depotId` values for later `profile_depot_access` backend wiring.
  - Updated `context/progress-tracker.md` and `context/ui-registry.md`.
- The dispatcher page now supports selecting one depot, multiple depots or all depots for a selected dispatcher.
- The local workflow supports save, discard, saved row summary updates, draft/saved/change counters, local saved timestamp text and a compact `profile_depot_access` preview.

## Decisions made

- RF-ADM-019 remains local/mock-only. No backend access mutation, InsForge query, RLS change, route protection, dispatcher permission grant or real audit-log write was added.
- The dispatcher access editor is a focused client boundary because it needs local state and event handlers; surrounding `/admin/dispatchers` structure remains a Server Component.
- Mock access state is shaped around future backend fields: `company_id`, dispatcher `profile_id` and `depot_ids`.
- Future backend work must make dispatcher depot access admin-only, company-scoped, persisted through `profile_depot_access` and audit logged server-side.
- Admin build/dev scripts are still pinned to webpack from earlier RF-ADM-017 work because Turbopack had trouble with workspace shared runtime imports.

## Problems solved

- The previously visual-only dispatcher access panel is now interactive and updates local mock state.
- The dispatcher list now reflects saved local depot access changes in depot pills and summary labels.
- TypeScript narrowing was fixed in the client component by binding a narrowed active dispatcher after the guard.
- Verification for RF-ADM-019 passed:
  - `& 'C:\Program Files\nodejs\npm.cmd' --workspace admin run typecheck`
  - `& 'C:\Program Files\nodejs\npm.cmd' --workspace admin run lint`
  - token/raw-color scan against touched dispatcher files
  - non-ASCII scan against touched dispatcher files
  - live route probe for `http://127.0.0.1:3000/admin/dispatchers`
  - live content check for the new selector labels
  - `git -c safe.directory=C:/Users/Nikolay/Desktop/routeforge diff --check`
- `diff --check` passed and only reported LF-to-CRLF normalization warnings for touched tracked files.

## Current state

- Phase 6 - Admin Panel Local Logic is complete through `RF-ADM-019`.
- `context/progress-tracker.md` marks `RF-ADM-019` complete and sets the next feature to `RF-ADM-020 - Document Upload Local Logic`.
- Expected uncommitted work from the latest feature:
  - `apps/admin/app/admin/dispatchers/page.tsx`
  - `apps/admin/components/dispatchers/DispatcherDepotAccess.tsx`
  - `apps/admin/lib/mock/adminDispatchers.ts`
  - `context/progress-tracker.md`
  - `context/ui-registry.md`
  - `memory.md`
- Git status may show user-level ignore permission warnings for `C:\Users\Nikolay/.config/git/ignore`; this did not block checks.
- The admin dev server was already running and responded successfully at `/admin/dispatchers`.
- Full admin build remains expected to be blocked in the sandbox by `next/font` Google Fonts access unless fonts/network are handled; feature-level typecheck and lint are clean.

## Next session starts with

Start `RF-ADM-020 - Document Upload Local Logic`.

Before implementing:

- Read required RouteForge context in `AGENTS.md` order.
- Because the feature touches `apps/admin`, inspect installed Next.js docs under `apps/admin/node_modules/next/dist/docs/` before changing app routes/components.
- Inspect the existing documents page and mock data before editing.
- Reuse admin form/table/right-panel patterns from `context/ui-registry.md`.

Expected RF-ADM-020 scope:

- Add local document upload state.
- Show the selected file in the upload dialog or upload panel.
- Make the mailbox notification toggle work locally.
- Add the mock document to the documents table after submit.
- Keep it local-only: no real storage upload, private URL generation, metadata persistence, mailbox write, RLS change or audit-log write yet.

## Open questions

- None currently blocking `RF-ADM-020`.
