# Memory - RF-MOB-001 Mobile Shell and NativeWind Cleanup

Last updated: 2026-06-26 19:20 +02:00

## What was built

- Completed `RF-MOB-001 - Mobile Shell and Navigation`.
- Replaced the Expo starter tab surface with the RouteForge courier shell.
- Added RouteForge mobile tabs:
  - `Home`
  - `Historie`
  - `Bericht`
  - `Postfach`
  - `Profil`
- Added/updated mobile shell files:
  - `apps/mobile/app/_layout.tsx`
  - `apps/mobile/app/index.tsx`
  - `apps/mobile/app/(tabs)/_layout.tsx`
  - `apps/mobile/app/(tabs)/index.tsx`
  - `apps/mobile/app/(tabs)/explore.tsx`
  - `apps/mobile/app/(tabs)/home.tsx`
  - `apps/mobile/app/(tabs)/history.tsx`
  - `apps/mobile/app/(tabs)/report.tsx`
  - `apps/mobile/app/(tabs)/mailbox.tsx`
  - `apps/mobile/app/(tabs)/profile.tsx`
- Added reusable RouteForge mobile UI primitives:
  - `apps/mobile/components/layout/MobileScreen.tsx`
  - `apps/mobile/components/layout/MobileHeader.tsx`
  - `apps/mobile/components/layout/RouteForgeCard.tsx`
  - `apps/mobile/components/ui/StatusBadge.tsx`
  - `apps/mobile/components/ui/RfIcon.tsx`
- Added mock shell data in `apps/mobile/features/mock/mobileShell.ts`.
- Added RouteForge theme token constants in `apps/mobile/constants/routeforgeTheme.ts`.
- Installed and configured NativeWind for `apps/mobile`:
  - `apps/mobile/global.css`
  - `apps/mobile/tailwind.config.js`
  - `apps/mobile/babel.config.js`
  - `apps/mobile/metro.config.js`
  - `apps/mobile/nativewind-env.d.ts`
  - `apps/mobile/package.json`
  - `package-lock.json`
- Mapped RouteForge design tokens to NativeWind utilities such as `bg-rfPrimary`, `text-rfTextPrimary`, `border-rfBorder` and `rounded-rf3xl`.
- Refactored RouteForge-created mobile shell screens/components from `StyleSheet.create` to `className`.
- Cleaned up remaining easy Expo starter/template styles:
  - `apps/mobile/components/themed-text.tsx`
  - `apps/mobile/components/themed-view.tsx`
  - `apps/mobile/components/ui/collapsible.tsx`
  - `apps/mobile/app/modal.tsx`
- Updated app identity/icon configuration in `apps/mobile/app.json` so the app uses the provided `apps/mobile/assets/images/icon.png`.
- Updated `context/ui-registry.md` and `context/progress-tracker.md`.

## Decisions made

- NativeWind is now the preferred styling path for static mobile UI styling.
- RouteForge token utilities in `apps/mobile/tailwind.config.js` are the source of truth for NativeWind color/radius classes.
- Runtime/animated styles can remain style objects when values are computed dynamically.
- React Navigation option styles such as `tabBarStyle` can remain object styles.
- The mobile shell remains mock-data-first and does not connect auth, backend, GPS, timer persistence, report validation or document download logic yet.
- German labels remain the default mobile UI language.
- The user-provided `apps/mobile/assets/images/icon.png` is the app icon and should not be replaced.

## Problems solved

- NativeWind setup required Expo-specific configuration: global CSS import, Babel preset, Metro wrapper and NativeWind environment types.
- Vector icons needed a small NativeWind interop wrapper, implemented as `RfIcon`.
- Lint may fail inside the sandbox with `EPERM` while scanning `C:\Users\Nikolay`; rerunning with elevated filesystem access and a clean Windows/Node PATH passes.
- The stale tracker note saying NativeWind was not installed was corrected.
- Hardcoded starter text color in `themed-text.tsx` was removed and replaced with RouteForge token classes.

## Current state

- Current phase is Phase 3 - Mobile App UI With Mock Data.
- Last completed feature is `RF-MOB-001 - Mobile Shell and Navigation`.
- Next feature in `context/progress-tracker.md` is `RF-MOB-002 - Mobile Login UI`.
- Verification passed:
  - `tsc --noEmit -p apps/mobile/tsconfig.json`
  - `npm --workspace mobile run lint`
  - `git diff --check`
- `git diff --check` only reports normal CRLF warnings.
- `npm install` reported moderate vulnerabilities; no `npm audit fix` was run to avoid unrelated dependency changes.
- Remaining `StyleSheet.create` in mobile is mainly `apps/mobile/components/parallax-scroll-view.tsx`, which was intentionally left because it mixes animated/runtime styles and is a low-priority Expo template helper.
- Current working tree includes the mobile shell/NativeWind changes plus the user-provided app icon change. Do not revert user changes.

## Next session starts with

Run `/remember restore`, then start `RF-MOB-002 - Mobile Login UI`.

Before implementing `RF-MOB-002`, read the required RouteForge context in `AGENTS.md` order. Because this is mobile UI work, also check:

- `context/mobile-rules.md`
- `context/ui-tokens.md`
- `context/ui-rules.md`
- `context/ui-registry.md`
- `context/designs/README.md`
- relevant mobile design references in `context/designs/mobile/`
- `apps/mobile/package.json`
- the existing RouteForge mobile shell components under `apps/mobile/components/layout/`
- the NativeWind config in `apps/mobile/tailwind.config.js`

Expected next scope:

- Build the mobile login UI with mock data only.
- Use NativeWind classes and existing RouteForge mobile primitives.
- Keep German labels.
- Do not wire live auth yet unless the build plan explicitly asks for it.
- Update `context/progress-tracker.md` after completion.
- Update `context/ui-registry.md` through `/imprint` if new UI patterns are created.

## Open questions

- Whether to partially refactor `apps/mobile/components/parallax-scroll-view.tsx` later or remove unused Expo starter helpers as RouteForge screens replace them.
- Whether to run `npm audit` / dependency remediation later as a separate maintenance task.
- Whether to apply database migrations and seed data to a live/local InsForge backend after the UI mock phase advances.
