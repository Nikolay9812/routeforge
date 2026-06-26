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

**Status:** implemented
**Feature ID:** RF-MOB-001
**Path:** `apps/mobile/components/layout/MobileScreen.tsx`

**Purpose:** Default screen wrapper for mobile pages.

**Pattern:**

```txt
SafeAreaView: flex-1 bg-rfPrimaryDarker
scroll: bg-rfBackground
scroll content: gap-4 p-4 pb-7
non-scroll content: flex-1 gap-4 bg-rfBackground p-4
```

**Optional Dotted Background Variant:**

```txt
planned, not implemented yet
```

**Rules:**

- Use on all primary mobile screens
- Keep padding consistent
- Do not place dense content directly on dotted background without white cards
- NativeWind class names are the source of truth for spacing and color

---

### Mobile Header

**Status:** implemented
**Feature ID:** RF-MOB-001
**Path:** `apps/mobile/components/layout/MobileHeader.tsx`

**Purpose:** Shows company name, greeting, language switch and message/notification icon.

**Pattern:**

```txt
container: -mx-4 -mt-4 gap-[18px] bg-rfPrimaryDarker px-5 pb-5 pt-[18px]
logo mark: h-11 w-11 rounded-rfLg bg-rfPrimaryLightest
logo image: h-9 w-9
company label: text-xl font-extrabold leading-[26px] text-rfTextInverse
greeting: text-[13px] font-semibold leading-[18px] text-rfPrimaryLight
depot label group: text-lg font-extrabold text-rfTextInverse + helper text-rfPrimaryLight
avatar: h-12 w-12 rounded-full bg-rfPrimaryLight
language badge: min-h-9 rounded-full bg-rfPrimaryLight px-3
notification affordance: h-[42px] w-[42px] rounded-full bg-rfSurface with bg-rfSuccess dot
```

**Rules:**

- Company name must be visible
- German is default
- Keep header compact
- Mock company/user data only for `RF-MOB-001`

---

### Mobile Bottom Tabs

**Status:** implemented
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
- Starter `index` and `explore` routes are hidden from tabs and redirect to the shell

---

### Mobile RouteForge Card

**Status:** implemented
**Feature ID:** RF-MOB-001
**Path:** `apps/mobile/components/layout/RouteForgeCard.tsx`

**Purpose:** Default reusable mobile card for shell and upcoming mobile screens.

**Pattern:**

```txt
base: gap-3.5 rounded-rf3xl border
default: border-rfBorder bg-rfSurface p-5
compact: p-4
highlighted: border-rfPrimaryLight bg-rfPrimaryLightest
extensions: optional className prop for layout-specific sizing such as flex-1 min-h-32
```

**States:**

- default
- compact
- highlighted

**Rules:**

- Use for major mobile content sections
- Avoid nested card stacks where a simpler row works
- Keep colored backgrounds for subtle highlights only

---

### Mobile Status Badge

**Status:** implemented
**Feature ID:** RF-MOB-001
**Path:** `apps/mobile/components/ui/StatusBadge.tsx`

**Purpose:** Pill badge for shell statuses and mock operational states.

**Pattern:**

```txt
container: self-start rounded-full px-2.5 py-1
text: text-xs font-extrabold leading-4
success: bg-rfSuccessLightest text-rfSuccessForeground
info: bg-rfPrimaryLightest text-rfPrimaryDarker
warning: bg-rfWarningLightest text-rfWarningForeground
neutral: bg-rfNeutralLight text-rfNeutralForeground
```

**States:**

- success
- info
- warning
- neutral

**Rules:**

- Use German labels
- Use NativeWind RouteForge token utilities from `apps/mobile/tailwind.config.js`
- Add error tone only when a feature needs rejected/danger states

### Mobile Login Screen

**Status:** implemented
**Feature ID:** RF-MOB-002
**Path:** `apps/mobile/app/login.tsx`

**Purpose:** Public courier login entry screen with RouteForge brand, email/password form, mock login action, invite-code affordance and language selector.

**Pattern:**

```txt
screen: MobileScreen with bg-rfBackground and safe area
brand logo: h-[90px] w-[90px] using apps/mobile/assets/images/icon.png
brand text: text-[21px] font-extrabold leading-7 text-rfPrimaryDarker
card: gap-5 rounded-rf3xl border border-rfBorder bg-rfSurface p-5 shadow-sm
title: text-[22px] font-extrabold leading-7 text-rfTextPrimary
helper: text-[13px] font-medium leading-[18px] text-rfTextSecondary
primary action: min-h-[52px] rounded-rfXl bg-rfPrimary
primary text: text-[15px] font-extrabold leading-5 text-rfTextInverse
invite link: min-h-11 text-[14px] font-bold text-rfPrimary
language selector: min-h-[44px] rounded-rfLg border border-rfBorder bg-rfSurface px-4
footer: text-xs font-medium text-rfTextMuted
```

**States:**

- default
- form-filled local state
- password visibility toggle through `AuthTextField`

**Rules:**

- Login remains mock-only until `RF-BE-001`.
- Submit routes to the existing mobile home shell.
- Invite-code link routes to `apps/mobile/app/invite.tsx` after `RF-MOB-003`.
- Do not add backend auth or invite validation in this feature.

### Mobile Invite Registration Screen

**Status:** implemented
**Feature ID:** RF-MOB-003
**Path:** `apps/mobile/app/invite.tsx`

**Purpose:** Public courier invite-code registration screen with email/code form, local pending-approval state, explanation panel, language selector and return-to-login affordance.

**Pattern:**

```txt
screen: MobileScreen with bg-rfBackground and safe area
back action: h-11 w-11 rounded-full text-rfTextPrimary
title: text-[22px] font-extrabold leading-7 text-rfTextPrimary
helper: max-w-[280px] text-[14px] font-medium leading-5 text-rfTextSecondary
card: gap-4 rounded-rf2xl border border-rfBorder bg-rfSurface p-4 shadow-sm
fields: reuse Mobile Auth Text Field
primary action: min-h-[52px] rounded-rfLg bg-rfPrimaryDarker
primary text: text-[15px] font-extrabold leading-5 text-rfTextInverse
info panel: rounded-rf2xl border border-rfPrimaryLight bg-rfPrimaryLightest p-4
info icon: text-rfPrimary
info title: text-[13px] font-extrabold leading-[18px] text-rfTextPrimary
info body: text-[12px] font-medium leading-[17px] text-rfTextSecondary
language selector: min-h-[44px] rounded-rfLg border border-rfBorder bg-rfSurface px-4
footer login link: text-[13px] font-extrabold text-rfPrimary
```

**States:**

- default email and invite-code entry
- local `pending_approval` mock state after pressing `Weiter`
- back navigation to login or previous route
- login link back to `./login`

**Rules:**

- Invite registration remains mock-only until backend auth/invitation validation is added.
- Submit must not create backend data in this feature.
- New courier status is represented only as local `pending_approval` UI state.
- Use `AuthTextField` for invite/auth inputs instead of creating a second input style.

### Mobile Auth Text Field

**Status:** implemented
**Feature ID:** RF-MOB-002
**Path:** `apps/mobile/components/auth/AuthTextField.tsx`

**Purpose:** Reusable mobile authentication input with label, icon, tokenized placeholder color and optional password visibility toggle.

**Pattern:**

```txt
wrapper: gap-2
label: text-[13px] font-extrabold leading-[18px] text-rfTextPrimary
input shell: min-h-[48px] flex-row items-center rounded-rfLg border border-rfBorder bg-rfSurface px-3
icon: text-rfTextMuted
input text: min-h-[46px] flex-1 px-3 text-[14px] font-medium text-rfTextPrimary
placeholder: rfColors.textMuted
toggle: h-11 w-11 rounded-full text-rfTextMuted
```

**States:**

- default
- email input
- secure password input
- password visible

**Rules:**

- Use for mobile auth and invite forms before creating another input pattern.
- Placeholder color must come from `rfColors`, not a hardcoded color.
- Keep touch targets at least 44px.

---

### Mobile Themed Text

**Status:** implemented
**Feature ID:** RF-MOB-001 cleanup
**Path:** `apps/mobile/components/themed-text.tsx`

**Purpose:** Legacy Expo text helper refactored to use RouteForge NativeWind text classes where it is still used by starter/template components.

**Pattern:**

```txt
default: text-base leading-6 text-rfTextPrimary
defaultSemiBold: text-base font-semibold leading-6 text-rfTextPrimary
title: text-[32px] font-bold leading-8 text-rfTextPrimary
subtitle: text-xl font-bold text-rfTextPrimary
link: text-base leading-[30px] text-rfPrimary
extensions: optional className prop for local layout/text adjustments
```

**Rules:**

- Prefer direct `Text` with RouteForge classes in new RouteForge screens.
- Do not add hardcoded colors to this helper.
- Keep `lightColor` and `darkColor` only for legacy dynamic theme overrides.

---

### Mobile Collapsible Template

**Status:** implemented
**Feature ID:** RF-MOB-001 cleanup
**Path:** `apps/mobile/components/ui/collapsible.tsx`

**Purpose:** Expo starter collapsible helper kept as a low-level utility and refactored away from `StyleSheet.create`.

**Pattern:**

```txt
heading: flex-row items-center gap-1.5
content: ml-6 mt-1.5
```

**Rules:**

- Runtime chevron rotation may remain as a style object.
- Use RouteForge cards/status patterns for primary product UI before reaching for this template helper.

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

**Status:** implemented

**Notes:**

- Design reference folders exist or will be created:
  - `context/designs/mobile`
  - `context/designs/admin`
- Approved reference images should be stored there.
- Codex must check these references before UI feature work.
- Verified on 2026-06-24 that the design folders and approved reference images are present.

---

### RF-MOB-001 - Mobile Shell and Navigation

**Status:** implemented

**Notes:**

- Added RouteForge mobile shell with Expo Router bottom tabs:
  - `Home`
  - `Historie`
  - `Bericht`
  - `Postfach`
  - `Profil`
- Added NativeWind configuration:
  - `apps/mobile/global.css`
  - `apps/mobile/tailwind.config.js`
  - `apps/mobile/babel.config.js`
  - `apps/mobile/metro.config.js`
  - `apps/mobile/nativewind-env.d.ts`
- Mapped RouteForge theme tokens to utilities such as `bg-rfPrimary`, `text-rfTextPrimary`, `border-rfBorder` and `rounded-rf3xl`.
- Added reusable mobile screen, header, card and status badge patterns.
- Refactored the RouteForge-created shell screens/components from `StyleSheet.create` to `className` strings.
- Refactored Expo starter helpers used by the mobile app (`ThemedText`, `ThemedView`, `Collapsible` and `modal`) to use NativeWind classes where static styling is appropriate.
- Used `context/designs/mobile/mobile-home-current-shift.png` for visual direction: blue company header, white rounded cards, compact status badges and bottom navigation.
- Kept backend/auth, timer, GPS and report logic out of scope for `RF-MOB-001`.

### RF-MOB-002 - Mobile Login UI

**Status:** implemented

**Notes:**

- Added the public courier login route at `apps/mobile/app/login.tsx`.
- Added reusable auth input styling in `apps/mobile/components/auth/AuthTextField.tsx`.
- Updated the root mobile route so `/` redirects to `/login`.
- Updated the root mobile stack so `login` is available without the tab shell.
- Used the provided RouteForge app icon for the login brand mark.
- Matched the user-provided login reference direction: centered brand, white rounded login card, tokenized email/password fields, blue primary action, invite-code link, language selector and German labels.
- Kept the invite-code affordance visual-only until `RF-MOB-003` adds the invite registration route.
- Kept auth backend, invite validation and pending-approval logic out of scope for `RF-MOB-002`.

### RF-MOB-003 - Mobile Invite Registration UI

**Status:** implemented

**Notes:**

- Added the public invite registration route at `apps/mobile/app/invite.tsx`.
- Registered `invite` in the mobile root Stack without changing the tab shell.
- Updated the login screen invite affordance to navigate to the invite route.
- Reused `AuthTextField` for email and invite-code inputs.
- Matched the provided invite reference direction: back affordance, centered title/subtitle, white rounded form card, dark blue primary action, blue information panel, language selector and German labels.
- Pressing `Weiter` stays mock-only and switches the screen into a local `pending_approval` state.
- Kept InsForge auth, invite validation, profile creation and approval workflow out of scope.

---

## Components

Components will be moved from `planned` to `implemented` and then `approved` as RouteForge is built feature by feature.
