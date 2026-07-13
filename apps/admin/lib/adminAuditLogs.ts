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

export type AdminAuditSummary = {
  access: number;
  documents: number;
  money: number;
  total: number;
};

export type AdminAuditDetailRow = {
  label: string;
  beforeValue: string;
  afterValue: string;
};

export type AdminAuditDetail = {
  selectedLogId: string | null;
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

export type AdminAuditPageData = {
  detail: AdminAuditDetail;
  filters: Array<{ label: string; value: string }>;
  items: AdminAuditLogItem[];
  summary: AdminAuditSummary;
};

export function getAuditActionLabel(action: string): string {
  const labels: Record<string, string> = {
    accountant_export_created: "Export erstellt",
    billable_time_overridden: "Abrechnung ueberschrieben",
    courier_approved: "Kurier freigegeben",
    dispatcher_depot_access_updated: "Depot-Zugriff geaendert",
    document_uploaded: "Dokument hochgeladen",
    invitation_revoked: "Einladung widerrufen",
    shift_approved: "Schicht genehmigt",
    shift_corrected: "Schicht korrigiert",
    shift_rejected: "Schicht abgelehnt",
  };

  return labels[action] ?? humanizeAction(action);
}

export function getAuditScope({
  action,
  targetTable,
}: {
  action: string;
  targetTable: string;
}): AdminAuditScope {
  if (
    action.includes("billable") ||
    action.includes("payroll") ||
    action.includes("export")
  ) {
    return "money";
  }

  if (
    targetTable === "profiles" ||
    targetTable === "profile_depot_access" ||
    targetTable === "invitations" ||
    action.includes("access")
  ) {
    return "access";
  }

  if (targetTable === "documents" || action.includes("document")) {
    return "document";
  }

  return "workflow";
}

export function getAuditScopeLabel(scope: AdminAuditScope): string {
  const labels: Record<AdminAuditScope, string> = {
    access: "Zugriff",
    document: "Dokument",
    money: "Geld",
    workflow: "Workflow",
  };

  return labels[scope];
}

export function getAuditActionTone(action: string): AdminAuditTone {
  if (action.includes("reject") || action.includes("revoked")) {
    return "error";
  }

  if (action.includes("approve") || action.includes("upload")) {
    return "success";
  }

  if (action.includes("override") || action.includes("correct")) {
    return "warning";
  }

  return "primary";
}

export function formatAuditTimestamp(value: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatAuditJson(value: JsonObject | null): string {
  if (!value || Object.keys(value).length === 0) {
    return "-";
  }

  return JSON.stringify(value);
}

function humanizeAction(action: string): string {
  return action
    .split("_")
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}
