# Memory - RF-PROD-002 Security Review

Last updated: 2026-07-16 16:41 +02:00

## What was built

- Completed `RF-PROD-001 - Loading, Empty and Error States`.
  - Added admin route-level loading and error boundaries:
    - `apps/admin/app/admin/loading.tsx`
    - `apps/admin/app/admin/error.tsx`
    - `apps/admin/components/ui/AdminState.tsx`
  - Added reusable mobile loading, empty, error and offline/retry state components:
    - `apps/mobile/components/ui/MobileState.tsx`
  - Updated mobile mailbox and history flows:
    - `apps/mobile/app/(tabs)/mailbox.tsx`
    - `apps/mobile/app/(tabs)/history.tsx`
    - `apps/mobile/app/mailbox/[id].tsx`
  - Updated `context/progress-tracker.md` and `context/ui-registry.md`.
- Completed `RF-PROD-002 - Security Review`.
  - Hardened admin session bootstrap in `apps/admin/lib/auth.ts` so it no longer selects Steuer-ID, IBAN or private document storage fields during route/session loading.
  - Added and applied live InsForge migration `migrations/20260716140000_harden-shift-direct-writes.sql`.
  - Mirrored the migration to `insforge/migrations/0021_harden_shift_direct_writes.sql`.
  - Updated `context/security-gdpr.md`, `context/permissions.md` and `context/progress-tracker.md`.

## Decisions made

- Authenticated clients keep direct `SELECT` on `public.shifts`; all shift writes remain RPC-only through the existing start/end/report/admin-review functions.
- Stale direct shift insert/update RLS policies were removed so backend policy shape matches the existing revoked grants.
- Admin route/session bootstrap follows data minimization: sensitive tax, bank and private document references must be loaded only by scoped feature queries that explicitly need them.
- RF-PROD-002 did not change global InsForge Auth signup/email-verification settings; public signup behavior should be reviewed deliberately during the GDPR/deployment readiness work before changing invite registration behavior.

## Problems solved

- Confirmed InsForge security advisor returned no issues before and after the hardening migration.
- Confirmed live `public.shifts` policies now contain only `shifts_select_scoped`.
- Confirmed live authenticated grants on `public.shifts` are `SELECT` only.
- Confirmed inspected application storage buckets are private and file access continues through scoped RPCs or authenticated server download routes.
- Source scan found only public InsForge URL/anon-key environment usage in client code; no service-role secret usage was found.

## Current state

- `context/progress-tracker.md` marks `RF-PROD-001` and `RF-PROD-002` complete.
- Current focus and next feature are `RF-PROD-003 - GDPR / DSGVO Review`.
- Verification passed:
  - `npm --workspace admin run typecheck`
  - `npm --workspace mobile run typecheck`
  - `npm --workspace admin run lint`
  - `npm --workspace mobile run lint`
  - `npm --workspace admin run build`
  - InsForge security advisor scan
  - live InsForge policy/grant verification for `public.shifts`
  - `git diff --check`
- `git diff --check` reports only LF-to-CRLF normalization warnings.
- Working tree has RF-PROD-001 and RF-PROD-002 app/context/migration changes uncommitted.
- Non-blocking environment note: Git status may warn about `C:\Users\Nikolay/.config/git/ignore` permission in the sandbox.

## Next session starts with

1. Run `/remember restore`.
2. Read RouteForge context in the required `AGENTS.md` order.
3. Implement `RF-PROD-003 - GDPR / DSGVO Review`.
4. Start by auditing GDPR/DSGVO surfaces: data minimization, retention, transparency copy, private document handling, exports, audit logs and auth/signup behavior.
5. Keep the review feature-by-feature and update `context/progress-tracker.md`; update security/data-model/permissions context only if the review changes rules.

## Open questions

- Should global InsForge Auth settings be tightened for invite-only registration, especially public signup and email verification? Review carefully before changing because it may affect courier invite registration.
