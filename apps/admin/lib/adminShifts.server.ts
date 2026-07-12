import "server-only";

import type {
  AuditLog,
  Depot,
  Profile,
  Shift,
  ShiftLocation,
  ShiftPhoto,
  ShiftStatus,
} from "@routeforge/shared";

import { requireAdminSession } from "@/lib/auth";
import { createRouteForgeServerClient } from "@/lib/insforge/server";
import type {
  AdminShiftAuditItem,
  AdminShiftLocationCheckpoint,
  AdminShiftPhotoEvidence,
  AdminShiftReviewDetail,
} from "@/lib/mock/adminShiftDetails";
import type {
  AdminShiftGeofenceState,
  AdminShiftTone,
} from "@/lib/mock/adminShifts";

const shiftSelect = `
  id,
  company_id,
  depot_id,
  courier_profile_id,
  shift_date,
  start_time,
  end_time,
  gross_minutes,
  break_minutes,
  net_minutes,
  billable_minutes,
  billable_source,
  billable_override_reason,
  billable_override_by,
  billable_override_at,
  auto_stopped_at_max_hours,
  payment_mode_snapshot,
  tour_number,
  van_plate,
  start_km,
  end_km,
  packages_delivered,
  packages_returned,
  packages_picked_up,
  total_stops,
  courier_note,
  missing_proof_explanation,
  signature_url,
  signature_storage_key,
  signed_at,
  status,
  submitted_at,
  approved_at,
  approved_by,
  rejection_reason,
  created_at,
  updated_at
`;

const profileSelect = `
  id,
  auth_user_id,
  company_id,
  primary_depot_id,
  role,
  status,
  payment_mode,
  daily_fixed_minutes,
  hourly_max_minutes,
  preferred_language,
  full_name,
  email,
  phone,
  birth_date,
  address_line_1,
  postal_code,
  city,
  steuer_id,
  iban,
  id_card_document_url,
  driver_license_document_url,
  registration_document_url,
  bank_document_url,
  approved_at,
  approved_by,
  created_at,
  updated_at
`;

const depotSelect = `
  id,
  company_id,
  name,
  code,
  address_line_1,
  postal_code,
  city,
  country_code,
  latitude,
  longitude,
  geofence_radius_meters,
  is_active,
  created_at,
  updated_at
`;

const locationSelect = `
  id,
  company_id,
  shift_id,
  location_type,
  latitude,
  longitude,
  accuracy_meters,
  depot_latitude_snapshot,
  depot_longitude_snapshot,
  distance_from_depot_meters,
  is_inside_depot_geofence,
  created_at
`;

const photoSelect = `
  id,
  company_id,
  shift_id,
  photo_type,
  storage_bucket,
  storage_path,
  mime_type,
  size_bytes,
  compressed,
  uploaded_by,
  uploaded_at,
  expires_at,
  deleted_at
`;

const auditSelect = `
  id,
  company_id,
  actor_profile_id,
  target_table,
  target_id,
  action,
  before,
  after,
  reason,
  created_at
`;

export async function getAdminShiftReviewDetailFromBackend(
  shiftId: string,
): Promise<AdminShiftReviewDetail | null> {
  const session = await requireAdminSession();
  const client = await createRouteForgeServerClient();
  const { data: shiftData, error: shiftError } = await client.database
    .from("shifts")
    .select(shiftSelect)
    .eq("id", shiftId)
    .eq("company_id", session.profile.company_id)
    .maybeSingle();

  if (shiftError || !shiftData) {
    return null;
  }

  const shift = shiftData as Shift;
  const [{ data: courierData }, { data: depotData }, { data: locationsData }, { data: photosData }, { data: auditData }] =
    await Promise.all([
      client.database
        .from("profiles")
        .select(profileSelect)
        .eq("id", shift.courier_profile_id)
        .eq("company_id", shift.company_id)
        .maybeSingle(),
      client.database
        .from("depots")
        .select(depotSelect)
        .eq("id", shift.depot_id)
        .eq("company_id", shift.company_id)
        .maybeSingle(),
      client.database
        .from("shift_locations")
        .select(locationSelect)
        .eq("shift_id", shift.id)
        .eq("company_id", shift.company_id)
        .order("created_at", { ascending: true }),
      client.database
        .from("shift_photos")
        .select(photoSelect)
        .eq("shift_id", shift.id)
        .eq("company_id", shift.company_id)
        .order("uploaded_at", { ascending: true }),
      client.database
        .from("audit_logs")
        .select(auditSelect)
        .eq("target_table", "shifts")
        .eq("target_id", shift.id)
        .eq("company_id", shift.company_id)
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  const courier = courierData as Profile | null;
  const depot = depotData as Depot | null;
  const locations = (locationsData ?? []) as ShiftLocation[];
  const photos = (photosData ?? []) as ShiftPhoto[];
  const auditRows = (auditData ?? []) as AuditLog[];

  if (!courier || !depot) {
    return null;
  }

  return formatBackendShiftDetail({
    auditRows,
    courier,
    depot,
    locations,
    photos,
    shift,
  });
}

function formatBackendShiftDetail({
  auditRows,
  courier,
  depot,
  locations,
  photos,
  shift,
}: {
  auditRows: AuditLog[];
  courier: Profile;
  depot: Depot;
  locations: ShiftLocation[];
  photos: ShiftPhoto[];
  shift: Shift;
}): AdminShiftReviewDetail {
  const geofenceState = getGeofenceState(locations);
  const geofenceTone = getGeofenceTone(geofenceState);
  const locationCheckpoints = buildLocationCheckpoints(locations, depot);
  const geofenceWarnings = locationCheckpoints
    .filter((checkpoint) => checkpoint.tone !== "success")
    .map((checkpoint) => ({
      action: `${checkpoint.label} ${checkpoint.stateLabel}`,
      actor: "System",
      reason: checkpoint.distance,
      time: checkpoint.time,
    }));
  const statusTone = getStatusTone(shift.status);
  const startTime = formatTime(shift.start_time);
  const endTime = shift.end_time ? formatTime(shift.end_time) : "Offen";
  const billableTime = formatMinutes(shift.billable_minutes);
  const deliveredPackages = String(shift.packages_delivered);
  const returnedPackages = String(shift.packages_returned);
  const pickedUpPackages = String(shift.packages_picked_up);
  const totalStops = shift.total_stops == null ? "-" : String(shift.total_stops);

  return {
    adminNote:
      shift.rejection_reason ??
      shift.billable_override_reason ??
      "Backend-Schicht geladen. Bitte Zeiten, Nachweise und Geofence final pruefen.",
    auditTrail: buildAuditTrail(auditRows, shift),
    billableRuleLabel:
      shift.payment_mode_snapshot === "hourly"
        ? "Stundenlohn: reale Nettozeit bis maximal 10:00 h."
        : "Tagespauschale: Standardwert 08:20 h abrechenbar.",
    billableSourceLabel:
      shift.billable_source === "manual_override"
        ? "Manueller Override"
        : "Automatisch",
    billableTime,
    breakTime: formatMinutes(shift.break_minutes),
    courierCode: courier.email,
    courierName: courier.full_name,
    courierNote: shift.courier_note ?? "Keine besonderen Hinweise vom Kurier.",
    courierStatusLabel: getProfileStatusLabel(courier.status),
    dateLabel: formatDate(shift.shift_date),
    deliveredPackages,
    depotCode: depot.code,
    depotName: depot.name,
    deviation: "+00:00",
    drivenKm: `${Math.max(shift.end_km - shift.start_km, 0)} km`,
    endKm: String(shift.end_km),
    endTime,
    firstDelivery: startTime,
    geofenceDetail: getGeofenceDetail(geofenceState),
    geofenceLabel: getGeofenceLabel(geofenceState),
    geofenceState,
    geofenceTone,
    geofenceWarnings,
    grossTime: formatMinutes(shift.gross_minutes),
    href: `/admin/shifts/${shift.id}`,
    id: shift.id,
    initials: getInitials(courier.full_name),
    lastDelivery: endTime,
    locationCheckpoints,
    netTime: formatMinutes(shift.net_minutes),
    packageCounters: [
      { helper: "zugestellte Pakete", label: "Geliefert", value: deliveredPackages },
      { helper: "zurueckgefuehrt", label: "Retouren", value: returnedPackages },
      { helper: "beim Kunden", label: "Abholungen", value: pickedUpPackages },
      { helper: "gesamt", label: "Stopps", value: totalStops },
    ],
    packageSummary: `${deliveredPackages} geliefert - ${returnedPackages} Retouren`,
    paymentMode: shift.payment_mode_snapshot,
    paymentModeLabel:
      shift.payment_mode_snapshot === "hourly" ? "Stundenlohn" : "Tagespauschale",
    photoEvidence: buildPhotoEvidence(photos, shift.id),
    photoRetentionLabel:
      "Nachweise werden nach 14 Tagen aus shift-photos geloescht.",
    pickedUpPackages,
    plannedShift: `${startTime} - ${endTime}`,
    returnedPackages,
    routeCode: shift.tour_number ?? "Keine Tournummer",
    shiftDate: shift.shift_date,
    signatureLabel: shift.signed_at ? "Unterschrift vorhanden" : "Unterschrift fehlt",
    signaturePreviewUrl: shift.signed_at
      ? `/api/shifts/${shift.id}/evidence/signature`
      : null,
    signedAt: shift.signed_at ? formatDateTime(shift.signed_at) : "-",
    signedBy: courier.full_name,
    startKm: String(shift.start_km),
    startTime,
    status: shift.status,
    statusLabel: getShiftStatusLabel(shift.status),
    statusTone,
    submittedAt: shift.submitted_at ? formatDateTime(shift.submitted_at) : "-",
    timeMetrics: [
      { helper: "Tatsaechliche Zeiten", label: "Geplante Schicht", value: `${startTime} - ${endTime}` },
      { helper: "Start bis Stopp", label: "Bruttozeit", value: formatMinutes(shift.gross_minutes) },
      { helper: "gesetzlich beruecksichtigt", label: "Pausen", value: formatMinutes(shift.break_minutes) },
      { helper: "effektive Arbeitszeit", label: "Nettozeit", value: formatMinutes(shift.net_minutes) },
      {
        helper: shift.payment_mode_snapshot === "hourly" ? "Stundenlohn" : "Tagespauschale",
        label: "Abrechenbar",
        tone: "primary",
        value: billableTime,
      },
      { helper: "gegen Plan", label: "Abweichung", tone: geofenceTone, value: "+00:00" },
    ],
    totalStops,
    vehiclePlate: shift.van_plate || "-",
  };
}

function buildPhotoEvidence(
  photos: ShiftPhoto[],
  shiftId: string,
): AdminShiftPhotoEvidence[] {
  if (photos.length === 0) {
    return [
      {
        capturedAt: "-",
        description: "Keine Metadaten",
        label: "Nachweise",
        statusLabel: "Fehlt",
        statusTone: "warning",
        typeLabel: "shift_photos",
      },
    ];
  }

  return photos.map((photo) => ({
    capturedAt: formatDateTime(photo.uploaded_at),
    description: photo.deleted_at ? "Datei geloescht" : "komprimiertes Foto",
    label: getPhotoTypeLabel(photo.photo_type),
    previewUrl: photo.deleted_at
      ? null
      : `/api/shifts/${shiftId}/evidence/${photo.photo_type}`,
    statusLabel: photo.deleted_at ? "Geloescht" : "Vorhanden",
    statusTone: photo.deleted_at ? "neutral" : "success",
    typeLabel: photo.photo_type,
  }));
}

function buildLocationCheckpoints(
  locations: ShiftLocation[],
  depot: Depot,
): AdminShiftLocationCheckpoint[] {
  const checkpoints = ["start", "stop"].map((locationType) => {
    const location = locations.find((item) => item.location_type === locationType);

    if (!location) {
      return {
        accuracy: "Keine Genauigkeit",
        address: `${depot.name}, ${depot.city}`,
        distance: "Nicht gespeichert",
        label: locationType === "start" ? "Start" : "Stopp",
        stateLabel: "Standort fehlt",
        time: "-",
        tone: "warning" as AdminShiftTone,
      };
    }

    const inside = location.is_inside_depot_geofence;

    return {
      accuracy:
        location.accuracy_meters == null
          ? "Keine Genauigkeit"
          : `Genauigkeit ${Math.round(location.accuracy_meters)} m`,
      address: `${depot.name}, ${depot.city}`,
      distance:
        location.distance_from_depot_meters == null
          ? "Distanz nicht berechnet"
          : `${Math.round(location.distance_from_depot_meters)} m vom Depot`,
      label: locationType === "start" ? "Start" : "Stopp",
      stateLabel: inside ? "Im Depot" : "Ausserhalb",
      time: formatTime(location.created_at),
      tone: inside ? ("success" as AdminShiftTone) : ("error" as AdminShiftTone),
    };
  });

  return checkpoints;
}

function buildAuditTrail(auditRows: AuditLog[], shift: Shift): AdminShiftAuditItem[] {
  const rows = auditRows.map((row) => ({
    action: row.action,
    actor: row.actor_profile_id,
    reason: row.reason ?? undefined,
    time: formatDateTime(row.created_at),
  }));

  if (shift.submitted_at) {
    rows.push({
      action: "Bericht eingereicht",
      actor: shift.courier_profile_id,
      reason: undefined,
      time: formatDateTime(shift.submitted_at),
    });
  }

  return rows;
}

function getGeofenceState(locations: ShiftLocation[]): AdminShiftGeofenceState {
  if (
    locations.length < 2 ||
    locations.some((location) => location.is_inside_depot_geofence == null)
  ) {
    return "missing";
  }

  return locations.some((location) => location.is_inside_depot_geofence === false)
    ? "outside"
    : "inside";
}

function getGeofenceTone(state: AdminShiftGeofenceState): AdminShiftTone {
  if (state === "inside") {
    return "success";
  }

  return state === "outside" ? "error" : "warning";
}

function getGeofenceLabel(state: AdminShiftGeofenceState): string {
  if (state === "inside") {
    return "Im Depot";
  }

  return state === "outside" ? "Ausserhalb" : "Standort fehlt";
}

function getGeofenceDetail(state: AdminShiftGeofenceState): string {
  if (state === "inside") {
    return "Start und Stopp innerhalb Geofence";
  }

  return state === "outside"
    ? "Start oder Stopp ausserhalb Depot"
    : "Start oder Stopp fehlt";
}

function getStatusTone(status: ShiftStatus): AdminShiftTone {
  const toneMap: Record<ShiftStatus, AdminShiftTone> = {
    approved: "success",
    corrected: "primary",
    draft: "neutral",
    rejected: "error",
    submitted: "info",
    under_review: "warning",
  };

  return toneMap[status];
}

function getShiftStatusLabel(status: ShiftStatus): string {
  const labelMap: Record<ShiftStatus, string> = {
    approved: "Genehmigt",
    corrected: "Korrigiert",
    draft: "Entwurf",
    rejected: "Abgelehnt",
    submitted: "Eingereicht",
    under_review: "In Pruefung",
  };

  return labelMap[status];
}

function getProfileStatusLabel(status: Profile["status"]): string {
  return status === "active" ? "Aktiv" : "Nicht aktiv";
}

function getPhotoTypeLabel(type: ShiftPhoto["photo_type"]): string {
  const labelMap: Record<ShiftPhoto["photo_type"], string> = {
    end_km: "Ende KM",
    fahrtenbuch: "Fahrtenbuch",
    mentor: "Mentor",
    start_km: "Start KM",
  };

  return labelMap[type];
}

function getInitials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "RF"
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    weekday: "short",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMinutes(minutes: number): string {
  const safeMinutes = Math.max(Math.trunc(minutes), 0);
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
}
