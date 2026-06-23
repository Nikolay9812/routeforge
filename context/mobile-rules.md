# Mobile Rules

Rules for `apps/mobile`, the RouteForge courier mobile app.

The mobile app is used by couriers to register with invite code, wait for approval, start and stop shifts, complete daily reports, upload proof photos, sign reports, view history, download PDFs and read documents in the digital mailbox.

It must be fast, simple, readable and safe to use during real courier work.

---

## Mobile Surface

```txt
App: apps/mobile
Framework: Expo React Native
Routing: Expo Router
Styling: NativeWind
Language: TypeScript strict
Default UI language: German
Optional language: Bulgarian through translation keys
Backend: InsForge Auth + DB + Storage + RLS
```

Before building mobile UI, check:

```txt
context/designs/mobile/
context/ui-tokens.md
context/ui-rules.md
context/ui-registry.md
context/permissions.md
context/security-gdpr.md
```

---

## Mobile Product Rules

The mobile app must feel like a practical courier tool:

- large readable text
- clear cards
- one dominant primary action per screen
- German operational labels
- minimum 44px touch targets
- no overloaded screens
- no tiny buttons
- no playful styling
- no unnecessary animations during critical workflows

The courier may use the app in a van, warehouse, stairwell or outside. Keep the interface direct.

---

## Mobile Navigation

Use bottom tab navigation with exactly these primary tabs:

```txt
Home
Historie
Bericht
Postfach
Profil
```

Secondary screens use stack navigation:

```txt
/history/[date]
/mailbox/[id]
/settings
```

Rules:

- Do not add more than 5 bottom tabs
- Keep active tab clearly visible
- Use German labels by default
- Keep critical shift actions on Home and Bericht

---

## Auth and Invite Flow

Courier registration is invite-only.

Flow:

```txt
Courier receives email invite code
Courier opens app
Courier enters email + invite code
Backend validates invitation
Profile is created as pending_approval
Courier completes profile/documents if required
Admin/dispatcher approves courier
Courier becomes active
```

Rules:

- No public self-registration without invite code
- New courier starts as `pending_approval`
- Pending courier cannot start shifts
- Pending courier can see a clear waiting/approval state
- Invite code errors must be user-friendly

---

## Home / Current Shift Rules

Home is the operational command center.

It must show:

- company name
- courier name/status
- current depot
- current shift status
- large timer
- Start Shift / End Shift primary action
- payment mode summary
- daily report completeness state
- sync/offline state when needed

Rules:

- Timer and primary action must be visually dominant
- Start/End button must be reachable with one hand
- Hourly mode shows 10:00h cap clearly
- Daily fixed mode shows real time and 8:20h billable default clearly
- Do not show live route tracking

---

## Shift Timer Rules

Timer must be based on persisted start time, not only on memory.

Local active shift state:

```ts
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

- Persist active shift state in AsyncStorage
- Closing app must not reset the timer
- Reopening app recalculates elapsed time from `startedAt`
- Hourly timer auto-stops at 600 minutes / 10:00h
- Daily fixed still tracks real time, but billable default is 500 minutes / 8:20h
- One courier can have only one shift per day in v1
- Do not allow overlapping shifts

---

## GPS Rules

RouteForge v1 stores only start and stop location.

Allowed GPS capture:

```txt
shift start location
shift stop location
```

Not allowed in v1:

```txt
live tracking
continuous route tracking
background location trail
customer-facing tracking map
```

Rules:

- Request location only when starting or ending shift
- Store GPS accuracy
- If permission is denied, allow workflow to continue if product logic permits, but mark missing location clearly
- Backend/admin determines depot geofence warning
- Courier should see understandable permission guidance

---

## Daily Report Rules

Daily report must collect operational proof clearly.

Fields:

- depot
- vehicle plate
- start kilometers
- end kilometers
- delivered packages
- returns
- Abholungen / pickups
- total stops
- optional courier note
- proof photos
- courier signature

Required proof photos:

```txt
start_km
end_km
fahrtenbuch
mentor
```

Rules:

- Report cannot be submitted without required fields
- Report cannot be submitted without required photos if the feature requires them
- Report cannot be submitted without signature
- Submitted shift becomes locked for courier
- Corrections after submission are admin/dispatcher workflow only

---

## Photo Rules

Photos are operational proof, not permanent document storage.

Rules:

- Use `expo-image-picker` for capture/selection
- Use `expo-image-manipulator` before upload
- Compress photos before upload
- Store photo metadata in `shift_photos`
- Store files in private `shift-photos` bucket
- Set `expires_at = uploaded_at + 14 days`
- Shift proof photos are deleted after 14 days by cleanup
- Payslips/contracts/documents are not part of 14-day cleanup

Do not upload full-size photos when compressed proof is enough.

---

## Signature Rules

Courier signature confirms the daily report.

Rules:

- Signature is required before report submission
- Signature image is stored privately
- Signature is linked to the shift
- Store `signed_at`
- Signature must be included in daily PDF generation
- Do not reuse old signatures automatically

---

## History Rules

History screen shows monthly work overview.

It must show:

- month selector
- worked days calendar
- number of shifts
- real worked time
- billable time
- day status indicators

Day details must show:

- shift date
- start/end time
- payment mode
- report values
- approval status
- geofence warnings if visible to courier
- PDF download action when available

Courier sees only own history.

---

## Digital Mailbox Rules

Courier mailbox contains company documents and notices.

Mailbox item types:

```txt
document
payslip
contract
notice
```

Rules:

- Courier sees only own mailbox items
- Unread state must be visible
- Download uses private/signed access
- Payslips and contracts are not deleted by shift-photo cleanup
- Do not expose other couriers' documents

---

## Profile and Documents Rules

Profile must show:

- courier name
- email
- phone if available
- status
- company
- depot
- payment mode
- required document status
- language setting

Sensitive fields:

- Steuer-ID
- IBAN
- identity documents
- driving license documents

Rules:

- Do not casually display sensitive fields in large public-looking cards
- Mask where appropriate
- Uploads go to private storage
- Courier can only access own profile/documents

---

## Offline and Sync Rules

Courier work may happen with poor connection.

Allowed local persistence:

- active shift state
- daily report draft
- unsynced photo references
- sync queue metadata

Rules:

- Show clear offline/sync status
- Do not lose entered report data on app close
- Sync must revalidate permissions and schema on backend
- Never treat local data as final payroll truth until backend accepts it

---

## Mobile Error Language

Errors must be short, useful and in German by default.

Examples:

```txt
Standort konnte nicht erfasst werden.
Bitte prüfe deine Verbindung.
Diese Einladung ist abgelaufen.
Dein Profil wartet noch auf Freigabe.
Der Bericht ist noch unvollständig.
```

Do not show raw stack traces or backend error objects.

---

## Mobile Mock Data Rules

During UI-first phases:

- Use realistic German labels
- Use realistic courier shift examples
- Include hourly and daily fixed modes
- Include pending approval state
- Include active shift state
- Include submitted/approved/rejected history states
- Include unread mailbox items
- Include document status examples

Mock data must not leak into shared business logic.
