create or replace function public.set_dispatcher_depot_access(
  p_dispatcher_profile_id uuid,
  p_depot_ids uuid[],
  p_reason text default null
)
returns table (
  profile_id uuid,
  depot_ids uuid[],
  audit_log_id uuid
)
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  actor public.profiles%rowtype;
  target_dispatcher public.profiles%rowtype;
  normalized_depot_ids uuid[];
  before_depot_ids uuid[];
  created_audit_log_id uuid;
begin
  select *
  into actor
  from public.profiles
  where auth_user_id = (select auth.uid())
    and role = 'admin'
    and status = 'active'
  limit 1;

  if actor.id is null then
    raise exception 'Nur aktive Admins koennen Dispatcher-Depot-Zugriff verwalten.';
  end if;

  select *
  into target_dispatcher
  from public.profiles profile
  where profile.id = p_dispatcher_profile_id
    and profile.company_id = actor.company_id
  for update;

  if target_dispatcher.id is null then
    raise exception 'Dispatcherprofil nicht gefunden.';
  end if;

  if target_dispatcher.role <> 'dispatcher' then
    raise exception 'Depot-Zugriff kann nur fuer Dispatcherprofile gesetzt werden.';
  end if;

  select coalesce(array_agg(distinct depot_id order by depot_id), array[]::uuid[])
  into normalized_depot_ids
  from unnest(coalesce(p_depot_ids, array[]::uuid[])) as selected(depot_id);

  if exists (
    select 1
    from unnest(normalized_depot_ids) as selected(depot_id)
    where not exists (
      select 1
      from public.depots depot
      where depot.id = selected.depot_id
        and depot.company_id = actor.company_id
    )
  ) then
    raise exception 'Depot-Zugriff darf nur Depots im aktuellen Mandanten enthalten.';
  end if;

  select coalesce(array_agg(access.depot_id order by access.depot_id), array[]::uuid[])
  into before_depot_ids
  from public.profile_depot_access access
  where access.company_id = actor.company_id
    and access.profile_id = target_dispatcher.id;

  delete from public.profile_depot_access access
  where access.company_id = actor.company_id
    and access.profile_id = target_dispatcher.id
    and not access.depot_id = any(normalized_depot_ids);

  insert into public.profile_depot_access (
    company_id,
    profile_id,
    depot_id,
    created_by
  )
  select
    actor.company_id,
    target_dispatcher.id,
    selected.depot_id,
    actor.id
  from unnest(normalized_depot_ids) as selected(depot_id)
  where not exists (
    select 1
    from public.profile_depot_access existing
    where existing.company_id = actor.company_id
      and existing.profile_id = target_dispatcher.id
      and existing.depot_id = selected.depot_id
  );

  if before_depot_ids is distinct from normalized_depot_ids then
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
      actor.company_id,
      actor.id,
      'profile_depot_access',
      target_dispatcher.id,
      'dispatcher_depot_access_updated',
      jsonb_build_object(
        'profile_id', target_dispatcher.id,
        'depot_ids', before_depot_ids
      ),
      jsonb_build_object(
        'profile_id', target_dispatcher.id,
        'depot_ids', normalized_depot_ids
      ),
      nullif(btrim(coalesce(p_reason, '')), '')
    )
    returning id
    into created_audit_log_id;
  end if;

  return query
  select
    target_dispatcher.id,
    normalized_depot_ids,
    created_audit_log_id;
end;
$$;

revoke insert, delete on public.profile_depot_access from authenticated;
grant select on public.profile_depot_access to authenticated;

revoke all on function public.set_dispatcher_depot_access(uuid, uuid[], text) from public;
grant execute on function public.set_dispatcher_depot_access(uuid, uuid[], text) to authenticated;
