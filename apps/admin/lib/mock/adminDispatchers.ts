import type { ProfileStatus } from "@routeforge/shared";

export type AdminDispatcherTone =
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "neutral";

export type AdminDispatcherDepotAccess = {
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

export type AdminDispatcherFilterGroup = {
  label: string;
  value: string;
};

export type AdminDispatcherAccessDraft = {
  dispatcherName: string;
  dispatcherId: string;
  editableDepots: Array<{
    depotCode: string;
    depotName: string;
    stateLabel: string;
    tone: AdminDispatcherTone;
  }>;
  auditReminder: string;
};

export const adminDispatcherFilterGroups: AdminDispatcherFilterGroup[] = [
  { label: "Depot-Zugriff", value: "Alle Depots" },
  { label: "Status", value: "Alle Status" },
  { label: "Berechtigung", value: "Alle Berechtigungen" },
];

export const adminDispatcherListItems: AdminDispatcherListItem[] = [
  {
    id: "DSP-20014",
    initials: "AM",
    fullName: "Anna Mueller",
    email: "anna.mueller@example.de",
    phone: "+49 621 200140",
    status: "active",
    statusLabel: "Aktiv",
    statusTone: "success",
    depotAccess: [
      {
        depotCode: "MA-N",
        depotName: "Mannheim Nord",
        accessLabel: "Vollzugriff",
        tone: "success",
      },
      {
        depotCode: "MA-S",
        depotName: "Mannheim Sued",
        accessLabel: "Vollzugriff",
        tone: "success",
      },
    ],
    depotSummaryLabel: "2 Depots",
    permissionSummaryLabel: "Schichten, Kuriere, Dokumente",
    permissions: [
      { label: "Schichten pruefen", enabled: true },
      { label: "Kuriere freigeben", enabled: true },
      { label: "Dokumente hochladen", enabled: true },
      { label: "Exporte erstellen", enabled: false },
    ],
    lastActivityLabel: "Heute, 08:42",
    inviteLabel: "Beigetreten",
  },
  {
    id: "DSP-20027",
    initials: "GK",
    fullName: "Georg Keller",
    email: "georg.keller@example.de",
    phone: "+49 621 200270",
    status: "active",
    statusLabel: "Aktiv",
    statusTone: "success",
    depotAccess: [
      {
        depotCode: "HD",
        depotName: "Heidelberg",
        accessLabel: "Vollzugriff",
        tone: "success",
      },
    ],
    depotSummaryLabel: "1 Depot",
    permissionSummaryLabel: "Schichten, Kuriere",
    permissions: [
      { label: "Schichten pruefen", enabled: true },
      { label: "Kuriere freigeben", enabled: true },
      { label: "Dokumente hochladen", enabled: false },
      { label: "Exporte erstellen", enabled: false },
    ],
    lastActivityLabel: "Gestern, 17:05",
    inviteLabel: "Beigetreten",
  },
  {
    id: "DSP-20031",
    initials: "IR",
    fullName: "Ivana Ruseva",
    email: "ivana.ruseva@example.de",
    phone: "+49 6221 200310",
    status: "pending_approval",
    statusLabel: "Wartet auf Freigabe",
    statusTone: "warning",
    depotAccess: [
      {
        depotCode: "MA-N",
        depotName: "Mannheim Nord",
        accessLabel: "Geplant",
        tone: "warning",
      },
    ],
    depotSummaryLabel: "1 geplant",
    permissionSummaryLabel: "Noch nicht aktiv",
    permissions: [
      { label: "Schichten pruefen", enabled: false },
      { label: "Kuriere freigeben", enabled: false },
      { label: "Dokumente hochladen", enabled: false },
      { label: "Exporte erstellen", enabled: false },
    ],
    lastActivityLabel: "Einladung gesendet",
    inviteLabel: "Ausstehend",
  },
  {
    id: "DSP-20008",
    initials: "TB",
    fullName: "Thomas Bauer",
    email: "thomas.bauer@example.de",
    phone: "+49 621 200080",
    status: "inactive",
    statusLabel: "Inaktiv",
    statusTone: "neutral",
    depotAccess: [
      {
        depotCode: "MA-S",
        depotName: "Mannheim Sued",
        accessLabel: "Pausiert",
        tone: "neutral",
      },
    ],
    depotSummaryLabel: "1 pausiert",
    permissionSummaryLabel: "Keine aktiven Rechte",
    permissions: [
      { label: "Schichten pruefen", enabled: false },
      { label: "Kuriere freigeben", enabled: false },
      { label: "Dokumente hochladen", enabled: false },
      { label: "Exporte erstellen", enabled: false },
    ],
    lastActivityLabel: "24. Juni 2026",
    inviteLabel: "Beigetreten",
  },
];

export const adminDispatcherSummary = {
  total: adminDispatcherListItems.length,
  active: adminDispatcherListItems.filter(
    (dispatcher) => dispatcher.status === "active",
  ).length,
  pending: adminDispatcherListItems.filter(
    (dispatcher) => dispatcher.status === "pending_approval",
  ).length,
  scopedDepots: new Set(
    adminDispatcherListItems.flatMap((dispatcher) =>
      dispatcher.depotAccess.map((depot) => depot.depotCode),
    ),
  ).size,
};

export const adminDispatcherAccessDraft: AdminDispatcherAccessDraft = {
  dispatcherName: "Anna Mueller",
  dispatcherId: "DSP-20014",
  editableDepots: [
    {
      depotCode: "MA-N",
      depotName: "Mannheim Nord",
      stateLabel: "Vollzugriff",
      tone: "success",
    },
    {
      depotCode: "MA-S",
      depotName: "Mannheim Sued",
      stateLabel: "Vollzugriff",
      tone: "success",
    },
    {
      depotCode: "HD",
      depotName: "Heidelberg",
      stateLabel: "Kein Zugriff",
      tone: "neutral",
    },
  ],
  auditReminder:
    "Aenderungen am Depot-Zugriff muessen mit einem Audit-Log-Eintrag dokumentiert werden.",
};
