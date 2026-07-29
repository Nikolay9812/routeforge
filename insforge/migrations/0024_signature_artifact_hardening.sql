create or replace function public.submit_courier_shift_report(
  p_shift_id uuid,
  p_tour_number text,
  p_van_plate text,
  p_start_km integer,
  p_end_km integer,
  p_packages_delivered integer,
  p_packages_returned integer,
  p_packages_picked_up integer,
  p_total_stops integer,
  p_courier_note text,
  p_missing_proof_explanation text,
  p_signature_url text,
  p_signature_storage_key text,
  p_signed_at timestamptz
)
returns public.shifts
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  actor public.profiles%rowtype;
  target_shift public.shifts%rowtype;
  updated_shift public.shifts%rowtype;
  trimmed_tour_number text;
  trimmed_van_plate text;
  trimmed_courier_note text;
  trimmed_missing_proof_explanation text;
  trimmed_signature_url text;
  trimmed_signature_storage_key text;
  expected_signature_storage_key text;
  encoded_expected_signature_storage_key text;
  required_photo_types text[] := array[
    'start_km',
    'end_km',
    'fahrtenbuch',
    'mentor'
  ];
  missing_photo_types text[];
begin
  select *
  into actor
  from public.profiles profile
  where profile.auth_user_id = (select auth.uid())
    and profile.role = 'courier'
    and profile.status = 'active'
  limit 1;

  if actor.id is null then
    raise exception 'Nur aktive Kuriere koennen Tagesberichte einreichen.';
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

  if target_shift.status = 'submitted' then
    return target_shift;
  end if;

  if target_shift.status <> 'draft' then
    raise exception 'Nur Entwurf-Schichten koennen eingereicht werden.';
  end if;

  if target_shift.end_time is null then
    raise exception 'Der Tagesbericht kann erst nach Schichtende eingereicht werden.';
  end if;

  trimmed_tour_number := nullif(btrim(coalesce(p_tour_number, '')), '');
  trimmed_van_plate := nullif(btrim(coalesce(p_van_plate, '')), '');
  trimmed_courier_note := nullif(btrim(coalesce(p_courier_note, '')), '');
  trimmed_missing_proof_explanation :=
    nullif(btrim(coalesce(p_missing_proof_explanation, '')), '');
  trimmed_signature_url := nullif(btrim(coalesce(p_signature_url, '')), '');
  trimmed_signature_storage_key :=
    nullif(btrim(coalesce(p_signature_storage_key, '')), '');

  if trimmed_tour_number is null or length(trimmed_tour_number) > 64 then
    raise exception 'Tournummer ist erforderlich und darf maximal 64 Zeichen haben.';
  end if;

  if trimmed_van_plate is null or length(trimmed_van_plate) > 32 then
    raise exception 'Kennzeichen ist erforderlich und darf maximal 32 Zeichen haben.';
  end if;

  if trimmed_courier_note is not null and length(trimmed_courier_note) > 1000 then
    raise exception 'Anmerkungen duerfen maximal 1000 Zeichen haben.';
  end if;

  if trimmed_missing_proof_explanation is not null
    and length(trimmed_missing_proof_explanation) > 1000 then
    raise exception 'Erklaerung fuer fehlende Nachweise darf maximal 1000 Zeichen haben.';
  end if;

  if p_start_km is null or p_start_km < 0 then
    raise exception 'Start-KM ist ungueltig.';
  end if;

  if p_end_km is null or p_end_km < p_start_km then
    raise exception 'End-KM darf nicht kleiner als Start-KM sein.';
  end if;

  if p_packages_delivered is null or p_packages_delivered < 0
    or p_packages_returned is null or p_packages_returned < 0
    or p_packages_picked_up is null or p_packages_picked_up < 0
    or (p_total_stops is not null and p_total_stops < 0) then
    raise exception 'Paket- und Stoppzahlen muessen Zahlen ab 0 sein.';
  end if;

  expected_signature_storage_key := concat(
    'companies/',
    target_shift.company_id::text,
    '/reports/',
    target_shift.id::text,
    '/signature.svg'
  );
  encoded_expected_signature_storage_key := replace(
    expected_signature_storage_key,
    '/',
    '%2F'
  );

  if trimmed_signature_url is null
    or length(trimmed_signature_url) > 2048
    or trimmed_signature_url !~ '^https://[^/?#]+/api/storage/buckets/generated-pdfs/objects/'
    or position('?' in trimmed_signature_url) > 0
    or position('#' in trimmed_signature_url) > 0
    or right(trimmed_signature_url, length(encoded_expected_signature_storage_key)) <> encoded_expected_signature_storage_key then
    raise exception 'Unterschrift muss vor dem Einreichen dauerhaft gespeichert werden.';
  end if;

  if trimmed_signature_storage_key is null
    or length(trimmed_signature_storage_key) > 2048 then
    raise exception 'Signatur-Speicherpfad ist ungueltig.';
  end if;

  if p_signed_at is null then
    raise exception 'Signaturzeitpunkt ist erforderlich.';
  end if;

  if target_shift.start_time is null then
    raise exception 'Schichtstart fehlt.';
  end if;

  if p_signed_at > now() + interval '5 minutes'
    or p_signed_at < target_shift.start_time - interval '5 minutes' then
    raise exception 'Signaturzeitpunkt ist ungueltig.';
  end if;

  if trimmed_signature_storage_key <> expected_signature_storage_key then
    raise exception 'Signatur-Speicherpfad passt nicht zu dieser Schicht.';
  end if;

  if not exists (
    select 1
    from storage.objects stored_object
    where stored_object.bucket = 'generated-pdfs'
      and stored_object.key = trimmed_signature_storage_key
      and stored_object.size > 0
      and stored_object.uploaded_by in ((select auth.uid())::text, actor.id::text)
      and stored_object.mime_type in (
        'image/svg+xml',
        'application/octet-stream',
        'text/plain',
        'text/xml',
        'application/xml'
      )
  ) then
    raise exception 'Gespeicherte Unterschrift wurde nicht gefunden.';
  end if;

  select coalesce(array_agg(required_photo_type order by required_photo_type), array[]::text[])
  into missing_photo_types
  from unnest(required_photo_types) as required(required_photo_type)
  where not exists (
    select 1
    from public.shift_photos photo
    where photo.shift_id = target_shift.id
      and photo.company_id = target_shift.company_id
      and photo.photo_type = required.required_photo_type
      and photo.deleted_at is null
  );

  if cardinality(missing_photo_types) > 0
    and trimmed_missing_proof_explanation is null then
    raise exception 'Erklaerung erforderlich, wenn Pflichtfotos fehlen.';
  end if;

  update public.shifts
  set
    tour_number = trimmed_tour_number,
    van_plate = trimmed_van_plate,
    start_km = p_start_km,
    end_km = p_end_km,
    packages_delivered = p_packages_delivered,
    packages_returned = p_packages_returned,
    packages_picked_up = p_packages_picked_up,
    total_stops = p_total_stops,
    courier_note = trimmed_courier_note,
    missing_proof_explanation = trimmed_missing_proof_explanation,
    signature_url = trimmed_signature_url,
    signature_storage_key = trimmed_signature_storage_key,
    signed_at = p_signed_at,
    status = 'submitted',
    submitted_at = now(),
    updated_at = now()
  where id = target_shift.id
  returning *
  into updated_shift;

  return updated_shift;
end;
$$;

drop function if exists public.get_shift_signature_artifact(uuid);

create or replace function public.get_shift_signature_artifact(
  p_shift_id uuid
)
returns table (
  shift_id uuid,
  company_id uuid,
  courier_profile_id uuid,
  storage_bucket text,
  signature_url text,
  signature_storage_key text,
  signed_at timestamptz,
  signed_by_profile_id uuid,
  signed_by_name text,
  mime_type text,
  size_bytes bigint,
  uploaded_at timestamptz
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  target_shift public.shifts%rowtype;
  expected_signature_storage_key text;
begin
  if p_shift_id is null then
    return;
  end if;

  select *
  into target_shift
  from public.shifts shift_row
  where shift_row.id = p_shift_id
  limit 1;

  if target_shift.id is null
    or not public.can_access_shift(target_shift.id)
    or target_shift.signature_url is null
    or target_shift.signature_storage_key is null
    or target_shift.signed_at is null then
    return;
  end if;

  expected_signature_storage_key := concat(
    'companies/',
    target_shift.company_id::text,
    '/reports/',
    target_shift.id::text,
    '/signature.svg'
  );

  if target_shift.signature_storage_key <> expected_signature_storage_key
    or not public.can_read_storage_object(
      'generated-pdfs',
      target_shift.signature_storage_key
    ) then
    return;
  end if;

  return query
  select
    target_shift.id,
    target_shift.company_id,
    target_shift.courier_profile_id,
    'generated-pdfs'::text,
    target_shift.signature_url,
    target_shift.signature_storage_key,
    target_shift.signed_at,
    courier.id,
    courier.full_name,
    case
      when stored_object.mime_type = 'image/svg+xml' then 'image/svg+xml'
      else 'application/octet-stream'
    end::text,
    stored_object.size::bigint,
    stored_object.uploaded_at
  from storage.objects stored_object
  join public.profiles courier
    on courier.id = target_shift.courier_profile_id
   and courier.company_id = target_shift.company_id
  where stored_object.bucket = 'generated-pdfs'
    and stored_object.key = target_shift.signature_storage_key
    and stored_object.mime_type in (
      'image/svg+xml',
      'application/octet-stream',
      'text/plain',
      'text/xml',
      'application/xml'
    )
    and stored_object.size > 0
  limit 1;
end;
$$;

revoke all on function public.get_shift_signature_artifact(uuid) from public;

grant execute on function public.get_shift_signature_artifact(uuid) to authenticated;
