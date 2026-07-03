# Memory - RF-ADM-010/RF-ADM-011 Depot and Documents Admin UI

Last updated: 2026-07-03 20:24 +02:00

## What was built

- Completed `RF-ADM-010 - Depot Management UI`.
  - Added `apps/admin/app/admin/depots/page.tsx`.
  - Added `apps/admin/lib/mock/adminDepots.ts`.
  - Updated `context/progress-tracker.md`.
  - Updated `context/ui-registry.md` with the `Admin Depot Management Screen` pattern.
- Completed `RF-ADM-011 - Documents Upload UI`.
  - Added `apps/admin/app/admin/documents/page.tsx`.
  - Added `apps/admin/lib/mock/adminDocuments.ts`.
  - Updated `context/progress-tracker.md`.
  - Updated `context/ui-registry.md` with the `Admin Documents Upload Screen` pattern.
- `/admin/depots` includes a hero, add-depot visual action, summary tiles, static filters, a dense depot table, geofence/status badges, a right-column depot detail edit preview, assignment previews and a start/stop-only geofence summary.
- `/admin/documents` includes a hero, summary tiles, category tabs, mock upload drop zone, static filters, dense document table, upload draft panel, mailbox notification preview, visibility panel and upload checklist.

## Decisions made

- `RF-ADM-010` and `RF-ADM-011` remain UI-first and mock-only.
- No InsForge query, auth/session work, route protection, RLS change, depot mutation, geofence persistence, file upload, storage write, document metadata insert, mailbox item creation, signed URL or audit-log write was added.
- Both pages are Server Components using static mock data.
- Depot management follows the existing admin table/filter/summary/right-panel pattern rather than a map-heavy screen.
- Document upload follows the approved admin documents reference: tabs, upload zone, filters, table and right-side access/visibility panel.
- Real depot and document backend work must later be company-scoped, permission-checked server-side/RLS, and audit logged where required.
- Real document uploads must use private storage. Payslips, contracts and private courier documents are durable private documents, not part of the 14-day shift-photo cleanup.
- Styling uses RouteForge semantic token classes only. No hardcoded hex values or raw Tailwind color utilities were added in touched admin files.

## Problems solved

- The admin sidebar `Depots` route now resolves to a real mock UI page.
- The admin sidebar `Dokumente` route now resolves to a real mock UI page.
- `context/progress-tracker.md` now marks `RF-ADM-011` complete and sets the next feature to `RF-ADM-012 - Invitations UI`.
- Verification passed:
  - `& 'C:\Program Files\nodejs\npm.cmd' --workspace admin run typecheck`
  - `& 'C:\Program Files\nodejs\npm.cmd' --workspace admin run lint`
  - token/raw-color scan against the new depot and documents admin files
  - non-ASCII scan against the new depot and documents admin files
  - live route probe for `http://127.0.0.1:3000/admin/depots`
  - live route probe for `http://127.0.0.1:3000/admin/documents`
  - `git -c safe.directory='C:/Users/Nikolay/Desktop/routeforge' diff --check`
- `diff --check` had no whitespace errors; it only reported LF-to-CRLF warnings for `context/progress-tracker.md` and `context/ui-registry.md`.

## Current state

- Phase 5 - Admin Panel UI With Mock Data is complete through `RF-ADM-011`.
- Expected uncommitted work from this session:
  - `apps/admin/app/admin/depots/page.tsx`
  - `apps/admin/app/admin/documents/page.tsx`
  - `apps/admin/lib/mock/adminDepots.ts`
  - `apps/admin/lib/mock/adminDocuments.ts`
  - `context/progress-tracker.md`
  - `context/ui-registry.md`
  - `memory.md`
- Earlier admin mock UI work may also still be uncommitted in the worktree. Do not revert unrelated user or prior-session changes.
- Git status may show user-level ignore permission warnings for `C:\Users\Nikolay/.config/git/ignore`; this did not block checks.

## Next session starts with

Start `RF-ADM-012 - Invitations UI`.

Before implementing:

- Read required RouteForge context in `AGENTS.md` order.
- Because the feature touches `apps/admin`, inspect the installed Next.js docs under `apps/admin/node_modules/next/dist/docs/` before changing app routes/components.
- Reuse the admin table, summary tile, filter, right-panel and status badge patterns from `context/ui-registry.md`.

Expected next scope:

- Build `/admin/invitations` as a mock-only invitation management page.
- Include invitation table, create invitation dialog/preview, email input, role selector, optional depot selector, expiry date and active/used/expired/revoked status badges.
- Do not add real invite creation, email sending, invite-code validation, profile creation, backend queries, RLS changes or audit-log writes yet.

## Open questions

- None currently blocking `RF-ADM-012`.
