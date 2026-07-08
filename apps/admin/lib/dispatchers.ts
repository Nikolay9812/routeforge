import type {
  Depot,
  Profile,
  ProfileDepotAccess,
  ProfileStatus,
} from "@routeforge/shared";

export type AdminDispatcherTone =
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "neutral";

export type AdminDispatcherDepotAccess = {
  depotId: string;
  depotCode: string;
  depotName: string;
  accessLabel: string;
  tone: AdminDispatcherTone;
};

export type AdminDispatcherPermission = {
  label: string;
  enabled: boolean;
};

export type AdminDispatcherListItem = {
  id: string;
  companyId: string;
  profileId: string;
  initials: string;
  fullName: string;
  email: string;
  phone: string;
  status: ProfileStatus;
  statusLabel: string;
  statusTone: AdminDispatcherTone;
  depotAccess: AdminDispatcherDepotAccess[];
  depotSummaryLabel: string;
  permissionSummaryLabel: string;
  permissions: AdminDispatcherPermission[];
  lastActivityLabel: string;
  inviteLabel: string;
};

export type AdminDispatcherDepotOption = {
  id: string;
  code: string;
  name: string;
  city: string;
};

export type AdminDispatcherFilterGroup = {
  label: string;
  value: string;
};

export type AdminDispatcherSummary = {
  active: number;
  pending: number;
  scopedDepots: number;
  total: number;
};

export const adminDispatcherFilterGroups: AdminDispatcherFilterGroup[] = [
  { label: "Depot-Zugriff", value: "Alle Depots" },
  { label: "Status", value: "Alle Status" },
  { label: "Berechtigung", value: "Alle Berechtigungen" },
];

export const dispatcherDepotAccessAuditReminder =
  "Aenderungen am Depot-Zugriff werden serverseitig in audit_logs dokumentiert.";

export function formatAdminDispatcherListItem({
  accessRows,
  depotsById,
  profile,
}: {
  accessRows: ProfileDepotAccess[];
  depotsById: Map<string, Depot>;
  profile: Profile;
}): AdminDispatcherListItem {
  const depotAccess = accessRows
    .map((access) => {
      const depot = depotsById.get(access.depot_id);

      if (!depot) {
        return null;
      }

      return {
        accessLabel: getAccessLabel(profile.status),
        depotCode: depot.code,
        depotId: depot.id,
        depotName: depot.name,
        tone: getAccessTone(profile.status),
      } satisfies AdminDispatcherDepotAccess;
    })
    .filter((access): access is AdminDispatcherDepotAccess => access != null);

  return {
    companyId: profile.company_id,
    depotAccess,
    depotSummaryLabel: getDepotSummaryLabel(profile.status, depotAccess.length),
    email: profile.email,
    fullName: profile.full_name,
    id: profile.id,
    initials: buildInitials(profile.full_name),
    inviteLabel: getInviteLabel(profile.status),
    lastActivityLabel: formatDateTime(profile.updated_at),
    permissionSummaryLabel: getPermissionSummaryLabel(profile.status),
    permissions: getDispatcherPermissions(profile.status),
    phone: profile.phone ?? "-",
    profileId: profile.id,
    status: profile.status,
    statusLabel: getStatusLabel(profile.status),
    statusTone: getStatusTone(profile.status),
  };
}

export function formatAdminDispatcherDepotOption(
  depot: Depot,
): AdminDispatcherDepotOption {
  return {
    city: depot.city,
    code: depot.code,
    id: depot.id,
    name: depot.name,
  };
}

export function getAdminDispatcherSummary(
  dispatchers: AdminDispatcherListItem[],
): AdminDispatcherSummary {
  return {
    active: dispatchers.filter((dispatcher) => dispatcher.status === "active")
      .length,
    pending: dispatchers.filter(
      (dispatcher) => dispatcher.status === "pending_approval",
    ).length,
    scopedDepots: new Set(
      dispatchers.flatMap((dispatcher) =>
        dispatcher.depotAccess.map((depot) => depot.depotId),
      ),
    ).size,
    total: dispatchers.length,
  };
}

function buildInitials(name: string): string {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "RF";
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getAccessLabel(status: ProfileStatus): string {
  if (status === "pending_approval") {
    return "Geplant";
  }

  if (status === "inactive" || status === "suspended") {
    return "Pausiert";
  }

  return "Vollzugriff";
}

function getAccessTone(status: ProfileStatus): AdminDispatcherTone {
  if (status === "pending_approval") {
    return "warning";
  }

  if (status === "inactive" || status === "suspended") {
    return "neutral";
  }

  return "success";
}

function getDepotSummaryLabel(
  status: ProfileStatus,
  selectedDepotCount: number,
): string {
  if (selectedDepotCount === 0) {
    return "Kein Depot";
  }

  if (status === "pending_approval") {
    return selectedDepotCount === 1
      ? "1 geplant"
      : `${selectedDepotCount} geplant`;
  }

  if (status === "inactive" || status === "suspended") {
    return selectedDepotCount === 1
      ? "1 pausiert"
      : `${selectedDepotCount} pausiert`;
  }

  return selectedDepotCount === 1 ? "1 Depot" : `${selectedDepotCount} Depots`;
}

function getDispatcherPermissions(
  status: ProfileStatus,
): AdminDispatcherPermission[] {
  const enabled = status === "active";

  return [
    { enabled, label: "Schichten einsehen" },
    { enabled, label: "Kuriere einsehen" },
    { enabled: false, label: "Dokumente spaeter" },
    { enabled: false, label: "Exporte spaeter" },
  ];
}

function getInviteLabel(status: ProfileStatus): string {
  if (status === "pending_approval") {
    return "Ausstehend";
  }

  if (status === "active") {
    return "Beigetreten";
  }

  return "Eingeschraenkt";
}

function getPermissionSummaryLabel(status: ProfileStatus): string {
  if (status === "active") {
    return "Depot-Scope aktiv";
  }

  if (status === "pending_approval") {
    return "Noch nicht aktiv";
  }

  return "Keine aktiven Rechte";
}

function getStatusLabel(status: ProfileStatus): string {
  if (status === "active") {
    return "Aktiv";
  }

  if (status === "pending_approval") {
    return "Wartet auf Freigabe";
  }

  if (status === "suspended") {
    return "Gesperrt";
  }

  return "Inaktiv";
}

function getStatusTone(status: ProfileStatus): AdminDispatcherTone {
  if (status === "active") {
    return "success";
  }

  if (status === "pending_approval") {
    return "warning";
  }

  if (status === "suspended") {
    return "error";
  }

  return "neutral";
}
