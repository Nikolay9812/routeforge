# Memory - INITIAL_DATA_HYDRATION Mobile Data Hydration

Last updated: 2026-07-11 18:15 +02:00

## What was built

- Completed `INITIAL_DATA_HYDRATION - Mobile Data Hydration` after `RF-BE-008 - Daily Report Submit Backend`.
- Added shared mobile profile/shell hydration:
  - `apps/mobile/features/profile/mobileProfileHydration.tsx`
  - Mounted in `apps/mobile/app/_layout.tsx`
- Wired real authenticated profile data into the mobile shell and profile UI:
  - `apps/mobile/components/layout/MobileHeader.tsx`
  - `apps/mobile/app/(tabs)/profile.tsx`
  - `apps/mobile/components/profile/ProfileSummaryCard.tsx`
  - `apps/mobile/components/profile/ProfilePaymentCard.tsx`
- Hydrated Home depot labels while leaving RF-BE-006 `useLocalShiftTimer` as the source of truth for current shift timing:
  - `apps/mobile/app/(tabs)/home.tsx`
- Added read-only current-month shift history loading and mapping:
  - `apps/mobile/features/shifts/shiftBackend.ts`
  - `apps/mobile/features/history/historyHydration.ts`
  - `apps/mobile/app/(tabs)/history.tsx`
- Extended mobile history status display to support server `draft` shifts:
  - `apps/mobile/features/mock/history.ts`
  - `apps/mobile/components/history/HistoryShiftRow.tsx`
  - `apps/mobile/components/history/SelectedDaySummary.tsx`
  - `apps/mobile/app/history/[date].tsx`
- Updated `context/progress-tracker.md`:
  - Last completed is now `INITIAL_DATA_HYDRATION Mobile Data Hydration`.
  - `RF-BE-009 - Shift Photo Upload Backend` remains the next official backend feature.

## Decisions made

- Profile/company/depot hydration is centralized in `MobileProfileHydrationProvider`; visual cards consume hydrated props/context instead of querying the backend directly.
- Hydration uses real `profiles` fields first and preserves approved mock values as fallback for fields/features not built yet.
- Company and primary depot display labels are loaded read-only from `companies` and `depots`; if those reads fail or return no row, existing mock labels remain visible.
- Home timer state stays owned by RF-BE-006 `useLocalShiftTimer`; the real backend field is `start_time`, not `started_at`.
- History uses server `shifts` rows for the active courier/current German month only when rows exist. If the query returns no rows or fails, the existing mock month/list/layout remains intact.
- History detail pages remain mock/local-submitted-report based. Full server-backed daily history details remain for `RF-BE-013`.
- Mailbox counts, notifications, documents, signature preview, planned schedule windows, vehicle assignment and proof-photo upload remain mock/fallback UI.
- No backend schema, migrations, RLS policies, storage policies or mutation behavior were changed during `INITIAL_DATA_HYDRATION`.

## Problems solved

- PowerShell needs quoted or literal paths for Expo Router folders/files containing `(tabs)` and `[date]`.
- Adding server `draft` shifts to history required extending all status-tone maps that consume `HistoryShiftStatus`.
- Expo lint warned about changing hook dependencies in `history.tsx`; fixed by memoizing the submitted-shift fallback list.
- `git diff --check` passes; Git still reports only normal LF-to-CRLF normalization warnings for touched files.

## Current state

- Verification passed:
  - `npm --workspace mobile run typecheck`
  - `npm --workspace mobile run lint`
  - `git diff --check`
- Current working tree has uncommitted hydration changes in:
  - `apps/mobile/app/(tabs)/history.tsx`
  - `apps/mobile/app/(tabs)/home.tsx`
  - `apps/mobile/app/(tabs)/profile.tsx`
  - `apps/mobile/app/_layout.tsx`
  - `apps/mobile/app/history/[date].tsx`
  - `apps/mobile/components/history/HistoryShiftRow.tsx`
  - `apps/mobile/components/history/SelectedDaySummary.tsx`
  - `apps/mobile/components/layout/MobileHeader.tsx`
  - `apps/mobile/components/profile/ProfilePaymentCard.tsx`
  - `apps/mobile/components/profile/ProfileSummaryCard.tsx`
  - `apps/mobile/features/mock/history.ts`
  - `apps/mobile/features/shifts/shiftBackend.ts`
  - `context/progress-tracker.md`
  - new `apps/mobile/features/history/historyHydration.ts`
  - new `apps/mobile/features/profile/mobileProfileHydration.tsx`
- `RF-BE-008 - Daily Report Submit Backend` is recorded complete in `context/progress-tracker.md` and should be treated as already implemented.
- Manual mobile visual/device verification was not run after the hydration patch.
- Do not revert the uncommitted hydration changes unless explicitly requested.

## Next session starts with

1. Run `/remember restore`.
2. Read the RouteForge context files in the required `AGENTS.md` order before implementation.
3. Inspect the current hydration diff if needed and optionally run mobile on device/Expo Go to visually verify Header, Home, Historie and Profil.
4. Start `RF-BE-009 - Shift Photo Upload Backend`.
5. Keep RF-BE-009 focused on proof photo upload/storage/metadata; do not fold in signature artifact access (`RF-BE-010`), admin approval (`RF-BE-011`) or full history backend (`RF-BE-013`) unless the build plan is explicitly updated.

## Open questions

- Should the new `INITIAL_DATA_HYDRATION` checkpoint remain as a standalone tracker item, or should it later be folded into `RF-BE-013 History Backend` / production polish notes?
- When RF-BE-009 is implemented, should the Home package counters start reading from the active shift row immediately, or wait until daily report/history backend consolidation?
