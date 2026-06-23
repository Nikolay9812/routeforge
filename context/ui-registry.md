# UI Registry

Living document for RouteForge UI. Updated after every screen, component, or reusable visual pattern is built. Read this before building any new UI — match existing patterns exactly before inventing new ones.

This file connects the implementation to:

- `context/ui-tokens.md`
- `context/ui-rules.md`
- `context/designs/`
- `context/build-plan.md`

RouteForge has two UI surfaces:

- `apps/mobile` — Expo courier app
- `apps/admin` — Next.js admin panel

Mobile and admin do not share UI components, but they must share the same visual language: white cards, blue primary actions, rounded corners, clear status badges and German-first operational labels.

---

## How to Use

Before building any component or screen:

1. Find the current Feature ID in `context/build-plan.md`
2. Check the relevant design reference in `context/designs/`
3. Check if a similar component or pattern already exists in this registry
4. If yes — match its layout, tokens, classes and behavior
5. If no — build it using `ui-rules.md` and `ui-tokens.md`
6. After implementation — add the component or pattern here
7. Run `/imprint FEATURE_ID` after UI changes

After building any component, update this file with:

- Component name
- App surface: mobile or admin
- Feature ID
- File path
- Purpose
- Exact classes or style pattern used
- States supported
- Notes or constraints

---

## Registry Status Values

Use one of these values for every registered UI pattern:

| Status        | Meaning                                      |
| ------------- | -------------------------------------------- |
| `planned`     | Planned but not implemented                  |
| `implemented` | Built in code but not visually approved      |
| `approved`    | Built, reviewed and matches RouteForge style |
| `deprecated`  | Should not be used for new UI                |

---

## Global Visual Language

These patterns apply to both mobile and admin.

### Product Feel

```txt
clean
operational
blue-and-white
rounded
card-based
high readability
German-first labels
calm spacing
trustworthy
```

### Do Not Drift From

```txt
primary color: RouteForge blue
cards: white surfaces
borders: soft neutral
radius: large rounded cards
status: badges, not full colored pages
danger: red/error token group
pending: warning token group
approved: success token group
```

### Never Use

```txt
JobPilot purple
random Tailwind colors
hardcoded hex values inside components
different design systems for mobile and admin
heavy gradients on card backgrounds
raw error messages
tiny operational buttons
```

---

## Core Shared UI Patterns

These are conceptual patterns. Mobile and admin implement them separately.

### Card Pattern

**Purpose:** Default container for every major content section.

**Status:** planned

**Token Pattern:**

```txt
background: bg-surface
border: border border-border
text: text-text-primary
```

**Admin Classes:**

```txt
rounded-2xl border border-border bg-surface p-6 shadow-card
```

**Mobile Classes:**

```txt
rounded-3xl border border-border bg-surface p-5
```

**Rules:**

- Use cards for sections, not random floating content
- Do not use colored card backgrounds except for alerts or highlighted states
- Do not nest more than necessary

---

### Status Badge Pattern

**Purpose:** Show shift, profile, invitation, document and geofence states.

**Status:** planned

**Base Classes:**

```txt
inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold
```

**Status Token Map:**

| Meaning          | Classes                                                      |
| ---------------- | ------------------------------------------------------------ |
| Success / active | `bg-success-lightest text-success-foreground`                |
| Info / submitted | `bg-info-lightest text-info-foreground`                      |
| Warning / pending | `bg-warning-lightest text-warning-foreground`               |
| Error / rejected | `bg-error-lightest text-error-foreground`                    |
| Neutral / draft  | `bg-neutral-light text-neutral-foreground`                   |
| Corrected        | `bg-primary-lightest text-primary-darker`                    |

**Rules:**

- Do not invent new status colors
- Use German labels by default
- Badges must be readable at a glance

---

### Primary Button Pattern

**Purpose:** Main positive action.

**Status:** planned

**Admin Classes:**

```txt
inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-dark
```

**Mobile Classes:**

```txt
items-center justify-center rounded-2xl bg-primary px-5 py-3
```

**Mobile Text Classes:**

```txt
text-[15px] font-bold text-primary-foreground
```

**Used For:**

- Schicht starten
- Bericht einreichen
- Einladung erstellen
- PDF herunterladen
- Speichern

**Rules:**

- Do not use primary button for destructive actions
- Mobile primary actions must be large
- Main shift action must be visually dominant

---

### Secondary Button Pattern

**Purpose:** Secondary non-destructive action.

**Status:** planned

**Admin Classes:**

```txt
inline-flex items-center justify-center rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary hover:bg-surface-secondary
```

**Mobile Classes:**

```txt
items-center justify-center rounded-2xl border border-border bg-surface px-5 py-3
```

**Rules:**

- Use for cancel, back, edit, secondary download
- Do not overload screens with too many secondary buttons

---

### Danger Button Pattern

**Purpose:** Destructive or negative actions.

**Status:** planned

**Classes:**

```txt
rounded-xl bg-error text-error-foreground
```

**Used For:**

- Schicht ablehnen
- Einladung widerrufen
- Kurier sperren
- Löschen

**Rules:**

- Dangerous actions require confirmation
- Reject/correct actions require a reason
- Never use primary blue for destructive actions

---

### Empty State Pattern

**Purpose:** Explain empty sections clearly.

**Status:** planned

**Text Style:**

```txt
text-sm text-text-muted
```

**Examples:**

```txt
Keine Schichten gefunden.
Noch keine Dokumente im Postfach.
Keine Einladungen vorhanden.
Keine Kuriere in diesem Depot.
```

**Rules:**

- Never show blank tables without explanation
- Include CTA only when there is a logical next action
- Use German by default

---

### Loading State Pattern

**Purpose:** Keep user informed while data or mutation is loading.

**Status:** planned

**Rules:**

- Use skeleton cards for dashboard and tables
- Use disabled loading button during mutations
- Prevent duplicate submit
- Mobile upload/loading state must be obvious
- Never leave user unsure whether the app is working

---

### Error State Pattern

**Purpose:** Show safe and human-readable errors.

**Status:** planned

**Classes:**

```txt
rounded-2xl border border-error-light bg-error-lightest p-4 text-error-foreground
```

**Examples:**

```txt
Die Schicht konnte nicht gespeichert werden.
Das Dokument konnte nicht hochgeladen werden.
Bitte überprüfe die eingegebenen Daten.
Keine Verbindung. Der Bericht wurde lokal gespeichert.
```

**Rules:**

- Never show raw DB errors
- Never show stack traces
- Preserve user input after errors
- Offline errors must not delete local draft

---

## Mobile Registry

Mobile UI lives in:

```txt
apps/mobile
```

Mobile uses:

```txt
Expo
Expo Router
React Native
NativeWind
```

---

### Mobile Screen Container

**Status:** planned  
**Feature ID:** RF-MOB-001  
**Path:** `apps/mobile/components/layout/MobileScreen.tsx`

**Purpose:** Default screen wrapper for mobile pages.

**Classes:**

```txt
flex-1 bg-background px-4 py-4
```

**Optional Dotted Background Variant:**

```txt
flex-1 bg-background-dotted px-4 py-4
```

**Rules:**

- Use on all primary mobile screens
- Keep padding consistent
- Do not place dense content directly on dotted background without white cards

---

### Mobile Header

**Status:** planned  
**Feature ID:** RF-MOB-001  
**Path:** `apps/mobile/components/layout/MobileHeader.tsx`

**Purpose:** Shows company name, greeting, language switch and message/notification icon.

**Pattern:**

```txt
container: flex-row items-center justify-between
company label: text-xs font-semibold text-text-muted
title: text-xl font-bold text-text-primary
language badge: rounded-full bg-primary-lightest px-3 py-1
```

**Rules:**

- Company name must be visible
- German is default
- Keep header compact

---

### Mobile Bottom Tabs

**Status:** planned  
**Feature ID:** RF-MOB-001  
**Path:** `apps/mobile/app/(tabs)/_layout.tsx`

**Tabs:**

```txt
Home
Historie
Bericht
Postfach
Profil
```

**Active State:**

```txt
text-primary
```

**Inactive State:**

```txt
text-text-muted
```

**Rules:**

- Maximum 5 tabs
- Labels in German
- No admin items in mobile navigation

---

### Current Shift Card

**Status:** planned  
**Feature ID:** RF-MOB-004  
**Path:** `apps/mobile/components/shift/CurrentShiftCard.tsx`

**Purpose:** Main active shift card with timer and Start/End action.

**Container Classes:**

```txt
rounded-3xl border border-border bg-surface p-5
```

**Timer Text:**

```txt
text-[44px] font-extrabold text-text-primary
```

**Rules:**

- Timer is visually dominant
- Start/End button is the main primary action
- Payment mode must be visible
- Auto-stopped state must be clear

---

### Daily Report Form Section

**Status:** planned  
**Feature ID:** RF-MOB-005  
**Path:** `apps/mobile/components/report/ReportSectionCard.tsx`

**Purpose:** Groups operational daily report fields.

**Container Classes:**

```txt
rounded-3xl border border-border bg-surface p-5
```

**Rules:**

- Each section has a clear title
- Required fields are visually clear
- Do not make the form feel like one giant block

---

### Photo Upload Card

**Status:** planned  
**Feature ID:** RF-MOB-005 / RF-MOB-017  
**Path:** `apps/mobile/components/report/PhotoUploadCard.tsx`

**States:**

| State    | Classes                                                         |
| -------- | --------------------------------------------------------------- |
| Empty    | `border-dashed border-border-muted bg-surface-secondary`         |
| Uploaded | `border-success-light bg-success-lightest`                       |
| Error    | `border-error-light bg-error-lightest`                           |

**Photo Types:**

```txt
start_km
end_km
fahrtenbuch
mentor
```

**Rules:**

- Show preview after selection
- Allow retake/change
- Compress before upload
- Photos expire after 14 days

---

### Signature Card

**Status:** planned  
**Feature ID:** RF-MOB-018  
**Path:** `apps/mobile/components/report/SignatureCard.tsx`

**Purpose:** Capture courier signature before report submission.

**Rules:**

- Signature required before submit
- Clear button visible
- Confirm signature action visible
- Show signed timestamp after confirmation

---

### History Calendar

**Status:** planned  
**Feature ID:** RF-MOB-006  
**Path:** `apps/mobile/components/history/HistoryCalendar.tsx`

**Purpose:** Shows worked days and selected day summary.

**Worked Day:**

```txt
bg-primary-lightest text-primary-darker
```

**Selected Day:**

```txt
bg-primary text-primary-foreground
```

**Rules:**

- Monthly totals above calendar
- Worked day markers must be subtle
- Selected day must be obvious

---

### Mailbox Item Card

**Status:** planned  
**Feature ID:** RF-MOB-008  
**Path:** `apps/mobile/components/mailbox/MailboxItemCard.tsx`

**Unread Classes:**

```txt
rounded-3xl border border-primary-light bg-primary-lightest p-4
```

**Read Classes:**

```txt
rounded-3xl border border-border bg-surface p-4
```

**Rules:**

- Unread item must be visually obvious
- Category badge visible
- Download/open action clear
- Courier sees only own mailbox

---

### Profile Document Status Card

**Status:** planned  
**Feature ID:** RF-MOB-010  
**Path:** `apps/mobile/components/profile/ProfileDocumentStatusCard.tsx`

**Purpose:** Shows required courier document status.

**States:**

```txt
valid
missing
expired
uploaded
```

**Rules:**

- Missing/expired documents must be easy to notice
- Upload/update action visible
- Do not store sensitive documents permanently in local storage

---

## Admin Registry

Admin UI lives in:

```txt
apps/admin
```

Admin uses:

```txt
Next.js App Router
Tailwind CSS
shadcn/ui
lucide-react
```

---

### Admin Shell

**Status:** planned  
**Feature ID:** RF-ADM-002  
**Path:** `apps/admin/app/admin/layout.tsx`

**Purpose:** Protected admin layout with sidebar and topbar.

**Layout Pattern:**

```txt
min-h-screen bg-background
sidebar: w-[260px] border-r border-border bg-surface
main: flex-1 p-8
topbar: h-16 border-b border-border bg-surface
```

**Rules:**

- Admin uses sidebar, not top navbar
- Company name visible
- User menu visible
- Protected routes only

---

### Sidebar Item

**Status:** planned  
**Feature ID:** RF-ADM-002  
**Path:** `apps/admin/components/layout/SidebarItem.tsx`

**Active Classes:**

```txt
bg-primary-lightest text-primary
```

**Inactive Classes:**

```txt
text-text-secondary hover:bg-surface-secondary
```

**Rules:**

- Use German labels
- Active state must be obvious
- Do not use underline navigation

---

### Admin Stats Card

**Status:** planned  
**Feature ID:** RF-ADM-003  
**Path:** `apps/admin/components/dashboard/StatsCard.tsx`

**Container Classes:**

```txt
rounded-2xl border border-border bg-surface p-6 shadow-card
```

**Number Classes:**

```txt
text-3xl font-bold text-text-primary
```

**Label Classes:**

```txt
text-sm font-medium text-text-secondary
```

**Rules:**

- Use for dashboard operational metrics
- Keep number visually dominant
- Use status badge for trend/warning where needed

---

### Admin Data Table

**Status:** planned  
**Feature ID:** RF-ADM-004  
**Path:** `apps/admin/components/ui/DataTable.tsx`

**Header Classes:**

```txt
bg-surface-secondary text-xs font-semibold uppercase text-text-subtle
```

**Row Classes:**

```txt
border-b border-border-light bg-surface hover:bg-surface-secondary
```

**Rules:**

- No alternating row colors
- Status uses badges
- Geofence warning uses badge/icon, not full red row
- Use pagination for large data

---

### Shift Filters Bar

**Status:** planned  
**Feature ID:** RF-ADM-004 / RF-ADM-016  
**Path:** `apps/admin/components/shifts/ShiftFilters.tsx`

**Purpose:** Filter shifts by date, depot, status, courier and payment mode.

**Pattern:**

```txt
rounded-2xl border border-border bg-surface p-4
```

**Rules:**

- Filters appear above table
- Empty state shown when no results
- Do not hide important filters in v1

---

### Shift Review Details Panel

**Status:** planned  
**Feature ID:** RF-ADM-005  
**Path:** `apps/admin/components/shifts/ShiftDetailsPanel.tsx`

**Purpose:** Shows selected shift details, photos, GPS warnings and action buttons.

**Rules:**

- Approval actions must be visible
- Reject/correct require reason
- Geofence warnings must be red
- Signature visible
- Photos displayed in grid

---

### Correction Reason Field

**Status:** planned  
**Feature ID:** RF-ADM-006 / RF-ADM-017  
**Path:** `apps/admin/components/shifts/CorrectionReasonField.tsx`

**Purpose:** Required reason field for sensitive corrections.

**Rules:**

- Save disabled until reason is provided
- Reason must be audit logged
- Do not allow empty correction reason

---

### Courier Table

**Status:** planned  
**Feature ID:** RF-ADM-007  
**Path:** `apps/admin/components/couriers/CouriersTable.tsx`

**Purpose:** Shows courier management list.

**Columns:**

```txt
Name
Depot
Status
Payment Mode
Last Shift
Documents
Actions
```

**Rules:**

- Status badges for profile status
- Document status visible
- Invite courier action near the table

---

### Dispatcher Depot Access Selector

**Status:** planned  
**Feature ID:** RF-ADM-009 / RF-ADM-019  
**Path:** `apps/admin/components/dispatchers/DispatcherDepotAccess.tsx`

**Purpose:** Allows admin to assign one, multiple or all depots to dispatcher.

**Rules:**

- Admin-only
- Must support all-depot access
- Must support multi-select
- Changes must be audit logged after backend integration

---

### Document Upload Dialog

**Status:** planned  
**Feature ID:** RF-ADM-011 / RF-ADM-020  
**Path:** `apps/admin/components/documents/DocumentUploadDialog.tsx`

**Purpose:** Upload payslips, contracts and courier documents.

**Rules:**

- Select courier
- Select document type
- Select file
- Mailbox notification toggle
- No real upload in mock phase
- Real upload uses private storage

---

### Invitation Dialog

**Status:** planned  
**Feature ID:** RF-ADM-012 / RF-ADM-021  
**Path:** `apps/admin/components/invitations/CreateInvitationDialog.tsx`

**Purpose:** Create email invite codes.

**Rules:**

- Email required
- Role required
- Optional depot assignment
- Expiry visible
- Default recommendation: one-time use, 7 days validity

---

### Export Preview Table

**Status:** planned  
**Feature ID:** RF-ADM-013 / RF-ADM-022  
**Path:** `apps/admin/components/exports/ExportPreviewTable.tsx`

**Purpose:** Preview accountant export rows.

**Rules:**

- Approved shifts only
- Show real time and billable time
- German accountant-friendly headers
- CSV and XLSX actions visible

---

## Component Entry Template

Use this template when adding a new component to the registry.

```md
### Component Name

**Status:** implemented / approved  
**Feature ID:** RF-XXX-000  
**Path:** `apps/.../ComponentName.tsx`

**Purpose:** Short description.

**Classes / Pattern:**

```txt
exact classes or style pattern here
```

**States:**

- default
- loading
- empty
- error
- disabled

**Rules:**

- Important rule 1
- Important rule 2
```

---

## Implementation Log

Add entries here after UI implementation.

### RF-000-002 — Design Reference Folder

**Status:** planned

**Notes:**

- Design reference folders exist or will be created:
  - `context/designs/mobile`
  - `context/designs/admin`
- Approved reference images should be stored there.
- Codex must check these references before UI feature work.

---

## Components

Components will be moved from `planned` to `implemented` and then `approved` as RouteForge is built feature by feature.
