create or replace function public.create_courier_document_mailbox_item(
  p_courier_profile_id uuid,
  p_document_type text,
  p_title text,
  p_storage_bucket text,
  p_storage_path text,
  p_mime_type text,
  p_size_bytes integer,
  p_create_mailbox_item boolean default true,
  p_mailbox_message text default null
)
returns public.documents
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  actor public.profiles%rowtype;
  target_courier public.profiles%rowtype;
  existing_document public.documents%rowtype;
  inserted_document public.documents%rowtype;
  inserted_mailbox_item public.mailbox_items%rowtype;
  trimmed_title text;
  trimmed_storage_path text;
  trimmed_mime_type text;
  trimmed_message text;
  expected_bucket text;
  mailbox_category text;
begin
  select *
  into actor
  from public.profiles profile
  where profile.auth_user_id = (select auth.uid())
    and profile.role = 'admin'
    and profile.status = 'active'
  limit 1;

  if actor.id is null then
    raise exception 'Nur aktive Admins koennen Dokumente hochladen.';
  end if;

  select *
  into target_courier
  from public.profiles profile
  where profile.id = p_courier_profile_id
    and profile.company_id = actor.company_id
    and profile.role = 'courier'
    and profile.status in ('pending_approval', 'active')
  limit 1;

  if target_courier.id is null then
    raise exception 'Zielkurier wurde nicht gefunden.';
  end if;

  if p_document_type not in ('payslip', 'contract', 'instruction', 'notice', 'other') then
    raise exception 'Dokumenttyp ist ungueltig.';
  end if;

  expected_bucket :=
    case
      when p_document_type = 'payslip' then 'payslips'
      else 'courier-documents'
    end;

  if p_storage_bucket <> expected_bucket then
    raise exception 'Private Bucket passt nicht zum Dokumenttyp.';
  end if;

  trimmed_title := nullif(btrim(coalesce(p_title, '')), '');
  trimmed_storage_path := nullif(btrim(coalesce(p_storage_path, '')), '');
  trimmed_mime_type := nullif(btrim(coalesce(p_mime_type, '')), '');
  trimmed_message := nullif(btrim(coalesce(p_mailbox_message, '')), '');

  if trimmed_title is null or length(trimmed_title) > 180 then
    raise exception 'Dokumenttitel ist ungueltig.';
  end if;

  if trimmed_storage_path is null or length(trimmed_storage_path) > 2048 then
    raise exception 'Dokument-Speicherpfad ist ungueltig.';
  end if;

  if trimmed_mime_type is null or length(trimmed_mime_type) > 120 then
    raise exception 'Dateityp ist ungueltig.';
  end if;

  if p_size_bytes is null or p_size_bytes <= 0 then
    raise exception 'Dateigroesse ist ungueltig.';
  end if;

  if trimmed_message is not null and length(trimmed_message) > 1000 then
    raise exception 'Postfach-Nachricht darf maximal 1000 Zeichen haben.';
  end if;

  if not public.is_valid_routeforge_storage_path(p_storage_bucket, trimmed_storage_path)
    or public.storage_company_id_from_path(trimmed_storage_path) <> actor.company_id
    or public.storage_courier_profile_id_from_path(trimmed_storage_path) <> target_courier.id then
    raise exception 'Dokument-Speicherpfad passt nicht zum Zielkurier.';
  end if;

  if not exists (
    select 1
    from storage.objects stored_object
    where stored_object.bucket = p_storage_bucket
      and stored_object.key = trimmed_storage_path
      and stored_object.uploaded_by = (select auth.uid())::text
      and stored_object.mime_type = trimmed_mime_type
      and stored_object.size = p_size_bytes
      and stored_object.size > 0
  ) then
    raise exception 'Gespeichertes Dokument wurde nicht gefunden.';
  end if;

  select *
  into existing_document
  from public.documents document
  where document.company_id = actor.company_id
    and document.storage_bucket = p_storage_bucket
    and document.storage_path = trimmed_storage_path
  order by document.created_at desc
  limit 1;

  if existing_document.id is not null then
    return existing_document;
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
    target_courier.id,
    actor.id,
    p_document_type,
    trimmed_title,
    p_storage_bucket,
    trimmed_storage_path,
    trimmed_mime_type,
    p_size_bytes
  )
  returning *
  into inserted_document;

  mailbox_category :=
    case
      when p_document_type = 'payslip' then 'payslip'
      when p_document_type = 'contract' then 'contract'
      when p_document_type = 'notice' then 'notice'
      else 'document'
    end;

  if coalesce(p_create_mailbox_item, true) then
    insert into public.mailbox_items (
      company_id,
      courier_profile_id,
      document_id,
      title,
      message,
      category,
      read_at,
      created_by
    )
    values (
      actor.company_id,
      target_courier.id,
      inserted_document.id,
      trimmed_title,
      coalesce(trimmed_message, 'Ein neues privates Dokument wurde bereitgestellt.'),
      mailbox_category,
      null,
      actor.id
    )
    returning *
    into inserted_mailbox_item;
  end if;

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
    'documents',
    inserted_document.id,
    'document_uploaded',
    null,
    jsonb_build_object(
      'document_id', inserted_document.id,
      'courier_profile_id', target_courier.id,
      'document_type', inserted_document.document_type,
      'storage_bucket', inserted_document.storage_bucket,
      'storage_path', inserted_document.storage_path,
      'mailbox_item_id', inserted_mailbox_item.id
    ),
    null
  );

  return inserted_document;
end;
$$;

create or replace function public.get_document_download_access(p_document_id uuid)
returns table (
  document_id uuid,
  company_id uuid,
  courier_profile_id uuid,
  storage_bucket text,
  storage_path text,
  title text,
  mime_type text,
  size_bytes integer
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  target_document public.documents%rowtype;
begin
  select *
  into target_document
  from public.documents document
  where document.id = p_document_id
  limit 1;

  if target_document.id is null then
    raise exception 'Dokument wurde nicht gefunden.';
  end if;

  if not public.can_access_document(target_document.id)
    or not public.can_read_storage_object(
      target_document.storage_bucket,
      target_document.storage_path
    ) then
    raise exception 'Dokument darf nicht heruntergeladen werden.';
  end if;

  return query
  select
    target_document.id,
    target_document.company_id,
    target_document.courier_profile_id,
    target_document.storage_bucket,
    target_document.storage_path,
    target_document.title,
    target_document.mime_type,
    target_document.size_bytes;
end;
$$;

create or replace function public.mark_mailbox_item_read(p_mailbox_item_id uuid)
returns public.mailbox_items
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  actor public.profiles%rowtype;
  target_item public.mailbox_items%rowtype;
  updated_item public.mailbox_items%rowtype;
begin
  select *
  into actor
  from public.profiles profile
  where profile.auth_user_id = (select auth.uid())
    and profile.role = 'courier'
    and profile.status = 'active'
  limit 1;

  if actor.id is null then
    raise exception 'Nur aktive Kuriere koennen Postfach-Eintraege lesen.';
  end if;

  select *
  into target_item
  from public.mailbox_items item
  where item.id = p_mailbox_item_id
    and item.company_id = actor.company_id
    and item.courier_profile_id = actor.id
  for update;

  if target_item.id is null then
    raise exception 'Postfach-Eintrag wurde nicht gefunden.';
  end if;

  if target_item.read_at is not null then
    return target_item;
  end if;

  update public.mailbox_items
  set read_at = now()
  where id = target_item.id
  returning *
  into updated_item;

  return updated_item;
end;
$$;

revoke insert on public.documents from authenticated;
grant select on public.documents to authenticated;

revoke insert, update on public.mailbox_items from authenticated;
grant select on public.mailbox_items to authenticated;

revoke all on function public.create_courier_document_mailbox_item(
  uuid,
  text,
  text,
  text,
  text,
  text,
  integer,
  boolean,
  text
) from public;
revoke all on function public.get_document_download_access(uuid) from public;
revoke all on function public.mark_mailbox_item_read(uuid) from public;

grant execute on function public.create_courier_document_mailbox_item(
  uuid,
  text,
  text,
  text,
  text,
  text,
  integer,
  boolean,
  text
) to authenticated;
grant execute on function public.get_document_download_access(uuid) to authenticated;
grant execute on function public.mark_mailbox_item_read(uuid) to authenticated;
