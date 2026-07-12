alter table public.depots disable trigger enforce_depot_write;
alter table public.depots disable trigger audit_depot_write;

with target_depots as (
  select
    depot.*,
    to_jsonb(depot) as before_state,
    admin_profile.id as actor_profile_id
  from public.depots as depot
  join lateral (
    select profile.id
    from public.profiles as profile
    where profile.company_id = depot.company_id
      and profile.role = 'admin'
      and profile.status = 'active'
    order by profile.created_at asc
    limit 1
  ) as admin_profile on true
  where depot.code = 'HBW3'
    and (
      depot.latitude <> 49.441900
      or depot.longitude <> 8.484500
      or depot.address_line_1 <> 'Essener Strasse 1'
      or depot.postal_code <> '68219'
    )
),
updated_depots as (
  update public.depots as depot
  set
    name = 'Amazon Heavy Bulky Mannheim',
    address_line_1 = 'Essener Strasse 1',
    postal_code = '68219',
    city = 'Mannheim',
    country_code = 'DE',
    latitude = 49.441900,
    longitude = 8.484500,
    geofence_radius_meters = 350,
    updated_at = now()
  from target_depots as target_depot
  where depot.id = target_depot.id
  returning
    depot.company_id,
    target_depot.actor_profile_id,
    depot.id as depot_id,
    target_depot.before_state,
    to_jsonb(depot) as after_state
)
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
select
  company_id,
  actor_profile_id,
  'depots',
  depot_id,
  'depot_updated',
  before_state,
  after_state,
  'Maintenance repair: restore demo HBW3 depot address and coordinates.'
from updated_depots;

alter table public.depots enable trigger enforce_depot_write;
alter table public.depots enable trigger audit_depot_write;

with hbw3_depots as (
  select
    id,
    company_id,
    latitude,
    longitude,
    geofence_radius_meters
  from public.depots
  where code = 'HBW3'
)
update public.shift_locations as shift_location
set
  depot_latitude_snapshot = hbw3_depot.latitude,
  depot_longitude_snapshot = hbw3_depot.longitude,
  distance_from_depot_meters = case
    when shift_location.capture_status = 'captured'
      and shift_location.latitude is not null
      and shift_location.longitude is not null
      then public.calculate_routeforge_distance_meters(
        shift_location.latitude,
        shift_location.longitude,
        hbw3_depot.latitude,
        hbw3_depot.longitude
      )
    else null
  end,
  is_inside_depot_geofence = case
    when shift_location.capture_status = 'captured'
      and shift_location.latitude is not null
      and shift_location.longitude is not null
      then public.calculate_routeforge_distance_meters(
        shift_location.latitude,
        shift_location.longitude,
        hbw3_depot.latitude,
        hbw3_depot.longitude
      ) <= hbw3_depot.geofence_radius_meters
    else false
  end
from public.shifts as shift
join hbw3_depots as hbw3_depot
  on hbw3_depot.id = shift.depot_id
  and hbw3_depot.company_id = shift.company_id
where shift_location.shift_id = shift.id;
