import "server-only";

import type { AdminAuthSession } from "@/lib/auth";
import type {
  AdminShellNotificationItem,
  AdminShellNotifications,
  AdminShellSearchItem,
} from "@/lib/adminShell";
import { createRouteForgeServerClient } from "@/lib/insforge/server";
import type { TranslationCatalog } from "@routeforge/shared";

export async function loadAdminShellSearchItems(
  session: AdminAuthSession,
  translation: TranslationCatalog,
): Promise<AdminShellSearchItem[]> {
  const client = await createRouteForgeServerClient();
  const [{ data: courierRows }, { data: depotRows }, { data: shiftRows }] =
    await Promise.all([
      client.database
        .from("profiles")
        .select("id,full_name,email,phone,status")
        .eq("company_id", session.profile.company_id)
        .eq("role", "courier")
        .order("full_name", { ascending: true })
        .limit(80),
      client.database
        .from("depots")
        .select("id,name,code,city,is_active")
        .eq("company_id", session.profile.company_id)
        .order("name", { ascending: true })
        .limit(40),
      client.database
        .from("shifts")
        .select("id,shift_date,status,courier_profile_id,depot_id,start_time,end_time")
        .eq("company_id", session.profile.company_id)
        .order("shift_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(120),
    ]);
  const couriers = (courierRows ?? []) as ShellSearchCourierRow[];
  const depots = (depotRows ?? []) as ShellSearchDepotRow[];
  const shifts = (shiftRows ?? []) as ShellSearchShiftRow[];
  const courierIds = Array.from(
    new Set(shifts.map((shift) => shift.courier_profile_id)),
  );
  const depotIds = Array.from(new Set(shifts.map((shift) => shift.depot_id)));
  const [{ data: shiftCourierRows }, { data: shiftDepotRows }] = await Promise.all([
    courierIds.length
      ? client.database
          .from("profiles")
          .select("id,full_name")
          .eq("company_id", session.profile.company_id)
          .in("id", courierIds)
      : Promise.resolve({ data: [] }),
    depotIds.length
      ? client.database
          .from("depots")
          .select("id,name,code")
          .eq("company_id", session.profile.company_id)
          .in("id", depotIds)
      : Promise.resolve({ data: [] }),
  ]);
  const courierNamesById = new Map(
    (
      (shiftCourierRows ?? []) as Array<{
        full_name: string;
        id: string;
      }>
    ).map((courier) => [courier.id, courier.full_name]),
  );
  const depotLabelsById = new Map(
    (
      (shiftDepotRows ?? []) as Array<{
        code: string;
        id: string;
        name: string;
      }>
    ).map((depot) => [depot.id, `${depot.name} (${depot.code})`]),
  );
  const courierItems = couriers.map(
    (courier) =>
      ({
        description: `${courier.email} - ${
          courier.phone ?? translation.adminShell.searchMeta.phoneMissing
        }`,
        href: `/admin/couriers/${courier.id}`,
        id: `courier-${courier.id}`,
        keywords: [
          courier.full_name,
          courier.email,
          courier.phone ?? "",
          courier.status,
          "kurier",
        ].join(" "),
        label: courier.full_name,
        meta: getShellCourierStatusLabel(courier.status, translation),
        tone: courier.status === "active" ? "success" : "warning",
        type: "courier",
      }) satisfies AdminShellSearchItem,
  );
  const depotItems = depots.map(
    (depot) =>
      ({
        description: `${depot.code} - ${depot.city}`,
        href: "/admin/depots",
        id: `depot-${depot.id}`,
        keywords: [depot.name, depot.code, depot.city, "depot"].join(" "),
        label: depot.name,
        meta: depot.is_active
          ? translation.adminShell.status.active
          : translation.adminShell.status.inactive,
        tone: depot.is_active ? "info" : "neutral",
        type: "depot",
      }) satisfies AdminShellSearchItem,
  );
  const shiftItems = shifts.map((shift) => {
    const courierName =
      courierNamesById.get(shift.courier_profile_id) ??
      translation.adminShell.searchMeta.unknownCourier;
    const depotLabel =
      depotLabelsById.get(shift.depot_id) ??
      translation.adminShell.searchMeta.depotMissing;

    return {
      description: `${courierName} - ${depotLabel}`,
      href: `/admin/shifts/${shift.id}`,
      id: `shift-${shift.id}`,
      keywords: [
        shift.id,
        shift.shift_date,
        shift.status,
        courierName,
        depotLabel,
        "schicht",
      ].join(" "),
      label: `Schicht ${formatShellSearchDate(shift.shift_date)}`,
      meta: getShellShiftStatusLabel(shift.status, translation),
      tone: getShellShiftSearchTone(shift.status),
      type: "shift",
    } satisfies AdminShellSearchItem;
  });

  return [...courierItems, ...shiftItems, ...depotItems];
}

export async function loadAdminShellNotifications(
  session: AdminAuthSession,
  translation: TranslationCatalog,
): Promise<AdminShellNotifications> {
  const client = await createRouteForgeServerClient();
  const [{ data: shiftRows }, { data: courierRows }] = await Promise.all([
    client.database
      .from("shifts")
      .select("id,status,submitted_at,courier_profile_id")
      .eq("company_id", session.profile.company_id)
      .in("status", ["submitted", "under_review"])
      .order("submitted_at", { ascending: false }),
    client.database
      .from("profiles")
      .select("id,full_name,created_at")
      .eq("company_id", session.profile.company_id)
      .eq("role", "courier")
      .eq("status", "pending_approval")
      .order("created_at", { ascending: false }),
  ]);
  const shifts = (shiftRows ?? []) as ShiftNotificationRow[];
  const courierApprovalRows = (courierRows ?? []) as CourierNotificationRow[];
  const shiftCourierIds = Array.from(
    new Set(shifts.map((shift) => shift.courier_profile_id)),
  );
  const { data: shiftCourierRows } = shiftCourierIds.length
    ? await client.database
        .from("profiles")
        .select("id,full_name")
        .eq("company_id", session.profile.company_id)
        .in("id", shiftCourierIds)
    : { data: [] };
  const shiftCouriersById = new Map(
    ((shiftCourierRows ?? []) as Array<{ full_name: string; id: string }>).map(
      (profile) => [profile.id, profile.full_name],
    ),
  );
  const shiftItems = shifts.map(
    (shift) =>
      ({
        description:
          shift.status === "under_review"
            ? `${shiftCouriersById.get(shift.courier_profile_id) ?? translation.adminShell.resultTypes.courier} ${translation.adminShell.notificationDescriptions.shiftUnderReview}`
            : `${shiftCouriersById.get(shift.courier_profile_id) ?? translation.adminShell.resultTypes.courier} - ${formatShellTaskTime(
                shift.submitted_at,
                translation,
              )}`,
        href: `/admin/shifts/${shift.id}`,
        id: `shift-${shift.id}`,
        label: translation.adminShell.notificationActions.shiftReview,
        tone: shift.status === "under_review" ? "warning" : "info",
        type: "shift_review",
      }) satisfies AdminShellNotificationItem,
  );
  const courierItems = courierApprovalRows.map(
    (courier) =>
      ({
        description: `${courier.full_name} ${translation.adminShell.notificationDescriptions.courierApproval}`,
        href: `/admin/couriers/${courier.id}`,
        id: `courier-${courier.id}`,
        label: translation.adminShell.notificationActions.courierApproval,
        tone: "primary",
        type: "courier_approval",
      }) satisfies AdminShellNotificationItem,
  );
  const items = [...shiftItems, ...courierItems].slice(0, 8);

  return {
    items,
    label: translation.adminShell.notificationsLabel,
    pendingCount: shifts.length + courierApprovalRows.length,
  };
}

type ShiftNotificationRow = {
  courier_profile_id: string;
  id: string;
  status: "submitted" | "under_review";
  submitted_at: string | null;
};

type CourierNotificationRow = {
  created_at: string;
  full_name: string;
  id: string;
};

function formatShellTaskTime(
  value: string | null,
  translation: TranslationCatalog,
): string {
  if (!value) {
    return translation.adminShell.notificationDescriptions.missingTimestamp;
  }

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

type ShellSearchCourierRow = {
  email: string;
  full_name: string;
  id: string;
  phone: string | null;
  status: "active" | "inactive" | "pending_approval" | "suspended";
};

type ShellSearchDepotRow = {
  city: string;
  code: string;
  id: string;
  is_active: boolean;
  name: string;
};

type ShellSearchShiftRow = {
  courier_profile_id: string;
  depot_id: string;
  end_time: string | null;
  id: string;
  shift_date: string;
  start_time: string;
  status: "approved" | "corrected" | "draft" | "rejected" | "submitted" | "under_review";
};

function formatShellSearchDate(value: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function getShellCourierStatusLabel(
  status: ShellSearchCourierRow["status"],
  translation: TranslationCatalog,
): string {
  const labels: Record<ShellSearchCourierRow["status"], string> = {
    active: translation.adminShell.status.active,
    inactive: translation.adminShell.status.inactive,
    pending_approval: translation.adminShell.status.pendingApproval,
    suspended: translation.adminShell.status.suspended,
  };

  return labels[status];
}

function getShellShiftStatusLabel(
  status: ShellSearchShiftRow["status"],
  translation: TranslationCatalog,
): string {
  const labels: Record<ShellSearchShiftRow["status"], string> = {
    approved: translation.adminShell.status.approved,
    corrected: translation.adminShell.status.corrected,
    draft: translation.adminShell.status.draft,
    rejected: translation.adminShell.status.rejected,
    submitted: translation.adminShell.status.submitted,
    under_review: translation.adminShell.status.underReview,
  };

  return labels[status];
}

function getShellShiftSearchTone(
  status: ShellSearchShiftRow["status"],
): AdminShellSearchItem["tone"] {
  if (status === "approved") {
    return "success";
  }

  if (status === "submitted" || status === "under_review") {
    return "warning";
  }

  if (status === "draft") {
    return "neutral";
  }

  return "primary";
}
