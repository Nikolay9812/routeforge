create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  country_code text not null default 'DE',
  default_language text not null default 'de',
  logo_url text,
  stamp_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint companies_slug_key unique (slug),
  constraint companies_name_not_blank check (length(btrim(name)) > 0),
  constraint companies_slug_not_blank check (length(btrim(slug)) > 0),
  constraint companies_country_code_format check (country_code ~ '^[A-Z]{2}$'),
  constraint companies_default_language_check check (default_language in ('de', 'bg'))
);

create table public.depots (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  code text not null,
  address_line_1 text not null,
  postal_code text not null,
  city text not null,
  country_code text not null default 'DE',
  latitude numeric(9, 6) not null,
  longitude numeric(9, 6) not null,
  geofence_radius_meters integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint depots_company_code_key unique (company_id, code),
  constraint depots_name_not_blank check (length(btrim(name)) > 0),
  constraint depots_code_not_blank check (length(btrim(code)) > 0),
  constraint depots_address_not_blank check (length(btrim(address_line_1)) > 0),
  constraint depots_postal_code_not_blank check (length(btrim(postal_code)) > 0),
  constraint depots_city_not_blank check (length(btrim(city)) > 0),
  constraint depots_country_code_format check (country_code ~ '^[A-Z]{2}$'),
  constraint depots_latitude_range check (latitude between -90 and 90),
  constraint depots_longitude_range check (longitude between -180 and 180),
  constraint depots_geofence_radius_positive check (geofence_radius_meters > 0)
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id),
  company_id uuid not null references public.companies(id) on delete cascade,
  primary_depot_id uuid references public.depots(id) on delete set null,
  role text not null,
  status text not null default 'pending_approval',
  payment_mode text not null default 'hourly',
  daily_fixed_minutes integer not null default 500,
  hourly_max_minutes integer not null default 600,
  preferred_language text not null default 'de',
  full_name text not null,
  email text not null,
  phone text,
  birth_date date,
  address_line_1 text,
  postal_code text,
  city text,
  steuer_id text,
  iban text,
  id_card_document_url text,
  driver_license_document_url text,
  registration_document_url text,
  bank_document_url text,
  approved_at timestamptz,
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_auth_user_id_key unique (auth_user_id),
  constraint profiles_role_check check (role in ('admin', 'dispatcher', 'courier')),
  constraint profiles_status_check check (
    status in ('pending_approval', 'active', 'inactive', 'suspended')
  ),
  constraint profiles_payment_mode_check check (payment_mode in ('hourly', 'daily_fixed')),
  constraint profiles_preferred_language_check check (preferred_language in ('de', 'bg')),
  constraint profiles_daily_fixed_minutes_nonnegative check (daily_fixed_minutes >= 0),
  constraint profiles_hourly_max_minutes_positive check (hourly_max_minutes > 0),
  constraint profiles_full_name_not_blank check (length(btrim(full_name)) > 0),
  constraint profiles_email_not_blank check (length(btrim(email)) > 0),
  constraint profiles_approved_state_check check (
    (approved_at is null and approved_by is null)
    or (approved_at is not null)
  )
);

create table public.profile_depot_access (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  depot_id uuid not null references public.depots(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),

  constraint profile_depot_access_profile_depot_key unique (
    company_id,
    profile_id,
    depot_id
  )
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  email text not null,
  role text not null,
  invite_code text not null,
  depot_id uuid references public.depots(id) on delete set null,
  status text not null default 'active',
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by uuid references public.profiles(id) on delete set null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),

  constraint invitations_invite_code_key unique (company_id, invite_code),
  constraint invitations_email_not_blank check (length(btrim(email)) > 0),
  constraint invitations_role_check check (role in ('dispatcher', 'courier')),
  constraint invitations_status_check check (
    status in ('active', 'used', 'expired', 'revoked')
  ),
  constraint invitations_invite_code_format check (invite_code ~ '^[A-Z0-9-]{6,24}$'),
  constraint invitations_used_state_check check (
    (status = 'used' and used_at is not null and used_by is not null)
    or (status <> 'used' and used_at is null and used_by is null)
  )
);

create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  depot_id uuid not null references public.depots(id),
  courier_profile_id uuid not null references public.profiles(id),
  shift_date date not null,
  start_time timestamptz not null,
  end_time timestamptz,
  gross_minutes integer not null default 0,
  break_minutes integer not null default 0,
  net_minutes integer not null default 0,
  billable_minutes integer not null default 0,
  billable_source text not null default 'auto',
  billable_override_reason text,
  billable_override_by uuid references public.profiles(id) on delete set null,
  billable_override_at timestamptz,
  auto_stopped_at_max_hours boolean not null default false,
  payment_mode_snapshot text not null,
  van_plate text not null default '',
  start_km integer not null default 0,
  end_km integer not null default 0,
  packages_delivered integer not null default 0,
  packages_returned integer not null default 0,
  packages_picked_up integer not null default 0,
  total_stops integer,
  courier_note text,
  signature_url text,
  signed_at timestamptz,
  status text not null default 'draft',
  submitted_at timestamptz,
  approved_at timestamptz,
  approved_by uuid references public.profiles(id) on delete set null,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint shifts_one_per_courier_day_key unique (
    company_id,
    courier_profile_id,
    shift_date
  ),
  constraint shifts_billable_source_check check (
    billable_source in ('auto', 'manual_override')
  ),
  constraint shifts_payment_mode_snapshot_check check (
    payment_mode_snapshot in ('hourly', 'daily_fixed')
  ),
  constraint shifts_status_check check (
    status in ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'corrected')
  ),
  constraint shifts_end_after_start check (end_time is null or end_time >= start_time),
  constraint shifts_minutes_nonnegative check (
    gross_minutes >= 0
    and break_minutes >= 0
    and net_minutes >= 0
    and billable_minutes >= 0
  ),
  constraint shifts_break_not_more_than_gross check (break_minutes <= gross_minutes),
  constraint shifts_net_not_more_than_gross check (net_minutes <= gross_minutes),
  constraint shifts_kilometers_nonnegative check (start_km >= 0 and end_km >= 0),
  constraint shifts_end_km_not_before_start_km check (end_km >= start_km),
  constraint shifts_package_counters_nonnegative check (
    packages_delivered >= 0
    and packages_returned >= 0
    and packages_picked_up >= 0
    and (total_stops is null or total_stops >= 0)
  ),
  constraint shifts_manual_override_requires_reason check (
    billable_source <> 'manual_override'
    or (
      billable_override_reason is not null
      and length(btrim(billable_override_reason)) > 0
      and billable_override_by is not null
      and billable_override_at is not null
    )
  ),
  constraint shifts_auto_billable_has_no_override check (
    billable_source <> 'auto'
    or (
      billable_override_reason is null
      and billable_override_by is null
      and billable_override_at is null
    )
  ),
  constraint shifts_rejection_requires_reason check (
    status <> 'rejected'
    or (rejection_reason is not null and length(btrim(rejection_reason)) > 0)
  ),
  constraint shifts_non_rejected_has_no_rejection_reason check (
    status = 'rejected' or rejection_reason is null
  ),
  constraint shifts_signature_state_check check (
    (signature_url is null and signed_at is null)
    or (signature_url is not null and signed_at is not null)
  ),
  constraint shifts_submitted_state_check check (
    status not in ('submitted', 'under_review', 'approved', 'corrected')
    or submitted_at is not null
  ),
  constraint shifts_approved_state_check check (
    status <> 'approved'
    or (approved_at is not null and approved_by is not null)
  )
);

create table public.shift_locations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  shift_id uuid not null references public.shifts(id) on delete cascade,
  location_type text not null,
  latitude numeric(9, 6) not null,
  longitude numeric(9, 6) not null,
  accuracy_meters numeric,
  depot_latitude_snapshot numeric(9, 6),
  depot_longitude_snapshot numeric(9, 6),
  distance_from_depot_meters numeric,
  is_inside_depot_geofence boolean,
  created_at timestamptz not null default now(),

  constraint shift_locations_shift_type_key unique (shift_id, location_type),
  constraint shift_locations_location_type_check check (location_type in ('start', 'stop')),
  constraint shift_locations_latitude_range check (latitude between -90 and 90),
  constraint shift_locations_longitude_range check (longitude between -180 and 180),
  constraint shift_locations_accuracy_nonnegative check (
    accuracy_meters is null or accuracy_meters >= 0
  ),
  constraint shift_locations_depot_latitude_range check (
    depot_latitude_snapshot is null or depot_latitude_snapshot between -90 and 90
  ),
  constraint shift_locations_depot_longitude_range check (
    depot_longitude_snapshot is null or depot_longitude_snapshot between -180 and 180
  ),
  constraint shift_locations_distance_nonnegative check (
    distance_from_depot_meters is null or distance_from_depot_meters >= 0
  )
);

create table public.shift_photos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  shift_id uuid not null references public.shifts(id) on delete cascade,
  photo_type text not null,
  storage_bucket text not null default 'shift-photos',
  storage_path text not null,
  mime_type text not null,
  size_bytes integer not null,
  compressed boolean not null default true,
  uploaded_by uuid not null references public.profiles(id),
  uploaded_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days'),
  deleted_at timestamptz,

  constraint shift_photos_photo_type_check check (
    photo_type in ('start_km', 'end_km', 'fahrtenbuch', 'mentor')
  ),
  constraint shift_photos_storage_bucket_check check (storage_bucket = 'shift-photos'),
  constraint shift_photos_storage_path_not_blank check (length(btrim(storage_path)) > 0),
  constraint shift_photos_mime_type_not_blank check (length(btrim(mime_type)) > 0),
  constraint shift_photos_size_bytes_positive check (size_bytes > 0),
  constraint shift_photos_retention_order check (expires_at >= uploaded_at)
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  courier_profile_id uuid references public.profiles(id) on delete set null,
  uploaded_by uuid not null references public.profiles(id),
  document_type text not null,
  title text not null,
  storage_bucket text not null,
  storage_path text not null,
  mime_type text not null,
  size_bytes integer not null,
  created_at timestamptz not null default now(),

  constraint documents_document_type_check check (
    document_type in ('payslip', 'contract', 'instruction', 'notice', 'other')
  ),
  constraint documents_storage_bucket_check check (
    storage_bucket in ('payslips', 'courier-documents', 'generated-pdfs')
  ),
  constraint documents_title_not_blank check (length(btrim(title)) > 0),
  constraint documents_storage_path_not_blank check (length(btrim(storage_path)) > 0),
  constraint documents_mime_type_not_blank check (length(btrim(mime_type)) > 0),
  constraint documents_size_bytes_positive check (size_bytes > 0)
);

create table public.mailbox_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  courier_profile_id uuid not null references public.profiles(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  title text not null,
  message text,
  category text not null,
  read_at timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),

  constraint mailbox_items_category_check check (
    category in ('document', 'payslip', 'contract', 'notice')
  ),
  constraint mailbox_items_title_not_blank check (length(btrim(title)) > 0)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  actor_profile_id uuid not null references public.profiles(id),
  target_table text not null,
  target_id uuid not null,
  action text not null,
  before jsonb,
  after jsonb,
  reason text,
  created_at timestamptz not null default now(),

  constraint audit_logs_target_table_not_blank check (length(btrim(target_table)) > 0),
  constraint audit_logs_action_not_blank check (length(btrim(action)) > 0),
  constraint audit_logs_reason_not_blank_when_present check (
    reason is null or length(btrim(reason)) > 0
  )
);

create index depots_company_id_idx
  on public.depots (company_id);

create index profiles_company_id_idx
  on public.profiles (company_id);

create index profiles_company_role_idx
  on public.profiles (company_id, role);

create index profiles_company_status_idx
  on public.profiles (company_id, status);

create index profiles_primary_depot_id_idx
  on public.profiles (primary_depot_id);

create index profile_depot_access_profile_id_idx
  on public.profile_depot_access (profile_id);

create index profile_depot_access_depot_id_idx
  on public.profile_depot_access (depot_id);

create index invitations_company_id_idx
  on public.invitations (company_id);

create index invitations_company_status_idx
  on public.invitations (company_id, status);

create index invitations_depot_id_idx
  on public.invitations (depot_id);

create index shifts_company_depot_date_idx
  on public.shifts (company_id, depot_id, shift_date);

create index shifts_company_status_idx
  on public.shifts (company_id, status);

create index shifts_courier_profile_id_idx
  on public.shifts (courier_profile_id);

create index shifts_shift_date_idx
  on public.shifts (shift_date);

create index shift_locations_company_shift_type_idx
  on public.shift_locations (company_id, shift_id, location_type);

create index shift_photos_company_shift_idx
  on public.shift_photos (company_id, shift_id);

create index shift_photos_expires_at_idx
  on public.shift_photos (expires_at);

create index shift_photos_uploaded_by_idx
  on public.shift_photos (uploaded_by);

create index documents_company_courier_idx
  on public.documents (company_id, courier_profile_id);

create index documents_uploaded_by_idx
  on public.documents (uploaded_by);

create index mailbox_items_company_courier_read_idx
  on public.mailbox_items (company_id, courier_profile_id, read_at);

create index mailbox_items_document_id_idx
  on public.mailbox_items (document_id);

create index audit_logs_company_created_at_idx
  on public.audit_logs (company_id, created_at desc);

create index audit_logs_actor_profile_id_idx
  on public.audit_logs (actor_profile_id);

create index audit_logs_target_idx
  on public.audit_logs (target_table, target_id);
