create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select p.id
  from public.profiles p
  where p.auth_user_id = (select auth.uid())
  limit 1
$$;

create or replace function public.current_profile_company_id()
returns uuid
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select p.company_id
  from public.profiles p
  where p.auth_user_id = (select auth.uid())
  limit 1
$$;

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select p.role
  from public.profiles p
  where p.auth_user_id = (select auth.uid())
  limit 1
$$;

create or replace function public.current_profile_status()
returns text
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select p.status
  from public.profiles p
  where p.auth_user_id = (select auth.uid())
  limit 1
$$;

create or replace function public.current_profile_is_active()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select coalesce(public.current_profile_status() = 'active', false)
$$;

create or replace function public.is_company_member(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.auth_user_id = (select auth.uid())
      and p.company_id = target_company_id
      and p.status in ('pending_approval', 'active')
  )
$$;

create or replace function public.is_company_admin(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.auth_user_id = (select auth.uid())
      and p.company_id = target_company_id
      and p.role = 'admin'
      and p.status = 'active'
  )
$$;

create or replace function public.is_company_dispatcher(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.auth_user_id = (select auth.uid())
      and p.company_id = target_company_id
      and p.role = 'dispatcher'
      and p.status = 'active'
  )
$$;

create or replace function public.is_company_courier(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.auth_user_id = (select auth.uid())
      and p.company_id = target_company_id
      and p.role = 'courier'
      and p.status = 'active'
  )
$$;

create or replace function public.dispatcher_has_depot_access(target_depot_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select exists (
    select 1
    from public.profile_depot_access access
    join public.profiles dispatcher
      on dispatcher.id = access.profile_id
    where access.depot_id = target_depot_id
      and dispatcher.auth_user_id = (select auth.uid())
      and dispatcher.role = 'dispatcher'
      and dispatcher.status = 'active'
      and dispatcher.company_id = access.company_id
  )
$$;

create or replace function public.can_access_depot(
  target_company_id uuid,
  target_depot_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select
    public.is_company_admin(target_company_id)
    or (
      public.current_profile_company_id() = target_company_id
      and public.dispatcher_has_depot_access(target_depot_id)
    )
    or exists (
      select 1
      from public.profiles courier
      where courier.auth_user_id = (select auth.uid())
        and courier.company_id = target_company_id
        and courier.role = 'courier'
        and courier.status = 'active'
        and courier.primary_depot_id = target_depot_id
    )
$$;

create or replace function public.can_access_profile(target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles target
    where target.id = target_profile_id
      and (
        target.auth_user_id = (select auth.uid())
        or public.is_company_admin(target.company_id)
        or (
          target.role = 'courier'
          and target.company_id = public.current_profile_company_id()
          and target.primary_depot_id is not null
          and public.dispatcher_has_depot_access(target.primary_depot_id)
        )
      )
  )
$$;

create or replace function public.can_access_shift_row(
  target_company_id uuid,
  target_courier_profile_id uuid,
  target_depot_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select
    public.is_company_admin(target_company_id)
    or (
      public.current_profile_company_id() = target_company_id
      and public.dispatcher_has_depot_access(target_depot_id)
    )
    or exists (
      select 1
      from public.profiles courier
      where courier.id = target_courier_profile_id
        and courier.auth_user_id = (select auth.uid())
        and courier.company_id = target_company_id
        and courier.role = 'courier'
        and courier.status = 'active'
    )
$$;

create or replace function public.can_access_shift(target_shift_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select exists (
    select 1
    from public.shifts s
    where s.id = target_shift_id
      and public.can_access_shift_row(s.company_id, s.courier_profile_id, s.depot_id)
  )
$$;

create or replace function public.is_current_courier_for_shift(target_shift_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select exists (
    select 1
    from public.shifts s
    join public.profiles courier
      on courier.id = s.courier_profile_id
    where s.id = target_shift_id
      and courier.auth_user_id = (select auth.uid())
      and courier.role = 'courier'
      and courier.status = 'active'
      and courier.company_id = s.company_id
  )
$$;

create or replace function public.can_access_document(target_document_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select exists (
    select 1
    from public.documents d
    left join public.profiles courier
      on courier.id = d.courier_profile_id
    where d.id = target_document_id
      and (
        public.is_company_admin(d.company_id)
        or (
          d.courier_profile_id is not null
          and d.company_id = public.current_profile_company_id()
          and courier.primary_depot_id is not null
          and public.dispatcher_has_depot_access(courier.primary_depot_id)
        )
        or (
          d.courier_profile_id = public.current_profile_id()
          and public.is_company_member(d.company_id)
        )
      )
  )
$$;

create or replace function public.can_access_mailbox_item(target_mailbox_item_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select exists (
    select 1
    from public.mailbox_items item
    join public.profiles courier
      on courier.id = item.courier_profile_id
    where item.id = target_mailbox_item_id
      and (
        item.courier_profile_id = public.current_profile_id()
        or public.is_company_admin(item.company_id)
        or (
          item.company_id = public.current_profile_company_id()
          and
          courier.primary_depot_id is not null
          and public.dispatcher_has_depot_access(courier.primary_depot_id)
        )
      )
  )
$$;

create or replace function public.protect_shift_courier_update()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
begin
  if public.is_company_admin(old.company_id) then
    return new;
  end if;

  if new.company_id is distinct from old.company_id
    or new.courier_profile_id is distinct from old.courier_profile_id
    or new.shift_date is distinct from old.shift_date
    or new.billable_minutes is distinct from old.billable_minutes
    or new.billable_source is distinct from old.billable_source
    or new.billable_override_reason is distinct from old.billable_override_reason
    or new.billable_override_by is distinct from old.billable_override_by
    or new.billable_override_at is distinct from old.billable_override_at
    or new.auto_stopped_at_max_hours is distinct from old.auto_stopped_at_max_hours
    or new.payment_mode_snapshot is distinct from old.payment_mode_snapshot
    or new.approved_at is distinct from old.approved_at
    or new.approved_by is distinct from old.approved_by
    or new.rejection_reason is distinct from old.rejection_reason then
    raise exception 'shift protected fields cannot be changed by this role';
  end if;

  return new;
end;
$$;

create trigger protect_shift_courier_update
before update on public.shifts
for each row
execute function public.protect_shift_courier_update();

create or replace function public.protect_mailbox_item_read_update()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
begin
  if public.is_company_admin(old.company_id) then
    return new;
  end if;

  if new.company_id is distinct from old.company_id
    or new.courier_profile_id is distinct from old.courier_profile_id
    or new.document_id is distinct from old.document_id
    or new.title is distinct from old.title
    or new.message is distinct from old.message
    or new.category is distinct from old.category
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at then
    raise exception 'mailbox item content cannot be changed by this role';
  end if;

  return new;
end;
$$;

create trigger protect_mailbox_item_read_update
before update on public.mailbox_items
for each row
execute function public.protect_mailbox_item_read_update();

alter table public.companies enable row level security;
alter table public.depots enable row level security;
alter table public.profiles enable row level security;
alter table public.profile_depot_access enable row level security;
alter table public.invitations enable row level security;
alter table public.shifts enable row level security;
alter table public.shift_locations enable row level security;
alter table public.shift_photos enable row level security;
alter table public.documents enable row level security;
alter table public.mailbox_items enable row level security;
alter table public.audit_logs enable row level security;

revoke all on public.companies from anon, authenticated;
revoke all on public.depots from anon, authenticated;
revoke all on public.profiles from anon, authenticated;
revoke all on public.profile_depot_access from anon, authenticated;
revoke all on public.invitations from anon, authenticated;
revoke all on public.shifts from anon, authenticated;
revoke all on public.shift_locations from anon, authenticated;
revoke all on public.shift_photos from anon, authenticated;
revoke all on public.documents from anon, authenticated;
revoke all on public.mailbox_items from anon, authenticated;
revoke all on public.audit_logs from anon, authenticated;

grant usage on schema public to authenticated;

revoke all on function public.current_profile_id() from public;
revoke all on function public.current_profile_company_id() from public;
revoke all on function public.current_profile_role() from public;
revoke all on function public.current_profile_status() from public;
revoke all on function public.current_profile_is_active() from public;
revoke all on function public.is_company_member(uuid) from public;
revoke all on function public.is_company_admin(uuid) from public;
revoke all on function public.is_company_dispatcher(uuid) from public;
revoke all on function public.is_company_courier(uuid) from public;
revoke all on function public.dispatcher_has_depot_access(uuid) from public;
revoke all on function public.can_access_depot(uuid, uuid) from public;
revoke all on function public.can_access_profile(uuid) from public;
revoke all on function public.can_access_shift_row(uuid, uuid, uuid) from public;
revoke all on function public.can_access_shift(uuid) from public;
revoke all on function public.is_current_courier_for_shift(uuid) from public;
revoke all on function public.can_access_document(uuid) from public;
revoke all on function public.can_access_mailbox_item(uuid) from public;
revoke all on function public.protect_shift_courier_update() from public;
revoke all on function public.protect_mailbox_item_read_update() from public;

grant execute on function public.current_profile_id() to authenticated;
grant execute on function public.current_profile_company_id() to authenticated;
grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.current_profile_status() to authenticated;
grant execute on function public.current_profile_is_active() to authenticated;
grant execute on function public.is_company_member(uuid) to authenticated;
grant execute on function public.is_company_admin(uuid) to authenticated;
grant execute on function public.is_company_dispatcher(uuid) to authenticated;
grant execute on function public.is_company_courier(uuid) to authenticated;
grant execute on function public.dispatcher_has_depot_access(uuid) to authenticated;
grant execute on function public.can_access_depot(uuid, uuid) to authenticated;
grant execute on function public.can_access_profile(uuid) to authenticated;
grant execute on function public.can_access_shift_row(uuid, uuid, uuid) to authenticated;
grant execute on function public.can_access_shift(uuid) to authenticated;
grant execute on function public.is_current_courier_for_shift(uuid) to authenticated;
grant execute on function public.can_access_document(uuid) to authenticated;
grant execute on function public.can_access_mailbox_item(uuid) to authenticated;

grant select, update on public.companies to authenticated;
grant select, insert, update, delete on public.depots to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, delete on public.profile_depot_access to authenticated;
grant select, insert, update, delete on public.invitations to authenticated;
grant select, insert, update on public.shifts to authenticated;
grant select, insert on public.shift_locations to authenticated;
grant select, insert on public.shift_photos to authenticated;
grant select, insert on public.documents to authenticated;
grant select, insert, update on public.mailbox_items to authenticated;
grant select on public.audit_logs to authenticated;

create policy "companies_select_member"
on public.companies
for select
to authenticated
using (public.is_company_member(id));

create policy "companies_update_admin"
on public.companies
for update
to authenticated
using (public.is_company_admin(id))
with check (public.is_company_admin(id));

create policy "depots_select_scoped"
on public.depots
for select
to authenticated
using (public.can_access_depot(company_id, id));

create policy "depots_insert_admin"
on public.depots
for insert
to authenticated
with check (public.is_company_admin(company_id));

create policy "depots_update_admin"
on public.depots
for update
to authenticated
using (public.is_company_admin(company_id))
with check (public.is_company_admin(company_id));

create policy "depots_delete_admin"
on public.depots
for delete
to authenticated
using (public.is_company_admin(company_id));

create policy "profiles_select_scoped"
on public.profiles
for select
to authenticated
using (public.can_access_profile(id));

create policy "profiles_update_admin"
on public.profiles
for update
to authenticated
using (public.is_company_admin(company_id))
with check (public.is_company_admin(company_id));

create policy "profile_depot_access_select_scoped"
on public.profile_depot_access
for select
to authenticated
using (
  public.is_company_admin(company_id)
  or profile_id = public.current_profile_id()
);

create policy "profile_depot_access_insert_admin"
on public.profile_depot_access
for insert
to authenticated
with check (
  public.is_company_admin(company_id)
  and public.can_access_profile(profile_id)
  and public.can_access_depot(company_id, depot_id)
  and created_by = public.current_profile_id()
);

create policy "profile_depot_access_delete_admin"
on public.profile_depot_access
for delete
to authenticated
using (public.is_company_admin(company_id));

create policy "invitations_select_admin"
on public.invitations
for select
to authenticated
using (public.is_company_admin(company_id));

create policy "invitations_insert_admin"
on public.invitations
for insert
to authenticated
with check (
  public.is_company_admin(company_id)
  and created_by = public.current_profile_id()
  and (
    depot_id is null
    or public.can_access_depot(company_id, depot_id)
  )
);

create policy "invitations_update_admin"
on public.invitations
for update
to authenticated
using (public.is_company_admin(company_id))
with check (
  public.is_company_admin(company_id)
  and (
    depot_id is null
    or public.can_access_depot(company_id, depot_id)
  )
);

create policy "invitations_delete_admin"
on public.invitations
for delete
to authenticated
using (public.is_company_admin(company_id));

create policy "shifts_select_scoped"
on public.shifts
for select
to authenticated
using (public.can_access_shift_row(company_id, courier_profile_id, depot_id));

create policy "shifts_insert_courier_draft"
on public.shifts
for insert
to authenticated
with check (
  courier_profile_id = public.current_profile_id()
  and public.is_company_courier(company_id)
  and public.can_access_depot(company_id, depot_id)
  and status = 'draft'
  and billable_source = 'auto'
);

create policy "shifts_update_admin"
on public.shifts
for update
to authenticated
using (public.is_company_admin(company_id))
with check (public.is_company_admin(company_id));

create policy "shifts_update_courier_editable"
on public.shifts
for update
to authenticated
using (
  courier_profile_id = public.current_profile_id()
  and public.is_company_courier(company_id)
  and status in ('draft', 'rejected')
)
with check (
  courier_profile_id = public.current_profile_id()
  and public.is_company_courier(company_id)
  and status in ('draft', 'submitted', 'rejected')
);

create policy "shift_locations_select_scoped"
on public.shift_locations
for select
to authenticated
using (public.can_access_shift(shift_id));

create policy "shift_locations_insert_courier"
on public.shift_locations
for insert
to authenticated
with check (
  public.is_current_courier_for_shift(shift_id)
  and company_id = public.current_profile_company_id()
);

create policy "shift_photos_select_scoped"
on public.shift_photos
for select
to authenticated
using (public.can_access_shift(shift_id));

create policy "shift_photos_insert_courier"
on public.shift_photos
for insert
to authenticated
with check (
  public.is_current_courier_for_shift(shift_id)
  and uploaded_by = public.current_profile_id()
  and company_id = public.current_profile_company_id()
);

create policy "documents_select_scoped"
on public.documents
for select
to authenticated
using (public.can_access_document(id));

create policy "documents_insert_admin"
on public.documents
for insert
to authenticated
with check (
  public.is_company_admin(company_id)
  and uploaded_by = public.current_profile_id()
  and (
    courier_profile_id is null
    or public.can_access_profile(courier_profile_id)
  )
);

create policy "mailbox_items_select_scoped"
on public.mailbox_items
for select
to authenticated
using (public.can_access_mailbox_item(id));

create policy "mailbox_items_insert_admin"
on public.mailbox_items
for insert
to authenticated
with check (
  public.is_company_admin(company_id)
  and created_by = public.current_profile_id()
  and public.can_access_profile(courier_profile_id)
  and (
    document_id is null
    or public.can_access_document(document_id)
  )
);

create policy "mailbox_items_update_read_by_courier"
on public.mailbox_items
for update
to authenticated
using (
  courier_profile_id = public.current_profile_id()
  and public.is_company_member(company_id)
)
with check (
  courier_profile_id = public.current_profile_id()
  and public.is_company_member(company_id)
);

create policy "audit_logs_select_admin"
on public.audit_logs
for select
to authenticated
using (public.is_company_admin(company_id));
