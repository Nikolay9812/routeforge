import "server-only";

import type {
  AuditLog,
  Depot,
  Profile,
  Shift,
  ShiftLocation,
  ShiftStatus,
} from "@routeforge/shared";

import type { AdminAuthSession } from "@/lib/auth";
import {
  adminDashboardQuickActions,
  formatDashboardDateTime,
  formatDashboardMinutes,
  formatDashboardTime,
  type AdminDashboardActivity,
  type AdminDashboardCourier,
  type AdminDashboardData,
  type AdminDashboardMetric,
  type AdminDashboardReviewShift,
  type AdminDashboardTone,
  type AdminDashboardWarning,
} from "@/lib/adminDashboard";
import { createRouteForgeServerClient } from "@/lib/insforge/server";

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
  payment_mode_snapshot,
  packages_delivered,
  packages_returned,
  packages_picked_up,
  status,
  submitted_at,
  created_at,
  updated_at
`;

const locationSelect = `
  id,
  company_id,
  shift_id,
  location_type,
  capture_status,
  missing_reason,
  latitude,
  longitude,
  accuracy_meters,
  depot_latitude_snapshot,
  depot_longitude_snapshot,
  distance_from_depot_meters,
  is_inside_depot_geofence,
  created_at
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

export async function loadAdminDashboardData(
  session: AdminAuthSession,
): Promise<AdminDashboardData> {
  const client = await createRouteForgeServerClient();
  const [{ data: profileRows }, { data: shiftRows }, { data: auditRows }] =
    await Promise.all([
      client.database
        .from("profiles")
        .select(profileSelect)
        .eq("company_id", session.profile.company_id)
        .eq("role", "courier"),
      client.database
        .from("shifts")
        .select(shiftSelect)
        .eq("company_id", session.profile.company_id)
        .order("shift_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(120),
      client.database
        .from("audit_logs")
        .select(auditSelect)
        .eq("company_id", session.profile.company_id)
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

  const profiles = (profileRows ?? []) as Profile[];
  const shifts = (shiftRows ?? []) as Shift[];
  const auditLogs = (auditRows ?? []) as AuditLog[];
  const depotIds = Array.from(new Set(shifts.map((shift) => shift.depot_id)));
  const profileIds = Array.from(
    new Set([
      ...shifts.map((shift) => shift.courier_profile_id),
      ...auditLogs.map((log) => log.actor_profile_id),
    ]),
  );
  const shiftIds = shifts.map((shift) => shift.id);

  const [{ data: depotRows }, { data: relatedProfileRows }, { data: locationRows }] =
    await Promise.all([
      depotIds.length
        ? client.database
            .from("depots")
            .select(depotSelect)
            .eq("company_id", session.profile.company_id)
            .in("id", depotIds)
        : Promise.resolve({ data: [] }),
      profileIds.length
        ? client.database
            .from("profiles")
            .select(profileSelect)
            .eq("company_id", session.profile.company_id)
            .in("id", profileIds)
        : Promise.resolve({ data: [] }),
      shiftIds.length
        ? client.database
            .from("shift_locations")
            .select(locationSelect)
            .eq("company_id", session.profile.company_id)
            .in("shift_id", shiftIds)
        : Promise.resolve({ data: [] }),
    ]);

  const depotsById = new Map(
    ((depotRows ?? []) as Depot[]).map((depot) => [depot.id, depot]),
  );
  const profilesById = new Map(
    [...profiles, ...((relatedProfileRows ?? []) as Profile[])].map((profile) => [
      profile.id,
      profile,
    ]),
  );
  const locations = (locationRows ?? []) as ShiftLocation[];

  return {
    activeCouriers: buildActiveCouriers({ depotsById, profilesById, shifts }),
    companyName: session.company.name,
    geofenceWarnings: buildWarnings({
      depotsById,
      locations,
      profilesById,
      shifts,
    }),
    metrics: buildMetrics({ locations, profiles, shifts }),
    quickActions: adminDashboardQuickActions,
    recentActivity: buildRecentActivity({ auditLogs, profilesById }),
    reviewShifts: buildReviewShifts({ depotsById, profilesById, shifts }),
    todayLabel: new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date()),
  };
}

function buildMetrics({
  locations,
  profiles,
  shifts,
}: {
  locations: ShiftLocation[];
  profiles: Profile[];
  shifts: Shift[];
}): AdminDashboardMetric[] {
  const reviewCount = shifts.filter((shift) =>
    ["submitted", "under_review"].includes(shift.status),
  ).length;
  const warningCount = locations.filter(isLocationWarning).length;
  const approvedBillableMinutes = shifts
    .filter((shift) => shift.status === "approved")
    .reduce((total, shift) => total + shift.billable_minutes, 0);

  return [
    {
      detail: "Genehmigte Schichten",
      helper: "Aus den letzten geladenen Schichten",
      label: "Abrechenbare Zeit",
      tone: "primary",
      value: formatDashboardMinutes(approvedBillableMinutes),
    },
    {
      detail: "Status active",
      helper: "Aktive Kurierprofile",
      label: "Aktive Kuriere",
      tone: "success",
      value: String(profiles.filter((profile) => profile.status === "active").length),
    },
    {
      detail: "Submitted/Under review",
      helper: "Warten auf Pruefung",
      label: "Offene Schichten",
      tone: reviewCount > 0 ? "warning" : "success",
      value: String(reviewCount),
    },
    {
      detail: "Start/Stop GPS",
      helper: "Ausserhalb Depot oder Standort fehlt",
      label: "Depot-Warnungen",
      tone: warningCount > 0 ? "error" : "success",
      value: String(warningCount),
    },
  ];
}

function buildActiveCouriers({
  depotsById,
  profilesById,
  shifts,
}: {
  depotsById: Map<string, Depot>;
  profilesById: Map<string, Profile>;
  shifts: Shift[];
}): AdminDashboardCourier[] {
  return shifts
    .filter((shift) =>
      ["draft", "submitted", "under_review"].includes(shift.status),
    )
    .slice(0, 5)
    .map((shift) => {
      const courier = profilesById.get(shift.courier_profile_id);
      const depot = depotsById.get(shift.depot_id);

      return {
        billableTime: formatDashboardMinutes(shift.billable_minutes),
        depot: depot?.name ?? "Depot offen",
        id: shift.id,
        name: courier?.full_name ?? "Unbekannter Kurier",
        packages: `${shift.packages_delivered} geliefert`,
        shiftWindow: `${formatDashboardTime(shift.start_time)} - ${formatDashboardTime(
          shift.end_time,
        )}`,
        statusLabel: getShiftStatusLabel(shift.status),
        statusTone: getShiftStatusTone(shift.status),
      };
    });
}

function buildReviewShifts({
  depotsById,
  profilesById,
  shifts,
}: {
  depotsById: Map<string, Depot>;
  profilesById: Map<string, Profile>;
  shifts: Shift[];
}): AdminDashboardReviewShift[] {
  return shifts
    .filter((shift) => ["submitted", "under_review"].includes(shift.status))
    .slice(0, 5)
    .map((shift) => ({
      billableTime: formatDashboardMinutes(shift.billable_minutes),
      courier:
        profilesById.get(shift.courier_profile_id)?.full_name ??
        "Unbekannter Kurier",
      depot: depotsById.get(shift.depot_id)?.name ?? "Depot offen",
      href: `/admin/shifts/${shift.id}`,
      id: shift.id,
      paymentMode:
        shift.payment_mode_snapshot === "hourly" ? "Stundenlohn" : "Tagespauschale",
      statusLabel: getShiftStatusLabel(shift.status),
      statusTone: getShiftStatusTone(shift.status),
      submittedAt: formatDashboardDateTime(shift.submitted_at),
    }));
}

function buildWarnings({
  depotsById,
  locations,
  profilesById,
  shifts,
}: {
  depotsById: Map<string, Depot>;
  locations: ShiftLocation[];
  profilesById: Map<string, Profile>;
  shifts: Shift[];
}): AdminDashboardWarning[] {
  const shiftById = new Map(shifts.map((shift) => [shift.id, shift]));

  return locations
    .filter(isLocationWarning)
    .sort((left, right) => right.created_at.localeCompare(left.created_at))
    .slice(0, 5)
    .map((location) => {
      const shift = shiftById.get(location.shift_id);
      const distance = location.distance_from_depot_meters;

      return {
        checkpoint: location.location_type === "start" ? "Schichtstart" : "Schichtende",
        courier: shift
          ? profilesById.get(shift.courier_profile_id)?.full_name ??
            "Unbekannter Kurier"
          : "Unbekannter Kurier",
        depot: shift ? depotsById.get(shift.depot_id)?.name ?? "Depot offen" : "-",
        distance:
          typeof distance === "number"
            ? `${Math.round(distance)} m ausserhalb`
            : "Standort fehlt",
        id: location.id,
        severityLabel: location.is_inside_depot_geofence === false ? "Warnung" : "Fehlt",
        severityTone: location.is_inside_depot_geofence === false ? "error" : "warning",
        time: formatDashboardDateTime(location.created_at),
      };
    });
}

function buildRecentActivity({
  auditLogs,
  profilesById,
}: {
  auditLogs: AuditLog[];
  profilesById: Map<string, Profile>;
}): AdminDashboardActivity[] {
  return auditLogs.map((log) => ({
    description: `${profilesById.get(log.actor_profile_id)?.full_name ?? "Admin"} - ${
      log.target_table
    }`,
    id: log.id,
    time: formatDashboardDateTime(log.created_at),
    title: getActionLabel(log.action),
    tone: getActionTone(log.action),
  }));
}

function isLocationWarning(location: ShiftLocation): boolean {
  return (
    location.is_inside_depot_geofence === false ||
    location.capture_status === "missing"
  );
}

function getShiftStatusLabel(status: ShiftStatus): string {
  const labels: Record<ShiftStatus, string> = {
    approved: "Genehmigt",
    corrected: "Korrigiert",
    draft: "Entwurf",
    rejected: "Abgelehnt",
    submitted: "Eingereicht",
    under_review: "In Pruefung",
  };

  return labels[status];
}

function getShiftStatusTone(status: ShiftStatus): AdminDashboardTone {
  const tones: Record<ShiftStatus, AdminDashboardTone> = {
    approved: "success",
    corrected: "primary",
    draft: "neutral",
    rejected: "error",
    submitted: "info",
    under_review: "warning",
  };

  return tones[status];
}

function getActionLabel(action: string): string {
  return action
    .split("_")
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function getActionTone(action: string): AdminDashboardTone {
  if (action.includes("reject") || action.includes("revoked")) {
    return "error";
  }

  if (action.includes("approve") || action.includes("upload")) {
    return "success";
  }

  if (action.includes("override") || action.includes("correction")) {
    return "warning";
  }

  return "primary";
}
