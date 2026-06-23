# UI Tokens

Design tokens for RouteForge. All colors, typography, spacing, radius, shadows and component values are defined here. Use these tokens throughout the codebase — never hardcode colors or use random raw Tailwind color classes in components.

RouteForge has two frontends:

- `apps/admin` — Next.js admin panel with Tailwind CSS and shadcn/ui
- `apps/mobile` — Expo React Native courier app with NativeWind

Both apps must feel like the same product family: clean, operational, blue-and-white, card-based, rounded, calm and trustworthy.

---

## How to Use

### Admin / Next.js

The admin panel uses **Tailwind CSS v4**. Design tokens are defined using the `@theme` directive in `apps/admin/app/globals.css`.

Tailwind v4 automatically generates utility classes from `@theme` variables:

- `--color-primary` → `bg-primary`, `text-primary`, `border-primary`
- `--color-surface` → `bg-surface`, `text-surface`, `border-surface`
- `--color-warning` → `bg-warning`, `text-warning`, `border-warning`

```tsx
// Correct — uses generated utility classes
className="bg-surface text-text-primary border-border"

// Correct — uses semantic primary token
className="bg-primary text-primary-foreground"

// Also correct — references CSS variable directly when needed
style={{ color: "var(--color-text-primary)" }}

// Never — hardcoded hex values inside components
className="bg-[#2563EB] text-[#0F172A]"

// Never — random raw Tailwind color classes
className="bg-blue-600 text-gray-600"
```

---

### Mobile / Expo + NativeWind

The mobile app uses **NativeWind**. Tokens are mirrored in `apps/mobile/tailwind.config.js`.

```tsx
// Correct
<View className="rounded-3xl border border-border bg-surface p-5">
  <Text className="text-text-primary">Aktuelle Schicht</Text>
</View>

// Never
<View className="bg-blue-600 border-gray-200">
```

Mobile components should use token names, not arbitrary colors.

---

## Admin globals.css — Complete Token Definition

Add this to:

```txt
apps/admin/app/globals.css
```

```css
@import "tailwindcss";

@theme {
  /* Font */
  --font-sans: "Inter", sans-serif;

  /* Page and surfaces */
  --color-background: #f6f8fc;
  --color-background-dotted: #f8fafc;
  --color-surface: #ffffff;
  --color-surface-secondary: #f9fafb;
  --color-surface-tertiary: #f1f5f9;
  --color-surface-muted: #eef4ff;
  --color-surface-blue: #eff6ff;

  /* Borders */
  --color-border: #e2e8f0;
  --color-border-light: #edf2f7;
  --color-border-muted: #cbd5e1;
  --color-border-strong: #94a3b8;

  /* Text */
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted: #94a3b8;
  --color-text-subtle: #64748b;
  --color-text-inverse: #ffffff;
  --color-text-black: #020617;

  /* Primary brand — RouteForge blue */
  --color-primary: #2563eb;
  --color-primary-dark: #1d4ed8;
  --color-primary-darker: #1e40af;
  --color-primary-light: #dbeafe;
  --color-primary-lightest: #eff6ff;
  --color-primary-muted: #f0f7ff;
  --color-primary-foreground: #ffffff;

  /* Info */
  --color-info: #0ea5e9;
  --color-info-dark: #0369a1;
  --color-info-light: #e0f2fe;
  --color-info-lightest: #f0f9ff;
  --color-info-foreground: #075985;

  /* Success */
  --color-success: #10b981;
  --color-success-dark: #047857;
  --color-success-darker: #065f46;
  --color-success-light: #d1fae5;
  --color-success-lightest: #ecfdf5;
  --color-success-foreground: #047857;

  /* Warning */
  --color-warning: #f59e0b;
  --color-warning-dark: #b45309;
  --color-warning-light: #fef3c7;
  --color-warning-lightest: #fffbeb;
  --color-warning-foreground: #92400e;

  /* Error / Danger */
  --color-error: #ef4444;
  --color-error-dark: #b91c1c;
  --color-error-light: #fee2e2;
  --color-error-lightest: #fef2f2;
  --color-error-foreground: #991b1b;

  /* Neutral states */
  --color-neutral: #64748b;
  --color-neutral-light: #f1f5f9;
  --color-neutral-foreground: #334155;

  /* Locked / disabled */
  --color-disabled: #cbd5e1;
  --color-disabled-light: #f1f5f9;
  --color-disabled-foreground: #94a3b8;

  /* Dark overlays */
  --color-overlay: #0f172a;
  --color-overlay-muted: rgba(15, 23, 42, 0.55);

  /* Border radius */
  --radius-xs: 3px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;
  --radius-2xl: 24px;
  --radius-3xl: 30px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-card: 0px 1px 3px rgba(15, 23, 42, 0.08), 0px 1px 2px -1px rgba(15, 23, 42, 0.08);
  --shadow-card-lg: 0px 12px 28px rgba(15, 23, 42, 0.08);
  --shadow-floating: 0px 18px 40px rgba(15, 23, 42, 0.14);
}
```

---

## Mobile NativeWind Token Definition

Add matching tokens to:

```txt
apps/mobile/tailwind.config.js
```

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f6f8fc",
        "background-dotted": "#f8fafc",
        surface: "#ffffff",
        "surface-secondary": "#f9fafb",
        "surface-tertiary": "#f1f5f9",
        "surface-muted": "#eef4ff",
        "surface-blue": "#eff6ff",

        border: "#e2e8f0",
        "border-light": "#edf2f7",
        "border-muted": "#cbd5e1",
        "border-strong": "#94a3b8",

        "text-primary": "#0f172a",
        "text-secondary": "#475569",
        "text-muted": "#94a3b8",
        "text-subtle": "#64748b",
        "text-inverse": "#ffffff",
        "text-black": "#020617",

        primary: "#2563eb",
        "primary-dark": "#1d4ed8",
        "primary-darker": "#1e40af",
        "primary-light": "#dbeafe",
        "primary-lightest": "#eff6ff",
        "primary-muted": "#f0f7ff",
        "primary-foreground": "#ffffff",

        info: "#0ea5e9",
        "info-dark": "#0369a1",
        "info-light": "#e0f2fe",
        "info-lightest": "#f0f9ff",
        "info-foreground": "#075985",

        success: "#10b981",
        "success-dark": "#047857",
        "success-darker": "#065f46",
        "success-light": "#d1fae5",
        "success-lightest": "#ecfdf5",
        "success-foreground": "#047857",

        warning: "#f59e0b",
        "warning-dark": "#b45309",
        "warning-light": "#fef3c7",
        "warning-lightest": "#fffbeb",
        "warning-foreground": "#92400e",

        error: "#ef4444",
        "error-dark": "#b91c1c",
        "error-light": "#fee2e2",
        "error-lightest": "#fef2f2",
        "error-foreground": "#991b1b",

        neutral: "#64748b",
        "neutral-light": "#f1f5f9",
        "neutral-foreground": "#334155",

        disabled: "#cbd5e1",
        "disabled-light": "#f1f5f9",
        "disabled-foreground": "#94a3b8",
      },
      borderRadius: {
        xs: 3,
        sm: 6,
        md: 10,
        lg: 14,
        xl: 18,
        "2xl": 24,
        "3xl": 30,
      },
      fontFamily: {
        sans: ["Inter"],
      },
    },
  },
  plugins: [],
};
```

---

## Color Usage Guide

### Page Layout

| Element              | Token                    |
| -------------------- | ------------------------ |
| Page background      | `bg-background`          |
| Dotted background    | `bg-background-dotted`   |
| Card / surface       | `bg-surface`             |
| Secondary card       | `bg-surface-secondary`   |
| Blue-tinted surface  | `bg-surface-blue`        |
| Default border       | `border-border`          |
| Light border         | `border-border-light`    |
| Strong border        | `border-border-strong`   |

### Typography

| Element                         | Token                  |
| ------------------------------- | ---------------------- |
| Headings, primary text          | `text-text-primary`    |
| Secondary text, labels          | `text-text-secondary`  |
| Helper text                     | `text-text-subtle`     |
| Placeholder / muted             | `text-text-muted`      |
| Text on dark/primary background | `text-text-inverse`    |

### Primary Blue

Used for:

- Primary buttons
- Active navigation
- Active tab state
- Main timer action
- PDF download action
- Invite action
- Selected calendar day
- Focus rings

| Element                | Token                     |
| ---------------------- | ------------------------- |
| Button background      | `bg-primary`              |
| Button hover           | `bg-primary-dark`         |
| Button text            | `text-primary-foreground` |
| Light badge background | `bg-primary-light`        |
| Subtle background      | `bg-primary-muted`        |
| Selected day           | `bg-primary`              |

### Status Colors

| Status / Meaning       | Background             | Text                         | Border                 |
| ---------------------- | ---------------------- | ---------------------------- | ---------------------- |
| Approved / active      | `bg-success-lightest`  | `text-success-foreground`    | `border-success-light` |
| Submitted / info       | `bg-info-lightest`     | `text-info-foreground`       | `border-info-light`    |
| Draft / neutral        | `bg-neutral-light`     | `text-neutral-foreground`    | `border-border`        |
| Pending approval       | `bg-warning-lightest`  | `text-warning-foreground`    | `border-warning-light` |
| Rejected / error       | `bg-error-lightest`    | `text-error-foreground`      | `border-error-light`   |
| Corrected              | `bg-primary-lightest`  | `text-primary-darker`        | `border-primary-light` |
| Locked / disabled      | `bg-disabled-light`    | `text-disabled-foreground`   | `border-border-light`  |

### Shift Status Badges

| Shift Status   | Background            | Text                       |
| -------------- | --------------------- | -------------------------- |
| `draft`        | `bg-neutral-light`    | `text-neutral-foreground`  |
| `submitted`    | `bg-info-lightest`    | `text-info-foreground`     |
| `under_review` | `bg-warning-lightest` | `text-warning-foreground`  |
| `approved`     | `bg-success-lightest` | `text-success-foreground`  |
| `rejected`     | `bg-error-lightest`   | `text-error-foreground`    |
| `corrected`    | `bg-primary-lightest` | `text-primary-darker`      |

### Payment Mode Badges

| Payment Mode  | Background            | Text                      |
| ------------- | --------------------- | ------------------------- |
| `hourly`      | `bg-primary-lightest` | `text-primary-darker`     |
| `daily_fixed` | `bg-success-lightest` | `text-success-foreground` |

### Geofence Warnings

| State                | Background           | Text                    | Border               |
| -------------------- | -------------------- | ----------------------- | -------------------- |
| Inside depot         | `bg-success-lightest` | `text-success-foreground` | `border-success-light` |
| Outside depot        | `bg-error-lightest`   | `text-error-foreground` | `border-error-light` |
| Location missing     | `bg-warning-lightest` | `text-warning-foreground` | `border-warning-light` |

### Document Status

| Status      | Background             | Text                       |
| ----------- | ---------------------- | -------------------------- |
| Valid       | `bg-success-lightest`   | `text-success-foreground`  |
| Missing     | `bg-warning-lightest`   | `text-warning-foreground`  |
| Expired     | `bg-error-lightest`     | `text-error-foreground`    |
| Uploaded    | `bg-info-lightest`      | `text-info-foreground`     |
| Downloaded  | `bg-neutral-light`      | `text-neutral-foreground`  |

---

## Typography

Font family: **Inter**.

### Admin Typography

| Element                    | Size | Weight | Line height | Token                  |
| -------------------------- | ---- | ------ | ----------- | ---------------------- |
| App / logo text            | 19px | 700    | 28px        | `text-text-primary`    |
| Page title                 | 30px | 700    | 38px        | `text-text-primary`    |
| Section heading            | 18px | 600    | 28px        | `text-text-primary`    |
| Card title                 | 16px | 600    | 24px        | `text-text-primary`    |
| Stat number                | 30px | 700    | 36px        | `text-text-primary`    |
| Table header               | 12px | 600    | 16px        | `text-text-subtle`     |
| Table body                 | 14px | 500    | 20px        | `text-text-primary`    |
| Nav item                   | 14px | 500    | 20px        | `text-text-secondary`  |
| Active nav item            | 14px | 600    | 20px        | `text-primary`         |
| Label                      | 13px | 500    | 18px        | `text-text-secondary`  |
| Body text                  | 14px | 400    | 22px        | `text-text-primary`    |
| Muted text                 | 12px | 400    | 16px        | `text-text-muted`      |
| Badge text                 | 12px | 600    | 16px        | contextual             |

### Mobile Typography

| Element                    | Size | Weight | Line height | Token                  |
| -------------------------- | ---- | ------ | ----------- | ---------------------- |
| Screen title               | 24px | 700    | 32px        | `text-text-primary`    |
| Current timer              | 44px | 800    | 52px        | `text-text-primary`    |
| Section heading            | 18px | 700    | 26px        | `text-text-primary`    |
| Card title                 | 16px | 700    | 24px        | `text-text-primary`    |
| Card label                 | 13px | 500    | 18px        | `text-text-secondary`  |
| Body text                  | 14px | 400    | 21px        | `text-text-primary`    |
| Tab label                  | 11px | 600    | 14px        | contextual             |
| Button text                | 15px | 700    | 20px        | contextual             |
| Muted helper               | 12px | 400    | 16px        | `text-text-muted`      |

---

## Spacing

| Token       | Value      | Usage                         |
| ----------- | ---------- | ----------------------------- |
| `gap-1`     | 4px        | Tight inline gaps             |
| `gap-2`     | 8px        | Badge and small icon gaps     |
| `gap-3`     | 12px       | Form field gaps               |
| `gap-4`     | 16px       | Card internal groups          |
| `gap-5`     | 20px       | Mobile section groups         |
| `gap-6`     | 24px       | Between cards                 |
| `gap-8`     | 32px       | Large page sections           |
| `p-3`       | 12px       | Compact mobile card padding   |
| `p-4`       | 16px       | Default mobile card padding   |
| `p-5`       | 20px       | Large mobile card padding     |
| `p-6`       | 24px       | Admin card padding            |
| `px-4 py-2` | 16px / 8px | Admin button padding          |
| `px-5 py-3` | 20px / 12px | Mobile primary button padding |
| `px-3 py-1` | 12px / 4px | Badge padding                 |

---

## Component Tokens

### Admin Cards

```txt
background: bg-surface
border: border border-border
border-radius: rounded-2xl
padding: p-6
shadow: shadow-card
```

### Mobile Cards

```txt
background: bg-surface
border: border border-border
border-radius: rounded-3xl
padding: p-5
shadow: subtle platform shadow if supported
```

### Primary Button

```txt
background: bg-primary
text: text-primary-foreground
hover/pressed: bg-primary-dark
border-radius: rounded-xl
padding admin: px-4 py-2
padding mobile: px-5 py-3
font-weight: font-semibold / font-bold
```

### Secondary Button

```txt
background: bg-surface
border: border border-border
text: text-text-primary
border-radius: rounded-xl
padding: px-4 py-2
```

### Danger Button

```txt
background: bg-error
text: text-error-foreground
hover/pressed: bg-error-dark
border-radius: rounded-xl
```

### Ghost Button

```txt
background: transparent
text: text-text-secondary
hover: bg-surface-secondary
border-radius: rounded-xl
```

### Input Fields

```txt
background: bg-surface
border: border border-border
border-radius: rounded-xl
padding: px-3 py-2
text: text-text-primary
placeholder: text-text-muted
focus: ring-1 ring-primary
```

### Mobile Input Fields

```txt
background: bg-surface
border: border border-border
border-radius: rounded-2xl
padding: px-4 py-3
text: text-text-primary
placeholder: text-text-muted
```

### Badges

```txt
border-radius: rounded-full
padding: px-2 py-0.5
font-size: text-xs
font-weight: font-semibold
```

### Timer Card

```txt
background: bg-surface
border: border border-border
border-radius: rounded-3xl
padding: p-5
timer text: text-text-primary
action button: bg-primary
```

### Calendar Worked Day

```txt
worked day background: bg-primary-lightest
worked day text: text-primary-darker
selected day background: bg-primary
selected day text: text-primary-foreground
approved marker: bg-success
warning marker: bg-warning
rejected marker: bg-error
```

### Photo Upload Card

```txt
empty background: bg-surface-secondary
empty border: border border-dashed border-border-muted
uploaded background: bg-success-lightest
uploaded border: border-success-light
error background: bg-error-lightest
error border: border-error-light
```

### Geofence Warning Card

```txt
inside: bg-success-lightest text-success-foreground border-success-light
outside: bg-error-lightest text-error-foreground border-error-light
missing: bg-warning-lightest text-warning-foreground border-warning-light
```

### Digital Mailbox Item

```txt
unread: bg-primary-lightest border-primary-light
read: bg-surface border-border
category badge: contextual status token
```

### Admin Table

```txt
header background: bg-surface-secondary
header text: text-text-subtle
row background: bg-surface
row hover: bg-surface-secondary
row border: border-border-light
```

### Sidebar

```txt
background: bg-surface
border-right: border-border
active item: bg-primary-lightest text-primary
inactive item: text-text-secondary
hover item: bg-surface-secondary
```

---

## Dotted Background Pattern

The approved mobile designs use a subtle dotted background. This is allowed only as a background layer, not inside every card.

Admin CSS example:

```css
.routeforge-dotted-bg {
  background-color: var(--color-background);
  background-image: radial-gradient(var(--color-border-muted) 0.8px, transparent 0.8px);
  background-size: 18px 18px;
}
```

Rules:

- Use dotted background subtly
- Do not reduce text readability
- Do not place it inside dense data tables
- Prefer it on mobile home/login/profile backgrounds

---

## Operational Status Mapping

### Shift Status

| Status         | Label DE        | Label BG          | Token Group |
| -------------- | --------------- | ----------------- | ----------- |
| `draft`        | Entwurf         | Чернова           | neutral     |
| `submitted`    | Eingereicht     | Изпратена         | info        |
| `under_review` | In Prüfung      | В проверка        | warning     |
| `approved`     | Genehmigt       | Одобрена          | success     |
| `rejected`     | Abgelehnt       | Отхвърлена        | error       |
| `corrected`    | Korrigiert      | Коригирана        | primary     |

### Profile Status

| Status             | Label DE             | Label BG          | Token Group |
| ------------------ | -------------------- | ----------------- | ----------- |
| `pending_approval` | Wartet auf Freigabe  | Чака одобрение    | warning     |
| `active`           | Aktiv                | Активен           | success     |
| `inactive`         | Inaktiv              | Неактивен         | neutral     |
| `suspended`        | Gesperrt             | Спрян             | error       |

### Invitation Status

| Status    | Label DE    | Label BG       | Token Group |
| --------- | ----------- | -------------- | ----------- |
| `active`  | Aktiv       | Активна        | success     |
| `used`    | Verwendet   | Използвана     | neutral     |
| `expired` | Abgelaufen  | Изтекла        | warning     |
| `revoked` | Widerrufen  | Отменена       | error       |

---

## Logo

RouteForge logo direction:

```txt
shape: rounded square
background: linear-gradient(135deg, primary 0%, primary-darker 100%)
icon: route / forged path / delivery direction mark
text: RouteForge
font-weight: 700
```

Admin logo size:

```txt
icon: 36x36px
text: 19px / 700
```

Mobile logo size:

```txt
icon: 44x44px
text: 22px / 800
```

---

## Invariants

- Never use hex values directly in components
- Hex values are allowed only in token definition files
- Never use random raw Tailwind color classes like `bg-blue-600`, `text-gray-500`, `border-slate-200`
- Use RouteForge tokens:
  - `bg-primary`
  - `text-text-primary`
  - `border-border`
  - `bg-success-lightest`
  - `text-error-foreground`
- Font is Inter
- Primary brand color is RouteForge blue
- Purple from JobPilot is not used in RouteForge
- Mobile and admin must feel visually connected
- Use white cards, blue accents, rounded corners and calm spacing
- Dangerous actions use error tokens
- Geofence warnings use error tokens
- Pending approvals use warning tokens
- Approved states use success tokens
- Locked shifts use disabled/neutral tokens
- New UI patterns must be added to `context/ui-registry.md`
