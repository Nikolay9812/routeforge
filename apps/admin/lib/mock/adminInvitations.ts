import type { Invitation, InvitationRole, InvitationStatus } from "@routeforge/shared";

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

export const adminInvitationListItems: AdminInvitationListItem[] = [
  {
    id: "INV-2026-0704-001",
    company_id: "company-ivt",
    email: "elena.dimitrova@example.com",
    role: "courier",
    invite_code: "RF-7K2M-91Q",
    depot_id: "DEP-MA-N",
    status: "active",
    expires_at: "2026-07-11T18:00:00.000Z",
    used_at: null,
    used_by: null,
    created_by: "ADM-10001",
    created_at: "2026-07-04T09:18:00.000Z",
    roleLabel: "Kurier",
    depotName: "Mannheim Nord",
    statusLabel: "Aktiv",
    statusTone: "success",
    createdByName: "Nikolay Ivanov",
    createdAtLabel: "04.07.2026, 09:18",
    expiresAtLabel: "11.07.2026, 18:00",
    usedAtLabel: "-",
    deliveryLabel: "E-Mail vorbereitet",
    registrationLabel: "Wartet auf Registrierung",
  },
  {
    id: "INV-2026-0703-014",
    company_id: "company-ivt",
    email: "martin.fischer@example.com",
    role: "dispatcher",
    invite_code: "RF-2DPX-58A",
    depot_id: "DEP-MA-S",
    status: "active",
    expires_at: "2026-07-10T16:30:00.000Z",
    used_at: null,
    used_by: null,
    created_by: "ADM-10001",
    created_at: "2026-07-03T16:30:00.000Z",
    roleLabel: "Dispatcher",
    depotName: "Mannheim Sued",
    statusLabel: "Aktiv",
    statusTone: "success",
    createdByName: "Nikolay Ivanov",
    createdAtLabel: "03.07.2026, 16:30",
    expiresAtLabel: "10.07.2026, 16:30",
    usedAtLabel: "-",
    deliveryLabel: "E-Mail gesendet",
    registrationLabel: "Zugang noch offen",
  },
  {
    id: "INV-2026-0701-006",
    company_id: "company-ivt",
    email: "todor.petrov@example.com",
    role: "courier",
    invite_code: "RF-6JRA-30P",
    depot_id: "DEP-MA-N",
    status: "used",
    expires_at: "2026-07-08T11:45:00.000Z",
    used_at: "2026-07-02T08:05:00.000Z",
    used_by: "KUR-10483",
    created_by: "DSP-20014",
    created_at: "2026-07-01T11:45:00.000Z",
    roleLabel: "Kurier",
    depotName: "Mannheim Nord",
    statusLabel: "Verwendet",
    statusTone: "neutral",
    createdByName: "Anna Mueller",
    createdAtLabel: "01.07.2026, 11:45",
    expiresAtLabel: "08.07.2026, 11:45",
    usedAtLabel: "02.07.2026, 08:05",
    deliveryLabel: "E-Mail angenommen",
    registrationLabel: "Profil wartet auf Freigabe",
  },
  {
    id: "INV-2026-0628-019",
    company_id: "company-ivt",
    email: "lena.schulz@example.com",
    role: "courier",
    invite_code: "RF-9BZL-44T",
    depot_id: "DEP-HD",
    status: "expired",
    expires_at: "2026-07-03T17:00:00.000Z",
    used_at: null,
    used_by: null,
    created_by: "DSP-20027",
    created_at: "2026-06-28T17:00:00.000Z",
    roleLabel: "Kurier",
    depotName: "Heidelberg",
    statusLabel: "Abgelaufen",
    statusTone: "warning",
    createdByName: "Georg Keller",
    createdAtLabel: "28.06.2026, 17:00",
    expiresAtLabel: "03.07.2026, 17:00",
    usedAtLabel: "-",
    deliveryLabel: "Nicht genutzt",
    registrationLabel: "Registrierung gesperrt",
  },
  {
    id: "INV-2026-0626-003",
    company_id: "company-ivt",
    email: "ivan.rusev@example.com",
    role: "dispatcher",
    invite_code: "RF-4WQH-77N",
    depot_id: null,
    status: "revoked",
    expires_at: "2026-07-03T10:15:00.000Z",
    used_at: null,
    used_by: null,
    created_by: "ADM-10001",
    created_at: "2026-06-26T10:15:00.000Z",
    roleLabel: "Dispatcher",
    depotName: "Depot spaeter zuweisen",
    statusLabel: "Widerrufen",
    statusTone: "error",
    createdByName: "Nikolay Ivanov",
    createdAtLabel: "26.06.2026, 10:15",
    expiresAtLabel: "03.07.2026, 10:15",
    usedAtLabel: "-",
    deliveryLabel: "Widerrufen",
    registrationLabel: "Nicht mehr nutzbar",
  },
];

const blockedInvitationStatuses: InvitationStatus[] = ["expired", "revoked"];

export const adminInvitationSummary = {
  total: adminInvitationListItems.length,
  active: adminInvitationListItems.filter(
    (invitation) => invitation.status === "active",
  ).length,
  used: adminInvitationListItems.filter((invitation) => invitation.status === "used")
    .length,
  blocked: adminInvitationListItems.filter((invitation) =>
    blockedInvitationStatuses.includes(invitation.status),
  ).length,
};

export const adminInvitationDraft: AdminInvitationDraft = {
  email: "neuer.kurier@example.com",
  role: "courier",
  roleLabel: "Kurier",
  depotName: "Mannheim Nord",
  expiresAtLabel: "11.07.2026, 18:00",
  inviteCodePreview: "RF-8M4K-27X",
  validityLabel: "7 Tage gueltig",
  deliveryMessage:
    "Der Code wird spaeter per E-Mail versendet. In dieser UI-Phase wird keine Nachricht verschickt.",
  fields: [
    { label: "E-Mail", value: "neuer.kurier@example.com" },
    { label: "Rolle", value: "Kurier" },
    { label: "Depot optional", value: "Mannheim Nord" },
    { label: "Ablaufdatum", value: "11.07.2026, 18:00" },
  ],
  visibilityRows: [
    { label: "Mandant", value: "Ivanov Transport", tone: "primary" },
    { label: "Nutzung", value: "Einmalig", tone: "success" },
    { label: "Startstatus", value: "pending_approval", tone: "warning" },
  ],
  checklist: [
    { label: "E-Mail eingetragen", done: true },
    { label: "Rolle courier oder dispatcher", done: true },
    { label: "Depot optional gewaehlt", done: true },
    { label: "Ablaufdatum gesetzt", done: true },
  ],
  auditReminder:
    "Reale Einladungserstellung und Widerruf muessen spaeter company-scoped, permission-geprueft und auditierbar gespeichert werden.",
};
