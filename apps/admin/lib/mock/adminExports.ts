import type { PaymentMode, ShiftStatus } from "@routeforge/shared";

export type AdminExportTone =
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "neutral";

export type AdminExportPreviewRow = {
  id: string;
  companyName: string;
  courierName: string;
  courierCode: string;
  shiftDate: string;
  dateLabel: string;
  depotCode: string;
  depotName: string;
  paymentMode: PaymentMode;
  paymentModeLabel: string;
  startTime: string;
  endTime: string;
  grossMinutes: number;
  grossTimeLabel: string;
  breakMinutes: number;
  breakTimeLabel: string;
  netMinutes: number;
  netTimeLabel: string;
  billableMinutes: number;
  billableTimeLabel: string;
  billableSourceLabel: string;
  overrideReason: string | null;
  status: Extract<ShiftStatus, "approved">;
  statusLabel: string;
  statusTone: AdminExportTone;
};

export type AdminExportFilterGroup = {
  label: string;
  value: string;
};

export type AdminExportFormat = {
  label: string;
  value: string;
  tone: AdminExportTone;
  description: string;
};

export type AdminExportDraft = {
  periodLabel: string;
  companyName: string;
  depotScopeLabel: string;
  paymentScopeLabel: string;
  approvedOnlyLabel: string;
  generatedByName: string;
  rowsLabel: string;
  formats: AdminExportFormat[];
  checklist: Array<{
    label: string;
    done: boolean;
  }>;
  auditReminder: string;
};

export const adminExportFilterGroups: AdminExportFilterGroup[] = [
  { label: "Monat", value: "Juli 2026" },
  { label: "Depot", value: "Alle Depots" },
  { label: "Zahlungsart", value: "Alle Zahlungsarten" },
];

export const adminExportPreviewRows: AdminExportPreviewRow[] = [
  {
    id: "EXP-2026-07-001",
    companyName: "Ivanov Transport",
    courierName: "Nico Weber",
    courierCode: "KUR-10458",
    shiftDate: "2026-07-01",
    dateLabel: "01.07.2026",
    depotCode: "MA-N",
    depotName: "Mannheim Nord",
    paymentMode: "hourly",
    paymentModeLabel: "Stundenlohn",
    startTime: "06:04",
    endTime: "16:17",
    grossMinutes: 613,
    grossTimeLabel: "10:13",
    breakMinutes: 45,
    breakTimeLabel: "00:45",
    netMinutes: 568,
    netTimeLabel: "09:28",
    billableMinutes: 600,
    billableTimeLabel: "10:00",
    billableSourceLabel: "Automatisch gedeckelt",
    overrideReason: null,
    status: "approved",
    statusLabel: "Genehmigt",
    statusTone: "success",
  },
  {
    id: "EXP-2026-07-002",
    companyName: "Ivanov Transport",
    courierName: "Elena Dimitrova",
    courierCode: "KUR-10412",
    shiftDate: "2026-07-01",
    dateLabel: "01.07.2026",
    depotCode: "MA-S",
    depotName: "Mannheim Sued",
    paymentMode: "daily_fixed",
    paymentModeLabel: "Tagespauschale",
    startTime: "07:02",
    endTime: "15:08",
    grossMinutes: 486,
    grossTimeLabel: "08:06",
    breakMinutes: 30,
    breakTimeLabel: "00:30",
    netMinutes: 456,
    netTimeLabel: "07:36",
    billableMinutes: 500,
    billableTimeLabel: "08:20",
    billableSourceLabel: "Tagespauschale",
    overrideReason: null,
    status: "approved",
    statusLabel: "Genehmigt",
    statusTone: "success",
  },
  {
    id: "EXP-2026-07-003",
    companyName: "Ivanov Transport",
    courierName: "Sofia Petrovic",
    courierCode: "KUR-10387",
    shiftDate: "2026-07-02",
    dateLabel: "02.07.2026",
    depotCode: "MA-S",
    depotName: "Mannheim Sued",
    paymentMode: "daily_fixed",
    paymentModeLabel: "Tagespauschale",
    startTime: "06:55",
    endTime: "15:42",
    grossMinutes: 527,
    grossTimeLabel: "08:47",
    breakMinutes: 45,
    breakTimeLabel: "00:45",
    netMinutes: 482,
    netTimeLabel: "08:02",
    billableMinutes: 500,
    billableTimeLabel: "08:20",
    billableSourceLabel: "Tagespauschale",
    overrideReason: null,
    status: "approved",
    statusLabel: "Genehmigt",
    statusTone: "success",
  },
  {
    id: "EXP-2026-07-004",
    companyName: "Ivanov Transport",
    courierName: "Ahmet Yilmaz",
    courierCode: "KUR-10231",
    shiftDate: "2026-07-02",
    dateLabel: "02.07.2026",
    depotCode: "MA-N",
    depotName: "Mannheim Nord",
    paymentMode: "hourly",
    paymentModeLabel: "Stundenlohn",
    startTime: "06:00",
    endTime: "14:12",
    grossMinutes: 492,
    grossTimeLabel: "08:12",
    breakMinutes: 45,
    breakTimeLabel: "00:45",
    netMinutes: 447,
    netTimeLabel: "07:27",
    billableMinutes: 447,
    billableTimeLabel: "07:27",
    billableSourceLabel: "Automatisch",
    overrideReason: null,
    status: "approved",
    statusLabel: "Genehmigt",
    statusTone: "success",
  },
  {
    id: "EXP-2026-07-005",
    companyName: "Ivanov Transport",
    courierName: "Maria Rossi",
    courierCode: "KUR-10344",
    shiftDate: "2026-07-03",
    dateLabel: "03.07.2026",
    depotCode: "HD",
    depotName: "Heidelberg",
    paymentMode: "hourly",
    paymentModeLabel: "Stundenlohn",
    startTime: "08:08",
    endTime: "16:20",
    grossMinutes: 492,
    grossTimeLabel: "08:12",
    breakMinutes: 30,
    breakTimeLabel: "00:30",
    netMinutes: 462,
    netTimeLabel: "07:42",
    billableMinutes: 480,
    billableTimeLabel: "08:00",
    billableSourceLabel: "Manuelle Korrektur",
    overrideReason: "Tour wegen Depotwechsel korrigiert",
    status: "approved",
    statusLabel: "Genehmigt",
    statusTone: "success",
  },
];

export const adminExportSummary = {
  approvedShifts: adminExportPreviewRows.length,
  couriers: new Set(adminExportPreviewRows.map((row) => row.courierCode)).size,
  realTimeLabel: "43:30",
  billableTimeLabel: "42:07",
  overrideCount: adminExportPreviewRows.filter((row) => row.overrideReason).length,
};

export const adminExportDraft: AdminExportDraft = {
  periodLabel: "Juli 2026",
  companyName: "Ivanov Transport",
  depotScopeLabel: "Alle Depots",
  paymentScopeLabel: "Alle Zahlungsarten",
  approvedOnlyLabel: "Nur genehmigte Schichten",
  generatedByName: "Nikolay Ivanov",
  rowsLabel: `${adminExportPreviewRows.length} Vorschauzeilen`,
  formats: [
    {
      label: "CSV",
      value: "steuerberater_juli_2026.csv",
      tone: "primary",
      description: "Kompakte Tabellenstruktur fuer DATEV/Steuerberater Import.",
    },
    {
      label: "XLSX",
      value: "steuerberater_juli_2026.xlsx",
      tone: "success",
      description: "Lesbare Monatsmappe mit Summenzeile und deutschen Spalten.",
    },
  ],
  checklist: [
    { label: "Monat ausgewaehlt", done: true },
    { label: "Nur genehmigte Schichten", done: true },
    { label: "Billable Minutes enthalten", done: true },
    { label: "CSV und XLSX sichtbar", done: true },
  ],
  auditReminder:
    "Reale Exporterstellung muss spaeter admin-berechtigt, company-scoped und mit Audit-Log-Eintrag gespeichert werden.",
};
