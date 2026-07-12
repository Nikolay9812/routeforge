# Data Model

Canonical RouteForge data model for shared types, InsForge Postgres tables, Zod schemas, RLS policies and UI mock data.

RouteForge is multi-tenant from v1. Every operational record must be scoped by `company_id` unless it is a pure local UI helper.

---

## Core Invariants

These rules must not be broken:

- Every company has its own workspace
- Every depot belongs to one company
- Every profile belongs to one company
- A user role is one of `admin`, `dispatcher`, `courier`
- Dispatcher access is restricted by assigned depots
- Courier sees only own profile, shifts, mailbox, documents and PDFs
- Courier registration requires email invite code
- New courier starts as `pending_approval`
- One courier has only one shift per day in v1
- Shift start/stop GPS only, no live tracking
- Hourly billable time is capped at 600 minutes / 10:00h
- Daily fixed billable default is 500 minutes / 8:20h
- Billable overrides require a reason
- Corrections and overrides write audit logs
- Shift proof photos are retained 14 days, then files are deleted
- Payslips/contracts/documents are private and not part of 14-day photo cleanup
- PDFs support company stamp PNG
- German is default UI language
- Bulgarian is optional through translation keys

---

## Shared Type Names

Create these in `packages/shared/src/types.ts`:

```ts
export type UUID = string;

export type UserRole = "admin" | "dispatcher" | "courier";
export type ProfileStatus = "pending_approval" | "active" | "inactive" | "suspended";
export type PaymentMode = "hourly" | "daily_fixed";
export type ShiftStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "corrected";
export type BillableSource = "auto" | "manual_override";
export type InvitationStatus = "active" | "used" | "expired" | "revoked";
export type ShiftLocationType = "start" | "stop";
export type ShiftPhotoType = "start_km" | "end_km" | "fahrtenbuch" | "mentor";
export type DocumentType = "payslip" | "contract" | "instruction" | "notice" | "other";
export type MailboxCategory = "document" | "payslip" | "contract" | "notice";
export type SupportedLanguage = "de" | "bg";
```

---

## Entity Relationship Overview

```txt
companies
  ├── depots
  ├── profiles
  │     ├── profile_depot_access
  │     ├── shifts
  │     │     ├── shift_locations
  │     │     └── shift_photos
  │     ├── documents
  │     └── mailbox_items
  ├── invitations
  └── audit_logs
```

---

## Tables

### companies

Company workspace / tenant.

| Column | Type | Notes |
| ------ | ---- | ----- |
| id | uuid | Primary key |
| name | text | Company display name |
| slug | text | Unique slug |
| country_code | text | Default `DE` |
| default_language | text | Default `de` |
| logo_url | text | Optional company logo |
| stamp_url | text | Optional company stamp PNG for PDFs |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |

Rules:

- Company is tenant boundary
- No user can access another company
- Company stamp PNG is used in generated PDFs

---

### depots

Operational location / warehouse / delivery base.

| Column | Type | Notes |
| ------ | ---- | ----- |
| id | uuid | Primary key |
| company_id | uuid | References companies |
| name | text | Depot display name |
| code | text | Example: `HBW3` |
| address_line_1 | text | Street/address |
| postal_code | text |  |
| city | text |  |
| country_code | text | Default `DE` |
| latitude | numeric | Depot latitude |
| longitude | numeric | Depot longitude |
| geofence_radius_meters | integer | Allowed start/stop radius |
| is_active | boolean |  |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |

Rules:

- Depot belongs to company
- Dispatcher access is assigned per depot
- Start/stop geofence checks compare courier GPS to depot coordinates

---

### profiles

Application profile for admin, dispatcher or courier.

| Column | Type | Notes |
| ------ | ---- | ----- |
| id | uuid | Primary key |
| auth_user_id | uuid | References InsForge auth user |
| company_id | uuid | References companies |
| primary_depot_id | uuid | References depots, nullable |
| role | text | `admin` / `dispatcher` / `courier` |
| status | text | `pending_approval` / `active` / `inactive` / `suspended` |
| payment_mode | text | `hourly` / `daily_fixed`, courier-focused |
| daily_fixed_minutes | integer | Default 500 |
| hourly_max_minutes | integer | Default 600 |
| preferred_language | text | `de` / `bg` |
| full_name | text |  |
| email | text |  |
| phone | text | Optional |
| birth_date | date | Optional |
| address_line_1 | text | Optional |
| postal_code | text | Optional |
| city | text | Optional |
| steuer_id | text | Sensitive, optional |
| iban | text | Sensitive, optional |
| id_card_document_url | text | Private storage reference |
| driver_license_document_url | text | Private storage reference |
| registration_document_url | text | Private storage reference |
| bank_document_url | text | Private storage reference |
| approved_at | timestamptz | Nullable |
| approved_by | uuid | References profiles |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |

Rules:

- New courier from invite starts as `pending_approval`
- Only active courier can start shifts
- Sensitive fields must not be exposed in general tables

---

### profile_depot_access

Dispatcher depot access mapping.

| Column | Type | Notes |
| ------ | ---- | ----- |
| id | uuid | Primary key |
| company_id | uuid | References companies |
| profile_id | uuid | Dispatcher profile |
| depot_id | uuid | Allowed depot |
| created_by | uuid | Admin profile who granted access |
| created_at | timestamptz |  |

Rules:

- Used only for dispatcher scope
- Admin is company-wide and does not need records here
- Grant/revoke writes audit log

---

### invitations

Email invite code flow.

| Column | Type | Notes |
| ------ | ---- | ----- |
| id | uuid | Primary key |
| company_id | uuid | References companies |
| email | text | Invited email |
| role | text | `dispatcher` / `courier` |
| invite_code | text | One-time code |
| depot_id | uuid | Optional default depot |
| status | text | `active` / `used` / `expired` / `revoked` |
| expires_at | timestamptz | Recommended 7 days after creation |
| used_at | timestamptz | Nullable |
| used_by | uuid | Auth/profile reference |
| created_by | uuid | Profile that created invite |
| created_at | timestamptz |  |

Rules:

- Invite code is required for courier registration
- One-time use only
- Used/revoked/expired invites cannot create profiles

---

### shifts

Courier daily shift and report record.

| Column | Type | Notes |
| ------ | ---- | ----- |
| id | uuid | Primary key |
| company_id | uuid | References companies |
| depot_id | uuid | References depots |
| courier_profile_id | uuid | References profiles |
| shift_date | date | One shift per courier per day in v1 |
| start_time | timestamptz |  |
| end_time | timestamptz | Nullable until ended |
| gross_minutes | integer | Real time before break |
| break_minutes | integer | Legal/auto/manual break |
| net_minutes | integer | Gross minus break |
| billable_minutes | integer | Payroll-relevant minutes |
| billable_source | text | `auto` / `manual_override` |
| billable_override_reason | text | Required for override |
| billable_override_by | uuid | References profiles |
| billable_override_at | timestamptz | Nullable |
| auto_stopped_at_max_hours | boolean | True when hourly timer stops at 10h |
| payment_mode_snapshot | text | Payment mode at time of shift |
| tour_number | text | Courier-entered daily tour number |
| van_plate | text | Vehicle plate |
| start_km | integer |  |
| end_km | integer |  |
| packages_delivered | integer | Delivered packages |
| packages_returned | integer | Returns |
| packages_picked_up | integer | Abholungen |
| total_stops | integer | Optional |
| courier_note | text | Optional |
| missing_proof_explanation | text | Required when required proof-photo metadata rows are absent at submit |
| signature_url | text | Private storage reference |
| signature_storage_key | text | Private storage key, deterministic daily signature path |
| signed_at | timestamptz |  |
| status | text | Shift status |
| submitted_at | timestamptz | Nullable |
| approved_at | timestamptz | Nullable |
| approved_by | uuid | References profiles |
| rejection_reason | text | Required for rejected shift |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |

Rules:

- Unique constraint: `(company_id, courier_profile_id, shift_date)`
- Courier can edit only own draft shift/report
- Submitted shift is locked for courier
- Courier daily report submission happens through `submit_courier_shift_report(...)`, not direct table update
- Signature path for submission is `generated-pdfs/companies/{company_id}/reports/{shift_id}/signature.svg`
- Persisted signature artifact metadata is resolved through `get_shift_signature_artifact(...)`, which verifies shift access, deterministic storage path and the private `generated-pdfs` object before returning review/PDF metadata
- Required proof photo metadata types are `start_km`, `end_km`, `fahrtenbuch` and `mentor`; before RF-BE-009 missing rows require `missing_proof_explanation`
- Admin shift approval/rejection/correction happens through `approve_admin_shift(...)`, `reject_admin_shift(...)` and `correct_admin_shift(...)`; direct authenticated shift updates remain closed after the backend integration phases
- Admin correction requires a reason and recalculates gross, break, net and billable minutes server-side
- Admin/dispatcher can correct only with reason
- Billable override writes audit log

---

### shift_locations

Start/stop GPS capture.

| Column | Type | Notes |
| ------ | ---- | ----- |
| id | uuid | Primary key |
| company_id | uuid | References companies |
| shift_id | uuid | References shifts |
| location_type | text | `start` / `stop` |
| latitude | numeric | Courier GPS latitude |
| longitude | numeric | Courier GPS longitude |
| accuracy_meters | numeric | GPS accuracy |
| depot_latitude_snapshot | numeric | Depot latitude at check time |
| depot_longitude_snapshot | numeric | Depot longitude at check time |
| distance_from_depot_meters | numeric | Computed distance |
| is_inside_depot_geofence | boolean | False creates warning |
| created_at | timestamptz |  |

Rules:

- Store start and stop only
- No live route tracking
- Outside geofence warnings shown to admin/dispatcher

---

### shift_photos

Temporary proof photos.

| Column | Type | Notes |
| ------ | ---- | ----- |
| id | uuid | Primary key |
| company_id | uuid | References companies |
| shift_id | uuid | References shifts |
| photo_type | text | `start_km` / `end_km` / `fahrtenbuch` / `mentor` |
| storage_bucket | text | `shift-photos` |
| storage_path | text | Private file path |
| mime_type | text |  |
| size_bytes | integer |  |
| compressed | boolean | True after mobile compression |
| uploaded_by | uuid | References profiles |
| uploaded_at | timestamptz |  |
| expires_at | timestamptz | `uploaded_at + 14 days` |
| deleted_at | timestamptz | Nullable after cleanup |

Rules:

- Files are deleted after 14 days
- Metadata can keep `deleted_at` for audit/history
- Do not mix with payslips/contracts/documents
- Courier metadata writes happen through `save_shift_photo_metadata(...)`, which verifies the private storage object before inserting `shift_photos`
- Direct authenticated `INSERT` on `shift_photos` is not part of the mobile write path after RF-BE-009

---

### documents

Private documents, payslips, contracts and generated document metadata.

| Column | Type | Notes |
| ------ | ---- | ----- |
| id | uuid | Primary key |
| company_id | uuid | References companies |
| courier_profile_id | uuid | Target courier, nullable for company-wide docs |
| uploaded_by | uuid | References profiles |
| document_type | text | `payslip` / `contract` / `instruction` / `notice` / `other` |
| title | text | Display name |
| storage_bucket | text | `payslips` / `courier-documents` / `generated-pdfs` |
| storage_path | text | Private file path |
| mime_type | text |  |
| size_bytes | integer |  |
| created_at | timestamptz |  |

Rules:

- Documents are private
- Not deleted by 14-day proof photo cleanup
- Admin document upload is registered through `create_courier_document_mailbox_item(...)`, which verifies the private storage object before inserting metadata
- Upload can create mailbox item
- Document download access is resolved through `get_document_download_access(...)` before private storage download

---

### mailbox_items

Courier digital mailbox.

| Column | Type | Notes |
| ------ | ---- | ----- |
| id | uuid | Primary key |
| company_id | uuid | References companies |
| courier_profile_id | uuid | Target courier |
| document_id | uuid | References documents, nullable |
| title | text | Mailbox title |
| message | text | Optional message |
| category | text | `document` / `payslip` / `contract` / `notice` |
| read_at | timestamptz | Nullable |
| created_by | uuid | References profiles |
| created_at | timestamptz |  |

Rules:

- Courier sees own mailbox only
- Unread state is based on `read_at is null`
- Courier read state is persisted through `mark_mailbox_item_read(...)`

---

### audit_logs

Sensitive action history.

| Column | Type | Notes |
| ------ | ---- | ----- |
| id | uuid | Primary key |
| company_id | uuid | References companies |
| actor_profile_id | uuid | Who performed the action |
| target_table | text | Affected table |
| target_id | uuid | Affected record |
| action | text | Action name |
| before | jsonb | Previous values |
| after | jsonb | New values |
| reason | text | Required for sensitive changes |
| created_at | timestamptz |  |

Rules:

- Required for corrections, overrides and access changes
- Client-side code must not update audit logs directly
- Use append-only behavior

---

## Storage Buckets

| Bucket | Purpose | Retention |
| ------ | ------- | --------- |
| courier-documents | ID, license, registration, other private courier docs | Keep as private documents |
| shift-photos | Temporary daily proof photos | Delete files after 14 days |
| payslips | Payroll PDFs | Keep as private payroll documents |
| generated-pdfs | Daily/monthly generated reports | Keep as private generated reports |
| company-assets | Company logo and stamp PNG | Keep while company uses them |

---

## Recommended Indexes and Constraints

```txt
companies.slug unique
profiles.auth_user_id unique
profiles.company_id index
profiles.company_id + role index
profiles.company_id + status index
depots.company_id + code unique
profile_depot_access.company_id + profile_id + depot_id unique
invitations.company_id + invite_code unique
shifts.company_id + courier_profile_id + shift_date unique
shifts.company_id + depot_id + shift_date index
shifts.company_id + status index
shift_locations.company_id + shift_id + location_type index
shift_photos.company_id + shift_id index
shift_photos.expires_at index
documents.company_id + courier_profile_id index
mailbox_items.company_id + courier_profile_id + read_at index
audit_logs.company_id + created_at index
```

---

## Validation Rules

Shared Zod schemas should validate:

- role enum
- profile status enum
- payment mode enum
- shift status enum
- package counters are non-negative integers
- end km must be greater than or equal to start km
- end time must be after start time
- billable override reason is required when source is `manual_override`
- rejection reason is required for rejected shift
- invite code format
- document type enum
- language enum

---

## Mock Data Rules

UI-first mock data must follow this data model.

Mock data should include:

- one company
- at least two depots
- one admin
- one dispatcher with limited depot access
- multiple couriers
- one `pending_approval` courier
- hourly and daily fixed couriers
- shifts in draft/submitted/approved/rejected states
- one outside-geofence warning
- one unread mailbox item
- one payslip/document example

Do not create mock fields that are not planned in this model unless `context/data-model.md` is updated first.
