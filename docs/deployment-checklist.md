# RouteForge Deployment Checklist

Date: 2026-07-16
Feature: RF-PROD-005 - Deployment Checklist

Use this checklist before deploying RouteForge to a production tenant. RouteForge handles courier employee data, payroll-ready shift data, start/stop GPS proof, private documents and audit logs, so deployment is not just a build step.

## 1. Production Boundaries

- Confirm the target deployment is a real production workspace, not a demo or development InsForge project.
- Confirm `.env`, `.env.*` and `.insforge/` are not committed.
- Confirm `.insforge/project.json` exists only on operator machines or CI and points to the intended InsForge project.
- Confirm the production InsForge project region is acceptable for the company and its GDPR/DSGVO requirements.
- Confirm no service-role/admin API key is present in browser or mobile env variables.
- Confirm public signup behavior has been explicitly reviewed against the invite-code registration flow before changing InsForge Auth settings.

## 2. Required Environment Variables

### Admin App

Set these in the admin hosting environment:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_INSFORGE_URL` | Yes | InsForge API base URL used by admin server/client session code. |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | Yes | Public anon key used by admin browser and server session clients. |
| `NEXT_PUBLIC_APP_URL` | Optional/reserved | Present in `.env.example`; not currently required by runtime code. |

Rules:

- `NEXT_PUBLIC_*` values are browser-visible. Use only public InsForge URL and anon key values.
- Do not add `INSFORGE_SERVICE_ROLE_KEY` to admin browser-visible env vars.
- If future server-only service keys are introduced, keep them unprefixed and server-only.

### Mobile App

Set these before building a production mobile bundle:

| Variable | Required | Purpose |
| --- | --- | --- |
| `EXPO_PUBLIC_INSFORGE_URL` | Yes | InsForge API base URL used by the Expo app. |
| `EXPO_PUBLIC_INSFORGE_ANON_KEY` | Yes | Public anon key used by the Expo app. |
| `EXPO_PUBLIC_ADMIN_API_URL` | Yes for PDF downloads outside local dev | Admin app origin used by mobile daily/monthly PDF download calls. |

Rules:

- `EXPO_PUBLIC_*` values are bundled into the mobile app. Never put secrets there.
- `EXPO_PUBLIC_ADMIN_API_URL` should point to the deployed admin origin, for example `https://admin.example.com`.
- Keep the local fallback `http://localhost:3000` for development only.

## 3. InsForge Project Setup

- Authenticate and link the operator machine or CI with the InsForge CLI:

```powershell
& 'C:\Program Files\nodejs\npx.cmd' @insforge/cli login
& 'C:\Program Files\nodejs\npx.cmd' @insforge/cli link
& 'C:\Program Files\nodejs\npx.cmd' @insforge/cli current
```

- In headless CI, use the documented InsForge non-interactive auth flow and store credentials as CI secrets.
- Do not edit `.insforge/project.json` manually.
- Do not commit `.insforge/project.json`.
- Before a production migration, create or confirm a recent InsForge backup.
- Run diagnostics before release:

```powershell
& 'C:\Program Files\nodejs\npx.cmd' @insforge/cli diagnose advisor --category security
& 'C:\Program Files\nodejs\npx.cmd' @insforge/cli diagnose advisor --category performance
& 'C:\Program Files\nodejs\npx.cmd' @insforge/cli diagnose db --check slow-queries,index-usage
```

## 4. Storage Buckets

Create these InsForge storage buckets as private buckets before enabling uploads:

```txt
courier-documents
shift-photos
payslips
generated-pdfs
company-assets
```

Checklist:

- Buckets are private, not public.
- Object keys use the RouteForge company prefix: `companies/{company_id}/...`.
- `courier-documents` stores private courier document files.
- `shift-photos` stores temporary proof photos only.
- `payslips` stores payroll PDFs.
- `generated-pdfs` stores report signatures and generated report artifacts when persisted.
- `company-assets` stores company stamp PNG files.
- Company stamp values in `companies.stamp_url` are private storage keys, not public URLs.

## 5. Migration Order

Apply migrations in chronological order from `migrations/` using the InsForge CLI:

```powershell
& 'C:\Program Files\nodejs\npx.cmd' @insforge/cli db migrations up --all
& 'C:\Program Files\nodejs\npx.cmd' @insforge/cli db migrations list
```

Expected production migration sequence:

```txt
20260707000100_initial-schema.sql
20260707000200_rls-policies.sql
20260707000300_storage-policies.sql
20260707000400_invitation-backend.sql
20260707120000_profile-approval-backend.sql
20260708120000_depot-backend.sql
20260708130000_dispatcher-depot-access-backend.sql
20260709150000_shift-start-stop-backend.sql
20260709160000_shift-location-backend.sql
20260710120000_daily-report-submit-backend.sql
20260711120000_shift-photo-upload-backend.sql
20260712120000_signature-artifact-access-backend.sql
20260712130000_admin-shift-approval-backend.sql
20260712140000_documents-mailbox-backend.sql
20260712150000_phase7-mobile-backend-stabilization.sql
20260712161000_fix-demo-hbw3-depot-coordinates.sql
20260712220000_mobile-profile-documents-backend.sql
20260714163924_accountant-csv-export-audit.sql
20260714165711_fix-accountant-export-audit-validation.sql
20260715162357_shift-photo-retention-cleanup.sql
20260716140000_harden-shift-direct-writes.sql
20260716165140_performance-review-indexes.sql
```

After migrations:

- Confirm RLS is enabled for public application tables.
- Confirm authenticated clients have direct `SELECT` only on `public.shifts`; shift writes stay RPC-only.
- Confirm private storage path constraints exist on `shift_photos` and `documents`.
- Confirm `cleanup_expired_shift_photos(integer)` exists and is not executable by `anon` or `authenticated`.
- Confirm performance indexes from RF-PROD-004 exist.

Do not run `insforge/seeds/demo_company.sql` against production.

## 6. Admin Bootstrap Process

The first production admin needs an InsForge Auth user and a matching active RouteForge profile.

Checklist:

- Create the company row for the tenant.
- Create the first admin user through InsForge Auth.
- Create the matching `profiles` row:
  - `company_id` points to the production company.
  - `auth_user_id` points to the admin auth user.
  - `role = 'admin'`.
  - `status = 'active'`.
  - `preferred_language = 'de'`.
- Log in to `/login` and confirm the admin lands on `/admin/dashboard`.
- Create production depots from the admin UI.
- Create dispatcher and courier invitations from the admin UI.
- Approve couriers only after profile/document review.

Notes:

- Courier self-registration must still go through email invite codes.
- New couriers must start as `pending_approval`.
- Dispatcher expansion remains depot-scoped; admin remains the safer default for sensitive write workflows.

## 7. Retention and Scheduled Operations

Shift proof photos must be cleaned up after 14 days.

Checklist:

- Configure a trusted operator/scheduler path to call `cleanup_expired_shift_photos(...)`.
- Run the cleanup from server/operator context only, not from browser or mobile clients.
- Confirm the cleanup targets only `shift-photos` objects where `expires_at < now()` and `deleted_at is null`.
- Confirm payslips, contracts, courier documents, generated PDFs and company assets are outside the cleanup path.
- Review cleanup results periodically until production traffic is stable.

## 8. Admin Deployment Checks

From the repository root:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' --workspace admin run typecheck
& 'C:\Program Files\nodejs\npm.cmd' --workspace admin run lint
& 'C:\Program Files\nodejs\npm.cmd' --workspace admin run build
```

Production smoke test:

- `/login` renders without missing env errors.
- Admin sign-in succeeds for the first active admin.
- `/admin/dashboard` loads company-scoped data.
- `/admin/shifts` loads without cross-tenant data.
- Shift approval/rejection/correction writes expected audit logs.
- `/admin/documents` uploads private documents and creates mailbox items.
- `/admin/exports` downloads CSV and XLSX files and writes export audit logs.
- `/admin/settings` uploads a stamp PNG to private `company-assets`.
- Daily and monthly PDF routes return private PDF responses only for authorized users.

## 9. Mobile Testing Process

Before a production mobile build:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run typecheck
& 'C:\Program Files\nodejs\npm.cmd' --workspace mobile run lint
```

Device smoke test:

- Fresh install opens login and invite routes cleanly.
- Courier invite flow creates or completes a `pending_approval` profile.
- Pending courier cannot access operational tabs.
- Active courier can load Home, Bericht, Historie, Postfach and Profil.
- Start shift captures only foreground start location.
- End shift captures only foreground stop location.
- No background/live tracking permission is requested.
- Daily report validates required fields, photos or missing-proof explanation, and signature.
- Submitted report locks for courier editing.
- Mailbox loads only the courier's own newest items.
- Private mailbox document download works.
- Daily and monthly PDF downloads use `EXPO_PUBLIC_ADMIN_API_URL` and bearer auth.

## 10. Final Go/No-Go

Go only when all items are true:

- Production env vars are set and contain no secrets in public prefixes.
- InsForge project link is confirmed.
- Migrations are applied in order.
- Private storage buckets exist.
- First admin bootstrap is complete.
- Security advisor has no unresolved critical issues.
- Performance advisor has no unresolved critical issues.
- Shift photo cleanup is scheduled or has an operator runbook.
- Admin build passes.
- Mobile typecheck/lint passes.
- Real-device mobile smoke test passes.
- GDPR/DSGVO deployment follow-ups are reviewed with the operator.

No-go if any of these are true:

- Any tenant data is visible across company boundaries.
- Any private document bucket is public.
- Any service/admin key is exposed to browser or mobile env vars.
- Courier registration bypasses invite-code review.
- Mobile requests live/background location tracking.
- Shift photo cleanup could delete payslips, contracts, documents, generated PDFs or company assets.
