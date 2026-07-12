create or replace function public.update_courier_own_profile(
  p_phone text,
  p_address_line_1 text,
  p_postal_code text,
  p_city text,
  p_iban text,
  p_preferred_language text default 'de'
)
returns public.profiles
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  actor public.profiles%rowtype;
  updated_profile public.profiles%rowtype;
  trimmed_phone text;
  trimmed_address_line_1 text;
  trimmed_postal_code text;
  trimmed_city text;
  normalized_iban text;
  normalized_language text;
begin
  select *
  into actor
  from public.profiles profile
  where profile.auth_user_id = (select auth.uid())
    and profile.role = 'courier'
    and profile.status in ('pending_approval', 'active')
  limit 1;

  if actor.id is null then
    raise exception 'Kurierprofil wurde nicht gefunden.';
  end if;

  trimmed_phone := nullif(btrim(coalesce(p_phone, '')), '');
  trimmed_address_line_1 := nullif(btrim(coalesce(p_address_line_1, '')), '');
  trimmed_postal_code := nullif(btrim(coalesce(p_postal_code, '')), '');
  trimmed_city := nullif(btrim(coalesce(p_city, '')), '');
  normalized_iban := nullif(upper(regexp_replace(coalesce(p_iban, ''), '\s+', '', 'g')), '');
  normalized_language := coalesce(nullif(btrim(coalesce(p_preferred_language, '')), ''), actor.preferred_language);

  if trimmed_phone is not null and length(trimmed_phone) > 40 then
    raise exception 'Telefon darf maximal 40 Zeichen haben.';
  end if;

  if trimmed_address_line_1 is not null and length(trimmed_address_line_1) > 200 then
    raise exception 'Adresse darf maximal 200 Zeichen haben.';
  end if;

  if trimmed_postal_code is not null and length(trimmed_postal_code) > 16 then
    raise exception 'PLZ darf maximal 16 Zeichen haben.';
  end if;

  if trimmed_city is not null and length(trimmed_city) > 120 then
    raise exception 'Ort darf maximal 120 Zeichen haben.';
  end if;

  if normalized_iban is not null and length(normalized_iban) > 64 then
    raise exception 'IBAN darf maximal 64 Zeichen haben.';
  end if;

  if normalized_language not in ('de', 'bg') then
    raise exception 'Sprache ist ungueltig.';
  end if;

  update public.profiles profile
  set
    phone = trimmed_phone,
    address_line_1 = trimmed_address_line_1,
    postal_code = trimmed_postal_code,
    city = trimmed_city,
    iban = normalized_iban,
    preferred_language = normalized_language,
    updated_at = now()
  where profile.id = actor.id
  returning *
  into updated_profile;

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
    'profiles',
    actor.id,
    'courier_profile_updated',
    jsonb_build_object(
      'phone', actor.phone,
      'address_line_1', actor.address_line_1,
      'postal_code', actor.postal_code,
      'city', actor.city,
      'iban_present', actor.iban is not null,
      'preferred_language', actor.preferred_language
    ),
    jsonb_build_object(
      'phone', updated_profile.phone,
      'address_line_1', updated_profile.address_line_1,
      'postal_code', updated_profile.postal_code,
      'city', updated_profile.city,
      'iban_present', updated_profile.iban is not null,
      'preferred_language', updated_profile.preferred_language
    ),
    null
  );

  return updated_profile;
end;
$$;

create or replace function public.save_courier_profile_document(
  p_document_kind text,
  p_storage_path text,
  p_document_url text,
  p_mime_type text,
  p_size_bytes integer
)
returns public.profiles
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  actor public.profiles%rowtype;
  updated_profile public.profiles%rowtype;
  trimmed_storage_path text;
  trimmed_document_url text;
  trimmed_mime_type text;
  document_title text;
  document_reference text;
begin
  select *
  into actor
  from public.profiles profile
  where profile.auth_user_id = (select auth.uid())
    and profile.role = 'courier'
    and profile.status in ('pending_approval', 'active')
  limit 1;

  if actor.id is null then
    raise exception 'Kurierprofil wurde nicht gefunden.';
  end if;

  if p_document_kind not in ('driver_license', 'id_card', 'registration', 'bank') then
    raise exception 'Dokumenttyp ist ungueltig.';
  end if;

  trimmed_storage_path := nullif(btrim(coalesce(p_storage_path, '')), '');
  trimmed_document_url := nullif(btrim(coalesce(p_document_url, '')), '');
  trimmed_mime_type := nullif(btrim(coalesce(p_mime_type, '')), '');
  document_reference := coalesce(trimmed_document_url, 'private://courier-documents/' || trimmed_storage_path);

  if trimmed_storage_path is null or length(trimmed_storage_path) > 2048 then
    raise exception 'Dokument-Speicherpfad ist ungueltig.';
  end if;

  if trimmed_document_url is not null and length(trimmed_document_url) > 2048 then
    raise exception 'Dokumentreferenz ist ungueltig.';
  end if;

  if trimmed_mime_type <> 'image/jpeg' then
    raise exception 'Nur JPEG-Dokumentfotos sind erlaubt.';
  end if;

  if p_size_bytes is null or p_size_bytes <= 0 then
    raise exception 'Dateigroesse ist ungueltig.';
  end if;

  if not public.is_valid_routeforge_storage_path('courier-documents', trimmed_storage_path)
    or public.storage_company_id_from_path(trimmed_storage_path) <> actor.company_id
    or public.storage_courier_profile_id_from_path(trimmed_storage_path) <> actor.id then
    raise exception 'Dokument-Speicherpfad passt nicht zu deinem Profil.';
  end if;

  if not exists (
    select 1
    from storage.objects stored_object
    where stored_object.bucket = 'courier-documents'
      and stored_object.key = trimmed_storage_path
      and stored_object.uploaded_by = (select auth.uid())::text
      and stored_object.mime_type = trimmed_mime_type
      and stored_object.size = p_size_bytes
      and stored_object.size > 0
  ) then
    raise exception 'Gespeichertes Dokument wurde nicht gefunden.';
  end if;

  if p_document_kind = 'driver_license' then
    document_title := 'Profil - Fuehrerschein';

    update public.profiles profile
    set driver_license_document_url = document_reference,
        updated_at = now()
    where profile.id = actor.id
    returning *
    into updated_profile;
  elsif p_document_kind = 'id_card' then
    document_title := 'Profil - Personalausweis';

    update public.profiles profile
    set id_card_document_url = document_reference,
        updated_at = now()
    where profile.id = actor.id
    returning *
    into updated_profile;
  elsif p_document_kind = 'registration' then
    document_title := 'Profil - Adressnachweis';

    update public.profiles profile
    set registration_document_url = document_reference,
        updated_at = now()
    where profile.id = actor.id
    returning *
    into updated_profile;
  else
    document_title := 'Profil - IBAN-Nachweis';

    update public.profiles profile
    set bank_document_url = document_reference,
        updated_at = now()
    where profile.id = actor.id
    returning *
    into updated_profile;
  end if;

  insert into public.documents (
    company_id,
    courier_profile_id,
    uploaded_by,
    document_type,
    title,
    storage_bucket,
    storage_path,
    mime_type,
    size_bytes
  )
  values (
    actor.company_id,
    actor.id,
    actor.id,
    'other',
    document_title,
    'courier-documents',
    trimmed_storage_path,
    trimmed_mime_type,
    p_size_bytes
  );

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
    'profiles',
    actor.id,
    'document_uploaded',
    jsonb_build_object('document_kind', p_document_kind),
    jsonb_build_object(
      'document_kind', p_document_kind,
      'storage_bucket', 'courier-documents',
      'storage_path', trimmed_storage_path
    ),
    null
  );

  return updated_profile;
end;
$$;

revoke all on function public.update_courier_own_profile(
  text,
  text,
  text,
  text,
  text,
  text
) from public;
revoke all on function public.save_courier_profile_document(
  text,
  text,
  text,
  text,
  integer
) from public;

grant execute on function public.update_courier_own_profile(
  text,
  text,
  text,
  text,
  text,
  text
) to authenticated;
grant execute on function public.save_courier_profile_document(
  text,
  text,
  text,
  text,
  integer
) to authenticated;
