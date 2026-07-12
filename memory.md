# Memory - RF-DOC-001 Daily PDF Generation

Last updated: 2026-07-12 12:43 +02:00

## Last completed

- Completed `RF-BE-013 - History Backend`.
- Connected `apps/mobile/app/(tabs)/history.tsx` to real self-scoped backend shifts through `loadCourierShiftsForMonth(...)`.
- Added a real empty-month state so a backend month with no shifts shows zero totals and an empty message instead of mock rows.
- Added `loadCourierShiftForDate(...)` in `apps/mobile/features/shifts/shiftBackend.ts`.
- Added server history detail hydration in `apps/mobile/features/history/historyHydration.ts`.
- Wired `apps/mobile/app/history/[date].tsx` to prefer real day details from backend shifts, locations, proof-photo metadata and signature artifact metadata.
- Kept local submitted-report and mock history fallback only for unavailable backend data or development/demo states.
- Updated `context/progress-tracker.md` and `context/ui-registry.md`.

## Decisions made

- RF-BE-013 does not add a database migration; existing RLS-scoped tables and the existing `get_shift_signature_artifact(...)` RPC are sufficient.
- Courier history queries remain self-scoped by `courier_profile_id`; RLS remains the backend boundary.
- Daily and monthly PDF buttons remain visible UI entry points, but real PDF generation is deferred to Phase 8.
- Day detail depot display uses the hydrated courier depot label. Historical multi-depot labels can be refined later if couriers move between depots.
- Missing start/stop location metadata is treated as a visible warning in day details.

## Verification

- Passed:
  - `npm --workspace mobile run typecheck`
  - `npm --workspace mobile run lint` outside the sandbox because the sandboxed import resolver hits EPERM under `C:\Users\Nikolay`

## Current state

- RF-BE-013 is implemented locally and marked complete in `context/progress-tracker.md`.
- Next feature is `RF-DOC-001 - Daily PDF Generation`.
- Working tree still contains uncommitted earlier backend feature changes; do not revert unrelated files.

## Next session starts with

1. Read RouteForge context files in the required `AGENTS.md` order.
2. Implement `RF-DOC-001 - Daily PDF Generation`.
3. Use server-side PDF generation only; do not generate PDFs in mobile client code.
4. Validate daily PDF access by authenticated courier/admin/dispatcher scope before returning or storing files.
5. Include company, courier, shift date, depot, vehicle, time, break, billable time, KM, packages, signature, approval status and company stamp support hook where available.
