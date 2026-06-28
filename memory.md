# Memory - RF-CLEAN-001 Monorepo Hygiene Checkpoint

Last updated: 2026-06-28 10:58 +02:00

## What was built

- Completed `RF-CLEAN-001 - Monorepo Hygiene, Duplicate Files, Generated Folders, and Structure Sync`.
- Removed the duplicate tracked admin lockfile:
  - `apps/admin/package-lock.json`
- Removed inspected unused starter/template files:
  - `apps/admin/public/file.svg`
  - `apps/admin/public/globe.svg`
  - `apps/admin/public/next.svg`
  - `apps/admin/public/vercel.svg`
  - `apps/admin/public/window.svg`
  - `apps/mobile/app/modal.tsx`
  - `apps/mobile/app/(tabs)/explore.tsx`
  - `apps/mobile/components/external-link.tsx`
  - `apps/mobile/components/hello-wave.tsx`
  - `apps/mobile/components/parallax-scroll-view.tsx`
  - `apps/mobile/components/themed-text.tsx`
  - `apps/mobile/components/themed-view.tsx`
  - `apps/mobile/components/ui/collapsible.tsx`
  - `apps/mobile/components/ui/icon-symbol.ios.tsx`
  - `apps/mobile/components/ui/icon-symbol.tsx`
  - `apps/mobile/constants/theme.ts`
  - `apps/mobile/hooks/use-color-scheme.ts`
  - `apps/mobile/hooks/use-color-scheme.web.ts`
  - `apps/mobile/hooks/use-theme-color.ts`
  - `apps/mobile/scripts/reset-project.js`
- Updated cleanup/tooling files:
  - `.gitignore`
  - `apps/admin/README.md`
  - `apps/mobile/README.md`
  - `apps/admin/package.json`
  - `apps/mobile/package.json`
  - `apps/admin/app/layout.tsx`
  - `apps/mobile/app/(tabs)/_layout.tsx`
  - `context/progress-tracker.md`
  - `context/ui-registry.md`
  - `memory.md`

## Decisions made

- Root npm workspaces are the intended package manager structure.
- The monorepo should keep one root `package-lock.json`; app package files stay, app lockfiles should not.
- Local generated folders stay local and ignored; they were not deleted.
- App-level `AGENTS.md`, app-level `CLAUDE.md`, root `.agents`, admin `.agents`, mobile `.claude` and mobile `.vscode` were intentionally kept as tooling/project guidance.
- `packages/shared` still needs an explicit lint setup later if shared lint coverage is required by root lint.

## Problems solved

- Removed starter README content for Next and Expo.
- Removed unused Next starter public assets.
- Removed unused Expo starter route/helper files after reference scans showed no live imports.
- Added mobile/admin typecheck scripts so root `npm run typecheck` covers `@routeforge/shared`, `admin` and `mobile`.
- Normalized admin metadata, German document language and Inter font usage.
- Expanded root `.gitignore` for dependency folders, framework/build output, env files, logs, OS/editor noise and generated type stubs.
- Verification passed:
  - root typecheck passed after adding `C:\Program Files\nodejs` to PATH for Turbo child processes
  - root lint passed after elevated rerun for the known sandbox-only ESLint resolver `EPERM` while scanning `C:\Users\Nikolay`

## Current state

- Current phase remains Phase 4 - Mobile App Local Logic.
- Last completed checkpoint is `RF-CLEAN-001`.
- Next feature remains `RF-MOB-012 - Timer Local State`.
- No RF-MOB-012 timer state, AsyncStorage persistence, GPS capture, backend logic or product feature implementation was started.
- Local generated folders exist (`node_modules`, `.next`, `.expo`, `.turbo`) but are not tracked and are covered by ignore rules.

## Next session starts with

Start `RF-MOB-012 - Timer Local State`.

Before implementing, read the full `AGENTS.md` context order and inspect the current-shift files:

- `apps/mobile/app/(tabs)/home.tsx`
- `apps/mobile/components/shift/CurrentShiftCard.tsx`
- `apps/mobile/features/mock/currentShift.ts`

Keep RF-MOB-012 scoped to local timer state only unless the build plan says otherwise.

## Open questions

- Whether to add a root ESLint config plus `packages/shared` lint script before or during a later tooling checkpoint.
- Whether app-level `.vscode` settings should remain tracked long term or move to a root editor configuration.
