# Memory - RF-FND-005 Shared Shift Status Logic

Last updated: 2026-06-25 18:20 +02:00

## What was built

- Completed `RF-FND-005 - Shared Shift Status Logic`.
- Added `packages/shared/src/shifts.ts` with:
  - `SHIFT_STATUSES`
  - `SHIFT_STATUS_TRANSITIONS`
  - `ShiftStatusTransitionInput`
  - `ShiftStatusTransitionResult`
  - `isShiftEditableByCourier`
  - `isShiftReadyForReview`
  - `isShiftApproved`
  - `isShiftLockedForCourier`
  - `requiresShiftTransitionReason`
  - `canTransitionShiftStatus`
- Updated `packages/shared/src/index.ts` to export `./shifts`.
- Updated `context/progress-tracker.md`:
  - marked `RF-FND-005` complete
  - added a feature completion log entry
  - set next feature to `RF-FND-006 - Zod Schemas`.

## Decisions made

- Shift workflow logic lives in `packages/shared/src/shifts.ts`, following the shared business logic boundary.
- `isShiftEditableByCourier` returns true for `draft` and `rejected`, matching the code standard that rejected shifts can be edited before resubmission.
- `isShiftReadyForReview` returns true for `submitted` and `under_review`.
- `isShiftApproved` returns true only for `approved`, because accountant exports use approved shifts only.
- `canTransitionShiftStatus` validates allowed workflow edges and rejects no-op transitions.
- Transitions to `rejected` and `corrected` require a non-empty reason.
- Audit persistence was not added to shared shift logic; audit writing belongs to backend/admin mutation features.
- No UI changed during `RF-FND-005`; `context/ui-registry.md` did not need an update.

## Problems solved

- Shared shift status behavior was not centralized before `RF-FND-005`; mobile/admin/backend phases would otherwise risk duplicating editability and transition rules.
- The feature clarified the rejected-shift path: rejected shifts are editable by the courier and can be resubmitted.
- The feature clarified locked states for courier editing: submitted, under_review, approved and corrected are not courier-editable through the shared helper.
- Verification continued to require the process-local PATH workaround from the previous feature because normal npm/Turbo child processes need Windows system paths and Node on PATH.

## Current state

- Current phase is Phase 1 - Shared Foundation.
- Last completed feature is `RF-FND-005 - Shared Shift Status Logic`.
- Next feature in `context/progress-tracker.md` is `RF-FND-006 - Zod Schemas`.
- Direct shared TypeScript check passed:
  - `node.exe node_modules\typescript\bin\tsc --noEmit -p packages/shared/tsconfig.json`
- Root typecheck passed with the process-local PATH fix:
  - `npm.cmd run typecheck`
  - Turbo ran `@routeforge/shared:typecheck`.
- Root lint passed with the process-local PATH fix:
  - `npm.cmd run lint`
  - Turbo replayed/passed admin and mobile lint tasks.
- Review pass found no remaining issues.
- `git status --short` could not run because `git` is not available in this PowerShell environment.
- Known non-blocking warning from earlier sessions: Turbo may report Git dubious ownership because the sandbox user differs from the repository owner.
- Known non-blocking warning from earlier sessions: admin dev reports a Next.js workspace-root warning because both root `package-lock.json` and `apps/admin/package-lock.json` exist.

## Next session starts with

Run `/remember restore`, then implement `RF-FND-006 - Zod Schemas`.

For `RF-FND-006`, start by reading the required RouteForge context in `AGENTS.md` order, then inspect:

- `context/build-plan.md`
- `context/data-model.md`
- `context/permissions.md`
- `context/code-standards.md`
- `context/library-docs.md`
- `packages/shared/src/types.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/payroll.ts`
- `packages/shared/src/permissions.ts`
- `packages/shared/src/shifts.ts`

Expected scope for `RF-FND-006`:

- Create shared Zod schema files:
  - `packages/shared/src/schemas/common.ts`
  - `packages/shared/src/schemas/profile.ts`
  - `packages/shared/src/schemas/shift.ts`
  - `packages/shared/src/schemas/document.ts`
  - `packages/shared/src/schemas/invitation.ts`
- Validate:
  - profile form
  - shift report
  - package counters
  - kilometer fields
  - invite code
  - document upload metadata
  - correction reason
- Export inferred TypeScript types from schemas.
- Export schemas from the shared package entry point.
- Update `context/progress-tracker.md` when complete.

## Open questions

- Whether to fix the duplicate lockfile / Next.js workspace-root warning now or leave it until a later monorepo cleanup.
- Whether the local PowerShell execution policy change now allows plain `npm`; test before assuming, and fall back to `npm.cmd` if needed.
- Whether to add package-level typecheck scripts for `apps/admin` and `apps/mobile` later, since root typecheck currently verifies only packages that define a `typecheck` task.
