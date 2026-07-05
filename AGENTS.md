<!-- BEGIN:routeforge-agent-rules -->RouteForge Agent Rules

RouteForge is a multi-tenant courier operations platform.

This repository is context-driven. Do not guess product rules from generic SaaS apps. Before writing code, read the project context files and follow them as the source of truth.

<!-- END:routeforge-agent-rules --><!-- BEGIN:nextjs-agent-rules -->This is NOT the Next.js you know

The admin app uses Next.js. Installed Next.js APIs, routing conventions, server/client boundaries, and file structure may differ from your training data.

Before changing "apps/admin", read the relevant installed documentation from:

node_modules/next/dist/docs/

Respect deprecations and the actual installed version.

<!-- END:nextjs-agent-rules --><!-- BEGIN:expo-agent-rules -->This is NOT generic React Native

The mobile app uses Expo React Native.

Before changing "apps/mobile", inspect the installed Expo / React Native versions and existing app structure. Do not assume generic React Native setup. Follow the project’s mobile rules, navigation conventions, permissions, and UI patterns.

<!-- END:expo-agent-rules -->---

Read Before Anything Else

Read in this exact order before any implementation:

1. "context/project-overview.md"
2. "context/architecture.md"
3. "context/data-model.md"
4. "context/permissions.md"
5. "context/security-gdpr.md"
6. "context/mobile-rules.md"
7. "context/admin-rules.md"
8. "context/ui-tokens.md"
9. "context/ui-rules.md"
10. "context/ui-registry.md"
11. "context/designs/README.md"
12. "context/code-standards.md"
13. "context/library-docs.md"
14. "context/build-plan.md"
15. "context/progress-tracker.md"
16. "context/codex-workflow.md"

If these files conflict, stop and resolve the conflict before coding. Do not silently choose one rule over another.

---

Project Structure

Expected repository structure:

apps/mobile      -> Expo React Native courier app
apps/admin       -> Next.js admin panel
packages/shared  -> shared types, schemas, permissions, payroll, constants, translations
context          -> Codex/project context files
insforge         -> migrations, RLS, storage policies
docs             -> documentation

Work only inside the relevant area for the requested feature.

Do not make broad unrelated changes.

---

Product Source of Truth

RouteForge is:

Multi-tenant courier operations platform

Backend:

InsForge Auth + DB + Storage + RLS

Do not add or assume:

GPT-4o
Adzuna API
Browserbase
Stagehand
PostHog
Live GPS tracking

If any old reference suggests these, treat it as stale and remove or ignore it.

---

Locked Product Decisions

These rules never change unless the user explicitly updates the context:

- Multi-tenant from v1.
- Every company has its own workspace.
- Admin has full company access.
- Dispatcher only sees depots assigned by admin.
- Courier sees only own profile, shifts, mailbox, documents, and PDFs.
- Courier registration happens through email invite code.
- New courier starts as "pending_approval".
- One courier has only one shift per day in v1.
- GPS stores only start and stop location.
- No live tracking.
- If start/stop is outside depot geofence, admin/dispatcher sees a warning.
- Shift proof photos are kept for 14 days, then files are deleted.
- Payslips, contracts, and private documents are not part of 14-day cleanup.
- PDFs must support company stamp PNG.
- German is the default UI language.
- Bulgarian is optional via translation keys.
- Development style is UI-first, mock-data-first, feature-by-feature.

---

Payment Rules

RouteForge supports these payment modes:

hourly
daily_fixed

"hourly"

- Real tracked time is stored.
- Legal breaks are handled.
- Billable cap is 10:00h / 600 minutes.
- Timer auto-stops at 10h.

"daily_fixed"

- Real tracked time is still stored.
- Billable default is 8:20h / 500 minutes.

Overrides

Admin/dispatcher may create billable overrides only with a required reason.

Every correction or override must write an audit log entry.

Never implement payroll logic without checking:

context/data-model.md
context/permissions.md
context/security-gdpr.md
packages/shared

---

UI Rules That Never Change

- Never use hardcoded hex values.
- Never use raw Tailwind color classes when project tokens exist.
- Use "context/ui-tokens.md".
- Use "context/ui-rules.md".
- Reuse patterns from "context/ui-registry.md".
- Before building UI, check the relevant screenshot in "context/designs/".
- Screenshots are visual direction, not pixel-perfect contracts.
- Mobile and admin must look like one product family.
- Prefer:
  - white cards
  - blue primary actions
  - rounded UI
  - clean operational layout
  - high readability
  - German labels
- If creating a new UI pattern, update "context/ui-registry.md".

---

Design References

Before building mobile UI, check:

context/designs/mobile/mobile-home-current-shift.png
context/designs/mobile/mobile-history-calendar.png
context/designs/mobile/mobile-profile-mailbox-signature.png
context/designs/mobile/mobile-daily-report.png
context/designs/mobile/mobile-day-details.png
context/designs/mobile/mobile-digital-mailbox.png
context/designs/mobile/mobile-profile-documents.png

Before building admin UI, check:

context/designs/admin/admin-dashboard.png
context/designs/admin/admin-shift-review.png
context/designs/admin/admin-couriers-list.png
context/designs/admin/admin-courier-profile.png
context/designs/admin/admin-documents-upload.png

Do not invent new screenshots.

Do not create fake design assets unless the user asks.

---

Development Workflow

Default workflow:

1. Read the relevant context.
2. Inspect existing files before editing.
3. Make the smallest useful change.
4. Keep implementation feature-by-feature.
5. Prefer mock data first when building UI.
6. Move shared logic into "packages/shared" when it belongs to both mobile and admin.
7. Respect tenant boundaries and permissions.
8. Update tracking/context files after the feature.

After every completed feature, update:

context/progress-tracker.md

After every new UI component or reusable UI pattern, update:

context/ui-registry.md

If the feature changes rules, permissions, data model, or security behavior, also update the relevant context file:

context/data-model.md
context/permissions.md
context/security-gdpr.md
context/mobile-rules.md
context/admin-rules.md

---

Security and Multi-Tenant Rules

Never leak data across tenants.

Every tenant-owned entity must be scoped by company/workspace.

Never let courier access another courier’s data.

Never let dispatcher access depots not assigned to them.

Never bypass RLS with frontend-only checks.

Frontend permission checks improve UX, but backend/RLS remains the real boundary.

Sensitive files must stay private.

Private storage includes:

payslips
contracts
employment documents
courier private documents
company PDFs

Shift proof photos are temporary and must follow the 14-day retention rule.

---

Admin App Rules

For "apps/admin":

- Admin UI is operational, dense, and clean.
- Use tables, filters, detail panels, review cards, and audit panels.
- Admin can manage company-scoped data.
- Dispatcher access must be depot-scoped.
- Any approval, override, correction, document upload, or permission change must be auditable.
- Do not build admin screens without checking "context/admin-rules.md".
- Do not build admin UI without checking the matching admin screenshot.

---

Mobile App Rules

For "apps/mobile":

- Courier UI must be simple, direct, and hard to misuse.
- German labels by default.
- Large readable actions.
- Start/stop shift flows must be clear.
- One shift per courier per day in v1.
- GPS is only start/stop proof, not live tracking.
- Mobile must not expose admin or dispatcher-only data.
- Do not build mobile screens without checking "context/mobile-rules.md".
- Do not build mobile UI without checking the matching mobile screenshot.

---

Library Rules

Before adding or changing any third-party library:

1. Check the installed package and version.
2. Read relevant installed docs if available.
3. Read "context/library-docs.md".
4. Prefer existing project libraries over adding new ones.
5. Do not introduce new dependencies without strong reason.

Do not add analytics, AI, scraping, browser automation, or tracking libraries unless the user explicitly changes the product direction.

---

Code Quality Rules

- Keep code readable and boring.
- Prefer explicit names over clever abstractions.
- Keep business logic out of UI components when it belongs in shared modules.
- Validate inputs.
- Keep tenant, role, depot, and courier access rules visible in code.
- Do not hide security-sensitive decisions inside UI-only logic.
- Avoid large refactors during feature work.
- Do not delete files unless the user explicitly requests it.
- Do not change existing files without inspecting them first.
- Do not leave dead code, fake TODOs, or unused imports.

---

Recovery Rules

If the same problem persists after one corrective attempt:

Stop immediately and run /recover

Do not keep patching blindly.

If implementation becomes uncertain because context is missing:

Stop and ask for the missing context

If a file appears stale or contradictory:

Stop and report the contradiction

---

Available Skills

Use these commands intentionally:

- "/architect" — before any complex feature or cross-app change.
- "/imprint" — after any new UI component or reusable UI pattern.
- "/review" — before demo, PR, or when something feels off.
- "/recover" — when something breaks after one failed correction.
- "/remember save" — when a feature spans multiple sessions.
- "/remember restore" — when returning after a multi-session feature.

---

Final Rule

RouteForge must stay clean, consistent, and context-driven.

Do not optimize for speed over structure.

Do not guess.

Read the context, follow the locked decisions, build one feature at a time, and keep the project ready for long-term development.

<!-- INSFORGE:START -->
## InsForge backend

This project uses [InsForge](https://insforge.dev): an all-in-one, open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, realtime, an AI model gateway, and payments through one platform.

- **Project:** **RouteForge** (API base `https://wiaiaz67.eu-central.insforge.app`)
- **Skills:** these InsForge skills are installed for supported coding agents. Reach for them before implementing any InsForge feature instead of guessing the API:
  - `insforge`: app code with the `@insforge/sdk` client (database CRUD, auth, storage, edge functions, realtime, AI, email, and Stripe payments).
  - `insforge-cli`: backend and infrastructure via the `insforge` CLI (projects, SQL, migrations, RLS policies, storage buckets, functions, secrets, payment setup, schedules, deploys).
  - `insforge-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, auth and OAuth issues) and running security or performance audits.
  - `insforge-integrations`: wiring external auth providers (Clerk, Auth0, WorkOS, Better Auth, etc.) for JWT-based RLS, or the OKX x402 payment facilitator.
  - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `.insforge/project.json`. Never hardcode or commit keys.

Key patterns:

- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.
<!-- INSFORGE:END -->
