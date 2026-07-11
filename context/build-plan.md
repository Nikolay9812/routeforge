# Build Plan

## Core Principle

Full UI with mock data first — verified visually before any backend logic is connected. Every feature must be visible, testable, and reviewable before moving to the next feature.

RouteForge is built feature-by-feature through Codex using this sequence:

1. `/architect FEATURE_ID`
2. `/implement FEATURE_ID`
3. `/review FEATURE_ID`
4. `/imprint FEATURE_ID` when UI was created
5. `/remember save`

No invisible backend phases. No skipping ahead. No feature should modify unrelated areas unless the build plan explicitly requires it.

---

## Phase 0 — Codex Context & Design References

### RF-000-001 Codex Context System

Create the project control system that tells Codex how to work.

**UI:**

- None

**Logic:**

- Create or update `AGENTS.md`
- Create or update `memory.md`
- Create or update `context/codex-workflow.md`
- Define read order for all context files
- Define feature workflow:
  - architect
  - implement
  - review
  - imprint
  - remember
  - recover
- Rule: Codex must always read `context/build-plan.md` before implementing a feature
- Rule: Codex must work by Feature ID only

---

### RF-000-002 Design Reference Folder

Create a design folder for approved screenshots and UI references.

**UI:**

- None

**Logic:**

- Create `context/designs/README.md`
- Create `context/designs/mobile/`
- Create `context/designs/admin/`
- Add approved mobile reference images
- Add approved admin reference images
- Define naming convention:
  - `mobile-home-current-shift.png`
  - `mobile-history-calendar.png`
  - `mobile-day-details.png`
  - `admin-dashboard.png`
  - `admin-shift-review.png`
- Rule: Codex must check relevant design reference before UI implementation

---

### RF-000-003 UI Tokens and UI Rules

Define the visual language of RouteForge.

**UI:**

- None

**Logic:**

- Update `context/ui-tokens.md`
- Update `context/ui-rules.md`
- Update `context/mobile-rules.md`
- Update `context/admin-rules.md`
- Define:
  - colors
  - spacing
  - border radius
  - card style
  - typography direction
  - mobile layout rules
  - admin layout rules
- Rule: no hardcoded colors directly inside components

---

## Phase 1 — Shared Foundation

### RF-FND-001 Monorepo Verification

Verify that the monorepo is healthy before feature work begins.

**UI:**

- None

**Logic:**

- Verify root `package.json`
- Verify npm workspaces
- Verify `turbo.json`
- Verify `apps/admin` runs
- Verify `apps/mobile` runs
- Verify `packages/shared` exists
- Confirm:
  - `npm run dev:admin`
  - `npm run dev:mobile`

---

### RF-FND-002 Shared Types

Create the core TypeScript types for the entire platform.

**UI:**

- None

**Logic:**

- Create `packages/shared/src/types.ts`
- Create `packages/shared/src/index.ts`
- Add types:
  - `UUID`
  - `UserRole`
  - `ProfileStatus`
  - `PaymentMode`
  - `ShiftStatus`
  - `BillableSource`
  - `Company`
  - `Depot`
  - `Profile`
  - `Shift`
  - `ShiftLocation`
  - `ShiftPhoto`
  - `Document`
  - `MailboxItem`
  - `Invitation`
  - `AuditLog`
- Export all public types from `index.ts`

---

### RF-FND-003 Shared Payroll Logic

Create payroll and break calculation logic shared by mobile and admin.

**UI:**

- None

**Logic:**

- Create `packages/shared/src/payroll.ts`
- Implement legal break calculation
- Implement hourly courier rule:
  - max billable time 10:00 hours
  - `hourly_max_minutes = 600`
- Implement daily fixed courier rule:
  - default billable time 8:20 hours
  - `daily_fixed_minutes = 500`
- Implement manual billable override support
- Return:
  - gross minutes
  - break minutes
  - net minutes
  - billable minutes
  - billable source
  - auto stopped flag

---

### RF-FND-004 Shared Role and Permission Logic

Create role and permission helpers.

**UI:**

- None

**Logic:**

- Create `packages/shared/src/roles.ts`
- Create `packages/shared/src/permissions.ts`
- Define role hierarchy:
  - admin
  - dispatcher
  - courier
- Admin permissions:
  - full company access
  - manage dispatchers
  - manage couriers
  - manage depots
  - approve/correct shifts
  - upload documents
  - export data
- Dispatcher permissions:
  - manage couriers inside assigned depot scope
  - review shifts inside assigned depot scope
  - upload documents for scoped couriers
- Courier permissions:
  - own profile
  - own shifts
  - own mailbox
  - own PDFs
- Add helper functions:
  - `canManageCourier`
  - `canReviewShift`
  - `canUploadDocument`
  - `canAccessDepot`
  - `canDownloadDocument`

---

### RF-FND-005 Shared Shift Status Logic

Create shift workflow helpers.

**UI:**

- None

**Logic:**

- Create `packages/shared/src/shifts.ts`
- Define shift status flow:
  - `draft`
  - `submitted`
  - `under_review`
  - `approved`
  - `rejected`
  - `corrected`
- Implement allowed transitions
- Approved shifts are locked for couriers
- Rejected shifts can be edited and resubmitted
- Corrected shifts require admin/dispatcher reason
- Export helper:
  - `isShiftEditableByCourier`
  - `isShiftReadyForReview`
  - `isShiftApproved`
  - `canTransitionShiftStatus`

---

### RF-FND-006 Zod Schemas

Create shared validation schemas.

**UI:**

- None

**Logic:**

- Create:
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
- Export inferred TypeScript types from schemas

---

### RF-FND-007 Translation Keys

Create the bilingual translation foundation.

**UI:**

- None

**Logic:**

- Create:
  - `packages/shared/src/translations/de.ts`
  - `packages/shared/src/translations/bg.ts`
  - `packages/shared/src/translations/index.ts`
- German is default
- Bulgarian is optional
- Add translation keys for:
  - auth
  - navigation
  - shifts
  - reports
  - history
  - mailbox
  - profile
  - admin dashboard
  - documents
  - exports
  - errors
- Rule: no hardcoded bilingual strings in production UI

---

## Phase 2 — InsForge Foundation

### RF-DB-001 InsForge Initial Schema

Create the first database schema draft.

**UI:**

- None

**Logic:**

- Create `insforge/migrations/0001_initial_schema.sql`
- Create tables:
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
- Every company-owned table must include `company_id`
- Add primary keys
- Add foreign keys
- Add indexes
- Add basic constraints

---

### RF-DB-002 Row Level Security Policies

Create tenant and role security policies.

**UI:**

- None

**Logic:**

- Create `insforge/migrations/0002_rls_policies.sql`
- Enable RLS on all sensitive tables
- Rules:
  - admins see company data
  - dispatchers see assigned depot scope
  - couriers see own data only
  - no cross-company data leakage
- Add helper functions if needed:
  - current profile
  - current company
  - current role
  - dispatcher depot scope

---

### RF-DB-003 Storage Buckets

Create storage bucket plan and policies.

**UI:**

- None

**Logic:**

- Create `insforge/migrations/0003_storage_policies.sql`
- Buckets:
  - `courier-documents`
  - `shift-photos`
  - `payslips`
  - `generated-pdfs`
  - `company-assets`
- Access:
  - authenticated only
  - company-scoped
  - couriers own files only
  - admin all company files
  - dispatcher scoped files
- Sensitive downloads use signed URLs or authenticated private access

---

### RF-DB-004 Demo Seed Data

Create local demo data for mock-to-real testing.

**UI:**

- None

**Logic:**

- Create `insforge/seeds/demo_company.sql`
- Demo company:
  - Ivanov Transport
- Demo depot:
  - HBW3
- Demo users:
  - one admin
  - one dispatcher
  - three couriers
- Demo shifts:
  - draft
  - submitted
  - approved
  - rejected
  - geofence warning example

---

## Phase 3 — Mobile App UI With Mock Data

### RF-MOB-001 Mobile Shell and Navigation

Build the mobile app shell.

**UI:**

- Root layout
- Bottom tab navigation:
  - Home
  - Historie
  - Bericht
  - Postfach
  - Profil
- Header with:
  - company name
  - language switch
  - notification/message icon
- Placeholder content for each tab

**Logic:**

- No backend
- Mock user:
  - courier
  - Ivanov Transport
  - German default language

---

### RF-MOB-002 Mobile Login UI

Build the courier login screen.

**UI:**

- RouteForge logo
- Login card
- Email input
- Password or secure email login placeholder
- Invite code link
- Language switch
- German labels

**Logic:**

- No real auth yet
- Mock login button redirects to mobile home
- Keep UI ready for InsForge auth later

---

### RF-MOB-003 Mobile Invite Registration UI

Build invite code registration screen.

**UI:**

- Email input
- Invite code input
- Continue button
- Explanation text
- Pending approval information
- German/Bulgarian language support

**Logic:**

- No real backend yet
- Mock successful invite creates local pending courier state

---

### RF-MOB-004 Home / Current Shift UI

Build the main courier home screen.

**UI:**

- Company header
- Greeting
- Current shift card
- Large timer
- Start Shift / End Shift button
- Payment mode badge:
  - hourly
  - daily fixed
- Depot card
- Vehicle card
- Location status card
- Package summary cards
- Today summary card

**Logic:**

- Mock data only
- No timer logic yet
- Match approved design reference

---

### RF-MOB-005 Daily Report UI

Build the daily report form.

**UI:**

- Date and status header
- Depot selector
- Vehicle plate input
- Start KM input
- End KM input
- Package counters:
  - delivered
  - returned
  - Abholungen
  - total stops
- Photo cards:
  - start km
  - end km
  - Fahrtenbuch
  - Mentor screenshot
- Courier note textarea
- Signature block placeholder
- Submit button

**Logic:**

- Mock form only
- No validation yet
- No photo upload yet

---

### RF-MOB-006 History Calendar UI

Build the courier history screen.

**UI:**

- Month selector
- Monthly summary cards:
  - shifts
  - real hours
  - billable hours
- Calendar view
- Worked day indicators
- Selected day summary
- Open details button
- Download monthly PDF button

**Logic:**

- Mock calendar data only
- Day selection updates visible mock details

---

### RF-MOB-007 Day Details UI

Build detailed day report screen.

**UI:**

- Date header
- Approval status badge
- Time summary:
  - start
  - end
  - break
  - net
  - billable
- Depot
- Vehicle
- KM summary
- Package counters
- Photo preview grid
- Signature section
- Download daily PDF button

**Logic:**

- Mock data only
- Approved days visually read-only

---

### RF-MOB-008 Digital Mailbox UI

Build the courier mailbox.

**UI:**

- Tabs:
  - All
  - Dokumente
  - Abrechnungen
  - Verträge
  - Hinweise
- Mailbox list
- Unread markers
- Document cards
- Download/open button
- Empty state

**Logic:**

- Mock mailbox items only

---

### RF-MOB-009 Mailbox Item Details UI

Build mailbox item detail page.

**UI:**

- Title
- Category badge
- Date received
- Message body
- Attachment card
- Download button
- Mark as read visual state

**Logic:**

- Mock data only

---

### RF-MOB-010 Profile / Documents UI

Build courier profile screen.

**UI:**

- Profile summary
- Role and company
- Status badge
- Preferred language
- Personal data section
- Payment mode section
- Document status section:
  - ID card
  - driving license
  - address registration
  - IBAN proof
- Upload/update document buttons

**Logic:**

- Mock data only

---

### RF-MOB-011 Mobile Settings UI

Build basic settings screen if needed inside Profile.

**UI:**

- Language switch
- App version
- Logout button
- Privacy note
- Support/contact placeholder

**Logic:**

- Mock only

---

## Phase 4 — Mobile App Local Logic

### RF-MOB-012 Timer Local State

Add working shift timer behavior.

**UI:**

- Timer updates every second/minute
- Active shift state visible
- Start and End buttons switch correctly

**Logic:**

- Start timer
- Stop timer
- Calculate elapsed time from `startedAt`
- Do not rely only on in-memory counter
- Store active shift locally

---

### RF-MOB-013 Timer Persistence

Persist active shift state across app restarts.

**UI:**

- Existing active shift restores on app open
- Timer continues correctly

**Logic:**

- Use AsyncStorage
- Store:
  - shiftId
  - startedAt
  - paymentMode
  - depotId
  - isRunning
- Restore state on app load

---

### RF-MOB-014 Hourly 10h Auto Stop

Implement hourly courier 10-hour max rule.

**UI:**

- Show warning near 10h
- Show auto stopped status when limit is reached

**Logic:**

- If payment mode is `hourly`, stop at 600 billable minutes
- Set `autoStoppedAtMaxHours = true`
- Prevent billable time from exceeding 600 minutes

---

### RF-MOB-015 Daily Fixed Time Display

Implement daily fixed courier display logic.

**UI:**

- Real time shown separately
- Billable time shows 8:20 by default
- Explain that billable time may be corrected by admin/dispatcher

**Logic:**

- Use shared payroll logic
- Default billable minutes = 500
- Still store real start/end time

---

### RF-MOB-016 Daily Report Validation

Wire daily report to Zod validation.

**UI:**

- Field errors
- Disabled submit button until valid
- Required photo indicators
- Signature required message

**Logic:**

- Use `packages/shared` schemas
- Validate KM order
- Validate non-negative package counters
- Validate required fields
- Validate signature before submit

---

### RF-MOB-017 Photo Capture and Compression

Add photo capture and compression.

**UI:**

- Photo picker/camera button
- Preview selected photo
- Compressed status
- Remove/change photo button

**Logic:**

- Use expo-image-picker
- Use expo-image-manipulator
- Compress to target size
- Store local URI
- Prepare upload payload for backend later

---

### RF-MOB-018 Signature Capture

Add courier signature capture.

**UI:**

- Signature canvas
- Clear button
- Confirm signature button
- Signed timestamp display

**Logic:**

- Save signature locally
- Require before final submit
- Prepare signature upload payload

---

### RF-MOB-019 GPS Start/Stop Capture

Capture start and stop location.

**UI:**

- Location permission prompt state
- Start location saved status
- Stop location saved status
- Missing location warning

**Logic:**

- Use expo-location
- Capture start GPS on shift start
- Capture stop GPS on shift end
- Store:
  - latitude
  - longitude
  - accuracy
  - timestamp
- No live GPS tracking

---

### RF-MOB-020 Offline Draft Queue

Add offline draft support.

**UI:**

- Unsynced badge
- Sync pending indicator
- Last saved locally timestamp

**Logic:**

- Save report draft locally
- Mark draft as unsynced
- Queue pending sync operations
- Do not lose data when offline

---

### RF-MOB-021 Daily Report Workflow Strengthening

Finish the mobile daily report as a local operational workflow before admin/backend phases.

**UI:**

- Editable tour number, vehicle, KM and package counter fields
- Required-proof-photo cards support missing-with-explanation state
- Submitted/locked report banner
- Read-only submitted report summary in the Bericht tab
- Solid signature preview strokes and submitted read-only signature state
- Pending-sync notice after local submission

**Logic:**

- Validate required report values, non-negative counters, KM order and signature
- Allow missing required proof photos only when a German explanation exists
- Persist local v2 report lifecycle state in AsyncStorage
- Migrate old local draft shape to the v2 local report shape
- Mark submitted reports as `submitted`, `isLocked: true` and `pending_sync`
- Keep submitted local reports available in history/day details
- Reset the Bericht tab to a fresh report after German local midnight
- Keep all behavior mobile-local/mock-only with no InsForge calls, uploads, migrations or backend sync

---

## Phase 5 — Admin Panel UI With Mock Data

### RF-ADM-001 Admin Login UI

Build admin/dispatcher login page.

**UI:**

- RouteForge logo
- Login card
- Email input
- Password or secure login placeholder
- German labels
- Clean admin design

**Logic:**

- Mock login only
- Redirect to dashboard

---

### RF-ADM-002 Admin Shell and Navigation

Build protected admin layout.

**UI:**

- Sidebar navigation:
  - Dashboard
  - Schichten
  - Kuriere
  - Dispatcher
  - Depots
  - Dokumente
  - Einladungen
  - Exporte
  - Audit Logs
  - Einstellungen
- Topbar:
  - company name
  - user menu
  - notifications
- Main content wrapper

**Logic:**

- Mock current user
- Mock current company

---

### RF-ADM-003 Admin Dashboard UI

Build dashboard with mock data.

**UI:**

- Stat cards:
  - monthly billable hours
  - active couriers today
  - pending shifts
  - geofence warnings
- Active couriers table
- Pending shifts list
- Recent activity
- Quick actions

**Logic:**

- Mock data only

---

### RF-ADM-004 Shift Management UI

Build shift list and filters.

**UI:**

- Filters:
  - date
  - depot
  - status
  - courier
  - payment mode
- Shift table:
  - courier
  - date
  - depot
  - start/end
  - billable time
  - status
  - geofence warning
- Row click opens detail

**Logic:**

- Mock data only

---

### RF-ADM-005 Shift Review Details UI

Build shift review screen.

**UI:**

- Shift header
- Status badge
- Courier details
- Time summary
- Payment mode and billable time
- KM summary
- Package counters
- Photo evidence grid
- GPS/geofence warning card
- Signature card
- Admin notes
- Approve button
- Reject button
- Correct button

**Logic:**

- Mock data only

---

### RF-ADM-006 Shift Correction UI

Build correction form UI.

**UI:**

- Editable fields:
  - start time
  - end time
  - break minutes
  - billable minutes
  - KM values
  - package counters
- Required correction reason textarea
- Save correction button
- Cancel button

**Logic:**

- Local mock state only
- Save disabled without reason

---

### RF-ADM-007 Couriers List UI

Build courier management list.

**UI:**

- Search input
- Depot filter
- Status filter
- Payment mode filter
- Invite courier button
- Courier table:
  - name
  - depot
  - status
  - payment mode
  - last shift
  - documents status
  - actions

**Logic:**

- Mock data only

---

### RF-ADM-008 Courier Profile Admin UI

Build courier profile admin page.

**UI:**

- Courier header
- Status badge
- Approve/suspend buttons
- Personal data
- Payment mode card
- Depot assignment
- Documents list
- Recent shifts
- Notes
- Access history

**Logic:**

- Mock data only

---

### RF-ADM-009 Dispatcher Management UI

Build dispatcher management page.

**UI:**

- Dispatcher table
- Invite dispatcher button
- Status badge
- Depot access summary
- Edit depot access dialog
- Activate/deactivate actions

**Logic:**

- Mock data only
- Local selection of one, multiple or all depots

---

### RF-ADM-010 Depot Management UI

Build depot management page.

**UI:**

- Depot table
- Add depot button
- Depot detail form:
  - name
  - code
  - address
  - latitude
  - longitude
  - geofence radius
  - active status
- Assigned dispatchers/couriers preview

**Logic:**

- Mock data only

---

### RF-ADM-011 Documents Upload UI

Build documents and payslips upload page.

**UI:**

- Document table
- Upload dialog
- Select courier
- Select document type
- File input
- Mailbox notification toggle
- Upload button

**Logic:**

- Mock data only
- No real upload yet

---

### RF-ADM-012 Invitations UI

Build invitation management page.

**UI:**

- Invitation table
- Create invitation dialog
- Email input
- Role selector
- Optional depot selector
- Expiry date
- Status badges:
  - active
  - used
  - expired
  - revoked

**Logic:**

- Mock data only
- Invite code preview

---

### RF-ADM-013 Accountant Export UI

Build export screen.

**UI:**

- Month selector
- Depot filter
- Payment mode filter
- Export preview table
- CSV download button
- XLSX download button

**Logic:**

- Mock data only

---

### RF-ADM-014 Audit Logs UI

Build audit logs screen.

**UI:**

- Filters:
  - actor
  - action
  - date
  - target
- Audit table:
  - timestamp
  - actor
  - action
  - target
  - reason
- Change detail drawer

**Logic:**

- Mock data only

---

### RF-ADM-015 Company Settings UI

Build company settings page.

**UI:**

- Company name
- Logo upload placeholder
- Stamp PNG upload placeholder
- Default language
- Default retention settings
- Save button

**Logic:**

- Mock data only

---

## Phase 6 — Admin Panel Local Logic

### RF-ADM-016 Shift Filters and Table State

Wire shift filters to mock data.

**UI:**

- Filtered table updates immediately
- Empty state if no shift matches

**Logic:**

- Filter by date
- Filter by depot
- Filter by status
- Filter by courier
- Filter by payment mode

---

### RF-ADM-017 Shift Correction Local Logic

Wire correction form with shared payroll logic.

**UI:**

- Recalculated billable time preview
- Required reason validation
- Save correction updates local mock state

**Logic:**

- Use `packages/shared/payroll`
- Recalculate time after edits
- Require reason
- Mark shift as corrected locally

---

### RF-ADM-018 Courier Approval Local Logic

Add local approval flow.

**UI:**

- Pending courier can be approved
- Status badge changes
- Approved timestamp shown

**Logic:**

- Local mock mutation
- No backend yet

---

### RF-ADM-019 Dispatcher Depot Access Local Logic

Add dispatcher depot assignment behavior.

**UI:**

- Select one depot
- Select multiple depots
- Select all depots
- Save button
- Summary updates

**Logic:**

- Local mock state
- Prepare for `profile_depot_access` backend later

---

### RF-ADM-020 Document Upload Local Logic

Add local document upload state.

**UI:**

- Selected file appears in upload dialog
- Mailbox notification toggle works
- Mock document added to table after submit

**Logic:**

- Local state only
- No real storage yet

---

### RF-ADM-021 Invitation Local Logic

Add local invitation creation behavior.

**UI:**

- Create invitation
- Show generated invite code
- Revoke invitation
- Expired badge simulation

**Logic:**

- Local state only
- Code generation placeholder

---

### RF-ADM-022 Export Preview Local Logic

Generate export preview from mock approved shifts.

**UI:**

- Preview updates after filter changes
- Totals update
- CSV/XLSX buttons visible

**Logic:**

- Filter approved shifts only
- Use billable minutes
- Create local preview rows

---

## Phase 7 — Backend Integration

### RF-BE-001 InsForge Auth Integration

Connect auth to InsForge.

**UI:**

- Login works in mobile
- Login works in admin
- Logout works
- Unauthorized users redirected

**Logic:**

- InsForge session management
- Admin route protection
- Mobile route protection
- Load current profile after login

---

### RF-BE-002 Invitation Backend

Connect invitation flow.

**UI:**

- Admin creates invite
- Courier enters invite code
- Invalid/expired/used code errors visible

**Logic:**

- Create invitation in DB
- Validate invite code
- One-time use
- Recommended 7-day expiry
- Create pending profile
- Mark invite as used

---

### RF-BE-003 Profile Approval Backend

Connect courier approval.

**UI:**

- Pending courier appears in admin
- Approve button changes status
- Courier gains access after approval

**Logic:**

- Update profile status
- Set approved_at
- Set approved_by
- Write audit log

---

### RF-BE-004 Depot Backend

Connect depot management.

**UI:**

- Admin can create/edit depots
- Dispatcher scope uses depot data

**Logic:**

- CRUD depots
- Geofence fields saved
- Company scoped
- Audit sensitive changes if needed

---

### RF-BE-005 Dispatcher Depot Access Backend

Connect dispatcher depot access.

**UI:**

- Admin assigns depot access
- Dispatcher sees only assigned scope

**Logic:**

- Write `profile_depot_access`
- Enforce on server-side queries
- Enforce with RLS policies
- Audit depot access changes

---

### RF-BE-006 Shift Start/Stop Backend

Connect mobile shift start and end.

**UI:**

- Start creates real draft shift
- End updates real shift
- Errors shown safely

**Logic:**

- Create shift draft
- Save start_time
- Save end_time
- Save payment mode snapshot
- Save gross/break/net/billable time
- Enforce one shift per day
- Enforce hourly 10h cap server-side

---

### RF-BE-007 Shift Location Backend

Connect GPS start/stop storage and geofence.

**UI:**

- Mobile shows location saved
- Admin shows red warning if outside depot

**Logic:**

- Save start location
- Save stop location
- Calculate distance from depot
- Store inside/outside result
- No live GPS tracking

---

### RF-BE-008 Daily Report Submit Backend

Connect daily report submission.

**UI:**

- Submit sends real report
- Submitted report locks for courier
- Admin sees submitted shift

**Logic:**

- Save report fields
- Validate with shared schema
- Require signature
- Upload signature to deterministic private report artifact path
- Verify signature storage object before status change
- Change status to submitted
- Store submitted_at

---

### RF-BE-009 Shift Photo Upload Backend

Connect photo upload to InsForge Storage.

**UI:**

- Upload progress
- Uploaded status
- Error retry

**Logic:**

- Upload compressed photos
- Save metadata in `shift_photos`
- Set expires_at = uploaded_at + 14 days
- Private storage only

---

### RF-BE-010 Signature Artifact Access Backend

Connect persisted signature artifacts to review/rendering surfaces.

**UI:**

- Signature appears in day details and admin review

**Logic:**

- Read persisted `signature_url`, `signature_storage_key` and `signed_at`
- Verify private storage access by role/scope
- Prepare signature artifact for admin review and PDF rendering
- Do not duplicate the submit-time signature upload from RF-BE-008
- Restrict access by role/scope

---

### RF-BE-011 Admin Shift Approval Backend

Connect approve/reject/correct actions.

**UI:**

- Approve updates status
- Reject requires reason
- Correct requires reason
- Shift list revalidates

**Logic:**

- Server-side role/scope check
- Status transition validation
- Recalculate payroll if needed
- Write audit logs

---

### RF-BE-012 Documents and Mailbox Backend

Connect document upload and courier mailbox.

**UI:**

- Admin uploads document
- Courier sees unread mailbox item
- Courier can download own document

**Logic:**

- Upload to private storage
- Save document metadata
- Create mailbox item
- Signed/authenticated download access
- Mark read

---

### RF-BE-013 History Backend

Connect mobile history to real shifts.

**UI:**

- Calendar shows real worked days
- Day details shows real data
- Monthly totals real

**Logic:**

- Query own shifts
- Approved/rejected/submitted status visible
- Couriers only access own data

---

## Phase 8 — PDFs, Exports and Retention

### RF-DOC-001 Daily PDF Generation

Generate daily shift PDF.

**UI:**

- Download daily PDF button works

**Logic:**

- Server validates access
- Fetch shift/profile/company data
- Render PDF with @react-pdf/renderer
- Include:
  - company
  - courier
  - date
  - depot
  - vehicle
  - time
  - break
  - billable time
  - KM
  - packages
  - signature
  - approval status
  - stamp PNG if available

---

### RF-DOC-002 Monthly PDF Generation

Generate monthly overview PDF.

**UI:**

- Download monthly PDF button works

**Logic:**

- Fetch courier shifts for selected month
- Approved/submitted visibility based on role
- Summarize real and billable hours
- Render PDF
- Permission-scoped access

---

### RF-DOC-003 Accountant CSV Export

Generate CSV export.

**UI:**

- CSV download button works

**Logic:**

- Approved shifts only
- Month filter
- Depot filter
- Payment mode filter
- Include real and billable time
- German accountant-friendly headers

---

### RF-DOC-004 Accountant XLSX Export

Generate XLSX export.

**UI:**

- XLSX download button works

**Logic:**

- Same data as CSV
- Clean spreadsheet formatting
- Totals row
- One sheet for selected month

---

### RF-DOC-005 Shift Photo Retention Cleanup

Delete operational shift photos after 14 days.

**UI:**

- Admin can see deleted/expired photo state if needed

**Logic:**

- Find photos where expires_at < now
- Delete files from storage
- Set deleted_at
- Keep metadata
- Do not delete payslips or official documents

---

### RF-DOC-006 Company Stamp PNG Support

Allow company stamp image for PDFs.

**UI:**

- Admin settings has stamp upload placeholder
- PDFs display stamp when available

**Logic:**

- Store stamp in `company-assets`
- Save stamp URL/path in `companies`
- Add stamp to daily/monthly PDFs

---

## Phase 9 — Security, Polish and Production Prep

### RF-PROD-001 Loading, Empty and Error States

Add consistent app states.

**UI:**

- Loading skeletons
- Empty states
- Error cards
- Retry buttons
- Offline state

**Logic:**

- Safe error messages
- No blank broken screens

---

### RF-PROD-002 Security Review

Review security boundaries.

**UI:**

- None

**Logic:**

- Check RLS policies
- Check server-side role checks
- Check company_id scoping
- Check dispatcher depot scope
- Check courier own-data rules
- Check signed URLs
- Check no secrets in client code

---

### RF-PROD-003 GDPR / DSGVO Review

Review sensitive data handling.

**UI:**

- Privacy notes where needed

**Logic:**

- Sensitive personal data minimized
- Documents private
- Shift photo 14-day retention works
- No live GPS tracking
- Audit logs exist for sensitive changes

---

### RF-PROD-004 Performance Review

Review performance before production.

**UI:**

- Tables paginate correctly
- Mobile screens remain smooth
- Image previews optimized

**Logic:**

- Query pagination
- Indexes on common filters
- Avoid unnecessary large downloads
- Avoid loading full storage files in tables

---

### RF-PROD-005 Deployment Checklist

Prepare deployment documentation.

**UI:**

- None

**Logic:**

- Create `docs/deployment-checklist.md`
- Define env variables
- Define InsForge project setup
- Define storage buckets
- Define migration order
- Define admin bootstrap process
- Define mobile testing process

---

## Feature Count

| Phase                                  | Features |
| -------------------------------------- | -------- |
| Phase 0 — Codex Context & Design       | 3        |
| Phase 1 — Shared Foundation            | 7        |
| Phase 2 — InsForge Foundation          | 4        |
| Phase 3 — Mobile App UI With Mock Data | 11       |
| Phase 4 — Mobile App Local Logic       | 10        |
| Phase 5 — Admin Panel UI With Mock Data | 15      |
| Phase 6 — Admin Panel Local Logic      | 7        |
| Phase 7 — Backend Integration          | 13       |
| Phase 8 — PDFs, Exports and Retention  | 6        |
| Phase 9 — Security, Polish and Production Prep | 5 |
| **Total**                              | **81**   |

---

## Recommended First Implementation Order

```txt
RF-000-001
RF-000-002
RF-000-003
RF-FND-001
RF-FND-002
RF-FND-003
RF-FND-004
RF-FND-005
RF-FND-006
RF-FND-007
RF-MOB-001
RF-MOB-002
RF-MOB-003
RF-MOB-004
```

The mobile UI should start only after the shared foundation is stable enough for Codex to reuse names, roles, statuses, payroll rules and translation keys.
