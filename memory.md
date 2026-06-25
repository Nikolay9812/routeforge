# Memory - RF-DB-003 Storage Buckets

Last updated: 2026-06-25 20:22 +02:00

## What was built

- Completed `RF-DB-003 - Storage Buckets`.
- Created `insforge/migrations/0003_storage_policies.sql`.
- Added storage helper functions for RouteForge object keys:
  - company ID extraction from `companies/{company_id}/...`
  - shift ID extraction from `companies/{company_id}/shifts/{shift_id}/...`
  - courier profile ID extraction from `companies/{company_id}/couriers/{courier_id}/...`
  - report owner ID extraction from `companies/{company_id}/reports/{shift_or_courier_id}/...`
- Added validation for the five RouteForge storage buckets:
  - `courier-documents`
  - `shift-photos`
  - `payslips`
  - `generated-pdfs`
  - `company-assets`
- Added storage access helper functions:
  - `can_read_storage_object(bucket_name, object_key)`
  - `can_write_storage_object(bucket_name, object_key)`
  - `can_delete_storage_object(bucket_name, object_key)`
- Added metadata constraints so `shift_photos` and `documents` bucket/path values match expected tenant, shift and courier scope.
- Updated `context/progress-tracker.md`:
  - marked `RF-DB-003` complete
  - added InsForge Storage Policies decisions
  - added the `RF-DB-003` completion log
  - set next feature to `RF-DB-004 - Demo Seed Data`.

## Decisions made

- InsForge live bucket creation is an admin/CLI operation, not public-schema SQL. The repo migration owns RouteForge path validation, metadata constraints and access helper functions.
- All RouteForge storage object paths must begin with `companies/{company_id}`.
- Bucket path conventions are:
  - `courier-documents`: `companies/{company_id}/couriers/{courier_id}/docs/...`
  - `shift-photos`: `companies/{company_id}/shifts/{shift_id}/photos/...`
  - `payslips`: `companies/{company_id}/couriers/{courier_id}/payslips/...`
  - `generated-pdfs`: `companies/{company_id}/reports/{shift_or_courier_id}/...`
  - `company-assets`: `companies/{company_id}/assets/...`
- Storage access helpers reuse the existing RLS helper layer from `0002` for tenant, role, depot and courier ownership checks.
- Storage access helpers also require the path company prefix to match the current actor company before checking object-specific access.
- No UI changed during this feature; `context/ui-registry.md` did not need an update.

## Problems solved

- Established a repeatable storage policy layer without assuming undocumented InsForge storage internals such as `storage.objects` or `storage.buckets`.
- Preserved the product rule that private files are company-scoped, courier/self-scoped where relevant and never public by default.
- Added metadata-level protection so future upload code cannot save mismatched `company_id`, `shift_id`, `courier_profile_id`, bucket and path combinations.
- During review, tightened storage helpers to reject cross-company path prefixes even if a UUID segment could otherwise resolve through a helper.

## Current state

- Current phase is Phase 2 - InsForge Foundation.
- Last completed feature is `RF-DB-003 - Storage Buckets`.
- Next feature in `context/progress-tracker.md` is `RF-DB-004 - Demo Seed Data`.
- Verification for `RF-DB-003` passed:
  - all five bucket names found
  - 10 helper functions found
  - 3 `SECURITY DEFINER` storage access helpers found
  - 5 current-company prefix checks found
  - 10 execute grants and 10 revokes found
  - 6 metadata constraints found
  - no direct references to undocumented `storage.objects` or `storage.buckets`
  - no trailing whitespace in `0003_storage_policies.sql`
  - `git diff --check` passed with only the known CRLF warning on `context/progress-tracker.md`
- The database migrations have not been applied to the live InsForge backend yet.
- Live InsForge buckets have not been created yet.
- Current sandbox git status showed:
  - `context/progress-tracker.md` modified
  - `insforge/migrations/0003_storage_policies.sql` untracked
- Known non-blocking warning: `git` may warn about permission denied for `C:\Users\Nikolay/.config/git/ignore` under the sandbox user.
- Known non-blocking warning: Git requires a one-off `safe.directory` flag in this sandbox because of dubious ownership.
- Known non-blocking warning from earlier sessions: admin dev reports a Next.js workspace-root warning because both root `package-lock.json` and `apps/admin/package-lock.json` exist.

## Next session starts with

Run `/remember restore`, then implement `RF-DB-004 - Demo Seed Data`.

For `RF-DB-004`, start by reading the required RouteForge context in `AGENTS.md` order, then inspect:

- `context/build-plan.md`
- `context/progress-tracker.md`
- `context/data-model.md`
- `context/permissions.md`
- `context/security-gdpr.md`
- `context/code-standards.md`
- `insforge/migrations/0001_initial_schema.sql`
- `insforge/migrations/0002_rls_policies.sql`
- `insforge/migrations/0003_storage_policies.sql`

Expected scope for `RF-DB-004`:

- Create `insforge/seeds/demo_company.sql`.
- Seed demo company `Ivanov Transport`.
- Seed demo depot `HBW3`.
- Seed one admin, one dispatcher and three couriers.
- Seed demo shifts covering draft, submitted, approved, rejected and one geofence warning example.
- Keep seed data scoped to the demo company.
- Do not connect frontend UI or apply live migrations unless explicitly requested.
- Update `context/progress-tracker.md` when complete.

## Open questions

- Whether to apply `0001`, `0002` and `0003` to the live InsForge backend now or wait until `RF-DB-004` seed data is ready.
- Whether to create the five live InsForge buckets now or wait until migrations are applied.
- Whether `.gitignore` should be updated immediately to ignore `.env`, `.env.*`, `env.local` and `.insforge/`.
- Whether to rotate the InsForge API key that appeared in chat before continuing.
- Whether to fix the duplicate lockfile / Next.js workspace-root warning now or leave it until a later monorepo cleanup.
- Whether to add package-level typecheck scripts for `apps/admin` and `apps/mobile` later, since root typecheck currently verifies only packages that define a `typecheck` task.
