create or replace function public.calculate_routeforge_distance_meters(
  p_from_latitude numeric,
  p_from_longitude numeric,
  p_to_latitude numeric,
  p_to_longitude numeric
)
returns numeric
language sql
immutable
strict
set search_path = pg_catalog, public, pg_temp
as $$
  select (
    6371000 * 2 * asin(
      sqrt(
        least(
          1,
          power(sin(radians((p_to_latitude::double precision - p_from_latitude::double precision) / 2)), 2)
          + cos(radians(p_from_latitude::double precision))
          * cos(radians(p_to_latitude::double precision))
          * power(sin(radians((p_to_longitude::double precision - p_from_longitude::double precision) / 2)), 2)
        )
      )
    )
  )::numeric
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

revoke insert, update on public.shift_locations from authenticated;
grant select on public.shift_locations to authenticated;

revoke all on function public.calculate_routeforge_distance_meters(
  numeric,
  numeric,
  numeric,
  numeric
) from public;
revoke all on function public.save_shift_location(
  uuid,
  text,
  numeric,
  numeric,
  numeric
) from public;

grant execute on function public.save_shift_location(
  uuid,
  text,
  numeric,
  numeric,
  numeric
) to authenticated;
