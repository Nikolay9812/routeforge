# Memory - RF-FND-006 Zod Schemas

Last updated: 2026-06-25 18:42 +02:00

## What was built

- Completed `RF-FND-006 - Zod Schemas`.
- Added `zod` as a direct dependency of `@routeforge/shared` in `packages/shared/package.json`.
- Updated `package-lock.json` through npm after repairing one stale invalid lockfile entry.
- Added shared schema files:
  - `packages/shared/src/schemas/common.ts`
  - `packages/shared/src/schemas/profile.ts`
  - `packages/shared/src/schemas/shift.ts`
  - `packages/shared/src/schemas/document.ts`
  - `packages/shared/src/schemas/invitation.ts`
- Updated `packages/shared/src/index.ts` to export all shared schema modules.
- Updated `context/progress-tracker.md`:
  - marked `RF-FND-006` complete
  - added Shared Validation decisions
  - added a feature completion log entry
  - set next feature to `RF-FND-007 - Translation Keys`.

## Decisions made

- Shared validation lives in `packages/shared/src/schemas/`, matching the shared business logic boundary.
- Schema input names use camelCase for app/form/API payloads, while shared entity types in `types.ts` continue to mirror canonical database field names.
- `common.ts` owns reusable primitives and enums for IDs, dates, roles, statuses, payment modes, document types and supported languages.
- Date-only strings are validated as real `YYYY-MM-DD` dates, not only by regex shape.
- Invite codes are normalized to uppercase and accept only letters, numbers and hyphens between 6 and 24 characters.
- Shift schemas centralize package counters, kilometer ordering, end-after-start time validation, signature fields, rejection reason, correction reason and manual billable override reason validation.
- No UI changed during `RF-FND-006`; `context/ui-registry.md` did not need an update.

## Problems solved

- `zod` was approved in project context but not declared by `@routeforge/shared`; it is now a direct shared dependency instead of relying on an app-local nested install.
- The first `npm install --workspace @routeforge/shared zod@4.4.3` failed with `Invalid Version:` because root `package-lock.json` contained a stale empty package entry at `apps/mobile/node_modules/expo-image`.
- Removed only that invalid empty lockfile entry, then the Zod install succeeded.
- Verification still needs the process-local PATH workaround because Turbo/npm child processes need Windows system paths and Node on PATH.

## Current state

- Current phase is Phase 1 - Shared Foundation.
- Last completed feature is `RF-FND-006 - Zod Schemas`.
- Next feature in `context/progress-tracker.md` is `RF-FND-007 - Translation Keys`.
- Direct shared TypeScript check passed:
  - `node.exe node_modules\typescript\bin\tsc --noEmit -p packages/shared/tsconfig.json`
- Root typecheck passed with the process-local PATH fix:
  - `npm.cmd run typecheck`
  - Turbo ran `@routeforge/shared:typecheck`.
- Root lint passed with the process-local PATH fix:
  - `npm.cmd run lint`
  - Turbo passed admin and mobile lint tasks.
- Review pass found no remaining issues.
- `git status --short` fails under the sandbox user unless using a one-off safe-directory flag because of Git dubious ownership. With `git -c safe.directory='C:/Users/Nikolay/Desktop/routeforge' status --short`, the feature changed:
  - `context/progress-tracker.md`
  - `package-lock.json`
  - `packages/shared/package.json`
  - `packages/shared/src/index.ts`
  - `packages/shared/src/schemas/`
- Known non-blocking warning: `git` may also warn about permission denied for `C:\Users\Nikolay/.config/git/ignore` under the sandbox user.
- Known non-blocking warning from earlier sessions: admin dev reports a Next.js workspace-root warning because both root `package-lock.json` and `apps/admin/package-lock.json` exist.

## Next session starts with

Run `/remember restore`, then implement `RF-FND-007 - Translation Keys`.

For `RF-FND-007`, start by reading the required RouteForge context in `AGENTS.md` order, then inspect:

- `context/build-plan.md`
- `context/progress-tracker.md`
- `context/code-standards.md`
- `context/library-docs.md`
- `packages/shared/src/types.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/schemas/`

Expected scope for `RF-FND-007`:

- Create:
  - `packages/shared/src/translations/de.ts`
  - `packages/shared/src/translations/bg.ts`
  - `packages/shared/src/translations/index.ts`
- German is default.
- Bulgarian is optional.
- Add translation keys for auth, navigation, shifts, reports, history, mailbox, profile, admin dashboard, documents, exports and errors.
- Export translation modules from the shared package entry point.
- Update `context/progress-tracker.md` when complete.

## Open questions

- Whether to fix the duplicate lockfile / Next.js workspace-root warning now or leave it until a later monorepo cleanup.
- Whether to add package-level typecheck scripts for `apps/admin` and `apps/mobile` later, since root typecheck currently verifies only packages that define a `typecheck` task.
- Whether future schema consumers should expose raw Zod field errors or map them to German translation keys once `RF-FND-007` lands.
