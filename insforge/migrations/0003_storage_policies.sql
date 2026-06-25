create or replace function public.routeforge_uuid_or_null(raw_value text)
returns uuid
language sql
immutable
set search_path = pg_catalog, public, pg_temp
as $$
  select case
    when raw_value ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then raw_value::uuid
    else null
  end
$$;

create or replace function public.storage_company_id_from_path(object_key text)
returns uuid
language sql
immutable
set search_path = pg_catalog, public, pg_temp
as $$
  select case
    when split_part(object_key, '/', 1) = 'companies'
      then public.routeforge_uuid_or_null(split_part(object_key, '/', 2))
    else null
  end
$$;

create or replace function public.storage_shift_id_from_path(object_key text)
returns uuid
language sql
immutable
set search_path = pg_catalog, public, pg_temp
as $$
  select case
    when split_part(object_key, '/', 3) = 'shifts'
      then public.routeforge_uuid_or_null(split_part(object_key, '/', 4))
    else null
  end
$$;

create or replace function public.storage_courier_profile_id_from_path(object_key text)
returns uuid
language sql
immutable
set search_path = pg_catalog, public, pg_temp
as $$
  select case
    when split_part(object_key, '/', 3) = 'couriers'
      then public.routeforge_uuid_or_null(split_part(object_key, '/', 4))
    else null
  end
$$;

create or replace function public.storage_report_owner_id_from_path(object_key text)
returns uuid
language sql
immutable
set search_path = pg_catalog, public, pg_temp
as $$
  select case
    when split_part(object_key, '/', 3) = 'reports'
      then public.routeforge_uuid_or_null(split_part(object_key, '/', 4))
    else null
  end
$$;

create or replace function public.is_routeforge_storage_bucket(bucket_name text)
returns boolean
language sql
immutable
set search_path = pg_catalog, public, pg_temp
as $$
  select bucket_name in (
    'courier-documents',
    'shift-photos',
    'payslips',
    'generated-pdfs',
    'company-assets'
  )
$$;

create or replace function public.is_valid_routeforge_storage_path(
  bucket_name text,
  object_key text
)
returns boolean
language sql
immutable
set search_path = pg_catalog, public, pg_temp
as $$
  select
    public.is_routeforge_storage_bucket(bucket_name)
    and object_key is not null
    and length(btrim(object_key)) > 0
    and object_key !~ '(^/|//|/$)'
    and object_key !~ '[[:cntrl:]\\]'
    and public.storage_company_id_from_path(object_key) is not null
    and (
      (
        bucket_name = 'courier-documents'
        and split_part(object_key, '/', 3) = 'couriers'
        and public.storage_courier_profile_id_from_path(object_key) is not null
        and split_part(object_key, '/', 5) = 'docs'
        and split_part(object_key, '/', 6) <> ''
      )
      or (
        bucket_name = 'shift-photos'
        and split_part(object_key, '/', 3) = 'shifts'
        and public.storage_shift_id_from_path(object_key) is not null
        and split_part(object_key, '/', 5) = 'photos'
        and split_part(object_key, '/', 6) <> ''
      )
      or (
        bucket_name = 'payslips'
        and split_part(object_key, '/', 3) = 'couriers'
        and public.storage_courier_profile_id_from_path(object_key) is not null
        and split_part(object_key, '/', 5) = 'payslips'
        and split_part(object_key, '/', 6) <> ''
      )
      or (
        bucket_name = 'generated-pdfs'
        and split_part(object_key, '/', 3) = 'reports'
        and public.storage_report_owner_id_from_path(object_key) is not null
        and split_part(object_key, '/', 5) <> ''
      )
      or (
        bucket_name = 'company-assets'
        and split_part(object_key, '/', 3) = 'assets'
        and split_part(object_key, '/', 4) <> ''
      )
    )
$$;

create or replace function public.can_read_storage_object(
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
        bucket_name = 'company-assets'
        and public.is_company_member(public.storage_company_id_from_path(object_key))
      )
      or (
        bucket_name = 'shift-photos'
        and public.can_access_shift(public.storage_shift_id_from_path(object_key))
      )
      or (
        bucket_name in ('courier-documents', 'payslips')
        and public.can_access_profile(public.storage_courier_profile_id_from_path(object_key))
      )
      or (
        bucket_name = 'generated-pdfs'
        and (
          public.can_access_shift(public.storage_report_owner_id_from_path(object_key))
          or public.can_access_profile(public.storage_report_owner_id_from_path(object_key))
        )
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

create or replace function public.can_delete_storage_object(
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
      public.is_company_admin(public.storage_company_id_from_path(object_key))
      or (
        bucket_name = 'shift-photos'
        and public.is_current_courier_for_shift(public.storage_shift_id_from_path(object_key))
        and public.current_profile_company_id() = public.storage_company_id_from_path(object_key)
      )
    )
$$;

alter table public.shift_photos
  add constraint shift_photos_storage_path_routeforge_pattern
  check (public.is_valid_routeforge_storage_path(storage_bucket, storage_path)),
  add constraint shift_photos_storage_path_company_match
  check (company_id = public.storage_company_id_from_path(storage_path)),
  add constraint shift_photos_storage_path_shift_match
  check (shift_id = public.storage_shift_id_from_path(storage_path));

alter table public.documents
  add constraint documents_storage_path_routeforge_pattern
  check (public.is_valid_routeforge_storage_path(storage_bucket, storage_path)),
  add constraint documents_storage_path_company_match
  check (company_id = public.storage_company_id_from_path(storage_path)),
  add constraint documents_storage_path_courier_match
  check (
    storage_bucket not in ('courier-documents', 'payslips')
    or courier_profile_id = public.storage_courier_profile_id_from_path(storage_path)
  );

revoke all on function public.routeforge_uuid_or_null(text) from public;
revoke all on function public.storage_company_id_from_path(text) from public;
revoke all on function public.storage_shift_id_from_path(text) from public;
revoke all on function public.storage_courier_profile_id_from_path(text) from public;
revoke all on function public.storage_report_owner_id_from_path(text) from public;
revoke all on function public.is_routeforge_storage_bucket(text) from public;
revoke all on function public.is_valid_routeforge_storage_path(text, text) from public;
revoke all on function public.can_read_storage_object(text, text) from public;
revoke all on function public.can_write_storage_object(text, text) from public;
revoke all on function public.can_delete_storage_object(text, text) from public;

grant execute on function public.routeforge_uuid_or_null(text) to authenticated;
grant execute on function public.storage_company_id_from_path(text) to authenticated;
grant execute on function public.storage_shift_id_from_path(text) to authenticated;
grant execute on function public.storage_courier_profile_id_from_path(text) to authenticated;
grant execute on function public.storage_report_owner_id_from_path(text) to authenticated;
grant execute on function public.is_routeforge_storage_bucket(text) to authenticated;
grant execute on function public.is_valid_routeforge_storage_path(text, text) to authenticated;
grant execute on function public.can_read_storage_object(text, text) to authenticated;
grant execute on function public.can_write_storage_object(text, text) to authenticated;
grant execute on function public.can_delete_storage_object(text, text) to authenticated;
