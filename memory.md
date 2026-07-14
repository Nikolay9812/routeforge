# Memory - RF-DOC-003 Accountant CSV Export

Last updated: 2026-07-14 19:01 +02:00

## What was built

- Completed `RF-DOC-002 - Monthly PDF Generation`.
  - Added `apps/admin/app/api/pdf/monthly/route.ts`.
  - Added `apps/admin/lib/monthlyPdf.server.tsx`.
  - Wired `apps/mobile/app/(tabs)/history.tsx` monthly PDF download.
  - Extended `apps/mobile/features/history/dailyPdfDownload.ts` for monthly PDFs.
- Completed `RF-DOC-003 - Accountant CSV Export`.
  - Added `apps/admin/app/api/exports/csv/route.ts`.
  - Extended `apps/admin/lib/adminExports.server.ts` with server-side CSV generation.
  - Wired active CSV download buttons and status copy in `apps/admin/components/exports/ExportPreviewRealData.tsx`.
  - Updated `apps/admin/app/admin/exports/page.tsx` to pass CSV permission state.
  - Added and applied InsForge migrations:
    - `migrations/20260714163924_accountant-csv-export-audit.sql`
    - `migrations/20260714165711_fix-accountant-export-audit-validation.sql`
  - Mirrored migration SQL in:
    - `insforge/migrations/0018_accountant_csv_export_audit.sql`
    - `insforge/migrations/0019_fix_accountant_export_audit_validation.sql`
  - Updated `context/progress-tracker.md` and `context/ui-registry.md`.

## Decisions made

- Accountant CSV export is admin-only by safer default. Dispatcher export remains closed until explicitly enabled and depot-scoped.
- CSV export is generated on demand from fresh server-side approved-shift queries; generated CSV files are not stored as documents.
- CSV export uses selected month, depot and payment-mode filters, includes real/break/net/billable time, and uses German accountant-friendly semicolon CSV with UTF-8 BOM.
- Successful CSV generation must write an `accountant_export_created` audit row through `public.record_accountant_export_created(...)`.
- RF-DOC-004 XLSX export should reuse the same export data definition and permission rules as RF-DOC-003.

## Problems solved

- Added a security-definer audit RPC instead of trying to insert `audit_logs` directly from app code, preserving the existing audit-write architecture.
- A follow-up migration hardened the export audit RPC month validation for null input without editing the already-applied migration history.
- The sandboxed InsForge CLI call initially failed on `npx` network/cache access; approved unsandboxed CLI runs succeeded.
- `git diff --check` requires `-c safe.directory=C:/Users/Nikolay/Desktop/routeforge` because the sandbox user differs from the repository owner.

## Current state

- `context/progress-tracker.md` marks `RF-DOC-003 Accountant CSV Export` complete.
- Current focus and next feature are `RF-DOC-004 - Accountant XLSX Export`.
- Verification passed for RF-DOC-003:
  - `npm --workspace admin run typecheck`
  - `npm --workspace admin run lint`
  - `npm --workspace admin run build`
  - both InsForge migrations applied successfully
  - `git diff --check` clean except LF-to-CRLF normalization warnings
  - raw color/hex scan clean for changed admin UI files
- Known non-blocking environment notes:
  - Git status may warn about `C:\Users\Nikolay/.config/git/ignore` permission in the sandbox.
  - `context/ui-registry.md` has pre-existing trailing-space lines unrelated to RF-DOC-003.

## Next session starts with

1. Run `/remember restore`.
2. Read RouteForge context in the required `AGENTS.md` order.
3. Implement `RF-DOC-004 - Accountant XLSX Export`.
4. Reuse the RF-DOC-003 server-side export data and permission model.
5. Keep XLSX admin-only by safer default unless context is explicitly changed.

## Open questions

- None currently. RF-DOC-004 should decide whether to add a lightweight XLSX dependency or generate XLSX through an existing project-approved path after checking installed packages and `context/library-docs.md`.
