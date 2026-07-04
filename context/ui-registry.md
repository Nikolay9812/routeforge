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

**Purpose:** Shows courier greeting/profile access, company name, selected depot, language selector and notification preview.

**Pattern:**

```txt
container: -mx-4 -mt-4 gap-[18px] bg-rfPrimaryDarker px-5 pb-5 pt-[18px]
profile/greeting pressable: flex-1 flex-row items-center gap-3
avatar: h-12 w-12 rounded-full bg-rfPrimaryLight
greeting label: text-[13px] font-semibold leading-[18px] text-rfPrimaryLight
name: text-xl font-extrabold leading-[26px] text-rfTextInverse
top-right actions: language min-h-10 min-w-10 bg-rfPrimaryLight, notification h-10 w-10 bg-rfSurface
company/depot selector: min-h-[58px] rounded-rfLg bg-rfPrimary px-3
company label: text-lg font-extrabold leading-6 text-rfTextInverse
selected depot: text-[13px] font-semibold leading-[18px] text-rfPrimaryLight
notification affordance: rounded-full with compact bg-rfError count badge
dropdown panel: gap-2 rounded-rf2xl border border-rfPrimaryLight bg-rfSurface p-3
dropdown option: min-h-12 rounded-rfLg bg-rfSurfaceSecondary px-3 py-2
```

**Rules:**

- Company name must be visible
- German is default
- Keep header compact
- Profile/avatar press navigates to `/profile`
- Do not add a separate profile pill in the header; use the avatar/greeting area for profile navigation
- Depot, language and notification panels are mock/local-state only until backend/settings work
- Do not add admin-only depot access controls to mobile header; courier remains self-scoped

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

**Status:** implemented  
**Feature ID:** RF-MOB-004 / RF-MOB-012 / RF-MOB-014 / RF-MOB-015 / RF-MOB-019
**Path:** `apps/mobile/components/shift/CurrentShiftCard.tsx`

**Purpose:** Main mobile Home command card with current shift status, local elapsed timer display, daily-fixed billable default display, hourly 10:00h cap warning/auto-stop state, Start/End action, payment mode, depot/time details, GPS checkpoints and proof reminder.

**Classes / Pattern:**

```txt
container: RouteForgeCard with gap-5, rounded-rf3xl border-rfBorder bg-rfSurface p-5
header icon: h-14 w-14 rounded-rfXl bg-rfPrimaryLightest text-rfPrimary
title: text-xl font-extrabold leading-7 text-rfTextPrimary
status: Mobile Status Badge with success/info/warning/neutral tones
timer panel: rounded-rf2xl bg-rfSurfaceSecondary px-4 py-5
timer text: text-[44px] font-extrabold leading-[52px] text-rfTextPrimary
daily fixed billable summary: w-full rounded-rfXl border border-rfBorderLight bg-rfSurface px-3 py-3, text-[22px] font-extrabold text-rfPrimaryDarker
detail rows: h-12 w-12 rounded-rfLg bg-rfPrimaryLightest icons, text-[13px] labels, text-[17px] values
checkpoints: rounded-full accent icon cells, bordered status pill
primary action active: min-h-[56px] rounded-rfXl bg-rfPrimary with text-rfTextInverse
primary action disabled/ended: min-h-[56px] rounded-rfXl bg-rfNeutralLight with text-rfTextMuted
```

**States:**

- not-started local state
- running local timer state with `Schicht beenden` action
- running hourly warning state when less than 30 minutes remain before the 10:00h cap
- ended local state with disabled `Schicht beendet` action
- auto-stopped hourly state with disabled `Automatisch beendet` action and warning badge
- daily fixed state with `Echte Arbeitszeit heute` timer and `Abrechenbar 8:20h` summary
- visible payment mode summary
- GPS start and end checkpoints open, checking, saved or missing
- proof reminder visible
- elapsed timer label in `HH:MM:SS`, derived from `startedAt`

**Rules:**

- Timer is visually dominant
- Start/End button is the main primary action
- Payment mode must be visible
- Auto-stopped state must be clear
- RF-MOB-012 adds local timer state only; AsyncStorage persistence, GPS permission requests and backend shift creation remain later features.
- RF-MOB-014 auto-stops hourly local shifts at exactly 10:00h / 600 minutes, persists `autoStoppedAtMaxHours` and keeps the displayed elapsed time capped.
- RF-MOB-015 derives daily fixed billable display from shared payroll logic and keeps real elapsed time visible separately from the 8:20h default.
- RF-MOB-019 captures foreground-only start/stop location snapshots and maps checkpoint state to saved/missing/checking labels.
- Timer display must derive from stored local `startedAt`, not from incrementing a counter.
- GPS copy must stay start/stop-only and must not imply live tracking.

---

### Daily Report Form Section

**Status:** implemented
**Feature ID:** RF-MOB-005 / RF-MOB-016 / RF-MOB-020 / RF-MOB-021
**Path:** `apps/mobile/components/report/ReportSectionCard.tsx`

**Purpose:** Groups numbered operational daily report sections with title, optional helper text and a white rounded content card.

**Classes / Pattern:**

```txt
section wrapper: gap-3.5
section title: text-lg font-extrabold leading-6 text-rfTextPrimary
helper: text-[13px] font-medium leading-[18px] text-rfTextSecondary
content card: gap-3.5 rounded-rf3xl border border-rfBorder bg-rfSurface p-5
```

**States:**

- default
- optional helper copy

**Rules:**

- Each section has a clear title
- Required fields are visually clear
- Do not make the form feel like one giant block
- Use for report-style numbered mobile workflows before creating another section wrapper

---

### Daily Report Offline Draft Card

**Status:** implemented
**Feature ID:** RF-MOB-020 / RF-MOB-021
**Path:** `apps/mobile/app/(tabs)/report.tsx`

**Purpose:** Shows local draft persistence, submitted lock state and pending sync state on the courier daily report.

**Classes / Pattern:**

```txt
container draft: gap-2 rounded-rf2xl border border-rfWarningLight bg-rfWarningLightest p-3
container submitted: border-rfPrimaryLight bg-rfPrimaryLightest
icon draft: text-rfWarningForeground
icon submitted: text-rfPrimary
title: text-[13px] font-extrabold leading-[18px]
body: text-[12px] font-medium leading-4
queue note: text-[11px] font-bold leading-[15px]
status badge: StatusBadge warning/error/neutral tone
```

**States:**

- local draft open
- saving
- unsynced with local saved timestamp
- local storage error
- pending sync operation prepared
- submitted and locally locked
- submitted pending backend sync

**Rules:**

- Use warning tokens for unsynced/pending local drafts.
- Use primary-light tokens for submitted locked local reports.
- Do not imply backend sync has completed.
- Keep copy explicit that the draft is local until backend sync is connected.

---

### Daily Report Submitted Summary

**Status:** implemented
**Feature ID:** RF-MOB-021
**Path:** `apps/mobile/app/(tabs)/report.tsx`

**Purpose:** Read-only Bericht tab summary after the courier submits the local daily report.

**Classes / Pattern:**

```txt
container: gap-4 rounded-rf3xl border border-rfBorder bg-rfSurface p-5
title: text-[20px] font-extrabold leading-7 text-rfTextPrimary
helper: text-[13px] font-semibold leading-[18px] text-rfTextSecondary
field summary panel: gap-2 rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary p-4
metric tile: min-h-[82px] rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary p-3
photo uploaded: border-rfSuccessLight bg-rfSuccessLightest
photo missing explained: border-rfWarningLight bg-rfWarningLightest
lock notice: border-rfBorderLight bg-rfNeutralLight
```

**States:**

- submitted
- locally locked
- pending sync
- uploaded proof photos
- missing proof photos with explanation
- read-only signature

**Rules:**

- After submit, all editing controls must be disabled or absent.
- Keep submitted report visible until the German local date rolls over.
- Do not present local submission as backend-accepted.

---

### Daily Report Field

**Status:** implemented
**Feature ID:** RF-MOB-005 / RF-MOB-016 / RF-MOB-021
**Path:** `apps/mobile/components/report/ReportField.tsx`

**Purpose:** Compact tile for daily report fields, supporting editable local inputs and read-only summary values.

**Classes / Pattern:**

```txt
container default: min-h-[76px] flex-1 gap-2 rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary p-3.5
container error: border-rfErrorLight bg-rfErrorLightest
icon cell: h-9 w-9 rounded-rfLg bg-rfPrimaryLightest text-rfPrimary
label: text-xs font-extrabold leading-4 text-rfTextSecondary
value: text-[17px] font-extrabold leading-6 text-rfTextPrimary
input: min-h-[34px] text-[17px] font-extrabold leading-6 text-rfTextPrimary
helper: text-[11px] font-medium leading-[15px] text-rfTextMuted
error: text-[11px] font-bold leading-[15px] text-rfErrorForeground
```

**States:**

- default
- editable
- read-only
- required marker
- validation error

**Rules:**

- Use shared schema validation for field errors.
- Keep fields in two-column rows on the mobile report screen.
- Placeholder color must come from `rfColors.textMuted`.

---

### Daily Report Counter Tile

**Status:** implemented
**Feature ID:** RF-MOB-005 / RF-MOB-016 / RF-MOB-021
**Path:** `apps/mobile/components/report/ReportCounterTile.tsx`

**Purpose:** Shows and edits daily package counters for deliveries, returns, pickups and stops.

**Classes / Pattern:**

```txt
container: min-h-[122px] flex-1 items-center justify-center gap-2.5 px-2
divider: border-r border-rfBorderLight
icon cell: h-11 w-11 rounded-rfLg bg-rfPrimaryLightest text-rfPrimary
label: text-xs font-bold leading-4 text-rfTextSecondary
value: text-[24px] font-extrabold leading-8 text-rfTextPrimary
input: min-h-[40px] text-center text-[24px] font-extrabold leading-8 text-rfTextPrimary
helper: text-[11px] font-medium leading-[15px] text-rfTextMuted
error: text-[10px] font-bold leading-[14px] text-rfErrorForeground
```

**States:**

- default
- editable
- validation error
- optional right divider

**Rules:**

- Use RouteForge token colors only.
- Keep counter values visually dominant but smaller than the home shift timer.
- Reject negative values locally before submit.

---

### Photo Upload Card

**Status:** implemented
**Feature ID:** RF-MOB-005 / RF-MOB-016 / RF-MOB-017 / RF-MOB-021
**Path:** `apps/mobile/components/report/PhotoUploadCard.tsx`

**Purpose:** Visual proof-photo placeholder for required daily report photo types.

**States:**

| State    | Classes                                                         |
| -------- | --------------------------------------------------------------- |
| Missing  | `border-dashed border-rfBorderMuted bg-rfSurfaceSecondary`       |
| Uploaded | `border-rfSuccessLight bg-rfSuccessLightest`                     |
| Error    | `border-rfErrorLight bg-rfErrorLightest text-rfErrorForeground`  |
| Preview  | `overflow-hidden rounded-rfXl border-rfSuccessLight bg-rfSurface` |
| Actions  | `min-h-[44px] rounded-rfLg bg-rfPrimary` / `border-rfBorder bg-rfSurface` |

**Photo Types:**

```txt
start_km
end_km
fahrtenbuch
mentor
```

**Rules:**

- RF-MOB-005 is visual/mock-only and does not open camera or upload files
- Show missing/uploaded state clearly
- RF-MOB-016 uses error state for required missing proof photos before submit
- RF-MOB-017 adds preview, retake/change and compression
- RF-MOB-021 disables capture/change/remove controls after local submit
- Missing required photos can be submitted only when a German explanation exists
- Photos expire after 14 days
- Preview tiles show compressed local image URI only; no public storage URL is introduced
- Camera/gallery controls keep 44px minimum touch targets

---

### Signature Placeholder Card

**Status:** implemented
**Feature ID:** RF-MOB-005 / RF-MOB-016
**Path:** `apps/mobile/components/report/SignaturePlaceholderCard.tsx`

**Purpose:** Visual readiness block for the required courier signature before real signature capture is implemented, including required-signature validation copy.

**Classes / Pattern:**

```txt
container default: gap-3 rounded-rf2xl border border-dashed border-rfBorderMuted bg-rfSurfaceSecondary p-4
container error: border-rfErrorLight bg-rfErrorLightest
icon cell: h-12 w-12 rounded-rfLg bg-rfPrimaryLightest text-rfPrimary
label: text-[15px] font-extrabold leading-5 text-rfTextPrimary
helper: text-[12px] font-medium leading-4 text-rfTextSecondary
status: StatusBadge warning
error row: rounded-rfLg bg-rfSurface px-3 py-2, text-[12px] font-bold text-rfErrorForeground
```

**States:**

- missing signature placeholder
- required-signature error state

**Rules:**

- Do not capture or reuse signatures in RF-MOB-005.
- RF-MOB-016 may show required validation copy but must not capture the signature yet.
- Replace or extend this pattern when RF-MOB-018 adds the real signature component.

---

### Signature Card

**Status:** implemented
**Feature ID:** RF-MOB-018 / RF-MOB-021
**Path:** `apps/mobile/components/report/SignatureCard.tsx`

**Purpose:** Capture courier signature before report submission.

**Classes / Pattern:**

```txt
container default: gap-3 rounded-rf2xl border border-rfBorder bg-rfSurface p-4
container error: border-rfErrorLight bg-rfErrorLightest
container signed: border-rfSuccessLight bg-rfSuccessLightest
canvas: h-[156px] overflow-hidden rounded-rf2xl border-rfBorderLight bg-rfSurface
signature strokes: absolute h-[4px] rounded-full bg-rfTextPrimary
clear button: min-h-[44px] rounded-rfLg border border-rfBorder bg-rfSurface
confirm button active: min-h-[44px] rounded-rfLg bg-rfPrimary text-rfTextInverse
confirm button disabled: bg-rfNeutralLight text-rfTextMuted
timestamp row: rounded-rfLg bg-rfSurface px-3 py-2 text-rfSuccessForeground
error row: rounded-rfLg bg-rfSurface px-3 py-2 text-rfErrorForeground
```

**States:**

- empty canvas
- draft strokes
- required-signature error
- confirmed signature
- submitted/read-only
- clear disabled when empty
- confirm disabled until draft strokes exist
- clear/confirm disabled after submit

**Rules:**

- Signature required before submit
- Clear button visible
- Confirm signature action visible
- Show signed timestamp after confirmation
- Use solid preview strokes, not dotted points
- Do not reuse old signatures automatically
- RF-MOB-018 stores signature locally only and prepares an upload payload for RF-BE-010
- Signature payload must not use the temporary shift-photo retention path

---

### History Calendar

**Status:** implemented
**Feature ID:** RF-MOB-006
**Path:** `apps/mobile/components/history/HistoryCalendar.tsx`

**Purpose:** Shows a monthly courier history calendar with worked-day markers and day selection.

**Worked Day:**

```txt
bg-transparent text-rfTextPrimary with bg-rfSuccess marker
```

**Selected Day:**

```txt
bg-rfPrimary text-rfTextInverse with bg-rfTextInverse marker
```

**Container Pattern:**

```txt
overflow-hidden rounded-rf3xl border border-rfBorder bg-rfSurface
```

**Header Pattern:**

```txt
min-h-[70px] flex-row items-center justify-between border-b border-rfBorderLight px-4
```

**Rules:**

- Worked day markers are subtle green dots.
- Selected day is a filled primary tile and must be obvious.
- Month navigation is visual/mock-only until history logic is connected.
- Calendar uses 7 equal columns with stable day tile dimensions.
- Uses only `rf...` NativeWind token utilities.

---

### History Summary Tile

**Status:** implemented
**Feature ID:** RF-MOB-006
**Path:** `apps/mobile/components/history/HistorySummaryTile.tsx`

**Purpose:** Shows monthly history totals such as Arbeitszeit, Abrechenbar and Schichten.

**Pattern:**

```txt
min-h-[92px] flex-1 justify-between p-3.5
```

**Icon Pattern:**

```txt
h-8 w-8 rounded-rfLg bg-rfPrimaryLightest text-rfPrimary
```

**Rules:**

- Used inside a single rounded summary strip, separated by `border-rfBorderLight`.
- Values use `text-[20px] font-extrabold text-rfTextPrimary`.
- Helper text uses `text-rfTextMuted`.
- Do not use raw color classes.

---

### Selected Day Summary

**Status:** implemented
**Feature ID:** RF-MOB-006
**Path:** `apps/mobile/components/history/SelectedDaySummary.tsx`

**Purpose:** Shows the currently selected worked day with status, depot, route, times and details affordance.

**Pattern:**

```txt
gap-3.5 rounded-rf3xl border border-rfPrimaryLight bg-rfPrimaryLightest p-4
```

**Action Pattern:**

```txt
min-h-[54px] rounded-rfXl bg-rfPrimary text-rfTextInverse
```

**Rules:**

- Status badge remains visible in the header.
- The action navigates to `apps/mobile/app/history/[date].tsx` after RF-MOB-007.
- Keep copy courier-scoped and avoid admin/dispatcher data.

---

### History Shift Row

**Status:** implemented
**Feature ID:** RF-MOB-006
**Path:** `apps/mobile/components/history/HistoryShiftRow.tsx`

**Purpose:** Shows recent worked days in the monthly history list.

**Pattern:**

```txt
min-h-[92px] flex-row items-center gap-3 border-t border-rfBorderLight px-4 py-3
```

**Selected State:**

```txt
bg-rfPrimaryLightest
```

**Rules:**

- Approved, submitted and rejected states use existing `StatusBadge` tones.
- Pressing a row updates the selected-day summary.
- Rows stay dense and operational, matching the admin/mobile shared RouteForge family.

---

### Day Details Screen

**Status:** implemented
**Feature ID:** RF-MOB-007 / RF-MOB-021
**Path:** `apps/mobile/app/history/[date].tsx`

**Purpose:** Courier-owned detailed daily report screen with date navigation, approval status, time summary, geofence state, KM/package totals, proof photos, signature and mock PDF affordance.

**Pattern:**

```txt
screen: MobileScreen with custom -mx-4 -mt-4 bg-rfPrimary header
header title: text-[24px] font-extrabold text-rfTextInverse
date nav buttons: h-12 w-12 rounded-full border border-rfBorder bg-rfSurface
courier card: rounded-rf3xl border border-rfBorder bg-rfSurface p-5
primary PDF action: min-h-[56px] rounded-rfXl bg-rfPrimary text-rfTextInverse
```

**States:**

- approved/read-only
- submitted/waiting review
- rejected/warning
- previous/next day navigation disabled state

**Rules:**

- Mock data only for RF-MOB-007.
- Courier sees only own shift detail data.
- Approved days must communicate read-only/locked status.
- PDF action remains visual/mock-only until daily PDF generation is implemented.
- No public storage links, backend history query, real PDF generation or photo download is added here.

---

### Day Detail Metric Grid

**Status:** implemented
**Feature ID:** RF-MOB-007
**Path:** `apps/mobile/components/history/DayDetailMetricGrid.tsx`

**Purpose:** Dense two-column mobile metric grid for daily start/end, net time, billable time, break, depot, shift type and status.

**Pattern:**

```txt
container: overflow-hidden rounded-rf3xl border border-rfBorder bg-rfSurface
cell: min-h-[132px] w-1/2 gap-2.5 p-4 with border-r/b border-rfBorderLight
icon cell: h-10 w-10 rounded-rfLg bg-rfSurfaceSecondary / status tone background
label: text-[12px] font-extrabold text-rfTextSecondary
value: text-[22px] font-extrabold text-rfPrimary
helper: text-[11px] font-medium text-rfTextMuted
```

**States:**

- default
- success
- warning

**Rules:**

- Use for compact read-only report metrics.
- Warning cells use `rfWarning` tokens for start/stop outside depot.
- Do not turn this into editable form UI.

---

### Day Detail Warning Card

**Status:** implemented
**Feature ID:** RF-MOB-007
**Path:** `apps/mobile/components/history/DayDetailWarningCard.tsx`

**Purpose:** Shows start/stop geofence result in a courier-understandable read-only alert.

**Pattern:**

```txt
warning: rounded-rf2xl border border-rfWarning bg-rfWarningLightest p-4
inside depot: border-rfSuccessLight bg-rfSuccessLightest
icon shell: h-12 w-12 rounded-rfLg bg-rfSurface
title: text-[14px] font-extrabold
helper: text-[12px] font-semibold text-rfTextSecondary
```

**States:**

- outside depot warning
- inside depot success

**Rules:**

- Geofence UI remains start/stop-only.
- Do not imply live tracking or show continuous route data.

---

### Day Detail Photo Grid

**Status:** implemented
**Feature ID:** RF-MOB-007
**Path:** `apps/mobile/components/history/DayDetailPhotoGrid.tsx`

**Purpose:** Read-only proof-photo preview grid for required shift proof photo types.

**Pattern:**

```txt
container: gap-4 rounded-rf3xl border border-rfBorder bg-rfSurface p-5
photo tile available: rounded-rf2xl border border-rfPrimaryLight bg-rfPrimaryLightest p-3.5
photo tile expired: border-rfBorderLight bg-rfNeutralLight
photo tile missing: border-rfWarningLight bg-rfWarningLightest
icon shell: h-11 w-11 rounded-rfLg bg-rfSurface
label: text-[14px] font-extrabold text-rfTextPrimary
helper: text-[11px] font-semibold text-rfTextSecondary
```

**States:**

- available
- expired after 14-day proof-photo retention
- missing local proof photo with explanation

**Rules:**

- RF-MOB-007 does not open camera, download files or fetch signed URLs.
- Expired state must distinguish proof-photo retention from permanent documents.
- Missing state is for local submitted reports that were allowed with a courier explanation.

---

### Day Detail Signature Card

**Status:** implemented
**Feature ID:** RF-MOB-007
**Path:** `apps/mobile/components/history/DayDetailSignatureCard.tsx`

**Purpose:** Read-only signature summary for a submitted daily report.

**Pattern:**

```txt
container: gap-3 rounded-rf3xl border border-rfBorder bg-rfSurface p-5
icon shell: h-12 w-12 rounded-rfLg bg-rfSuccessLightest
signature panel: rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary p-4
signed name: text-[22px] font-extrabold text-rfTextPrimary
helper: text-[12px] font-semibold text-rfTextSecondary
```

**States:**

- signed/read-only

**Rules:**

- This is not the signature capture component.
- Real signature capture remains for RF-MOB-018.

---

### Mailbox Item Card

**Status:** implemented
**Feature ID:** RF-MOB-008
**Path:** `apps/mobile/components/mailbox/MailboxItemCard.tsx`

**Purpose:** Shows one courier-owned mailbox item with unread marker, category/file badge, date and open affordance.

**Classes / Pattern:**

```txt
container: min-h-[116px] flex-row items-center gap-3 rounded-rf3xl border p-4
unread: border-rfPrimaryLight bg-rfPrimaryLightest
read: border-rfBorder bg-rfSurface
selected: border-rfPrimary
unread dot: h-2.5 w-2.5 rounded-full bg-rfPrimary
icon shell: h-14 w-14 rounded-rfXl with category tone background
title: text-[16px] font-extrabold leading-[22px] text-rfTextPrimary
subtitle: text-[13px] font-semibold leading-[18px] text-rfTextSecondary
meta: text-[11px] font-medium leading-[15px] text-rfTextMuted
file badge: rounded-full px-2.5 py-1 with PDF or Nachricht token tone
```

**States:**

- unread
- read
- selected
- PDF badge
- Nachricht badge

**Rules:**

- Unread item must be visually obvious.
- Card is a mock-only open affordance in RF-MOB-008.
- Do not create public storage links or real download behavior in this component.
- Courier copy remains self-scoped.

---

### Mailbox Filter Tabs

**Status:** implemented
**Feature ID:** RF-MOB-008
**Path:** `apps/mobile/components/mailbox/MailboxFilterTabs.tsx`

**Purpose:** Horizontal category tabs for the courier mailbox with visible counts and a compact filter summary row.

**Classes / Pattern:**

```txt
tab: min-h-[52px] flex-row items-center gap-2 rounded-rfXl border px-5
active tab: border-rfPrimary bg-rfPrimary
inactive tab: border-rfBorder bg-rfSurface
active label: text-[15px] font-extrabold text-rfTextInverse
inactive label: text-[15px] font-extrabold text-rfTextPrimary
count pill: min-w-8 rounded-full px-2 py-1
filter row: rounded-rf2xl border border-rfBorder bg-rfSurface px-4 py-3
```

**States:**

- active
- inactive
- counted

**Rules:**

- Use for mobile mailbox category filters before creating another mailbox tab pattern.
- Counts come from mock data in RF-MOB-008.
- Filter row is visual only until real filtering/search logic is built.

---

### Mailbox Preview Panel

**Status:** implemented
**Feature ID:** RF-MOB-008
**Path:** `apps/mobile/components/mailbox/MailboxPreviewPanel.tsx`

**Purpose:** Bottom-style selected mailbox item preview with icon, message text and visual download/open actions.

**Classes / Pattern:**

```txt
container: gap-4 rounded-rf3xl border border-rfBorder bg-rfSurface p-5 shadow-sm
drag handle: h-1.5 w-16 rounded-full bg-rfBorderStrong
icon shell: h-[76px] w-[76px] rounded-rfXl with category tone background
title: text-[17px] font-extrabold leading-[23px] text-rfTextPrimary
meta: text-[12px] font-semibold leading-4 text-rfTextSecondary
body: text-[13px] font-medium leading-[19px] text-rfTextSecondary
secondary action: min-h-[52px] rounded-rfXl border border-rfPrimary bg-rfSurface
primary action: min-h-[52px] rounded-rfXl bg-rfPrimary
```

**States:**

- selected item preview
- PDF or Nachricht item
- visual download action
- open action routed to mailbox item details

**Rules:**

- Download remains visual until backend document/mailbox features add private or signed access.
- Open routes to `apps/mobile/app/mailbox/[id].tsx` after RF-MOB-009.
- Real private/signed document downloads belong to backend document/mailbox features.

---

### Mailbox Empty State

**Status:** implemented
**Feature ID:** RF-MOB-008
**Path:** `apps/mobile/components/mailbox/MailboxEmptyState.tsx`

**Purpose:** Calm empty state for mailbox filters with no matching mock items.

**Classes / Pattern:**

```txt
container: items-center gap-3 rounded-rf3xl border border-rfBorder bg-rfSurface p-6
icon shell: h-14 w-14 rounded-full bg-rfPrimaryLightest
title: text-center text-[16px] font-extrabold leading-6 text-rfTextPrimary
body: text-center text-[13px] font-medium leading-[18px] text-rfTextSecondary
```

**States:**

- empty filtered mailbox

**Rules:**

- Use German labels.
- Keep empty state calm and non-alarming.
- Do not add a CTA unless there is a real courier action.

---

### Mailbox Item Detail Screen

**Status:** implemented
**Feature ID:** RF-MOB-009
**Path:** `apps/mobile/app/mailbox/[id].tsx`

**Purpose:** Stack detail screen for a courier-owned mailbox item with title, category badge, received date, message body, attachment card, visual download action and read-state summary.

**Classes / Pattern:**

```txt
header: -mx-4 -mt-4 gap-5 bg-rfPrimary px-4 pb-5 pt-4
back action: h-11 w-11 rounded-full text-rfTextInverse
title: text-[23px] font-extrabold leading-8 text-rfTextInverse
hero card: gap-4 rounded-rf3xl border p-5
unread hero: border-rfPrimaryLight bg-rfPrimaryLightest
read hero: border-rfBorder bg-rfSurface
icon shell: h-[78px] w-[78px] rounded-rf2xl with category tone background
message card: gap-3 rounded-rf3xl border border-rfBorder bg-rfSurface p-5
body text: text-[14px] font-medium leading-[21px] text-rfTextSecondary
attachment card: gap-4 rounded-rf3xl border border-rfBorder bg-rfSurface p-5
primary action: min-h-[56px] rounded-rfXl bg-rfPrimary px-5 py-3
read-state card: rounded-rf3xl border p-4 with read/unread token tone
```

**States:**

- unread item
- read item
- PDF attachment
- Nachricht item
- visual private download action
- mock read-state summary

**Rules:**

- Use only courier-owned mock mailbox data in RF-MOB-009.
- Do not add backend mailbox queries, signed URL creation, storage access or persistent read-state mutation.
- Keep private document copy explicit; payslips/contracts are not part of shift-photo retention cleanup.
- Detail route must stay outside the bottom tab shell and use stack-style back navigation.

---

### Profile Document Status Card

**Status:** implemented
**Feature ID:** RF-MOB-010
**Path:** `apps/mobile/components/profile/ProfileDocumentStatusCard.tsx`

**Purpose:** Shows required courier document status for the courier's own profile with status badge, private-document helper copy and visual upload/update action.

**Classes / Pattern:**

```txt
container: gap-3 rounded-rf2xl border border-rfBorder bg-rfSurface p-4
icon shell: h-12 w-12 rounded-rfLg with status tone background
title: text-[15px] font-extrabold leading-5 text-rfTextPrimary
kind label: text-[13px] font-medium leading-[18px] text-rfTextSecondary
status badge: rounded-full px-2.5 py-1 with document status token tone
detail panel: gap-1 rounded-rfLg bg-rfSurfaceSecondary p-3
action affordance: min-h-11 rounded-rfLg border border-rfBorder bg-rfSurface px-4
action text: text-[14px] font-extrabold leading-5 text-rfPrimary
```

**States:**

```txt
valid
missing
expired
uploaded
```

**Rules:**

- Missing/expired documents must be easy to notice
- Upload/update action visible but mock-only in RF-MOB-010
- Do not store sensitive documents permanently in local storage
- Do not add public document URLs, signed URL creation or private storage access in UI-only phases

---

### Mobile Profile Screen

**Status:** implemented
**Feature ID:** RF-MOB-010
**Path:** `apps/mobile/app/(tabs)/profile.tsx`

**Purpose:** Courier self-profile tab with profile summary, mailbox/documents shortcuts, signature preview, personal data, payment mode and required document status section.

**Classes / Pattern:**

```txt
screen: MobileScreen with MobileHeader
screen title: text-[26px] font-extrabold leading-[33px] text-rfTextPrimary
screen helper: text-[14px] font-semibold leading-5 text-rfTextSecondary
document section card: RouteForgeCard gap-4
document summary tiles: rounded-rf2xl border p-3 with neutral/success/warning token tones
privacy note: gap-2 rounded-rf2xl border border-rfPrimaryLight bg-rfPrimaryLightest p-4
```

**States:**

- active courier profile
- masked sensitive IBAN value
- own-profile document status overview
- visual-only mailbox/profile document shortcut
- visual-only private document upload/update affordance

**Rules:**

- Profile data is courier self-scoped.
- Sensitive values stay masked where shown.
- Upload/download actions are visual placeholders until backend storage work.
- Do not add backend profile queries, document persistence, signed URLs or public storage links.

---

### Profile Summary Card

**Status:** implemented
**Feature ID:** RF-MOB-010
**Path:** `apps/mobile/components/profile/ProfileSummaryCard.tsx`

**Purpose:** Large identity card for the courier profile tab.

**Classes / Pattern:**

```txt
card: RouteForgeCard gap-5
avatar shell: h-[88px] w-[88px] rounded-full bg-rfPrimaryLightest
avatar text: text-[28px] font-extrabold leading-9 text-rfPrimaryDarker
online dot: h-5 w-5 rounded-full border-2 border-rfSurface bg-rfSuccess
name: text-[25px] font-extrabold leading-[32px] text-rfTextPrimary
company: text-[15px] font-bold leading-5 text-rfPrimary
role: text-[14px] font-semibold leading-5 text-rfTextSecondary
status badges: StatusBadge success tone
```

**Rules:**

- Use initials unless a real private avatar pipeline exists.
- Keep company, role and access status visible.

---

### Profile Shortcut Card

**Status:** implemented
**Feature ID:** RF-MOB-010
**Path:** `apps/mobile/components/profile/ProfileShortcutCard.tsx`

**Purpose:** Profile landing shortcut card for mailbox/documents style destinations.

**Classes / Pattern:**

```txt
pressable: min-h-[104px] rounded-rf3xl border border-rfBorder bg-rfSurface p-4
icon shell: h-[58px] w-[58px] rounded-rf2xl bg-rfPrimaryLightest
title: text-[17px] font-extrabold leading-6 text-rfTextPrimary
helper: text-[13px] font-medium leading-[18px] text-rfTextSecondary
badge: rounded-rfLg bg-rfPrimaryLightest px-3 py-1
badge text: text-xs font-extrabold leading-4 text-rfPrimaryDarker
chevron: text-rfPrimary only when onPress exists
```

**Rules:**

- Use for large mobile profile shortcuts only.
- Shortcut actions must remain role-safe and self-scoped.

---

### Profile Info Section

**Status:** implemented
**Feature ID:** RF-MOB-010
**Path:** `apps/mobile/components/profile/ProfileInfoSection.tsx`

**Purpose:** Compact profile information rows for contact, language, depot and profile status.

**Classes / Pattern:**

```txt
card: RouteForgeCard compact gap-0
title: text-[18px] font-extrabold leading-6 text-rfTextPrimary
row: min-h-[58px] border-t border-rfBorderLight py-3
icon shell: h-10 w-10 rounded-rfLg bg-rfSurfaceSecondary
label: text-[13px] font-semibold leading-[18px] text-rfTextSecondary
value: text-[15px] font-extrabold leading-5 text-rfTextPrimary
helper: text-xs font-medium leading-4 text-rfTextMuted
```

**Rules:**

- Use helper text for masking/privacy notes.
- Do not expose Steuer-ID or full IBAN casually in profile rows.

---

### Profile Payment Card

**Status:** implemented
**Feature ID:** RF-MOB-010
**Path:** `apps/mobile/components/profile/ProfilePaymentCard.tsx`

**Purpose:** Shows courier payment mode and relevant v1 payment rule summary.

**Classes / Pattern:**

```txt
card: RouteForgeCard highlighted
icon shell: h-11 w-11 rounded-rfLg bg-rfSurface
title: text-[18px] font-extrabold leading-6 text-rfTextPrimary
mode label: text-[14px] font-semibold leading-5 text-rfTextSecondary
cap badge: rounded-full bg-rfSurface px-3 py-1
detail panel: gap-2 rounded-rf2xl border border-rfPrimaryLight bg-rfSurface p-4
```

**Rules:**

- Hourly mode must mention real time and 10:00h cap.
- Daily fixed mode should mention 8:20h default when used later.

---

### Profile Signature Card

**Status:** implemented
**Feature ID:** RF-MOB-010
**Path:** `apps/mobile/components/profile/ProfileSignatureCard.tsx`

**Purpose:** Visual signature preview area based on the profile reference screenshot.

**Classes / Pattern:**

```txt
card: RouteForgeCard
icon shell: h-12 w-12 rounded-rfLg bg-rfPrimaryLightest
title: text-[18px] font-extrabold leading-6 text-rfTextPrimary
helper: text-[13px] font-medium leading-[18px] text-rfTextSecondary
preview box: min-h-[116px] rounded-rf2xl border border-rfBorder bg-rfSurfaceSecondary p-4
signature text: text-[32px] font-semibold italic leading-[42px] text-rfTextPrimary
primary affordance: min-h-[50px] rounded-rfXl bg-rfPrimary px-5 py-3
```

**Rules:**

- Signature card is visual-only until the signature capture feature.
- Do not install a signature library in RF-MOB-010.

---

### Mobile Settings Screen

**Status:** implemented
**Feature ID:** RF-MOB-011
**Path:** `apps/mobile/app/settings.tsx`

**Purpose:** Secondary mobile settings screen for language preference, app version, privacy note, support/contact placeholder and visual logout action.

**Classes / Pattern:**

```txt
header: -mx-4 -mt-4 gap-5 bg-rfPrimary px-4 pb-5 pt-4
back action: h-11 w-11 rounded-full text-rfTextInverse
title: text-[23px] font-extrabold leading-8 text-rfTextInverse
header helper: text-[13px] font-semibold leading-[18px] text-rfPrimaryLight
settings card: gap-4 rounded-rf3xl border border-rfBorder bg-rfSurface p-5
language option: min-h-[70px] rounded-rf2xl border p-4
selected language: border-rfPrimaryLight bg-rfPrimaryLightest with bg-rfPrimary code chip
unselected language: border-rfBorder bg-rfSurfaceSecondary
app version card: rounded-rf3xl border border-rfBorder bg-rfSurface p-5
privacy card: rounded-rf3xl border border-rfPrimaryLight bg-rfPrimaryLightest p-5
support rows: min-h-[54px] border-t border-rfBorderLight py-2
logout card: rounded-rf3xl border border-rfErrorLight bg-rfErrorLightest p-5
logout action: min-h-[52px] rounded-rfXl bg-rfError px-5 py-3
```

**States:**

- selected language
- unselected language
- mock app version/build state
- privacy note
- support/contact placeholder rows
- visual logout action

**Rules:**

- Settings remains mock-only in RF-MOB-011.
- Language selection is local UI state only until real settings persistence.
- Logout is a visual affordance only until InsForge auth/session work.
- Do not expose secrets, auth session details or backend errors on this screen.

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

### Admin Login Screen

**Status:** implemented
**Feature ID:** RF-ADM-001
**Path:** `apps/admin/app/login/page.tsx`

**Purpose:** Public admin/dispatcher login page with RouteForge brand, German email/password form, demo operational context and mock submit navigation to `/admin/dashboard`.

**Classes / Pattern:**

```txt
page: routeforge-dotted-bg flex min-h-screen items-center justify-center px-6 py-10
layout: grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_440px] lg:items-center
brand mark: routeforge-logo-mark h-12 w-12 rounded-xl shadow-card text-primary-foreground
tenant pill: rounded-full border border-primary-light bg-primary-lightest px-3 py-1 text-xs font-semibold text-primary-darker
headline: text-4xl font-bold leading-tight text-text-primary lg:text-5xl
summary cards: rounded-2xl border border-border bg-surface p-4 shadow-card
login card: rounded-2xl border border-border bg-surface p-6 shadow-card-lg
inputs: h-12 rounded-xl border border-border bg-surface px-4 text-sm font-medium text-text-primary focus:border-primary focus:ring-1 focus:ring-primary
primary action: h-12 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-dark
info panel: rounded-2xl border border-info-light bg-info-lightest p-4
```

**States:**

- default
- HTML required/email validation
- mock submit to `/admin/dashboard`
- responsive single-column mobile/tablet layout

**Rules:**

- RF-ADM-001 remains mock-only; no InsForge auth, sessions, middleware or protected route checks.
- Keep German labels and RouteForge token classes.
- Use the card/input/button patterns here for future admin auth-adjacent forms unless a later shadcn/ui primitive replaces them intentionally.

---

### Admin Shell

**Status:** implemented
**Feature ID:** RF-ADM-002
**Path:** `apps/admin/app/admin/layout.tsx`

**Purpose:** Shared admin route layout for `/admin/*` with sidebar navigation, sticky topbar and tokenized main content wrapper. Mock-only until real InsForge auth/session protection is added.

**Layout Pattern:**

```txt
shell: min-h-screen bg-background
frame: flex min-h-screen
sidebar: hidden w-[260px] shrink-0 border-r border-border bg-surface lg:flex lg:min-h-screen lg:flex-col
main column: flex min-w-0 flex-1 flex-col
main content: mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:p-8
topbar: sticky top-0 z-10 h-16 border-b border-border bg-surface
```

**States:**

- desktop sidebar visible at `lg`
- compact topbar brand visible below `lg`
- child route content rendered inside the shell wrapper
- mock company/user/notification data only

**Rules:**

- Admin uses sidebar, not top navbar
- Company name visible
- User menu visible
- Real protected route enforcement belongs to later auth/backend features

---

### Sidebar Item

**Status:** implemented
**Feature ID:** RF-ADM-002
**Path:** `apps/admin/components/layout/SidebarItem.tsx`

**Active Classes:**

```txt
item: bg-primary-lightest text-primary
marker: border-primary-light bg-surface text-primary
```

**Inactive Classes:**

```txt
item: text-text-secondary hover:bg-surface-secondary
marker: border-border bg-surface-secondary text-text-subtle
```

**Base Classes:**

```txt
item: flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition
marker: h-7 w-7 rounded-lg border text-[10px] font-bold
```

**Rules:**

- Use German labels
- Active state must be obvious
- Do not use underline navigation

---

### Admin Topbar

**Status:** implemented
**Feature ID:** RF-ADM-002
**Path:** `apps/admin/components/layout/Topbar.tsx`

**Purpose:** Sticky admin header with company switcher, search field, notifications and user menu.

**Classes / Pattern:**

```txt
container: sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface px-4 lg:px-8
search input: h-10 rounded-xl border border-border bg-surface-secondary px-4 text-sm font-medium text-text-primary focus:border-primary focus:bg-surface focus:ring-1 focus:ring-primary
notification button: h-10 w-10 rounded-xl border border-border bg-surface text-text-secondary shadow-card hover:bg-surface-secondary
notification badge: rounded-full bg-warning px-1 text-[10px] font-bold text-primary-foreground
user button: h-10 rounded-xl border border-border bg-surface px-2.5 shadow-card hover:bg-surface-secondary
```

**States:**

- default
- hover/focus on controls
- responsive search hidden below `md`
- responsive user label hidden below `sm`

**Rules:**

- Topbar is part of the admin shell, not a replacement for sidebar navigation.
- Controls are visual/mock-only until RF backend/auth features add behavior.

---

### Company Switcher

**Status:** implemented
**Feature ID:** RF-ADM-002
**Path:** `apps/admin/components/layout/CompanySwitcher.tsx`

**Purpose:** Compact mock company/workspace selector shown in the admin topbar.

**Classes / Pattern:**

```txt
container: h-11 rounded-xl border border-border bg-surface px-3 shadow-card hover:bg-surface-secondary
workspace mark: h-8 w-8 rounded-lg bg-primary-lightest text-xs font-bold text-primary
company name: text-sm font-semibold text-text-primary
location: text-xs font-medium text-text-secondary
```

**States:**

- default
- hover/focus visual affordance
- text truncation for long company names

**Rules:**

- Must show the current company/workspace visibly in the shell.
- Mock-only; does not switch tenants until real multi-tenant session logic exists.

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

**Status:** implemented
**Feature ID:** RF-ADM-004 / RF-ADM-016  
**Path:** `apps/admin/components/shifts/ShiftFilters.tsx`

**Purpose:** Filter the admin shift list locally by date, depot, status, courier and payment mode during the mock-data phase.

**Pattern:**

```txt
filter card: rounded-2xl border border-border bg-surface p-6 shadow-card
filter select: h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold shadow-card focus:border-primary
active filter badge: rounded-full px-2.5 py-1 text-xs font-semibold with primary/neutral token groups
reset action: h-10 rounded-xl border border-border bg-surface px-4 text-sm font-semibold shadow-card
table shell: rounded-2xl border border-border bg-surface shadow-card
empty state: rounded-2xl border border-border-light bg-surface-secondary p-6
```

**Rules:**

- Filters appear above table
- Empty state shown when no results
- Do not hide important filters in v1
- Keep state local/mock-only until backend filtering is implemented
- Future real filtering must preserve company scope and dispatcher depot scope

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

**Status:** implemented
**Feature ID:** RF-ADM-006 / RF-ADM-017
**Path:** `apps/admin/components/shifts/ShiftCorrectionForm.tsx`

**Purpose:** Required reason area and disabled-save control for sensitive shift corrections.

**Rules:**

- Save disabled until reason is provided
- Reason must be audit logged
- Do not allow empty correction reason
- RF-ADM-006 keeps save local/mock-only; RF-ADM-017 owns later local state update behavior

---

### Courier Table

**Status:** implemented
**Feature ID:** RF-ADM-007
**Path:** `apps/admin/app/admin/couriers/page.tsx`

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
- RF-ADM-007 stays mock-only; RF-ADM-008 owns courier profile detail pages

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

### RF-MOB-004 - Home / Current Shift UI

**Status:** implemented

**Notes:**

- Rebuilt `apps/mobile/app/(tabs)/home.tsx` around the approved current-shift visual direction: blue company header, dominant white current-shift card, quick operational summary cards and safety note.
- Added `apps/mobile/components/shift/CurrentShiftCard.tsx` as the reusable Home shift command card pattern.
- Added `apps/mobile/features/mock/currentShift.ts` for realistic mock-only current shift, depot, vehicle, GPS, package, report and sync data.
- Current Shift Card shows static `00:00` timer, `Schicht starten` primary action, payment mode, depot/time details, GPS start/end checkpoints and proof reminder.
- Home summary cards show depot, vehicle, location status, package counters, daily report state and sync readiness.
- Kept RF-MOB-004 UI-only: no InsForge calls, no AsyncStorage active-shift persistence, no real timer logic, no GPS permission request and no live tracking.
- Used `context/designs/mobile/mobile-home-current-shift.png` as the visual direction while keeping RouteForge NativeWind token classes.

---

### RF-MOB-005 - Daily Report UI

**Status:** implemented

**Notes:**

- Rebuilt `apps/mobile/app/(tabs)/report.tsx` around the provided `mobile-daily-report.png` direction: blue product header, compact report summary strip, numbered sections, dense operational cards and a clear submit affordance.
- Added reusable report UI patterns:
  - `apps/mobile/components/report/ReportSectionCard.tsx`
  - `apps/mobile/components/report/ReportField.tsx`
  - `apps/mobile/components/report/ReportCounterTile.tsx`
  - `apps/mobile/components/report/PhotoUploadCard.tsx`
  - `apps/mobile/components/report/SignaturePlaceholderCard.tsx`
- Added `apps/mobile/features/mock/dailyReport.ts` for realistic mock-only daily report values.
- The report screen visually covers depot, vehicle, start/end KM, package counters, required proof photos, notes, signature readiness and the `Bericht einreichen` action.
- Kept RF-MOB-005 UI-only: no validation, no camera/photo picker, no upload, no signature capture, no AsyncStorage draft persistence and no InsForge calls.
- Used RouteForge `rf...` NativeWind token utilities only.

---

### RF-MOB-006 - History Calendar UI

**Status:** implemented

**Notes:**

- Rebuilt `apps/mobile/app/(tabs)/history.tsx` around `context/designs/mobile/mobile-history-calendar.png`.
- Added mock month selector, calendar worked-day indicators, selected-day state, filter chips, monthly KPI strip, selected-day summary, monthly PDF affordance and recent shift rows.
- Added reusable history components:
  - `apps/mobile/components/history/HistoryCalendar.tsx`
  - `apps/mobile/components/history/HistorySummaryTile.tsx`
  - `apps/mobile/components/history/SelectedDaySummary.tsx`
  - `apps/mobile/components/history/HistoryShiftRow.tsx`
- Added `apps/mobile/features/mock/history.ts` for realistic mock-only history data with approved, submitted and rejected shift states.
- Kept RF-MOB-006 UI-only: no backend history query, real daily detail route, real PDF generation or persistent filters.

---

### RF-MOB-007 - Day Details UI

**Status:** implemented

**Notes:**

- Added the courier day detail route at `apps/mobile/app/history/[date].tsx`.
- Used `context/designs/mobile/mobile-day-details.png` as visual direction: blue detail header, centered date navigation, courier/status card, time metric grid, geofence alert, proof-photo grid, report rows and blue PDF action.
- Added reusable day-detail components:
  - `apps/mobile/components/history/DayDetailMetricGrid.tsx`
  - `apps/mobile/components/history/DayDetailWarningCard.tsx`
  - `apps/mobile/components/history/DayDetailSummaryCard.tsx`
  - `apps/mobile/components/history/DayDetailPhotoGrid.tsx`
  - `apps/mobile/components/history/DayDetailSignatureCard.tsx`
  - `apps/mobile/components/history/DayDetailReportCard.tsx`
- Extended `apps/mobile/features/mock/history.ts` with date-scoped day detail mock data.
- Updated the history selected-day action to navigate to the new detail route.
- Kept RF-MOB-007 UI-only: no backend history query, real PDF generation, photo download, signed URL creation or persistent state.

---

### RF-MOB-008 - Digital Mailbox UI

**Status:** implemented

**Notes:**

- Rebuilt `apps/mobile/app/(tabs)/mailbox.tsx` around `context/designs/mobile/mobile-digital-mailbox.png`.
- Added mock-only mailbox data in `apps/mobile/features/mock/mailbox.ts` with courier-owned document, payslip, contract and notice examples.
- Added category filters for:
  - `Alle`
  - `Ungelesen`
  - `Dokumente`
  - `Abrechnungen`
  - `Vertraege`
  - `Hinweise`
- Added reusable mailbox UI patterns:
  - `apps/mobile/components/mailbox/MailboxFilterTabs.tsx`
  - `apps/mobile/components/mailbox/MailboxItemCard.tsx`
  - `apps/mobile/components/mailbox/MailboxPreviewPanel.tsx`
  - `apps/mobile/components/mailbox/MailboxEmptyState.tsx`
- Kept RF-MOB-008 UI-only: no backend mailbox query, real item detail route, signed URL creation, file download, storage access or persistent read state.
- Actions in the preview panel are visual affordances only until RF-MOB-009 and later backend document/mailbox features.

---

### RF-MOB-009 - Mailbox Item Details UI

**Status:** implemented

**Notes:**

- Added the mobile mailbox item detail route at `apps/mobile/app/mailbox/[id].tsx`.
- Registered the detail route in the mobile root stack and connected the mailbox preview `Oeffnen` action to it.
- Extended `apps/mobile/features/mock/mailbox.ts` with detail body copy, category labels and attachment metadata for existing courier-owned mailbox mock items.
- The detail screen shows a blue stack header, category/read badges, received date, sender, message body, attachment card, visual download action and mock read-state summary.
- Kept RF-MOB-009 UI-only: no backend mailbox query, signed URL creation, private storage access, real file download or persistent read-state mutation.
- Refreshed Expo Router typed routes so `/mailbox/[id]` is available to TypeScript.

---

### RF-CLEAN-001 - Monorepo Hygiene Checkpoint

**Status:** implemented

**Notes:**

- No reusable UI component or new visual pattern was added.
- Admin root layout was normalized to RouteForge metadata, `lang="de"` and Inter font usage.
- Unused Next starter public SVG assets and unused Expo starter UI helpers/routes were removed after reference scans.
- RouteForge mobile UI patterns from RF-MOB-001 through RF-MOB-011 remain the active patterns for future mobile work.

---

### RF-MOB-014 - Hourly 10h Auto Stop

**Status:** implemented

**Notes:**

- Extended the existing Home Current Shift Card states instead of adding a new component.
- Running hourly shifts show a warning badge/copy when less than 30 minutes remain before the 10:00h cap.
- Hourly shifts that reach the cap show `Auto-Stopp 10:00h`, keep the timer at `10:00:00` and disable the main action as `Automatisch beendet`.
- The warning/auto-stopped state uses existing mobile status badge and disabled primary action token patterns.
- No new colors, raw Tailwind color classes or hardcoded hex values were added.

---

### RF-MOB-016 - Daily Report Validation

**Status:** implemented

**Notes:**

- Daily report validation uses a mobile helper backed by `packages/shared` `shiftReportSchema`.
- The report screen shows a warning validation summary, inline field errors, required-photo error cards, required-signature copy and a disabled submit affordance.
- The disabled submit pattern uses `bg-rfNeutralLight` with `text-rfTextMuted`; validation warnings use `rfWarning...` tokens and blocking field/photo/signature errors use `rfError...` tokens.
- RF-MOB-016 remains mock/local validation only. It does not upload photos, capture a signature, persist a draft, create backend shifts or submit a report.

---

### RF-MOB-017 - Photo Capture and Compression

**Status:** implemented

**Notes:**

- The existing `PhotoUploadCard` now supports missing, error and uploaded preview states for required proof photos.
- Captured/selected photos render a local preview, compressed status text and a 44px remove affordance.
- Each tile exposes `Kamera`, `Galerie`, `Neu`, `Aendern` and remove actions without adding backend upload state.
- Photo capture errors use `rfError...` alert styling and German operational copy.
- The report screen derives required photo validation from compressed local selections.
- The local payload uses the private `shift-photos` bucket and a tenant/shift path template for future backend wiring.
- No InsForge upload, signed URL, public storage link, report submit flow, signature capture or draft persistence is added here.

---

### RF-MOB-018 - Signature Capture

**Status:** implemented

**Notes:**

- The report screen now uses `SignatureCard` instead of the placeholder for local signature capture.
- The signature area is a touch-driven local canvas using existing React Native APIs; no third-party native signature package was installed.
- Confirmed signatures show `Signiert` status and a German timestamp row.
- The clear and confirm controls use 44px minimum touch targets and existing RouteForge mobile button tokens.
- Required-signature validation is satisfied by local `signatureUrl` and `signedAt` values after confirmation.
- The prepared upload payload uses a private reports artifact path template for RF-BE-010 and does not use the temporary shift-photo retention path.
- No backend upload, signed URL, PDF embedding, report submit flow or draft persistence is added here.

### RF-MOB-019 - GPS Start/Stop Capture

**Status:** implemented

**Notes:**

- The Home current-shift card now maps local GPS checkpoint state into `Noch offen`, `Pruefen`, `Gespeichert` and `Fehlt`.
- Saved checkpoints use the success token group; missing or permission-denied checkpoints use warning tokens.
- The Standortstatus card reflects open, checking, saved and missing states with German operational copy.
- The main Start/End action is disabled while the foreground location prompt/capture is in progress.
- The feature keeps GPS start/stop-only and does not introduce maps, live route UI, background tracking or geofence calculations.

### RF-MOB-020 - Offline Draft Queue

**Status:** implemented

**Notes:**

- Added a daily-report offline draft card to the report screen.
- The card uses warning tokens for local/unsynced state and error tone for local storage failure.
- Sync wording stays local-first: the queue operation is prepared, but backend sync is not presented as complete.
- No new reusable component file was introduced; the pattern is registered here for later extraction if it recurs.

---

### RF-MOB-021 - Daily Report Workflow Strengthening

**Status:** implemented

**Notes:**

- Daily report form fields and counters are now editable local inputs using existing report tile patterns.
- Local submitted reports render as a read-only Bericht summary with locked controls, pending-sync copy and the confirmed signature disabled.
- Required proof photos may be missing only when a courier explanation is present; history/day-details show those photos as missing instead of available/expired.
- The signature preview now uses solid stroke segments, and submitted reports disable clear/confirm/edit actions.
- History and day-detail screens can include submitted local reports while backend history sync remains out of scope.
- The new reusable submitted-summary and missing-photo states are registered above.

---

### RF-ADM-001 - Admin Login UI

**Status:** implemented

**Notes:**

- Added the public admin/dispatcher login route at `apps/admin/app/login/page.tsx`.
- Updated `apps/admin/app/page.tsx` so `/` redirects to `/login` using the installed Next.js App Router `redirect()` helper.
- Added a minimal `/admin/dashboard` destination at `apps/admin/app/admin/dashboard/page.tsx` so the mock login submit lands on a valid admin route before the full admin shell/dashboard features.
- Added the shared admin dotted background and RouteForge logo mark CSS helpers in `apps/admin/app/globals.css`, using token variables only.
- The login page establishes the first admin auth-form pattern: RouteForge brand, tenant pill, operational stat cards, white rounded login card, tokenized inputs, blue primary action and German labels.
- Kept RF-ADM-001 mock-only: no InsForge auth, session storage, middleware, protected route checks or backend validation.

---

### RF-ADM-002 - Admin Shell and Navigation

**Status:** implemented

**Notes:**

- Added the shared `/admin/*` shell at `apps/admin/app/admin/layout.tsx`.
- Added reusable admin layout components for sidebar, sidebar item, topbar and company switcher.
- Sidebar navigation uses the exact RF-ADM-002 labels and reads active route state with `usePathname()` inside the small client sidebar component.
- Topbar includes the visible company/workspace selector, search field, mock notification badge and mock user menu.
- The dashboard page was reduced to route content inside the shell; RF-ADM-003 still owns the real dashboard UI.
- Kept RF-ADM-002 mock-only: no InsForge auth, middleware, session checks, backend calls or route protection was added.

---

### RF-ADM-003 - Admin Dashboard UI

**Status:** implemented

**Notes:**

- Replaced `apps/admin/app/admin/dashboard/page.tsx` with the full mock dashboard inside the existing admin shell.
- Added `apps/admin/lib/mock/adminDashboard.ts` for dashboard-only mock data: stat metrics, active couriers, pending review shifts, geofence warnings, recent activity and quick actions.
- The dashboard uses server-rendered mock data only; no client state, backend call, InsForge auth, route protection, RLS change, mutation or analytics was added.
- Quick action links route to planned admin feature pages and remain navigation affordances until those Feature IDs exist.

---

### Admin Dashboard Screen

**Status:** implemented
**Feature ID:** RF-ADM-003
**Path:** `apps/admin/app/admin/dashboard/page.tsx`

**Purpose:** Operational admin overview for the current company workspace with top metrics, active courier table, review queue, geofence warnings, activity feed and quick actions.

**Pattern:**

```txt
page stack: flex flex-col gap-6
hero card: rounded-2xl border border-border bg-surface p-6 shadow-card
section card: rounded-2xl border border-border bg-surface p-6 shadow-card
stat card: rounded-2xl border border-border bg-surface p-5 shadow-card
table header: bg-surface-secondary text-xs font-semibold uppercase text-text-subtle
table row: text-sm text-text-primary hover:bg-surface-secondary
status badge: rounded-full px-2.5 py-1 text-xs font-semibold with token tone groups
warning panel: rounded-xl border p-4 with success/warning/error soft token groups
quick action: rounded-xl border p-4 transition hover:bg-surface-secondary with soft token groups
```

**States:**

- default populated mock dashboard
- success, info, warning, error and neutral status tones
- geofence outside/missing warning states
- horizontal overflow table safety for narrower viewports

**Notes:**

- Keep dashboard content dense and operational; do not add decorative charts beyond compact token-colored trend bars in v1.
- Geofence warnings must use warning/error token groups and must remain start/stop proof only, not live tracking.
- Future dashboard data wiring must preserve company/depot scope and must not replace backend/RLS boundaries with frontend-only checks.

---

### RF-ADM-004 - Shift Management UI

**Status:** implemented

**Notes:**

- Added the `/admin/shifts` route at `apps/admin/app/admin/shifts/page.tsx`.
- Added `apps/admin/lib/mock/adminShifts.ts` for shift-list mock data with submitted, under-review, approved and rejected states.
- The page uses static mock filter controls for date, depot, status, courier and payment mode.
- Shift rows are full-width links to planned `/admin/shifts/[id]` detail routes, but the detail UI remains owned by `RF-ADM-005`.
- Kept RF-ADM-004 mock-only: no backend query, filter state, approval/rejection/correction mutation, RLS change or audit log write was added.

---

### Admin Shift Management Table

**Status:** implemented
**Feature ID:** RF-ADM-004 / RF-ADM-016
**Path:** `apps/admin/app/admin/shifts/page.tsx`

**Purpose:** Dense admin shift-management overview with local mock filters and linked rows for opening shift review details.

**Pattern:**

```txt
page stack: flex flex-col gap-6
hero card: rounded-2xl border border-border bg-surface p-6 shadow-card
summary tile: rounded-2xl border border-border bg-surface p-5 shadow-card
filter card: rounded-2xl border border-border bg-surface p-6 shadow-card
filter select: min-h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold shadow-card focus:border-primary
table shell: rounded-2xl border border-border bg-surface shadow-card
table header: grid bg-surface-secondary px-6 py-3 text-xs font-semibold uppercase text-text-subtle
linked row: grid px-6 py-4 text-sm text-text-primary hover:bg-surface-secondary
status badge: rounded-full px-2.5 py-1 text-xs font-semibold with token tone groups
geofence cell: rounded-xl border px-3 py-2 with success/warning/error soft token groups
empty state: rounded-2xl border border-border-light bg-surface-secondary p-6
```

**States:**

- local date/depot/status/courier/payment-mode filters
- active filter count and reset action
- linked populated rows update immediately from local mock state
- empty state when no local mock rows match
- submitted, under-review, approved and rejected shift statuses
- hourly and daily-fixed payment labels
- inside, outside and missing geofence states
- horizontal overflow table safety for narrower viewports

**Notes:**

- Use this pattern for dense admin list pages before extracting reusable table primitives.
- Geofence warnings remain visible in the list and use warning/error token groups.
- Local filter logic is implemented by `RF-ADM-016`; row detail UI belongs to `RF-ADM-005`.
- Future backend wiring must preserve company and dispatcher depot scope.

---

### RF-ADM-005 - Shift Review Details UI

**Status:** implemented

**Notes:**

- Added the `/admin/shifts/[id]` route at `apps/admin/app/admin/shifts/[id]/page.tsx`.
- Added `apps/admin/lib/mock/adminShiftDetails.ts` for shift-detail mock data derived from the existing shift list records.
- The detail page uses server-rendered mock data only; no client state, backend call, InsForge auth, route protection, RLS change, approval, rejection, correction or audit-log mutation was added.
- The page shows start/stop GPS proof only and explicitly avoids live tracking or route history.

---

### Admin Shift Review Details Screen

**Status:** implemented
**Feature ID:** RF-ADM-005
**Path:** `apps/admin/app/admin/shifts/[id]/page.tsx`

**Purpose:** Detailed admin review surface for one courier shift, combining operational summary, time/billable review, KM and package data, proof photos, start/stop geofence evidence, signature state, admin notes, audit trail and visual review actions.

**Pattern:**

```txt
page stack: flex flex-col gap-6
hero card: rounded-2xl border border-border bg-surface p-6 shadow-card
courier header card: rounded-2xl border border-border bg-surface p-6 shadow-card
section card: rounded-2xl border border-border bg-surface p-6 shadow-card
metric tile: rounded-xl border border-border-light bg-surface-secondary p-4
status badge: rounded-full px-2.5 py-1 text-xs font-semibold with token tone groups
photo evidence card: rounded-xl border border-border bg-surface-secondary p-3
photo placeholder: aspect-[4/3] rounded-lg border border-dashed border-border-muted bg-surface
geofence panel: rounded-xl border p-4 with success/warning/error token groups
start/stop map card: right-column rounded-2xl border border-border bg-surface p-6 shadow-card
map canvas: h-64 rounded-xl border border-border bg-surface-secondary with token-only checkpoint layers
action button: h-10 or h-11 rounded-xl px-4 text-sm font-semibold with primary/secondary/error token groups
```

**States:**

- populated shift detail for every current shift-list row ID
- submitted, under-review, approved and rejected status badges
- hourly and daily-fixed payment review states
- inside, outside and missing geofence checkpoint states
- right-column start/stop map evidence matching the admin shift-review reference
- proof photos present state for required `start_km`, `end_km`, `fahrtenbuch` and `mentor` evidence
- signature present state
- visual-only approve, reject and correct actions

**Notes:**

- Keep this page dense and operational; avoid decorative cards or marketing-style sections.
- GPS/geofence UI must remain start/stop proof only. Do not add live tracking, continuous location history or customer tracking.
- Future correction UI belongs to `RF-ADM-006`; future local/backend logic must enforce required reasons and audit logs for rejection, correction and billable overrides.
- Future backend wiring must preserve company scope and dispatcher depot scope before loading or mutating shift detail data.

---

### RF-ADM-006 - Shift Correction UI

**Status:** implemented

**Notes:**

- Added the `/admin/shifts/[id]/correction` route at `apps/admin/app/admin/shifts/[id]/correction/page.tsx`.
- Added `apps/admin/components/shifts/ShiftCorrectionForm.tsx` as a focused Client Component for local form state.
- Added `apps/admin/lib/mock/adminShiftCorrections.ts` to derive correction draft values from the existing shift detail mock data.
- Updated the review detail correction controls so they open the correction route.
- Kept RF-ADM-006 mock-only: no backend query, shift mutation, RLS change or audit-log write was added.

---

### Admin Shift Correction Screen

**Status:** implemented
**Feature ID:** RF-ADM-006
**Path:** `apps/admin/app/admin/shifts/[id]/correction/page.tsx`

**Purpose:** Admin/dispatcher correction surface for one shift, showing current courier and shift context, editable correction fields, required reason, local save state and audit-rule reminders.

**Pattern:**

```txt
page stack: flex flex-col gap-6
hero card: rounded-2xl border border-border bg-surface p-6 shadow-card
summary card: rounded-2xl border border-border bg-surface p-6 shadow-card
form section card: rounded-2xl border border-border bg-surface p-6 shadow-card
field tile: rounded-xl border border-border-light bg-surface-secondary p-4
input: h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold focus:border-primary
reason section: rounded-2xl border border-primary-light bg-surface p-6 shadow-card
textarea: min-h-32 rounded-xl border border-border bg-surface px-3 py-3 text-sm font-medium focus:border-primary
disabled save: bg-disabled text-disabled-foreground disabled:cursor-not-allowed
audit reminder: rounded-2xl border border-warning-light bg-warning-lightest p-6 shadow-card
```

**States:**

- populated correction draft derived from shift review detail data
- editable start time, end time, break minutes and billable minutes
- editable start/end kilometers and package counters
- save disabled while correction reason is empty
- local saved confirmation after valid mock submit
- cancel link back to `/admin/shifts/[id]`

**Notes:**

- Keep the route as a Server Component that passes serializable mock data into the Client Component form.
- Keep the Client Component boundary limited to the interactive form.
- Correction reason is required in the UI now and must be enforced again in later local/backend logic.
- Future backend wiring must verify company scope, dispatcher depot scope and audit-log writes server-side before persisting corrections.
- GPS evidence remains start/stop only; do not add live tracking or route history to correction workflows.

---

### RF-ADM-007 - Couriers List UI

**Status:** implemented

**Notes:**

- Added the `/admin/couriers` route at `apps/admin/app/admin/couriers/page.tsx`.
- Added `apps/admin/lib/mock/adminCouriers.ts` for company-scoped mock courier rows, filters and summary counts.
- The page uses static mock filters for search, depot, status and payment mode.
- Kept RF-ADM-007 mock-only: no backend query, filter state, invitation creation, courier approval, document upload, RLS change or audit-log write was added.

---

### Admin Couriers List Screen

**Status:** implemented
**Feature ID:** RF-ADM-007
**Path:** `apps/admin/app/admin/couriers/page.tsx`

**Purpose:** Dense admin courier-management overview for profile status, depot assignment, payment mode, latest shift and private-document readiness.

**Pattern:**

```txt
page stack: flex flex-col gap-6
hero card: rounded-2xl border border-border bg-surface p-6 shadow-card
summary tile: rounded-2xl border border-border bg-surface p-5 shadow-card
filter card: rounded-2xl border border-border bg-surface p-6 shadow-card
search input: h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold shadow-card focus:border-primary
filter field: min-h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold shadow-card
table shell: rounded-2xl border border-border bg-surface shadow-card
table header: grid bg-surface-secondary px-6 py-3 text-xs font-semibold uppercase text-text-subtle
table row: grid px-6 py-4 text-sm text-text-primary hover:bg-surface-secondary
avatar: h-11 w-11 rounded-xl bg-primary-lightest text-primary-darker
status badge: rounded-full px-2.5 py-1 text-xs font-semibold with token tone groups
document badge: rounded-xl border px-3 py-2 with success/warning/error soft token groups
action button: h-9 rounded-xl px-3 text-xs font-semibold with primary/secondary token groups
```

**States:**

- static search input
- static depot, status and payment-mode filters
- active, pending approval, inactive and suspended courier status badges
- hourly and daily-fixed payment labels
- complete, missing and review-needed document states
- linked profile action pointing at planned `/admin/couriers/[id]`
- document action pointing at planned documents area

**Notes:**

- Keep courier-list pages dense and operational; avoid marketing-style profile cards for the list view.
- Admin copy may show company-scoped rows. Dispatcher views must be depot-scoped by backend/RLS before real data is loaded.
- Do not expose sensitive document URLs or private file paths in courier tables.
- Future courier profile detail UI belongs to `RF-ADM-008`.

---

### RF-ADM-008 - Courier Profile Admin UI

**Status:** implemented

**Notes:**

- Added the `/admin/couriers/[id]` route at `apps/admin/app/admin/couriers/[id]/page.tsx`.
- Added `apps/admin/lib/mock/adminCourierProfiles.ts` for profile detail mock data derived from the courier list rows.
- Updated the admin sidebar/company switcher structure so the tenant switcher and navigation items use icon slots instead of letter-only markers.
- Kept RF-ADM-008 mock-only: no backend query, approval mutation, suspension mutation, document upload, signed URL, RLS change or audit-log write was added.

---

### Admin Courier Profile Screen

**Status:** implemented
**Feature ID:** RF-ADM-008
**Path:** `apps/admin/app/admin/couriers/[id]/page.tsx`

**Purpose:** Admin courier profile detail surface for profile status, personal data, payment rules, depot assignment, documents, recent shifts, notes and access history.

**Pattern:**

```txt
page stack: flex flex-col gap-6
hero card: rounded-2xl border border-border bg-surface p-6 shadow-card
profile summary card: rounded-2xl border border-border bg-surface p-6 shadow-card
tab row: h-11 rounded-xl px-4 text-sm font-semibold with active bg-primary-lightest text-primary
section card: rounded-2xl border border-border bg-surface p-6 shadow-card
profile avatar: h-28 w-28 rounded-2xl bg-primary-lightest text-primary-darker
info list row: flex justify-between border-b border-border-light pb-3
document tile: rounded-xl border border-border-light bg-surface-secondary p-4
recent shift table: grid header bg-surface-secondary, linked rows hover:bg-surface-secondary
audit reminder: rounded-xl border border-warning-light bg-warning-lightest px-4 py-3
action button: h-10 rounded-xl px-4 with primary/secondary/error token groups
```

**States:**

- populated profile detail for every current courier-list row ID
- active, pending approval, inactive and suspended status badges
- hourly and daily-fixed payment rule summaries
- complete, missing and review-needed document states
- recent shifts linked to existing shift review routes
- visual-only approve, suspend and document-send actions

**Notes:**

- Keep profile detail pages dense and operational like the approved courier-profile screenshot.
- Start/stop map evidence belongs in the shift review detail screen, not in the courier profile.
- Sensitive documents remain represented as private document metadata only; do not expose file paths or public URLs.
- Future local approval behavior belongs to `RF-ADM-018`; future backend wiring must enforce company scope, dispatcher depot scope and audit logs before loading or mutating courier data.

---

### Admin Sidebar Icon Navigation

**Status:** implemented
**Feature ID:** RF-ADM-008
**Path:** `apps/admin/components/layout/SidebarItem.tsx`

**Purpose:** Sidebar navigation item pattern with tokenized icon cells for each admin section, replacing letter-only markers while preserving the existing item structure and active-state behavior.

**Pattern:**

```txt
sidebar item: group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition
active item: bg-primary-lightest text-primary
inactive item: text-text-secondary hover:bg-surface-secondary
icon cell active: h-7 w-7 rounded-lg border border-primary-light bg-surface text-primary
icon cell inactive: h-7 w-7 rounded-lg border border-border bg-surface-secondary text-text-subtle
icon: h-4 w-4 stroke currentColor
```

**States:**

- active route
- inactive route
- hover state
- dashboard, shifts, couriers, dispatchers, depots, documents, invitations, exports, audit and settings icons

**Notes:**

- The company switcher now uses the same icon/text/chevron element structure in sidebar and topbar.
- No new icon dependency was added because `lucide-react` is not installed in the admin workspace.

---

### RF-ADM-009 - Dispatcher Management UI

**Status:** implemented

**Notes:**

- Added the `/admin/dispatchers` route at `apps/admin/app/admin/dispatchers/page.tsx`.
- Added `apps/admin/lib/mock/adminDispatchers.ts` for dispatcher rows, summary counts, static filters and depot-access edit preview data.
- The page uses server-rendered mock data only; no client state, backend call, InsForge auth, route protection, RLS change, invite creation, access mutation or audit-log write was added.
- Dispatcher access copy keeps `profile_depot_access` visible as the later backend boundary for depot-scoped reads and actions.

---

### Admin Dispatcher Management Screen

**Status:** implemented
**Feature ID:** RF-ADM-009
**Path:** `apps/admin/app/admin/dispatchers/page.tsx`

**Purpose:** Dense admin dispatcher-management surface for profile status, depot access, dispatcher capability visibility and future access-edit workflows.

**Pattern:**

```txt
page stack: flex flex-col gap-6
hero card: rounded-2xl border border-border bg-surface p-6 shadow-card
summary tile: rounded-2xl border border-border bg-surface p-5 shadow-card
filter card: rounded-2xl border border-border bg-surface p-6 shadow-card
search input: h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold shadow-card focus:border-primary
filter field: min-h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold shadow-card
table shell: rounded-2xl border border-border bg-surface shadow-card
table header: grid bg-surface-secondary px-6 py-3 text-xs font-semibold uppercase text-text-subtle
table row: grid px-6 py-4 text-sm text-text-primary hover:bg-surface-secondary
avatar: h-11 w-11 rounded-xl bg-primary-lightest text-primary-darker
status badge: rounded-full px-2.5 py-1 text-xs font-semibold with token tone groups
depot access pill: rounded-xl border px-3 py-2 with success/warning/neutral soft token groups
permission dot: h-2 w-2 rounded-full using success or disabled token groups
access edit panel: rounded-2xl border border-border bg-surface p-6 shadow-card
audit reminder: rounded-xl border border-warning-light bg-warning-lightest px-4 py-3
action button: h-9 or h-11 rounded-xl px-3/4 with primary/secondary token groups
```

**States:**

- static search input
- static depot-access, status and permission filters
- active, pending approval and inactive dispatcher status badges
- one-depot, multi-depot, planned and paused depot access states
- enabled and disabled dispatcher capability rows
- visual-only invite, access edit, activate, save and discard actions
- right-column access-edit preview for selected dispatcher

**Notes:**

- Keep dispatcher pages operational and table-first; avoid replacing access management with large profile cards.
- Depot-access changes must later write audit logs and must never rely on frontend-only checks.
- Future local depot access behavior belongs to `RF-ADM-019`; future backend wiring must enforce company scope, dispatcher capability flags and depot scope before loading or mutating dispatcher data.

---

### RF-ADM-010 - Depot Management UI

**Status:** implemented

**Notes:**

- Added the `/admin/depots` route at `apps/admin/app/admin/depots/page.tsx`.
- Added `apps/admin/lib/mock/adminDepots.ts` for depot rows, summary counts, static filters and depot detail edit preview data.
- The page uses server-rendered mock data only; no client state, backend call, InsForge auth, route protection, RLS change, depot mutation, geofence persistence or audit-log write was added.
- Depot and geofence copy keeps start/stop proof visible as the v1 boundary and avoids live tracking or route history.

---

### Admin Depot Management Screen

**Status:** implemented
**Feature ID:** RF-ADM-010
**Path:** `apps/admin/app/admin/depots/page.tsx`

**Purpose:** Dense admin depot-management surface for depot status, address/contact data, geofence radius and warning state, assigned dispatcher/courier counts and future depot-edit workflows.

**Pattern:**

```txt
page stack: flex flex-col gap-6
hero card: rounded-2xl border border-border bg-surface p-6 shadow-card
summary tile: rounded-2xl border border-border bg-surface p-5 shadow-card
filter card: rounded-2xl border border-border bg-surface p-6 shadow-card
search input: h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold shadow-card focus:border-primary
filter field: min-h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold shadow-card
table shell: rounded-2xl border border-border bg-surface shadow-card
table header: grid bg-surface-secondary px-6 py-3 text-xs font-semibold uppercase text-text-subtle
table row: grid px-6 py-4 text-sm text-text-primary hover:bg-surface-secondary
depot code avatar: h-11 w-11 rounded-xl bg-primary-lightest text-primary-darker
status badge: rounded-full px-2.5 py-1 text-xs font-semibold with token tone groups
geofence pill: rounded-xl border px-3 py-2 with success/warning/error/neutral soft token groups
detail edit panel: rounded-2xl border border-border bg-surface p-6 shadow-card
readonly form input: h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold shadow-card
assignment tile: rounded-xl border border-border-light bg-surface-secondary px-4 py-3
audit reminder: rounded-xl border border-warning-light bg-warning-lightest px-4 py-3
action button: h-9 or h-11 rounded-xl px-3/4 with primary/secondary token groups
```

**States:**

- static search input
- static status, geofence and assignment filters
- active and inactive depot status badges
- stable, warning, error and paused geofence states
- assigned dispatcher and courier count preview
- right-column static depot edit preview for selected depot
- visual-only add, details, edit, save and discard actions
- start/stop-only geofence summary with no live tracking

**Notes:**

- Keep depot pages operational and table-first; avoid turning depot management into map-heavy or marketing-style cards.
- Real depot and geofence changes must later be company-scoped, permission-checked server-side and audit logged where sensitive.
- Dispatcher depot visibility must later be enforced through `profile_depot_access`; the UI copy is not a security boundary.

---

### RF-ADM-011 - Documents Upload UI

**Status:** implemented

**Notes:**

- Added the `/admin/documents` route at `apps/admin/app/admin/documents/page.tsx`.
- Added `apps/admin/lib/mock/adminDocuments.ts` for document rows, category tabs, summary counts, static filters and upload draft preview data.
- The page uses server-rendered mock data only; no client state, backend call, InsForge auth, route protection, RLS change, storage upload, document metadata insert, mailbox item creation, signed URL or audit-log write was added.
- Document copy keeps private storage and durable document retention visible; payslips/contracts/private documents are not part of the 14-day shift-photo cleanup.

---

### Admin Documents Upload Screen

**Status:** implemented
**Feature ID:** RF-ADM-011
**Path:** `apps/admin/app/admin/documents/page.tsx`

**Purpose:** Admin document-management and upload-preparation surface for private courier documents, payslips, contracts, company/depot notices, mailbox delivery and access visibility.

**Pattern:**

```txt
page stack: flex flex-col gap-6
hero card: rounded-2xl border border-border bg-surface p-6 shadow-card
summary tile: rounded-2xl border border-border bg-surface p-5 shadow-card
category tabs: h-10 rounded-xl px-4 text-sm font-semibold with active bg-primary-lightest text-primary
upload drop zone: rounded-2xl border border-dashed border-primary-light bg-primary-lightest p-5
upload icon cell: h-14 w-14 rounded-2xl bg-surface text-primary shadow-card
filter card: rounded-2xl border border-border bg-surface p-6 shadow-card
search input: h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold shadow-card focus:border-primary
filter field: min-h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold shadow-card
table shell: rounded-2xl border border-border bg-surface shadow-card
table header: grid bg-surface-secondary px-6 py-3 text-xs font-semibold uppercase text-text-subtle
table row: grid px-6 py-4 text-sm text-text-primary hover:bg-surface-secondary
file type avatar: h-11 w-11 rounded-xl bg-primary-lightest text-primary-darker
status badge: rounded-full px-2.5 py-1 text-xs font-semibold with token tone groups
upload draft panel: rounded-2xl border border-border bg-surface p-6 shadow-card
readonly form input: h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold shadow-card
visibility tile: rounded-xl border px-4 py-3 with success/info/warning/primary soft token groups
audit reminder: rounded-xl border border-warning-light bg-warning-lightest px-4 py-3
action button: h-9 or h-11 rounded-xl px-3/4 with primary/secondary token groups
```

**States:**

- static category tabs for all documents, payslips, contracts, notices and proofs
- static upload drop zone with disabled file input
- static search, document-type, target and visibility filters
- active, review and draft document status badges
- private, depot-scoped and company-wide visibility badges
- right-column upload draft preview with mailbox notification enabled state
- visual-only upload, details, share, prepare and discard actions

**Notes:**

- Keep document pages operational and compliance-focused; avoid public-looking file galleries or exposing private storage paths in UI tables.
- Real upload behavior belongs to `RF-ADM-020` locally and later backend/storage phases; it must use private buckets, metadata rows, mailbox item creation and audit logs.
- Dispatcher document access must later be depot-scoped before real data or downloads are exposed.

---

### RF-ADM-012 - Invitations UI

**Status:** implemented

**Notes:**

- Added the `/admin/invitations` route at `apps/admin/app/admin/invitations/page.tsx`.
- Added `apps/admin/lib/mock/adminInvitations.ts` for invitation rows, summary counts, static filters and invitation draft preview data.
- The page uses server-rendered mock data only; no client state, backend call, InsForge auth, route protection, RLS change, invite creation, email sending, invite-code validation, profile creation, revocation mutation or audit-log write was added.
- Invitation copy keeps one-time use, expiry, optional depot scope and pending courier approval visible for later backend work.

---

### Admin Invitations Management Screen

**Status:** implemented
**Feature ID:** RF-ADM-012
**Path:** `apps/admin/app/admin/invitations/page.tsx`

**Purpose:** Dense admin invitation-management surface for email invite codes, courier/dispatcher roles, optional depot assignment, expiry state and future invite/revoke workflows.

**Pattern:**

```txt
page stack: flex flex-col gap-6
hero card: rounded-2xl border border-border bg-surface p-6 shadow-card
summary tile: rounded-2xl border border-border bg-surface p-5 shadow-card
filter card: rounded-2xl border border-border bg-surface p-6 shadow-card
search input: h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold shadow-card focus:border-primary
filter field: min-h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold shadow-card
table shell: rounded-2xl border border-border bg-surface shadow-card
table header: grid bg-surface-secondary px-6 py-3 text-xs font-semibold uppercase text-text-subtle
table row: grid px-6 py-4 text-sm text-text-primary hover:bg-surface-secondary
role avatar: h-11 w-11 rounded-xl bg-primary-lightest text-primary-darker
status badge: rounded-full px-2.5 py-1 text-xs font-semibold with token tone groups
invite code pill: rounded-xl border border-border bg-surface px-3 py-2 shadow-card
invitation draft panel: rounded-2xl border border-border bg-surface p-6 shadow-card
readonly email input: h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold shadow-card
select preview field: min-h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold shadow-card
scope tile: rounded-xl border px-4 py-3 with success/info/warning/primary soft token groups
audit reminder: rounded-xl border border-warning-light bg-warning-lightest px-4 py-3
action button: h-9 or h-11 rounded-xl px-3/4 with primary/secondary/error token groups
```

**States:**

- static search input
- static role, depot and status filters
- active, used, expired and revoked invitation status badges
- courier and dispatcher role badges
- optional depot assignment preview
- right-column static invite creation preview with email, role, depot, expiry and code preview
- visual-only create, details, revoke, prepare and discard actions

**Notes:**

- Keep invitation pages operational and table-first; avoid replacing code management with large profile cards.
- Real invite creation and revocation must later be company-scoped, permission-checked server-side and audit logged.
- Dispatcher invite creation must later enforce explicit permission and depot scope before real mutations are allowed.
- Courier registration from a used invite must still start with `pending_approval`; the admin UI copy is not a backend security boundary.

---

### RF-ADM-013 - Accountant Export UI

**Status:** implemented

**Notes:**

- Added the `/admin/exports` route at `apps/admin/app/admin/exports/page.tsx`.
- Added `apps/admin/lib/mock/adminExports.ts` for approved-shift export preview rows, summary counts, static filters and export draft data.
- The page uses server-rendered mock data only; no client state, backend call, InsForge auth, route protection, RLS change, CSV generation, XLSX generation, real file download or audit-log write was added.
- Export copy keeps approved-only shift scope, billable minutes, company scope and later audit logging visible for export backend work.

---

### Admin Accountant Export Screen

**Status:** implemented
**Feature ID:** RF-ADM-013
**Path:** `apps/admin/app/admin/exports/page.tsx`

**Purpose:** Dense admin accountant-export preparation surface for approved shift rows, monthly payroll totals, static export filters and future CSV/XLSX download workflows.

**Pattern:**

```txt
page stack: flex flex-col gap-6
hero card: rounded-2xl border border-border bg-surface p-6 shadow-card
summary tile: rounded-2xl border border-border bg-surface p-5 shadow-card
filter card: rounded-2xl border border-border bg-surface p-6 shadow-card
filter field: min-h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold shadow-card
table shell: rounded-2xl border border-border bg-surface shadow-card
table header: grid bg-surface-secondary px-6 py-3 text-xs font-semibold uppercase text-text-subtle
table row: grid px-6 py-4 text-sm text-text-primary hover:bg-surface-secondary
courier code avatar: h-11 w-11 rounded-xl bg-primary-lightest text-primary-darker
status badge: rounded-full px-2.5 py-1 text-xs font-semibold with token tone groups
export draft panel: rounded-2xl border border-border bg-surface p-6 shadow-card
period highlight: rounded-xl border border-primary-light bg-primary-lightest p-4
readonly form input: h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold shadow-card
format tile: rounded-xl border px-4 py-3 with primary/success soft token groups
checklist row: rounded-xl border border-border-light bg-surface-secondary px-4 py-3
audit reminder: rounded-xl border border-warning-light bg-warning-lightest px-4 py-3
action button: h-10 or h-11 rounded-xl px-4 with primary/secondary token groups
```

**States:**

- static month, depot and payment-mode filters
- approved-only preview rows
- hourly and daily-fixed payment badges
- automatic, capped, daily-fixed and manual-correction billable source labels
- CSV and XLSX visual download actions
- right-column static export draft with read-only scope fields
- checklist and audit reminder for later real export generation

**Notes:**

- Keep export pages table-first and accountant-oriented; avoid marketing download cards or public file-preview patterns.
- Real CSV/XLSX export generation belongs to later document/export phases and must use approved shifts only, `billable_minutes`, company scope and audit logging.
- Dispatcher export visibility must later be depot-scoped before real rows or files are exposed.

---

### RF-ADM-014 - Audit Logs UI

**Status:** implemented

**Notes:**

- Added the `/admin/audit-logs` route at `apps/admin/app/admin/audit-logs/page.tsx`.
- Added `apps/admin/lib/mock/adminAuditLogs.ts` for audit rows, summary counts, static filters and change-detail data.
- The page uses server-rendered mock data only; no client state, backend call, InsForge auth, route protection, RLS change, log creation, log mutation, log export or client-side audit write was added.
- Audit copy keeps company scope, actor, action, target, before/after snapshots, reason and immutable-log ownership visible for later backend work.

---

### Admin Audit Logs Screen

**Status:** implemented
**Feature ID:** RF-ADM-014
**Path:** `apps/admin/app/admin/audit-logs/page.tsx`

**Purpose:** Dense admin audit-trail surface for reviewing sensitive changes across shifts, payroll, dispatcher access, documents, invitations and exports.

**Pattern:**

```txt
page stack: flex flex-col gap-6
hero card: rounded-2xl border border-border bg-surface p-6 shadow-card
summary tile: rounded-2xl border border-border bg-surface p-5 shadow-card
filter card: rounded-2xl border border-border bg-surface p-6 shadow-card
filter field: min-h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold shadow-card
table shell: rounded-2xl border border-border bg-surface shadow-card
table header: grid bg-surface-secondary px-6 py-3 text-xs font-semibold uppercase text-text-subtle
table row: grid px-6 py-4 text-sm text-text-primary hover:bg-surface-secondary
actor avatar: h-11 w-11 rounded-xl bg-primary-lightest text-primary-darker
action badge: rounded-full px-2.5 py-1 text-xs font-semibold with token tone groups
change detail panel: rounded-2xl border border-border bg-surface p-6 shadow-card
selected entry highlight: rounded-xl border border-primary-light bg-primary-lightest p-4
before/after table: rounded-xl border border-border-light with divide-y divide-border-light
reason panel: rounded-xl border border-warning-light bg-warning-lightest px-4 py-3
security note tile: rounded-xl border px-4 py-3 with primary/success/warning soft token groups
checklist row: rounded-xl border border-border-light bg-surface-secondary px-4 py-3
action button: h-10 or h-11 rounded-xl px-4 with primary/secondary token groups
```

**States:**

- static actor, action, date and target filters
- money, access, document and workflow audit scopes
- admin and dispatcher actor labels
- action badges for approval, rejection, override, upload, access change, invitation revoke and export creation
- right-column static change-detail panel with before/after values
- immutable-log warning and security checklist

**Notes:**

- Keep audit-log pages read-only, compliance-oriented and table-first.
- Do not create editable audit widgets or client-side log mutation flows.
- Real audit rows must be server-generated, company-scoped and immutable from browser code.
- Dispatcher audit visibility must later be depot-scoped before real rows are exposed.

---

### RF-ADM-015 - Company Settings UI

**Status:** implemented

**Notes:**

- Added the `/admin/settings` route at `apps/admin/app/admin/settings/page.tsx`.
- Added `apps/admin/lib/mock/adminSettings.ts` for company profile fields, asset placeholders, language options, retention settings, operational rules, summary tiles and settings draft data.
- The page uses server-rendered mock data only; no client state, backend call, InsForge auth, route protection, RLS change, storage upload, company settings mutation or audit-log write was added.
- Settings copy keeps admin-only company scope, private `company-assets`, stamp PNG support, default German language and 14-day shift-photo retention visible for later backend/PDF work.

---

### Admin Company Settings Screen

**Status:** implemented
**Feature ID:** RF-ADM-015
**Path:** `apps/admin/app/admin/settings/page.tsx`

**Purpose:** Admin company-settings surface for tenant profile details, logo/stamp placeholders, default language, retention defaults and future settings-save workflows.

**Pattern:**

```txt
page stack: flex flex-col gap-6
hero card: rounded-2xl border border-border bg-surface p-6 shadow-card
summary tile: rounded-2xl border border-border bg-surface p-5 shadow-card
profile card: rounded-2xl border border-border bg-surface p-6 shadow-card
readonly form input: h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold shadow-card
asset upload placeholder: rounded-2xl border border-dashed border-primary-light bg-primary-lightest p-5
asset icon cell: h-14 w-14 rounded-2xl bg-surface text-primary shadow-card
language option tile: rounded-xl border px-4 py-3 with selected primary soft state
retention tile: rounded-xl border px-4 py-3 with primary/success/warning soft token groups
settings draft panel: rounded-2xl border border-border bg-surface p-6 shadow-card
selected workspace highlight: rounded-xl border border-primary-light bg-primary-lightest p-4
checklist row: rounded-xl border border-border-light bg-surface-secondary px-4 py-3
storage reminder: rounded-xl border border-info-light bg-info-lightest px-4 py-3
audit reminder: rounded-xl border border-warning-light bg-warning-lightest px-4 py-3
action button: h-11 rounded-xl px-4 with primary/secondary token groups
```

**States:**

- static company profile fields
- logo and stamp PNG upload placeholders with disabled file inputs
- default German language active state and Bulgarian optional state
- retention tiles for shift photos, payslips, contracts/private documents and audit logs
- right-column static settings draft with save/reset visual actions
- operational rule tiles for payment modes, start/stop GPS and dispatcher depot scope

**Notes:**

- Keep settings pages form-like and operational; avoid marketing account/profile layouts.
- Real settings changes must later be admin-only, company-scoped, server-side permission checked and audit-log capable where sensitive.
- Real logo/stamp upload must use the private `company-assets` bucket and must not expose public asset URLs.
- The 14-day cleanup applies only to `shift-photos`; durable private documents must stay outside that retention flow.

---

## Components

Components will be moved from `planned` to `implemented` and then `approved` as RouteForge is built feature by feature.
