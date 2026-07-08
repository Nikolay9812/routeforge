# Memory - RF-BE-005 Dispatcher Depot Access Backend

Last updated: 2026-07-08 20:51 +02:00

## What was built

- Completed `RF-BE-005 - Dispatcher Depot Access Backend`.
- Added canonical and CLI dispatcher depot access migrations:
  - `insforge/migrations/0007_dispatcher_depot_access_backend.sql`
  - `migrations/20260708130000_dispatcher-depot-access-backend.sql`
- Applied the dispatcher depot access migration to the linked RouteForge InsForge project.
- Added the `set_dispatcher_depot_access(p_dispatcher_profile_id uuid, p_depot_ids uuid[], p_reason text)` RPC.
- Added backend-enforced dispatcher depot access behavior:
  - active-admin validation
  - company-scope validation
  - dispatcher-profile validation
  - full replacement of selected `profile_depot_access` rows in one server transaction
  - `dispatcher_depot_access_updated` audit logs with before/after depot ID arrays when access changes
  - direct authenticated insert/delete revoked on `profile_depot_access`
  - authenticated direct table access is now SELECT-only, with mutation through RPC execute
- Added shared dispatcher validation:
  - `packages/shared/src/schemas/dispatcher.ts`
  - export from `packages/shared/src/index.ts`
- Added admin dispatcher backend code:
  - `apps/admin/app/actions/dispatchers.ts`
  - `apps/admin/lib/dispatchers.ts`
  - `apps/admin/lib/dispatchers.server.ts`
- Connected `/admin/dispatchers` to live backend data:
  - `apps/admin/app/admin/dispatchers/page.tsx`
  - company-scoped dispatcher reads
  - company-scoped depot reads
  - persisted dispatcher depot access reads through `profile_depot_access`
  - summary tiles now use live data
- Updated the dispatcher access UI:
  - `apps/admin/components/dispatchers/DispatcherDepotAccess.tsx`
  - Server Action save flow
  - saving state
  - success state
  - error state
  - empty dispatcher state
  - local draft state remains only as client-side edit state before server save
- Closed the pending RF-BE-004 tracking gap and RF-BE-005 completion in:
  - `context/progress-tracker.md`
  - `context/ui-registry.md`

## Decisions made

- Dispatcher depot access mutation is admin-only for v1.
- Dispatcher depot access writes must go through the audited `set_dispatcher_depot_access` RPC, not direct client table insert/delete.
- Direct authenticated insert/delete on `profile_depot_access` is revoked so audit logging cannot be bypassed by normal app code.
- "All depots" is represented as explicit `profile_depot_access` rows for each selected company depot. No global/all-access column was added.
- Access assignment accepts company-owned depots regardless of `is_active`; this avoids hiding or orphaning existing access after depot deactivation. Future operational queries can still filter inactive depots separately.
- Dispatcher capability flags remain out of scope. RF-BE-005 only persists depot scope and keeps mutation admin-only.
- Existing RouteForge migration convention remains: canonical human-readable files in `insforge/migrations/`, timestamped CLI mirrors in root `migrations/`.

## Problems solved

- The InsForge CLI `memory list` command hung without output during planning; local `memory.md` and repo context were used instead.
- The first sandboxed InsForge migration apply also hung without output. The same migration applied successfully after an approved unsandboxed CLI retry.
- A multi-SELECT catalog verification query returned no printed rows, so verification was split into simpler JSON catalog queries.
- PowerShell parsing of `$file:$lineNo` broke the initial non-ASCII scan command; reran with safe formatted output.

## Current state

- Live InsForge migration head includes `20260708130000_dispatcher-depot-access-backend`.
- Live catalog verification confirmed:
  - `public.set_dispatcher_depot_access(uuid, uuid[], text)` exists
  - `authenticated` can execute the RPC
  - `profile_depot_access` direct authenticated privileges are SELECT-only
- Verification passed:
  - `& 'C:\Program Files\nodejs\npm.cmd' --workspace @routeforge/shared run typecheck`
  - `& 'C:\Program Files\nodejs\npm.cmd' --workspace admin run typecheck`
  - `& 'C:\Program Files\nodejs\npm.cmd' --workspace admin run lint`
  - `& 'C:\Program Files\nodejs\npm.cmd' --workspace admin run build`
  - `git -c safe.directory=C:/Users/Nikolay/Desktop/routeforge diff --check`
  - raw-color/hardcoded-hex scan on touched code, SQL and context files
  - non-ASCII scan on touched code and SQL files
- RF-BE-005 review found no implementation issues.
- `context/progress-tracker.md` now marks RF-BE-004 and RF-BE-005 complete and sets `RF-BE-006 - Shift Start/Stop Backend` as next.
- `context/ui-registry.md` now records the backend-connected dispatcher access selector pattern.
- `memory.md` has been overwritten with this RF-BE-005 session memory. No credential values are stored here.

## Next session starts with

1. Run `/remember restore`.
2. Confirm whether the exposed privileged InsForge project/API key from earlier troubleshooting has been rotated. If not, rotate it before more backend work and keep privileged values out of public frontend variables.
3. Start `RF-BE-006 - Shift Start/Stop Backend` through `/architect`.
4. Before RF-BE-006 implementation, read the RouteForge context files in the required `AGENTS.md` order and use the InsForge skills for backend/RLS work.
5. For RF-BE-006, inspect existing mobile shift UI/local timer code, shared shift/payroll helpers, RLS helpers and migration state before writing SQL or app code.

## Open questions

- Has the exposed privileged project/API key been rotated in InsForge?
- Should the project keep both canonical `insforge/migrations/` files and timestamped root CLI mirrors long-term?
- Should RF-BE-006 connect only shift start/stop core rows first, or also include the first mobile geolocation handoff if the build plan treats location as RF-BE-007?
