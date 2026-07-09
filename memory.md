# Memory - RF-BE-006/RF-BE-007 Backend Shift Flow

Last updated: 2026-07-09 19:36 +02:00

## What was built

- Completed `RF-BE-006 - Shift Start/Stop Backend`.
- Added canonical and CLI shift start/stop migrations:
  - `insforge/migrations/0008_shift_start_stop_backend.sql`
  - `migrations/20260709150000_shift-start-stop-backend.sql`
- Applied the shift start/stop migration to the linked RouteForge InsForge project.
- Added authenticated courier RPCs:
  - `start_courier_shift(p_depot_id uuid)`
  - `end_courier_shift(p_shift_id uuid)`
- Added server-side shift start/end behavior:
  - active courier validation
  - own company and assigned primary depot validation
  - German local `shift_date`
  - payment mode snapshot
  - one-shift-per-courier/day enforcement through the existing unique constraint
  - gross, legal break, net, billable and auto-stop calculation on end
  - hourly cap at 600 minutes
  - daily fixed billable minutes from the courier profile default
  - shift remains `draft`
- Revoked direct authenticated `INSERT`/`UPDATE` on `public.shifts`; normal mobile writes now go through the start/end RPCs.
- Added shared shift start/end Zod schemas in `packages/shared/src/schemas/shift.ts`.
- Added mobile shift backend helper in `apps/mobile/features/shifts/shiftBackend.ts`.
- Updated `apps/mobile/features/shifts/useLocalShiftTimer.ts` and `apps/mobile/app/(tabs)/home.tsx` so courier shift start/end use the authenticated profile, real primary depot, real payment mode, backend shift rows and safe German server states.
- Completed `RF-BE-007 - Shift Location Backend`.
- Added canonical and CLI shift location migrations:
  - `insforge/migrations/0009_shift_location_backend.sql`
  - `migrations/20260709160000_shift-location-backend.sql`
- Applied the shift location migration to the linked RouteForge InsForge project.
- Added `save_shift_location(p_shift_id, p_location_type, p_latitude, p_longitude, p_accuracy_meters)` for authenticated active couriers to save their own start/stop checkpoints.
- Added server-side Haversine distance calculation, depot coordinate snapshots and geofence result persistence in `shift_locations`.
- Revoked direct authenticated `INSERT`/`UPDATE` on `public.shift_locations`; normal mobile writes now go through the location RPC.
- Added shared shift location Zod schema in `packages/shared/src/schemas/shift.ts`.
- Extended mobile location checkpoint state in:
  - `apps/mobile/features/location/shiftLocationCapture.ts`
  - `apps/mobile/features/shifts/activeShiftStorage.ts`
- Mobile now saves captured start/stop GPS checkpoints after successful backend shift start/end, hydrates persisted shift locations for today's backend shift, and shows server-saved, missing and outside-depot states on Home.
- Updated `context/progress-tracker.md`; next feature is `RF-BE-008 - Daily Report Submit Backend`.

## Decisions made

- RF-BE-006 and RF-BE-007 are online-first for shift mutations: failed backend start does not create a local shift; failed backend end leaves a retryable error state.
- Mobile GPS capture remains foreground-only and checkpoint-only; no live tracking, background tracking or route history was added.
- GPS denied/unavailable does not block the shift. No `shift_locations` row is inserted without coordinates; the mobile missing checkpoint remains visible as the safe courier-facing warning.
- Start and stop locations are saved only after the corresponding shift RPC succeeds, avoiding orphan location rows.
- Stop location is saved after `end_courier_shift` returns, so `save_shift_location` requires `end_time` for `location_type = 'stop'`.
- `save_shift_location` is idempotent through upsert on `(shift_id, location_type)`.
- The internal distance helper is not executable by `authenticated`; only `save_shift_location` is granted.
- Admin shift screens remain mock-backed for this slice. They already model red geofence warnings and can consume persisted `shift_locations` when admin shift backend is implemented later.
- Existing migration convention remains: canonical human-readable files in `insforge/migrations/`, timestamped CLI mirrors in root `migrations/`.

## Problems solved

- InsForge CLI `db migrations up --all` failed because older local mirror migrations are not remote-applied and are older than the current remote head. Applying only the new timestamped migration target worked.
- The first RF-BE-006 migration apply failed because custom SQL session settings are not allowed in this InsForge path. The migration was corrected to rely on revoked direct table privileges and RPC mutation.
- Mobile lint in the sandbox hit the known Expo ESLint resolver `EPERM` while scanning `C:\Users\Nikolay`; approved unsandboxed reruns passed.
- PowerShell requires quoting/literal handling for paths containing `(tabs)`.
- `git diff --check` currently reports only LF-to-CRLF normalization warnings on touched files.

## Current state

- Live InsForge migration head is `20260709160000_shift-location-backend`.
- Live catalog verification confirmed:
  - `start_courier_shift(uuid)` exists and `authenticated` can execute it.
  - `end_courier_shift(uuid)` exists and `authenticated` can execute it.
  - `save_shift_location(uuid, text, numeric, numeric, numeric)` exists and `authenticated` can execute it.
  - `calculate_routeforge_distance_meters(numeric, numeric, numeric, numeric)` exists and is not executable by `authenticated`.
  - `public.shifts` direct authenticated privileges are SELECT-only.
  - `public.shift_locations` direct authenticated privileges are SELECT-only.
- Verification passed:
  - `& 'C:\Program Files\nodejs\npm.cmd' --workspace @routeforge/shared run typecheck`
  - `& 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run typecheck`
  - `& 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run lint`
  - `git -c safe.directory=C:/Users/Nikolay/Desktop/routeforge diff --check`
  - raw-color/hardcoded-hex scan on touched code and SQL files
  - non-ASCII scan on touched code and SQL files
- Manual mobile device verification was not run.
- Working tree has uncommitted RF-BE-006/RF-BE-007 changes and new migration files. Do not revert them.
- `context/progress-tracker.md` marks RF-BE-006 and RF-BE-007 complete and sets `RF-BE-008 - Daily Report Submit Backend` as next.

## Next session starts with

1. Run `/remember restore`.
2. Read the RouteForge context files in the required `AGENTS.md` order before implementation.
3. Start `RF-BE-008 - Daily Report Submit Backend`.
4. Inspect the current mobile report draft/workflow files, shared `shiftReportSchema`, shift/photo/signature storage expectations, RLS helpers and current shift RPC state before writing SQL or app code.
5. Keep RF-BE-008 separate from RF-BE-009 and RF-BE-010 unless the build plan explicitly says otherwise; proof photo upload and signature upload are later slices.

## Open questions

- What exact RF-BE-008 boundary should be used for report submission if proof photo upload and signature upload remain RF-BE-009/RF-BE-010?
- Should RF-BE-008 submit only existing draft shift fields/counters/KM/note placeholders, or also introduce any server representation for missing GPS warnings before admin shift review backend?
