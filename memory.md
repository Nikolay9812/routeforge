# Memory - RF-MOB-017 and RF-MOB-018 Mobile Local Logic

Last updated: 2026-06-28 20:56 +02:00

## What was built

- Completed `RF-MOB-017 - Photo Capture and Compression`.
- Added Expo SDK photo dependencies and config:
  - `apps/mobile/package.json`
  - `package-lock.json`
  - `apps/mobile/app.json`
- Added local mobile photo capture/compression helper:
  - `apps/mobile/features/report/photoCapture.ts`
- Updated daily report proof-photo UI and validation wiring:
  - `apps/mobile/app/(tabs)/report.tsx`
  - `apps/mobile/components/report/PhotoUploadCard.tsx`
  - `apps/mobile/features/mock/dailyReport.ts`
- Completed `RF-MOB-018 - Signature Capture`.
- Added local mobile signature capture helper and UI:
  - `apps/mobile/features/report/signatureCapture.ts`
  - `apps/mobile/components/report/SignatureCard.tsx`
- Updated RF-MOB-018 report integration and context:
  - `apps/mobile/app/(tabs)/report.tsx`
  - `apps/mobile/features/mock/dailyReport.ts`
  - `context/library-docs.md`
  - `context/progress-tracker.md`
  - `context/ui-registry.md`

## Decisions made

- RF-MOB-017 uses approved Expo SDK libraries `expo-image-picker` and `expo-image-manipulator`.
- Shift proof photos are captured/selected locally, compressed to JPEG, previewed in the report UI, and represented as backend-ready local payloads.
- RF-MOB-017 remains local/mobile-only: no InsForge Storage upload, `shift_photos` insert, signed URL, draft persistence, backend shift creation or report submission.
- RF-MOB-018 uses a local React Native `PanResponder` signature pad for the UI-first phase instead of installing a third-party native signature package.
- Confirmed signatures provide local `signatureUrl` and `signedAt` values to the shared daily report validation.
- Signature payloads use the private reports artifact path shape for later `RF-BE-010`, not the temporary `shift-photos` retention path.
- RF-MOB-018 remains local/mobile-only: no signature upload, backend `signature_url` persistence, signed URL, PDF embedding, AsyncStorage draft persistence or report submission.
- Developer preference: if an Expo server is already running on `8081`, use that existing preview for probes. Do not start another Expo server on a different port unless needed; if needed, say why first.

## Problems solved

- Required proof photos can now be selected from camera/gallery, compressed locally, previewed, changed and removed.
- Daily report validation now treats selected local proof photos as satisfying required photo types.
- Signature capture now has a visible local canvas, clear action, confirm action, signed timestamp and required-signature validation integration.
- Signature is not reused automatically and only becomes valid after explicit confirmation.
- Verification passed:
  - `& 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run typecheck`
  - `& 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run lint` after elevated rerun for the known sandbox ESLint resolver `EPERM`
  - `& 'C:\Program Files\nodejs\npm.cmd' run typecheck`
  - focused scans for hardcoded hex values and raw Tailwind color classes in touched mobile source files
  - `& 'C:\Program Files\Git\cmd\git.exe' -c safe.directory='C:/Users/Nikolay/Desktop/routeforge' diff --check` with only line-ending warnings
  - Expo web preview `/report` responded successfully during verification

## Current state

- Current phase is Phase 4 - Mobile App Local Logic.
- Last completed feature is `RF-MOB-018 - Signature Capture`.
- Next feature in `context/progress-tracker.md` is `RF-MOB-019 - GPS Start/Stop Capture`.
- `context/progress-tracker.md`, `context/ui-registry.md` and `context/library-docs.md` are updated through RF-MOB-018.
- Expected uncommitted/staged work from this session is RF-MOB-018 plus this memory update:
  - `apps/mobile/app/(tabs)/report.tsx`
  - `apps/mobile/components/report/SignatureCard.tsx`
  - `apps/mobile/features/mock/dailyReport.ts`
  - `apps/mobile/features/report/signatureCapture.ts`
  - `context/library-docs.md`
  - `context/progress-tracker.md`
  - `context/ui-registry.md`
  - `memory.md`
- Expo preview still emits the existing React Native Web `props.pointerEvents is deprecated` warning.
- Expo LAN URL may change to `exp://127.0.0.1:8081` when the router/network disappears; for phone testing prefer LAN when available or tunnel when LAN is unreliable.

## Next session starts with

Start `RF-MOB-019 - GPS Start/Stop Capture`.

Before implementing, read the required RouteForge context in `AGENTS.md` order and inspect:

- `context/build-plan.md`
- `context/progress-tracker.md`
- `context/mobile-rules.md`
- `context/security-gdpr.md`
- `context/library-docs.md`
- `apps/mobile/package.json`
- `apps/mobile/features/shifts/useLocalShiftTimer.ts`
- `apps/mobile/features/shifts/activeShiftStorage.ts`
- `apps/mobile/app/(tabs)/home.tsx`
- `packages/shared/src/types.ts`
- any existing location/GPS references

Expected next scope:

- Capture start and stop location locally for shift start/stop.
- Request location only at start and stop.
- Show permission/missing-location states in German.
- Keep live tracking, continuous background location, backend `shift_locations` inserts, geofence calculation, report submission and admin warning persistence out of scope unless the build plan explicitly says otherwise.

## Open questions

- Confirm whether `expo-location` is already installed before RF-MOB-019; if not, install the approved Expo SDK-compatible package.
- Decide whether RF-MOB-019 should persist local start/stop location snapshots immediately with active shift state or keep them in local UI state until offline draft queue/backend features.
