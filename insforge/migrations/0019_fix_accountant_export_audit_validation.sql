create or replace function public.record_accountant_export_created(
  p_month text,
  p_depot_code text,
  p_payment_mode text,
  p_row_count integer,
  p_billable_minutes integer,
  p_real_minutes integer
)
returns uuid
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  actor public.profiles%rowtype;
  inserted_log_id uuid;
  normalized_depot_code text;
  normalized_payment_mode text;
begin
  select *
  into actor
  from public.profiles profile
  where profile.auth_user_id = (select auth.uid())
    and profile.role = 'admin'
    and profile.status = 'active'
  limit 1;

  if actor.id is null then
    raise exception 'Nur aktive Admins koennen Steuerberater-Exporte erstellen.';
  end if;

  if coalesce(p_month, '') !~ '^[0-9]{4}-[0-9]{2}$' then
    raise exception 'Ungueltiger Export-Monat.';
  end if;

  normalized_depot_code := coalesce(nullif(btrim(p_depot_code), ''), 'all');
  normalized_payment_mode := coalesce(nullif(btrim(p_payment_mode), ''), 'all');

  if normalized_payment_mode not in ('all', 'hourly', 'daily_fixed') then
    raise exception 'Ungueltige Zahlungsart fuer Export.';
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
    'exports',
    actor.company_id,
    'accountant_export_created',
    null,
    jsonb_build_object(
      'format', 'csv',
      'month', p_month,
      'depot_code', normalized_depot_code,
      'payment_mode', normalized_payment_mode,
      'row_count', greatest(coalesce(p_row_count, 0), 0),
      'billable_minutes', greatest(coalesce(p_billable_minutes, 0), 0),
      'real_minutes', greatest(coalesce(p_real_minutes, 0), 0),
      'approved_only', true
    ),
    null
  )
  returning id
  into inserted_log_id;

  return inserted_log_id;
end;
$$;
