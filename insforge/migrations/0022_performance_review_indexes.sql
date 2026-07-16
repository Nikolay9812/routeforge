create index if not exists shifts_company_date_created_idx
  on public.shifts (company_id, shift_date desc, created_at desc);

create index if not exists shifts_company_status_date_created_idx
  on public.shifts (company_id, status, shift_date desc, created_at desc);

create index if not exists shifts_company_courier_date_created_idx
  on public.shifts (company_id, courier_profile_id, shift_date desc, created_at desc);

create index if not exists documents_company_created_idx
  on public.documents (company_id, created_at desc);

create index if not exists mailbox_items_company_courier_created_idx
  on public.mailbox_items (company_id, courier_profile_id, created_at desc);

create index if not exists shift_photos_company_shift_uploaded_idx
  on public.shift_photos (company_id, shift_id, uploaded_at desc);

create index if not exists audit_logs_company_target_created_idx
  on public.audit_logs (company_id, target_table, target_id, created_at desc);

create index if not exists profiles_company_role_status_name_idx
  on public.profiles (company_id, role, status, full_name);
