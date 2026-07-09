drop trigger if exists protect_shift_courier_update on public.shifts;

create or replace function public.calculate_routeforge_shift_minutes(
  p_start_time timestamptz,
  p_requested_end_time timestamptz,
  p_payment_mode text,
  p_daily_fixed_minutes integer default 500,
  p_hourly_max_minutes integer default 600
)
returns table (
  effective_end_time timestamptz,
  gross_minutes integer,
  break_minutes integer,
  net_minutes integer,
  billable_minutes integer,
  auto_stopped_at_max_hours boolean
)
language plpgsql
immutable
set search_path = pg_catalog, public, pg_temp
as $$
declare
  capped_end_time timestamptz;
begin
  if p_requested_end_time < p_start_time then
    raise exception 'Endzeit darf nicht vor der Startzeit liegen.';
  end if;

  auto_stopped_at_max_hours :=
    p_payment_mode = 'hourly'
    and p_requested_end_time >= p_start_time + make_interval(mins => p_hourly_max_minutes);

  capped_end_time :=
    case
      when auto_stopped_at_max_hours
        then p_start_time + make_interval(mins => p_hourly_max_minutes)
      else p_requested_end_time
    end;

  effective_end_time := capped_end_time;
  gross_minutes := floor(extract(epoch from (effective_end_time - p_start_time)) / 60)::integer;

  break_minutes :=
    case
      when gross_minutes > 540 then 45
      when gross_minutes > 360 then 30
      else 0
    end;

  net_minutes := greatest(gross_minutes - break_minutes, 0);

  billable_minutes :=
    case
      when p_payment_mode = 'daily_fixed' then p_daily_fixed_minutes
      else least(net_minutes, p_hourly_max_minutes)
    end;

  return next;
end;
$$;

create or replace function public.start_courier_shift(p_depot_id uuid)
returns public.shifts
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  actor public.profiles%rowtype;
  target_depot public.depots%rowtype;
  today_in_germany date;
  created_shift public.shifts%rowtype;
begin
  select *
  into actor
  from public.profiles
  where auth_user_id = (select auth.uid())
    and role = 'courier'
    and status = 'active'
  limit 1;

  if actor.id is null then
    raise exception 'Nur aktive Kuriere koennen Schichten starten.';
  end if;

  if actor.primary_depot_id is null then
    raise exception 'Kein Depot fuer dein Kurierprofil hinterlegt.';
  end if;

  if p_depot_id is distinct from actor.primary_depot_id then
    raise exception 'Schichtstart ist nur im zugewiesenen Depot moeglich.';
  end if;

  select *
  into target_depot
  from public.depots depot
  where depot.id = p_depot_id
    and depot.company_id = actor.company_id
    and depot.is_active = true;

  if target_depot.id is null then
    raise exception 'Depot nicht gefunden oder nicht aktiv.';
  end if;

  today_in_germany := (now() at time zone 'Europe/Berlin')::date;

  if exists (
    select 1
    from public.shifts existing
    where existing.company_id = actor.company_id
      and existing.courier_profile_id = actor.id
      and existing.shift_date = today_in_germany
  ) then
    raise exception 'Fuer heute existiert bereits eine Schicht.';
  end if;

  insert into public.shifts (
    company_id,
    depot_id,
    courier_profile_id,
    shift_date,
    start_time,
    payment_mode_snapshot,
    status
  )
  values (
    actor.company_id,
    target_depot.id,
    actor.id,
    today_in_germany,
    now(),
    actor.payment_mode,
    'draft'
  )
  returning *
  into created_shift;

  return created_shift;
end;
$$;

create or replace function public.end_courier_shift(p_shift_id uuid)
returns public.shifts
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  actor public.profiles%rowtype;
  target_shift public.shifts%rowtype;
  calculated record;
  updated_shift public.shifts%rowtype;
begin
  select *
  into actor
  from public.profiles
  where auth_user_id = (select auth.uid())
    and role = 'courier'
    and status = 'active'
  limit 1;

  if actor.id is null then
    raise exception 'Nur aktive Kuriere koennen Schichten beenden.';
  end if;

  select *
  into target_shift
  from public.shifts shift_row
  where shift_row.id = p_shift_id
    and shift_row.company_id = actor.company_id
    and shift_row.courier_profile_id = actor.id
  for update;

  if target_shift.id is null then
    raise exception 'Schicht nicht gefunden.';
  end if;

  if target_shift.status <> 'draft' then
    raise exception 'Nur Entwurf-Schichten koennen von Kurieren beendet werden.';
  end if;

  if target_shift.end_time is not null then
    return target_shift;
  end if;

  select *
  into calculated
  from public.calculate_routeforge_shift_minutes(
    target_shift.start_time,
    now(),
    target_shift.payment_mode_snapshot,
    actor.daily_fixed_minutes,
    actor.hourly_max_minutes
  );

  update public.shifts
  set
    end_time = calculated.effective_end_time,
    gross_minutes = calculated.gross_minutes,
    break_minutes = calculated.break_minutes,
    net_minutes = calculated.net_minutes,
    billable_minutes = calculated.billable_minutes,
    billable_source = 'auto',
    billable_override_reason = null,
    billable_override_by = null,
    billable_override_at = null,
    auto_stopped_at_max_hours = calculated.auto_stopped_at_max_hours,
    updated_at = now()
  where id = target_shift.id
  returning *
  into updated_shift;

  return updated_shift;
end;
$$;

revoke insert, update on public.shifts from authenticated;
grant select on public.shifts to authenticated;

revoke all on function public.calculate_routeforge_shift_minutes(
  timestamptz,
  timestamptz,
  text,
  integer,
  integer
) from public;
revoke all on function public.start_courier_shift(uuid) from public;
revoke all on function public.end_courier_shift(uuid) from public;

grant execute on function public.start_courier_shift(uuid) to authenticated;
grant execute on function public.end_courier_shift(uuid) to authenticated;
