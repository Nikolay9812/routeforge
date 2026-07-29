create or replace function public.update_company_settings(
  p_name text,
  p_default_language text
)
returns public.companies
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  actor public.profiles%rowtype;
  target_company public.companies%rowtype;
  updated_company public.companies%rowtype;
  trimmed_name text;
  language_value text;
  before_snapshot jsonb;
  after_snapshot jsonb;
begin
  select *
  into actor
  from public.profiles profile
  where profile.auth_user_id = (select auth.uid())
    and profile.role = 'admin'
    and profile.status = 'active'
  limit 1;

  if actor.id is null then
    raise exception 'Nur aktive Admins koennen Firmeneinstellungen aendern.';
  end if;

  trimmed_name := nullif(btrim(coalesce(p_name, '')), '');
  language_value := btrim(coalesce(p_default_language, ''));

  if trimmed_name is null then
    raise exception 'Firmenname ist erforderlich.';
  end if;

  if length(trimmed_name) > 120 then
    raise exception 'Firmenname darf maximal 120 Zeichen haben.';
  end if;

  if language_value not in ('de', 'bg') then
    raise exception 'Standardsprache ist ungueltig.';
  end if;

  select *
  into target_company
  from public.companies company
  where company.id = actor.company_id
  for update;

  if target_company.id is null then
    raise exception 'Firma nicht gefunden.';
  end if;

  if target_company.name = trimmed_name
    and target_company.default_language = language_value then
    return target_company;
  end if;

  before_snapshot := jsonb_build_object(
    'name', target_company.name,
    'default_language', target_company.default_language
  );

  update public.companies
  set
    name = trimmed_name,
    default_language = language_value,
    updated_at = now()
  where id = target_company.id
  returning *
  into updated_company;

  after_snapshot := jsonb_build_object(
    'name', updated_company.name,
    'default_language', updated_company.default_language
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
    updated_company.id,
    actor.id,
    'companies',
    updated_company.id,
    'company_settings_updated',
    before_snapshot,
    after_snapshot,
    'Firmenname oder Standardsprache aktualisiert'
  );

  return updated_company;
end;
$$;

revoke all on function public.update_company_settings(text, text) from public;
grant execute on function public.update_company_settings(text, text) to authenticated;
