# Admin Rules

Rules for `apps/admin`, the RouteForge web admin panel.

The admin panel is used by company admins and dispatchers to control courier operations, shift review, depot access, documents, payslips, reports, exports and audit logs.

It must feel operational, precise and trustworthy — not decorative.

---

## Admin Surface

```txt
App: apps/admin
Framework: Next.js App Router
Language: TypeScript strict
Styling: Tailwind CSS + shadcn/ui
Default UI language: German
Backend: InsForge Auth + DB + Storage + RLS
```

Admin UI must use the RouteForge visual system:

- white cards
- blue primary actions
- rounded panels
- readable tables
- clean operational layout
- German labels
- clear status badges
- no random colors
- no pixel-perfect copying from screenshots

Before building admin UI, check:

```txt
context/designs/admin/
context/ui-tokens.md
context/ui-rules.md
context/ui-registry.md
context/permissions.md
```

---

## Admin Roles

The admin panel supports two operational roles in v1:

```txt
admin
  Full company workspace access.

dispatcher
  Limited company access scoped by assigned depots.
```

There is no super-admin SaaS console in the first build phase.

---

## Main Admin Navigation

Use sidebar navigation, not top-only navigation.

Default German navigation:

```txt
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

Rules:

- Sidebar desktop width: 260px
- Topbar height: 64px
- Main content desktop padding: 32px
- Main content max-width: 1440px
- Use active sidebar state from `ui-rules.md`
- Do not add unrelated admin areas outside the build plan

---

## Admin Pages

Expected routes:

```txt
/login
/admin/dashboard
/admin/shifts
/admin/shifts/[id]
/admin/couriers
/admin/couriers/[id]
/admin/dispatchers
/admin/depots
/admin/documents
/admin/invitations
/admin/exports
/admin/audit-logs
/admin/settings
```

Do not create marketing pages, SaaS billing pages or public product pages in v1.

---

## Dashboard Rules

Dashboard must show operational state, not vanity metrics.

Allowed dashboard cards:

- active couriers today
- submitted shifts waiting for review
- approved shifts for selected period
- geofence warnings
- pending courier approvals
- document uploads / unread mailbox items
- export readiness for current month

Avoid charts unless they directly support shift review or monthly payroll readiness.

---

## Shift Review Rules

Shift review is the most important admin workflow.

Admin/dispatcher must be able to see:

- courier name
- depot
- shift date
- payment mode snapshot
- start time
- end time
- gross minutes
- break minutes
- net minutes
- billable minutes
- billable source
- auto-stop at 10h flag
- geofence start/stop warning
- daily report values
- proof photos
- signature status
- courier note
- approval/rejection/correction history

Actions:

```txt
Approve shift
Reject shift with reason
Correct shift with reason
Override billable minutes with reason
```

Rules:

- Corrections require a reason
- Billable override requires a reason
- Rejection requires a reason
- Sensitive actions create an audit log
- Dispatcher can only review shifts for assigned depots
- Courier cannot approve, reject, correct or override shifts

---

## Courier Management Rules

Courier list must support:

- search by name/email
- filter by depot
- filter by status
- filter by payment mode
- status badges
- pending approval queue

Courier profile admin view must show:

- profile status
- assigned depot
- payment mode
- personal data summary
- document status
- recent shifts
- mailbox documents
- approval controls
- suspension/deactivation controls if implemented later

Rules:

- New couriers from invite start as `pending_approval`
- Admin can approve couriers
- Dispatcher can approve couriers only if allowed by permission rules
- Courier personal document downloads must use private/signed access
- Sensitive fields such as Steuer-ID and IBAN must not be shown casually in dense tables

---

## Dispatcher and Depot Access Rules

Admin can manage dispatchers.

Dispatcher access is depot-scoped:

```txt
company_id + dispatcher_profile_id + depot_id
```

Rules:

- Dispatcher sees only assigned depots
- Dispatcher sees only couriers and shifts connected to assigned depots
- Dispatcher cannot grant themselves access
- Dispatcher cannot manage admin users
- Depot access changes create audit logs

Admin can manage depots:

- name
- code
- address
- coordinates
- geofence radius
- active/inactive state

Do not implement live tracking. Only start/stop GPS location matters in v1.

---

## Documents and Mailbox Rules

Admin/dispatcher can upload documents for couriers.

Supported document categories:

```txt
payslip
contract
instruction
notice
other
```

Rules:

- Uploaded documents go to private storage
- Document metadata is saved in the database
- Courier receives a digital mailbox item
- Courier can only read own mailbox items
- Payslips/contracts/documents are not deleted by the 14-day shift-photo cleanup
- Downloads use private/signed access
- Uploading a document creates an audit log

---

## Invitations Rules

Admin or dispatcher can create invite codes depending on permission.

Courier registration uses email invite code.

Invitation rules:

- role must be `courier` or `dispatcher`
- invite code is one-time use
- invite has expiry
- invite can be revoked
- used invite stores `used_at` and `used_by`
- courier created from invite starts as `pending_approval`

Do not allow public self-registration without invite code.

---

## Exports Rules

Accountant exports must use approved shifts only.

Supported export types:

```txt
CSV
XLSX
```

Export must include:

- company
- courier
- depot
- shift date
- payment mode
- start/end time
- gross minutes
- break minutes
- net minutes
- billable minutes
- billable source
- override reason if present
- approval status

Rules:

- Export does not execute payments
- Export does not calculate taxes
- Export does not replace accounting software
- Export generation should be logged

---

## Admin Forms

Forms must be structured and hard to misuse.

Rules:

- Use German labels
- Mark required fields clearly
- Validate with shared Zod schemas where possible
- Show field-level errors
- Never show raw backend errors to users
- Destructive actions require confirmation
- Reason fields are mandatory for corrections, overrides and rejections

---

## Admin Tables

Tables must be dense but readable.

Rules:

- Use sticky or clear table headers where useful
- Use filters above tables
- Use badges for status
- Use row actions sparingly
- Important warnings must be visible without opening too many nested dialogs
- Do not hide geofence warnings inside secondary tabs only

---

## Admin Mock Data Rules

During UI-first phases:

- Use realistic German courier company data
- Use German labels
- Include multiple statuses
- Include at least one geofence warning
- Include both payment modes
- Include pending approval courier
- Include approved and submitted shifts
- Include document examples

Mock data must live near the feature or in a clear mock-data helper. Do not mix mock data into shared business logic.

---

## Admin Security Boundary

Client-side checks are UX helpers only.

Real protection must happen through:

- server-side role checks
- company scope checks
- dispatcher depot scope checks
- InsForge RLS policies
- private storage policies

Never trust admin UI state as permission proof.
