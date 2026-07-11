alter table public.shifts
  add column if not exists tour_number text,
  add column if not exists missing_proof_explanation text,
  add column if not exists signature_storage_key text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'shifts_tour_number_length'
      and conrelid = 'public.shifts'::regclass
  ) then
    alter table public.shifts
      add constraint shifts_tour_number_length
      check (
        tour_number is null
        or length(btrim(tour_number)) between 1 and 64
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'shifts_missing_proof_explanation_length'
      and conrelid = 'public.shifts'::regclass
  ) then
    alter table public.shifts
      add constraint shifts_missing_proof_explanation_length
      check (
        missing_proof_explanation is null
        or length(btrim(missing_proof_explanation)) between 1 and 1000
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'shifts_signature_storage_key_length'
      and conrelid = 'public.shifts'::regclass
  ) then
    alter table public.shifts
      add constraint shifts_signature_storage_key_length
      check (
        signature_storage_key is null
        or length(btrim(signature_storage_key)) between 1 and 2048
      );
  end if;
end;
$$;

create or replace function public.is_current_courier_for_draft_shift_signature(
  object_key text
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select exists (
    select 1
    from public.shifts shift_row
    where shift_row.id = public.storage_report_owner_id_from_path(object_key)
      and shift_row.company_id = public.storage_company_id_from_path(object_key)
      and shift_row.courier_profile_id = public.current_profile_id()
      and shift_row.status = 'draft'
      and public.is_current_courier_for_shift(shift_row.id)
      and object_key = concat(
        'companies/',
        shift_row.company_id::text,
        '/reports/',
        shift_row.id::text,
        '/signature.svg'
      )
  )
$$;

create or replace function public.can_write_storage_object(
  bucket_name text,
  object_key text
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select
    public.is_valid_routeforge_storage_path(bucket_name, object_key)
    and public.current_profile_company_id() = public.storage_company_id_from_path(object_key)
    and (
      (
        bucket_name in ('company-assets', 'generated-pdfs', 'payslips')
        and public.is_company_admin(public.storage_company_id_from_path(object_key))
      )
      or (
        bucket_name = 'generated-pdfs'
        and public.is_current_courier_for_draft_shift_signature(object_key)
      )
      or (
        bucket_name = 'courier-documents'
        and (
          public.is_company_admin(public.storage_company_id_from_path(object_key))
          or (
            public.current_profile_id() = public.storage_courier_profile_id_from_path(object_key)
            and public.is_company_member(public.storage_company_id_from_path(object_key))
          )
        )
      )
      or (
        bucket_name = 'shift-photos'
        and public.is_current_courier_for_shift(public.storage_shift_id_from_path(object_key))
        and public.current_profile_company_id() = public.storage_company_id_from_path(object_key)
      )
    )
$$;

alter table storage.objects enable row level security;

revoke all on storage.objects from anon, authenticated;
grant usage on schema storage to authenticated;
grant select, insert, update, delete on storage.objects to authenticated;

drop policy if exists "routeforge_storage_select" on storage.objects;
drop policy if exists "routeforge_storage_insert" on storage.objects;
drop policy if exists "routeforge_storage_update" on storage.objects;
drop policy if exists "routeforge_storage_delete" on storage.objects;

create policy "routeforge_storage_select"
on storage.objects
for select
to authenticated
using (public.can_read_storage_object(bucket, key));

create policy "routeforge_storage_insert"
on storage.objects
for insert
to authenticated
with check (
  uploaded_by = (select auth.uid())::text
  and public.can_write_storage_object(bucket, key)
);

create policy "routeforge_storage_update"
on storage.objects
for update
to authenticated
using (
  uploaded_by = (select auth.uid())::text
  and public.can_write_storage_object(bucket, key)
)
with check (
  uploaded_by = (select auth.uid())::text
  and public.can_write_storage_object(bucket, key)
);

create policy "routeforge_storage_delete"
on storage.objects
for delete
to authenticated
using (public.can_delete_storage_object(bucket, key));

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

  if trimmed_signature_url is null
    or length(trimmed_signature_url) > 2048
    or trimmed_signature_url like 'local-signature://%' then
    raise exception 'Unterschrift muss vor dem Einreichen dauerhaft gespeichert werden.';
  end if;

  if trimmed_signature_storage_key is null
    or length(trimmed_signature_storage_key) > 2048 then
    raise exception 'Signatur-Speicherpfad ist ungueltig.';
  end if;

  if p_signed_at is null then
    raise exception 'Signaturzeitpunkt ist erforderlich.';
  end if;

  if p_signed_at > now() + interval '5 minutes'
    or p_signed_at < target_shift.start_time - interval '5 minutes' then
    raise exception 'Signaturzeitpunkt ist ungueltig.';
  end if;

  expected_signature_storage_key := concat(
    'companies/',
    target_shift.company_id::text,
    '/reports/',
    target_shift.id::text,
    '/signature.svg'
  );

  if trimmed_signature_storage_key <> expected_signature_storage_key then
    raise exception 'Signatur-Speicherpfad passt nicht zu dieser Schicht.';
  end if;

  if not exists (
    select 1
    from storage.objects stored_object
    where stored_object.bucket = 'generated-pdfs'
      and stored_object.key = trimmed_signature_storage_key
      and stored_object.uploaded_by = (select auth.uid())::text
      and stored_object.mime_type = 'image/svg+xml'
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

revoke insert, update on public.shifts from authenticated;
grant select on public.shifts to authenticated;

revoke all on function public.is_current_courier_for_draft_shift_signature(text) from public;
revoke all on function public.can_write_storage_object(text, text) from public;
revoke all on function public.submit_courier_shift_report(
  uuid,
  text,
  text,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  text,
  text,
  text,
  text,
  timestamptz
) from public;

grant execute on function public.is_current_courier_for_draft_shift_signature(text) to authenticated;
grant execute on function public.can_write_storage_object(text, text) to authenticated;
grant execute on function public.submit_courier_shift_report(
  uuid,
  text,
  text,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  text,
  text,
  text,
  text,
  timestamptz
) to authenticated;
