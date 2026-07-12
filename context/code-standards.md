# Code Standards

Implementation rules and conventions for the entire RouteForge project. The AI agent must follow these in every session without exception. These rules prevent pattern drift across Codex sessions.

---

## Engineering Mindset

The AI agent on this project operates as a senior full-stack engineer. This means:

- **Think before implementing** — understand the feature, the user flow, the data model and the security boundary before writing code
- **Read context files first** — never assume, always verify against `architecture.md`, `project-overview.md`, `build-plan.md` and `permissions.md`
- **Scope is sacred** — only build what the current Feature ID requires. Never go beyond scope even if it seems helpful
- **UI-first** — build visible UI with mock data before connecting real backend logic
- **Every feature must be testable** — if it cannot be verified immediately after implementation, it is incomplete
- **Clean over clever** — simple readable code that a junior developer can understand is always preferred over clever abstractions
- **One thing at a time** — complete one feature fully before touching the next
- **Shared logic first** — business rules that are used by both mobile and admin belong in `packages/shared`
- **Security is not optional** — role checks, company scoping and RLS must be respected in every backend feature
- **Failures are expected** — handle errors clearly, show safe user messages and never expose raw internals

---

## Codex Workflow

Codex must work by Feature ID from `context/build-plan.md`.

For every feature:

```txt
/architect FEATURE_ID
/implement FEATURE_ID
/review FEATURE_ID
/imprint FEATURE_ID
/remember save
```

Rules:

- Never implement before `/architect`
- Never skip feature IDs without user confirmation
- Never modify unrelated areas while implementing one feature
- Every completed feature updates `context/progress-tracker.md`
- Every new UI pattern updates `context/ui-registry.md`
- Every major decision updates `memory.md`
- If an error persists after one corrective attempt, stop and use `/recover`

---

## TypeScript

- Strict mode enabled in all TypeScript configs — no exceptions
- Never use `any` — use `unknown` and narrow the type
- Never use type assertions like `as SomeType` unless absolutely necessary and commented why
- All exported functions must have explicit parameter and return types
- Use `type` for object shapes and unions
- Use `interface` only for extendable component props
- Use union types for roles, statuses, payment modes and document categories
- Use `const` by default
- Use `let` only when reassignment is necessary
- Async functions must handle errors or return a typed result object
- Shared types live in `packages/shared/src/types.ts`
- Shared validation schemas live in `packages/shared/src/schemas/`

---

## Monorepo Rules

RouteForge is a monorepo with separate applications and shared logic.

```txt
apps/mobile     → Expo courier app
apps/admin      → Next.js admin panel
packages/shared → shared types, schemas, permissions, payroll, constants, translations
```

Rules:

- `apps/mobile` and `apps/admin` share types and business logic, not UI components
- `packages/shared` must never import from `apps/mobile`
- `packages/shared` must never import from `apps/admin`
- `packages/shared` must never import React Native, Next.js, InsForge clients or browser APIs
- Business rules used by both apps must go into `packages/shared`
- App-specific UI stays inside the app where it is used
- App-specific clients stay inside that app’s `lib/` folder

---

## Next.js Admin Conventions

- App Router only — no Pages Router
- Admin app lives in `apps/admin`
- Protected admin routes live under `/admin/*`
- Admin pages are Server Components by default
- Only add `"use client"` when the component requires:
  - `useState`
  - `useReducer`
  - `useEffect`
  - browser APIs
  - event listeners
  - client-only UI libraries
- Never add `"use client"` to layout files unless absolutely required
- Data fetching happens in Server Components or server utilities
- Client Components do not fetch sensitive data directly
- Route handlers live in `apps/admin/app/api/`
- Server Actions live in `apps/admin/actions/`
- Do not define Server Actions inline in components
- Middleware protects `/admin/*`
- Admin logic must never trust client-side role checks only
- All admin mutations must validate:
  - authenticated user
  - company scope
  - role
  - dispatcher depot access when relevant

---

## Expo Mobile Conventions

- Mobile app lives in `apps/mobile`
- Use Expo Router for navigation
- Use NativeWind for styling
- Use German labels by default through translation keys
- Do not hardcode Bulgarian/German bilingual strings in UI components
- Mobile screens are built with mock data first
- Mobile app must be usable one-handed
- Primary actions must have large touch targets
- Shift Start / End must be visually dominant
- Timer must calculate from stored `startedAt`, not only from in-memory state
- Active shift state must survive app restart
- Offline report drafts must not be lost
- No live GPS tracking in version 1
- Capture GPS only at shift start and shift end
- Photo compression must happen before upload
- Approved shifts are read-only for couriers

---

## File and Folder Naming

- Folders: kebab-case — `shift-review`, `daily-report`, `courier-profile`
- Component files: PascalCase — `ShiftTimerCard.tsx`, `CourierProfileHeader.tsx`
- Utility files: camelCase — `insforgeServer.ts`, `formatMinutes.ts`
- Type files: camelCase — `types.ts`, `payroll.ts`
- API route files: always `route.ts`
- Server Action files: camelCase — `shifts.ts`, `documents.ts`
- One component per file
- Never export multiple major components from one file
- Index files are allowed only for package exports or UI primitive folders
- Do not create barrel exports everywhere unless they reduce clear import noise

---

## Component Structure — Admin / Web

Every admin component follows this order:

```typescript
"use client"; // only if needed

// 1. External imports
import { useState } from "react";

// 2. Internal imports
import { Button } from "@/components/ui/button";
import { formatMinutes } from "@/lib/utils";

// 3. Shared imports
import type { Shift } from "@routeforge/shared";

// 4. Type definitions
type Props = {
  shift: Shift;
};

// 5. Component
export function ShiftTimerCard({ shift }: Props) {
  // state
  // derived values
  // handlers
  // return JSX
}
```

Rules:

- Never use default exports for components
- Always use named exports
- Props type is defined directly above the component
- No inline styles
- Styling uses Tailwind classes and project UI tokens
- Presentational components do not call InsForge directly
- Components do not contain permission logic beyond simple UI visibility helpers

---

## Component Structure — Mobile / React Native

Every mobile component follows this order:

```typescript
// 1. External imports
import { View, Text } from "react-native";

// 2. Internal imports
import { PrimaryButton } from "@/components/ui/PrimaryButton";

// 3. Shared imports
import type { Shift } from "@routeforge/shared";

// 4. Type definitions
type Props = {
  shift: Shift;
};

// 5. Component
export function CurrentShiftCard({ shift }: Props) {
  // state
  // derived values
  // handlers
  // return JSX
}
```

Rules:

- Use React Native primitives
- Use NativeWind `className` where supported
- Keep touch targets large
- Avoid deeply nested layout
- Avoid tiny text for operationally important data
- Do not use web-only APIs
- Do not import from `apps/admin`
- Do not duplicate shared payroll or permission logic

---

## API Route Handlers

```typescript
// apps/admin/app/api/shifts/approve/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const body: unknown = await req.json();

    // validate body with Zod
    // validate current user
    // validate company scope
    // validate role/depot permissions
    // perform mutation

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    console.error("[api/shifts/approve]", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

Rules:

- Every route handler has try/catch
- Every route handler validates request body before processing
- Every route handler validates auth and role scope
- Errors are logged with route path prefix
- Always return `{ success: boolean, data?: T, error?: string }`
- Never return raw database errors to the user
- Never place business logic directly in route handlers
- Route handlers call server utilities or Server Actions where appropriate

---

## Server Actions

```typescript
// apps/admin/actions/shifts.ts

"use server";

import { revalidatePath } from "next/cache";
import { createInsforgeServer } from "@/lib/insforge-server";

export async function approveShift(
  shiftId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const insforge = await createInsforgeServer();

    // validate current user
    // validate role and depot scope
    // approve shift
    // write audit log

    revalidatePath("/admin/shifts");

    return { success: true };
  } catch (error) {
    console.error("[actions/shifts/approveShift]", error);

    return {
      success: false,
      error: "Die Schicht konnte nicht genehmigt werden.",
    };
  }
}
```

Rules:

- Every Server Action has try/catch
- Every Server Action returns `{ success: boolean, error?: string }`
- Every mutation validates role and company scope
- Always call `revalidatePath` after mutations that affect page data
- Never throw from Server Actions
- Never expose raw error messages
- Sensitive changes must write to `audit_logs`

---

## Shared Business Logic

Shared business logic must live in `packages/shared`.

Examples:

```txt
packages/shared/src/payroll.ts
packages/shared/src/permissions.ts
packages/shared/src/shifts.ts
packages/shared/src/schemas/
packages/shared/src/translations/
```

Rules:

- Payroll logic is shared
- Legal break calculation is shared
- Shift status transitions are shared
- Permission helpers are shared
- Zod schemas are shared
- Translation keys are shared
- Never duplicate these rules inside mobile or admin
- UI can format results, but must not redefine the rules

---

## Payroll Rules

- Hourly courier:
  - Real time is tracked
  - Legal break is calculated automatically
  - Billable time is capped at 600 minutes / 10:00 h
  - Timer auto-stops at 10:00 h
- Daily fixed courier:
  - Real time is tracked
  - Billable time defaults to 500 minutes / 8:20 h
  - Admin/dispatcher can override billable time
  - Manual override requires a reason
- Every billable override must create an audit log
- Exports use `billable_minutes`
- Review screens show both real time and billable time

---

## Shift Status Rules

Allowed statuses:

```typescript
type ShiftStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "corrected";
```

Rules:

- Couriers can edit `draft` shifts
- Couriers can edit `rejected` shifts before resubmission
- Couriers cannot edit `submitted` shifts
- Couriers cannot edit `approved` shifts
- Admin/dispatcher can approve, reject or correct shifts within permission scope
- Reject requires reason
- Correct requires reason
- Approved shifts are used for accountant exports
- One courier can have one shift per day in version 1

---

## InsForge Client Usage

Admin browser context:

```typescript
// apps/admin/lib/insforge-client.ts
import { createBrowserClient } from "@insforge/ssr";
```

Admin server context:

```typescript
// apps/admin/lib/insforge-server.ts
import { createServerClient } from "@insforge/ssr";
```

Mobile context:

```typescript
// apps/mobile/lib/insforge-client.ts
import { createClient } from "@insforge/sdk";
```

Rules:

- Never use browser/mobile client in server-only code
- Never use server client in browser/mobile code
- Always await server client creation when cookies are involved
- Every query must be scoped by `company_id` when data belongs to a company
- Courier queries must be scoped to own profile
- Dispatcher queries must be scoped to assigned depot access
- Admin queries must be scoped to current company
- Never query sensitive data without role checks
- RLS is required even if server checks exist

---

## Row Level Security

Every company-owned table must be protected by RLS.

Rules:

- `companies` isolates tenants
- `profiles` isolates users by company and role
- `depots` are company-scoped
- `profile_depot_access` controls dispatcher scope
- `shifts` are company-scoped and role-scoped
- `shift_locations` are linked to shifts and company scope
- `shift_photos` are linked to shifts and company scope
- `documents` are private and role-scoped
- `mailbox_items` are courier-owned
- `audit_logs` are admin/dispatcher visible only
- No table containing sensitive data should be publicly readable

---

## Mobile Local State

### Active Shift State

```typescript
type ActiveShiftState = {
  shiftId: string | null;
  startedAt: string | null;
  currentDepotId: string | null;
  paymentMode: "hourly" | "daily_fixed";
  isRunning: boolean;
  autoStoppedAtMaxHours: boolean;
};
```

Rules:

- Use AsyncStorage for active shift persistence
- Timer derives from stored `startedAt`
- Closing the app must not reset the timer
- Store only necessary state locally
- Do not store sensitive documents permanently in AsyncStorage
- Unsynced daily reports must be marked clearly

### Offline Drafts

Rules:

- Save report drafts locally
- Mark as unsynced
- Sync when connection returns
- Show visible sync state
- Never lose entered daily report data because of weak signal

---

## Image and File Handling

Shift photos:

- Use `expo-image-picker` for selecting/capturing images
- Use `expo-image-manipulator` for compression
- Compress before upload
- Store files in `shift-photos`
- Save metadata in `shift_photos`
- Set `expires_at = uploaded_at + 14 days`
- Delete operational photos after 14 days
- Keep metadata if needed for audit/reporting

Documents:

- Store private documents in InsForge Storage
- Store metadata in `documents`
- Courier accesses only own documents
- Admin accesses company documents
- Dispatcher accesses scoped documents
- Use signed URLs or authenticated private access

---

## PDF Generation

Daily and monthly PDFs are generated server-side.

Rules:

- Use `@react-pdf/renderer`
- Daily report PDF includes:
  - company name
  - courier name
  - date
  - depot
  - vehicle
  - start/end time
  - break
  - net time
  - billable time
  - package counters
  - Abholungen
  - signature
  - approval status
  - company stamp PNG when available
- Monthly PDF summarizes shifts and totals
- PDF access is permission-scoped
- Generated PDFs may be stored in `generated-pdfs`
- Company stamp PNG lives in `company-assets`

---

## Accountant Exports

- Export approved shifts only
- Export uses `billable_minutes`
- Export includes real time and billable time
- Export can be filtered by:
  - month
  - depot
  - payment mode
- Export supports CSV and XLSX
- XLSX files should have readable headers and totals row
- Export headers should be German accountant-friendly
- Export generation should be audit logged

---

## Error Handling

- Never use empty catch blocks
- Always log or handle errors
- Console errors include context prefix:
  - `[actions/shifts]`
  - `[api/documents/upload]`
  - `[mobile/timer]`
- User-facing errors must be human readable
- Never expose raw database errors to users
- Never expose stack traces to users
- API route errors return generic messages
- Mobile errors should explain what the user can do next
- Offline errors should preserve local data

---

## Environment Variables

All environment variables are defined in local `.env` files. Never hardcode keys, URLs or secrets anywhere in the codebase.

### Admin

| Variable                        | Used In                |
| ------------------------------- | ---------------------- |
| `NEXT_PUBLIC_INSFORGE_URL`      | admin browser client   |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | admin browser client   |
| `INSFORGE_SERVICE_ROLE_KEY`     | server-only operations if needed |

### Mobile

| Variable                         | Used In              |
| -------------------------------- | -------------------- |
| `EXPO_PUBLIC_INSFORGE_URL`       | mobile InsForge client |
| `EXPO_PUBLIC_INSFORGE_ANON_KEY`  | mobile InsForge client |

Rules:

- `NEXT_PUBLIC_` variables are exposed to the browser
- `EXPO_PUBLIC_` variables are exposed to the mobile app
- Never put service role keys in mobile code
- Never put service role keys in browser code
- `.env` files are never committed
- `.env.example` may be committed with empty placeholder values

---

## Import Aliases

Use project aliases where configured.

Admin:

```typescript
import { Button } from "@/components/ui/button";
import { createInsforgeServer } from "@/lib/insforge-server";
import type { Shift } from "@routeforge/shared";
```

Mobile:

```typescript
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { getStoredActiveShift } from "@/lib/storage";
import type { Shift } from "@routeforge/shared";
```

Rules:

- Avoid relative imports that go up more than one level
- Use `@routeforge/shared` for shared types and logic
- Do not import admin files into mobile
- Do not import mobile files into admin

---

## Constants

Never hardcode business constants in multiple places.

Shared constants belong in `packages/shared/src/constants`.

Examples:

```typescript
export const HOURLY_MAX_MINUTES = 600;
export const DAILY_FIXED_MINUTES = 500;
export const SHIFT_PHOTO_RETENTION_DAYS = 14;
export const DEFAULT_LANGUAGE = "de";
```

Rules:

- Use constants everywhere
- Do not repeat magic numbers in components
- Business constants must be named clearly

---

## Comments

- No comments explaining obvious code
- Code must be self-explanatory
- Comments are allowed only for why a non-obvious decision exists
- Never leave TODO comments in committed code
- If something is intentionally temporary, document it in `progress-tracker.md`, not as random TODOs

---

## Dependencies

Never install a new package without a clear reason. Before installing anything check:

1. Is the functionality already available in Expo, Next.js or React Native?
2. Is it already available through shadcn/ui?
3. Does a simpler native solution exist?
4. Is this dependency safe for the target app?
5. Does it work in Expo Go or does it require a dev build?

Approved dependencies for this project:

### Shared

- `typescript`
- `zod`

### Admin

- `next`
- `react`
- `react-dom`
- `tailwindcss`
- `shadcn/ui` components
- `lucide-react`
- `@insforge/ssr`
- `@react-pdf/renderer`
- XLSX/CSV export library to be selected before RF-DOC-003

### Mobile

- `expo`
- `expo-file-system`
- `expo-router`
- `react-native`
- `nativewind`
- `@react-native-async-storage/async-storage`
- `expo-image-picker`
- `expo-image-manipulator`
- `expo-location`
- React Native signature library to be selected before RF-MOB-018
- `@insforge/sdk` or official InsForge client supported for mobile

Do not install any other packages without updating this list first.

---

## Design Rules

- No hardcoded hex colors directly in components
- Use tokens from `context/ui-tokens.md`
- Use existing UI patterns from `context/ui-registry.md`
- New UI patterns must be registered after implementation
- Mobile and admin should feel like one product family
- German is default UI language
- Bulgarian support goes through translation keys
- Primary actions must be obvious
- Dangerous admin actions require confirmation
- Correction actions require reason
- Geofence warnings use clear red warning state
- Approved/locked shifts must look clearly read-only
