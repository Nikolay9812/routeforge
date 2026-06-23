# UI Rules

Concise rules for building RouteForge UI. Design assets in `context/designs/` are the visual source of truth. These rules cover the most important patterns and constraints to keep the mobile app and admin panel consistent without over-specifying every detail.

RouteForge has two UI surfaces:

- `apps/mobile` — Expo courier app
- `apps/admin` — Next.js admin panel

Both must feel like the same product family: clean, operational, blue-and-white, rounded, card-based, readable and trustworthy.

---

## Font

Use **Inter** as the primary font.

### Admin

Import Inter via `next/font/google` in the admin root layout.

```typescript
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});
```

Apply the font variable class to the `<html>` tag in the root layout.

```tsx
<html lang="de" className={inter.variable}>
```

The `--font-sans` variable is declared in `@theme` inside `apps/admin/app/globals.css`.

### Mobile

Use Inter or the closest available configured font in Expo. If Inter is not yet loaded in early UI phases, do not block feature implementation, but the final UI must use Inter.

Rules:

- Never use random system fonts as the final primary font
- Keep typography simple and operational
- Do not mix multiple font families

---

## Layout

### Admin Layout

- Admin uses sidebar navigation, not top-only navigation
- Sidebar width: 260px desktop
- Topbar height: 64px
- Main content max-width: 1440px
- Main content padding: 32px on desktop
- Gap between main sections: 24px
- Dashboard and tables use full available width
- Dense tables must remain readable

### Mobile Layout

- Mobile uses bottom tab navigation
- Main screen padding: 16px
- Gap between cards: 16px
- Primary action must be reachable with one hand
- Shift timer and Start/End button must be visually dominant
- Avoid tiny touch targets
- Minimum touch target: 44px height
- Do not overcrowd mobile screens

---

## Navigation

### Mobile Bottom Tabs

Mobile tab items:

```txt
Home    Historie    Bericht    Postfach    Profil
```

Rules:

- Active tab uses `text-primary`
- Inactive tab uses `text-text-muted`
- Tab labels are German by default
- Keep icons simple and consistent
- Do not add more than 5 primary tabs
- Secondary pages use normal stack navigation

---

### Admin Sidebar

Admin sidebar items:

```txt
Dashboard
Schichten
Kuriere
Dispatcher
Depots
Dokumente
Einladungen
Exporte
Audit Logs
Einstellungen
```

Rules:

- Active item uses `bg-primary-lightest text-primary`
- Inactive item uses `text-text-secondary`
- Hover uses `bg-surface-secondary`
- Sidebar background is `bg-surface`
- Sidebar border uses `border-border`
- Do not use top navbar as the main admin navigation

---

## Cards

Every major content section lives in a card.

### Admin Card

```txt
background: bg-surface
border: border border-border
border-radius: rounded-2xl
padding: p-6
shadow: shadow-card
```

### Mobile Card

```txt
background: bg-surface
border: border border-border
border-radius: rounded-3xl
padding: p-5
```

Rules:

- Cards are usually white
- Use colored backgrounds only for small badges, alerts, status states or subtle highlighted sections
- Do not use heavy gradients on cards
- Do not stack too many nested cards
- Prefer one clear purpose per card

---

## Typography Hierarchy

Use a simple hierarchy consistently.

### Admin

**Page title**

```txt
font-size: 30px
font-weight: 700
color: text-text-primary
line-height: 38px
```

**Section headings / card titles**

```txt
font-size: 18px
font-weight: 600
color: text-text-primary
line-height: 28px
```

**Body / table text**

```txt
font-size: 14px
font-weight: 500
color: text-text-primary
line-height: 20px
```

**Labels / muted text**

```txt
font-size: 12px
font-weight: 400
color: text-text-muted
line-height: 16px
```

**Stat numbers**

```txt
font-size: 30px
font-weight: 700
color: text-text-primary
line-height: 36px
```

---

### Mobile

**Screen title**

```txt
font-size: 24px
font-weight: 700
color: text-text-primary
line-height: 32px
```

**Timer**

```txt
font-size: 44px
font-weight: 800
color: text-text-primary
line-height: 52px
```

**Card title**

```txt
font-size: 16px
font-weight: 700
color: text-text-primary
line-height: 24px
```

**Body text**

```txt
font-size: 14px
font-weight: 400
color: text-text-primary
line-height: 21px
```

**Muted/helper text**

```txt
font-size: 12px
font-weight: 400
color: text-text-muted
line-height: 16px
```

---

## Badges

All status badges use pill shape unless specifically noted.

```txt
border-radius: rounded-full
padding: px-2 py-0.5
font-size: text-xs
font-weight: font-semibold
```

Use status token groups:

| Meaning          | Background             | Text                       |
| ---------------- | ---------------------- | -------------------------- |
| Approved / active | `bg-success-lightest` | `text-success-foreground`  |
| Submitted / info  | `bg-info-lightest`    | `text-info-foreground`     |
| Pending / review  | `bg-warning-lightest` | `text-warning-foreground`  |
| Rejected / danger | `bg-error-lightest`   | `text-error-foreground`    |
| Draft / neutral   | `bg-neutral-light`    | `text-neutral-foreground`  |
| Corrected         | `bg-primary-lightest` | `text-primary-darker`      |

Rules:

- Do not invent random badge colors
- Badge label must match translation keys
- Status badges must be readable at a glance

---

## Buttons

### Primary Button

Used for main positive action.

```txt
background: bg-primary
color: text-primary-foreground
border-radius: rounded-xl
padding admin: px-4 py-2
padding mobile: px-5 py-3
font-size: 14px admin / 15px mobile
font-weight: 600 admin / 700 mobile
```

Examples:

- Start Shift
- Submit Report
- Create Invitation
- Download PDF
- Save

### Secondary Button

```txt
background: bg-surface
border: border border-border
color: text-text-primary
border-radius: rounded-xl
padding: px-4 py-2
```

### Danger Button

```txt
background: bg-error
color: text-error-foreground
border-radius: rounded-xl
```

Use for:

- Reject Shift
- Revoke Invitation
- Suspend Courier
- Delete / destructive actions

### Ghost Button

```txt
background: transparent
color: text-text-secondary
hover: bg-surface-secondary
border-radius: rounded-xl
```

Rules:

- Mobile primary buttons must be large
- Dangerous actions require confirmation
- Reject/correct actions require a reason
- Do not use primary button style for destructive actions

---

## Form Inputs

### Admin Inputs

```txt
background: bg-surface
border: border border-border
border-radius: rounded-xl
padding: px-3 py-2
font-size: 14px
color: text-text-primary
placeholder: text-text-muted
focus: ring-1 ring-primary border-primary
```

### Mobile Inputs

```txt
background: bg-surface
border: border border-border
border-radius: rounded-2xl
padding: px-4 py-3
font-size: 15px
color: text-text-primary
placeholder: text-text-muted
```

Rules:

- Labels are required for operational forms
- Required fields must be visually clear
- Error messages must be human-readable
- Do not show raw validation errors
- Use German labels by default

---

## Tables

Tables are used in admin only.

Common tables:

- Shifts
- Couriers
- Dispatchers
- Depots
- Documents
- Invitations
- Audit logs
- Export preview

Rules:

- No alternating row colors
- White rows only
- Row border: `border-border-light`
- Header background: `bg-surface-secondary`
- Header text: uppercase, 12px, font-weight 600, `text-text-subtle`
- Row text: 14px, `text-text-primary`
- Hover state: `bg-surface-secondary`
- Important statuses use badges, not colored full rows
- Geofence warnings may show red icon/badge, not full red row
- Tables with many records must have filters and pagination

---

## Shift Timer UI

The shift timer is the most important mobile UI element.

Rules:

- Timer must be large and centered inside the current shift card
- Timer must show real elapsed time
- Start/End action must be visually dominant
- Hourly courier near 10:00 h should show warning state
- Auto-stopped shift must show clear message
- Daily fixed courier must show:
  - real time
  - billable time 8:20 h by default
- Do not hide payment mode from courier

---

## Daily Report UI

Daily report form must be clear and operational.

Required sections:

- Date and status
- Depot
- Vehicle plate
- Start KM
- End KM
- Delivered packages
- Returns
- Abholungen
- Total stops
- Photo evidence
- Notes
- Signature
- Submit button

Rules:

- Required fields must be marked
- Invalid KM values show clear error
- Package counters cannot be negative
- Required photos must show missing/uploaded state
- Signature is required before submit
- Submitted/approved reports are read-only for courier

---

## Photo Upload Cards

```txt
empty: bg-surface-secondary border-dashed border-border-muted
uploaded: bg-success-lightest border-success-light
error: bg-error-lightest border-error-light
```

Rules:

- Show clear label for each photo type
- Show preview after photo selection
- Allow retake/change before submit
- Compress before upload
- Do not upload original full-size image unless required
- Show upload progress when backend is connected
- Photos expire after 14 days

Required photo types:

```txt
start_km
end_km
fahrtenbuch
mentor
```

---

## Geofence Warnings

Geofence state must be obvious in admin and understandable in mobile.

| State            | Style                         |
| ---------------- | ----------------------------- |
| Inside depot     | success token group            |
| Outside depot    | error token group              |
| Location missing | warning token group            |

Rules:

- Outside depot warning must be red
- Missing location must be warning/orange
- Do not use live tracking visuals in version 1
- Show start/stop location only
- Dispatcher sees warnings only inside assigned depot scope

---

## Calendar

Used in mobile history.

Rules:

- Worked days are marked with subtle primary background
- Selected day uses primary background and white text
- Approved/rejected/warning markers use small dots or badges
- Monthly totals appear above calendar
- Day details open from selected day
- Calendar must remain easy to read on small screens

---

## Digital Mailbox

Mailbox item states:

```txt
unread: bg-primary-lightest border-primary-light
read: bg-surface border-border
```

Rules:

- Unread documents must be visually obvious
- Category badge must be visible
- Download/open action must be clear
- Empty mailbox needs empty state
- Couriers see only their own mailbox items

---

## Admin Dashboard

Dashboard should give operational overview quickly.

Required cards:

- Monthly billable hours
- Active couriers today
- Pending shifts
- Geofence warnings

Required sections:

- Active couriers
- Shifts waiting for review
- Recent activity
- Quick actions

Rules:

- Most important operational problems appear near the top
- Geofence warnings must be visible
- Pending approvals must be visible
- Do not overcomplicate dashboard with unnecessary charts in v1

---

## Empty States

Every section that can be empty must have an empty state.

Pattern:

- Optional icon
- Short descriptive text
- One clear CTA if there is a logical next action

Examples:

```txt
Keine Schichten gefunden.
Noch keine Dokumente im Postfach.
Keine Einladungen vorhanden.
Keine Kuriere in diesem Depot.
```

Rules:

- Empty states are calm, not alarming
- Do not show blank tables without explanation
- Use German by default

---

## Loading States

Rules:

- Use skeletons for cards and tables
- Use button loading state during mutations
- Disable duplicate submit while loading
- Mobile upload/loading state must be obvious
- Never leave user unsure whether the app is working

---

## Error States

Rules:

- Never show raw database or stack trace errors
- Show human-readable German messages
- Preserve user input after errors
- Offline errors must not delete local draft
- Use retry button where appropriate

Examples:

```txt
Die Schicht konnte nicht gespeichert werden.
Das Dokument konnte nicht hochgeladen werden.
Bitte überprüfe die eingegebenen Daten.
Keine Verbindung. Der Bericht wurde lokal gespeichert.
```

---

## Dotted Background

A subtle dotted background is allowed because it matches the approved RouteForge mobile design direction.

Rules:

- Use mostly on mobile login, home and profile screens
- Use subtly
- Do not use behind dense tables
- Do not reduce readability
- Cards must remain clean white surfaces

---

## Language

German is the default UI language.

Bulgarian is optional and supported through translation keys.

Rules:

- Production UI uses translation keys
- Do not hardcode bilingual text in components
- Do not mix German and Bulgarian in the same label
- User-facing operational terms should be clear and practical

Examples:

```txt
Schicht starten
Schicht beenden
Bericht einreichen
Postfach
Abholungen
Genehmigt
Abgelehnt
Wartet auf Freigabe
```

---

## Tailwind / NativeWind Rules

### Admin

- Tailwind tokens come from `@theme` in `apps/admin/app/globals.css`
- Use semantic token utilities:
  - `bg-primary`
  - `text-text-primary`
  - `border-border`
  - `bg-success-lightest`
- Do not use random raw color classes

### Mobile

- NativeWind tokens come from `apps/mobile/tailwind.config.js`
- Use the same token names as admin when possible
- Do not copy web-only CSS into React Native components
- Do not use shadcn/ui in mobile

---

## Do Nots

- Never use JobPilot purple in RouteForge
- Never use Tailwind random color classes such as `bg-blue-600`, `text-gray-500`, `border-slate-200`
- Never hardcode hex values directly inside components
- Never define different visual systems for mobile and admin
- Never add gradients to normal card backgrounds
- Never use more than one font family
- Never show raw error messages to users
- Never use admin sidebar patterns in mobile
- Never use mobile bottom tabs in admin
- Never show live GPS tracking in v1
- Never make approved shifts editable by courier
- Never hide required correction reason
- Never build UI that is not connected to a Feature ID from `build-plan.md`
