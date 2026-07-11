# Memory - RF-BE-009 Shift Photo Upload Backend

Last updated: 2026-07-11 18:51 +02:00

## What was built

- Completed `RF-BE-009 - Shift Photo Upload Backend`.
- Added shared shift photo metadata validation:
  - `packages/shared/src/schemas/shift.ts`
- Added backend migrations for the private shift photo metadata RPC:
  - `insforge/migrations/0011_shift_photo_upload_backend.sql`
  - `migrations/20260711120000_shift-photo-upload-backend.sql`
- Implemented `public.save_shift_photo_metadata(...)` for courier proof-photo metadata writes after private storage upload verification.
- Applied the migration to the linked InsForge backend.
- Wired mobile daily report submission to upload captured, compressed JPEG proof photos before submitting the report:
  - `apps/mobile/features/report/dailyReportBackend.ts`
  - `apps/mobile/app/(tabs)/report.tsx`
- Added persisted proof-photo loading and per-photo upload state in the mobile report flow.
- Updated the photo upload card status display:
  - `apps/mobile/components/report/PhotoUploadCard.tsx`
- Updated RouteForge context and tracking:
  - `context/data-model.md`
  - `context/permissions.md`
  - `context/security-gdpr.md`
  - `context/progress-tracker.md`
  - `context/ui-registry.md`

## Decisions made

- Couriers no longer insert `shift_photos` metadata directly. Metadata writes go through `save_shift_photo_metadata`.
- The metadata RPC verifies the authenticated courier, company scope, own draft shift, allowed photo type, private storage object, uploader, MIME type, size and compression flag before writing metadata.
- The mobile client uploads to private `shift-photos` storage using paths under `companies/{company_id}/shifts/{shift_id}/photos/...`.
- Proof photos are accepted as `image/jpeg` and marked compressed before metadata is saved.
- Re-uploading the same proof type retires previous active metadata rows with `deleted_at` and inserts the latest active row.
- The submit flow is retry-safe: already persisted photo types are skipped, and uploaded-but-not-registered objects can be reconciled by the metadata RPC on retry.
- `RF-BE-010 - Signature Artifact Access Backend` is the next tracked backend feature.

## Problems solved

- Mobile type narrowing around the active shift ID required a stable local `activeShiftId` before upload/submit work.
- Mobile lint hit a sandbox-only `EPERM scandir C:\Users\Nikolay` from the import resolver; rerunning with approved elevated permissions passed.
- InsForge CLI memory lookup had to be rerun with elevated permissions because the sandbox blocked the needed network/package access. No InsForge memories were stored for this scope.
- `git diff --check` passes; Git still reports normal LF-to-CRLF normalization warnings for touched files.

## Current state

- Verification passed:
  - `npm --workspace @routeforge/shared run typecheck`
  - `npm --workspace mobile run typecheck`
  - `npm --workspace mobile run lint`
  - `npm run typecheck`
  - `npm run lint`
  - `git diff --check`
- Backend catalog checks confirmed:
  - `save_shift_photo_metadata` exists.
  - authenticated has `EXECUTE` on the RPC.
  - authenticated has only `SELECT` on `public.shift_photos`.
- Current working tree has uncommitted RF-BE-009 changes in:
  - `apps/mobile/app/(tabs)/report.tsx`
  - `apps/mobile/components/report/PhotoUploadCard.tsx`
  - `apps/mobile/features/report/dailyReportBackend.ts`
  - `context/data-model.md`
  - `context/permissions.md`
  - `context/progress-tracker.md`
  - `context/security-gdpr.md`
  - `context/ui-registry.md`
  - `packages/shared/src/schemas/shift.ts`
  - new `insforge/migrations/0011_shift_photo_upload_backend.sql`
  - new `migrations/20260711120000_shift-photo-upload-backend.sql`
- The previous `INITIAL_DATA_HYDRATION` work should still be treated as already completed.
- Manual mobile device/Expo visual verification was not run after RF-BE-009.
- Do not revert uncommitted changes unless explicitly requested.

## Next session starts with

1. Run `/remember restore`.
2. Read the RouteForge context files in the required `AGENTS.md` order before implementation.
3. Start `RF-BE-010 - Signature Artifact Access Backend`.
4. Keep RF-BE-010 focused on signature artifact storage/access and do not fold in admin approval (`RF-BE-011`) or full history backend (`RF-BE-013`) unless the build plan is explicitly updated.

## Open questions

- Should mobile visual verification of the RF-BE-009 upload states be done before starting RF-BE-010?
- Should the next session commit the completed RF-BE-009 work first, or continue feature-by-feature with uncommitted changes?
