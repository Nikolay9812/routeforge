# Memory - RF-FND-007 Translation Keys

Last updated: 2026-06-25 18:56 +02:00

## What was built

- Completed `RF-FND-007 - Translation Keys`.
- Created shared translation files:
  - `packages/shared/src/translations/de.ts`
  - `packages/shared/src/translations/bg.ts`
  - `packages/shared/src/translations/index.ts`
- Updated `packages/shared/src/index.ts` to export the translation module.
- Updated `context/progress-tracker.md`:
  - marked `RF-FND-007` complete
  - added Shared Translation Keys decisions
  - added a feature completion log entry
  - set next feature to `RF-DB-001 - InsForge Initial Schema`.

## Decisions made

- Shared translation catalogs live in `packages/shared/src/translations/`.
- German is the canonical default catalog and source of the key shape.
- Bulgarian is optional and type-checked against the German catalog shape.
- Shared translation coverage now includes auth, navigation, shifts, reports, history, mailbox, profile, admin dashboard, documents, exports and errors.
- Shared helpers expose `DEFAULT_LANGUAGE`, `OPTIONAL_LANGUAGE`, `SUPPORTED_TRANSLATION_LANGUAGES`, `translations`, `isSupportedLanguage`, `resolveSupportedLanguage` and `getTranslations`.
- No UI changed during `RF-FND-007`; `context/ui-registry.md` did not need an update.

## Problems solved

- Added a single shared translation foundation so future mobile and admin UI can avoid hardcoded German/Bulgarian strings.
- Made Bulgarian catalog completeness a TypeScript concern by checking it against the German `TranslationCatalog` type.
- Review caught a tracker bookkeeping issue where root verification lines were briefly placed under the previous feature log; this was corrected before completion.

## Current state

- Current phase is transitioning from Phase 1 - Shared Foundation to Phase 2 - InsForge Foundation.
- Last completed feature is `RF-FND-007 - Translation Keys`.
- Next feature in `context/progress-tracker.md` is `RF-DB-001 - InsForge Initial Schema`.
- Direct shared TypeScript check passed:
  - `node.exe node_modules\typescript\bin\tsc --noEmit -p packages/shared/tsconfig.json`
- Root typecheck passed with the process-local PATH fix:
  - `npm.cmd run typecheck`
  - Turbo ran `@routeforge/shared:typecheck`.
- Root lint passed with the process-local PATH fix:
  - `npm.cmd run lint`
  - Turbo passed admin and mobile lint tasks.
- `git diff --check` passed.
- Review pass found no remaining issues.
- Current working tree changes for the latest feature:
  - `context/progress-tracker.md`
  - `packages/shared/src/index.ts`
  - `packages/shared/src/translations/`
- Known non-blocking warning: `git` may warn about permission denied for `C:\Users\Nikolay/.config/git/ignore` under the sandbox user.
- Known non-blocking warning: Turbo reports Git dubious ownership in the sandbox unless using a one-off safe-directory flag for Git commands.
- Known non-blocking warning from earlier sessions: admin dev reports a Next.js workspace-root warning because both root `package-lock.json` and `apps/admin/package-lock.json` exist.

## Next session starts with

Run `/remember restore`, then implement `RF-DB-001 - InsForge Initial Schema`.

For `RF-DB-001`, start by reading the required RouteForge context in `AGENTS.md` order, then inspect:

- `context/build-plan.md`
- `context/progress-tracker.md`
- `context/data-model.md`
- `context/permissions.md`
- `context/security-gdpr.md`
- `context/code-standards.md`
- `insforge/` if present
- `packages/shared/src/types.ts`
- `packages/shared/src/schemas/`

Expected scope for `RF-DB-001`:

- Create `insforge/migrations/0001_initial_schema.sql`.
- Create initial tables:
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
- Every company-owned table must include `company_id`.
- Add primary keys, foreign keys, indexes and basic constraints.
- Do not implement RLS yet; that is `RF-DB-002`.
- Update `context/progress-tracker.md` when complete.

## Open questions

- Whether to fix the duplicate lockfile / Next.js workspace-root warning now or leave it until a later monorepo cleanup.
- Whether to add package-level typecheck scripts for `apps/admin` and `apps/mobile` later, since root typecheck currently verifies only packages that define a `typecheck` task.
- Whether future schema consumers should expose raw Zod field errors or map them to shared German translation keys.
