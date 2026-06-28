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
**Feature ID:** RF-MOB-004  
**Path:** `apps/mobile/components/shift/CurrentShiftCard.tsx`

**Purpose:** Main mobile Home command card with current shift status, static mock timer, Start/End action, payment mode, depot/time details, GPS checkpoints and proof reminder.

**Classes / Pattern:**

```txt
container: RouteForgeCard with gap-5, rounded-rf3xl border-rfBorder bg-rfSurface p-5
header icon: h-14 w-14 rounded-rfXl bg-rfPrimaryLightest text-rfPrimary
title: text-xl font-extrabold leading-7 text-rfTextPrimary
status: Mobile Status Badge with success/info/warning/neutral tones
timer panel: rounded-rf2xl bg-rfSurfaceSecondary px-4 py-5
timer text: text-[44px] font-extrabold leading-[52px] text-rfTextPrimary
detail rows: h-12 w-12 rounded-rfLg bg-rfPrimaryLightest icons, text-[13px] labels, text-[17px] values
checkpoints: rounded-full accent icon cells, bordered status pill
primary action: min-h-[56px] rounded-rfXl bg-rfPrimary with text-rfTextInverse
```

**States:**

- mock not-started state
- visible payment mode summary
- GPS start and end checkpoints still open
- proof reminder visible
- static timer display only

**Rules:**

- Timer is visually dominant
- Start/End button is the main primary action
- Payment mode must be visible
- Auto-stopped state must be clear
- This feature does not start real timer logic, AsyncStorage persistence, GPS permission requests or backend shift creation.
- GPS copy must stay start/stop-only and must not imply live tracking.

---

### Daily Report Form Section

**Status:** implemented
**Feature ID:** RF-MOB-005
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

### Daily Report Field

**Status:** implemented
**Feature ID:** RF-MOB-005
**Path:** `apps/mobile/components/report/ReportField.tsx`

**Purpose:** Compact visual input tile for depot, vehicle and kilometer fields in the mock daily report.

**Classes / Pattern:**

```txt
container: min-h-[76px] flex-1 gap-2 rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary p-3.5
icon cell: h-9 w-9 rounded-rfLg bg-rfPrimaryLightest text-rfPrimary
label: text-xs font-extrabold leading-4 text-rfTextSecondary
value: text-[17px] font-extrabold leading-6 text-rfTextPrimary
helper: text-[11px] font-medium leading-[15px] text-rfTextMuted
```

**States:**

- default
- required marker

**Rules:**

- Use only as a visual mock field until RF-MOB-016 connects validation.
- Keep fields in two-column rows on the mobile report screen.

---

### Daily Report Counter Tile

**Status:** implemented
**Feature ID:** RF-MOB-005
**Path:** `apps/mobile/components/report/ReportCounterTile.tsx`

**Purpose:** Shows package counters for deliveries, returns, pickups and stops.

**Classes / Pattern:**

```txt
container: min-h-[122px] flex-1 items-center justify-center gap-2.5 px-2
divider: border-r border-rfBorderLight
icon cell: h-11 w-11 rounded-rfLg bg-rfPrimaryLightest text-rfPrimary
label: text-xs font-bold leading-4 text-rfTextSecondary
value: text-[24px] font-extrabold leading-8 text-rfTextPrimary
helper: text-[11px] font-medium leading-[15px] text-rfTextMuted
```

**States:**

- default
- optional right divider

**Rules:**

- Use RouteForge token colors only.
- Keep counter values visually dominant but smaller than the home shift timer.

---

### Photo Upload Card

**Status:** implemented
**Feature ID:** RF-MOB-005 / RF-MOB-017
**Path:** `apps/mobile/components/report/PhotoUploadCard.tsx`

**Purpose:** Visual proof-photo placeholder for required daily report photo types.

**States:**

| State    | Classes                                                         |
| -------- | --------------------------------------------------------------- |
| Missing  | `border-dashed border-rfBorderMuted bg-rfSurfaceSecondary`       |
| Uploaded | `border-rfSuccessLight bg-rfSuccessLightest`                     |
| Error    | planned for RF-MOB-017                                           |

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
- RF-MOB-017 adds preview, retake/change and compression
- Photos expire after 14 days

---

### Signature Placeholder Card

**Status:** implemented
**Feature ID:** RF-MOB-005
**Path:** `apps/mobile/components/report/SignaturePlaceholderCard.tsx`

**Purpose:** Visual readiness block for the required courier signature before real signature capture is implemented.

**Classes / Pattern:**

```txt
container: gap-3 rounded-rf2xl border border-dashed border-rfBorderMuted bg-rfSurfaceSecondary p-4
icon cell: h-12 w-12 rounded-rfLg bg-rfPrimaryLightest text-rfPrimary
label: text-[15px] font-extrabold leading-5 text-rfTextPrimary
helper: text-[12px] font-medium leading-4 text-rfTextSecondary
status: StatusBadge warning
```

**States:**

- missing signature placeholder

**Rules:**

- Do not capture or reuse signatures in RF-MOB-005.
- Replace or extend this pattern when RF-MOB-018 adds the real signature component.

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
**Feature ID:** RF-MOB-007
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
icon shell: h-11 w-11 rounded-rfLg bg-rfSurface
label: text-[14px] font-extrabold text-rfTextPrimary
helper: text-[11px] font-semibold text-rfTextSecondary
```

**States:**

- available
- expired after 14-day proof-photo retention

**Rules:**

- RF-MOB-007 does not open camera, download files or fetch signed URLs.
- Expired state must distinguish proof-photo retention from permanent documents.

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

## Components

Components will be moved from `planned` to `implemented` and then `approved` as RouteForge is built feature by feature.
