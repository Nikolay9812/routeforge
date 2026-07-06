# Memory - RF-BE-002 Invitation Backend

Last updated: 2026-07-06 21:35 +02:00

## What was built

- Completed `RF-BE-002 - Invitation Backend`.
- Added `insforge/migrations/0004_invitation_backend.sql` with backend RPCs:
  - `normalize_invite_code`
  - `generate_invite_code`
  - `validate_courier_invitation`
  - `create_invitation`
  - `revoke_invitation`
  - `use_courier_invitation`
- Applied the RF-BE-002 SQL to the linked RouteForge InsForge project.
- Added admin invitation backend code:
  - `apps/admin/app/actions/invitations.ts`
  - `apps/admin/lib/invitations.ts`
  - `apps/admin/lib/invitations.server.ts`
- Updated admin `/admin/invitations`:
  - `apps/admin/app/admin/invitations/page.tsx`
  - `apps/admin/components/invitations/InvitationLocalLogic.tsx`
  - Page now loads real company-scoped invitation rows and active depots from InsForge.
  - Create/revoke controls now call server actions backed by the new RPCs.
- Updated mobile invite registration:
  - `apps/mobile/app/invite.tsx`
  - `apps/mobile/features/auth/AuthProvider.tsx`
  - Mobile invite screen now collects full name, email, invite code and password.
  - Mobile auth validates invite code, signs up through InsForge Auth, and creates a `pending_approval` courier profile through `use_courier_invitation`.
  - Link-based email verification is supported by storing pending invite metadata locally and completing profile creation on the first verified sign-in.
- Updated shared invitation schema:
  - `packages/shared/src/schemas/invitation.ts`
  - `invitationUseSchema` now requires `fullName`.
- Updated `context/progress-tracker.md`:
  - RF-BE-002 marked complete.
  - Next feature is `RF-BE-003 - Profile Approval Backend`.

## Decisions made

- Invitation profile creation is handled by an authenticated database RPC instead of client-side inserts, because a newly signed-up user has no profile yet and normal profile-based RLS cannot create the first courier profile safely.
- `validate_courier_invitation` is callable before signup and only returns status/message for a matching email + invite code. It does not create profiles or expose invitation rows.
- `use_courier_invitation` requires `auth.uid()` and creates a real courier profile with status `pending_approval`.
- Admin invitation creation/revocation is currently admin-only. Dispatcher invitation creation remains deferred because live dispatcher capability flags are not yet represented in the database model.
- Invitation creation/revocation and invitation use write audit log rows from trusted SQL functions, not from client-side code.
- No service/admin keys were added to app code or env examples.

## Problems solved

- Confirmed the current InsForge auth config has link-based email verification enabled in the dashboard, so mobile invite registration must handle the two-step flow.
- Avoided burning an auth account on obviously invalid invite codes by validating the invite before signup.
- Solved the no-profile-yet RLS boundary by using SECURITY DEFINER RPCs that still require authenticated `auth.uid()` for profile creation.
- InsForge CLI migration apply rejected the repo's `0004_...` migration filename because the CLI expects timestamped migration names. The SQL was applied statement-by-statement through `db query` instead.
- A temporary SQL probe function was created while diagnosing CLI quoting and then removed.
- Verified the four app-facing RF-BE-002 RPCs exist and have expected execute grants:
  - anon can execute `validate_courier_invitation`
  - authenticated can execute `create_invitation`
  - authenticated can execute `use_courier_invitation`

## Current state

- RF-BE-002 code is implemented and the live linked InsForge project has the new invitation RPCs applied.
- Verification passed:
  - `npm --workspace admin run typecheck`
  - `npm --workspace mobile run typecheck`
  - `npm --workspace @routeforge/shared run typecheck`
  - `npm --workspace admin run lint`
  - `npm --workspace mobile run lint` with elevated filesystem access for the known Windows ESLint resolver scan
  - `git diff --check`
  - raw color scan on touched UI/code files
  - secret scan on touched files found only ordinary password/token variable names, not secret values
  - InsForge RPC existence query returned all four app-facing RF-BE-002 RPCs
  - InsForge grant query returned expected execute grants
  - `/admin/invitations` route probe returned `307` to `/login` without an admin session, which is expected protected-route behavior
- Admin dev server was started at `http://localhost:3000` and may still be running in the active Codex session.
- Working tree also contains a pre-existing `memory.md` modification from before RF-BE-002; this save intentionally overwrote memory with the current handoff.

## Next session starts with

Start `RF-BE-003 - Profile Approval Backend`.

Before implementing, follow the RouteForge context read order from `AGENTS.md`, then focus on:

1. Real admin pending-courier list/profile loading for couriers created from invites.
2. Approve action that updates `profiles.status` to `active`, sets `approved_at` and `approved_by`, and writes an audit log.
3. Permission rules for who can approve couriers. Admin is safe for v1; dispatcher approval should remain deferred or explicitly scoped if the data model supports it.
4. Mobile behavior after approval: pending couriers should gain operational access after next session/profile refresh.

## Open questions

- Should dispatcher courier approval be implemented in RF-BE-003, or remain admin-only until dispatcher permission flags are represented in the live database model?
- Should the SQL migrations stay in the existing `insforge/migrations/000x_...` format, or should future live-applied migrations also be mirrored as timestamped CLI migration files?
- Should `/admin/invitations` get a real detail panel and filtering in the next admin polish pass, or stay focused on create/revoke until later?
