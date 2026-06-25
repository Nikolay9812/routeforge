# Progress Tracker

Update this file after every completed RouteForge feature. Any AI agent reading this should immediately know what is done, what is in progress, what is next, and which Feature ID must be implemented next.

This tracker must stay synchronized with:

- `context/build-plan.md`
- `memory.md`
- `context/ui-registry.md`
- `context/codex-workflow.md`

---

## Current Status

**Project:** RouteForge
**Phase:** Phase 2 — InsForge Foundation
**Last completed:** RF-DB-003 Storage Buckets
**Current focus:** Prepare demo seed data
**Next:** RF-DB-004 Demo Seed Data

---

## Working Rule

Every completed feature must update this file.

For each feature:

1. Mark the checkbox as complete
2. Add notes under **Feature Completion Log**
3. Add important decisions under **Decisions Made During Build**
4. Add UI patterns to `context/ui-registry.md` if UI changed
5. Add the next exact Feature ID under **Next Feature**

Codex must never guess the next step. The next step is always read from this tracker and `context/build-plan.md`.

---

## Next Feature

```txt
RF-DB-004 - Demo Seed Data
```

---

## Progress

### Phase 0 — Codex Context & Design References

- [x] RF-000-001 Codex Context System
- [x] RF-000-002 Design Reference Folder
- [x] RF-000-003 UI Tokens and UI Rules

### Phase 1 — Shared Foundation

- [x] RF-FND-001 Monorepo Verification
- [x] RF-FND-002 Shared Types
- [x] RF-FND-003 Shared Payroll Logic
- [x] RF-FND-004 Shared Role and Permission Logic
- [x] RF-FND-005 Shared Shift Status Logic
- [x] RF-FND-006 Zod Schemas
- [x] RF-FND-007 Translation Keys

### Phase 2 — InsForge Foundation

- [x] RF-DB-001 InsForge Initial Schema
- [x] RF-DB-002 Row Level Security Policies
- [x] RF-DB-003 Storage Buckets
- [ ] RF-DB-004 Demo Seed Data

### Phase 3 — Mobile App UI With Mock Data

- [ ] RF-MOB-001 Mobile Shell and Navigation
- [ ] RF-MOB-002 Mobile Login UI
- [ ] RF-MOB-003 Mobile Invite Registration UI
- [ ] RF-MOB-004 Home / Current Shift UI
- [ ] RF-MOB-005 Daily Report UI
- [ ] RF-MOB-006 History Calendar UI
- [ ] RF-MOB-007 Day Details UI
- [ ] RF-MOB-008 Digital Mailbox UI
- [ ] RF-MOB-009 Mailbox Item Details UI
- [ ] RF-MOB-010 Profile / Documents UI
- [ ] RF-MOB-011 Mobile Settings UI

### Phase 4 — Mobile App Local Logic

- [ ] RF-MOB-012 Timer Local State
- [ ] RF-MOB-013 Timer Persistence
- [ ] RF-MOB-014 Hourly 10h Auto Stop
- [ ] RF-MOB-015 Daily Fixed Time Display
- [ ] RF-MOB-016 Daily Report Validation
- [ ] RF-MOB-017 Photo Capture and Compression
- [ ] RF-MOB-018 Signature Capture
- [ ] RF-MOB-019 GPS Start/Stop Capture
- [ ] RF-MOB-020 Offline Draft Queue

### Phase 5 — Admin Panel UI With Mock Data

- [ ] RF-ADM-001 Admin Login UI
- [ ] RF-ADM-002 Admin Shell and Navigation
- [ ] RF-ADM-003 Admin Dashboard UI
- [ ] RF-ADM-004 Shift Management UI
- [ ] RF-ADM-005 Shift Review Details UI
- [ ] RF-ADM-006 Shift Correction UI
- [ ] RF-ADM-007 Couriers List UI
- [ ] RF-ADM-008 Courier Profile Admin UI
- [ ] RF-ADM-009 Dispatcher Management UI
- [ ] RF-ADM-010 Depot Management UI
- [ ] RF-ADM-011 Documents Upload UI
- [ ] RF-ADM-012 Invitations UI
- [ ] RF-ADM-013 Accountant Export UI
- [ ] RF-ADM-014 Audit Logs UI
- [ ] RF-ADM-015 Company Settings UI

### Phase 6 — Admin Panel Local Logic

- [ ] RF-ADM-016 Shift Filters and Table State
- [ ] RF-ADM-017 Shift Correction Local Logic
- [ ] RF-ADM-018 Courier Approval Local Logic
- [ ] RF-ADM-019 Dispatcher Depot Access Local Logic
- [ ] RF-ADM-020 Document Upload Local Logic
- [ ] RF-ADM-021 Invitation Local Logic
- [ ] RF-ADM-022 Export Preview Local Logic

### Phase 7 — Backend Integration

- [ ] RF-BE-001 InsForge Auth Integration
- [ ] RF-BE-002 Invitation Backend
- [ ] RF-BE-003 Profile Approval Backend
- [ ] RF-BE-004 Depot Backend
- [ ] RF-BE-005 Dispatcher Depot Access Backend
- [ ] RF-BE-006 Shift Start/Stop Backend
- [ ] RF-BE-007 Shift Location Backend
- [ ] RF-BE-008 Daily Report Submit Backend
- [ ] RF-BE-009 Shift Photo Upload Backend
- [ ] RF-BE-010 Signature Upload Backend
- [ ] RF-BE-011 Admin Shift Approval Backend
- [ ] RF-BE-012 Documents and Mailbox Backend
- [ ] RF-BE-013 History Backend

### Phase 8 — PDFs, Exports and Retention

- [ ] RF-DOC-001 Daily PDF Generation
- [ ] RF-DOC-002 Monthly PDF Generation
- [ ] RF-DOC-003 Accountant CSV Export
- [ ] RF-DOC-004 Accountant XLSX Export
- [ ] RF-DOC-005 Shift Photo Retention Cleanup
- [ ] RF-DOC-006 Company Stamp PNG Support

### Phase 9 — Security, Polish and Production Prep

- [ ] RF-PROD-001 Loading, Empty and Error States
- [ ] RF-PROD-002 Security Review
- [ ] RF-PROD-003 GDPR / DSGVO Review
- [ ] RF-PROD-004 Performance Review
- [ ] RF-PROD-005 Deployment Checklist

---

## Decisions Made During Build

### Product Direction

- RouteForge is a multi-tenant courier operations platform.
- The first target use case is a German courier subcontractor company working with Amazon Heavy Bulky deliveries.
- The platform has two applications:
  - Expo mobile app for couriers
  - Next.js admin panel for admins and dispatchers
- Backend is InsForge Auth + DB + Storage + RLS.
- No AI automation, external job search APIs, browser automation tooling or analytics provider integrations in RouteForge v1.

### Development Method

- UI-first development.
- Build full visible UI with mock data before backend integration.
- Every feature must be implemented by Feature ID from `context/build-plan.md`.
- Root monorepo uses npm workspaces with `packageManager: npm@11.11.0` and Turborepo task configuration in `turbo.json`.
- Codex must use:
  - `/architect`
  - `/implement`
  - `/review`
  - `/imprint`
  - `/remember save`
  - `/recover`
- Codex must not skip ahead.

### Roles and Permissions

- Roles:
  - admin
  - dispatcher
  - courier
- Admin has full access inside the company.
- Dispatcher access is controlled by admin.
- Dispatcher can be assigned one, multiple or all depots.
- Courier can access only own profile, own shifts, own mailbox and own PDFs.
- Shared permission helpers require explicit dispatcher capability flags for optional dispatcher actions, while still enforcing depot scope.

### Company and Depot Model

- Multi-tenant from the beginning.
- Every company-owned table must include `company_id`.
- Shared entity types in `packages/shared/src/types.ts` mirror canonical data model field names for tenant-scoped records.
- Admin can manage depots.
- Dispatcher depot scope is stored through `profile_depot_access`.

### Courier Flow

- Courier registration uses email invite code.
- New courier starts as `pending_approval`.
- Courier must be approved before full access.
- One shift per courier per day in v1.
- Two shifts per day are out of scope for v1.

### Shift and Payroll

- Payment modes:
  - `hourly`
  - `daily_fixed`
- Hourly courier:
  - real time tracked
  - legal break calculated
  - billable time capped at 10:00 h / 600 minutes
  - timer auto-stops at 10:00 h
- Daily fixed courier:
  - real time tracked
  - billable time defaults to 8:20 h / 500 minutes
  - admin/dispatcher can override with reason
- Billable overrides must be audit logged.
- Couriers can edit `draft` and `rejected` shifts before resubmission.
- Submitted and approved shifts are locked for couriers.
- Shift transitions to `rejected` or `corrected` require a reason.

### Shared Validation

- Shared Zod schemas live in `packages/shared/src/schemas/`.
- Shared schemas use camelCase form/API input names while shared entity types continue to mirror canonical database field names.
- Zod is an approved shared dependency and is declared directly on `@routeforge/shared`.
- Invite codes are normalized to uppercase and accept only letters, numbers and hyphens between 6 and 24 characters.
- Shift report validation centralizes package counters, kilometer order, time order, signature reference, rejection reason, correction reason and manual override reason rules.

### Shared Translation Keys

- Shared translation catalogs live in `packages/shared/src/translations/`.
- German is the canonical default catalog.
- Bulgarian is optional and type-checked against the German catalog shape.
- Mobile and admin UI should import shared translation keys instead of hardcoding German/Bulgarian strings in components.
- Shared translation helpers expose the default language, supported languages, language resolution and catalog lookup.

### InsForge Initial Schema

- Initial database schema lives in `insforge/migrations/0001_initial_schema.sql`.
- `RF-DB-001` creates only public application tables, primary keys, foreign keys, indexes and row-local constraints.
- RLS policies, storage bucket policies and seed data remain separate Phase 2 features.
- All company-owned tables include `company_id` from the first migration.
- The migration mirrors shared union values for roles, statuses, payment modes, languages, document types, mailbox categories and photo/location types through SQL `CHECK` constraints.
- `shifts` enforces one shift per courier per day through `(company_id, courier_profile_id, shift_date)`.
- `shift_photos` metadata defaults `expires_at` to `uploaded_at + 14 days`; actual file cleanup remains a later retention feature.

### InsForge Row Level Security

- RLS policy migration lives in `insforge/migrations/0002_rls_policies.sql`.
- All public application tables from `RF-DB-001` have RLS enabled.
- RLS helper functions are `SECURITY DEFINER` with pinned `search_path = pg_catalog, public, pg_temp` to avoid recursive RLS lookups.
- Runtime table grants are revoked from `anon`; authenticated access is granted only through RLS-protected operations.
- Admins can access and mutate data inside their own company workspace.
- Dispatchers can read assigned-depot data by default; optional dispatcher write capabilities remain closed until later backend features explicitly open them.
- Couriers can read only their own operational data and create/update only narrow own-shift, location, photo and mailbox-read flows.
- Audit logs are read-only for active company admins through RLS; client-side insert, update and delete are not granted.
- Trigger guards protect non-admin shift protected fields and mailbox item content during client-side updates.

### InsForge Storage Policies

- Storage policy migration lives in `insforge/migrations/0003_storage_policies.sql`.
- Expected private buckets are:
  - `courier-documents`
  - `shift-photos`
  - `payslips`
  - `generated-pdfs`
  - `company-assets`
- InsForge bucket creation is an admin/CLI operation, not a public-schema SQL operation, so live buckets must be created with InsForge tooling when migrations are applied.
- RouteForge storage object keys must start with `companies/{company_id}` to keep tenant ownership visible in every path.
- Shift photos use `companies/{company_id}/shifts/{shift_id}/photos/...`.
- Courier documents use `companies/{company_id}/couriers/{courier_id}/docs/...`.
- Payslips use `companies/{company_id}/couriers/{courier_id}/payslips/...`.
- Generated PDFs use `companies/{company_id}/reports/{shift_or_courier_id}/...`.
- Company assets use `companies/{company_id}/assets/...`.
- Storage helper functions expose read, write and delete decisions that mirror metadata RLS: admin company access, dispatcher depot scope through existing helpers and courier self-scope.
- Shift photo and document metadata now checks that stored bucket/path values match the expected RouteForge path pattern and tenant/courier/shift scope.

### GPS and Geofence

- Store only shift start and stop GPS location in v1.
- No live GPS tracking in v1.
- If start/stop is outside depot geofence, admin/dispatcher sees a red warning.
- If location permission is denied, shift can continue but admin sees missing location warning.

### Photos and Documents

- Shift proof photos are operational evidence.
- Required photo types:
  - start km
  - end km
  - Fahrtenbuch
  - Mentor screenshot
- Photos are compressed before upload.
- Shift photos are retained for 14 days, then deleted from storage.
- Keep necessary metadata after file deletion.
- Payslips, contracts and official documents are private and are not part of the 14-day shift photo cleanup.

### PDFs and Exports

- Daily and monthly PDFs are generated server-side.
- Company stamp PNG will be added later when provided.
- Accountant exports support CSV and XLSX.
- Exports use approved shifts only.
- Exports use billable time, while also showing real time.

### UI Direction

- German is default language.
- Bulgarian is optional through translation keys.
- RouteForge visual style:
  - white cards
  - blue primary actions
  - rounded corners
  - subtle dotted mobile backgrounds
  - clean operational UI
- Mobile and admin should feel like one product family.
- JobPilot purple is not used.

---

## Feature Completion Log

Add a new entry after every completed feature.

### RF-000-001 — Codex Context System

**Date:** 2026-06-24
**Status:** completed
**Files changed:**

- `AGENTS.md`
- `memory.md`
- `context/codex-workflow.md`
- `context/progress-tracker.md`

**What was done:**

- Confirmed the root `AGENTS.md` defines the required repository rules and context read order.
- Reconciled `context/codex-workflow.md` with the root `AGENTS.md` read order.
- Confirmed Feature ID workflow includes architect, implement, review, imprint, remember and recover.
- Confirmed Codex must read `context/build-plan.md` before implementation and work by Feature ID only.

**Verification:**

- Command run: `Get-Content -Raw AGENTS.md`
- Command run: required context files read in the root `AGENTS.md` order
- Result: context system is present and synchronized.

**Notes:**

- `git status --short` could not be run because `git` is not available in this PowerShell environment.

**Next:**

- RF-000-002 — Design Reference Folder

### RF-000-002 — Design Reference Folder

**Date:** 2026-06-24
**Status:** completed
**Files changed:**

- `context/designs/README.md`
- `context/designs/mobile/`
- `context/designs/admin/`
- `context/ui-registry.md`
- `context/progress-tracker.md`

**What was done:**

- Confirmed the design reference README exists.
- Confirmed mobile and admin design reference folders exist.
- Confirmed approved mobile and admin reference screenshots are present.
- Recorded the design reference folder entry in the UI registry implementation log.

**Verification:**

- Command run: `Get-ChildItem -Force context/designs`
- Command run: `Get-ChildItem -Force context/designs/mobile`
- Command run: `Get-ChildItem -Force context/designs/admin`
- Result: required design folders and screenshots are present.

**Notes:**

- No placeholder or fake design assets were created.

**Next:**

- RF-000-003 — UI Tokens and UI Rules

### RF-000-003 — UI Tokens and UI Rules

**Date:** 2026-06-24
**Status:** completed
**Files changed:**

- `context/ui-tokens.md`
- `context/ui-rules.md`
- `context/mobile-rules.md`
- `context/admin-rules.md`
- `context/progress-tracker.md`

**What was done:**

- Confirmed RouteForge UI tokens are documented for admin and mobile.
- Confirmed UI rules, mobile rules and admin rules define colors, spacing, radius, cards, typography and layout direction.
- Confirmed the no-hardcoded-colors rule is documented.

**Verification:**

- Command run: `Get-Content -Raw context/ui-tokens.md`
- Command run: `Get-Content -Raw context/ui-rules.md`
- Command run: `Get-Content -Raw context/mobile-rules.md`
- Command run: `Get-Content -Raw context/admin-rules.md`
- Result: UI token and rules files are present and ready for Phase 1 and later UI work.

**Notes:**

- Phase 0 contains no product UI changes.

**Next:**

- RF-FND-001 — Monorepo Verification

### RF-FND-001 — Monorepo Verification

**Date:** 2026-06-24
**Status:** completed
**Files changed:**

- `package.json`
- `turbo.json`
- `.gitignore`
- `context/progress-tracker.md`

**What was done:**

- Verified root `package.json` has npm workspaces for `apps/*` and `packages/*`.
- Added root `packageManager: npm@11.11.0` so Turborepo can resolve workspaces.
- Added root `turbo.json` with `dev`, `lint` and `typecheck` tasks.
- Added `.turbo` cache ignores to `.gitignore`.
- Verified `apps/admin`, `apps/mobile` and `packages/shared` are present as workspaces.
- Confirmed root scripts:
  - `npm run dev:admin`
  - `npm run dev:mobile`

**Verification:**

- Command run: `& 'C:\Program Files\nodejs\npm.cmd' --version`
- Result: npm `11.11.0`.
- Command run: `& 'C:\Program Files\nodejs\npm.cmd' exec turbo -- --version`
- Result: Turbo `2.9.18`.
- Command run: `& 'C:\Program Files\nodejs\npm.cmd' query .workspace`
- Result: workspaces resolve to `admin`, `mobile` and `@routeforge/shared`.
- Command run: `& 'C:\Program Files\nodejs\npm.cmd' run lint`
- Result: passed after rerunning with elevated filesystem access; the sandboxed run hit an ESLint resolver `EPERM` outside the workspace.
- Command run: `& 'C:\Program Files\nodejs\npm.cmd' run typecheck`
- Result: Turbo runs successfully, but no package-level `typecheck` tasks exist yet, so no tasks are executed.
- Command run: `& 'C:\Program Files\nodejs\npm.cmd' run dev:admin`
- Result: Next.js `16.2.9` starts successfully at `http://localhost:3000`.
- Command run: `& 'C:\Program Files\nodejs\npm.cmd' run dev:mobile`
- Result: Expo/Metro starts successfully with network access at `exp://192.168.0.47:8081` and `http://localhost:8081`.

**Notes:**

- In PowerShell, use `npm.cmd` instead of `npm` because `npm.ps1` is blocked by the current execution policy.
- `dev:admin` reports a Next.js workspace-root warning because both root `package-lock.json` and `apps/admin/package-lock.json` exist. The app still boots.
- `dev:mobile` needs network access because Expo performs remote fetches during startup.
- `npm install --package-lock-only` was not completed because it attempted a registry fetch under restricted network/cache access. No dependency changes were made.
- No UI changed; `context/ui-registry.md` was not updated.

**Next:**

- RF-FND-002 — Shared Types

### RF-FND-002 — Shared Types

**Date:** 2026-06-24
**Status:** completed
**Files changed:**

- `packages/shared/src/types.ts`
- `packages/shared/src/index.ts`
- `packages/shared/package.json`
- `packages/shared/tsconfig.json`
- `context/progress-tracker.md`

**What was done:**

- Expanded `packages/shared/src/types.ts` with core platform union types:
  - `UUID`
  - `UserRole`
  - `ProfileStatus`
  - `PaymentMode`
  - `ShiftStatus`
  - `BillableSource`
  - `InvitationStatus`
  - `ShiftLocationType`
  - `ShiftPhotoType`
  - `DocumentType`
  - `MailboxCategory`
  - `SupportedLanguage`
- Added shared entity types for:
  - `Company`
  - `Depot`
  - `Profile`
  - `ProfileDepotAccess`
  - `Invitation`
  - `Shift`
  - `ShiftLocation`
  - `ShiftPhoto`
  - `Document`
  - `MailboxItem`
  - `AuditLog`
- Preserved the existing `PayrollSettings` contract used by `packages/shared/src/payroll.ts`.
- Switched shared public exports in `packages/shared/src/index.ts` to extensionless package exports.
- Added a shared `typecheck` script and `packages/shared/tsconfig.json` so root `npm run typecheck` verifies the shared package through Turbo.

**Verification:**

- Command run: `& 'C:\Program Files\nodejs\npm.cmd' exec tsc -- --noEmit --strict --module esnext --moduleResolution bundler --target es2020 packages/shared/src/index.ts packages/shared/src/types.ts packages/shared/src/payroll.ts`
- Result: passed.
- Command run: `& 'C:\Program Files\nodejs\npm.cmd' run typecheck`
- Result: passed; Turbo ran `@routeforge/shared:typecheck`.
- Command run: `& 'C:\Program Files\nodejs\npm.cmd' run lint`
- Result: passed for admin and mobile workspaces.

**Notes:**

- No UI changed; `context/ui-registry.md` was not updated.
- The shared entity types intentionally use canonical data-model field names for database-backed records.
- PowerShell still blocks `npm.ps1` in this environment, so verification used `npm.cmd`.
- Turbo still reports the non-blocking Git dubious ownership warning in the sandbox.

**Next:**

- RF-FND-003 — Shared Payroll Logic

### RF-FND-003 - Shared Payroll Logic

**Date:** 2026-06-24
**Status:** completed
**Files changed:**

- `packages/shared/src/payroll.ts`
- `packages/shared/src/constants/index.ts`
- `packages/shared/src/index.ts`
- `context/progress-tracker.md`

**What was done:**

- Added shared payroll constants for hourly max minutes, daily fixed minutes and legal break thresholds.
- Expanded shared payroll calculation types for inputs and results.
- Implemented legal break calculation with validated whole-minute inputs.
- Implemented hourly billable calculation with the 600-minute cap and auto-stop flag.
- Implemented daily fixed calculation with the 500-minute default.
- Implemented manual billable override support with required reason validation.
- Exported payroll constants through the shared package entry point.

**Verification:**

- Command run: `& 'C:\Program Files\nodejs\npm.cmd' --workspace @routeforge/shared run typecheck`
- Result: passed.
- Command run: `& 'C:\Program Files\nodejs\npm.cmd' run typecheck`
- Result: passed; Turbo ran `@routeforge/shared:typecheck`.
- Command run: `& 'C:\Program Files\nodejs\npm.cmd' run lint`
- Result: passed for admin and mobile workspaces.

**Notes:**

- No UI changed; `context/ui-registry.md` was not updated.
- Audit log writing is not implemented in shared payroll because audit persistence belongs to backend/admin mutation features; this helper enforces the required override reason before callers persist the audited change.

**Next:**

- RF-FND-004 - Shared Role and Permission Logic

### RF-FND-004 - Shared Role and Permission Logic

**Date:** 2026-06-24
**Status:** completed
**Files changed:**

- `packages/shared/src/roles.ts`
- `packages/shared/src/permissions.ts`
- `packages/shared/src/index.ts`
- `context/progress-tracker.md`

**What was done:**

- Added shared role constants, role ranking and role helper functions for admin, dispatcher and courier.
- Added shared permission actor and target types for company, depot, courier, shift and document permission checks.
- Implemented `canManageCourier`, `canReviewShift`, `canUploadDocument`, `canAccessDepot` and `canDownloadDocument`.
- Enforced active-profile and same-company checks inside shared permission helpers.
- Kept admin company-scoped, dispatcher depot-scoped and courier self-scoped.
- Required explicit dispatcher permission flags for optional dispatcher actions such as courier management, shift review and document access.
- Allowed pending-approval couriers to access their own required document upload/download flow when explicitly permitted.
- Exported role and permission helpers from the shared package entry point.

**Verification:**

- Command run: `& 'C:\Program Files\nodejs\node.exe' 'node_modules\typescript\bin\tsc' --noEmit -p 'packages/shared/tsconfig.json'`
- Result: passed.
- Command run: process-local PATH with `C:\Windows\System32`, `C:\Windows` and `C:\Program Files\nodejs`, then `& 'C:\Program Files\nodejs\npm.cmd' run typecheck`
- Result: passed; Turbo ran `@routeforge/shared:typecheck`.
- Command run: process-local PATH with `C:\Windows\System32`, `C:\Windows` and `C:\Program Files\nodejs`, then `& 'C:\Program Files\nodejs\npm.cmd' run lint`
- Result: passed for admin and mobile workspaces.

**Notes:**

- No UI changed; `context/ui-registry.md` was not updated.
- Shared permission helpers are reusable UX/server-side helpers only. InsForge RLS and server-side auth checks remain the real security boundary.
- The first npm workspace typecheck attempt failed before compilation because the child shell could not resolve Windows/Node commands. Verification passed after running with a process-local PATH that includes Windows system paths and Node.

**Next:**

- RF-FND-005 - Shared Shift Status Logic

### RF-FND-005 - Shared Shift Status Logic

**Date:** 2026-06-24
**Status:** completed
**Files changed:**

- `packages/shared/src/shifts.ts`
- `packages/shared/src/index.ts`
- `context/progress-tracker.md`

**What was done:**

- Added shared shift status constants and transition rules.
- Implemented `isShiftEditableByCourier`.
- Implemented `isShiftReadyForReview`.
- Implemented `isShiftApproved`.
- Implemented `canTransitionShiftStatus`.
- Added `isShiftLockedForCourier` and `requiresShiftTransitionReason` to keep common workflow checks centralized.
- Exported shift workflow helpers from the shared package entry point.

**Verification:**

- Command run: `& 'C:\Program Files\nodejs\node.exe' 'node_modules\typescript\bin\tsc' --noEmit -p 'packages/shared/tsconfig.json'`
- Result: passed.
- Command run: process-local PATH with `C:\Windows\System32`, `C:\Windows` and `C:\Program Files\nodejs`, then `& 'C:\Program Files\nodejs\npm.cmd' run typecheck`
- Result: passed; Turbo ran `@routeforge/shared:typecheck`.
- Command run: process-local PATH with `C:\Windows\System32`, `C:\Windows` and `C:\Program Files\nodejs`, then `& 'C:\Program Files\nodejs\npm.cmd' run lint`
- Result: passed for admin and mobile workspaces.

**Notes:**

- No UI changed; `context/ui-registry.md` was not updated.
- `isShiftEditableByCourier` allows `draft` and `rejected`, matching the code standard that rejected shifts can be edited before resubmission.
- `canTransitionShiftStatus` enforces non-empty reasons for transitions to `rejected` and `corrected`; audit persistence remains a backend/admin mutation responsibility.

**Next:**

- RF-FND-006 - Zod Schemas

### RF-FND-006 - Zod Schemas

**Date:** 2026-06-25
**Status:** completed
**Files changed:**

- `package-lock.json`
- `packages/shared/package.json`
- `packages/shared/src/index.ts`
- `packages/shared/src/schemas/common.ts`
- `packages/shared/src/schemas/profile.ts`
- `packages/shared/src/schemas/shift.ts`
- `packages/shared/src/schemas/document.ts`
- `packages/shared/src/schemas/invitation.ts`
- `context/progress-tracker.md`

**What was done:**

- Added `zod` as a direct dependency of `@routeforge/shared`.
- Added common primitive and enum schemas for IDs, dates, roles, statuses, payment modes, document types and languages.
- Added profile form and profile status update schemas.
- Added shift report schemas for package counters, kilometer order, time order, billable override reason, rejection reason, correction reason and status reason validation.
- Added document upload metadata schema for private storage document records.
- Added invitation schemas for invite code, invitation creation and invite usage.
- Exported inferred TypeScript input types from every schema file.
- Exported all schemas through the shared package entry point.

**Verification:**

- Command run: `& 'C:\Program Files\nodejs\node.exe' 'node_modules\typescript\bin\tsc' --noEmit -p 'packages\shared\tsconfig.json'`
- Result: passed.
- Command run: process-local PATH with `C:\Windows\System32`, `C:\Windows` and `C:\Program Files\nodejs`, then `& 'C:\Program Files\nodejs\npm.cmd' run typecheck`
- Result: passed; Turbo ran `@routeforge/shared:typecheck`.
- Command run: process-local PATH with `C:\Windows\System32`, `C:\Windows` and `C:\Program Files\nodejs`, then `& 'C:\Program Files\nodejs\npm.cmd' run lint`
- Result: passed for admin and mobile workspaces.

**Notes:**

- No UI changed; `context/ui-registry.md` was not updated.
- The first `npm install --workspace @routeforge/shared zod@4.4.3` attempt failed because `package-lock.json` contained one stale empty package entry at `apps/mobile/node_modules/expo-image`. That invalid entry was removed, then the dependency install succeeded.
- Turbo still reports the known non-blocking Git dubious ownership warning in the sandbox.

**Next:**

- RF-FND-007 - Translation Keys

### RF-FND-007 - Translation Keys

**Date:** 2026-06-25
**Status:** completed
**Files changed:**

- `packages/shared/src/index.ts`
- `packages/shared/src/translations/de.ts`
- `packages/shared/src/translations/bg.ts`
- `packages/shared/src/translations/index.ts`
- `context/progress-tracker.md`

**What was done:**

- Added the default German translation catalog for auth, navigation, shifts, reports, history, mailbox, profile, admin dashboard, documents, exports and errors.
- Added the optional Bulgarian translation catalog with the same type-checked key structure.
- Added shared translation exports, supported language constants, language resolution and catalog lookup helpers.
- Exported translations through the shared package entry point.

**Verification:**

- Command run: `& 'C:\Program Files\nodejs\node.exe' 'node_modules\typescript\bin\tsc' --noEmit -p 'packages\shared\tsconfig.json'`
- Result: passed.
- Command run: process-local PATH with `C:\Windows\System32`, `C:\Windows` and `C:\Program Files\nodejs`, then `& 'C:\Program Files\nodejs\npm.cmd' run typecheck`
- Result: passed; Turbo ran `@routeforge/shared:typecheck`.
- Command run: process-local PATH with `C:\Windows\System32`, `C:\Windows` and `C:\Program Files\nodejs`, then `& 'C:\Program Files\nodejs\npm.cmd' run lint`
- Result: passed for admin and mobile workspaces.

**Notes:**

- No UI changed; `context/ui-registry.md` was not updated.
- German remains the canonical default language; Bulgarian must match its key shape before TypeScript passes.
- Turbo still reports the known non-blocking Git dubious ownership warning in the sandbox.

**Next:**

- RF-DB-001 - InsForge Initial Schema

### RF-DB-001 - InsForge Initial Schema

**Date:** 2026-06-25
**Status:** completed
**Files changed:**

- `insforge/migrations/0001_initial_schema.sql`
- `context/progress-tracker.md`

**What was done:**

- Created the first InsForge schema migration under `insforge/migrations/`.
- Added public application tables:
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
- Added primary keys, foreign keys, uniqueness constraints and recommended indexes.
- Added basic row-local constraints for enum values, nonnegative counters/minutes, geofence coordinate ranges, invitation code format, one shift per courier per day, required billable override reason and required rejection reason.
- Kept RLS, storage policies and seed data out of scope for later Phase 2 features.

**Verification:**

- Command run: PowerShell table scan for `create table public.*`.
- Result: 11 expected tables found.
- Command run: PowerShell company scope scan for all operational tables.
- Result: every company-owned table includes `company_id`.
- Command run: PowerShell scan for `row level security`, `create policy`, `create trigger`, `create function`, `create extension`, `BEGIN`, `COMMIT` and `ROLLBACK`.
- Result: none found; migration stays inside `RF-DB-001` scope.
- Command run: SQL constraint pattern scan.
- Result: fixed the only missing `check` keyword found during review.

**Notes:**

- No UI changed; `context/ui-registry.md` was not updated.
- Migration file follows RouteForge build-plan path `insforge/migrations/0001_initial_schema.sql`.
- The generic InsForge CLI migration docs prefer timestamped files in `migrations/`, but this feature explicitly requires the RouteForge path and filename.
- Git commands require a one-off `safe.directory` flag in this sandbox because of the known dubious ownership warning.

**Next:**

- RF-DB-002 - Row Level Security Policies

### RF-DB-002 - Row Level Security Policies

**Date:** 2026-06-25
**Status:** completed
**Files changed:**

- `insforge/migrations/0002_rls_policies.sql`
- `context/progress-tracker.md`

**What was done:**

- Created the Row Level Security migration under `insforge/migrations/`.
- Added `SECURITY DEFINER` helper functions for:
  - current profile lookup
  - current company, role and status
  - active admin, dispatcher and courier checks
  - dispatcher depot access
  - scoped depot, profile, shift, document and mailbox access
- Enabled RLS on all public application tables from `RF-DB-001`.
- Revoked broad runtime table access from `anon` and `authenticated`, then granted the required authenticated operation surface.
- Added RLS policies for company-scoped admin access, dispatcher assigned-depot reads and courier self-scoped reads/writes.
- Kept optional dispatcher write capabilities closed by default.
- Kept audit logs client read-only and admin-scoped.
- Added trigger guards for non-admin shift protected fields and mailbox content updates.

**Verification:**

- Command run: PowerShell RLS coverage scan for all 11 public application tables.
- Result: every table has `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
- Command run: PowerShell helper function scan.
- Result: 19 helper/guard functions found; all 19 use `SECURITY DEFINER`.
- Command run: PowerShell policy scan.
- Result: 29 policies found, no `USING (true)` policies found.
- Command run: PowerShell insert/update policy block scan.
- Result: all 15 write policies include `WITH CHECK`.
- Command run: PowerShell scan for trailing whitespace and transaction statements.
- Result: no trailing whitespace; only lowercase `begin` inside PL/pgSQL trigger functions, no migration transaction statements.

**Notes:**

- No UI changed; `context/ui-registry.md` was not updated.
- This migration was not applied to the live InsForge backend.
- Storage bucket policies remain separate and are next in `RF-DB-003`.
- The conservative default is admin-only for sensitive writes unless a later backend feature explicitly opens a narrower dispatcher or courier path.

**Next:**

- RF-DB-003 - Storage Buckets

### RF-DB-003 - Storage Buckets

**Date:** 2026-06-25
**Status:** completed
**Files changed:**

- `insforge/migrations/0003_storage_policies.sql`
- `context/progress-tracker.md`

**What was done:**

- Created the storage policy migration under `insforge/migrations/`.
- Defined the five expected private RouteForge buckets:
  - `courier-documents`
  - `shift-photos`
  - `payslips`
  - `generated-pdfs`
  - `company-assets`
- Added storage path parsing helpers for company, shift, courier and report-owner IDs.
- Added storage path validation for RouteForge object key patterns under `companies/{company_id}`.
- Added read, write and delete authorization helpers for storage objects using the existing tenant, role, depot and courier RLS helpers.
- Added metadata constraints so `shift_photos` and `documents` bucket/path values match the expected tenant, shift and courier scope.
- Kept live bucket creation out of the migration because InsForge bucket creation is handled through admin/CLI tooling, not public-schema SQL.

**Verification:**

- Command run: PowerShell bucket/helper/constraint scan.
- Result: all five bucket names found; 10 helper functions found; 3 `SECURITY DEFINER` storage access helpers found; 5 current-company prefix checks found; 6 metadata constraints found.
- Command run: PowerShell trailing whitespace scan for `0003_storage_policies.sql`.
- Result: no trailing whitespace found.
- Command run: `git -c safe.directory='C:/Users/Nikolay/Desktop/routeforge' diff --check`.
- Result: passed with only the known CRLF warning on `context/progress-tracker.md`.

**Notes:**

- No UI changed; `context/ui-registry.md` was not updated.
- This migration was not applied to the live InsForge backend.
- Live InsForge buckets still need to be created as private buckets when backend migrations are applied.
- The storage helpers are ready for future storage policies, signed URL endpoints and upload/download route checks.

**Next:**

- RF-DB-004 - Demo Seed Data

### Template

```md
### RF-XXX-000 — Feature Name

**Date:**
**Status:** completed
**Files changed:**

- `path/to/file.ts`
- `path/to/component.tsx`

**What was done:**

- Item 1
- Item 2

**Verification:**

- Command run:
- Visual check:
- Result:

**Notes:**

- Any important implementation note.

**Next:**

- RF-XXX-001 — Next Feature Name
```

---

## Current Notes

- Context files were generated before implementation:
  - `project-overview.md`
  - `architecture.md`
  - `build-plan.md`
  - `code-standards.md`
  - `library-docs.md`
  - `ui-tokens.md`
  - `ui-rules.md`
  - `ui-registry.md`
- This tracker should be placed at:
  - `context/progress-tracker.md`
- Next recommended action is to run Codex on:
  - `RF-DB-004 - Demo Seed Data`

---

## Blockers

No current implementation blockers.

---

## Recovery Notes

If Codex gets confused:

```txt
Read AGENTS.md.
Read context/build-plan.md.
Read context/progress-tracker.md.
Tell me the current phase, last completed feature and next exact Feature ID.
Do not implement yet.
```

If there is a technical error:

```txt
/recover

Here is the exact terminal output:

[PASTE FULL ERROR]

Find the root cause.
Give the safest fix.
Give exact commands.
Do not guess.
```
