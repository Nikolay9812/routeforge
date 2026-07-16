drop policy if exists "shifts_insert_courier_draft" on public.shifts;
drop policy if exists "shifts_update_admin" on public.shifts;
drop policy if exists "shifts_update_courier_editable" on public.shifts;

revoke insert, update on public.shifts from authenticated;
grant select on public.shifts to authenticated;

comment on table public.shifts is
  'Shift writes are RPC-only for authenticated clients; direct inserts/updates stay closed and reads stay RLS-scoped.';
