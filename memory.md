# Memory - RF-ADM-002 Admin Shell and Navigation

Last updated: 2026-07-01 18:20 +02:00

## What was built

- Completed `RF-ADM-002 - Admin Shell and Navigation`.
- Added the shared admin shell for `/admin/*` routes:
  - `apps/admin/app/admin/layout.tsx`
- Added reusable admin layout components:
  - `apps/admin/components/layout/Sidebar.tsx`
  - `apps/admin/components/layout/SidebarItem.tsx`
  - `apps/admin/components/layout/Topbar.tsx`
  - `apps/admin/components/layout/CompanySwitcher.tsx`
- Added mock shell data:
  - `apps/admin/lib/mock/adminShell.ts`
- Slimmed the existing dashboard route into content that renders inside the shell:
  - `apps/admin/app/admin/dashboard/page.tsx`
- Updated RouteForge context:
  - `context/progress-tracker.md`
  - `context/ui-registry.md`

## Decisions made

- The admin shell is implemented as a server `app/admin/layout.tsx`; only the sidebar is a Client Component because installed Next.js 16.2.9 requires `usePathname()` for active route state in layout navigation.
- Sidebar navigation labels are exactly the RF-ADM-002 scope: Dashboard, Schichten, Kuriere, Dispatcher, Depots, Dokumente, Einladungen, Exporte, Audit Logs and Einstellungen.
- The topbar shows mock company/workspace data, mock notifications and a mock user menu. These controls are visual only for now.
- RF-ADM-002 remains UI/mock-only: no InsForge auth, middleware, session storage, protected route checks, permission enforcement, backend calls or RLS changes were added.
- Feature pages beyond `/admin/dashboard` remain out of scope until their own Feature IDs, even though sidebar links are visible.

## Problems solved

- The minimal RF-ADM-001 dashboard route no longer owns a full-page wrapper; it now renders correctly inside the shared admin shell.
- Active sidebar state is handled without making the whole admin layout a Client Component.
- New admin shell, sidebar item, topbar and company switcher patterns were imprinted into `context/ui-registry.md`.
- Verification passed:
  - `& 'C:\Program Files\nodejs\npm.cmd' --workspace admin run typecheck`
  - `& 'C:\Program Files\nodejs\npm.cmd' --workspace admin run lint`
  - focused scan for hardcoded hex values and raw Tailwind color utilities in touched RF-ADM-002 admin files
  - `git -c safe.directory='C:/Users/Nikolay/Desktop/routeforge' diff --check` with only line-ending warnings
  - existing admin dev server at `http://localhost:3000` returned `200` for `/admin/dashboard` and included RouteForge shell/navigation content

## Current state

- Phase 5 - Admin Panel UI With Mock Data is complete through `RF-ADM-002`.
- Last completed feature in `context/progress-tracker.md` is `RF-ADM-002 - Admin Shell and Navigation`.
- Next feature in `context/progress-tracker.md` is `RF-ADM-003 - Admin Dashboard UI`.
- The admin dev server was already running at `http://localhost:3000`; verify it is still running before relying on it in a fresh session.
- Expected uncommitted admin work includes RF-ADM-001 and RF-ADM-002 files plus `context/progress-tracker.md`, `context/ui-registry.md` and this memory update.
- Git commands may need `-c safe.directory='C:/Users/Nikolay/Desktop/routeforge'` and may show user-level ignore permission warnings for `C:\Users\Nikolay/.config/git/ignore`.

## Next session starts with

Start `RF-ADM-003 - Admin Dashboard UI`.

Before implementing:

- Read required RouteForge context in `AGENTS.md` order.
- Because the feature touches `apps/admin`, inspect the installed Next.js version and relevant installed docs under `apps/admin/node_modules/next/dist/docs/`.
- Check the admin dashboard design reference at `context/designs/admin/admin-dashboard.png`.

Expected next scope:

- Build the actual admin dashboard UI inside the existing admin shell.
- Use mock data first, German labels and RouteForge token classes.
- Do not add real InsForge auth, middleware, backend data fetching, protected-route logic or analytics.

## Open questions

- None currently blocking `RF-ADM-003`.
