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

export class AdminExportError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "AdminExportError";
  }
}

export type AdminCsvExportInput = AdminAccountantExportInput;

export type AdminXlsxExportInput = AdminAccountantExportInput;

export type AdminAccountantExportInput = {
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

export type AdminXlsxExportResult = {
  billableMinutes: number;
  fileName: string;
  realMinutes: number;
  rowCount: number;
  xlsx: Uint8Array;
};

type LoadedAccountantExport = {
  billableMinutes: number;
  depotCode: string;
  month: string;
  paymentMode: string;
  realMinutes: number;
  rows: AdminExportPreviewRow[];
};

const localFileHeaderSignature = 67324752;
const centralDirectoryHeaderSignature = 33639248;
const endOfCentralDirectorySignature = 101010256;
const crc32Polynomial = 3988292384;

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
  full_name
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
    canDownloadXlsx: session.profile.role === "admin",
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
  const exportData = await loadAccountantExport({ input, session });
  await recordAccountantExportCreated(exportData);

  return {
    billableMinutes: exportData.billableMinutes,
    csv: buildCsv(exportData.rows),
    fileName: buildCsvFileName({
      depotCode: exportData.depotCode,
      month: exportData.month,
      paymentMode: exportData.paymentMode,
    }),
    realMinutes: exportData.realMinutes,
    rowCount: exportData.rows.length,
  };
}

export async function generateAdminXlsxExport({
  input,
  session,
}: {
  input: AdminXlsxExportInput;
  session: AdminAuthSession;
}): Promise<AdminXlsxExportResult> {
  const exportData = await loadAccountantExport({ input, session });
  const xlsx = buildXlsx({
    month: exportData.month,
    rows: exportData.rows,
  });

  await recordAccountantExportCreated(exportData);

  return {
    billableMinutes: exportData.billableMinutes,
    fileName: buildXlsxFileName({
      depotCode: exportData.depotCode,
      month: exportData.month,
      paymentMode: exportData.paymentMode,
    }),
    realMinutes: exportData.realMinutes,
    rowCount: exportData.rows.length,
    xlsx,
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
      "CSV- und XLSX-Downloads werden serverseitig erstellt und als accountant_export_created in audit_logs dokumentiert.",
    approvedOnlyLabel: "Nur genehmigte Schichten",
    checklist: [
      { label: "Nur genehmigte Schichten", done: true },
      { label: "Billable Minutes enthalten", done: true },
      { label: "CSV-Download audit-loggesichert", done: true },
      { label: "XLSX-Download audit-loggesichert", done: true },
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
        description: "Formatierte Monatsdatei mit Summenzeile.",
        label: "XLSX",
        tone: "success",
        value: "Bereit",
      },
    ],
    generatedByName,
    paymentScopeLabel: "Alle Zahlungsarten",
    periodLabel: rows[0]?.shiftDate.slice(0, 7) ?? getCurrentMonthValue(),
    rowsLabel: `${rows.length} Vorschauzeilen`,
  };
}

async function loadAccountantExport({
  input,
  session,
}: {
  input: AdminAccountantExportInput;
  session: AdminAuthSession;
}): Promise<LoadedAccountantExport> {
  if (session.profile.role !== "admin") {
    throw new AdminExportError(
      403,
      "Nur aktive Admins koennen Steuerberater-Exporte erstellen.",
    );
  }

  const monthRange = parseExportMonth(input.month);
  const depotCode = normalizeFilterValue(input.depotCode);
  const paymentMode = normalizeFilterValue(input.paymentMode);

  if (!["all", "hourly", "daily_fixed"].includes(paymentMode)) {
    throw new AdminExportError(400, "Ungueltige Zahlungsart.");
  }

  const client = await createRouteForgeServerClient();
  const { data: companyData, error: companyError } = await client.database
    .from("companies")
    .select(companySelect)
    .eq("id", session.profile.company_id)
    .maybeSingle();

  if (companyError || !companyData) {
    throw new AdminExportError(404, "Export-Mandant wurde nicht gefunden.");
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
      throw new AdminExportError(500, "Depot-Filter konnte nicht geladen werden.");
    }

    if (!selectedDepot) {
      throw new AdminExportError(404, "Depot-Filter wurde nicht gefunden.");
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
    throw new AdminExportError(500, "Export-Schichten konnten nicht geladen werden.");
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

  return {
    billableMinutes: rows.reduce((total, row) => total + row.billableMinutes, 0),
    depotCode,
    month: monthRange.month,
    paymentMode,
    realMinutes: rows.reduce((total, row) => total + row.grossMinutes, 0),
    rows,
  };
}

async function recordAccountantExportCreated({
  billableMinutes,
  depotCode,
  month,
  paymentMode,
  realMinutes,
  rows,
}: LoadedAccountantExport): Promise<void> {
  const client = await createRouteForgeServerClient();
  const { error: auditError } = await client.database.rpc(
    "record_accountant_export_created",
    {
      p_billable_minutes: billableMinutes,
      p_depot_code: depotCode,
      p_month: month,
      p_payment_mode: paymentMode,
      p_real_minutes: realMinutes,
      p_row_count: rows.length,
    },
  );

  if (auditError) {
    throw new AdminExportError(
      500,
      "Export konnte nicht audit-sicher erstellt werden.",
    );
  }
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

function buildXlsx({
  month,
  rows,
}: {
  month: string;
  rows: AdminExportPreviewRow[];
}): Uint8Array {
  const createdAt = new Date().toISOString();

  return buildZip({
    "[Content_Types].xml": buildXlsxContentTypesXml(),
    "_rels/.rels": buildXlsxRootRelsXml(),
    "docProps/app.xml": buildXlsxAppXml(),
    "docProps/core.xml": buildXlsxCoreXml(createdAt),
    "xl/_rels/workbook.xml.rels": buildXlsxWorkbookRelsXml(),
    "xl/styles.xml": buildXlsxStylesXml(),
    "xl/workbook.xml": buildXlsxWorkbookXml(month),
    "xl/worksheets/sheet1.xml": buildXlsxWorksheetXml(rows),
  });
}

function buildXlsxWorksheetXml(rows: AdminExportPreviewRow[]): string {
  const headers = [
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
  const exportRows = rows.map((row) => [
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
  ]);
  const totals = {
    billableMinutes: rows.reduce((total, row) => total + row.billableMinutes, 0),
    breakMinutes: rows.reduce((total, row) => total + row.breakMinutes, 0),
    grossMinutes: rows.reduce((total, row) => total + row.grossMinutes, 0),
    netMinutes: rows.reduce((total, row) => total + row.netMinutes, 0),
  };
  const totalRow = [
    "Summe",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    formatExportMinutes(totals.grossMinutes),
    totals.grossMinutes,
    formatExportMinutes(totals.breakMinutes),
    totals.breakMinutes,
    formatExportMinutes(totals.netMinutes),
    totals.netMinutes,
    formatExportMinutes(totals.billableMinutes),
    totals.billableMinutes,
    "",
    "",
    "",
    "",
  ];
  const sheetRows = [
    buildXlsxRow(1, headers, 1),
    ...exportRows.map((row, index) => buildXlsxRow(index + 2, row, 0)),
    buildXlsxRow(rows.length + 2, totalRow, 1),
  ];
  const lastRowIndex = rows.length + 2;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  <cols>
    <col min="1" max="1" width="24" customWidth="1"/>
    <col min="2" max="3" width="22" customWidth="1"/>
    <col min="4" max="5" width="14" customWidth="1"/>
    <col min="6" max="8" width="18" customWidth="1"/>
    <col min="9" max="10" width="12" customWidth="1"/>
    <col min="11" max="18" width="17" customWidth="1"/>
    <col min="19" max="20" width="22" customWidth="1"/>
    <col min="21" max="22" width="18" customWidth="1"/>
  </cols>
  <sheetData>
    ${sheetRows.join("\n    ")}
  </sheetData>
  <autoFilter ref="A1:V${lastRowIndex}"/>
</worksheet>`;
}

function buildXlsxRow(
  rowIndex: number,
  values: Array<number | string>,
  styleIndex: number,
): string {
  const cells = values.map((value, index) =>
    buildXlsxCell({
      columnIndex: index + 1,
      rowIndex,
      styleIndex,
      value,
    }),
  );

  return `<row r="${rowIndex}">${cells.join("")}</row>`;
}

function buildXlsxCell({
  columnIndex,
  rowIndex,
  styleIndex,
  value,
}: {
  columnIndex: number;
  rowIndex: number;
  styleIndex: number;
  value: number | string;
}): string {
  const ref = `${getXlsxColumnName(columnIndex)}${rowIndex}`;
  const style = styleIndex ? ` s="${styleIndex}"` : "";

  if (typeof value === "number") {
    return `<c r="${ref}"${style}><v>${value}</v></c>`;
  }

  return `<c r="${ref}" t="inlineStr"${style}><is><t>${escapeXml(value)}</t></is></c>`;
}

function buildXlsxContentTypesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;
}

function buildXlsxRootRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
}

function buildXlsxWorkbookRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
}

function buildXlsxWorkbookXml(month: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${escapeXml(month)}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;
}

function buildXlsxStylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/></font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
</styleSheet>`;
}

function buildXlsxCoreXml(createdAt: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>RouteForge Steuerberater Export</dc:title>
  <dc:creator>RouteForge</dc:creator>
  <cp:lastModifiedBy>RouteForge</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:modified>
</cp:coreProperties>`;
}

function buildXlsxAppXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>RouteForge</Application>
</Properties>`;
}

function getXlsxColumnName(columnIndex: number): string {
  let remaining = columnIndex;
  let columnName = "";

  while (remaining > 0) {
    const modulo = (remaining - 1) % 26;
    columnName = String.fromCharCode(65 + modulo) + columnName;
    remaining = Math.floor((remaining - modulo) / 26);
  }

  return columnName;
}

function buildZip(entries: Record<string, string | Uint8Array>): Uint8Array {
  const localFiles: Buffer[] = [];
  const centralDirectory: Buffer[] = [];
  let offset = 0;

  Object.entries(entries).forEach(([path, content]) => {
    const name = Buffer.from(path, "utf8");
    const data =
      typeof content === "string"
        ? Buffer.from(content, "utf8")
        : Buffer.from(content);
    const crc = getCrc32(data);
    const localHeader = Buffer.alloc(30 + name.length);

    localHeader.writeUInt32LE(localFileHeaderSignature, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);
    name.copy(localHeader, 30);

    localFiles.push(localHeader, data);

    const centralHeader = Buffer.alloc(46 + name.length);
    centralHeader.writeUInt32LE(centralDirectoryHeaderSignature, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    name.copy(centralHeader, 46);
    centralDirectory.push(centralHeader);

    offset += localHeader.length + data.length;
  });

  const centralOffset = offset;
  const centralSize = centralDirectory.reduce(
    (total, header) => total + header.length,
    0,
  );
  const endRecord = Buffer.alloc(22);

  endRecord.writeUInt32LE(endOfCentralDirectorySignature, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(centralDirectory.length, 8);
  endRecord.writeUInt16LE(centralDirectory.length, 10);
  endRecord.writeUInt32LE(centralSize, 12);
  endRecord.writeUInt32LE(centralOffset, 16);
  endRecord.writeUInt16LE(0, 20);

  return Buffer.concat([...localFiles, ...centralDirectory, endRecord]);
}

function getCrc32(data: Buffer): number {
  let crc = 0xffffffff;

  for (const byte of data) {
    crc = (crc >>> 8) ^ crc32Table[(crc ^ byte) & 0xff];
  }

  return (crc ^ 0xffffffff) >>> 0;
}

const crc32Table = Array.from({ length: 256 }, (_, index) => {
  let crc = index;

  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? crc32Polynomial ^ (crc >>> 1) : crc >>> 1;
  }

  return crc >>> 0;
});

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

function buildXlsxFileName({
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

  return `${parts.join("-")}.xlsx`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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
    throw new AdminExportError(400, "Ungueltiger Monat.");
  }

  const monthStart = `${month}-01`;
  const startDate = new Date(`${monthStart}T00:00:00.000Z`);

  if (Number.isNaN(startDate.getTime()) || startDate.toISOString().slice(0, 7) !== month) {
    throw new AdminExportError(400, "Ungueltiger Monat.");
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
