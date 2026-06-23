# Architecture

## Stack

| Layer                          | Tool / Library                              | Purpose                                                       |
| ------------------------------ | ------------------------------------------- | ------------------------------------------------------------- |
| Monorepo                       | npm workspaces + Turborepo                  | One repository for mobile app, admin panel and shared logic    |
| Mobile framework               | Expo + React Native                         | Courier mobile application                                    |
| Mobile routing                 | Expo Router                                 | File-based navigation for the mobile app                      |
| Mobile styling                 | NativeWind                                  | Tailwind-style styling for React Native                       |
| Admin framework                | Next.js App Router + TypeScript             | Web admin panel and server-side functionality                  |
| Admin styling                  | Tailwind CSS + shadcn/ui                    | Admin UI components and styling                               |
| Shared package                 | TypeScript package                          | Shared types, schemas, permissions, payroll and constants      |
| Auth + DB + Storage            | InsForge                                    | Backend, authentication, Postgres database, storage and RLS    |
| Database                       | InsForge Postgres                           | Relational data model with multi-tenant company isolation      |
| Security                       | InsForge Row Level Security                 | Tenant isolation and role-based access control                 |
| Storage                        | InsForge Storage                            | Private files, shift photos, payslips, documents and PDFs      |
| Validation                     | Zod                                         | Shared validation schemas for mobile, admin and backend        |
| Mobile local storage           | AsyncStorage                                | Offline drafts, active shift state and sync queue              |
| Mobile image handling          | expo-image-picker + expo-image-manipulator  | Capture, preview and compress photos before upload             |
| Mobile location                | expo-location                               | Start/stop GPS location capture and geofence verification      |
| Signature capture              | React Native signature component            | Courier signature on daily reports                            |
| PDF generation                 | @react-pdf/renderer                         | Daily reports, monthly reports and printable documents         |
| Export generation              | XLSX / CSV library                          | Accountant exports for approved shifts                        |
| Language                       | TypeScript strict                           | Throughout the monorepo                                       |

---

## Folder Structure

```
/
├── AGENTS.md
├── memory.md
├── package.json
├── turbo.json
├── tsconfig.base.json
├── .gitignore
├── .codex/
│   └── skills/
│       ├── architect.md                  → Feature planning workflow
│       ├── remember.md                   → Save/restore project memory
│       ├── review.md                     → Feature review workflow
│       ├── recover.md                    → Error recovery workflow
│       └── imprint.md                    → UI registry update workflow
├── context/
│   ├── project-overview.md
│   ├── architecture.md
│   ├── data-model.md
│   ├── permissions.md
│   ├── ui-tokens.md
│   ├── ui-rules.md
│   ├── mobile-rules.md
│   ├── admin-rules.md
│   ├── ui-registry.md
│   ├── code-standards.md
│   ├── library-docs.md
│   ├── build-plan.md
│   ├── codex-workflow.md
│   ├── progress-tracker.md
│   ├── security-gdpr.md
│   └── designs/
│       ├── README.md                    → Design reference rules for Codex
│       ├── mobile/                      → Approved mobile screenshots when available
│       └── admin/                       → Approved admin screenshots when available
├── apps/
│   ├── mobile/
│   │   ├── app/
│   │   │   ├── _layout.tsx               → Mobile root layout and providers
│   │   │   ├── index.tsx                 → Redirect to Home or Login
│   │   │   ├── login.tsx                 → Courier login
│   │   │   ├── invite.tsx                → Email invite code registration
│   │   │   ├── (tabs)/
│   │   │   │   ├── _layout.tsx           → Bottom tab navigation
│   │   │   │   ├── home.tsx              → Current shift screen
│   │   │   │   ├── history.tsx           → Monthly calendar and worked days
│   │   │   │   ├── report.tsx            → Daily report form
│   │   │   │   ├── mailbox.tsx           → Digital mailbox
│   │   │   │   └── profile.tsx           → Courier profile and documents
│   │   │   ├── history/
│   │   │   │   └── [date].tsx            → Detailed day report
│   │   │   └── mailbox/
│   │   │       └── [id].tsx              → Mailbox item details
│   │   ├── components/
│   │   │   ├── ui/                       → Mobile UI primitives
│   │   │   ├── layout/                   → Header, tab helpers, screen wrappers
│   │   │   ├── shift/                    → Timer, current shift cards, counters
│   │   │   ├── report/                   → Daily report form components
│   │   │   ├── history/                  → Calendar and day detail components
│   │   │   ├── mailbox/                  → Mailbox list and document cards
│   │   │   └── profile/                  → Profile and document status components
│   │   ├── features/
│   │   │   ├── auth/                     → Mobile auth state and invite flow
│   │   │   ├── shifts/                   → Shift local state and sync logic
│   │   │   ├── reports/                  → Report form state and validation
│   │   │   ├── photos/                   → Camera, image picker and compression
│   │   │   ├── location/                 → Start/stop location capture
│   │   │   ├── mailbox/                  → Mailbox data access
│   │   │   └── offline/                  → AsyncStorage queue and sync status
│   │   ├── lib/
│   │   │   ├── insforge-client.ts        → Mobile/browser-safe InsForge client
│   │   │   ├── storage.ts                → Local storage helpers
│   │   │   ├── image.ts                  → Image compression helpers
│   │   │   ├── location.ts               → Location helpers
│   │   │   └── utils.ts                  → Mobile utilities
│   │   ├── assets/
│   │   │   ├── icon.png
│   │   │   ├── splash.png
│   │   │   └── images/
│   │   ├── nativewind.config.ts
│   │   ├── tailwind.config.js
│   │   └── package.json
│   └── admin/
│       ├── app/
│       │   ├── layout.tsx                → Admin root layout and providers
│       │   ├── page.tsx                  → Redirect to /admin/dashboard
│       │   ├── login/
│       │   │   └── page.tsx              → Admin / dispatcher login
│       │   ├── admin/
│       │   │   ├── layout.tsx            → Protected admin shell
│       │   │   ├── dashboard/
│       │   │   │   └── page.tsx          → Dashboard overview
│       │   │   ├── shifts/
│       │   │   │   ├── page.tsx          → Shift management table
│       │   │   │   └── [id]/
│       │   │   │       └── page.tsx      → Shift review details
│       │   │   ├── couriers/
│       │   │   │   ├── page.tsx          → Couriers list
│       │   │   │   └── [id]/
│       │   │   │       └── page.tsx      → Courier profile admin view
│       │   │   ├── dispatchers/
│       │   │   │   └── page.tsx          → Dispatcher management
│       │   │   ├── depots/
│       │   │   │   └── page.tsx          → Depot and geofence settings
│       │   │   ├── documents/
│       │   │   │   └── page.tsx          → Upload documents and payslips
│       │   │   ├── invitations/
│       │   │   │   └── page.tsx          → Email invite code management
│       │   │   ├── exports/
│       │   │   │   └── page.tsx          → Accountant CSV/XLSX export
│       │   │   ├── audit-logs/
│       │   │   │   └── page.tsx          → Sensitive action history
│       │   │   └── settings/
│       │   │       └── page.tsx          → Company settings
│       │   └── api/
│       │       ├── shifts/
│       │       │   ├── approve/route.ts  → Approve shift
│       │       │   ├── reject/route.ts   → Reject shift with reason
│       │       │   └── correct/route.ts  → Correct shift with audit reason
│       │       ├── documents/
│       │       │   ├── upload/route.ts   → Upload private documents
│       │       │   └── signed-url/route.ts → Create signed download URL
│       │       ├── exports/
│       │       │   └── accountant/route.ts → Generate accountant export
│       │       └── pdf/
│       │           ├── daily/route.ts    → Generate daily report PDF
│       │           └── monthly/route.ts  → Generate monthly report PDF
│       ├── actions/
│       │   ├── auth.ts                   → Login/logout/session helpers
│       │   ├── couriers.ts               → Courier profile mutations
│       │   ├── dispatchers.ts            → Dispatcher management mutations
│       │   ├── depots.ts                 → Depot and geofence mutations
│       │   ├── shifts.ts                 → Shift review, approve, reject, correct
│       │   ├── documents.ts              → Document metadata and mailbox creation
│       │   ├── invitations.ts            → Invite code creation and revocation
│       │   └── exports.ts                → Export trigger helpers
│       ├── components/
│       │   ├── ui/                       → shadcn/ui components only
│       │   ├── layout/
│       │   │   ├── Sidebar.tsx
│       │   │   ├── Topbar.tsx
│       │   │   └── CompanySwitcher.tsx
│       │   ├── dashboard/
│       │   ├── shifts/
│       │   ├── couriers/
│       │   ├── dispatchers/
│       │   ├── depots/
│       │   ├── documents/
│       │   ├── invitations/
│       │   ├── exports/
│       │   └── audit-logs/
│       ├── lib/
│       │   ├── insforge-client.ts        → Browser-side InsForge client
│       │   ├── insforge-server.ts        → Server-side InsForge client
│       │   ├── auth.ts                   → Server-side auth/profile helpers
│       │   ├── rls.ts                    → Server-side scope helpers
│       │   ├── pdf.ts                    → PDF generation helpers
│       │   ├── export.ts                 → CSV/XLSX generation helpers
│       │   ├── storage.ts                → Signed URL and upload helpers
│       │   └── utils.ts                  → Admin utilities
│       ├── public/
│       │   ├── logo.png
│       │   ├── images/
│       │   └── stamps/
│       ├── middleware.ts                 → Protected admin route checks
│       └── package.json
├── packages/
│   └── shared/
│       ├── package.json
│       └── src/
│           ├── index.ts                  → Public exports
│           ├── types.ts                  → Shared TypeScript types
│           ├── roles.ts                  → Role constants
│           ├── permissions.ts            → Role and depot-scope permission helpers
│           ├── payroll.ts                → Break, net time and billable time logic
│           ├── shifts.ts                 → Shift status transition helpers
│           ├── constants/
│           ├── schemas/
│           └── translations/
├── insforge/
│   ├── migrations/
│   └── seeds/
└── docs/
    ├── README.md
    ├── decisions/
    ├── accountant-export-spec.md
    ├── pdf-report-spec.md
    └── deployment-checklist.md
```

---

## System Boundaries

| Folder / Package          | Owns                                                                                                      |
| ------------------------- | --------------------------------------------------------------------------------------------------------- |
| `apps/mobile/app/`        | Mobile screens and navigation only. No backend schema logic.                                               |
| `apps/mobile/components/` | Mobile UI only. No direct DB mutations.                                                                   |
| `apps/mobile/features/`   | Mobile feature logic such as local shift state, photo compression, location capture and offline queue.     |
| `apps/mobile/lib/`        | Mobile-safe clients and utilities only.                                                                   |
| `apps/admin/app/`         | Admin pages, protected layouts and API routes. No reusable business logic directly in page components.     |
| `apps/admin/actions/`     | Server Actions for UI-triggered admin mutations.                                                          |
| `apps/admin/components/`  | Admin UI only. No direct InsForge queries inside presentational components.                                |
| `apps/admin/lib/`         | Server/browser clients, auth helpers, storage helpers, PDF/export helpers and server-side utilities.       |
| `packages/shared/`        | Shared types, Zod schemas, permissions, payroll, shift transitions, constants and translations.            |
| `insforge/`               | SQL migrations, RLS policies, storage policies and seed data.                                             |
| `context/`                | Project memory, implementation rules, build plan, design references and Codex workflow.                    |
| `docs/`                   | Long-form technical documentation, ADRs, export specs, PDF specs and deployment checklists.                |

---

## Data Flow

### Mobile Shift Start

```
Courier taps Start Shift
        ↓
Mobile app captures current timestamp
        ↓
Mobile app requests current GPS location
        ↓
Local draft state is saved in AsyncStorage
        ↓
Backend creates shift draft in InsForge
        ↓
Start location is saved in shift_locations
        ↓
Mobile timer starts from stored start_time
```

### Mobile Shift End

```
Courier taps End Shift
        ↓
Mobile app captures end timestamp
        ↓
Mobile app captures stop GPS location
        ↓
Shared payroll logic calculates gross, break, net and billable time
        ↓
Shift draft is updated locally
        ↓
Backend updates shifts table
        ↓
Stop location is saved in shift_locations
        ↓
If hourly courier reaches 10:00 hours, timer is auto-stopped and flagged
```

### Daily Report Submission

```
Courier fills daily report
        ↓
Zod schema validates required fields
        ↓
Photos are compressed on device
        ↓
Photos are uploaded to InsForge Storage
        ↓
Photo metadata is saved in shift_photos
        ↓
Courier signs report
        ↓
Signature is stored
        ↓
Shift status changes from draft to submitted
        ↓
Submitted shift becomes locked for courier
        ↓
Admin/dispatcher sees shift in review queue
```

### Offline Draft Sync

```
Courier has no connection
        ↓
Report changes are stored in AsyncStorage
        ↓
Draft is marked as unsynced
        ↓
Connection returns
        ↓
Sync queue sends pending changes to backend
        ↓
Backend validates and saves data
        ↓
Draft is marked as synced
```

### Admin Shift Review

```
Admin/dispatcher opens Schichten
        ↓
Server checks role and depot scope
        ↓
InsForge query fetches only allowed company/depot shifts
        ↓
Admin selects shift
        ↓
Shift details, photos, GPS warnings and payroll data are displayed
        ↓
Admin approves, rejects or corrects
        ↓
Server Action validates permission and reason if needed
        ↓
Shift is updated in InsForge
        ↓
audit_logs entry is created
        ↓
UI revalidates shift list
```

### Dispatcher Depot Scope

```
Admin opens Dispatcher management
        ↓
Admin selects dispatcher
        ↓
Admin assigns one, multiple or all depots
        ↓
profile_depot_access records are updated
        ↓
Dispatcher queries are filtered by assigned depot scope
```

### Invitation Flow

```
Admin/dispatcher creates invitation
        ↓
Invitation stores email, role, company and expiry date
        ↓
Courier opens app and enters invite code
        ↓
Backend validates invite is active, unused and not expired
        ↓
Profile is created as pending_approval
        ↓
Invite is marked as used
        ↓
Admin/dispatcher approves courier before full access
```

### Document Upload

```
Admin/dispatcher uploads PDF or document
        ↓
Server validates role and target courier scope
        ↓
File is uploaded to private InsForge Storage
        ↓
Document metadata is saved in documents table
        ↓
Mailbox item is created for courier
        ↓
Courier sees unread item in Postfach
```

### PDF Generation

```
Courier or admin requests daily/monthly PDF
        ↓
Server validates access
        ↓
Shift/profile/company data is fetched from InsForge
        ↓
@react-pdf/renderer renders PDF
        ↓
Company stamp PNG is added if configured
        ↓
PDF is stored in generated-pdfs bucket or streamed for download
```

### Accountant Export

```
Admin opens Exporte
        ↓
Admin selects month and filters
        ↓
Server fetches approved shifts only
        ↓
Export logic formats real time and billable time
        ↓
CSV/XLSX file is generated
        ↓
Admin downloads export file
```

---

## InsForge Database Schema

### `companies`

| Column           | Type        | Notes                                        |
| ---------------- | ----------- | -------------------------------------------- |
| id               | uuid        | Primary key                                  |
| name             | text        | Company display name, e.g. Ivanov Transport  |
| slug             | text        | Unique company slug                          |
| country_code     | text        | Default `DE`                                 |
| default_language | text        | Default `de`                                 |
| logo_url         | text        | Optional company logo                        |
| stamp_url        | text        | Optional company stamp PNG for PDFs          |
| created_at       | timestamptz |                                              |
| updated_at       | timestamptz |                                              |

### `depots`

| Column                 | Type        | Notes                         |
| ---------------------- | ----------- | ----------------------------- |
| id                     | uuid        | Primary key                   |
| company_id             | uuid        | References companies          |
| name                   | text        | Depot display name            |
| code                   | text        | Example: HBW3                 |
| address_line_1         | text        | Depot street                  |
| postal_code            | text        |                               |
| city                   | text        |                               |
| country_code           | text        | Default `DE`                  |
| latitude               | numeric     | Depot latitude                |
| longitude              | numeric     | Depot longitude               |
| geofence_radius_meters | integer     | Allowed start/stop radius     |
| is_active              | boolean     |                               |
| created_at             | timestamptz |                               |
| updated_at             | timestamptz |                               |

### `profiles`

| Column                      | Type        | Notes                                            |
| --------------------------- | ----------- | ------------------------------------------------ |
| id                          | uuid        | Primary key                                      |
| auth_user_id                | uuid        | References InsForge auth user                    |
| company_id                  | uuid        | References companies                             |
| primary_depot_id            | uuid        | References depots, nullable                      |
| role                        | text        | admin / dispatcher / courier                     |
| status                      | text        | pending_approval / active / inactive / suspended |
| payment_mode                | text        | hourly / daily_fixed                             |
| daily_fixed_minutes         | integer     | Default 500 = 8:20                               |
| hourly_max_minutes          | integer     | Default 600 = 10:00                              |
| preferred_language          | text        | de / bg                                          |
| full_name                   | text        |                                                  |
| email                       | text        |                                                  |
| phone                       | text        |                                                  |
| birth_date                  | date        | Optional                                         |
| address_line_1              | text        | Optional                                         |
| postal_code                 | text        | Optional                                         |
| city                        | text        | Optional                                         |
| steuer_id                   | text        | Sensitive, optional                              |
| iban                        | text        | Sensitive, optional                              |
| id_card_document_url        | text        | Private storage reference                        |
| driver_license_document_url | text        | Private storage reference                        |
| registration_document_url   | text        | Private storage reference                        |
| bank_document_url           | text        | Private storage reference                        |
| approved_at                 | timestamptz | Nullable                                         |
| approved_by                 | uuid        | References profiles                              |
| created_at                  | timestamptz |                                                  |
| updated_at                  | timestamptz |                                                  |

### `profile_depot_access`

| Column     | Type        | Notes                             |
| ---------- | ----------- | --------------------------------- |
| id         | uuid        | Primary key                       |
| company_id | uuid        | References companies              |
| profile_id | uuid        | References profiles               |
| depot_id   | uuid        | References depots                 |
| created_by | uuid        | Admin profile who granted access  |
| created_at | timestamptz |                                   |

### `invitations`

| Column      | Type        | Notes                             |
| ----------- | ----------- | --------------------------------- |
| id          | uuid        | Primary key                       |
| company_id  | uuid        | References companies              |
| email       | text        | Invited user email                |
| role        | text        | dispatcher / courier              |
| invite_code | text        | One-time invite code              |
| depot_id    | uuid        | Optional default depot            |
| status      | text        | active / used / expired / revoked |
| expires_at  | timestamptz | Recommended 7 days after creation |
| used_at     | timestamptz | Nullable                          |
| used_by     | uuid        | References profiles or auth user  |
| created_by  | uuid        | References profiles               |
| created_at  | timestamptz |                                   |

### `shifts`

| Column                    | Type        | Notes                                               |
| ------------------------- | ----------- | --------------------------------------------------- |
| id                        | uuid        | Primary key                                         |
| company_id                | uuid        | References companies                                |
| depot_id                  | uuid        | References depots                                   |
| courier_profile_id        | uuid        | References profiles                                 |
| shift_date                | date        | One shift per courier per day in version 1          |
| start_time                | timestamptz |                                                     |
| end_time                  | timestamptz | Nullable until shift ends                           |
| gross_minutes             | integer     | Real time before break                              |
| break_minutes             | integer     | Automatic or manual break                           |
| net_minutes               | integer     | Gross minus break                                   |
| billable_minutes          | integer     | Payroll-relevant minutes                            |
| billable_source           | text        | auto / manual_override                              |
| billable_override_reason  | text        | Required for manual override                        |
| billable_override_by      | uuid        | References profiles                                 |
| billable_override_at      | timestamptz | Nullable                                            |
| auto_stopped_at_max_hours | boolean     | True when hourly timer stops at 10:00               |
| payment_mode_snapshot     | text        | hourly / daily_fixed at time of shift               |
| van_plate                 | text        | Vehicle plate                                       |
| start_km                  | integer     |                                                     |
| end_km                    | integer     |                                                     |
| packages_delivered        | integer     | Delivered packages                                  |
| packages_returned         | integer     | Returns                                             |
| packages_picked_up        | integer     | Abholungen                                          |
| total_stops               | integer     | Optional                                            |
| courier_note              | text        | Optional                                            |
| signature_url             | text        | Signature file reference                            |
| signed_at                 | timestamptz |                                                     |
| status                    | text        | draft / submitted / under_review / approved / rejected / corrected |
| submitted_at              | timestamptz | Nullable                                            |
| approved_at               | timestamptz | Nullable                                            |
| approved_by               | uuid        | References profiles                                 |
| rejection_reason          | text        | Required for rejected shift                         |
| created_at                | timestamptz |                                                     |
| updated_at                | timestamptz |                                                     |

### `shift_locations`

| Column                     | Type        | Notes                              |
| -------------------------- | ----------- | ---------------------------------- |
| id                         | uuid        | Primary key                        |
| company_id                 | uuid        | References companies               |
| shift_id                   | uuid        | References shifts                  |
| location_type              | text        | start / stop                       |
| latitude                   | numeric     |                                    |
| longitude                  | numeric     |                                    |
| accuracy_meters            | numeric     |                                    |
| depot_latitude_snapshot    | numeric     | Depot coordinates at time of check |
| depot_longitude_snapshot   | numeric     | Depot coordinates at time of check |
| distance_from_depot_meters | numeric     |                                    |
| is_inside_depot_geofence   | boolean     | False creates warning marker       |
| created_at                 | timestamptz |                                    |

### `shift_photos`

| Column         | Type        | Notes                                    |
| -------------- | ----------- | ---------------------------------------- |
| id             | uuid        | Primary key                              |
| company_id     | uuid        | References companies                     |
| shift_id       | uuid        | References shifts                        |
| photo_type     | text        | start_km / end_km / fahrtenbuch / mentor |
| storage_bucket | text        | `shift-photos`                           |
| storage_path   | text        | Private file path                        |
| mime_type      | text        |                                          |
| size_bytes     | integer     |                                          |
| compressed     | boolean     | True after mobile compression            |
| uploaded_by    | uuid        | References profiles                      |
| uploaded_at    | timestamptz |                                          |
| expires_at     | timestamptz | Uploaded at + 14 days                    |
| deleted_at     | timestamptz | Nullable after cleanup                   |

### `documents`

| Column             | Type        | Notes                                               |
| ------------------ | ----------- | --------------------------------------------------- |
| id                 | uuid        | Primary key                                         |
| company_id         | uuid        | References companies                                |
| courier_profile_id | uuid        | Target courier, nullable for company-wide documents |
| uploaded_by        | uuid        | References profiles                                 |
| document_type      | text        | payslip / contract / instruction / notice / other   |
| title              | text        | Display name                                        |
| storage_bucket     | text        | payslips / courier-documents / generated-pdfs       |
| storage_path       | text        | Private file path                                   |
| mime_type          | text        |                                                     |
| size_bytes         | integer     |                                                     |
| created_at         | timestamptz |                                                     |

### `mailbox_items`

| Column             | Type        | Notes                                  |
| ------------------ | ----------- | -------------------------------------- |
| id                 | uuid        | Primary key                            |
| company_id         | uuid        | References companies                   |
| courier_profile_id | uuid        | Target courier                         |
| document_id        | uuid        | References documents, nullable         |
| title              | text        | Mailbox title                          |
| message            | text        | Optional message                       |
| category           | text        | document / payslip / contract / notice |
| read_at            | timestamptz | Nullable                               |
| created_by         | uuid        | References profiles                    |
| created_at         | timestamptz |                                        |

### `audit_logs`

| Column           | Type        | Notes                                      |
| ---------------- | ----------- | ------------------------------------------ |
| id               | uuid        | Primary key                                |
| company_id       | uuid        | References companies                       |
| actor_profile_id | uuid        | Who performed the action                   |
| target_table     | text        | Affected table                             |
| target_id        | uuid        | Affected record                            |
| action           | text        | approve / reject / correct / upload / role_change / depot_access_change |
| before           | jsonb       | Previous values                            |
| after            | jsonb       | New values                                 |
| reason           | text        | Required for sensitive changes             |
| created_at       | timestamptz |                                            |

---

## InsForge Storage

| Bucket              | Path Example                                              | Contents                                       |
| ------------------- | --------------------------------------------------------- | ---------------------------------------------- |
| courier-documents   | companies/{company_id}/couriers/{courier_id}/docs/...     | ID cards, driving licenses, personal documents |
| shift-photos        | companies/{company_id}/shifts/{shift_id}/photos/...       | Start km, end km, Fahrtenbuch, Mentor photos   |
| payslips            | companies/{company_id}/couriers/{courier_id}/payslips/... | Payslips and payroll PDFs                      |
| generated-pdfs      | companies/{company_id}/reports/{shift_id}/daily.pdf       | Daily and monthly generated PDFs               |
| company-assets      | companies/{company_id}/assets/stamp.png                   | Logos and company stamp PNG                    |

Access rules:

- Authenticated access only
- Company-scoped access
- Couriers access only their own documents and generated reports
- Admin accesses all company files
- Dispatcher accesses files inside assigned depot/courier scope
- Shift photos are retained for 14 days and then deleted from storage
- Sensitive document downloads use signed URLs or authenticated private access

---

## Authentication

- Provider: InsForge Auth
- User registration: email invite code flow
- Public routes:
  - Mobile login
  - Mobile invite registration
  - Admin login
- Protected mobile routes:
  - Home
  - History
  - Daily report
  - Mailbox
  - Profile
- Protected admin routes:
  - `/admin/*`
- New courier status:
  - `pending_approval`
- Active access:
  - only after admin/dispatcher approval
- Admin creates or manages dispatcher and courier access
- Dispatcher depot access is assigned by admin
- Middleware in `apps/admin/middleware.ts` protects admin routes
- Mobile route guards redirect unauthenticated users to login
- Role and tenant checks must be enforced server-side and through RLS

---

## InsForge Client Pattern

Two separate InsForge access patterns — never mix mobile/browser and server access.

```typescript
// apps/admin/lib/insforge-client.ts
// Browser-side — used in client components for auth state only
import { createBrowserClient } from "@insforge/ssr";

export const insforge = createBrowserClient(
  process.env.NEXT_PUBLIC_INSFORGE_URL!,
  process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
);
```

```typescript
// apps/admin/lib/insforge-server.ts
// Server-side — used in Server Actions, API routes and protected data access
import { createServerClient } from "@insforge/ssr";
import { cookies } from "next/headers";

export const createInsforgeServer = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_INSFORGE_URL!,
    process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
};
```

```typescript
// apps/mobile/lib/insforge-client.ts
// Mobile-side — used for mobile auth and courier-safe operations
import { createClient } from "@insforge/sdk";

export const insforge = createClient({
  url: process.env.EXPO_PUBLIC_INSFORGE_URL!,
  anonKey: process.env.EXPO_PUBLIC_INSFORGE_ANON_KEY!,
});
```

Rules:

- Browser/mobile clients use public anon keys only
- Server-side mutations that require elevated checks go through admin server routes/actions
- Client-side role checks are only UX helpers
- RLS and server-side checks are the real security boundary

---

## Mobile State Pattern

### Active Shift State

```typescript
type ActiveShiftState = {
  shiftId: string | null;
  startedAt: string | null;
  currentDepotId: string | null;
  paymentMode: "hourly" | "daily_fixed";
  isRunning: boolean;
  autoStoppedAtMaxHours: boolean;
};
```

Rules:

- Timer is calculated from stored `startedAt`, not from an in-memory counter only
- Active shift is persisted locally
- Closing the app must not reset the timer
- Hourly courier timer auto-stops at 10:00 h
- Daily fixed courier still tracks real time, but billable time defaults to 8:20 h

### Offline Draft Pattern

```
User edits report while offline
        ↓
Draft saved to AsyncStorage
        ↓
Draft marked as unsynced
        ↓
Connection returns
        ↓
Sync queue sends draft to backend
        ↓
Server validates and saves
        ↓
Draft marked as synced
```

---

## Payroll Pattern

Shared payroll logic lives only in `packages/shared/src/payroll.ts`.

```typescript
type PaymentMode = "hourly" | "daily_fixed";

type PayrollResult = {
  grossMinutes: number;
  breakMinutes: number;
  netMinutes: number;
  billableMinutes: number;
  billableSource: "auto" | "manual_override";
  autoStoppedAtMaxHours: boolean;
};
```

Rules:

- Automatic break calculation is shared between mobile and admin
- Hourly couriers are capped at 600 billable minutes
- Daily fixed couriers default to 500 billable minutes
- Manual override requires a reason
- Every billable override must create an audit log
- Payroll export uses `billable_minutes`
- Real operational review can still show `gross_minutes` and `net_minutes`

---

## Geofence Pattern

Start and stop location are captured only at shift start and shift end.

No live route tracking in version 1.

```typescript
type ShiftLocationType = "start" | "stop";

type GeofenceResult = {
  isInsideDepotGeofence: boolean;
  distanceFromDepotMeters: number;
};
```

Flow:

```
Capture courier location
        ↓
Read depot coordinates and radius
        ↓
Calculate distance from depot
        ↓
Compare distance <= geofence_radius_meters
        ↓
Save inside/outside result
        ↓
Show red warning marker in admin if outside
```

Rules:

- Store only start and stop GPS location in version 1
- Do not track full route
- Outside depot warnings are visible to admin/dispatcher
- Dispatcher can only see warnings inside assigned depot scope
- GPS accuracy should be stored
- If permission is denied, shift can continue but admin sees missing location warning

---

## PDF Generation Pattern

PDFs are generated server-side.

Daily report PDF includes:

- Company name
- Company logo or stamp PNG if available
- Courier name
- Date
- Depot
- Vehicle
- Start time
- End time
- Break
- Net time
- Billable time
- Payment mode
- KM values
- Package counters
- Abholungen
- Courier note
- Signature
- Approval status

Monthly PDF includes:

- Company name
- Courier name
- Month
- List of approved shifts
- Total real time
- Total billable time
- Payment mode summary
- Signature/stamp area if needed

Rules:

- PDF access is permission-scoped
- Generated PDFs can be stored in `generated-pdfs`
- Company stamp PNG is stored in `company-assets`
- Courier can download own PDFs only
- Admin can download company PDFs
- Dispatcher can download scoped courier PDFs

---

## Export Pattern

Accountant exports are generated from approved shifts only.

```typescript
type AccountantExportRow = {
  courierName: string;
  date: string;
  depotCode: string;
  paymentMode: "hourly" | "daily_fixed";
  startTime: string;
  endTime: string;
  breakMinutes: number;
  netMinutes: number;
  billableMinutes: number;
  status: "approved";
};
```

Rules:

- Export includes approved shifts only
- Export uses `billable_minutes`
- Export can be filtered by month, depot and payment mode
- Export supports CSV and XLSX
- Export should be formatted for German Steuerberater workflow
- Export generation should be audit logged

---

## Invariants

Rules the AI agent must never violate:

- `apps/mobile` and `apps/admin` share types and business logic, not UI components.
- `packages/shared` never imports from `apps/mobile` or `apps/admin`.
- `packages/shared` contains no React Native, Next.js or InsForge client code.
- UI components contain no direct database mutations.
- Mobile screens do not perform admin-only operations.
- Admin pages do not trust client-side role checks only.
- All server-side writes use server-side InsForge helpers.
- Client-side role checks are UX only; RLS and server-side checks are required.
- Every company-owned query must be scoped by `company_id`.
- Dispatcher queries must be scoped by assigned depot access unless the dispatcher has all-depot access.
- Courier queries must be scoped to the courier’s own profile.
- Approved shifts are locked for couriers.
- Shift corrections require a reason.
- Billable time overrides require a reason.
- Every sensitive admin/dispatcher change writes to `audit_logs`.
- One shift per courier per day in version 1.
- Two shifts per day are out of scope for version 1.
- Hourly courier billable time must not exceed 10:00 hours.
- Daily fixed courier billable time defaults to 8:20 hours unless overridden with reason.
- Shift timer must calculate from stored `start_time`, not only from in-memory state.
- Start and stop GPS are stored; live GPS tracking is out of scope for version 1.
- Outside depot start/stop must create an admin/dispatcher warning.
- Shift photos are operational evidence and must be deleted after 14 days.
- Sensitive documents are never public.
- Private document downloads use signed URLs or authenticated access.
- `.env` files are never committed.
- No secrets, service keys or private tokens are exposed in client code.
- No hardcoded design colors in components; use tokens from `ui-tokens.md`.
- German is the default production UI language.
- Bulgarian is supported through translation keys.
- Every feature implementation follows `context/build-plan.md`.
- Every completed feature updates `context/progress-tracker.md`.
- Every new UI pattern updates `context/ui-registry.md`.
- If an error persists after one corrective attempt, stop and use `/recover`.
