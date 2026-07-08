create or replace function public.enforce_depot_write()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  actor public.profiles%rowtype;
begin
  select *
  into actor
  from public.profiles
  where auth_user_id = (select auth.uid())
    and company_id = new.company_id
    and role = 'admin'
    and status = 'active'
  limit 1;

  if actor.id is null then
    raise exception 'Nur aktive Admins koennen Depots verwalten.';
  end if;

  if tg_op = 'UPDATE' then
    if new.id is distinct from old.id
      or new.company_id is distinct from old.company_id
      or new.created_at is distinct from old.created_at then
      raise exception 'Depot-Identitaet und Mandant duerfen nicht geaendert werden.';
    end if;

    new.updated_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_depot_write on public.depots;

create trigger enforce_depot_write
before insert or update on public.depots
for each row
execute function public.enforce_depot_write();

create or replace function public.audit_depot_write()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  actor_profile_id uuid;
begin
  select profile.id
  into actor_profile_id
  from public.profiles profile
  where profile.auth_user_id = (select auth.uid())
    and profile.company_id = new.company_id
    and profile.role = 'admin'
    and profile.status = 'active'
  limit 1;

  if actor_profile_id is null then
    raise exception 'Depot-Audit benoetigt einen aktiven Admin.';
  end if;

  if tg_op = 'INSERT' then
    insert into public.audit_logs (
      company_id,
      actor_profile_id,
      target_table,
      target_id,
      action,
      before,
      after,
      reason
    )
    values (
      new.company_id,
      actor_profile_id,
      'depots',
      new.id,
      'depot_created',
      null,
      to_jsonb(new),
      null
    );
  elsif row(
    old.name,
    old.code,
    old.address_line_1,
    old.postal_code,
    old.city,
    old.country_code,
    old.latitude,
    old.longitude,
    old.geofence_radius_meters,
    old.is_active
  ) is distinct from row(
    new.name,
    new.code,
    new.address_line_1,
    new.postal_code,
    new.city,
    new.country_code,
    new.latitude,
    new.longitude,
    new.geofence_radius_meters,
    new.is_active
  ) then
    insert into public.audit_logs (
      company_id,
      actor_profile_id,
      target_table,
      target_id,
      action,
      before,
      after,
      reason
    )
    values (
      new.company_id,
      actor_profile_id,
      'depots',
      new.id,
      'depot_updated',
      to_jsonb(old),
      to_jsonb(new),
      null
    );
  end if;

  return new;
end;
$$;

drop trigger if exists audit_depot_write on public.depots;

create trigger audit_depot_write
after insert or update on public.depots
for each row
execute function public.audit_depot_write();

drop policy if exists "depots_delete_admin" on public.depots;

revoke insert, update, delete on public.depots from authenticated;

grant insert (
  company_id,
  name,
  code,
  address_line_1,
  postal_code,
  city,
  country_code,
  latitude,
  longitude,
  geofence_radius_meters,
  is_active
) on public.depots to authenticated;

grant update (
  name,
  code,
  address_line_1,
  postal_code,
  city,
  country_code,
  latitude,
  longitude,
  geofence_radius_meters,
  is_active
) on public.depots to authenticated;

revoke all on function public.enforce_depot_write() from public;
revoke all on function public.audit_depot_write() from public;
