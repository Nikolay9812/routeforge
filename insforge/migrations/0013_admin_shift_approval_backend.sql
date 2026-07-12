create or replace function public.approve_admin_shift(p_shift_id uuid)
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
    raise exception 'Nur aktive Admins koennen Schichten genehmigen.';
  end if;

  select *
  into target_shift
  from public.shifts shift_row
  where shift_row.id = p_shift_id
    and shift_row.company_id = actor.company_id
  for update;

  if target_shift.id is null then
    raise exception 'Schicht nicht gefunden.';
  end if;

  if target_shift.status = 'approved' then
    return target_shift;
  end if;

  if target_shift.status not in ('submitted', 'under_review', 'corrected') then
    raise exception 'Diese Schicht kann nicht genehmigt werden.';
  end if;

  before_snapshot := jsonb_build_object(
    'status', target_shift.status,
    'approved_at', target_shift.approved_at,
    'approved_by', target_shift.approved_by,
    'rejection_reason', target_shift.rejection_reason
  );

  update public.shifts
  set
    status = 'approved',
    approved_at = now(),
    approved_by = actor.id,
    rejection_reason = null,
    updated_at = now()
  where id = target_shift.id
  returning *
  into updated_shift;

  after_snapshot := jsonb_build_object(
    'status', updated_shift.status,
    'approved_at', updated_shift.approved_at,
    'approved_by', updated_shift.approved_by,
    'rejection_reason', updated_shift.rejection_reason
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
    updated_shift.company_id,
    actor.id,
    'shifts',
    updated_shift.id,
    'shift_approved',
    before_snapshot,
    after_snapshot,
    null
  );

  return updated_shift;
end;
$$;

create or replace function public.reject_admin_shift(
  p_shift_id uuid,
  p_rejection_reason text
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
  trimmed_reason text;
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
    raise exception 'Nur aktive Admins koennen Schichten ablehnen.';
  end if;

  trimmed_reason := nullif(btrim(coalesce(p_rejection_reason, '')), '');

  if trimmed_reason is null or length(trimmed_reason) < 3 then
    raise exception 'Ablehnungsgrund ist erforderlich.';
  end if;

  if length(trimmed_reason) > 1000 then
    raise exception 'Ablehnungsgrund darf maximal 1000 Zeichen haben.';
  end if;

  select *
  into target_shift
  from public.shifts shift_row
  where shift_row.id = p_shift_id
    and shift_row.company_id = actor.company_id
  for update;

  if target_shift.id is null then
    raise exception 'Schicht nicht gefunden.';
  end if;

  if target_shift.status not in ('submitted', 'under_review', 'corrected') then
    raise exception 'Diese Schicht kann nicht abgelehnt werden.';
  end if;

  before_snapshot := jsonb_build_object(
    'status', target_shift.status,
    'approved_at', target_shift.approved_at,
    'approved_by', target_shift.approved_by,
    'rejection_reason', target_shift.rejection_reason
  );

  update public.shifts
  set
    status = 'rejected',
    approved_at = null,
    approved_by = null,
    rejection_reason = trimmed_reason,
    updated_at = now()
  where id = target_shift.id
  returning *
  into updated_shift;

  after_snapshot := jsonb_build_object(
    'status', updated_shift.status,
    'approved_at', updated_shift.approved_at,
    'approved_by', updated_shift.approved_by,
    'rejection_reason', updated_shift.rejection_reason
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
    updated_shift.company_id,
    actor.id,
    'shifts',
    updated_shift.id,
    'shift_rejected',
    before_snapshot,
    after_snapshot,
    trimmed_reason
  );

  return updated_shift;
end;
$$;

create or replace function public.correct_admin_shift(
  p_shift_id uuid,
  p_correction_reason text,
  p_start_time timestamptz default null,
  p_end_time timestamptz default null,
  p_break_minutes integer default null,
  p_billable_minutes integer default null,
  p_start_km integer default null,
  p_end_km integer default null,
  p_packages_delivered integer default null,
  p_packages_returned integer default null,
  p_packages_picked_up integer default null,
  p_total_stops integer default null,
  p_courier_note text default null
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
  trimmed_reason text;
  trimmed_courier_note text;
  corrected_start_time timestamptz;
  corrected_end_time timestamptz;
  corrected_break_minutes integer;
  corrected_gross_minutes integer;
  corrected_net_minutes integer;
  automatic_billable_minutes integer;
  corrected_billable_minutes integer;
  corrected_billable_source text;
  corrected_start_km integer;
  corrected_end_km integer;
  corrected_packages_delivered integer;
  corrected_packages_returned integer;
  corrected_packages_picked_up integer;
  corrected_total_stops integer;
  corrected_auto_stopped boolean;
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
    raise exception 'Nur aktive Admins koennen Schichten korrigieren.';
  end if;

  trimmed_reason := nullif(btrim(coalesce(p_correction_reason, '')), '');

  if trimmed_reason is null or length(trimmed_reason) < 3 then
    raise exception 'Korrekturgrund ist erforderlich.';
  end if;

  if length(trimmed_reason) > 1000 then
    raise exception 'Korrekturgrund darf maximal 1000 Zeichen haben.';
  end if;

  select *
  into target_shift
  from public.shifts shift_row
  where shift_row.id = p_shift_id
    and shift_row.company_id = actor.company_id
  for update;

  if target_shift.id is null then
    raise exception 'Schicht nicht gefunden.';
  end if;

  if target_shift.status not in ('submitted', 'under_review') then
    raise exception 'Diese Schicht kann nicht korrigiert werden.';
  end if;

  corrected_start_time := coalesce(p_start_time, target_shift.start_time);
  corrected_end_time := coalesce(p_end_time, target_shift.end_time);

  if corrected_end_time is null then
    raise exception 'Stoppzeit ist fuer eine Korrektur erforderlich.';
  end if;

  if corrected_end_time <= corrected_start_time then
    raise exception 'Stoppzeit muss nach Startzeit liegen.';
  end if;

  corrected_break_minutes := coalesce(p_break_minutes, target_shift.break_minutes);

  if corrected_break_minutes is null or corrected_break_minutes < 0 then
    raise exception 'Pause ist ungueltig.';
  end if;

  corrected_gross_minutes :=
    floor(extract(epoch from (corrected_end_time - corrected_start_time)) / 60)::integer;

  if corrected_break_minutes > corrected_gross_minutes then
    raise exception 'Pause darf die Bruttozeit nicht ueberschreiten.';
  end if;

  corrected_net_minutes := greatest(corrected_gross_minutes - corrected_break_minutes, 0);

  automatic_billable_minutes :=
    case
      when target_shift.payment_mode_snapshot = 'daily_fixed' then 500
      else least(corrected_net_minutes, 600)
    end;

  corrected_billable_minutes := coalesce(p_billable_minutes, automatic_billable_minutes);

  if corrected_billable_minutes < 0 then
    raise exception 'Abrechenbare Minuten sind ungueltig.';
  end if;

  corrected_billable_source :=
    case
      when corrected_billable_minutes = automatic_billable_minutes then 'auto'
      else 'manual_override'
    end;

  corrected_start_km := coalesce(p_start_km, target_shift.start_km);
  corrected_end_km := coalesce(p_end_km, target_shift.end_km);

  if corrected_start_km < 0 or corrected_end_km < corrected_start_km then
    raise exception 'Kilometerwerte sind ungueltig.';
  end if;

  corrected_packages_delivered :=
    coalesce(p_packages_delivered, target_shift.packages_delivered);
  corrected_packages_returned :=
    coalesce(p_packages_returned, target_shift.packages_returned);
  corrected_packages_picked_up :=
    coalesce(p_packages_picked_up, target_shift.packages_picked_up);
  corrected_total_stops := coalesce(p_total_stops, target_shift.total_stops);

  if corrected_packages_delivered < 0
    or corrected_packages_returned < 0
    or corrected_packages_picked_up < 0
    or (corrected_total_stops is not null and corrected_total_stops < 0) then
    raise exception 'Paket- und Stoppzahlen muessen Zahlen ab 0 sein.';
  end if;

  trimmed_courier_note := nullif(btrim(coalesce(p_courier_note, target_shift.courier_note, '')), '');

  if trimmed_courier_note is not null and length(trimmed_courier_note) > 1000 then
    raise exception 'Kuriernotiz darf maximal 1000 Zeichen haben.';
  end if;

  corrected_auto_stopped :=
    target_shift.payment_mode_snapshot = 'hourly'
    and corrected_gross_minutes >= 600;

  before_snapshot := jsonb_build_object(
    'status', target_shift.status,
    'start_time', target_shift.start_time,
    'end_time', target_shift.end_time,
    'gross_minutes', target_shift.gross_minutes,
    'break_minutes', target_shift.break_minutes,
    'net_minutes', target_shift.net_minutes,
    'billable_minutes', target_shift.billable_minutes,
    'billable_source', target_shift.billable_source,
    'start_km', target_shift.start_km,
    'end_km', target_shift.end_km,
    'packages_delivered', target_shift.packages_delivered,
    'packages_returned', target_shift.packages_returned,
    'packages_picked_up', target_shift.packages_picked_up,
    'total_stops', target_shift.total_stops,
    'courier_note', target_shift.courier_note
  );

  update public.shifts
  set
    start_time = corrected_start_time,
    end_time = corrected_end_time,
    gross_minutes = corrected_gross_minutes,
    break_minutes = corrected_break_minutes,
    net_minutes = corrected_net_minutes,
    billable_minutes = corrected_billable_minutes,
    billable_source = corrected_billable_source,
    billable_override_reason =
      case when corrected_billable_source = 'manual_override' then trimmed_reason else null end,
    billable_override_by =
      case when corrected_billable_source = 'manual_override' then actor.id else null end,
    billable_override_at =
      case when corrected_billable_source = 'manual_override' then now() else null end,
    auto_stopped_at_max_hours = corrected_auto_stopped,
    start_km = corrected_start_km,
    end_km = corrected_end_km,
    packages_delivered = corrected_packages_delivered,
    packages_returned = corrected_packages_returned,
    packages_picked_up = corrected_packages_picked_up,
    total_stops = corrected_total_stops,
    courier_note = trimmed_courier_note,
    status = 'corrected',
    approved_at = null,
    approved_by = null,
    rejection_reason = null,
    updated_at = now()
  where id = target_shift.id
  returning *
  into updated_shift;

  after_snapshot := jsonb_build_object(
    'status', updated_shift.status,
    'start_time', updated_shift.start_time,
    'end_time', updated_shift.end_time,
    'gross_minutes', updated_shift.gross_minutes,
    'break_minutes', updated_shift.break_minutes,
    'net_minutes', updated_shift.net_minutes,
    'billable_minutes', updated_shift.billable_minutes,
    'billable_source', updated_shift.billable_source,
    'start_km', updated_shift.start_km,
    'end_km', updated_shift.end_km,
    'packages_delivered', updated_shift.packages_delivered,
    'packages_returned', updated_shift.packages_returned,
    'packages_picked_up', updated_shift.packages_picked_up,
    'total_stops', updated_shift.total_stops,
    'courier_note', updated_shift.courier_note
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
    updated_shift.company_id,
    actor.id,
    'shifts',
    updated_shift.id,
    'shift_corrected',
    before_snapshot,
    after_snapshot,
    trimmed_reason
  );

  if updated_shift.billable_source = 'manual_override' then
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
      updated_shift.company_id,
      actor.id,
      'shifts',
      updated_shift.id,
      'billable_time_overridden',
      jsonb_build_object(
        'billable_minutes', target_shift.billable_minutes,
        'billable_source', target_shift.billable_source
      ),
      jsonb_build_object(
        'billable_minutes', updated_shift.billable_minutes,
        'billable_source', updated_shift.billable_source,
        'billable_override_by', updated_shift.billable_override_by,
        'billable_override_at', updated_shift.billable_override_at
      ),
      trimmed_reason
    );
  end if;

  return updated_shift;
end;
$$;

revoke all on function public.approve_admin_shift(uuid) from public;
revoke all on function public.reject_admin_shift(uuid, text) from public;
revoke all on function public.correct_admin_shift(
  uuid,
  text,
  timestamptz,
  timestamptz,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  text
) from public;

grant execute on function public.approve_admin_shift(uuid) to authenticated;
grant execute on function public.reject_admin_shift(uuid, text) to authenticated;
grant execute on function public.correct_admin_shift(
  uuid,
  text,
  timestamptz,
  timestamptz,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  text
) to authenticated;
