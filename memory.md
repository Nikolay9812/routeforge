# Memory - RF-FND-004 Shared Role and Permission Logic

Last updated: 2026-06-24 19:35 +02:00

## What was built

- Completed `RF-FND-004 - Shared Role and Permission Logic`.
- Added `packages/shared/src/roles.ts` with:
  - `USER_ROLES`
  - `ROLE_RANK`
  - `isAdmin`
  - `isDispatcher`
  - `isCourier`
  - `isStaffRole`
  - `hasRoleAtLeast`
- Added `packages/shared/src/permissions.ts` with shared permission types:
  - `DispatcherPermissionSet`
  - `PermissionActor`
  - `DepotPermissionTarget`
  - `CourierPermissionTarget`
  - `ShiftPermissionTarget`
  - `DocumentPermissionTarget`
- Implemented shared permission helpers:
  - `canManageCourier`
  - `canReviewShift`
  - `canUploadDocument`
  - `canAccessDepot`
  - `canDownloadDocument`
- Updated `packages/shared/src/index.ts` to export `./roles` and `./permissions`.
- Updated `context/progress-tracker.md`:
  - marked `RF-FND-004` complete
  - added a feature completion log entry
  - set next feature to `RF-FND-005 - Shared Shift Status Logic`.

## Decisions made

- Shared permission helpers are reusable UX/server-side helpers only; InsForge RLS and server-side auth checks remain the real security boundary.
- Admin helpers are company-scoped and require an active profile for protected operational actions.
- Dispatcher helpers require both depot scope and explicit capability flags for optional dispatcher actions such as courier management, shift review and document access.
- Courier helpers stay self-scoped.
- Pending-approval couriers may access their own required document upload/download flow when explicitly permitted, so they can complete onboarding documents before approval.
- `hasRoleAtLeast` is kept as coarse role ordering only; action-specific permission checks must use `permissions.ts`.
- No UI changed during `RF-FND-004`; `context/ui-registry.md` did not need an update.

## Problems solved

- `RF-FND-004` initially exposed no shared permission layer; role/depot/courier scope would otherwise be easy to duplicate inconsistently across mobile, admin and backend phases.
- A review pass caught that document helpers should not require `active` status for pending couriers completing required onboarding documents. This was fixed by allowing pending couriers to access their own documents when the caller explicitly allows courier upload/download.
- Normal `npm.cmd --workspace @routeforge/shared run typecheck` first failed before compilation because the child shell could not resolve `node`.
- A second root typecheck attempt failed before compilation because the child process could not resolve `cmd.exe`.
- Verification was fixed by running npm/Turbo checks with a process-local PATH that includes:
  - `C:\Windows\System32`
  - `C:\Windows`
  - `C:\Program Files\nodejs`

## Current state

- Current phase is Phase 1 - Shared Foundation.
- Last completed feature is `RF-FND-004 - Shared Role and Permission Logic`.
- Next feature in `context/progress-tracker.md` is `RF-FND-005 - Shared Shift Status Logic`.
- Direct shared TypeScript check passed:
  - `node.exe node_modules\typescript\bin\tsc --noEmit -p packages/shared/tsconfig.json`
- Root typecheck passed with the process-local PATH fix:
  - `npm.cmd run typecheck`
  - Turbo ran `@routeforge/shared:typecheck`.
- Root lint passed with the process-local PATH fix:
  - `npm.cmd run lint`
  - Turbo replayed/passed admin and mobile lint tasks.
- `git status --short` could not run because `git` is not available in this PowerShell environment.
- Known non-blocking warning from earlier sessions: Turbo may report Git dubious ownership because the sandbox user differs from the repository owner.
- Known non-blocking warning from earlier sessions: admin dev reports a Next.js workspace-root warning because both root `package-lock.json` and `apps/admin/package-lock.json` exist.

## Next session starts with

Run `/remember restore`, then implement `RF-FND-005 - Shared Shift Status Logic`.

For `RF-FND-005`, start by reading the required RouteForge context in `AGENTS.md` order, then inspect:

- `context/build-plan.md`
- `context/data-model.md`
- `context/permissions.md`
- `context/code-standards.md`
- `packages/shared/src/types.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/permissions.ts`

Expected scope for `RF-FND-005`:

- Create `packages/shared/src/shifts.ts`.
- Define the shift status workflow:
  - `draft`
  - `submitted`
  - `under_review`
  - `approved`
  - `rejected`
  - `corrected`
- Implement helpers from the build plan:
  - `isShiftEditableByCourier`
  - `isShiftReadyForReview`
  - `isShiftApproved`
  - `canTransitionShiftStatus`
- Preserve locked decisions:
  - approved shifts are locked for couriers
  - rejected shifts can be edited and resubmitted
  - corrections require admin/dispatcher reason
- Export `./shifts` from `packages/shared/src/index.ts`.
- Update `context/progress-tracker.md` when complete.

## Open questions

- Whether to fix the duplicate lockfile / Next.js workspace-root warning now or leave it until a later monorepo cleanup.
- Whether the local PowerShell execution policy change now allows plain `npm`; test before assuming, and fall back to `npm.cmd` if needed.
- Whether to add package-level typecheck scripts for `apps/admin` and `apps/mobile` later, since root typecheck currently verifies only packages that define a `typecheck` task.
