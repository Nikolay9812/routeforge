# Security and GDPR / DSGVO

Security and privacy rules for RouteForge.

RouteForge handles employee/courier personal data, shift times, GPS start/stop locations, proof photos, signatures, payslips, contracts and private documents. Treat this as sensitive operational data from day one.

---

## Core Principles

```txt
Tenant isolation first
Least privilege always
Private storage by default
No unnecessary data collection
No live tracking in v1
Audit sensitive changes
Delete temporary proof photos after 14 days
Keep payroll/documents private and controlled
```

---

## Data Categories

### Company Data

Examples:

- company name
- depots
- addresses
- geofence settings
- company stamp PNG
- company settings

Protection:

- company-scoped through `company_id`
- admin full access inside company
- dispatcher limited by depot scope
- no cross-company access

### Courier Profile Data

Examples:

- full name
- email
- phone
- address
- birth date
- payment mode
- depot assignment
- profile status

Protection:

- courier sees own profile only
- admin sees company couriers
- dispatcher sees allowed depot couriers only

### Sensitive Courier Data

Examples:

- Steuer-ID
- IBAN
- identity documents
- driving license documents
- contracts
- payslips
- signatures

Protection:

- private storage only
- signed/authenticated downloads
- restricted UI display
- avoid showing in tables unless necessary
- audit access-changing actions

### Shift Data

Examples:

- start/end time
- break minutes
- billable minutes
- payment mode snapshot
- daily report values
- approval status
- corrections and reasons

Protection:

- courier sees own shifts only
- admin sees company shifts
- dispatcher sees assigned depot shifts only
- submitted/approved data is protected from courier editing
- daily report submission is server-authoritative through `submit_courier_shift_report(...)`
- report signatures are private `generated-pdfs` objects and are not part of the 14-day proof-photo cleanup
- report signature artifact metadata is exposed only through `get_shift_signature_artifact(...)` after shift/company/depot scope and private storage-object checks pass

### Location Data

RouteForge v1 collects only:

```txt
start location
stop location
```

Not collected in v1:

```txt
live route tracking
background movement trail
continuous GPS history
customer tracking link
```

Protection:

- store only what is needed for depot geofence verification
- store GPS accuracy
- show warnings only to authorized admin/dispatcher users
- do not expose precise GPS data beyond operational need

### Shift Proof Photos

Examples:

- start km photo
- end km photo
- Fahrtenbuch photo
- Mentor screenshot

Protection:

- private storage
- linked to shift/company
- compressed before upload
- metadata is accepted only after the uploaded private storage object is verified
- retained for 14 days
- deleted after retention period
- metadata can remain for audit if needed, but file should be removed
- daily report submit requires all required proof-photo metadata rows, or an explicit missing-proof explanation when a required photo is genuinely unavailable

### Documents, Payslips and Contracts

Protection:

- private storage
- not part of 14-day proof-photo cleanup
- accessible only by authorized role/scope
- signed/authenticated download
- upload creates audit log

---

## GDPR / DSGVO Rules

### Data Minimization

Collect only data needed for courier operations, payroll preparation, shift verification and document delivery.

Do not collect:

- continuous GPS route trails
- unnecessary customer data
- unnecessary private courier data
- analytics identifiers unless explicitly approved later
- biometric assumptions from signatures or photos

### Purpose Limitation

Use data only for:

- shift tracking
- daily reports
- payroll-ready exports
- document delivery
- operational proof
- access control
- audit history

Do not reuse operational data for unrelated profiling.

### Storage Limitation

Retention rules:

| Data | Retention |
| ---- | --------- |
| Shift proof photos | 14 days, then delete files |
| Shift metadata | Keep for operational/payroll/legal record needs |
| Payslips | Keep as company employment/payroll documents |
| Contracts | Keep as employment/company documents |
| Mailbox metadata | Keep while relevant to document history |
| Audit logs | Keep for accountability and dispute handling |
| Invite codes | Expire and/or revoke; do not keep active forever |

The 14-day cleanup applies to `shift-photos` only. It must not delete payslips, contracts, courier documents or generated PDFs.

### Transparency

UI and documentation should make clear:

- why start/stop location is captured
- that live tracking is not used in v1
- which documents couriers can access
- which data is used for payroll-ready reports
- that submitted reports become locked

### Access Rights

Build with the expectation that a courier may request access to their own data.

Courier-facing app should already expose:

- own profile
- own shifts
- own history
- own mailbox items
- own PDFs/documents

Admin export/delete workflows can be added later if needed, but should not be improvised without review.

---

## Authentication and Sessions

Rules:

- Use InsForge Auth
- Protect admin routes with middleware/server checks
- Protect mobile routes with route guards
- New courier profile starts as `pending_approval`
- Pending courier cannot start shifts
- Inactive/suspended users cannot perform operational actions
- Never store service-role secrets in mobile or browser code

---

## Authorization

Real authorization must happen in:

```txt
server-side checks
InsForge RLS policies
private storage policies
```

UI checks are not enough.

Every protected query/mutation must verify:

- authenticated user
- active profile where needed
- same company
- role permission
- dispatcher depot scope
- courier self-only scope

---

## Storage Security

Buckets:

```txt
courier-documents
shift-photos
payslips
generated-pdfs
company-assets
```

Rules:

- Buckets containing personal or payroll data are private
- Use signed URLs or authenticated download endpoints
- Storage paths must include `company_id`
- Courier file paths must include courier/profile scope where relevant
- Never use public URLs for payslips, contracts, IDs, licenses or signatures
- Company stamp PNG can be read only by authorized company users and PDF generation logic

---

## Audit Logging

Audit logs are required for actions that affect money, access, legal records or documents.

Required examples:

- approving courier
- changing profile status
- granting/revoking dispatcher depot access
- approving shift
- rejecting shift
- correcting shift
- overriding billable time
- uploading document
- revoking invitation
- generating accountant export

Audit logs must not be editable from client-side code.

---

## PDF Security

PDFs may include sensitive information.

Rules:

- Generated PDFs must be company-scoped
- Daily PDFs include only authorized shift/courier data
- Monthly PDFs include only authorized courier/month data
- Company stamp PNG may be included
- Downloads must be authenticated or signed
- Do not create public PDF links by default

---

## Export Security

Accountant exports contain payroll-relevant data.

Rules:

- Export approved shifts only unless explicitly building draft preview
- Export generation requires admin permission by default
- Dispatcher export, if added, must be depot-scoped
- Export action should create audit log
- Export does not execute bank transfer or tax calculation

---

## Frontend Safety

Admin and mobile UI must never show:

- raw database errors
- stack traces
- secret keys
- RLS policy details to end users
- other couriers' private data
- sensitive fields in unnecessary places

Use friendly German messages and log technical details server-side where appropriate.

---

## Forbidden in v1

Do not add:

- live GPS tracking
- continuous background tracking
- public tracking pages
- public document URLs
- AI automation features
- external job search APIs
- browser automation tooling
- analytics provider integrations
- bank transfer automation
- tax calculation
- SaaS billing console

RouteForge v1 must focus on the core courier operations workflow first.
