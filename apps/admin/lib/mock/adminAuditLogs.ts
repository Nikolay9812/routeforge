import type { AuditLog, JsonObject } from "@routeforge/shared";

export type AdminAuditTone =
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "neutral";

export type AdminAuditScope = "money" | "access" | "document" | "workflow";

export type AdminAuditLogItem = AuditLog & {
  timestampLabel: string;
  actorName: string;
  actorRoleLabel: string;
  actionLabel: string;
  actionTone: AdminAuditTone;
  scope: AdminAuditScope;
  scopeLabel: string;
  targetLabel: string;
  targetDetail: string;
  reasonLabel: string;
  depotScopeLabel: string;
};

export type AdminAuditFilterGroup = {
  label: string;
  value: string;
};

export type AdminAuditDetailRow = {
  label: string;
  beforeValue: string;
  afterValue: string;
};

export type AdminAuditDetail = {
  selectedLogId: string;
  title: string;
  helper: string;
  rows: AdminAuditDetailRow[];
  securityNotes: Array<{
    label: string;
    value: string;
    tone: AdminAuditTone;
  }>;
  checklist: Array<{
    label: string;
    done: boolean;
  }>;
  immutableReminder: string;
};

function jsonObject(value: JsonObject): JsonObject {
  return value;
}

export const adminAuditFilterGroups: AdminAuditFilterGroup[] = [
  { label: "Akteur", value: "Alle Akteure" },
  { label: "Aktion", value: "Alle Aktionen" },
  { label: "Datum", value: "Juli 2026" },
  { label: "Ziel", value: "Alle Ziele" },
];

export const adminAuditLogItems: AdminAuditLogItem[] = [
  {
    id: "AUD-2026-07-04-001",
    company_id: "company-ivt",
    actor_profile_id: "profile-admin-ni",
    target_table: "shifts",
    target_id: "shift-sr-2026-07-03-10344",
    action: "billable_time_overridden",
    before: jsonObject({
      billable_minutes: 462,
      billable_source: "automatic",
    }),
    after: jsonObject({
      billable_minutes: 480,
      billable_source: "manual_override",
    }),
    reason: "Tour wegen Depotwechsel korrigiert",
    created_at: "2026-07-04T10:42:00.000Z",
    timestampLabel: "04.07.2026, 10:42",
    actorName: "Nikolay Ivanov",
    actorRoleLabel: "Admin",
    actionLabel: "Abrechnung ueberschrieben",
    actionTone: "warning",
    scope: "money",
    scopeLabel: "Geld",
    targetLabel: "Schicht SR-2026-07-03-10344",
    targetDetail: "Maria Rossi - Heidelberg",
    reasonLabel: "Tour wegen Depotwechsel korrigiert",
    depotScopeLabel: "Alle Depots",
  },
  {
    id: "AUD-2026-07-04-002",
    company_id: "company-ivt",
    actor_profile_id: "profile-dispatcher-lk",
    target_table: "shifts",
    target_id: "shift-sr-2026-07-02-10231",
    action: "shift_approved",
    before: jsonObject({ status: "submitted" }),
    after: jsonObject({ status: "approved" }),
    reason: "Pflichtnachweise vollstaendig und Zeiten plausibel",
    created_at: "2026-07-04T09:18:00.000Z",
    timestampLabel: "04.07.2026, 09:18",
    actorName: "Lea Krause",
    actorRoleLabel: "Dispatcher",
    actionLabel: "Schicht genehmigt",
    actionTone: "success",
    scope: "workflow",
    scopeLabel: "Workflow",
    targetLabel: "Schicht SR-2026-07-02-10231",
    targetDetail: "Ahmet Yilmaz - Mannheim Nord",
    reasonLabel: "Pflichtnachweise vollstaendig und Zeiten plausibel",
    depotScopeLabel: "Mannheim Nord",
  },
  {
    id: "AUD-2026-07-03-003",
    company_id: "company-ivt",
    actor_profile_id: "profile-admin-ni",
    target_table: "profile_depot_access",
    target_id: "access-dispatcher-lk-ma-s",
    action: "dispatcher_depot_access_updated",
    before: jsonObject({ depots: ["MA-N"] }),
    after: jsonObject({ depots: ["MA-N", "MA-S"] }),
    reason: "Urlaubsvertretung fuer Mannheim Sued",
    created_at: "2026-07-03T16:05:00.000Z",
    timestampLabel: "03.07.2026, 16:05",
    actorName: "Nikolay Ivanov",
    actorRoleLabel: "Admin",
    actionLabel: "Depot-Zugriff geaendert",
    actionTone: "primary",
    scope: "access",
    scopeLabel: "Zugriff",
    targetLabel: "Dispatcher Lea Krause",
    targetDetail: "profile_depot_access",
    reasonLabel: "Urlaubsvertretung fuer Mannheim Sued",
    depotScopeLabel: "Mannheim Nord, Mannheim Sued",
  },
  {
    id: "AUD-2026-07-03-004",
    company_id: "company-ivt",
    actor_profile_id: "profile-admin-ni",
    target_table: "documents",
    target_id: "doc-pay-2026-06-elena",
    action: "document_uploaded",
    before: null,
    after: jsonObject({
      document_type: "payslip",
      storage_bucket: "payslips",
      mailbox_created: true,
    }),
    reason: "Lohnabrechnung Juni 2026 bereitgestellt",
    created_at: "2026-07-03T14:22:00.000Z",
    timestampLabel: "03.07.2026, 14:22",
    actorName: "Nikolay Ivanov",
    actorRoleLabel: "Admin",
    actionLabel: "Dokument hochgeladen",
    actionTone: "info",
    scope: "document",
    scopeLabel: "Dokument",
    targetLabel: "Lohnabrechnung Juni 2026",
    targetDetail: "Elena Dimitrova - private Datei",
    reasonLabel: "Lohnabrechnung Juni 2026 bereitgestellt",
    depotScopeLabel: "Mannheim Sued",
  },
  {
    id: "AUD-2026-07-03-005",
    company_id: "company-ivt",
    actor_profile_id: "profile-admin-ni",
    target_table: "invitations",
    target_id: "inv-dispatcher-expired",
    action: "invitation_revoked",
    before: jsonObject({ status: "active" }),
    after: jsonObject({ status: "revoked" }),
    reason: "Falsches Depot in Einladung ausgewaehlt",
    created_at: "2026-07-03T11:40:00.000Z",
    timestampLabel: "03.07.2026, 11:40",
    actorName: "Nikolay Ivanov",
    actorRoleLabel: "Admin",
    actionLabel: "Einladung widerrufen",
    actionTone: "error",
    scope: "access",
    scopeLabel: "Zugriff",
    targetLabel: "dispatcher.neu@example.com",
    targetDetail: "Dispatcher-Einladung",
    reasonLabel: "Falsches Depot in Einladung ausgewaehlt",
    depotScopeLabel: "Heidelberg",
  },
  {
    id: "AUD-2026-07-02-006",
    company_id: "company-ivt",
    actor_profile_id: "profile-admin-ni",
    target_table: "exports",
    target_id: "export-july-2026",
    action: "accountant_export_created",
    before: null,
    after: jsonObject({
      month: "2026-07",
      rows: 5,
      formats: ["csv", "xlsx"],
    }),
    reason: "Monatsdaten fuer Steuerberater vorbereitet",
    created_at: "2026-07-02T17:28:00.000Z",
    timestampLabel: "02.07.2026, 17:28",
    actorName: "Nikolay Ivanov",
    actorRoleLabel: "Admin",
    actionLabel: "Export erstellt",
    actionTone: "primary",
    scope: "money",
    scopeLabel: "Geld",
    targetLabel: "Steuerberater-Export Juli",
    targetDetail: "CSV und XLSX",
    reasonLabel: "Monatsdaten fuer Steuerberater vorbereitet",
    depotScopeLabel: "Alle Depots",
  },
  {
    id: "AUD-2026-07-02-007",
    company_id: "company-ivt",
    actor_profile_id: "profile-dispatcher-lk",
    target_table: "profiles",
    target_id: "profile-courier-sofia",
    action: "courier_approved",
    before: jsonObject({ status: "pending_approval" }),
    after: jsonObject({ status: "active" }),
    reason: "Dokumente geprueft und Depot bestaetigt",
    created_at: "2026-07-02T13:06:00.000Z",
    timestampLabel: "02.07.2026, 13:06",
    actorName: "Lea Krause",
    actorRoleLabel: "Dispatcher",
    actionLabel: "Kurier freigegeben",
    actionTone: "success",
    scope: "access",
    scopeLabel: "Zugriff",
    targetLabel: "Sofia Petrovic",
    targetDetail: "pending_approval zu active",
    reasonLabel: "Dokumente geprueft und Depot bestaetigt",
    depotScopeLabel: "Mannheim Sued",
  },
  {
    id: "AUD-2026-07-01-008",
    company_id: "company-ivt",
    actor_profile_id: "profile-dispatcher-lk",
    target_table: "shifts",
    target_id: "shift-sr-2026-06-30-0668",
    action: "shift_rejected",
    before: jsonObject({ status: "submitted" }),
    after: jsonObject({ status: "rejected" }),
    reason: "Stopp-GPS fehlt und Bericht muss korrigiert werden",
    created_at: "2026-07-01T08:52:00.000Z",
    timestampLabel: "01.07.2026, 08:52",
    actorName: "Lea Krause",
    actorRoleLabel: "Dispatcher",
    actionLabel: "Schicht abgelehnt",
    actionTone: "error",
    scope: "workflow",
    scopeLabel: "Workflow",
    targetLabel: "Schicht SR-2026-06-30-0668",
    targetDetail: "Maria Rossi - Heidelberg",
    reasonLabel: "Stopp-GPS fehlt und Bericht muss korrigiert werden",
    depotScopeLabel: "Heidelberg",
  },
];

export const adminAuditSummary = {
  total: adminAuditLogItems.length,
  money: adminAuditLogItems.filter((item) => item.scope === "money").length,
  access: adminAuditLogItems.filter((item) => item.scope === "access").length,
  documents: adminAuditLogItems.filter((item) => item.scope === "document")
    .length,
};

export const adminAuditDetail: AdminAuditDetail = {
  selectedLogId: adminAuditLogItems[0].id,
  title: "Aenderungsdetail",
  helper:
    "Statische Detailansicht fuer den ausgewaehlten Audit-Log-Eintrag. Reale Eintraege bleiben serverseitig unveraenderbar.",
  rows: [
    {
      label: "Abrechenbare Minuten",
      beforeValue: "462 Minuten",
      afterValue: "480 Minuten",
    },
    {
      label: "Quelle",
      beforeValue: "Automatisch",
      afterValue: "Manueller Override",
    },
    {
      label: "Ziel",
      beforeValue: "Schicht automatisch berechnet",
      afterValue: "Korrektur fuer Monatsabrechnung",
    },
  ],
  securityNotes: [
    { label: "Mandant", value: "Ivanov Transport", tone: "primary" },
    { label: "Rolle", value: "Admin", tone: "success" },
    { label: "Schreibschutz", value: "Client darf nicht editieren", tone: "warning" },
  ],
  checklist: [
    { label: "Actor gespeichert", done: true },
    { label: "Before/After sichtbar", done: true },
    { label: "Grund vorhanden", done: true },
    { label: "Company Scope sichtbar", done: true },
  ],
  immutableReminder:
    "Audit Logs duerfen spaeter nicht clientseitig erstellt, geaendert oder geloescht werden. Backend/RLS bleibt die echte Grenze.",
};
