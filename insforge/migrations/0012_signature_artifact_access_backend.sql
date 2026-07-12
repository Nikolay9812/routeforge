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
  size_bytes integer,
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
    stored_object.mime_type,
    stored_object.size,
    stored_object.uploaded_at
  from storage.objects stored_object
  join public.profiles courier
    on courier.id = target_shift.courier_profile_id
   and courier.company_id = target_shift.company_id
  where stored_object.bucket = 'generated-pdfs'
    and stored_object.key = target_shift.signature_storage_key
    and stored_object.mime_type = 'image/svg+xml'
    and stored_object.size > 0
  limit 1;
end;
$$;

revoke all on function public.get_shift_signature_artifact(uuid) from public;

grant execute on function public.get_shift_signature_artifact(uuid) to authenticated;
