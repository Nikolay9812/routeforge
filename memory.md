# Memory - RF-BE-012 Documents and Mailbox Backend

Last updated: 2026-07-12 19:15 +02:00

## What was built

- Prepared `RF-BE-012 - Documents and Mailbox Backend`.
- Added migration files:
  - `insforge/migrations/0014_documents_mailbox_backend.sql`
  - `migrations/20260712140000_documents-mailbox-backend.sql`
- Added guarded RPCs:
  - `create_courier_document_mailbox_item(...)`
  - `get_document_download_access(...)`
  - `mark_mailbox_item_read(...)`
- Added admin document upload Server Action:
  - `apps/admin/app/actions/documents.ts`
- Added admin document server loader/formatter:
  - `apps/admin/lib/adminDocuments.server.ts`
- Wired `/admin/documents` to real document/courier data and real upload action while preserving the existing UI.
- Added mobile mailbox backend adapter:
  - `apps/mobile/features/mailbox/mailboxBackend.ts`
- Wired mobile mailbox list/detail to real mailbox rows, mark-read RPC and authenticated storage download.
- Updated context files for data model, permissions, security, UI registry and progress tracking.

## Decisions made

- RF-BE-012 keeps real document upload mutations active-admin-only for the safer v1 default.
- Dispatcher document upload remains closed until explicit dispatcher capability flags and depot-scoped write rules exist.
- Document metadata creation is RPC-only in the new migration; direct authenticated `INSERT` on `documents` is revoked.
- Mailbox content edits are closed to authenticated clients; courier read state is persisted through `mark_mailbox_item_read(...)`.
- Document upload verifies the private `storage.objects` row, bucket/path pattern, tenant, target courier and file metadata before inserting `documents`.
- Upload can create an unread `mailbox_items` row and writes a `document_uploaded` audit log.
- Mobile download currently verifies access and downloads the private Blob through InsForge Storage. Saving/sharing the Blob to device files is deferred because `expo-file-system` is not currently approved in the project library rules.

## Verification

- Passed:
  - `npm --workspace admin run typecheck`
  - `npm --workspace mobile run typecheck`
- Blocked:
  - `npx @insforge/cli db migrations apply` was blocked by the approval/usage gate before execution, so the RF-BE-012 migration is not applied to the linked InsForge backend yet.

## Current state

- Local code for RF-BE-012 is implemented.
- `context/progress-tracker.md` intentionally does not mark RF-BE-012 complete yet because the live migration apply and catalog verification are still pending.
- Working tree also still contains uncommitted RF-BE-011 changes from the previous completed feature; do not revert them.

## Next session starts with

1. Read RouteForge context files in the required `AGENTS.md` order.
2. Apply `migrations/20260712140000_documents-mailbox-backend.sql` to InsForge when CLI execution is available.
3. Verify all three RF-BE-012 RPCs exist and `authenticated` has `EXECUTE`.
4. Run root typecheck, lint and `git diff --check`.
5. Only then mark RF-BE-012 complete and set next feature to `RF-BE-013 - History Backend`.
