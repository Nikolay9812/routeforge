# Project Overview

## About the Project

RouteForge is a full stack multi-tenant courier operations platform for transport and delivery companies. Each company gets its own workspace, depots, dispatchers, couriers, shifts, documents, mailbox, exports and operational rules.

The first target use case is a courier company in Mannheim, Germany, working as a subcontractor for Amazon Heavy Bulky deliveries — refrigerators, washing machines, dryers, dishwashers and other large items.

The platform has two main applications:

* A mobile app for couriers built with Expo and NativeWind
* A web admin panel built with Next.js App Router and TypeScript

Couriers use the mobile app to start and end shifts, submit daily reports, upload proof photos, sign their reports, view their history, download PDFs and receive documents in a digital mailbox.

Admins and dispatchers use the web panel to manage couriers, depots, shift approvals, documents, payslips, geofence warnings, payroll data and accountant exports.

The system is built UI-first: all screens are created with mock data first, visually approved, and only then connected step by step to InsForge database, auth, storage and Row Level Security.

---

## The Problem It Solves

Courier subcontractor companies often manage daily work time, shift reports, driver documents, payslips, proof photos and payroll data through messy combinations of paper, WhatsApp, screenshots, Excel sheets and manual messages.

This creates several problems:

* Working hours are hard to verify
* Daily reports can be incomplete or inconsistent
* Photos and proof documents are scattered across devices and chats
* Dispatchers spend too much time checking basic information manually
* Couriers do not always have access to their own shift history or documents
* Accountants need clean monthly data, but the company often prepares it manually
* There is no clear audit trail when a shift is corrected or disputed
* Start and end locations are difficult to verify
* Sensitive worker documents are not managed in a structured way

RouteForge solves this by centralizing the entire courier workflow in one system: shift tracking, daily reports, GPS start/stop verification, photo evidence, signatures, approval flow, digital mailbox, PDF reports and accountant exports.

---

## Pages

### Mobile App

```
/                    → Mobile home / current shift
/login               → Courier login
/invite              → Invite code registration
/history             → Monthly calendar and worked days
/history/[date]      → Detailed daily shift report
/report              → Daily report form
/mailbox             → Digital mailbox
/mailbox/[id]        → Document or notification details
/profile             → Courier profile and personal documents
/settings            → Language and app settings
```

### Admin Panel

```
/                    → Redirect to /admin/dashboard
/login               → Admin / dispatcher login
/admin/dashboard     → Company overview, statistics, alerts
/admin/shifts        → Shift management and approvals
/admin/shifts/[id]   → Shift detail, correction, approval, rejection
/admin/couriers      → Courier list and management
/admin/couriers/[id] → Courier profile, documents, shifts, access
/admin/dispatchers   → Dispatcher management
/admin/depots        → Depot management and geofence settings
/admin/documents     → Documents, payslips and mailbox uploads
/admin/invitations   → Email invite codes and registration control
/admin/exports       → Accountant exports
/admin/audit-logs    → Audit trail and sensitive changes
/admin/settings      → Company and platform settings
```

---

## Navigation

### Mobile Navigation

Bottom tab navigation. Clean, simple and optimized for one-handed use.

```
Home    Historie    Bericht    Postfach    Profil
```

The mobile app uses German as the default UI language and Bulgarian as an optional language.

### Admin Navigation

Sidebar navigation on desktop. Full width dashboard layout with data tables, filters and action panels.

```
Dashboard
Schichten
Kuriere
Dispatcher
Depots
Dokumente
Einladungen
Exporte
Audit Logs
Einstellungen
```

The admin panel shows the current company name in the top bar, for example:

```
Ivanov Transport
```

RouteForge is the platform name. The company name is tenant-specific.

---

## Core User Flow

### Company Setup

* Admin creates or enters a company workspace in RouteForge
* Company has its own name, settings, depots, users and data
* Admin creates depots with address, coordinates and geofence radius
* Admin creates dispatcher accounts or sends dispatcher invitations
* Admin controls which depots each dispatcher can access
* Admin can assign one, multiple or all depots to a dispatcher

### Courier Invitation

* Admin or dispatcher creates an email invite code for a courier
* Invite code is sent to the courier
* Courier opens the mobile app
* Courier registers with email invite code
* Courier profile is created with status `pending_approval`
* Courier completes personal data and required documents
* Admin or dispatcher reviews the courier profile
* After approval, courier status becomes `active`
* Active courier can start and submit shifts

### Courier Mobile Home

* Courier opens the mobile app
* Home screen shows company name, language switch and current shift status
* If no active shift exists, courier sees Start Shift button
* Courier starts shift
* App stores start time and start GPS location
* App shows live timer
* Courier sees depot, vehicle, package counters and current daily summary
* If courier is hourly, timer automatically stops at 10:00 hours
* If courier is daily fixed, real time is tracked but billable time defaults to 8:20 hours

### Shift Start

* Courier taps Start Shift
* App captures current time
* App captures GPS location
* App compares location with depot geofence later through backend logic
* Shift is created as draft
* Timer starts
* Start location is saved
* If start location is outside depot area, admin/dispatcher sees a red warning marker

### Daily Report

* Courier fills the daily report form
* Courier enters depot, vehicle, start kilometers, end kilometers and package counters
* Courier records:

  * Delivered packages
  * Returns
  * Abholungen / customer pickups
  * Total stops
* Courier uploads operational proof photos:

  * Start km photo
  * End km photo
  * Fahrtenbuch photo
  * Mentor screenshot
* Photos are compressed before upload
* Photos are retained temporarily for 14 days
* Courier can add optional notes
* Courier signs the daily report
* Report cannot be submitted without required data and signature

### Shift End

* Courier taps End Shift
* App captures end time
* App captures end GPS location
* App calculates gross time, legal break, net time and billable time
* Hourly courier is capped at 10:00 billable hours
* Daily fixed courier defaults to 8:20 billable hours
* Report remains draft until courier signs and submits it

### Shift Submission

* Courier reviews daily report
* Courier signs that the data is correct
* Courier submits the report
* Shift status changes to `submitted`
* Submitted shift becomes locked for the courier
* Admin/dispatcher can review it from the admin panel
* If correction is needed, admin/dispatcher can reject or correct with reason

### History Calendar

* Courier opens History screen
* Calendar shows worked days for the selected month
* Monthly totals are displayed:

  * Number of shifts
  * Working time
  * Billable time
* Courier taps any worked day
* App opens detailed daily report
* Courier can download daily PDF
* Courier can download monthly PDF overview

### Day Details Page

* Courier sees full structured daily report:

  * Date
  * Start time
  * End time
  * Pause
  * Net working time
  * Billable time
  * Depot
  * Vehicle
  * Start kilometers
  * End kilometers
  * Driven kilometers
  * Delivered packages
  * Returns
  * Abholungen
  * Uploaded proof photos
  * Signature
  * Approval status
* Approved days are read-only
* PDF download button generates or downloads the daily report

### Digital Mailbox

* Courier opens Postfach
* Courier sees documents and notifications uploaded by admin/dispatcher
* Mailbox can contain:

  * Payslips
  * Employment contracts
  * Instructions
  * Company notices
  * Shift-related messages
  * PDF files
* Unread items are visually marked
* Courier can open and download documents
* Access is restricted to the courier’s own mailbox items

### Courier Profile

* Courier opens profile page
* Profile shows:

  * Name
  * Role
  * Company
  * Depot
  * Phone
  * Email
  * Address
  * Preferred language
  * Document status
* Courier can upload or update allowed personal documents
* Documents can include:

  * ID card
  * Driving license
  * Address registration
  * IBAN proof
  * Other company-required documents
* Sensitive files are stored in private storage, not directly exposed

### Admin Dashboard

* Admin/dispatcher opens the admin panel
* Dashboard shows:

  * Total monthly hours
  * Active couriers today
  * Pending shifts
  * Geofence warnings
  * Active couriers table
  * Shifts waiting for review
  * Recent activity
  * Quick actions
* Admin can filter data by date, depot and status
* Dispatcher sees only allowed depot scope
* Admin can see all company depots

### Shift Review

* Admin/dispatcher opens Schichten
* Table shows submitted and approved shifts
* Filters:

  * Date
  * Depot
  * Status
  * Courier
* Admin/dispatcher selects a shift
* Detail panel shows:

  * Courier
  * Date
  * Depot
  * Start/end time
  * Real time
  * Pause
  * Net time
  * Billable time
  * Payment mode
  * Vehicle
  * KM values
  * Packages
  * Uploaded photos
  * Start/stop geofence status
* Admin/dispatcher can:

  * Approve shift
  * Reject shift with reason
  * Correct shift with reason
* Any correction is audit logged

### Payment Mode Flow

* Each courier has a payment mode:

  * `hourly`
  * `daily_fixed`
* Hourly couriers:

  * Real time is tracked
  * Legal break is calculated automatically
  * Billable time is capped at 10:00 hours
* Daily fixed couriers:

  * Real time is still tracked
  * Billable time defaults to 8:20 hours
  * Admin/dispatcher can override billable time in special cases
  * Override requires a reason
* Payroll and export logic use billable time, not only real time

### Document Upload Flow

* Admin/dispatcher opens Documents page
* Admin/dispatcher uploads a file
* Selects:

  * Courier
  * Document type
  * Depot if relevant
  * Mailbox notification option
* File is saved in private storage
* Metadata is saved in database
* Mailbox item is created for the courier
* Courier sees unread document in mobile mailbox

### Invitation Flow

* Admin/dispatcher creates invitation
* Invitation contains:

  * Email
  * Role
  * Company
  * Optional depot assignment
  * Expiry date
  * Status
* Recommended behavior:

  * One-time use
  * 7 days validity
* Used invitations cannot be reused
* Expired or revoked invitations cannot register new users

### Accountant Export

* Admin opens Exporte
* Selects month and filters
* System shows export preview
* Export includes approved shifts only
* Export includes:

  * Courier name
  * Date
  * Depot
  * Payment mode
  * Real working time
  * Break
  * Net time
  * Billable time
  * Approval status
* Admin downloads CSV or XLSX file
* Export is designed for German accountant / Steuerberater workflow

---

## Data Architecture

### Tenant / Company Data

* Lives in `companies` table
* Every company has isolated data
* Every major business table uses `company_id`
* RouteForge must never expose data between companies
* Company name appears in UI, but RouteForge remains the platform name

### Depot Data

* Lives in `depots` table
* Each depot belongs to one company
* Depot stores:

  * Name
  * Code
  * Address
  * Latitude
  * Longitude
  * Geofence radius
  * Active status
* Depot access for dispatchers is controlled by admin

### Profile Data

* Lives in `profiles` table
* Linked to authenticated InsForge user
* Contains role, status, company, contact data and payment mode
* Couriers can edit allowed personal fields
* Admin/dispatcher can approve and manage couriers inside their permission scope
* Profile status controls app access

### Dispatcher Depot Access

* Lives in `profile_depot_access` table
* Determines which depots a dispatcher can access
* Admin can assign one, multiple or all depots
* Dispatcher permissions are always filtered by this scope

### Shift Data

* Lives in `shifts` table
* One shift per courier per day in version 1
* Contains real time, break time, net time and billable time
* Contains depot, vehicle, kilometers and package counters
* Contains status workflow:

  * `draft`
  * `submitted`
  * `under_review`
  * `approved`
  * `rejected`
  * `corrected`
* Approved shifts are locked
* Corrections require reason and audit log

### Shift Location Data

* Lives in `shift_locations` table
* Stores start and stop GPS only in version 1
* Does not track live movement
* Contains:

  * Latitude
  * Longitude
  * Accuracy
  * Type: start or stop
  * Distance from depot
  * Inside/outside geofence flag
* Outside depot start/stop creates warning marker in admin panel

### Shift Photo Data

* Metadata lives in `shift_photos` table
* Files live in private storage bucket `shift-photos`
* Photos are operational evidence files
* Retention rule:

  * Keep shift photos for 14 days
  * Automatically delete files after retention expires
  * Keep necessary metadata if required for audit or reporting

### Document Data

* Metadata lives in `documents` table
* Files live in private storage buckets
* Documents can be linked to courier mailbox
* Payslips, contracts and official PDFs are private files
* Access must use authenticated access or signed URLs

### Mailbox Data

* Lives in `mailbox_items` table
* Each mailbox item belongs to one courier
* Can link to document
* Tracks read/unread state
* Courier can only see own mailbox

### Audit Log Data

* Lives in `audit_logs` table
* Stores sensitive admin/dispatcher actions
* Used for:

  * Shift corrections
  * Payment overrides
  * Approvals
  * Rejections
  * Document uploads
  * Role changes
  * Depot access changes
* Audit logs must include actor, action, target, before, after, reason and timestamp

---

## Features In Scope

* Multi-tenant company structure
* Company-specific workspace and UI
* Admin panel with protected routes
* Dispatcher role with admin-controlled depot access
* Courier mobile app
* German and Bulgarian language support
* Email invite code registration
* Courier pending approval flow
* Profile setup and personal data management
* Depot management
* Depot geofence settings
* Shift start and stop
* Real time shift timer
* Hourly courier max 10:00 hour rule
* Daily fixed 8:20 billable time rule
* Automatic legal break calculation
* Manual billable time override with required reason
* One shift per courier per day in version 1
* Daily report form
* Package counters
* Abholungen / customer pickup counter
* Start and end kilometer tracking
* Start and end GPS capture
* Outside depot geofence warning
* Photo upload for operational proof
* Photo compression before upload
* 14-day shift photo retention
* Courier signature on daily report
* Submitted shift locking
* Shift approval flow
* Shift rejection flow
* Shift correction flow
* Admin/dispatcher shift review
* Courier monthly history calendar
* Daily report PDF download
* Monthly overview PDF download
* Company stamp PNG support for generated PDFs
* Digital mailbox for couriers
* Admin/dispatcher document upload
* Payslip upload
* Employment contract upload
* Private document storage
* Signed/authenticated document download
* Accountant CSV/XLSX export
* Audit logs for sensitive changes
* UI-first development with mock data
* Context-driven Codex workflow
* Design reference folder for mobile and admin screens

---

## Features Out of Scope

* Two shifts per courier per day in version 1
* Live GPS tracking during the entire route
* Customer-facing tracking page
* Customer signatures
* Automatic Amazon route import
* Direct Amazon API integration
* Driver payroll payment execution
* Bank transfer automation
* Tax calculation
* Full accounting system
* In-app chat in version 1
* Push notifications in the first UI-only phase
* Vehicle maintenance management
* Fuel card tracking
* Damage claim management in version 1
* Public marketing website
* Subscription billing for RouteForge in version 1
* Super-admin SaaS billing console in first build phase
* Browser extension
* Native iOS/Android store release before core workflow is stable
* AI automation features before core operations are complete

---

## Internal Operational Event Names

These are internal event/action names for audit logs, UI status mapping, product terminology and future reporting.

They are **not** an instruction to install an analytics provider.

```typescript
company_created; // { companyId, companyName }
depot_created; // { companyId, depotId, depotCode }
invitation_created; // { companyId, role, email }
invitation_used; // { companyId, role, userId }
courier_profile_completed; // { companyId, courierId }
courier_approved; // { companyId, courierId, approvedBy }
shift_started; // { companyId, courierId, depotId, shiftId }
shift_auto_stopped_at_10h; // { companyId, courierId, shiftId }
shift_ended; // { companyId, courierId, depotId, shiftId }
shift_submitted; // { companyId, courierId, shiftId }
shift_approved; // { companyId, shiftId, approvedBy }
shift_rejected; // { companyId, shiftId, rejectedBy }
shift_corrected; // { companyId, shiftId, correctedBy }
billable_time_overridden; // { companyId, shiftId, actorId }
geofence_warning_created; // { companyId, shiftId, depotId, distanceMeters }
document_uploaded; // { companyId, documentId, uploadedBy, targetCourierId }
mailbox_item_read; // { companyId, courierId, mailboxItemId }
daily_pdf_downloaded; // { companyId, courierId, shiftId }
monthly_pdf_downloaded; // { companyId, courierId, month }
accountant_export_created; // { companyId, month, createdBy }
```

---

## Target User

RouteForge is built for small and mid-sized courier subcontractor companies that:

* Work with delivery platforms such as Amazon
* Manage couriers, dispatchers and depots
* Need better control over working hours
* Need clean shift reports and proof photos
* Need digital worker document management
* Need payroll-ready monthly exports
* Need a simple mobile workflow for couriers
* Need admin control without building custom software from scratch

Primary users:

* Company owner / admin
* Dispatcher
* Courier
* Accountant / Steuerberater as export recipient

---

## Success Criteria

* Company can create a workspace and configure depots
* Admin can invite dispatchers and couriers
* Dispatcher depot access can be controlled by admin
* Courier can register with invite code and wait for approval
* Courier can start and end a shift from the mobile app
* Hourly courier timer caps correctly at 10:00 hours
* Daily fixed courier billable time defaults to 8:20 hours
* Legal break calculation works correctly
* Courier can fill daily report and upload required photos
* Courier can sign and submit daily report
* Submitted shift appears in admin shift review
* Admin/dispatcher can approve, reject or correct a shift
* Corrections require a reason and are audit logged
* Start/stop geofence warnings are visible in admin panel
* Courier can open history calendar and view detailed day report
* Courier can download daily and monthly PDFs
* Admin can upload payslips, contracts and documents to courier mailbox
* Courier can view and download mailbox documents
* Shift photos are retained for 14 days and then cleaned up
* Admin can generate accountant CSV/XLSX export
* All company data is isolated by tenant/company
* All role permissions are enforced server-side and through RLS
* UI is visually consistent across mobile and admin
* Codex can follow the build plan feature by feature without skipping steps
