# Library Docs

Project-specific usage patterns for every third party library in RouteForge. This file only covers how we use each library in this specific project — rules, patterns, and constraints specific to RouteForge.

Read the relevant section before implementing any feature that touches these libraries.

---

## Before Using Any Library

Before implementing any feature that uses a third party library:

1. **Check AGENTS.md** at the project root — it defines the installed skills, the Codex workflow, and how the AI agent must operate in this repository.

2. **Check context/build-plan.md** — every implementation must be connected to a specific RouteForge Feature ID.

3. **Check context/architecture.md** — confirm whether the library belongs to:
   - `apps/mobile`
   - `apps/admin`
   - `packages/shared`
   - `insforge`
   - `docs`

4. **Check this file** for RouteForge-specific usage patterns.

5. **Check official library docs if API behavior may have changed** before implementing library-specific code.

The order of authority is:

```txt
Official docs / MCP / installed skill
        ↓
AGENTS.md
        ↓
context/architecture.md
        ↓
context/build-plan.md
        ↓
context/code-standards.md
        ↓
this file
        ↓
general training knowledge
```

Never rely on general training knowledge alone for library APIs — they change frequently and training data may be outdated.

---

## InsForge

InsForge is the backend layer for RouteForge.

RouteForge uses InsForge for:

- Authentication
- Postgres database
- Row Level Security
- Storage buckets
- Private document access
- Signed URLs or authenticated file access

### Project Rules

- Every company-owned table must include `company_id`
- RLS is mandatory for sensitive tables
- Couriers can access only their own data
- Dispatchers can access only assigned depot scope
- Admins can access all company data
- No cross-company data leakage is allowed
- Client-side role checks are only UX helpers
- Server-side checks and RLS are the real security boundary

---

### Admin Browser Client

Used only in browser/client components for auth state or safe client-side reads.

```typescript
// apps/admin/lib/insforge-client.ts
import { createBrowserClient } from "@insforge/ssr";

export const insforge = createBrowserClient(
  process.env.NEXT_PUBLIC_INSFORGE_URL!,
  process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
);
```

**Rules:**

- Browser client is allowed only in client components
- Never use browser client for privileged mutations
- Never expose service role keys to the browser
- Never use browser client in Server Actions or API routes

---

### Admin Server Client

Used in Server Components, API routes, Server Actions, and protected server utilities.

```typescript
// apps/admin/lib/insforge-server.ts
import { createServerClient } from "@insforge/ssr";
import { cookies } from "next/headers";

export const createInsforgeServer = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_INSFORGE_URL!,
    process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
};
```

**Rules:**

- Always await `createInsforgeServer()`
- Use server client for protected data access
- Validate authenticated user before data access
- Validate company scope before queries
- Validate role and dispatcher depot scope before mutations

---

### Mobile Client

Used in the Expo mobile app.

```typescript
// apps/mobile/lib/insforge-client.ts
import { createClient } from "@insforge/sdk";

export const insforge = createClient({
  url: process.env.EXPO_PUBLIC_INSFORGE_URL!,
  anonKey: process.env.EXPO_PUBLIC_INSFORGE_ANON_KEY!,
});
```

**Rules:**

- Mobile uses public anon key only
- Never put service role keys in mobile code
- Mobile operations must be courier-safe
- Sensitive admin operations must go through server-side admin routes/actions
- RLS must protect mobile access

---

### Auth Pattern

```typescript
const insforge = await createInsforgeServer();

const {
  data: { user },
  error,
} = await insforge.auth.getUser();

if (error || !user) {
  redirect("/login");
}
```

**Rules:**

- Admin login protects `/admin/*`
- Mobile login protects courier screens
- Invite registration creates `pending_approval` profile
- Courier cannot fully use app until approved
- Current profile must be loaded after authentication
- Role and status determine access

---

### Database Query Pattern

```typescript
const { data, error } = await insforge
  .from("shifts")
  .select("*")
  .eq("company_id", companyId)
  .eq("courier_profile_id", courierProfileId)
  .order("shift_date", { ascending: false });

if (error) {
  console.error("[shifts/list]", error);
  return { success: false, error: "Schichten konnten nicht geladen werden." };
}
```

**Rules:**

- Always handle `error`
- Always scope company-owned queries by `company_id`
- Courier queries must include own profile scope
- Dispatcher queries must include assigned depot scope
- Use `.single()` only when exactly one row is expected
- Never fetch sensitive data without checking role/scope

---

### Storage Pattern

```typescript
const { data, error } = await insforge.storage
  .from("shift-photos")
  .upload(storagePath, compressedFile, {
    contentType: "image/jpeg",
    upsert: false,
  });

if (error) {
  console.error("[storage/shift-photos/upload]", error);
  return { success: false, error: "Foto konnte nicht hochgeladen werden." };
}
```

**Storage buckets:**

| Bucket              | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `courier-documents` | ID cards, driving licenses, personal docs    |
| `shift-photos`      | Operational shift proof photos               |
| `payslips`          | Payslips and payroll documents               |
| `generated-pdfs`    | Daily and monthly generated reports          |
| `company-assets`    | Company logos and stamp PNG files            |

**Rules:**

- Store files in private/authenticated buckets
- Store metadata in database tables
- Use signed URLs or authenticated access for downloads
- Do not store heavy binary files directly in Postgres
- Shift photos expire after 14 days
- Payslips/contracts are not deleted by the shift photo cleanup job

---

## Next.js App Router

RouteForge uses Next.js for the admin panel only.

Admin app path:

```txt
apps/admin
```

### Server Components

Default for admin pages.

```typescript
// apps/admin/app/admin/shifts/page.tsx
import { getShiftsForReview } from "@/lib/shifts";

export default async function ShiftsPage() {
  const result = await getShiftsForReview();

  return (
    <main>
      {/* render data */}
    </main>
  );
}
```

**Rules:**

- Pages are Server Components by default
- Fetch data server-side
- Do not add `"use client"` unless needed
- Do not put mutation logic directly in page components
- Do not call mobile code from admin

---

### Client Components

Use only for interactivity.

```typescript
"use client";

import { useState } from "react";

type Props = {
  initialStatus: string;
};

export function ShiftStatusFilter({ initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);

  return null;
}
```

**Use client only when needed for:**

- Local state
- Event handlers
- Browser APIs
- Interactive dialogs
- Filters/sorting UI
- Client-side form state

---

### Route Handlers

Used for API endpoints such as file uploads, signed URLs, PDF generation, and exports.

```typescript
// apps/admin/app/api/documents/signed-url/route.ts
import { NextRequest, NextResponse } from "next/server";

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const body: unknown = await req.json();

    // validate body with Zod
    // check auth
    // check role/scope
    // generate signed URL

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    console.error("[api/documents/signed-url]", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

**Rules:**

- Validate request body with Zod
- Check auth and permissions
- Return success wrapper
- Never expose raw errors
- Never place large business logic directly in route handlers

---

### Server Actions

Used for UI-triggered mutations.

```typescript
// apps/admin/actions/shifts.ts
"use server";

import { revalidatePath } from "next/cache";

export async function approveShift(
  shiftId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // check auth
    // check role/scope
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

**Rules:**

- Every Server Action returns `{ success: boolean; error?: string }`
- Every mutation checks auth, company scope and role
- Sensitive changes write to `audit_logs`
- Always call `revalidatePath` after mutations affecting page data

---

## Expo

RouteForge uses Expo for the courier mobile app.

Mobile app path:

```txt
apps/mobile
```

### Rules

- Use Expo Go during early UI-first development
- Do not add native-only packages unless confirmed compatible
- Prefer Expo SDK libraries before custom native modules
- Keep mobile screens simple, fast and one-handed
- Test on real device early
- Do not implement admin-only features in mobile
- Do not store private documents permanently in local storage

---

## Expo Router

Used for mobile file-based routing.

### Route Structure

```txt
apps/mobile/app/
├── _layout.tsx
├── index.tsx
├── login.tsx
├── invite.tsx
├── (tabs)/
│   ├── _layout.tsx
│   ├── home.tsx
│   ├── history.tsx
│   ├── report.tsx
│   ├── mailbox.tsx
│   └── profile.tsx
├── history/
│   └── [date].tsx
└── mailbox/
    └── [id].tsx
```

### Navigation Pattern

```typescript
import { router } from "expo-router";

router.push("/history/2026-06-23");
```

**Rules:**

- Use file-based routes
- Keep tab names short
- Use German labels in tab UI
- Do not put business logic in route files if it can live in `features/`
- Route files compose components and feature hooks

---

## NativeWind

NativeWind is used for styling React Native components with Tailwind-style classes.

### Pattern

```typescript
import { Text, View } from "react-native";

export function CurrentShiftCard() {
  return (
    <View className="rounded-3xl border border-slate-200 bg-white p-5">
      <Text className="text-sm text-slate-500">Aktuelle Schicht</Text>
      <Text className="mt-2 text-4xl font-bold text-slate-950">04:32</Text>
    </View>
  );
}
```

**Rules:**

- Use NativeWind for mobile styling
- Follow `context/ui-tokens.md`
- Avoid random colors
- Keep primary action buttons large
- Use consistent rounded cards
- Do not copy admin shadcn components into mobile

---

## Tailwind CSS

Tailwind is used in the admin panel.

### Pattern

```typescript
export function StatsCard() {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">Offene Schichten</p>
      <p className="mt-2 text-3xl font-semibold">12</p>
    </div>
  );
}
```

**Rules:**

- Use semantic CSS variables where configured
- No hardcoded hex colors
- Use consistent spacing and card patterns
- Follow `context/ui-registry.md`
- Register new UI patterns with `/imprint`

---

## shadcn/ui

Used only in the admin panel for UI primitives.

### Usage

```bash
npx shadcn@latest add button card dialog table input select badge
```

Common components:

- Button
- Card
- Dialog
- Table
- Input
- Select
- Badge
- Dropdown Menu
- Tabs
- Calendar
- Tooltip
- Alert

**Rules:**

- shadcn/ui is for `apps/admin`
- Do not use shadcn/ui in mobile
- Add only components needed by the current feature
- Do not install every component at once
- Keep component styling aligned with RouteForge UI tokens

---

## Zod

Zod validates user input and API payloads.

Shared schemas live in:

```txt
packages/shared/src/schemas/
```

### Pattern

```typescript
import { z } from "zod";

export const shiftReportSchema = z.object({
  depotId: z.string().uuid(),
  vanPlate: z.string().min(1),
  startKm: z.number().int().nonnegative(),
  endKm: z.number().int().nonnegative(),
  packagesDelivered: z.number().int().nonnegative(),
  packagesReturned: z.number().int().nonnegative(),
  packagesPickedUp: z.number().int().nonnegative(),
  courierNote: z.string().max(1000).optional(),
});

export type ShiftReportInput = z.infer<typeof shiftReportSchema>;
```

### Usage

```typescript
const parsed = shiftReportSchema.safeParse(input);

if (!parsed.success) {
  return {
    success: false,
    error: "Bitte überprüfe die eingegebenen Daten.",
  };
}
```

**Rules:**

- Validate all external input
- Use shared schemas in mobile, admin and backend
- Do not duplicate schemas inside app folders
- Use safe user-facing error messages
- Do not expose raw Zod error details unless intentionally formatted

---

## AsyncStorage

Used in mobile for active shift state, offline drafts and sync queue.

### RF-MOB-020 Usage

RF-MOB-020 stores daily report drafts locally under
`routeforge:draft-report:{draftId}` and upserts pending report-sync operations
under `routeforge:sync-queue`. The queue is local metadata only in this phase:
no network detection, retry worker, file upload or backend submission is run.

### Pattern

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";

const ACTIVE_SHIFT_KEY = "routeforge:active-shift";

export async function saveActiveShift(state: ActiveShiftState): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_SHIFT_KEY, JSON.stringify(state));
}

export async function getActiveShift(): Promise<ActiveShiftState | null> {
  const raw = await AsyncStorage.getItem(ACTIVE_SHIFT_KEY);

  if (!raw) return null;

  return JSON.parse(raw) as ActiveShiftState;
}
```

**Rules:**

- Store active shift state locally
- Store unsynced report drafts locally
- Do not store private documents permanently
- Do not store service keys
- Use clear key prefixes:
  - `routeforge:active-shift`
  - `routeforge:draft-report:{shiftId}`
  - `routeforge:sync-queue`

---

## expo-image-picker

Used to capture or select shift proof photos.

### Pattern

```typescript
import * as ImagePicker from "expo-image-picker";

const result = await ImagePicker.launchCameraAsync({
  mediaTypes: ["images"],
  allowsEditing: false,
  quality: 1,
});

if (!result.canceled) {
  const uri = result.assets[0]?.uri;
}
```

**Rules:**

- Request permissions before camera use
- Show clear permission error if denied
- Allow retake/change photo
- Keep local preview before upload
- Required proof photos:
  - start km
  - end km
  - Fahrtenbuch
  - Mentor screenshot

---

## expo-image-manipulator

Used to compress photos before upload.

### Pattern

```typescript
import * as ImageManipulator from "expo-image-manipulator";

const result = await ImageManipulator.manipulateAsync(
  imageUri,
  [{ resize: { width: 1600 } }],
  {
    compress: 0.7,
    format: ImageManipulator.SaveFormat.JPEG,
  },
);
```

**Rules:**

- Compress before upload
- Target practical mobile upload size
- Store compressed file URI
- Mark photo metadata as `compressed: true`
- Do not upload original full-size image unless explicitly required

---

## expo-location

Used for start and stop GPS capture.

### RF-MOB-019 Selection

RF-MOB-019 installs `expo-location` through `npx expo install`, resulting in
SDK 54 compatible `expo-location` `~19.0.8`. RouteForge configures only
foreground location permission copy for shift start/end proof and explicitly
keeps background location and Android foreground service permissions disabled.

### Pattern

```typescript
import * as Location from "expo-location";

const { status } = await Location.requestForegroundPermissionsAsync();

if (status !== "granted") {
  return {
    success: false,
    error: "Standortberechtigung wurde nicht erteilt.",
  };
}

const location = await Location.getCurrentPositionAsync({
  accuracy: Location.Accuracy.Balanced,
});
```

**Rules:**

- Capture location only at shift start and shift end
- No live tracking in version 1
- Store:
  - latitude
  - longitude
  - accuracy
  - timestamp
- If permission is denied, allow shift continuation but show admin warning
- Do not silently fail location capture

---

## React Native Signature Capture

A signature capture approach is selected as part of feature `RF-MOB-018`.

### RF-MOB-018 Selection

RF-MOB-018 uses a local React Native touch signature pad built with `PanResponder`
for the UI-first mobile phase. No third-party native signature package was added.
The local helper prepares an SVG data URI and private upload payload for the later
`RF-BE-010 Signature Upload Backend` feature.

### Requirements

The library must support:

- Expo compatibility
- Signature canvas
- Clear signature
- Export as image/base64/URI
- Works on Android
- Does not require heavy native setup if possible

**Rules:**

- Do not install before RF-MOB-018
- Confirm Expo compatibility before installing
- Signature is required before daily report submit
- Signature timestamp must be stored

---

## @react-pdf/renderer

Used for daily and monthly PDF generation.

### Daily PDF

```typescript
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

type DailyReportPdfProps = {
  companyName: string;
  courierName: string;
  shiftDate: string;
};

export function DailyReportPdf({
  companyName,
  courierName,
  shiftDate,
}: DailyReportPdfProps) {
  return (
    <Document>
      <Page size="A4">
        <View>
          <Text>{companyName}</Text>
          <Text>{courierName}</Text>
          <Text>{shiftDate}</Text>
        </View>
      </Page>
    </Document>
  );
}
```

### Server-side Rendering

```typescript
import { renderToBuffer } from "@react-pdf/renderer";

const buffer = await renderToBuffer(
  <DailyReportPdf
    companyName={company.name}
    courierName={courier.fullName}
    shiftDate={shift.shiftDate}
  />,
);
```

**Rules:**

- Server-side only
- Never import in client components
- Use `renderToBuffer`
- Upload generated PDF to `generated-pdfs` or stream for download
- Do not write generated files to disk
- Include company stamp PNG when available
- PDF access must be permission-scoped

---

## CSV / XLSX Export Library

The exact library will be selected before `RF-DOC-003` / `RF-DOC-004`.

### Export Row Shape

```typescript
type AccountantExportRow = {
  courierName: string;
  date: string;
  depotCode: string;
  paymentMode: "hourly" | "daily_fixed";
  startTime: string;
  endTime: string;
  breakMinutes: number;
  netMinutes: number;
  billableMinutes: number;
  status: "approved";
};
```

**Rules:**

- Export approved shifts only
- Export uses `billable_minutes`
- Include real time and billable time
- Support CSV first, XLSX second
- German headers
- Totals row for XLSX
- Export should be generated server-side

---

## lucide-react

Used for admin panel icons.

### Pattern

```typescript
import { Clock, FileText, Users } from "lucide-react";

export function DashboardIconRow() {
  return (
    <div>
      <Clock className="h-5 w-5" />
      <Users className="h-5 w-5" />
      <FileText className="h-5 w-5" />
    </div>
  );
}
```

**Rules:**

- Admin only
- Keep icon sizes consistent
- Do not use random icon styles
- Mobile should use Expo/React Native compatible icon strategy separately

---

## Dependency Approval

Before installing a new package, check:

1. Does Expo, React Native, Next.js, shadcn/ui or InsForge already solve this?
2. Is the package needed for the current Feature ID?
3. Does it work in the target app?
4. Does it introduce native setup?
5. Does it affect Expo Go compatibility?
6. Is it safe for client exposure?

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
- CSV/XLSX export library to be selected before document/export phase

### Mobile

- `expo`
- `expo-router`
- `react-native`
- `nativewind`
- `@react-native-async-storage/async-storage`
- `expo-image-picker`
- `expo-image-manipulator`
- `expo-location`
- React Native signature library to be selected before RF-MOB-018
- official InsForge mobile-compatible client

Do not install anything else without updating this section first.
