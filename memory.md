# Memory - RF-BE-003 Profile Approval Backend

Last updated: 2026-07-07 20:54 +02:00

## What was built

- Completed `RF-BE-003 - Profile Approval Backend`.
- Added backend approval SQL:
  - `insforge/migrations/0005_profile_approval_backend.sql`
  - `migrations/20260707120000_profile-approval-backend.sql` as the timestamped InsForge CLI migration mirror
- Applied `migrations/20260707120000_profile-approval-backend.sql` to the linked RouteForge InsForge project through the CLI migration runner.
- Added profile approval backend behavior:
  - `approve_courier_profile(p_profile_id uuid)` RPC
  - `enforce_profile_approval_update` trigger function and trigger
  - `audit_profile_approval_update` trigger function and trigger
  - `courier_approved` audit log writes for pending-courier activation
- Added admin courier backend code:
  - `apps/admin/app/actions/couriers.ts`
  - `apps/admin/lib/couriers.ts`
  - `apps/admin/lib/couriers.server.ts`
- Updated admin courier routes:
  - `apps/admin/app/admin/couriers/page.tsx`
  - `apps/admin/app/admin/couriers/[id]/page.tsx`
  - Admin courier list and profile now load real company-scoped courier profiles, depots, latest shifts and audit logs from InsForge.
- Updated `apps/admin/components/couriers/CourierProfileApprovalView.tsx`:
  - Replaced local mock approval with a Server Action backed by the approval RPC.
  - Added backend error display and server-backed approved state.
- Updated mobile pending approval behavior:
  - `apps/mobile/features/auth/AuthProvider.tsx` now exposes `refreshProfile`.
  - `apps/mobile/app/pending-approval.tsx` has a German `Status pruefen` action so approved couriers can refresh their profile and unlock operational tabs.
- Updated `context/progress-tracker.md`:
  - RF-BE-003 marked complete.
  - Next feature is `RF-BE-004 - Depot Backend`.
- Updated `context/ui-registry.md` with the backend approval panel and pending-approval refresh pattern.

## Decisions made

- Courier approval is admin-only for now. Dispatcher approval remains deferred until dispatcher capability flags are represented in the live data model and can be depot-scoped.
- Approval happens through a SECURITY DEFINER RPC plus profile update triggers, not through browser-only state.
- The backend audit boundary is trigger-based: pending courier activation to `active` requires `approved_at` and active-admin `approved_by`, and writes `courier_approved`.
- Mobile unlock after approval is profile-refresh based. Pending couriers can press `Status pruefen`; if the refreshed profile is active, the existing auth gate routes them into the operational tabs.
- RouteForge keeps canonical human-readable migrations in `insforge/migrations/000x_...`.
- InsForge CLI only applies migration files from root `migrations/` with names like `YYYYMMDDHHMMSS_migration-name.sql`; timestamped root files are CLI mirrors, not the canonical RouteForge migration naming scheme.

## Problems solved

- InsForge `db query` failed to apply the PL/pgSQL migration body with `no language specified`; the fix was to use the CLI migration runner with a timestamped root `migrations/` file.
- A first migration design using custom SQL session configuration was rejected by the migration runner with `Changing SQL session configuration is not allowed`; the final design uses validation/audit triggers instead.
- Clarified migration history confusion:
  - Earlier migrations were partly applied manually through the InsForge dashboard or ad hoc CLI query.
  - The current remote migration head is `20260707120000`.
  - Older timestamped copies such as `20260707000100_initial-schema.sql` cannot be applied after that remote head.
  - Old/manual migrations should stay in `insforge/migrations/` for project history unless rebuilding a clean backend; root `migrations/` should contain only pending/new CLI migrations newer than the remote head.

## Current state

- RF-BE-003 code is implemented.
- The live linked InsForge project has the profile approval migration applied.
- Verification passed:
  - `npm --workspace admin run typecheck`
  - `npm --workspace mobile run typecheck`
  - `npm --workspace @routeforge/shared run typecheck`
  - `npm --workspace admin run lint`
  - `npm --workspace mobile run lint` with elevated filesystem access for the known Windows ESLint resolver scan
  - `git diff --check`
  - raw color scan on touched admin/mobile UI/code files
  - non-ASCII scan on touched code and SQL files
  - secret-word scan found only ordinary auth variable names, not secret values
  - InsForge catalog query confirmed `approve_courier_profile`, `enforce_profile_approval_update` and `audit_profile_approval_update`
  - InsForge trigger query confirmed the profile BEFORE/AFTER UPDATE triggers
  - InsForge grant query confirmed `authenticated` can execute `approve_courier_profile(uuid)` and `anon` cannot
  - `/admin/couriers` route probe returned `307` to `/login` without an admin session, expected protected-route behavior
- Admin dev server was started at `http://127.0.0.1:3000` during verification and may still be running in the active Codex session.
- The user was actively cleaning up migration strategy. They understand now that root `migrations/` is required by InsForge CLI, while `insforge/migrations/` is their preferred canonical project folder.

## Next session starts with

Start `RF-BE-004 - Depot Backend`.

Before implementing:

1. Run `/remember restore`.
2. Follow the full RouteForge context read order from `AGENTS.md`.
3. Check `context/build-plan.md` and `context/progress-tracker.md` for RF-BE-004 scope.
4. Decide migration workflow before writing SQL:
   - Keep canonical SQL in `insforge/migrations/0006_...`.
   - Create a timestamped root `migrations/YYYYMMDDHHMMSS_depot-backend.sql` only when applying through InsForge CLI.
   - Ensure timestamp is newer than remote head `20260707120000`.

## Open questions

- Should the project keep both migration folders long-term, or standardize on root `migrations/` for future backend work while preserving old `insforge/migrations/` history?
- If the user wants a fully clean database migration story, should we create a fresh InsForge project or backend branch and reapply all migrations only from timestamped CLI files?
- Should RF-BE-004 include only depot CRUD backend, or also begin dispatcher depot-scope data loading needed by RF-BE-005?
