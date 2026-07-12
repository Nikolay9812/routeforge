alter table public.shift_locations
  add column if not exists capture_status text not null default 'captured',
  add column if not exists missing_reason text;

alter table public.shift_locations
  alter column latitude drop not null,
  alter column longitude drop not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'shift_locations_capture_status_check'
      and conrelid = 'public.shift_locations'::regclass
  ) then
    alter table public.shift_locations
      add constraint shift_locations_capture_status_check
      check (capture_status in ('captured', 'missing'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'shift_locations_missing_reason_check'
      and conrelid = 'public.shift_locations'::regclass
  ) then
    alter table public.shift_locations
      add constraint shift_locations_missing_reason_check
      check (
        missing_reason is null
        or missing_reason in ('permission_denied', 'unavailable')
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'shift_locations_capture_state_check'
      and conrelid = 'public.shift_locations'::regclass
  ) then
    alter table public.shift_locations
      add constraint shift_locations_capture_state_check
      check (
        (
          capture_status = 'captured'
          and latitude is not null
          and longitude is not null
          and missing_reason is null
        )
        or (
          capture_status = 'missing'
          and latitude is null
          and longitude is null
          and missing_reason is not null
          and accuracy_meters is null
          and distance_from_depot_meters is null
          and is_inside_depot_geofence is null
        )
      );
  end if;
end;
$$;

create or replace function public.save_shift_location(
  p_shift_id uuid,
  p_location_type text,
  p_latitude numeric,
  p_longitude numeric,
  p_accuracy_meters numeric default null
)
returns public.shift_locations
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  actor public.profiles%rowtype;
  target_shift public.shifts%rowtype;
  target_depot public.depots%rowtype;
  calculated_distance numeric;
  saved_location public.shift_locations%rowtype;
begin
  if p_location_type not in ('start', 'stop') then
    raise exception 'Standorttyp ist ungueltig.';
  end if;

  if p_latitude is null or p_latitude < -90 or p_latitude > 90 then
    raise exception 'Breitengrad ist ungueltig.';
  end if;

  if p_longitude is null or p_longitude < -180 or p_longitude > 180 then
    raise exception 'Laengengrad ist ungueltig.';
  end if;

  if p_accuracy_meters is not null and p_accuracy_meters < 0 then
    raise exception 'GPS-Genauigkeit ist ungueltig.';
  end if;

  select *
  into actor
  from public.profiles
  where auth_user_id = (select auth.uid())
    and role = 'courier'
    and status = 'active'
  limit 1;

  if actor.id is null then
    raise exception 'Nur aktive Kuriere koennen Schichtstandorte speichern.';
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
    raise exception 'Standorte koennen nur fuer Entwurf-Schichten gespeichert werden.';
  end if;

  if p_location_type = 'stop' and target_shift.end_time is null then
    raise exception 'Endstandort kann erst nach Schichtende gespeichert werden.';
  end if;

  select *
  into target_depot
  from public.depots depot
  where depot.id = target_shift.depot_id
    and depot.company_id = target_shift.company_id;

  if target_depot.id is null then
    raise exception 'Depot fuer diese Schicht wurde nicht gefunden.';
  end if;

  calculated_distance := public.calculate_routeforge_distance_meters(
    p_latitude,
    p_longitude,
    target_depot.latitude,
    target_depot.longitude
  );

  insert into public.shift_locations (
    company_id,
    shift_id,
    location_type,
    capture_status,
    missing_reason,
    latitude,
    longitude,
    accuracy_meters,
    depot_latitude_snapshot,
    depot_longitude_snapshot,
    distance_from_depot_meters,
    is_inside_depot_geofence
  )
  values (
    target_shift.company_id,
    target_shift.id,
    p_location_type,
    'captured',
    null,
    round(p_latitude, 6),
    round(p_longitude, 6),
    p_accuracy_meters,
    target_depot.latitude,
    target_depot.longitude,
    calculated_distance,
    calculated_distance <= target_depot.geofence_radius_meters
  )
  on conflict (shift_id, location_type)
  do update set
    capture_status = 'captured',
    missing_reason = null,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    accuracy_meters = excluded.accuracy_meters,
    depot_latitude_snapshot = excluded.depot_latitude_snapshot,
    depot_longitude_snapshot = excluded.depot_longitude_snapshot,
    distance_from_depot_meters = excluded.distance_from_depot_meters,
    is_inside_depot_geofence = excluded.is_inside_depot_geofence,
    created_at = now()
  returning *
  into saved_location;

  return saved_location;
end;
$$;

create or replace function public.save_missing_shift_location(
  p_shift_id uuid,
  p_location_type text,
  p_missing_reason text
)
returns public.shift_locations
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  actor public.profiles%rowtype;
  target_shift public.shifts%rowtype;
  target_depot public.depots%rowtype;
  saved_location public.shift_locations%rowtype;
begin
  if p_location_type not in ('start', 'stop') then
    raise exception 'Standorttyp ist ungueltig.';
  end if;

  if p_missing_reason not in ('permission_denied', 'unavailable') then
    raise exception 'Grund fuer fehlenden Standort ist ungueltig.';
  end if;

  select *
  into actor
  from public.profiles
  where auth_user_id = (select auth.uid())
    and role = 'courier'
    and status = 'active'
  limit 1;

  if actor.id is null then
    raise exception 'Nur aktive Kuriere koennen fehlende Schichtstandorte speichern.';
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
    raise exception 'Standorte koennen nur fuer Entwurf-Schichten gespeichert werden.';
  end if;

  if p_location_type = 'stop' and target_shift.end_time is null then
    raise exception 'Fehlender Endstandort kann erst nach Schichtende gespeichert werden.';
  end if;

  select *
  into target_depot
  from public.depots depot
  where depot.id = target_shift.depot_id
    and depot.company_id = target_shift.company_id;

  if target_depot.id is null then
    raise exception 'Depot fuer diese Schicht wurde nicht gefunden.';
  end if;

  insert into public.shift_locations (
    company_id,
    shift_id,
    location_type,
    capture_status,
    missing_reason,
    latitude,
    longitude,
    accuracy_meters,
    depot_latitude_snapshot,
    depot_longitude_snapshot,
    distance_from_depot_meters,
    is_inside_depot_geofence
  )
  values (
    target_shift.company_id,
    target_shift.id,
    p_location_type,
    'missing',
    p_missing_reason,
    null,
    null,
    null,
    target_depot.latitude,
    target_depot.longitude,
    null,
    null
  )
  on conflict (shift_id, location_type)
  do update set
    capture_status = 'missing',
    missing_reason = excluded.missing_reason,
    latitude = null,
    longitude = null,
    accuracy_meters = null,
    depot_latitude_snapshot = excluded.depot_latitude_snapshot,
    depot_longitude_snapshot = excluded.depot_longitude_snapshot,
    distance_from_depot_meters = null,
    is_inside_depot_geofence = null,
    created_at = now()
  returning *
  into saved_location;

  return saved_location;
end;
$$;

revoke all on function public.save_missing_shift_location(uuid, text, text) from public;
grant execute on function public.save_missing_shift_location(uuid, text, text) to authenticated;
