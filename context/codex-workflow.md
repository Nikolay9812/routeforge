# Codex Workflow

How Codex must work inside RouteForge.

RouteForge must be built context-first, UI-first and feature-by-feature. Do not skip steps. Do not implement broad unrelated changes.

---

## Read Order

Before any implementation, Codex must read these files in order:

```txt
context/project-overview.md
context/architecture.md
context/build-plan.md
context/progress-tracker.md
context/code-standards.md
context/data-model.md
context/permissions.md
context/security-gdpr.md
context/ui-tokens.md
context/ui-rules.md
context/mobile-rules.md
context/admin-rules.md
context/ui-registry.md
context/library-docs.md
context/designs/README.md
```

For UI work, also check the relevant screenshots inside:

```txt
context/designs/mobile/
context/designs/admin/
```

If screenshots are missing, use the context rules as fallback and do not invent image files.

---

## Build Method

RouteForge is built through Feature IDs from `context/build-plan.md`.

Required sequence for every feature:

```txt
/architect FEATURE_ID
/implement FEATURE_ID
/review FEATURE_ID
/imprint FEATURE_ID   # required when UI patterns changed
/remember save
```

If something breaks:

```txt
/recover FEATURE_ID
```

---

## Absolute Rules

Codex must:

- work only on the requested Feature ID
- read `context/progress-tracker.md` before choosing the next feature
- use mock data first for UI phases
- build visible UI before backend integration
- keep mobile and admin visually consistent
- use German labels by default
- keep Bulgarian optional through translation keys
- enforce multi-tenant assumptions from the beginning
- use shared types/schemas/business logic in `packages/shared`
- update `context/ui-registry.md` after creating or changing UI patterns
- update `context/progress-tracker.md` after completing a feature

Codex must not:

- skip ahead in `build-plan.md`
- silently add external services
- introduce live GPS tracking
- introduce public document links
- change locked product decisions without explicit instruction
- put business rules only in UI components
- use hardcoded colors in components
- create fake design screenshots
- delete existing files unless explicitly instructed

---

## Feature Planning: `/architect FEATURE_ID`

Before implementation, Codex should produce a short plan:

- feature goal
- files likely to change
- context files used
- UI references used if applicable
- data model impact
- permission/security impact
- test/review checklist

No implementation should happen during `/architect` unless explicitly requested.

---

## Implementation: `/implement FEATURE_ID`

Implementation rules:

- change only files required for the feature
- prefer small focused components
- keep shared logic in `packages/shared`
- keep mobile feature logic in `apps/mobile/features`
- keep admin server logic in `apps/admin/actions`, `apps/admin/lib` or route handlers
- keep presentational components free from direct database mutations
- use existing UI registry patterns first
- use mock data in UI-first phases

---

## Review: `/review FEATURE_ID`

Review should check:

- feature matches build-plan scope
- no unrelated files were changed
- TypeScript strictness
- permission rules
- tenant isolation
- mobile/admin visual consistency
- German labels
- UI tokens instead of hardcoded colors
- loading, empty and error states where relevant
- audit log requirements for sensitive actions

---

## Imprint: `/imprint FEATURE_ID`

Required when UI is created or changed.

Update `context/ui-registry.md` with:

- component/screen name
- app surface: mobile or admin
- Feature ID
- file path
- purpose
- token/class pattern
- states supported
- notes/constraints

If a new reusable visual pattern was created and not recorded, the feature is not complete.

---

## Remember: `/remember save`

After a feature is complete, update project memory with:

- completed Feature ID
- important files changed
- decisions made
- known limitations
- next Feature ID

Also update `context/progress-tracker.md`.

---

## Recover: `/recover FEATURE_ID`

Use when implementation gets messy or broken.

Recovery steps:

1. Stop expanding scope
2. Identify changed files
3. Compare changes to Feature ID requirements
4. Revert unrelated work
5. Fix the smallest broken piece first
6. Re-read relevant context files
7. Continue only inside feature scope

---

## Locked Product Decisions

These are not open for reinterpretation during normal feature work:

- Multi-tenant from v1
- InsForge Auth + DB + Storage + RLS
- Courier registration through email invite code
- New courier starts as `pending_approval`
- One courier has one shift per day in v1
- Admin has full company access
- Dispatcher is depot-scoped
- Courier is self-scoped
- Payment modes are `hourly` and `daily_fixed`
- Hourly billable cap is 600 minutes / 10:00h
- Daily fixed default billable time is 500 minutes / 8:20h
- Billable overrides require reason
- Corrections and overrides create audit logs
- GPS is start/stop only
- No live tracking in v1
- Shift proof photos are retained 14 days
- Documents/payslips/contracts are private and not deleted by photo cleanup
- PDFs support company stamp PNG
- German is default UI language
- Bulgarian is optional through translation keys
- UI-first, mock-data-first development

---

## Forbidden Additions in v1

Do not add:

- live tracking
- customer-facing tracking portal
- automatic Amazon route import
- bank transfer execution
- tax calculation
- public marketing site
- SaaS billing console
- AI automation features
- external job search APIs
- browser automation tooling
- analytics provider integrations

RouteForge must become operationally solid before anything else is added.
