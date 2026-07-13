import type { PaymentMode, ShiftStatus } from "@routeforge/shared";

export type AdminShiftTone =
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "neutral";

export type AdminShiftGeofenceState = "inside" | "outside" | "missing";

export type AdminShiftListItem = {
  id: string;
  courierName: string;
  courierCode: string;
  shiftDate: string;
  dateLabel: string;
  depotName: string;
  depotCode: string;
  startTime: string;
  endTime: string;
  grossTime: string;
  breakTime: string;
  billableTime: string;
  paymentMode: PaymentMode;
  paymentModeLabel: string;
  status: ShiftStatus;
  statusLabel: string;
  statusTone: AdminShiftTone;
  geofenceState: AdminShiftGeofenceState;
  geofenceLabel: string;
  geofenceTone: AdminShiftTone;
  geofenceDetail: string;
  packageSummary: string;
  submittedAt: string;
  href: string;
};

export type AdminShiftFilterOption = {
  label: string;
  value: string;
};

export type AdminShiftFilterOptions = {
  couriers: AdminShiftFilterOption[];
  dates: AdminShiftFilterOption[];
  depots: AdminShiftFilterOption[];
  paymentModes: AdminShiftFilterOption[];
  statuses: AdminShiftFilterOption[];
};

export type AdminShiftSummary = {
  approvedToday: number;
  geofenceWarnings: number;
  submitted: number;
  underReview: number;
};

export function getShiftStatusLabel(status: ShiftStatus): string {
  const labels: Record<ShiftStatus, string> = {
    approved: "Genehmigt",
    corrected: "Korrigiert",
    draft: "Entwurf",
    rejected: "Abgelehnt",
    submitted: "Eingereicht",
    under_review: "In Pruefung",
  };

  return labels[status];
}

export function getShiftStatusTone(status: ShiftStatus): AdminShiftTone {
  const tones: Record<ShiftStatus, AdminShiftTone> = {
    approved: "success",
    corrected: "primary",
    draft: "neutral",
    rejected: "error",
    submitted: "info",
    under_review: "warning",
  };

  return tones[status];
}

export function getPaymentModeLabel(paymentMode: PaymentMode): string {
  return paymentMode === "hourly" ? "Stundenlohn" : "Tagespauschale";
}

export function formatMinutes(minutes: number): string {
  const safeMinutes = Math.max(Math.trunc(minutes), 0);
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
}

export function formatDateLabel(value: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export function formatDateTimeLabel(value: string | null): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatTimeLabel(value: string | null): string {
  if (!value) {
    return "Offen";
  }

  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
