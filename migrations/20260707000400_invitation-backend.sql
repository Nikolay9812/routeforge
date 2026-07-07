create or replace function public.normalize_invite_code(raw_value text)
returns text
language sql
immutable
set search_path = pg_catalog, public, pg_temp
as $$
  select upper(btrim(coalesce(raw_value, '')))
$$;

create or replace function public.generate_invite_code()
returns text
language plpgsql
volatile
set search_path = pg_catalog, public, pg_temp
as $$
begin
  return upper('RF-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
end;
$$;

create or replace function public.validate_courier_invitation(
  p_email text,
  p_invite_code text
)
returns table (
  ok boolean,
  status text,
  message text
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  invitation_row public.invitations%rowtype;
begin
  select *
  into invitation_row
  from public.invitations invitation
  where lower(invitation.email) = lower(btrim(p_email))
    and invitation.invite_code = public.normalize_invite_code(p_invite_code)
  limit 1;

  if invitation_row.id is null then
    return query select false, 'invalid'::text, 'Der Einladungscode ist ungueltig.'::text;
    return;
  end if;

  if invitation_row.role <> 'courier' then
    return query select false, 'wrong_role'::text, 'Dieser Code ist nicht fuer die mobile Kurier-App vorgesehen.'::text;
    return;
  end if;

  if invitation_row.status = 'used' then
    return query select false, 'used'::text, 'Der Einladungscode wurde bereits verwendet.'::text;
    return;
  end if;

  if invitation_row.status = 'revoked' then
    return query select false, 'revoked'::text, 'Der Einladungscode wurde widerrufen.'::text;
    return;
  end if;

  if invitation_row.status = 'expired' or invitation_row.expires_at <= now() then
    return query select false, 'expired'::text, 'Der Einladungscode ist abgelaufen.'::text;
    return;
  end if;

  return query select true, 'active'::text, 'Einladung ist gueltig.'::text;
end;
$$;

create or replace function public.create_invitation(
  p_email text,
  p_role text,
  p_depot_id uuid,
  p_expires_at timestamptz
)
returns public.invitations
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  actor public.profiles%rowtype;
  code text;
  created_invitation public.invitations%rowtype;
begin
  select *
  into actor
  from public.profiles
  where auth_user_id = (select auth.uid())
    and status = 'active'
  limit 1;

  if actor.id is null or actor.role <> 'admin' then
    raise exception 'Nur aktive Admins koennen Einladungen erstellen.';
  end if;

  if p_role not in ('courier', 'dispatcher') then
    raise exception 'Ungueltige Einladungsrolle.';
  end if;

  if length(btrim(coalesce(p_email, ''))) = 0 then
    raise exception 'E-Mail ist erforderlich.';
  end if;

  if p_expires_at <= now() then
    raise exception 'Ablaufdatum muss in der Zukunft liegen.';
  end if;

  if p_depot_id is not null and not exists (
    select 1
    from public.depots depot
    where depot.id = p_depot_id
      and depot.company_id = actor.company_id
      and depot.is_active = true
  ) then
    raise exception 'Depot gehoert nicht zum aktuellen Mandanten.';
  end if;

  loop
    code := public.generate_invite_code();

    begin
      insert into public.invitations (
        company_id,
        email,
        role,
        invite_code,
        depot_id,
        status,
        expires_at,
        created_by
      )
      values (
        actor.company_id,
        lower(btrim(p_email)),
        p_role,
        code,
        p_depot_id,
        'active',
        p_expires_at,
        actor.id
      )
      returning *
      into created_invitation;

      exit;
    exception
      when unique_violation then
        code := null;
    end;
  end loop;

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
    'invitations',
    created_invitation.id,
    'invitation_created',
    null,
    to_jsonb(created_invitation),
    null
  );

  return created_invitation;
end;
$$;

create or replace function public.revoke_invitation(
  p_invitation_id uuid,
  p_reason text default null
)
returns public.invitations
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  actor public.profiles%rowtype;
  before_invitation public.invitations%rowtype;
  after_invitation public.invitations%rowtype;
begin
  select *
  into actor
  from public.profiles
  where auth_user_id = (select auth.uid())
    and status = 'active'
  limit 1;

  if actor.id is null or actor.role <> 'admin' then
    raise exception 'Nur aktive Admins koennen Einladungen widerrufen.';
  end if;

  select *
  into before_invitation
  from public.invitations invitation
  where invitation.id = p_invitation_id
    and invitation.company_id = actor.company_id
  for update;

  if before_invitation.id is null then
    raise exception 'Einladung nicht gefunden.';
  end if;

  if before_invitation.status <> 'active' then
    raise exception 'Nur aktive Einladungen koennen widerrufen werden.';
  end if;

  update public.invitations
  set status = 'revoked'
  where id = before_invitation.id
  returning *
  into after_invitation;

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
    'invitations',
    after_invitation.id,
    'invitation_revoked',
    to_jsonb(before_invitation),
    to_jsonb(after_invitation),
    nullif(btrim(coalesce(p_reason, '')), '')
  );

  return after_invitation;
end;
$$;

create or replace function public.use_courier_invitation(
  p_email text,
  p_invite_code text,
  p_full_name text
)
returns public.profiles
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  invitation_row public.invitations%rowtype;
  created_profile public.profiles%rowtype;
  current_auth_user_id uuid;
begin
  current_auth_user_id := (select auth.uid());

  if current_auth_user_id is null then
    raise exception 'Anmeldung erforderlich.';
  end if;

  if length(btrim(coalesce(p_full_name, ''))) = 0 then
    raise exception 'Name ist erforderlich.';
  end if;

  if exists (
    select 1
    from public.profiles profile
    where profile.auth_user_id = current_auth_user_id
  ) then
    raise exception 'Fuer diesen Zugang existiert bereits ein Profil.';
  end if;

  select *
  into invitation_row
  from public.invitations invitation
  where lower(invitation.email) = lower(btrim(p_email))
    and invitation.invite_code = public.normalize_invite_code(p_invite_code)
  for update;

  if invitation_row.id is null then
    raise exception 'Der Einladungscode ist ungueltig.';
  end if;

  if invitation_row.role <> 'courier' then
    raise exception 'Dieser Code ist nicht fuer die mobile Kurier-App vorgesehen.';
  end if;

  if invitation_row.status = 'used' then
    raise exception 'Der Einladungscode wurde bereits verwendet.';
  end if;

  if invitation_row.status = 'revoked' then
    raise exception 'Der Einladungscode wurde widerrufen.';
  end if;

  if invitation_row.status = 'expired' or invitation_row.expires_at <= now() then
    update public.invitations
    set status = 'expired'
    where id = invitation_row.id
      and status = 'active';

    raise exception 'Der Einladungscode ist abgelaufen.';
  end if;

  insert into public.profiles (
    auth_user_id,
    company_id,
    primary_depot_id,
    role,
    status,
    preferred_language,
    full_name,
    email
  )
  values (
    current_auth_user_id,
    invitation_row.company_id,
    invitation_row.depot_id,
    'courier',
    'pending_approval',
    'de',
    btrim(p_full_name),
    lower(btrim(p_email))
  )
  returning *
  into created_profile;

  update public.invitations
  set
    status = 'used',
    used_at = now(),
    used_by = created_profile.id
  where id = invitation_row.id;

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
    invitation_row.company_id,
    created_profile.id,
    'invitations',
    invitation_row.id,
    'invitation_used',
    to_jsonb(invitation_row),
    (
      select to_jsonb(updated_invitation)
      from public.invitations updated_invitation
      where updated_invitation.id = invitation_row.id
    ),
    null
  );

  return created_profile;
end;
$$;

revoke all on function public.normalize_invite_code(text) from public;
revoke all on function public.generate_invite_code() from public;
revoke all on function public.validate_courier_invitation(text, text) from public;
revoke all on function public.create_invitation(text, text, uuid, timestamptz) from public;
revoke all on function public.revoke_invitation(uuid, text) from public;
revoke all on function public.use_courier_invitation(text, text, text) from public;

grant usage on schema public to anon;
grant execute on function public.validate_courier_invitation(text, text) to anon, authenticated;
grant execute on function public.create_invitation(text, text, uuid, timestamptz) to authenticated;
grant execute on function public.revoke_invitation(uuid, text) to authenticated;
grant execute on function public.use_courier_invitation(text, text, text) to authenticated;
