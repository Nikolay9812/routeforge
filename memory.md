# Memory - RF-MOB-015 and RF-MOB-016 Mobile Local Logic

Last updated: 2026-06-28 16:30 +02:00

## What was built

- Completed `RF-MOB-015 - Daily Fixed Time Display`.
- Updated daily fixed mobile timer/display work:
  - `apps/mobile/features/shifts/useLocalShiftTimer.ts`
  - `apps/mobile/app/(tabs)/home.tsx`
  - `apps/mobile/components/shift/CurrentShiftCard.tsx`
  - `apps/mobile/features/mock/currentShift.ts`
- Completed `RF-MOB-016 - Daily Report Validation`.
- Added local daily report validation backed by shared Zod schema:
  - `apps/mobile/features/report/dailyReportValidation.ts`
- Updated daily report mock and UI validation states:
  - `apps/mobile/features/mock/dailyReport.ts`
  - `apps/mobile/app/(tabs)/report.tsx`
  - `apps/mobile/components/report/ReportField.tsx`
  - `apps/mobile/components/report/PhotoUploadCard.tsx`
  - `apps/mobile/components/report/SignaturePlaceholderCard.tsx`
- Updated RouteForge tracking/context:
  - `context/progress-tracker.md`
  - `context/ui-registry.md`

## Decisions made

- Daily fixed display keeps the main Home timer as real elapsed working time.
- Daily fixed billable display is derived from shared payroll logic and shows the default `8:20h / 500 minutes` separately.
- Daily fixed Home copy explains that admin/dispatcher can correct billable time during review with a reason.
- RF-MOB-015 switched the Home mock state to `daily_fixed` so the UI-first behavior is visible without backend/profile wiring.
- RF-MOB-016 validates core report fields with `packages/shared` `shiftReportSchema`.
- Required proof-photo completeness is checked locally in mobile because photo capture/upload is not implemented until RF-MOB-017.
- RF-MOB-016 remains mock/local validation only: no camera/photo picker, compression, upload, signature capture, draft persistence, backend shift creation or report submission was added.

## Problems solved

- Daily fixed courier UI now clearly separates real tracked time from default billable time.
- Hourly 10h warning/auto-stop copy remains scoped to hourly mode.
- Daily report screen now shows:
  - validation summary
  - inline field error support
  - required-photo error cards
  - required-signature copy
  - disabled `Bericht einreichen` while invalid
- KM order validation is aligned with the shared Zod schema.
- Verification passed:
  - `& 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run typecheck`
  - `& 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run lint` after elevated rerun for the known sandbox ESLint resolver `EPERM`
  - `& 'C:\Program Files\nodejs\npm.cmd' run typecheck`
  - focused scans for hardcoded hex values and raw Tailwind color classes in touched mobile source files
  - `& 'C:\Program Files\Git\cmd\git.exe' -c safe.directory='C:/Users/Nikolay/Desktop/routeforge' diff --check` with only line-ending warnings
  - Expo web preview `/report` responded with `200` at `http://localhost:8083/report`

## Current state

- Current phase is Phase 4 - Mobile App Local Logic.
- Last completed feature is `RF-MOB-016 - Daily Report Validation`.
- Next feature in `context/progress-tracker.md` is `RF-MOB-017 - Photo Capture and Compression`.
- `context/progress-tracker.md` and `context/ui-registry.md` are updated through RF-MOB-016.
- Review found no RF-MOB-016 issues across plan alignment, system integrity or production readiness.
- Expo preview still emits the existing React Native Web `props.pointerEvents is deprecated` warning during startup.
- One transient Expo dev-server closed-stream message appeared after an HTTP preview probe, but `/report` responded successfully.

## Next session starts with

Start `RF-MOB-017 - Photo Capture and Compression`.

Before implementing, read the required RouteForge context in `AGENTS.md` order and inspect:

- `context/build-plan.md`
- `context/progress-tracker.md`
- `context/mobile-rules.md`
- `context/security-gdpr.md`
- `context/library-docs.md`
- `apps/mobile/package.json`
- `apps/mobile/app/(tabs)/report.tsx`
- `apps/mobile/components/report/PhotoUploadCard.tsx`
- `apps/mobile/features/mock/dailyReport.ts`
- `apps/mobile/features/report/dailyReportValidation.ts`
- shared photo types in `packages/shared`

Expected next scope:

- Add local/mobile photo capture and compression behavior for required shift proof photos.
- Keep backend storage upload, signed URLs, retention job implementation, signature capture, GPS capture and report submission out of scope unless the build plan explicitly says otherwise.

## Open questions

- Confirm the exact installed Expo image/camera APIs before choosing the RF-MOB-017 implementation path.
- Confirm whether RF-MOB-017 should add a real device camera flow now or a mock/local photo state flow if the required Expo camera/image picker package is not already installed.
