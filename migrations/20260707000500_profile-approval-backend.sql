create or replace function public.enforce_profile_approval_update()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
begin
  if old.role = 'courier'
    and old.status = 'pending_approval'
    and new.status = 'active' then
    if new.approved_at is null or new.approved_by is null then
      raise exception 'Kurierfreigabe benoetigt approved_at und approved_by.';
    end if;

    if not exists (
      select 1
      from public.profiles approver
      where approver.id = new.approved_by
        and approver.company_id = old.company_id
        and approver.role = 'admin'
        and approver.status = 'active'
    ) then
      raise exception 'Kurierfreigabe benoetigt einen aktiven Admin.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_profile_approval_update on public.profiles;

create trigger enforce_profile_approval_update
before update on public.profiles
for each row
execute function public.enforce_profile_approval_update();

create or replace function public.audit_profile_approval_update()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
begin
  if old.role = 'courier'
    and old.status = 'pending_approval'
    and new.status = 'active' then
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
      new.approved_by,
      'profiles',
      new.id,
      'courier_approved',
      jsonb_build_object(
        'status', old.status,
        'approved_at', old.approved_at,
        'approved_by', old.approved_by
      ),
      jsonb_build_object(
        'status', new.status,
        'approved_at', new.approved_at,
        'approved_by', new.approved_by
      ),
      null
    );
  end if;

  return new;
end;
$$;

drop trigger if exists audit_profile_approval_update on public.profiles;

create trigger audit_profile_approval_update
after update on public.profiles
for each row
execute function public.audit_profile_approval_update();

create or replace function public.approve_courier_profile(p_profile_id uuid)
returns public.profiles
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  actor public.profiles%rowtype;
  before_profile public.profiles%rowtype;
  after_profile public.profiles%rowtype;
begin
  select *
  into actor
  from public.profiles
  where auth_user_id = (select auth.uid())
    and status = 'active'
  limit 1;

  if actor.id is null or actor.role <> 'admin' then
    raise exception 'Nur aktive Admins koennen Kurierprofile freigeben.';
  end if;

  select *
  into before_profile
  from public.profiles profile
  where profile.id = p_profile_id
    and profile.company_id = actor.company_id
  for update;

  if before_profile.id is null then
    raise exception 'Kurierprofil nicht gefunden.';
  end if;

  if before_profile.role <> 'courier' then
    raise exception 'Nur Kurierprofile koennen freigegeben werden.';
  end if;

  if before_profile.status <> 'pending_approval' then
    raise exception 'Nur Profile mit wartender Freigabe koennen freigegeben werden.';
  end if;

  update public.profiles
  set
    status = 'active',
    approved_at = now(),
    approved_by = actor.id,
    updated_at = now()
  where id = before_profile.id
  returning *
  into after_profile;

  return after_profile;
end;
$$;

revoke all on function public.enforce_profile_approval_update() from public;
revoke all on function public.audit_profile_approval_update() from public;
revoke all on function public.approve_courier_profile(uuid) from public;

grant execute on function public.approve_courier_profile(uuid) to authenticated;
