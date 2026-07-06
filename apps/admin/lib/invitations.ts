import type { Depot, Invitation, InvitationRole, InvitationStatus, Profile } from "@routeforge/shared";

export type AdminInvitationTone =
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "neutral";

export type AdminInvitationListItem = Invitation & {
  roleLabel: string;
  depotName: string;
  statusLabel: string;
  statusTone: AdminInvitationTone;
  createdByName: string;
  createdAtLabel: string;
  expiresAtLabel: string;
  usedAtLabel: string;
  deliveryLabel: string;
  registrationLabel: string;
};

export type AdminInvitationFilterGroup = {
  label: string;
  value: string;
};

export type AdminInvitationDepotOption = {
  label: string;
  value: string;
};

export type AdminInvitationDraft = {
  email: string;
  role: InvitationRole;
  roleLabel: string;
  depotName: string;
  expiresAtLabel: string;
  inviteCodePreview: string;
  validityLabel: string;
  deliveryMessage: string;
  fields: Array<{
    label: string;
    value: string;
  }>;
  visibilityRows: Array<{
    label: string;
    value: string;
    tone: AdminInvitationTone;
  }>;
  checklist: Array<{
    label: string;
    done: boolean;
  }>;
  auditReminder: string;
};

export const adminInvitationFilterGroups: AdminInvitationFilterGroup[] = [
  { label: "Rolle", value: "Alle Rollen" },
  { label: "Depot", value: "Alle Depots" },
  { label: "Status", value: "Alle Status" },
];

export const adminInvitationDraft: AdminInvitationDraft = {
  auditReminder:
    "Reale Einladungserstellung und Widerruf werden company-scoped, serverseitig permission-geprueft und auditierbar gespeichert.",
  checklist: [],
  deliveryMessage:
    "Der Code wird gespeichert und kann dem Kurier weitergegeben werden. E-Mail-Versand wird spaeter automatisiert.",
  depotName: "Depot spaeter zuweisen",
  email: "",
  expiresAtLabel: "",
  fields: [],
  inviteCodePreview: "Wird beim Speichern erzeugt",
  role: "courier",
  roleLabel: "Kurier",
  validityLabel: "Standard: 7 Tage gueltig",
  visibilityRows: [],
};

const blockedInvitationStatuses: InvitationStatus[] = ["expired", "revoked"];

export function buildDepotOptions(depots: Pick<Depot, "id" | "name">[]) {
  return depots.map((depot) => ({
    label: depot.name,
    value: depot.id,
  }));
}

export function formatAdminInvitationListItem({
  creator,
  depot,
  invitation,
}: {
  creator: Pick<Profile, "full_name"> | null;
  depot: Pick<Depot, "name"> | null;
  invitation: Invitation;
}): AdminInvitationListItem {
  const status = getEffectiveInvitationStatus(invitation);

  return {
    ...invitation,
    status,
    createdAtLabel: formatDateTime(invitation.created_at),
    createdByName: creator?.full_name ?? "Unbekannt",
    deliveryLabel: getDeliveryLabel(status),
    depotName: depot?.name ?? "Depot spaeter zuweisen",
    expiresAtLabel: formatDateTime(invitation.expires_at),
    registrationLabel: getRegistrationLabel(invitation.role, status),
    roleLabel: invitation.role === "courier" ? "Kurier" : "Dispatcher",
    statusLabel: getStatusLabel(status),
    statusTone: getStatusTone(status),
    usedAtLabel: invitation.used_at ? formatDateTime(invitation.used_at) : "-",
  };
}

export function getInvitationSummary(invitations: AdminInvitationListItem[]) {
  return {
    active: invitations.filter((invitation) => invitation.status === "active").length,
    blocked: invitations.filter((invitation) =>
      blockedInvitationStatuses.includes(invitation.status),
    ).length,
    total: invitations.length,
    used: invitations.filter((invitation) => invitation.status === "used").length,
  };
}

export function getDefaultExpiryInput(): string {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(18, 0, 0, 0);

  return toDatetimeLocalInput(nextWeek);
}

export function getDateFromInput(value: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date();
  }

  return date;
}

export function formatDateTime(dateValue: string | Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateValue));
}

function getEffectiveInvitationStatus(invitation: Invitation): InvitationStatus {
  if (
    invitation.status === "active" &&
    new Date(invitation.expires_at).getTime() <= Date.now()
  ) {
    return "expired";
  }

  return invitation.status;
}

function getStatusLabel(status: InvitationStatus): string {
  if (status === "active") {
    return "Aktiv";
  }

  if (status === "used") {
    return "Verwendet";
  }

  if (status === "revoked") {
    return "Widerrufen";
  }

  return "Abgelaufen";
}

function getStatusTone(status: InvitationStatus): AdminInvitationTone {
  if (status === "active") {
    return "success";
  }

  if (status === "used") {
    return "neutral";
  }

  if (status === "revoked") {
    return "error";
  }

  return "warning";
}

function getDeliveryLabel(status: InvitationStatus): string {
  if (status === "active") {
    return "Code aktiv";
  }

  if (status === "used") {
    return "E-Mail angenommen";
  }

  if (status === "revoked") {
    return "Widerrufen";
  }

  return "Nicht genutzt";
}

function getRegistrationLabel(role: InvitationRole, status: InvitationStatus): string {
  if (status === "used") {
    return role === "courier" ? "Profil wartet auf Freigabe" : "Zugang erstellt";
  }

  if (status === "active") {
    return role === "courier" ? "Wartet auf Registrierung" : "Zugang noch offen";
  }

  return "Registrierung gesperrt";
}

function toDatetimeLocalInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
