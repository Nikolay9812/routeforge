# Memory - RF-MOB-022 Home Workflow And CodeRabbit Cleanup

Last updated: 2026-07-29 08:27 +02:00

## What was built

- RF-MOB-022 moved the courier daily workflow into Home as the single visible workflow tab.
- Bottom mobile navigation is Home, Historie, Postfach and Profil; the old Bericht/report tab is hidden.
- `apps/mobile/app/(tabs)/home.tsx` renders the Home-owned `DailyReportWorkflow`.
- `apps/mobile/app/(tabs)/report.tsx` is kept only as a hidden compatibility redirect to `/home`.
- The large report route was split into readable feature files:
  - `apps/mobile/features/report/DailyReportWorkflow.tsx`
  - `apps/mobile/features/report/DailyReportWorkflowParts.tsx`
  - `apps/mobile/features/report/DailyReportWorkflowSummary.tsx`
  - `apps/mobile/features/report/dailyReportWorkflowTypes.ts`
- CodeRabbit cleanup changed:
  - `apps/mobile/features/shifts/useLocalShiftTimer.ts`
  - `apps/mobile/features/report/DailyReportWorkflow.tsx`
  - `apps/mobile/features/report/DailyReportWorkflowSummary.tsx`
  - `packages/shared/src/types.ts`
  - `packages/shared/src/schemas/shift.ts`
  - `migrations/20260729193000_signature-mobile-svg-mime-tolerance.sql`
  - `migrations/20260729203000_signature-artifact-hardening.sql`
  - `insforge/migrations/0023_signature_mobile_svg_mime_tolerance.sql`
  - `insforge/migrations/0024_signature_artifact_hardening.sql`
  - `context/architecture.md`
  - `context/build-plan.md`
  - `context/data-model.md`
  - `context/progress-tracker.md`
  - `context/ui-registry.md`

## Decisions made

- Home is the only visible courier daily workflow surface.
- The report route stays as a hidden redirect for compatibility, not as a second implementation.
- The four Home workflow stages are: Start, Ausfuellen, Unterschrift, Fertig.
- The report can be edited while the shift is running, but final submit expects the backend shift to already have a confirmed `end_time`.
- Signature artifacts remain per-shift private `generated-pdfs` objects at the deterministic key `companies/{company_id}/reports/{shift_id}/signature.svg`.
- Expo/React Native storage uploads continue to use the existing authenticated `XMLHttpRequest`/`FormData` path, not Google Cloud Storage.
- Generic mobile transport MIME metadata may be tolerated for signature storage verification, but review/PDF metadata reports `image/svg+xml` only when the storage object is actually recorded as SVG; otherwise it reports `application/octet-stream`.

## Problems solved

- Fixed failed shift starts so Home surfaces the backend error and does not refresh into stale shift state.
- Fixed submitted summary depot display by using hydrated courier depot data instead of hardcoded `Mannheim HBW3`.
- Fixed submitted timestamp formatting by explicitly using `Europe/Berlin`.
- Hardened signature submit RPC validation:
  - requires deterministic HTTPS InsForge storage object URL
  - rejects query/fragment URLs
  - checks the encoded expected storage key suffix
  - checks missing `start_time` defensively before signed-time comparison
  - uses `bigint` for signature artifact `size_bytes`
  - returns safe artifact MIME metadata instead of hardcoding generic uploads as SVG
- The live backend migration initially failed because Postgres cannot change a table-returning function return type with `CREATE OR REPLACE`; fixed by dropping and recreating `get_shift_signature_artifact(uuid)` and restoring the authenticated execute grant.
- Applied live InsForge migration `20260729203000 signature-artifact-hardening`.

## Current state

- Mobile and admin typecheck/lint passed after the CodeRabbit cleanup.
- Live InsForge migration list includes:
  - `20260729193000 signature-mobile-svg-mime-tolerance`
  - `20260729203000 signature-artifact-hardening`
- Focused raw Tailwind/hex color scan in changed mobile workflow files returned no matches.
- Focused mojibake scan in changed mobile/context files returned no matches.
- `git diff --check` passed with only LF-to-CRLF normalization warnings.
- The app was not started or restarted because Nikolay is running it locally.
- Working tree contains uncommitted RF-MOB-022 and CodeRabbit cleanup changes.
- Non-blocking environment note: Git status may warn about `C:\Users\Nikolay/.config/git/ignore` permission in the sandbox.

## Next session starts with

1. Run `/remember restore`.
2. Read RouteForge context in the required `AGENTS.md` order before coding.
3. Inspect the current working tree and CodeRabbit comments, if any remain.
4. If continuing this exact task, review the final diff and either commit or address any new review comments from the user.

## Open questions

- User said "and then yes" while saving memory; this was treated as confirmation to overwrite the old `memory.md`.
- No open app-breaking issue is known after the latest CodeRabbit cleanup, but the user may still want another cleanup/commit pass.
