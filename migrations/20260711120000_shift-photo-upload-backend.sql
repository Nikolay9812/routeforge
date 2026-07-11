create or replace function public.save_shift_photo_metadata(
  p_shift_id uuid,
  p_photo_type text,
  p_storage_path text,
  p_mime_type text,
  p_size_bytes integer,
  p_compressed boolean
)
returns public.shift_photos
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  actor public.profiles%rowtype;
  target_shift public.shifts%rowtype;
  existing_photo public.shift_photos%rowtype;
  inserted_photo public.shift_photos%rowtype;
  trimmed_storage_path text;
begin
  select *
  into actor
  from public.profiles profile
  where profile.auth_user_id = (select auth.uid())
    and profile.role = 'courier'
    and profile.status = 'active'
  limit 1;

  if actor.id is null then
    raise exception 'Nur aktive Kuriere koennen Schichtfotos hochladen.';
  end if;

  select *
  into target_shift
  from public.shifts shift_row
  where shift_row.id = p_shift_id
    and shift_row.company_id = actor.company_id
    and shift_row.courier_profile_id = actor.id
  limit 1;

  if target_shift.id is null then
    raise exception 'Schicht wurde nicht gefunden.';
  end if;

  if target_shift.status <> 'draft' then
    raise exception 'Nachweisfotos koennen nur fuer Entwurf-Schichten hochgeladen werden.';
  end if;

  if p_photo_type not in ('start_km', 'end_km', 'fahrtenbuch', 'mentor') then
    raise exception 'Fototyp ist ungueltig.';
  end if;

  trimmed_storage_path := nullif(btrim(coalesce(p_storage_path, '')), '');

  if trimmed_storage_path is null or length(trimmed_storage_path) > 2048 then
    raise exception 'Foto-Speicherpfad ist ungueltig.';
  end if;

  if not public.is_valid_routeforge_storage_path('shift-photos', trimmed_storage_path)
    or public.storage_company_id_from_path(trimmed_storage_path) <> target_shift.company_id
    or public.storage_shift_id_from_path(trimmed_storage_path) <> target_shift.id then
    raise exception 'Foto-Speicherpfad passt nicht zu dieser Schicht.';
  end if;

  if p_mime_type <> 'image/jpeg' then
    raise exception 'Schichtfotos muessen als JPEG gespeichert werden.';
  end if;

  if p_size_bytes is null or p_size_bytes <= 0 then
    raise exception 'Fotogroesse ist ungueltig.';
  end if;

  if p_compressed is distinct from true then
    raise exception 'Schichtfotos muessen vor dem Upload komprimiert werden.';
  end if;

  if not exists (
    select 1
    from storage.objects stored_object
    where stored_object.bucket = 'shift-photos'
      and stored_object.key = trimmed_storage_path
      and stored_object.uploaded_by = (select auth.uid())::text
      and stored_object.mime_type = 'image/jpeg'
  ) then
    raise exception 'Gespeichertes Schichtfoto wurde nicht gefunden.';
  end if;

  select *
  into existing_photo
  from public.shift_photos photo
  where photo.company_id = target_shift.company_id
    and photo.shift_id = target_shift.id
    and photo.photo_type = p_photo_type
    and photo.storage_path = trimmed_storage_path
    and photo.deleted_at is null
  order by photo.uploaded_at desc
  limit 1;

  if existing_photo.id is not null then
    return existing_photo;
  end if;

  update public.shift_photos
  set deleted_at = now()
  where company_id = target_shift.company_id
    and shift_id = target_shift.id
    and photo_type = p_photo_type
    and deleted_at is null;

  insert into public.shift_photos (
    company_id,
    shift_id,
    photo_type,
    storage_bucket,
    storage_path,
    mime_type,
    size_bytes,
    compressed,
    uploaded_by,
    uploaded_at,
    expires_at,
    deleted_at
  )
  values (
    target_shift.company_id,
    target_shift.id,
    p_photo_type,
    'shift-photos',
    trimmed_storage_path,
    p_mime_type,
    p_size_bytes,
    p_compressed,
    actor.id,
    now(),
    now() + interval '14 days',
    null
  )
  returning *
  into inserted_photo;

  return inserted_photo;
end;
$$;

revoke insert on public.shift_photos from authenticated;
grant select on public.shift_photos to authenticated;

revoke all on function public.save_shift_photo_metadata(
  uuid,
  text,
  text,
  text,
  integer,
  boolean
) from public;

grant execute on function public.save_shift_photo_metadata(
  uuid,
  text,
  text,
  text,
  integer,
  boolean
) to authenticated;
