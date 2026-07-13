import "server-only";

import type { Company, Depot, Profile, Shift } from "@routeforge/shared";

import type { AdminAuthSession } from "@/lib/auth";
import {
  formatExportDate,
  formatExportMinutes,
  formatExportTime,
  getExportBillableSourceLabel,
  getExportPaymentModeLabel,
  type AdminExportDraft,
  type AdminExportPreviewRow,
} from "@/lib/adminExports";
import { createRouteForgeServerClient } from "@/lib/insforge/server";

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
  status,
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

const companySelect = `
  id,
  name,
  slug,
  country_code,
  default_language,
  logo_url,
  stamp_url,
  created_at,
  updated_at
`;

export async function loadAdminExportPageData(session: AdminAuthSession) {
  const client = await createRouteForgeServerClient();
  const [{ data: shiftRows }, { data: companyRow }] = await Promise.all([
    client.database
      .from("shifts")
      .select(shiftSelect)
      .eq("company_id", session.profile.company_id)
      .eq("status", "approved")
      .order("shift_date", { ascending: false })
      .limit(200),
    client.database
      .from("companies")
      .select(companySelect)
      .eq("id", session.profile.company_id)
      .limit(1)
      .maybeSingle(),
  ]);

  const shifts = (shiftRows ?? []) as Shift[];
  const courierIds = Array.from(
    new Set(shifts.map((shift) => shift.courier_profile_id)),
  );
  const depotIds = Array.from(new Set(shifts.map((shift) => shift.depot_id)));

  const [{ data: courierRows }, { data: depotRows }] = await Promise.all([
    courierIds.length
      ? client.database
          .from("profiles")
          .select(profileSelect)
          .eq("company_id", session.profile.company_id)
          .in("id", courierIds)
      : Promise.resolve({ data: [] }),
    depotIds.length
      ? client.database
          .from("depots")
          .select(depotSelect)
          .eq("company_id", session.profile.company_id)
          .in("id", depotIds)
      : Promise.resolve({ data: [] }),
  ]);

  const company = (companyRow as Company | null) ?? null;
  const couriersById = new Map(
    ((courierRows ?? []) as Profile[]).map((profile) => [profile.id, profile]),
  );
  const depotsById = new Map(
    ((depotRows ?? []) as Depot[]).map((depot) => [depot.id, depot]),
  );
  const rows = shifts
    .map((shift) => {
      const courier = couriersById.get(shift.courier_profile_id);
      const depot = depotsById.get(shift.depot_id);

      if (!courier || !depot) {
        return null;
      }

      return formatAdminExportPreviewRow({
        companyName: company?.name ?? session.company.name,
        courier,
        depot,
        shift,
      });
    })
    .filter((row): row is AdminExportPreviewRow => Boolean(row));

  return {
    exportDraft: buildAdminExportDraft({
      companyName: company?.name ?? session.company.name,
      generatedByName: session.profile.full_name,
      rows,
    }),
    initialMonth: rows[0]?.shiftDate.slice(0, 7) ?? getCurrentMonthValue(),
    initialRows: rows,
  };
}

function formatAdminExportPreviewRow({
  companyName,
  courier,
  depot,
  shift,
}: {
  companyName: string;
  courier: Profile;
  depot: Depot;
  shift: Shift;
}): AdminExportPreviewRow {
  return {
    billableMinutes: shift.billable_minutes,
    billableSourceLabel: getExportBillableSourceLabel(shift.billable_source),
    billableTimeLabel: formatExportMinutes(shift.billable_minutes),
    breakMinutes: shift.break_minutes,
    breakTimeLabel: formatExportMinutes(shift.break_minutes),
    companyName,
    courierCode: `KUR-${courier.id.slice(0, 8).toUpperCase()}`,
    courierName: courier.full_name,
    dateLabel: formatExportDate(shift.shift_date),
    depotCode: depot.code,
    depotName: depot.name,
    endTime: formatExportTime(shift.end_time),
    grossMinutes: shift.gross_minutes,
    grossTimeLabel: formatExportMinutes(shift.gross_minutes),
    id: shift.id,
    netMinutes: shift.net_minutes,
    netTimeLabel: formatExportMinutes(shift.net_minutes),
    overrideReason: shift.billable_override_reason,
    paymentMode: shift.payment_mode_snapshot,
    paymentModeLabel: getExportPaymentModeLabel(shift.payment_mode_snapshot),
    shiftDate: shift.shift_date,
    startTime: formatExportTime(shift.start_time),
    status: "approved",
    statusLabel: "Genehmigt",
    statusTone: "success",
  };
}

function buildAdminExportDraft({
  companyName,
  generatedByName,
  rows,
}: {
  companyName: string;
  generatedByName: string;
  rows: AdminExportPreviewRow[];
}): AdminExportDraft {
  return {
    auditReminder:
      "Echte CSV/XLSX-Dateien kommen in der Export-Phase. Die Vorschau bleibt company-scoped und zeigt nur genehmigte Schichten.",
    approvedOnlyLabel: "Nur genehmigte Schichten",
    checklist: [
      { label: "Nur genehmigte Schichten", done: true },
      { label: "Billable Minutes enthalten", done: true },
      { label: "CSV/XLSX kommt in Export-Phase", done: false },
    ],
    companyName,
    depotScopeLabel: "Alle Depots",
    formats: [
      {
        description: "Kommt in RF-DOC-003.",
        label: "CSV",
        tone: "primary",
        value: "Export-Phase",
      },
      {
        description: "Kommt in RF-DOC-004.",
        label: "XLSX",
        tone: "success",
        value: "Export-Phase",
      },
    ],
    generatedByName,
    paymentScopeLabel: "Alle Zahlungsarten",
    periodLabel: rows[0]?.shiftDate.slice(0, 7) ?? getCurrentMonthValue(),
    rowsLabel: `${rows.length} Vorschauzeilen`,
  };
}

function getCurrentMonthValue(): string {
  return new Date().toISOString().slice(0, 7);
}
