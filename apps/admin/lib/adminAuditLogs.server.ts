import "server-only";

import type { AuditLog, Profile } from "@routeforge/shared";

import type { AdminAuthSession } from "@/lib/auth";
import {
  formatAuditJson,
  formatAuditTimestamp,
  getAuditActionLabel,
  getAuditActionTone,
  getAuditScope,
  getAuditScopeLabel,
  type AdminAuditDetail,
  type AdminAuditLogItem,
  type AdminAuditPageData,
  type AdminAuditScope,
  type AdminAuditSummary,
} from "@/lib/adminAuditLogs";
import { createRouteForgeServerClient } from "@/lib/insforge/server";

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

export async function loadAdminAuditLogPageData(
  session: AdminAuthSession,
): Promise<AdminAuditPageData> {
  const client = await createRouteForgeServerClient();
  const { data: auditRows } = await client.database
    .from("audit_logs")
    .select(auditSelect)
    .eq("company_id", session.profile.company_id)
    .order("created_at", { ascending: false })
    .limit(100);

  const auditLogs = (auditRows ?? []) as AuditLog[];
  const actorIds = Array.from(new Set(auditLogs.map((log) => log.actor_profile_id)));
  const { data: actorRows } = actorIds.length
    ? await client.database
        .from("profiles")
        .select(profileSelect)
        .eq("company_id", session.profile.company_id)
        .in("id", actorIds)
    : { data: [] };
  const actorsById = new Map(
    ((actorRows ?? []) as Profile[]).map((profile) => [profile.id, profile]),
  );
  const items = auditLogs.map((log) =>
    formatAdminAuditLogItem({
      actor: actorsById.get(log.actor_profile_id) ?? null,
      log,
    }),
  );

  return {
    detail: buildAuditDetail(items[0] ?? null),
    filters: [
      { label: "Akteur", value: "Alle Akteure" },
      { label: "Aktion", value: "Alle Aktionen" },
      { label: "Ziel", value: "Alle Ziele" },
      { label: "Scope", value: "Aktueller Mandant" },
    ],
    items,
    summary: getAuditSummary(items),
  };
}

function formatAdminAuditLogItem({
  actor,
  log,
}: {
  actor: Profile | null;
  log: AuditLog;
}): AdminAuditLogItem {
  const scope = getAuditScope({
    action: log.action,
    targetTable: log.target_table,
  });

  return {
    ...log,
    actionLabel: getAuditActionLabel(log.action),
    actionTone: getAuditActionTone(log.action),
    actorName: actor?.full_name ?? "RouteForge Admin",
    actorRoleLabel: actor ? getRoleLabel(actor.role) : "Admin",
    depotScopeLabel: "Company Scope",
    reasonLabel: log.reason ?? "Kein Grund hinterlegt",
    scope,
    scopeLabel: getAuditScopeLabel(scope),
    targetDetail: log.target_id,
    targetLabel: getTargetLabel(log.target_table),
    timestampLabel: formatAuditTimestamp(log.created_at),
  };
}

function getAuditSummary(items: AdminAuditLogItem[]): AdminAuditSummary {
  return {
    access: countByScope(items, "access"),
    documents: countByScope(items, "document"),
    money: countByScope(items, "money"),
    total: items.length,
  };
}

function buildAuditDetail(item: AdminAuditLogItem | null): AdminAuditDetail {
  return {
    checklist: [
      { done: true, label: "Company Scope" },
      { done: true, label: "Serverseitig geschrieben" },
      { done: true, label: "Schreibgeschuetzt in Admin" },
    ],
    helper: item
      ? "Details des neuesten Eintrags aus audit_logs."
      : "Noch kein Audit-Eintrag fuer diesen Mandanten vorhanden.",
    immutableReminder:
      "Audit Logs sind eine Pruefspur. Korrekturen muessen als neue serverseitige Eintraege geschrieben werden.",
    rows: item
      ? [
          {
            afterValue: formatAuditJson(item.after),
            beforeValue: formatAuditJson(item.before),
            label: item.target_table,
          },
        ]
      : [],
    securityNotes: [
      {
        label: "Mandant",
        tone: "primary",
        value: "Alle Eintraege sind company_id-scoped.",
      },
      {
        label: "Aenderungen",
        tone: "warning",
        value: "Diese Ansicht ist bewusst nur lesend.",
      },
    ],
    selectedLogId: item?.id ?? null,
  };
}

function countByScope(
  items: AdminAuditLogItem[],
  scope: AdminAuditScope,
): number {
  return items.filter((item) => item.scope === scope).length;
}

function getRoleLabel(role: Profile["role"]): string {
  const labels: Record<Profile["role"], string> = {
    admin: "Admin",
    courier: "Kurier",
    dispatcher: "Dispatcher",
  };

  return labels[role];
}

function getTargetLabel(targetTable: string): string {
  const labels: Record<string, string> = {
    documents: "Dokument",
    exports: "Export",
    invitations: "Einladung",
    profile_depot_access: "Depot-Zugriff",
    profiles: "Profil",
    shifts: "Schicht",
  };

  return labels[targetTable] ?? targetTable;
}
