create index if not exists shift_photos_retention_pending_idx
  on public.shift_photos (expires_at, uploaded_at)
  where deleted_at is null
    and storage_bucket = 'shift-photos';

create or replace function public.cleanup_expired_shift_photos(
  p_limit integer default 200
)
returns table (
  photo_id uuid,
  storage_path text,
  file_deleted boolean,
  metadata_deleted_at timestamptz
)
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  cleanup_started_at timestamptz := now();
  safe_limit integer;
begin
  if (select auth.uid()) is not null
    and not exists (
      select 1
      from public.profiles profile
      where profile.auth_user_id = (select auth.uid())
        and profile.role = 'admin'
        and profile.status = 'active'
    ) then
    raise exception 'Nur aktive Admins koennen die Schichtfoto-Aufbewahrung bereinigen.';
  end if;

  safe_limit := least(greatest(coalesce(p_limit, 200), 1), 1000);

  return query
  with expired_photos as (
    select
      photo.id,
      photo.storage_bucket,
      photo.storage_path
    from public.shift_photos photo
    where photo.storage_bucket = 'shift-photos'
      and photo.deleted_at is null
      and photo.expires_at < cleanup_started_at
    order by photo.expires_at asc, photo.uploaded_at asc
    limit safe_limit
    for update skip locked
  ),
  deleted_objects as (
    delete from storage.objects stored_object
    using expired_photos expired
    where stored_object.bucket = expired.storage_bucket
      and stored_object.key = expired.storage_path
    returning stored_object.bucket, stored_object.key
  ),
  updated_photos as (
    update public.shift_photos photo
    set deleted_at = cleanup_started_at
    from expired_photos expired
    where photo.id = expired.id
      and photo.deleted_at is null
    returning
      photo.id,
      photo.storage_bucket,
      photo.storage_path,
      photo.deleted_at
  )
  select
    updated.id as photo_id,
    updated.storage_path,
    exists (
      select 1
      from deleted_objects deleted
      where deleted.bucket = updated.storage_bucket
        and deleted.key = updated.storage_path
    ) as file_deleted,
    updated.deleted_at as metadata_deleted_at
  from updated_photos updated
  order by updated.deleted_at asc, updated.storage_path asc;
end;
$$;

comment on function public.cleanup_expired_shift_photos(integer)
  is 'Deletes expired shift-photos storage objects, then marks public.shift_photos.deleted_at while preserving metadata. Operator/scheduler use only.';

revoke all on function public.cleanup_expired_shift_photos(integer) from public;
revoke all on function public.cleanup_expired_shift_photos(integer) from anon, authenticated;
