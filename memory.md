# Memory - RF-DOC-006 Company Stamp PNG Support

Last updated: 2026-07-15 19:00 +02:00

## What was built

- Completed `RF-DOC-004 - Accountant XLSX Export` before this save.
  - Added `apps/admin/app/api/exports/xlsx/route.ts`.
  - Extended `apps/admin/lib/adminExports.server.ts` with a dependency-free minimal XLSX builder.
  - Wired XLSX download state in `apps/admin/components/exports/ExportPreviewRealData.tsx`.
- Completed `RF-DOC-005 - Shift Photo Retention Cleanup` before this save.
  - Added and applied `migrations/20260715162357_shift-photo-retention-cleanup.sql`.
  - Mirrored it to `insforge/migrations/0020_shift_photo_retention_cleanup.sql`.
  - Added `cleanup_expired_shift_photos(p_limit integer default 200)` as an operator-only cleanup RPC.
- Completed `RF-DOC-006 - Company Stamp PNG Support`.
  - Added `apps/admin/app/actions/settings.ts`.
  - Added `apps/admin/components/settings/CompanyStampUpload.tsx`.
  - Updated `apps/admin/app/admin/settings/page.tsx`.
  - Updated `apps/admin/lib/adminSettings.ts`.
  - Updated `apps/admin/lib/adminSettings.server.ts`.
  - Updated `context/data-model.md`, `context/security-gdpr.md`, `context/progress-tracker.md`, and `context/ui-registry.md`.
  - Recorded the stamp storage decision in InsForge project memory.

## Decisions made

- Company PDF stamps are uploaded only by active admins.
- Stamp files are stored in the private `company-assets` bucket under `companies/{company_id}/assets/...`.
- `companies.stamp_url` stores the private storage key, not a public URL.
- Daily and monthly PDFs already read `companies.stamp_url` server-side from `company-assets`; RF-DOC-006 therefore needed no PDF renderer rewrite and no database migration.
- Stamp upload validates PNG format and caps file size at 2 MB.
- Replacing a stamp removes the previous company-scoped stamp object only after the company row update succeeds.
- Logo, company profile, language, and retention settings remain locked until their own settings mutation work.

## Problems solved

- Confirmed existing PDF renderers already render the stamp when `stamp_url` starts with `companies/{company_id}/assets/`.
- Avoided a migration because the schema and storage policies already supported `stamp_url` and `company-assets`.
- Preserved the private-storage model by not rendering or exposing public object URLs in the settings UI.
- Verified the installed Next.js server-action guidance: actions are POST endpoints and must perform their own auth/role checks.
- InsForge memory command accepts a single argument; the successful save used one compact memory string.

## Current state

- `context/progress-tracker.md` marks `RF-DOC-006 Company Stamp PNG Support` complete.
- Current focus and next feature are `RF-PROD-001 - Loading, Empty and Error States`.
- Verification passed:
  - `npm --workspace admin run typecheck`
  - `npm --workspace admin run lint`
  - `npm --workspace admin run build`
  - token scan for hardcoded hex/raw color classes in changed settings files
  - `git diff --check` clean except expected LF-to-CRLF normalization warnings
- Working tree has the RF-DOC-006 app/context changes uncommitted.
- Non-blocking environment note: Git status may warn about `C:\Users\Nikolay/.config/git/ignore` permission in the sandbox.

## Next session starts with

1. Run `/remember restore`.
2. Read RouteForge context in the required `AGENTS.md` order.
3. Implement `RF-PROD-001 - Loading, Empty and Error States`.
4. Start by auditing existing admin and mobile loading/empty/error patterns, then apply the smallest consistent polish pass.
5. Keep German UI labels, tokenized styling, tenant/role boundaries, and no public storage URLs.

## Open questions

- None currently. RF-PROD-001 should decide the exact first surfaces to standardize after reading the build-plan and current UI registry.
