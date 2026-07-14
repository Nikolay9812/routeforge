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

export class AdminCsvExportError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "AdminCsvExportError";
  }
}

export type AdminCsvExportInput = {
  depotCode: string;
  month: string;
  paymentMode: string;
};

export type AdminCsvExportResult = {
  billableMinutes: number;
  csv: string;
  fileName: string;
  realMinutes: number;
  rowCount: number;
};

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
    canDownloadCsv: session.profile.role === "admin",
    exportDraft: buildAdminExportDraft({
      companyName: company?.name ?? session.company.name,
      generatedByName: session.profile.full_name,
      rows,
    }),
    initialMonth: rows[0]?.shiftDate.slice(0, 7) ?? getCurrentMonthValue(),
    initialRows: rows,
  };
}

export async function generateAdminCsvExport({
  input,
  session,
}: {
  input: AdminCsvExportInput;
  session: AdminAuthSession;
}): Promise<AdminCsvExportResult> {
  if (session.profile.role !== "admin") {
    throw new AdminCsvExportError(
      403,
      "Nur aktive Admins koennen Steuerberater-CSV-Exporte erstellen.",
    );
  }

  const monthRange = parseExportMonth(input.month);
  const depotCode = normalizeFilterValue(input.depotCode);
  const paymentMode = normalizeFilterValue(input.paymentMode);

  if (!["all", "hourly", "daily_fixed"].includes(paymentMode)) {
    throw new AdminCsvExportError(400, "Ungueltige Zahlungsart.");
  }

  const client = await createRouteForgeServerClient();
  const { data: companyData, error: companyError } = await client.database
    .from("companies")
    .select(companySelect)
    .eq("id", session.profile.company_id)
    .maybeSingle();

  if (companyError || !companyData) {
    throw new AdminCsvExportError(404, "Export-Mandant wurde nicht gefunden.");
  }

  let selectedDepotId: string | null = null;

  if (depotCode !== "all") {
    const { data: selectedDepot, error: depotError } = await client.database
      .from("depots")
      .select(depotSelect)
      .eq("company_id", session.profile.company_id)
      .eq("code", depotCode)
      .maybeSingle();

    if (depotError) {
      throw new AdminCsvExportError(500, "Depot-Filter konnte nicht geladen werden.");
    }

    if (!selectedDepot) {
      throw new AdminCsvExportError(404, "Depot-Filter wurde nicht gefunden.");
    }

    selectedDepotId = (selectedDepot as Depot).id;
  }

  let shiftQuery = client.database
    .from("shifts")
    .select(shiftSelect)
    .eq("company_id", session.profile.company_id)
    .eq("status", "approved")
    .gte("shift_date", monthRange.monthStart)
    .lt("shift_date", monthRange.monthEnd);

  if (selectedDepotId) {
    shiftQuery = shiftQuery.eq("depot_id", selectedDepotId);
  }

  if (paymentMode !== "all") {
    shiftQuery = shiftQuery.eq("payment_mode_snapshot", paymentMode);
  }

  const { data: shiftRows, error: shiftError } = await shiftQuery
    .order("shift_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (shiftError) {
    throw new AdminCsvExportError(500, "CSV-Schichten konnten nicht geladen werden.");
  }

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

  const company = companyData as Company;
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
        companyName: company.name,
        courier,
        depot,
        shift,
      });
    })
    .filter((row): row is AdminExportPreviewRow => Boolean(row));
  const billableMinutes = rows.reduce(
    (total, row) => total + row.billableMinutes,
    0,
  );
  const realMinutes = rows.reduce((total, row) => total + row.grossMinutes, 0);
  const { error: auditError } = await client.database.rpc(
    "record_accountant_export_created",
    {
      p_billable_minutes: billableMinutes,
      p_depot_code: depotCode,
      p_month: monthRange.month,
      p_payment_mode: paymentMode,
      p_real_minutes: realMinutes,
      p_row_count: rows.length,
    },
  );

  if (auditError) {
    throw new AdminCsvExportError(
      500,
      "CSV-Export konnte nicht audit-sicher erstellt werden.",
    );
  }

  return {
    billableMinutes,
    csv: buildCsv(rows),
    fileName: buildCsvFileName({
      depotCode,
      month: monthRange.month,
      paymentMode,
    }),
    realMinutes,
    rowCount: rows.length,
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
      "CSV-Downloads werden serverseitig erstellt und als accountant_export_created in audit_logs dokumentiert. XLSX folgt in RF-DOC-004.",
    approvedOnlyLabel: "Nur genehmigte Schichten",
    checklist: [
      { label: "Nur genehmigte Schichten", done: true },
      { label: "Billable Minutes enthalten", done: true },
      { label: "CSV-Download audit-loggesichert", done: true },
      { label: "XLSX kommt in RF-DOC-004", done: false },
    ],
    companyName,
    depotScopeLabel: "Alle Depots",
    formats: [
      {
        description: "Serverseitiger CSV-Download fuer den ausgewaehlten Monat.",
        label: "CSV",
        tone: "primary",
        value: "Bereit",
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

function buildCsv(rows: AdminExportPreviewRow[]): string {
  const header = [
    "Mandant",
    "Kurier",
    "Kurier-Code",
    "Datum",
    "Datum ISO",
    "Depot-Code",
    "Depot",
    "Zahlungsart",
    "Start",
    "Ende",
    "Brutto",
    "Brutto Minuten",
    "Pause",
    "Pause Minuten",
    "Netto",
    "Netto Minuten",
    "Abrechenbar",
    "Abrechenbar Minuten",
    "Abrechnungsquelle",
    "Korrekturgrund",
    "Freigabestatus",
    "Schicht-ID",
  ];
  const lines = rows.map((row) =>
    [
      row.companyName,
      row.courierName,
      row.courierCode,
      row.dateLabel,
      row.shiftDate,
      row.depotCode,
      row.depotName,
      row.paymentModeLabel,
      row.startTime,
      row.endTime,
      row.grossTimeLabel,
      row.grossMinutes,
      row.breakTimeLabel,
      row.breakMinutes,
      row.netTimeLabel,
      row.netMinutes,
      row.billableTimeLabel,
      row.billableMinutes,
      row.billableSourceLabel,
      row.overrideReason ?? "",
      row.statusLabel,
      row.id,
    ].map(escapeCsvCell).join(";"),
  );

  return `\uFEFF${[header.map(escapeCsvCell).join(";"), ...lines].join("\r\n")}\r\n`;
}

function escapeCsvCell(value: string | number): string {
  const rawValue = String(value);

  if (/[;"\r\n]/.test(rawValue)) {
    return `"${rawValue.replace(/"/g, '""')}"`;
  }

  return rawValue;
}

function buildCsvFileName({
  depotCode,
  month,
  paymentMode,
}: {
  depotCode: string;
  month: string;
  paymentMode: string;
}): string {
  const parts = ["routeforge-steuerberater", month];

  if (depotCode !== "all") {
    parts.push(depotCode.toLowerCase());
  }

  if (paymentMode !== "all") {
    parts.push(paymentMode.replace("_", "-"));
  }

  return `${parts.join("-")}.csv`;
}

function normalizeFilterValue(value: string): string {
  return value.trim() || "all";
}

function parseExportMonth(month: string): {
  month: string;
  monthEnd: string;
  monthStart: string;
} {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new AdminCsvExportError(400, "Ungueltiger Monat.");
  }

  const monthStart = `${month}-01`;
  const startDate = new Date(`${monthStart}T00:00:00.000Z`);

  if (Number.isNaN(startDate.getTime()) || startDate.toISOString().slice(0, 7) !== month) {
    throw new AdminCsvExportError(400, "Ungueltiger Monat.");
  }

  const endDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + 1, 1));

  return {
    month,
    monthEnd: endDate.toISOString().slice(0, 10),
    monthStart,
  };
}

function getCurrentMonthValue(): string {
  return new Date().toISOString().slice(0, 7);
}
