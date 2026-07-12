# Permissions

Canonical RouteForge permission rules for roles, tenant isolation, depot scope and sensitive actions.

This file is the source of truth for authorization behavior. UI may hide buttons, but real access control must be enforced server-side and through InsForge Row Level Security.

---

## Core Security Model

RouteForge is multi-tenant from v1.

Every business record belongs to one company workspace:

```txt
company_id
```

Tenant isolation is mandatory.

A user must never access another company's data through UI, API route, Server Action, direct query or storage URL.

---

## Roles

```ts
type UserRole = "admin" | "dispatcher" | "courier";
```

### Admin

Admin has full access inside their own company workspace.

Admin can:

- manage company settings
- manage depots
- manage dispatchers
- grant dispatcher depot access
- invite couriers and dispatchers
- approve couriers
- view all company couriers
- view all company shifts
- approve/reject/correct shifts
- override billable time with reason
- upload documents/payslips/contracts
- generate PDFs and exports
- view audit logs

Admin cannot access other companies.

### Dispatcher

Dispatcher is company-scoped and depot-scoped.

Dispatcher can only see data for depots assigned by admin.

Dispatcher can:

- view assigned depots
- view couriers assigned to allowed depots
- view shifts in allowed depots
- review assigned-depot shifts if permission is enabled
- create courier invitations for allowed depots if permission is enabled
- upload documents for couriers in allowed depots if permission is enabled

Dispatcher cannot:

- access unassigned depots
- grant themselves depot access
- manage admins
- change company settings
- bypass RLS
- see other companies

### Courier

Courier has self-only access.

Courier can:

- view own profile
- view own status
- view own shifts
- create/start/end own shift
- edit own draft daily report
- upload own shift proof photos
- upload own draft-shift report signature only to `generated-pdfs/companies/{company_id}/reports/{shift_id}/signature.svg`
- submit own daily report
- view own history
- view own mailbox
- download own PDFs/documents

Courier cannot:

- view other couriers
- approve shifts
- correct submitted shifts
- override billable time
- access admin panel
- access dispatcher/admin data

---

## Profile Status Rules

```ts
type ProfileStatus = "pending_approval" | "active" | "inactive" | "suspended";
```

Rules:

- New courier from invite starts as `pending_approval`
- `pending_approval` courier cannot start shifts
- `active` courier can use operational mobile features
- `inactive` or `suspended` courier cannot start new shifts
- Admin can change status inside company scope
- Status changes should create audit logs when they affect access

---

## Dispatcher Depot Scope

Dispatcher access is defined by:

```txt
profile_depot_access
```

Required fields:

```txt
company_id
profile_id
depot_id
created_by
created_at
```

Rules:

- Dispatcher data queries must filter by assigned depot IDs
- Dispatcher cannot see shifts without matching depot access
- Dispatcher cannot see couriers without matching depot access
- Admin can grant or revoke dispatcher depot access
- Grant/revoke actions create audit logs

---

## Permission Matrix

| Action | Admin | Dispatcher | Courier |
| ------ | ----- | ---------- | ------- |
| View company dashboard | Yes | Limited by depot scope | No |
| Manage company settings | Yes | No | No |
| Create depot | Yes | No | No |
| Update depot geofence | Yes | No | No |
| Manage dispatcher users | Yes | No | No |
| Grant dispatcher depot access | Yes | No | No |
| Create courier invite | Yes | Yes, allowed depots only | No |
| Use courier invite code | No | No | Yes |
| Approve courier profile | Yes | Optional, allowed depots only | No |
| View courier list | Yes | Allowed depots only | No |
| View own profile | Yes | Yes | Yes, own only |
| Start own shift | No | No | Yes, active only |
| End own shift | No | No | Yes, active only |
| Submit own daily report | No | No | Yes, active only |
| View shifts | All company | Allowed depots only | Own only |
| Approve shift | Yes | Optional, allowed depots only | No |
| Reject shift | Yes | Optional, allowed depots only | No |
| Correct shift | Yes | Optional, allowed depots only | No |
| Override billable time | Yes, reason required | Optional, reason required | No |
| View geofence warnings | All company | Allowed depots only | Own shift only if exposed |
| Upload shift proof photos | No | No | Own shift only |
| Upload courier documents | Yes | Optional, allowed depots only | Own required docs only |
| Upload payslips/contracts | Yes | Optional, allowed depots only | No |
| View mailbox | All company if admin feature needs it | Allowed depots only | Own only |
| Download own document | Yes | Yes, scoped | Yes, own only |
| Generate accountant export | Yes | Optional, allowed depots only | No |
| View audit logs | Yes | No by default | No |

When `Optional` appears, implement the safer default first: admin only. Dispatcher expansion must be explicit and still depot-scoped.

---

## Shift Permissions

Courier shift rules:

- Courier can create only own shift
- Courier can have only one shift per day in v1
- Courier can edit only draft shift/report
- Courier daily report submit must use `submit_courier_shift_report(...)`
- Courier submit may update only report fields accepted by the RPC; identity, depot, date, payment, time, status and submit timestamp are server-owned
- Courier signature upload is allowed only for the current courier's own draft shift at the deterministic report signature path
- Persisted signature artifact access must use `get_shift_signature_artifact(...)` or authenticated private storage access scoped through the same shift/company permissions
- Courier cannot edit after submission
- Courier cannot directly `INSERT` or `UPDATE` `public.shifts`
- Courier cannot change billable minutes directly
- Courier cannot remove geofence warnings

Admin/dispatcher review rules:

- Admin can approve/reject/correct company shifts
- Dispatcher can act only inside assigned depot scope when enabled
- Rejection requires reason
- Correction requires reason
- Billable override requires reason
- Every correction/override creates audit log

---

## Document Permissions

Storage access must follow metadata access.

Courier:

- can access own documents
- can access own payslips
- can access own contracts
- can access own generated PDFs
- cannot access other couriers' files
- uploads own shift proof photos through the private `shift-photos` bucket and `save_shift_photo_metadata(...)`
- accesses own submitted shift signatures only through authorized `generated-pdfs` reads or `get_shift_signature_artifact(...)`

Admin:

- can access all company files
- cannot access other companies

Dispatcher:

- can access files for couriers in assigned depots only when feature allows it
- can access signature artifacts only for shifts inside assigned depot scope when review visibility is enabled

Rules:

- Use private buckets
- Use signed URLs or authenticated private access
- Never expose public storage URLs for sensitive documents
- Shift photos are temporary and retained for 14 days
- Payslips/contracts/documents are not deleted by shift-photo cleanup
- Shift photo metadata requires a verified storage object; mobile clients must not directly insert `shift_photos` rows

---

## Audit Log Requirements

Audit logs are required for sensitive actions:

```txt
courier_approved
profile_status_changed
depot_created
depot_updated
dispatcher_depot_access_granted
dispatcher_depot_access_revoked
shift_approved
shift_rejected
shift_corrected
billable_time_overridden
document_uploaded
invitation_created
invitation_revoked
accountant_export_created
```

Audit log must include:

- company_id
- actor_profile_id
- target_table
- target_id
- action
- before values when relevant
- after values when relevant
- reason when required
- created_at

---

## RLS Principles

InsForge RLS policies must enforce:

1. User must be authenticated for protected data
2. User profile must belong to same `company_id`
3. Admin can access company data
4. Dispatcher can access only assigned depot data
5. Courier can access only own data
6. Sensitive storage paths follow the same scope
7. Audit logs cannot be edited from client-side code

Do not rely on UI-only hiding for security.

---

## Server-Side Check Pattern

Every admin mutation must check:

```txt
1. authenticated user
2. actor profile exists
3. actor profile status is active
4. actor role allows action
5. target record belongs to same company
6. dispatcher depot scope if actor is dispatcher
7. reason exists if action requires reason
8. mutation writes audit log if sensitive
```

Every mobile mutation must check:

```txt
1. authenticated user
2. courier profile exists
3. courier profile status is active where required
4. target record belongs to own courier profile
5. shift is still editable by courier
6. submitted/approved records are locked from courier editing
```
