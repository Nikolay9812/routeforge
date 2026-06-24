# Memory - RF-FND-003 Shared Payroll Logic

Last updated: 2026-06-24 18:44 +02:00

## What was built

- Completed `RF-FND-003 - Shared Payroll Logic`.
- Added `packages/shared/src/constants/index.ts` with shared payroll constants:
  - `HOURLY_MAX_MINUTES = 600`
  - `DAILY_FIXED_MINUTES = 500`
  - legal break thresholds and break-minute constants.
- Expanded `packages/shared/src/payroll.ts` with shared payroll calculation input/result types.
- Implemented legal break calculation:
  - greater than 6 hours returns 30 break minutes
  - greater than 9 hours returns 45 break minutes
  - otherwise returns 0
- Implemented hourly payroll calculation:
  - calculates gross, break, net and billable minutes
  - caps billable minutes at hourly max, defaulting to 600
  - sets `autoStoppedAtMaxHours` when an hourly shift reaches the max gross minutes
- Implemented daily fixed payroll calculation:
  - tracks real gross, break and net minutes
  - defaults billable minutes to daily fixed default, defaulting to 500
- Implemented manual billable override support:
  - accepts override minutes
  - marks `billableSource` as `manual_override`
  - requires a non-empty override reason before returning an override result
- Updated `packages/shared/src/index.ts` to export `./constants`.
- Updated `context/progress-tracker.md`:
  - marked `RF-FND-003` complete
  - added a feature completion log entry
  - set next feature to `RF-FND-004 - Shared Role and Permission Logic`.

## Decisions made

- Payroll constants live in `packages/shared/src/constants/index.ts` to follow the project rule that shared business constants must not be duplicated.
- `PayrollSettings` in `types.ts` was preserved for compatibility, while `payroll.ts` accepts partial setting overrides and falls back to canonical defaults.
- Manual billable override reason validation lives in shared payroll logic so mobile/admin/backend callers cannot accidentally calculate an override without the required reason.
- Audit log persistence was not added to `payroll.ts`; audit writing belongs to backend/admin mutation features. The shared helper only enforces the required override reason.
- No UI changed during `RF-FND-003`; `context/ui-registry.md` did not need an update.

## Problems solved

- Existing `payroll.ts` had basic payroll logic but no named shared constants, no exported calculation types, and no manual override reason validation.
- `autoStoppedAtMaxHours` now stays tied to hourly shift duration/payment mode, including manual override results, instead of being erased by override calculation.
- The tracker initially had a broad text replacement that touched the previous feature log's historical next line; it was corrected so `RF-FND-002` still points to `RF-FND-003` and current status points to `RF-FND-004`.
- PowerShell still resolves plain `npm` to blocked `npm.ps1`, so verification used `C:\Program Files\nodejs\npm.cmd`.

## Current state

- Current phase is Phase 1 - Shared Foundation.
- Last completed feature is `RF-FND-003 - Shared Payroll Logic`.
- Next feature in `context/progress-tracker.md` is `RF-FND-004 - Shared Role and Permission Logic`.
- `npm.cmd --workspace @routeforge/shared run typecheck` passed.
- `npm.cmd run typecheck` passed; Turbo ran `@routeforge/shared:typecheck`.
- `npm.cmd run lint` passed for admin and mobile workspaces.
- Known non-blocking warning: Turbo reports Git dubious ownership because the sandbox user differs from the repository owner.
- Known non-blocking warning from earlier sessions: Git status may report denied access to `C:\Users\Nikolay/.config/git/ignore`.
- Known non-blocking warning from earlier sessions: admin dev reports a Next.js workspace-root warning because both root `package-lock.json` and `apps/admin/package-lock.json` exist.

## Next session starts with

Run `/remember restore`, then implement `RF-FND-004 - Shared Role and Permission Logic`.

For `RF-FND-004`, start by reading the required RouteForge context in `AGENTS.md` order, then inspect:

- `context/build-plan.md`
- `context/data-model.md`
- `context/permissions.md`
- `context/code-standards.md`
- `packages/shared/src/types.ts`
- `packages/shared/src/index.ts`

Expected scope for `RF-FND-004`:

- Create `packages/shared/src/roles.ts`.
- Create `packages/shared/src/permissions.ts`.
- Define role helpers for `admin`, `dispatcher`, and `courier`.
- Add permission helpers from the build plan:
  - `canManageCourier`
  - `canReviewShift`
  - `canUploadDocument`
  - `canAccessDepot`
  - `canDownloadDocument`
- Keep dispatcher logic depot-scoped and admin full company-scoped.
- Update `context/progress-tracker.md` when complete.

## Open questions

- Whether to fix the duplicate lockfile / Next.js workspace-root warning now or leave it until a later monorepo cleanup.
- Whether the local PowerShell execution policy change now allows plain `npm`; test before assuming, and fall back to `npm.cmd` if needed.
- Whether to add package-level typecheck scripts for `apps/admin` and `apps/mobile` later, since root typecheck currently verifies only packages that define a `typecheck` task.
