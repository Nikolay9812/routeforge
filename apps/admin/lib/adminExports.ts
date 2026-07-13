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

export type AdminExportFormat = {
  label: "CSV" | "XLSX";
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

export function formatExportMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(
    2,
    "0",
  )}`;
}

export function formatExportDate(value: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export function formatExportTime(value: string | null): string {
  if (!value) {
    return "Offen";
  }

  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getExportPaymentModeLabel(paymentMode: PaymentMode): string {
  return paymentMode === "hourly" ? "Stundenlohn" : "Tagespauschale";
}

export function getExportBillableSourceLabel(source: string): string {
  return source === "manual_override" ? "Manuelle Korrektur" : "Automatisch";
}
