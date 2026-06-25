# Memory - RF-DB-001 and RF-DB-002 InsForge Foundation

Last updated: 2026-06-25 20:05 +02:00

## What was built

- Completed `RF-DB-001 - InsForge Initial Schema`.
- Created `insforge/migrations/0001_initial_schema.sql` with the first public application schema:
  - `companies`
  - `depots`
  - `profiles`
  - `profile_depot_access`
  - `invitations`
  - `shifts`
  - `shift_locations`
  - `shift_photos`
  - `documents`
  - `mailbox_items`
  - `audit_logs`
- Added primary keys, foreign keys, uniqueness constraints, recommended indexes and row-local constraints.
- Completed `RF-DB-002 - Row Level Security Policies`.
- Created `insforge/migrations/0002_rls_policies.sql` with RLS helper functions, grants, policies and trigger guards.
- Updated `context/progress-tracker.md`:
  - marked `RF-DB-001` complete
  - marked `RF-DB-002` complete
  - added InsForge Initial Schema decisions
  - added InsForge Row Level Security decisions
  - added completion log entries for both features
  - set next feature to `RF-DB-003 - Storage Buckets`.

## Decisions made

- RouteForge migration files follow the build-plan paths under `insforge/migrations/`:
  - `0001_initial_schema.sql`
  - `0002_rls_policies.sql`
- `RF-DB-001` created only public application tables and database integrity basics. RLS, storage policies and seed data stayed separate.
- Every company-owned table includes `company_id`.
- `shifts` enforces one shift per courier per day through `(company_id, courier_profile_id, shift_date)`.
- `shift_photos` metadata defaults `expires_at` to `uploaded_at + 14 days`; actual file deletion remains a later retention feature.
- RLS helper functions are `SECURITY DEFINER` with pinned `search_path = pg_catalog, public, pg_temp` to avoid recursive RLS lookups.
- Runtime table grants are revoked from `anon`; authenticated table access is allowed only through RLS-protected operations.
- Admins can access and mutate data inside their own company workspace.
- Dispatchers can read assigned-depot data by default. Optional dispatcher write capabilities remain closed until later backend features explicitly open them.
- Couriers can read only their own operational data and create/update narrow own-shift, location, photo and mailbox-read flows.
- Audit logs are read-only for active company admins through RLS; client-side insert, update and delete are not granted.
- No UI changed during these features; `context/ui-registry.md` did not need an update.

## Problems solved

- Established the InsForge/Postgres schema foundation for RouteForge's tenant model.
- Added database constraints for shared enum values, nonnegative counters/minutes, coordinate ranges, invitation code format, billable override reason, rejected shift reason and document/photo metadata.
- Added RLS coverage for all 11 public application tables.
- Added trigger guards so non-admin shift updates cannot change protected payroll/approval fields, and courier mailbox read updates cannot alter mailbox content.
- Avoided saving or repeating any InsForge API key or credential-like value from the setup conversation.

## Current state

- Current phase is Phase 2 - InsForge Foundation.
- Last completed feature is `RF-DB-002 - Row Level Security Policies`.
- Next feature in `context/progress-tracker.md` is `RF-DB-003 - Storage Buckets`.
- `RF-DB-001` verification passed:
  - 11 expected tables found
  - every company-owned table includes `company_id`
  - no RLS, policies, storage or seed work slipped into `0001`
  - `git diff --check` passed with only the known CRLF warning on `context/progress-tracker.md`
- `RF-DB-002` verification passed:
  - RLS enabled for all 11 public app tables
  - 19 helper/guard functions, all `SECURITY DEFINER`
  - 29 policies, no `USING (true)`
  - all 15 insert/update policies include `WITH CHECK`
  - no trailing whitespace in `0002`
  - `git diff --check` passed with only the known CRLF warning on `context/progress-tracker.md`
- The migrations have not been applied to the live InsForge backend yet.
- Current sandbox git status showed:
  - `context/progress-tracker.md` modified
  - `insforge/migrations/0002_rls_policies.sql` untracked
- Known non-blocking warning: `git` may warn about permission denied for `C:\Users\Nikolay/.config/git/ignore` under the sandbox user.
- Known non-blocking warning: Git requires a one-off `safe.directory` flag in this sandbox because of dubious ownership.
- Known non-blocking warning from earlier sessions: admin dev reports a Next.js workspace-root warning because both root `package-lock.json` and `apps/admin/package-lock.json` exist.

## Next session starts with

Run `/remember restore`, then implement `RF-DB-003 - Storage Buckets`.

For `RF-DB-003`, start by reading the required RouteForge context in `AGENTS.md` order, then inspect:

- `context/build-plan.md`
- `context/progress-tracker.md`
- `context/data-model.md`
- `context/permissions.md`
- `context/security-gdpr.md`
- `context/library-docs.md`
- `context/code-standards.md`
- `insforge/migrations/0001_initial_schema.sql`
- `insforge/migrations/0002_rls_policies.sql`

Expected scope for `RF-DB-003`:

- Create `insforge/migrations/0003_storage_policies.sql`.
- Create or define storage bucket setup and policies for:
  - `courier-documents`
  - `shift-photos`
  - `payslips`
  - `generated-pdfs`
  - `company-assets`
- Keep storage private/authenticated.
- Scope storage access by company, courier ownership, admin company access and dispatcher depot scope.
- Do not create demo seed data; that is `RF-DB-004`.
- Update `context/progress-tracker.md` when complete.

## Open questions

- Whether to apply `0001` and `0002` to the live InsForge backend now or wait until `RF-DB-003` storage policies are also ready.
- Whether `.gitignore` should be updated immediately to ignore `.env`, `.env.*`, `env.local` and `.insforge/`.
- Whether to rotate the InsForge API key that appeared in chat before continuing.
- Whether to fix the duplicate lockfile / Next.js workspace-root warning now or leave it until a later monorepo cleanup.
- Whether to add package-level typecheck scripts for `apps/admin` and `apps/mobile` later, since root typecheck currently verifies only packages that define a `typecheck` task.
