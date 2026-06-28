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
**Phase:** Phase 4 - Mobile App Local Logic
**Last completed:** RF-MOB-015 Daily Fixed Time Display
**Current focus:** Continue mobile app local logic
**Next:** RF-MOB-016 Daily Report Validation

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
RF-MOB-016 - Daily Report Validation
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
- [x] RF-DB-004 Demo Seed Data

### Phase 3 — Mobile App UI With Mock Data

- [x] RF-MOB-001 Mobile Shell and Navigation
- [x] RF-MOB-002 Mobile Login UI
- [x] RF-MOB-003 Mobile Invite Registration UI
- [x] RF-MOB-004 Home / Current Shift UI
- [x] RF-MOB-005 Daily Report UI
- [x] RF-MOB-006 History Calendar UI
- [x] RF-MOB-007 Day Details UI
- [x] RF-MOB-008 Digital Mailbox UI
- [x] RF-MOB-009 Mailbox Item Details UI
- [x] RF-MOB-010 Profile / Documents UI
- [x] RF-MOB-011 Mobile Settings UI

### Phase 4 — Mobile App Local Logic

- [x] RF-MOB-012 Timer Local State
- [x] RF-MOB-013 Timer Persistence
- [x] RF-MOB-014 Hourly 10h Auto Stop
- [x] RF-MOB-015 Daily Fixed Time Display
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

### Demo Seed Data

- Demo seed data lives in `insforge/seeds/demo_company.sql`.
- The seed creates one RouteForge tenant, Ivanov Transport, with one HBW3 depot.
- Demo application profiles include one admin, one dispatcher, two active couriers and one pending-approval courier.
- Demo shifts cover `draft`, `submitted`, `approved`, `rejected` and `corrected` statuses, with one outside-geofence warning example.
- The seed includes dispatcher depot access, invitations, shift locations, proof photo metadata, documents, mailbox items and audit logs.
- The seed intentionally does not write to InsForge-managed `auth.users`; matching demo auth users must be created through InsForge Auth before importing the seed.
- Local secret/project hygiene was tightened by ignoring `.env`, `.env.*` and `.insforge/` while keeping `.env.example` allowed.

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

### Mobile Profile / Documents UI

- `RF-MOB-010` keeps the courier profile screen UI-only and mock-data-only.
- The profile tab shows only the courier's own profile, mailbox shortcut, private document summary, signature preview, personal data, payment mode and required document statuses.
- Sensitive values are masked in the mobile UI where shown, including the IBAN display.
- Document upload/update/download affordances remain visual placeholders; no backend query, storage access, signed URL creation, real upload or public document URL was added.
- Required document mock states include uploaded, valid, missing and expired so future backend/document work has visible UI states to connect.

### Mobile Settings UI

- `RF-MOB-011` adds `/settings` as a secondary mobile stack screen linked from the courier profile tab.
- Settings remains UI-first and mock-only: language selection is local state only, logout is a visual affordance only and app version/support/privacy content comes from mock data.
- The screen keeps courier self-scope visible in privacy copy and does not expose auth session details, secrets, backend errors or storage links.
- Real language persistence, logout/session handling and support workflows remain later backend/settings work.

### Mobile Timer Local State

- `RF-MOB-012` adds local in-session timer state only.
- Timer display is derived from local `startedAt` and the current clock tick, not from incrementing a counter.
- The Home current-shift card supports not-started, running and ended local states.
- The local ended state disables a second same-day start, keeping the one-shift-per-day v1 assumption visible in UI behavior.
- AsyncStorage persistence, hourly 10h auto-stop, GPS start/stop capture and backend shift creation remain later features.

### Mobile Timer Persistence

- `RF-MOB-013` persists the local active shift snapshot with AsyncStorage.
- Stored timer data uses the RouteForge key `routeforge:active-shift`.
- The timer restores from persisted `startedAt` on Home load and continues from wall-clock time, not an incrementing counter.
- The local ended state persists for the same local day so restart does not allow a second same-day local shift.
- Stale or malformed stored timer data is cleared before the Home screen trusts it.
- Hourly 10h auto-stop, GPS start/stop capture, backend shift creation and payroll recalculation remain later features.

### Mobile Hourly 10h Auto Stop

- `RF-MOB-014` auto-stops local hourly shifts at exactly 10:00h / 600 minutes.
- The local timer stores `autoStoppedAtMaxHours = true` when the cap is reached.
- Restored same-day hourly shifts that already crossed the 10:00h cap are normalized to the auto-stopped state on Home load.
- The displayed hourly elapsed time is capped at 10:00:00 so local UI cannot show billable time above 600 minutes.
- Home shows a warning badge/copy in the final 30 minutes before the cap and a disabled `Automatisch beendet` state after auto-stop.
- Daily fixed display rules, GPS start/stop capture, backend shift creation and real payroll export remain later features.

### Mobile Daily Fixed Time Display

- `RF-MOB-015` keeps the prominent Home timer as real elapsed working time for daily fixed couriers.
- The daily fixed billable display is derived from shared payroll logic and shows the 500-minute / 8:20h default.
- Home explains that daily fixed billable time can be corrected by admin/dispatcher during review with a reason.
- The RF-MOB-015 mock state uses `daily_fixed` so the UI-first daily fixed display is visible without backend/profile wiring.
- Backend shift creation, GPS start/stop capture, daily report validation and real payroll export remain later features.

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

### Mobile Shell and Navigation

- `RF-MOB-001` replaces the Expo starter tab surface with the RouteForge courier shell.
- Mobile primary tabs are exactly:
  - `Home`
  - `Historie`
  - `Bericht`
  - `Postfach`
  - `Profil`
- The shell uses mock company and courier data only:
  - company `Ivanov Transport`
  - depot `Mannheim HBW3`
  - active courier `Mihail Kolev`
- The implementation now uses NativeWind classes mapped to RouteForge token utilities for static styling.
- The starter `index` and `explore` tab routes are hidden from the tab bar and redirect to the shell.
- Backend auth, timer persistence, GPS capture, report validation and document download logic remain out of scope for `RF-MOB-001`.

### Mobile Login UI

- `RF-MOB-002` adds a public courier login screen at `apps/mobile/app/login.tsx`.
- The root mobile route now redirects to `/login`, keeping the login screen visible before mock sign-in.
- The login screen uses mock-only form state and routes to the existing mobile shell after pressing `Anmelden`.
- The invite-code affordance is present as the visual handoff to `RF-MOB-003`; no invite route, invite registration UI or backend validation was added.
- Reusable auth input styling now lives in `apps/mobile/components/auth/AuthTextField.tsx`.
- Backend auth integration, route guards, pending-approval handling and InsForge session logic remain out of scope until later backend features.

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

### RF-DB-004 - Demo Seed Data

**Date:** 2026-06-25
**Status:** completed
**Files changed:**

- `.gitignore`
- `insforge/seeds/demo_company.sql`
- `context/progress-tracker.md`

**What was done:**

- Created the demo seed folder and local seed SQL file.
- Seeded demo tenant data for `Ivanov Transport`.
- Seeded the HBW3 depot with Mannheim address, coordinates and geofence radius.
- Seeded one admin, one dispatcher, two active couriers and one pending-approval courier profile.
- Seeded dispatcher HBW3 depot access.
- Seeded used courier invitations plus one active future invite.
- Seeded shifts covering `draft`, `submitted`, `approved`, `rejected` and `corrected` states.
- Seeded start/stop locations with one outside-geofence warning example.
- Seeded proof photo metadata using the `shift-photos` bucket and RouteForge storage path pattern.
- Seeded private document metadata, mailbox items and audit logs for sensitive demo actions.
- Added a seed guard that requires matching InsForge Auth users to exist before profile rows are inserted.
- Updated `.gitignore` to ignore `.env`, `.env.*` and `.insforge/`, while allowing `.env.example`.

**Verification:**

- Command run: static scan for non-ASCII content in `insforge/seeds/demo_company.sql`.
- Result: no non-ASCII content found.
- Command run: static scan for trailing whitespace in `insforge/seeds/demo_company.sql`.
- Result: no trailing whitespace found.
- Command run: static pattern scan for demo company, depot, roles, shift statuses, geofence warning and storage paths.
- Result: required `RF-DB-004` seed coverage found.

**Notes:**

- No UI changed; `context/ui-registry.md` was not updated.
- This seed was not imported into the live InsForge backend.
- The seed does not create live InsForge storage buckets.
- Matching demo auth users must be created through InsForge Auth before importing this seed because `profiles.auth_user_id` references `auth.users(id)`.

**Next:**

- RF-MOB-001 - Mobile Shell and Navigation

### RF-MOB-001 - Mobile Shell and Navigation

**Date:** 2026-06-26
**Status:** completed
**Files changed:**

- `apps/mobile/app/_layout.tsx`
- `apps/mobile/app/index.tsx`
- `apps/mobile/app/(tabs)/_layout.tsx`
- `apps/mobile/app/(tabs)/index.tsx`
- `apps/mobile/app/(tabs)/explore.tsx`
- `apps/mobile/app/(tabs)/home.tsx`
- `apps/mobile/app/(tabs)/history.tsx`
- `apps/mobile/app/(tabs)/report.tsx`
- `apps/mobile/app/(tabs)/mailbox.tsx`
- `apps/mobile/app/(tabs)/profile.tsx`
- `apps/mobile/components/layout/MobileScreen.tsx`
- `apps/mobile/components/layout/MobileHeader.tsx`
- `apps/mobile/components/layout/RouteForgeCard.tsx`
- `apps/mobile/components/ui/StatusBadge.tsx`
- `apps/mobile/constants/routeforgeTheme.ts`
- `apps/mobile/features/mock/mobileShell.ts`
- `context/ui-registry.md`
- `context/progress-tracker.md`

**What was done:**

- Replaced the Expo starter tab surface with a RouteForge mobile shell.
- Added root redirect to the tab group.
- Added exactly five bottom tabs:
  - `Home`
  - `Historie`
  - `Bericht`
  - `Postfach`
  - `Profil`
- Added a compact mobile header with company name, courier greeting, language badge and notification affordance.
- Added tokenized mobile screen, card and status badge primitives.
- Added mock courier and company data for `Ivanov Transport`.
- Added placeholder operational content for each tab.
- Hid starter `index` and `explore` tab routes from the tab bar and redirected them to the shell.
- Updated `context/ui-registry.md` through `/imprint` for the new UI patterns.

**Verification:**

- Command run: `& 'C:\Program Files\nodejs\node.exe' 'node_modules\typescript\bin\tsc' --noEmit -p 'apps\mobile\tsconfig.json'`
- Result: passed.
- Command run: `$env:Path = 'C:\Windows\System32;C:\Windows;C:\Program Files\nodejs;' + $env:Path; & 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run lint`
- Result: passed with elevated filesystem access after sandboxed ESLint hit the known `EPERM` resolver issue.

**Notes:**

- No backend, auth, GPS, timer persistence, report validation or document download logic was added.
- Follow-up refactor on 2026-06-26 installed NativeWind for `apps/mobile`, added Tailwind/Babel/Metro/global CSS setup, mapped RouteForge tokens to NativeWind utilities, and refactored the RouteForge-created shell components/screens from `StyleSheet.create` to `className`.
- Follow-up cleanup on 2026-06-26 refactored the remaining easy Expo starter/template styles in `ThemedText`, `ThemedView`, `Collapsible` and `modal` to NativeWind classes, leaving animated/runtime style objects in place where appropriate.

**Next:**

- RF-MOB-002 - Mobile Login UI

### RF-MOB-002 - Mobile Login UI

**Date:** 2026-06-26
**Status:** completed
**Files changed:**

- `apps/mobile/app/_layout.tsx`
- `apps/mobile/app/index.tsx`
- `apps/mobile/app/login.tsx`
- `apps/mobile/components/auth/AuthTextField.tsx`
- `context/ui-registry.md`
- `context/progress-tracker.md`

**What was done:**

- Added a public RouteForge courier login screen with centered brand, white rounded login card, email field, password field, mock login button, invite-code link, language selector and German labels.
- Added `AuthTextField` as the reusable mobile auth input pattern with label, icon, tokenized placeholder color and password visibility toggle.
- Changed the mobile root route to show `/login` first.
- Registered the login screen in the mobile root Stack without changing the bottom tab shell.
- Kept the feature mock-data-first: pressing `Anmelden` routes to the existing mobile home shell.

**Verification:**

- Command run: `& 'C:\Program Files\nodejs\node.exe' 'node_modules\typescript\bin\tsc' --noEmit -p 'apps\mobile\tsconfig.json'`
- Result: passed.
- Command run: `$env:Path = 'C:\Program Files\nodejs;C:\Windows\System32;C:\Windows;' + $env:Path; & 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run lint`
- Result: sandboxed run hit the known `EPERM` resolver issue while scanning `C:\Users\Nikolay`; elevated rerun passed.
- Command run: direct scan for hardcoded hex values, raw Tailwind color classes and non-ASCII characters in touched mobile source files.
- Result: passed.
- Command run: `& 'C:\Program Files\Git\cmd\git.exe' -c safe.directory='C:/Users/Nikolay/Desktop/routeforge' diff --check`
- Result: passed with only Git line-ending warnings.
- Command run: `$env:Path = 'C:\Windows\System32;C:\Windows;C:\Program Files\nodejs;' + $env:Path; & 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run lint`
- Result: sandboxed run hit the known `EPERM` resolver issue while scanning `C:\Users\Nikolay`; rerun with elevated filesystem access passed.

**Notes:**

- No InsForge auth, real session state, route guards, invite validation or pending-approval logic was added.
- The invite-code affordance is intentionally visual-only until `RF-MOB-003`, the next feature.
- The login screen uses the provided `apps/mobile/assets/images/icon.png` app icon as the brand mark.

**Next:**

- RF-MOB-003 - Mobile Invite Registration UI

### RF-MOB-003 - Mobile Invite Registration UI

**Date:** 2026-06-26
**Status:** completed
**Files changed:**

- `apps/mobile/app/_layout.tsx`
- `apps/mobile/app/login.tsx`
- `apps/mobile/app/invite.tsx`
- `context/ui-registry.md`
- `context/progress-tracker.md`

**What was done:**

- Added a public mobile invite registration screen matching the provided PNG direction: back action, centered headline, email and invite-code form card, primary `Weiter` action, pending-approval information panel, language selector and login link.
- Reused `AuthTextField` for both invite form inputs.
- Registered the invite route in the mobile root Stack outside the tab shell.
- Updated the login screen `Invite Code verwenden` link to navigate to the invite route.
- Added a mock-only local pending approval state after pressing `Weiter`.
- Updated `context/ui-registry.md` through `/imprint` with the new invite screen pattern.

**Verification:**

- Command run: `& 'C:\Program Files\nodejs\node.exe' 'node_modules\typescript\bin\tsc' --noEmit -p 'apps\mobile\tsconfig.json'`
- Result: passed.
- Command run: `& 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run lint`
- Result: failed before ESLint because `node` was not on PATH for the npm script.
- Command run: `$env:Path = 'C:\Windows\System32;C:\Windows;C:\Program Files\nodejs;' + $env:Path; & 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run lint`
- Result: sandboxed run hit the known `EPERM` resolver issue while scanning `C:\Users\Nikolay`.
- Command run: same lint command rerun with elevated filesystem access.
- Result: passed.
- Command run: `git -c safe.directory='C:/Users/Nikolay/Desktop/routeforge' diff --check`
- Result: passed with only Git line-ending warnings.

**Notes:**

- No InsForge auth, real invite validation, profile creation, backend pending-approval persistence or route guards were added.
- The language selector remains a visual German selector for this UI-first phase.
- The mock pending state is local screen state only and is ready to be replaced by real invitation handling later.

**Next:**

- RF-MOB-004 - Home / Current Shift UI

### RF-MOB-004 - Home / Current Shift UI

**Date:** 2026-06-27
**Status:** completed
**Files changed:**

- `apps/mobile/app/(tabs)/home.tsx`
- `apps/mobile/components/shift/CurrentShiftCard.tsx`
- `apps/mobile/features/mock/currentShift.ts`
- `context/ui-registry.md`
- `context/progress-tracker.md`

**What was done:**

- Rebuilt the mobile Home screen around the provided `mobile-home-current-shift.png` direction.
- Added the `CurrentShiftCard` component with current shift status, dominant static timer, payment mode summary, depot/time details, GPS start/end checkpoints, proof reminder and primary `Schicht starten` action.
- Added realistic mock current-shift data for depot, vehicle, payment mode, package counters, location status, report status and sync readiness.
- Added Home summary sections for depot, vehicle, location status, package counters, daily overview, quick actions and safety guidance.
- Kept the feature UI-first and mock-only.
- Updated `context/ui-registry.md` through `/imprint` with the implemented current-shift pattern.

**Verification:**

- Command run: `& 'C:\Program Files\nodejs\node.exe' 'node_modules\typescript\bin\tsc' --noEmit -p 'apps\mobile\tsconfig.json'`
- Result: passed.
- Command run: `$env:Path = 'C:\Windows\System32;C:\Windows;C:\Program Files\nodejs;' + $env:Path; & 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run lint`
- Result: sandboxed run hit the known `EPERM` resolver issue while scanning `C:\Users\Nikolay`.
- Command run: same lint command rerun with elevated filesystem access.
- Result: passed.
- Command run: direct scan for hardcoded hex values and raw Tailwind color classes in touched mobile files.
- Result: passed.

**Notes:**

- No real timer logic, AsyncStorage active-shift persistence, InsForge shift creation, GPS permission request, report persistence or live tracking was added.
- The primary action is visual/mock-only and ready for RF-MOB-012+ timer/local-state work.
- The screen copy explicitly keeps GPS to start/stop proof only.

**Next:**

- RF-MOB-005 - Daily Report UI

### RF-MOB-005 - Daily Report UI

**Date:** 2026-06-27
**Status:** completed
**Files changed:**

- `apps/mobile/app/(tabs)/report.tsx`
- `apps/mobile/components/report/ReportSectionCard.tsx`
- `apps/mobile/components/report/ReportField.tsx`
- `apps/mobile/components/report/ReportCounterTile.tsx`
- `apps/mobile/components/report/PhotoUploadCard.tsx`
- `apps/mobile/components/report/SignaturePlaceholderCard.tsx`
- `apps/mobile/features/mock/dailyReport.ts`
- `context/ui-registry.md`
- `context/progress-tracker.md`

**What was done:**

- Rebuilt the mobile `Bericht` tab around the provided `mobile-daily-report.png` visual direction.
- Added a mock daily report header with date, time, route and draft status.
- Added numbered sections for shift data, package counters, proof photos, notes and signature readiness.
- Added reusable report UI components for section cards, field tiles, counter tiles, proof-photo placeholders and signature placeholder state.
- Added realistic mock-only daily report data for depot, vehicle, start/end kilometers, counters, required photo types, note text and submit hint.
- Updated `context/ui-registry.md` through `/imprint` with the implemented RF-MOB-005 patterns.

**Verification:**

- Command run: `& 'C:\Program Files\nodejs\node.exe' 'node_modules\typescript\bin\tsc' --noEmit -p 'apps\mobile\tsconfig.json'`
- Result: passed.
- Command run: `$env:Path = 'C:\Windows\System32;C:\Windows;C:\Program Files\nodejs;' + $env:Path; & 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run lint`
- Result: sandboxed run hit the known `EPERM` resolver issue while scanning `C:\Users\Nikolay`.
- Command run: same lint command rerun with elevated filesystem access.
- Result: passed.
- Command run: direct scan for hardcoded hex values and raw Tailwind color classes in touched mobile files.
- Result: passed.
- Command run: `git -c safe.directory='C:/Users/Nikolay/Desktop/routeforge' diff --check`
- Result: passed with only Git line-ending warnings.

**Notes:**

- No validation, photo picker, upload, compression, signature capture, AsyncStorage draft persistence, InsForge call or live GPS behavior was added.
- Photo cards are visual placeholders for the four required proof photo types: start KM, end KM, Fahrtenbuch and Mentor screenshot.
- The submit action is visual/mock-only and ready for RF-MOB-016+ validation and backend phases.

**Next:**

- RF-MOB-006 - History Calendar UI

### RF-MOB-006 - History Calendar UI

**Date:** 2026-06-27
**Status:** completed
**Files changed:**

- `apps/mobile/app/(tabs)/history.tsx`
- `apps/mobile/components/history/HistoryCalendar.tsx`
- `apps/mobile/components/history/HistorySummaryTile.tsx`
- `apps/mobile/components/history/HistoryShiftRow.tsx`
- `apps/mobile/components/history/SelectedDaySummary.tsx`
- `apps/mobile/features/mock/history.ts`
- `context/ui-registry.md`
- `context/progress-tracker.md`

**What was done:**

- Rebuilt the mobile `Historie` tab around `context/designs/mobile/mobile-history-calendar.png`.
- Added a mock month selector, calendar grid, worked-day indicators, today marker and selected-day state.
- Added monthly summary metrics for real time, billable time and shifts.
- Added filter chips, selected-day summary, visual daily-details affordance, monthly PDF download affordance and recent-shifts list.
- Added realistic mock-only history data with approved, submitted and rejected history states.
- Updated `context/ui-registry.md` through `/imprint` with the implemented RF-MOB-006 patterns.

**Verification:**

- Command run: `& 'C:\Program Files\nodejs\node.exe' 'node_modules\typescript\bin\tsc' --noEmit -p 'apps\mobile\tsconfig.json'`
- Result: passed.
- Command run: direct scan for hardcoded hex values and raw Tailwind color classes in touched mobile files.
- Result: passed.
- Command run: `$env:Path = 'C:\Windows\System32;C:\Windows;C:\Program Files\nodejs;' + $env:Path; & 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run lint`
- Result: sandboxed run hit the known `EPERM` resolver issue while scanning `C:\Users\Nikolay`.
- Command run: same lint command rerun with elevated filesystem access.
- Result: passed.

**Notes:**

- No backend history query, real daily detail route, real PDF generation, persistent filters or payroll calculation was added.
- Day selection updates visible mock details only.
- The monthly PDF and daily details actions are visual/mock-only and ready for later PDF/detail phases.

**Next:**

- RF-MOB-007 - Day Details UI

### RF-MOB-007 - Day Details UI

**Date:** 2026-06-27
**Status:** completed
**Files changed:**

- `apps/mobile/app/_layout.tsx`
- `apps/mobile/app/(tabs)/history.tsx`
- `apps/mobile/app/history/[date].tsx`
- `apps/mobile/components/history/SelectedDaySummary.tsx`
- `apps/mobile/components/history/DayDetailMetricGrid.tsx`
- `apps/mobile/components/history/DayDetailWarningCard.tsx`
- `apps/mobile/components/history/DayDetailSummaryCard.tsx`
- `apps/mobile/components/history/DayDetailPhotoGrid.tsx`
- `apps/mobile/components/history/DayDetailSignatureCard.tsx`
- `apps/mobile/components/history/DayDetailReportCard.tsx`
- `apps/mobile/features/mock/history.ts`
- `context/ui-registry.md`
- `context/progress-tracker.md`

**What was done:**

- Added the detailed mobile day report route at `apps/mobile/app/history/[date].tsx`.
- Matched `context/designs/mobile/mobile-day-details.png` direction with a blue detail header, date navigation, courier/status card, time metric grid, geofence warning, KM/package summary, proof-photo preview grid, signature summary, report rows and a daily PDF affordance.
- Extended existing history mock data with date-scoped day detail values so calendar, selected day and detail screen share one mock source.
- Updated the history selected-day action to navigate to the real day detail route.
- Registered the day detail screen in the mobile root stack.
- Updated `context/ui-registry.md` through `/imprint` with the new day-detail patterns.

**Verification:**

- Command run: `& 'C:\Program Files\nodejs\node.exe' 'node_modules\typescript\bin\tsc' --noEmit -p 'apps\mobile\tsconfig.json'`
- Result: passed.
- Command run: `$env:Path = 'C:\Windows\System32;C:\Windows;C:\Program Files\nodejs;' + $env:Path; & 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run lint`
- Result: sandboxed run hit the known `EPERM` resolver issue while scanning `C:\Users\Nikolay`; rerun with elevated filesystem access passed.
- Command run: direct scan for hardcoded hex values and raw Tailwind color classes in touched mobile files.
- Result: passed.
- Command run: `git -c safe.directory='C:/Users/Nikolay/Desktop/routeforge' diff --check`.
- Result: passed with only Git line-ending warnings.

**Notes:**

- No backend history query, real PDF generation, signed URL creation, photo download, photo storage access, signature capture or persistent state was added.
- Approved days are visually read-only for the courier.
- The daily PDF action is visual/mock-only until RF-DOC-001.
- Proof-photo expired state reflects the 14-day retention rule without creating public file links.

**Next:**

- RF-MOB-008 - Digital Mailbox UI

### RF-MOB-008 - Digital Mailbox UI

**Date:** 2026-06-27
**Status:** completed
**Files changed:**

- `apps/mobile/app/(tabs)/mailbox.tsx`
- `apps/mobile/components/mailbox/MailboxFilterTabs.tsx`
- `apps/mobile/components/mailbox/MailboxItemCard.tsx`
- `apps/mobile/components/mailbox/MailboxPreviewPanel.tsx`
- `apps/mobile/components/mailbox/MailboxEmptyState.tsx`
- `apps/mobile/features/mock/mailbox.ts`
- `context/ui-registry.md`
- `context/progress-tracker.md`

**What was done:**

- Rebuilt the mobile `Postfach` tab around `context/designs/mobile/mobile-digital-mailbox.png`.
- Added a digital mailbox header with privacy copy, unread count and PDF/mailbox summary metrics.
- Added category tabs for all items, unread items, documents, payslips, contracts and notices.
- Added reusable mailbox cards with unread markers, category/file badges, dates and selected state.
- Added a selected-item preview panel with visual download/open affordances.
- Added an empty state for filters without visible items.
- Added realistic mock-only mailbox data with courier-owned document, payslip, contract and notice examples.
- Updated `context/ui-registry.md` through `/imprint` with the new mailbox patterns.
- Cleaned the stale current-note pointer that still referenced RF-MOB-007.

**Verification:**

- Command run: `& 'C:\Program Files\nodejs\node.exe' 'node_modules\typescript\bin\tsc' --noEmit -p 'apps\mobile\tsconfig.json'`
- Result: passed.
- Command run: direct scan for hardcoded hex values and raw Tailwind color classes in touched mailbox files.
- Result: passed.
- Command run: direct scan for non-ASCII characters in touched mailbox files.
- Result: passed.
- Command run: `$env:Path = 'C:\Windows\System32;C:\Windows;C:\Program Files\nodejs;' + $env:Path; & 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run lint`
- Result: blocked by the known sandbox-only ESLint resolver `EPERM` while scanning `C:\Users\Nikolay`; elevated rerun could not be completed because the environment rejected escalation due to usage limit.
- Command run: `git -c safe.directory='C:/Users/Nikolay/Desktop/routeforge' diff --check`.
- Result: passed with only Git line-ending warnings.

**Notes:**

- No backend mailbox query, real item detail route, signed URL creation, storage access, file download or persistent read state was added.
- Preview panel actions are visual only until RF-MOB-009 and later backend document/mailbox features.
- Courier self-scope is represented in copy and mock data only; real enforcement remains backend/RLS work.

**Next:**

- RF-MOB-009 - Mailbox Item Details UI

### RF-MOB-009 - Mailbox Item Details UI

**Date:** 2026-06-27
**Status:** completed
**Files changed:**

- `apps/mobile/app/_layout.tsx`
- `apps/mobile/app/(tabs)/mailbox.tsx`
- `apps/mobile/app/mailbox/[id].tsx`
- `apps/mobile/components/mailbox/MailboxPreviewPanel.tsx`
- `apps/mobile/features/mock/mailbox.ts`
- `context/ui-registry.md`
- `context/progress-tracker.md`

**What was done:**

- Added the mobile mailbox item detail route at `apps/mobile/app/mailbox/[id].tsx`.
- Registered the detail screen in the mobile root stack.
- Connected the mailbox preview `Oeffnen` action to the new detail route using Expo Router typed params.
- Extended mailbox mock data with category labels, detail body copy and attachment metadata for courier-owned mailbox items.
- Built the detail UI with title, category/read badges, received date, sender, message body, attachment card, visual download action and mock read-state summary.
- Updated `context/ui-registry.md` through `/imprint` with the new mailbox detail screen pattern.

**Verification:**

- Command run: `& 'C:\Program Files\nodejs\node.exe' 'node_modules\typescript\bin\tsc' --noEmit -p 'apps\mobile\tsconfig.json'`
- Result: passed.
- Command run: `$env:Path = 'C:\Program Files\nodejs;C:\Windows\System32;C:\Windows;' + $env:Path; & 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run lint`
- Result: sandboxed run hit the known `EPERM` resolver issue while scanning `C:\Users\Nikolay`; rerun with elevated filesystem access passed.
- Command run: direct scan for hardcoded hex values and raw Tailwind color classes in touched mobile files.
- Result: passed.
- Command run: direct scan for non-ASCII characters in touched mobile files.
- Result: passed.
- Command run: `& 'C:\Program Files\Git\cmd\git.exe' -c safe.directory='C:/Users/Nikolay/Desktop/routeforge' diff --check`.
- Result: passed with only Git line-ending warnings.

**Notes:**

- No backend mailbox query, signed URL creation, storage access, real file download or persistent read-state mutation was added.
- The detail page keeps courier self-scope visible in copy and uses only mock mailbox data.
- Download remains a visual/private-access affordance until backend document/mailbox work.
- Expo Router typed routes were regenerated through the local Expo CLI so `/mailbox/[id]` typechecks.

**Next:**

- RF-MOB-010 - Profile / Documents UI

### RF-MOB-010 - Profile / Documents UI

**Date:** 2026-06-28
**Status:** completed
**Files changed:**

- `apps/mobile/app/(tabs)/profile.tsx`
- `apps/mobile/components/profile/ProfileSummaryCard.tsx`
- `apps/mobile/components/profile/ProfileShortcutCard.tsx`
- `apps/mobile/components/profile/ProfileInfoSection.tsx`
- `apps/mobile/components/profile/ProfilePaymentCard.tsx`
- `apps/mobile/components/profile/ProfileSignatureCard.tsx`
- `apps/mobile/components/profile/ProfileDocumentStatusCard.tsx`
- `apps/mobile/components/ui/StatusBadge.tsx`
- `apps/mobile/features/mock/profile.ts`
- `context/ui-registry.md`
- `context/progress-tracker.md`

**What was done:**

- Rebuilt the mobile `Profil` tab around `context/designs/mobile/mobile-profile-documents.png` and `context/designs/mobile/mobile-profile-mailbox-signature.png`.
- Added a large courier profile summary with initials avatar, company, role and active access badges.
- Added profile shortcut cards for the digital mailbox and documents.
- Added a visual signature preview card matching the supplied profile reference direction.
- Added personal/profile information sections with email, phone, address, masked IBAN, language, depot and profile status.
- Added a payment-mode card for the hourly courier mode with real-time tracking and 10:00h cap copy.
- Added required document status UI for Ausweis, Fuehrerschein, Meldebescheinigung and IBAN-Nachweis with uploaded, valid, missing and expired states.
- Added `apps/mobile/features/mock/profile.ts` for RF-MOB-010 mock-only profile and document data.
- Extended `StatusBadge` with an error tone for future status needs.
- Updated `context/ui-registry.md` through `/imprint` with the profile screen and reusable profile component patterns.

**Verification:**

- Command run: `& 'C:\Program Files\nodejs\node.exe' 'node_modules\typescript\bin\tsc' --noEmit -p 'apps\mobile\tsconfig.json'`
- Result: passed.
- Command run: `$env:Path = 'C:\Program Files\nodejs;C:\Windows\System32;C:\Windows;' + $env:Path; & 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run lint`
- Result: sandboxed run hit the known `EPERM` resolver issue while scanning `C:\Users\Nikolay`; elevated rerun passed.
- Command run: direct scan for hardcoded hex values, raw Tailwind color classes and non-ASCII characters in touched mobile source files.
- Result: passed.
- Command run: `& 'C:\Program Files\Git\cmd\git.exe' -c safe.directory='C:/Users/Nikolay/Desktop/routeforge' diff --check`
- Result: passed with only Git line-ending warnings.
- Expo web preview responded with `200` at `http://localhost:8083/profile`.

**Notes:**

- RF-MOB-010 remains UI-first and mock-data-only.
- No backend profile query, real document upload, real download, signed URL creation, storage access, public file URL or persistent private document state was added.
- Profile data is represented as courier self-scoped mock data only; real tenant and courier enforcement remains backend/RLS work.
- Sensitive values are not casually exposed; the IBAN row is masked and includes privacy helper copy.
- The signature card is visual-only and does not install or select a signature capture library.

**Next:**

- RF-MOB-011 - Mobile Settings UI

### RF-MOB-011 - Mobile Settings UI

**Date:** 2026-06-28
**Status:** completed
**Files changed:**

- `apps/mobile/app/_layout.tsx`
- `apps/mobile/app/(tabs)/profile.tsx`
- `apps/mobile/app/settings.tsx`
- `apps/mobile/features/mock/settings.ts`
- `context/ui-registry.md`
- `context/progress-tracker.md`

**What was done:**

- Added the secondary mobile settings route at `apps/mobile/app/settings.tsx`.
- Registered `settings` in the mobile root stack without adding a sixth bottom tab.
- Added a profile shortcut card that opens `/settings`.
- Added mock settings data for language options, app version, privacy copy, support/contact rows and logout helper copy.
- Built a settings UI with stack-style blue header, language switch, app version card, privacy note, support/contact placeholder and visual logout action.
- Updated `context/ui-registry.md` through `/imprint` with the new mobile settings screen pattern.

**Verification:**

- Command run: `& 'C:\Program Files\nodejs\node.exe' 'node_modules\typescript\bin\tsc' --noEmit -p 'apps\mobile\tsconfig.json'`
- Result: passed.

**Notes:**

- RF-MOB-011 remains mock-only.
- No settings persistence, InsForge auth logout, backend profile query, support request, notification integration or storage access was added.
- Language selection updates local UI state only.
- Logout remains a visual affordance until backend auth/session features.

**Next:**

- RF-MOB-012 - Timer Local State

### RF-MOB-012 - Timer Local State

**Date:** 2026-06-28
**Status:** completed
**Files changed:**

- `apps/mobile/app/(tabs)/home.tsx`
- `apps/mobile/components/shift/CurrentShiftCard.tsx`
- `apps/mobile/features/mock/currentShift.ts`
- `apps/mobile/features/shifts/useLocalShiftTimer.ts`
- `context/progress-tracker.md`
- `context/ui-registry.md`
- `memory.md`

**What was done:**

- Added `useLocalShiftTimer` for in-session active shift state.
- Timer now recalculates elapsed time from local `startedAt` and the current clock tick.
- Wired Home so the current-shift card switches between `Schicht starten`, `Schicht beenden` and disabled `Schicht beendet`.
- Updated current-shift status, timer label, start time label, checkpoint labels, proof summary and daily report status from local timer state.
- Added mock `depotId` and `paymentMode` to the current-shift mock so local timer state is tied to the visible depot and payment mode.
- Updated the current-shift UI registry entry through `/imprint`.

**Verification:**

- Command run: `& 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run typecheck`
- Result: passed.
- Command run: focused scan for hardcoded hex values and raw Tailwind color classes in touched RF-MOB-012 files.
- Result: passed.
- Command run: `& 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run lint`
- Result: sandboxed run hit the known ESLint resolver `EPERM` while scanning `C:\Users\Nikolay`.
- Command run: same mobile lint command rerun with elevated filesystem access.
- Result: passed.

**Notes:**

- RF-MOB-012 does not add AsyncStorage persistence; active shift state resets on app restart until RF-MOB-013.
- RF-MOB-012 does not add GPS capture, backend shift creation, 10h auto-stop or payroll calculation changes.
- GPS labels remain start/stop proof placeholders and do not imply live tracking.
- The local ended state prevents a second same-day local start in the current app session.

**Next:**

- RF-MOB-013 - Timer Persistence

### RF-MOB-013 - Timer Persistence

**Date:** 2026-06-28
**Status:** completed
**Files changed:**

- `apps/mobile/lib/storage.ts`
- `apps/mobile/features/shifts/types.ts`
- `apps/mobile/features/shifts/activeShiftStorage.ts`
- `apps/mobile/features/shifts/useLocalShiftTimer.ts`
- `apps/mobile/package.json`
- `package-lock.json`
- `context/progress-tracker.md`

**What was done:**

- Added the approved `@react-native-async-storage/async-storage` dependency for Expo SDK 54.
- Added a small generic mobile JSON storage helper around AsyncStorage.
- Added shift-specific active timer persistence under the shifts feature.
- Persisted active shift snapshots with `shiftId`, `startedAt`, `paymentMode`, `currentDepotId`, `isRunning`, `autoStoppedAtMaxHours` and local `completedAt`.
- Restored same-day active or ended timer state on Home load.
- Cleared malformed, stale or cross-day stored timer data before using it.
- Kept the current-shift timer derived from persisted `startedAt` and the current wall clock.

**Verification:**

- Command run: `& 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run typecheck`
- Result: first run failed because the npm child process could not find `node` on PATH.
- Command run: same typecheck with `C:\Program Files\nodejs` added to PATH.
- Result: passed.
- Command run: `& 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run lint`
- Result: passed with `C:\Program Files\nodejs` added to PATH.
- Command run: focused scan for hardcoded hex values and raw Tailwind color classes in touched RF-MOB-013 files.
- Result: passed.

**Notes:**

- RF-MOB-013 does not add hourly 10h auto-stop, GPS permission requests, backend shift creation, payroll recalculation or report persistence.
- The local ended state persists only for the same local day so one-shift-per-day v1 remains visible without blocking future days.
- `npm install` reported existing moderate audit findings; no broad audit fix was run because that would be unrelated dependency churn.

**Next:**

- RF-MOB-014 - Hourly 10h Auto Stop

### RF-MOB-014 - Hourly 10h Auto Stop

**Date:** 2026-06-28
**Status:** completed
**Files changed:**

- `apps/mobile/features/shifts/useLocalShiftTimer.ts`
- `apps/mobile/app/(tabs)/home.tsx`
- `context/ui-registry.md`
- `context/progress-tracker.md`

**What was done:**

- Added hourly 10:00h / 600-minute auto-stop behavior to the local mobile shift timer.
- Reused the shared `HOURLY_MAX_MINUTES` constant so the mobile cap matches shared payroll rules.
- Persisted `autoStoppedAtMaxHours = true` and the capped `completedAt` timestamp when the limit is reached.
- Normalized restored running hourly shifts to auto-stopped if the stored `startedAt` is already past the cap.
- Capped the displayed hourly elapsed timer at `10:00:00`.
- Added Home current-shift warning copy in the final 30 minutes and a disabled `Automatisch beendet` state after auto-stop.
- Updated `context/ui-registry.md` with the new warning and auto-stopped current-shift states.

**Verification:**

- Command run: `& 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run typecheck`
- Result: passed with `C:\Program Files\nodejs` added to PATH.
- Command run: `& 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run lint`
- Result: sandboxed run hit the known ESLint resolver `EPERM` while scanning `C:\Users\Nikolay`; elevated rerun passed.
- Command run: `& 'C:\Program Files\nodejs\npm.cmd' run typecheck`
- Result: passed for `@routeforge/shared`, `admin` and `mobile`.
- Command run: focused scan for hardcoded hex values and raw Tailwind color classes in touched RF-MOB-014 files.
- Result: passed.
- Command run: `& 'C:\Program Files\Git\cmd\git.exe' -c safe.directory='C:/Users/Nikolay/Desktop/routeforge' diff --check`
- Result: passed with only Git line-ending warnings.

**Notes:**

- RF-MOB-014 remains local/mobile-only and does not create backend shifts, GPS records, report persistence or payroll export data.
- Daily fixed display behavior remains the next local logic feature.

**Next:**

- RF-MOB-015 - Daily Fixed Time Display

### RF-MOB-015 - Daily Fixed Time Display

**Date:** 2026-06-28
**Status:** completed
**Files changed:**

- `apps/mobile/features/shifts/useLocalShiftTimer.ts`
- `apps/mobile/app/(tabs)/home.tsx`
- `apps/mobile/components/shift/CurrentShiftCard.tsx`
- `apps/mobile/features/mock/currentShift.ts`
- `context/ui-registry.md`
- `context/progress-tracker.md`

**What was done:**

- Added shared-payroll-derived billable minutes and billable time label to the local mobile shift timer.
- Switched the current Home mock to `daily_fixed` so the daily fixed UI-first behavior is visible.
- Updated the current-shift card to show real elapsed time as `Echte Arbeitszeit heute` and a separate `Abrechenbar 8:20h` billable summary for daily fixed mode.
- Updated Home copy so daily fixed mode explains that real time is stored and billable time can be corrected by admin/dispatcher in review with a reason.
- Kept hourly 10h warning/auto-stop behavior scoped to hourly mode.
- Updated `context/ui-registry.md` with the daily fixed current-shift state.

**Verification:**

- Command run: `& 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run typecheck`
- Result: passed with `C:\Program Files\nodejs` added to PATH.
- Command run: `& 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run lint`
- Result: sandboxed run hit the known ESLint resolver `EPERM` while scanning `C:\Users\Nikolay`; elevated rerun passed.
- Command run: `& 'C:\Program Files\nodejs\npm.cmd' run typecheck`
- Result: initial run failed because Turbo child process could not find `cmd.exe`; rerun passed with `C:\Windows\System32` and `C:\Windows` added to PATH.
- Command run: focused scan for hardcoded hex values and raw Tailwind color classes in touched RF-MOB-015 mobile source files.
- Result: passed.
- Expo web preview responded with `200` at `http://localhost:8083`.

**Notes:**

- RF-MOB-015 remains local/mobile UI logic only.
- No backend shift creation, GPS records, daily report validation, audit persistence or payroll export data was added.
- Daily fixed display uses shared payroll calculation for the 500-minute / 8:20h default, while the prominent timer remains real elapsed time.

**Next:**

- RF-MOB-016 - Daily Report Validation

### RF-CLEAN-001 - Monorepo Hygiene, Duplicate Files, Generated Folders, and Structure Sync

**Date:** 2026-06-28
**Status:** completed
**Files changed:**

- `.gitignore`
- `apps/admin/README.md`
- `apps/admin/app/layout.tsx`
- `apps/admin/package.json`
- `apps/admin/package-lock.json`
- `apps/admin/public/file.svg`
- `apps/admin/public/globe.svg`
- `apps/admin/public/next.svg`
- `apps/admin/public/vercel.svg`
- `apps/admin/public/window.svg`
- `apps/mobile/README.md`
- `apps/mobile/app/(tabs)/_layout.tsx`
- `apps/mobile/app/(tabs)/explore.tsx`
- `apps/mobile/app/modal.tsx`
- `apps/mobile/components/external-link.tsx`
- `apps/mobile/components/hello-wave.tsx`
- `apps/mobile/components/parallax-scroll-view.tsx`
- `apps/mobile/components/themed-text.tsx`
- `apps/mobile/components/themed-view.tsx`
- `apps/mobile/components/ui/collapsible.tsx`
- `apps/mobile/components/ui/icon-symbol.ios.tsx`
- `apps/mobile/components/ui/icon-symbol.tsx`
- `apps/mobile/constants/theme.ts`
- `apps/mobile/hooks/use-color-scheme.ts`
- `apps/mobile/hooks/use-color-scheme.web.ts`
- `apps/mobile/hooks/use-theme-color.ts`
- `apps/mobile/package.json`
- `apps/mobile/scripts/reset-project.js`
- `context/progress-tracker.md`
- `context/ui-registry.md`
- `memory.md`

**What was done:**

- Confirmed root npm workspaces are the intended package structure.
- Removed the tracked duplicate `apps/admin/package-lock.json`; the root `package-lock.json` is the single workspace lockfile.
- Removed inspected, unused Expo and Next starter residue after reference scans showed no live imports.
- Replaced starter READMEs with RouteForge-specific workspace notes.
- Normalized root `.gitignore` for monorepo generated folders, env files, build output, logs, OS noise and generated type stubs.
- Added admin and mobile `typecheck` scripts so root `npm run typecheck` covers all three packages through Turbo.
- Normalized admin root layout metadata, `lang="de"` and Inter font usage to match RouteForge UI rules.

**Verification:**

- Command run: `git status --short --untracked-files=all` with `core.excludesfile=` before cleanup.
- Result: clean working tree before edits.
- Command run: reference scans for removed mobile starter symbols and admin starter assets.
- Result: no dangling references found.
- Command run: `& 'C:\Program Files\nodejs\npm.cmd' run typecheck`
- Result: initial shell failed because `node` was not on PATH for Turbo child processes.
- Command run: same typecheck with `C:\Program Files\nodejs` added to PATH.
- Result: passed for `@routeforge/shared`, `admin` and `mobile`.
- Command run: `& 'C:\Program Files\nodejs\npm.cmd' run lint`
- Result: sandboxed run hit the known ESLint resolver `EPERM` while scanning `C:\Users\Nikolay`.
- Command run: same lint command rerun with elevated filesystem access.
- Result: passed for `admin` and `mobile`.

**Notes:**

- No RF-MOB-012 timer logic or new product feature work was started.
- Local generated folders such as `node_modules`, `.next`, `.expo` and `.turbo` exist but are not tracked and are covered by ignore rules.
- `packages/shared` has `typecheck` but no `lint` script or root ESLint config yet; root lint therefore runs only package lint scripts currently present.
- App-level `AGENTS.md`, `CLAUDE.md`, root `.agents`, app-specific `.agents`, mobile `.claude` and mobile `.vscode` were intentionally kept because they contain project/tooling guidance.
- Phase 4 is safe to start after this checkpoint.

**Next:**

- RF-MOB-012 - Timer Local State

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
  - `RF-MOB-015 - Daily Fixed Time Display`

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
