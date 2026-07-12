export type UUID = string;

export type UserRole = "admin" | "dispatcher" | "courier";
export type InvitationRole = "dispatcher" | "courier";
export type ProfileStatus =
  | "pending_approval"
  | "active"
  | "inactive"
  | "suspended";
export type PaymentMode = "hourly" | "daily_fixed";
export type ShiftStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "corrected";
export type BillableSource = "auto" | "manual_override";
export type InvitationStatus = "active" | "used" | "expired" | "revoked";
export type ShiftLocationType = "start" | "stop";
export type ShiftPhotoType = "start_km" | "end_km" | "fahrtenbuch" | "mentor";
export type DocumentType =
  | "payslip"
  | "contract"
  | "instruction"
  | "notice"
  | "other";
export type MailboxCategory = "document" | "payslip" | "contract" | "notice";
export type SupportedLanguage = "de" | "bg";

export type DateString = string;
export type DateTimeString = string;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

export type PayrollSettings = {
  paymentMode: PaymentMode;
  dailyFixedMinutes: number;
  hourlyMaxMinutes: number;
};

export type Company = {
  id: UUID;
  name: string;
  slug: string;
  country_code: string;
  default_language: SupportedLanguage;
  logo_url: string | null;
  stamp_url: string | null;
  created_at: DateTimeString;
  updated_at: DateTimeString;
};

export type Depot = {
  id: UUID;
  company_id: UUID;
  name: string;
  code: string;
  address_line_1: string;
  postal_code: string;
  city: string;
  country_code: string;
  latitude: number;
  longitude: number;
  geofence_radius_meters: number;
  is_active: boolean;
  created_at: DateTimeString;
  updated_at: DateTimeString;
};

export type Profile = {
  id: UUID;
  auth_user_id: UUID;
  company_id: UUID;
  primary_depot_id: UUID | null;
  role: UserRole;
  status: ProfileStatus;
  payment_mode: PaymentMode;
  daily_fixed_minutes: number;
  hourly_max_minutes: number;
  preferred_language: SupportedLanguage;
  full_name: string;
  email: string;
  phone: string | null;
  birth_date: DateString | null;
  address_line_1: string | null;
  postal_code: string | null;
  city: string | null;
  steuer_id: string | null;
  iban: string | null;
  id_card_document_url: string | null;
  driver_license_document_url: string | null;
  registration_document_url: string | null;
  bank_document_url: string | null;
  approved_at: DateTimeString | null;
  approved_by: UUID | null;
  created_at: DateTimeString;
  updated_at: DateTimeString;
};

export type ProfileDepotAccess = {
  id: UUID;
  company_id: UUID;
  profile_id: UUID;
  depot_id: UUID;
  created_by: UUID;
  created_at: DateTimeString;
};

export type Invitation = {
  id: UUID;
  company_id: UUID;
  email: string;
  role: InvitationRole;
  invite_code: string;
  depot_id: UUID | null;
  status: InvitationStatus;
  expires_at: DateTimeString;
  used_at: DateTimeString | null;
  used_by: UUID | null;
  created_by: UUID;
  created_at: DateTimeString;
};

export type Shift = {
  id: UUID;
  company_id: UUID;
  depot_id: UUID;
  courier_profile_id: UUID;
  shift_date: DateString;
  start_time: DateTimeString;
  end_time: DateTimeString | null;
  gross_minutes: number;
  break_minutes: number;
  net_minutes: number;
  billable_minutes: number;
  billable_source: BillableSource;
  billable_override_reason: string | null;
  billable_override_by: UUID | null;
  billable_override_at: DateTimeString | null;
  auto_stopped_at_max_hours: boolean;
  payment_mode_snapshot: PaymentMode;
  tour_number: string | null;
  van_plate: string;
  start_km: number;
  end_km: number;
  packages_delivered: number;
  packages_returned: number;
  packages_picked_up: number;
  total_stops: number | null;
  courier_note: string | null;
  missing_proof_explanation: string | null;
  signature_url: string | null;
  signature_storage_key: string | null;
  signed_at: DateTimeString | null;
  status: ShiftStatus;
  submitted_at: DateTimeString | null;
  approved_at: DateTimeString | null;
  approved_by: UUID | null;
  rejection_reason: string | null;
  created_at: DateTimeString;
  updated_at: DateTimeString;
};

export type ShiftLocation = {
  id: UUID;
  company_id: UUID;
  shift_id: UUID;
  location_type: ShiftLocationType;
  latitude: number;
  longitude: number;
  accuracy_meters: number | null;
  depot_latitude_snapshot: number | null;
  depot_longitude_snapshot: number | null;
  distance_from_depot_meters: number | null;
  is_inside_depot_geofence: boolean | null;
  created_at: DateTimeString;
};

export type ShiftPhoto = {
  id: UUID;
  company_id: UUID;
  shift_id: UUID;
  photo_type: ShiftPhotoType;
  storage_bucket: "shift-photos";
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  compressed: boolean;
  uploaded_by: UUID;
  uploaded_at: DateTimeString;
  expires_at: DateTimeString;
  deleted_at: DateTimeString | null;
};

export type ShiftSignatureArtifact = {
  shift_id: UUID;
  company_id: UUID;
  courier_profile_id: UUID;
  storage_bucket: "generated-pdfs";
  signature_url: string;
  signature_storage_key: string;
  signed_at: DateTimeString;
  signed_by_profile_id: UUID;
  signed_by_name: string;
  mime_type: "image/svg+xml";
  size_bytes: number;
  uploaded_at: DateTimeString;
};

export type Document = {
  id: UUID;
  company_id: UUID;
  courier_profile_id: UUID | null;
  uploaded_by: UUID;
  document_type: DocumentType;
  title: string;
  storage_bucket: "payslips" | "courier-documents" | "generated-pdfs";
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  created_at: DateTimeString;
};

export type MailboxItem = {
  id: UUID;
  company_id: UUID;
  courier_profile_id: UUID;
  document_id: UUID | null;
  title: string;
  message: string | null;
  category: MailboxCategory;
  read_at: DateTimeString | null;
  created_by: UUID;
  created_at: DateTimeString;
};

export type AuditLog = {
  id: UUID;
  company_id: UUID;
  actor_profile_id: UUID;
  target_table: string;
  target_id: UUID;
  action: string;
  before: JsonObject | null;
  after: JsonObject | null;
  reason: string | null;
  created_at: DateTimeString;
};
