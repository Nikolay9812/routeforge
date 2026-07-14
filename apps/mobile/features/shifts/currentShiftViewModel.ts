import type { PaymentMode } from "@routeforge/shared";

import type { RfIconName } from "@/components/ui/RfIcon";

type StatusTone = "success" | "info" | "warning" | "neutral";

export type CurrentShiftCheckpointViewModel = {
  accentClassName: string;
  description: string;
  iconName: RfIconName;
  label: string;
  statusLabel: string;
};

export type CurrentShiftMetricViewModel = {
  helper: string;
  iconName: RfIconName;
  label: string;
  value: string;
};

export type CurrentShiftViewModel = {
  billableSummary:
    | {
        helper: string;
        label: string;
        value: string;
      }
    | null;
  breakHint: string;
  breakLabel: string;
  checkpoints: CurrentShiftCheckpointViewModel[];
  dateLabel: string;
  depotId: string;
  depotAddress: string;
  depotName: string;
  locationSummary: string;
  packageMetrics: CurrentShiftMetricViewModel[];
  paymentMode: PaymentMode;
  paymentModeLabel: string;
  paymentSummary: string;
  plannedDurationLabel: string;
  plannedStartLabel: string;
  plannedWindowLabel: string;
  primaryActionLabel: string;
  proofSummary: string;
  reportStatusLabel: string;
  statusLabel: string;
  statusTone: StatusTone;
  syncStatusLabel: string;
  timerTitleLabel: string;
  timerLabel: string;
  vehicleLabel: string;
  vehicleStatusLabel: string;
};

export const baseCurrentShiftViewModel: CurrentShiftViewModel = {
  billableSummary: {
    helper: "Standardwert. Korrektur nur im Review mit Grund.",
    label: "Abrechenbar",
    value: "8:20h",
  },
  breakHint: "Automatisch berechnet",
  breakLabel: "Offen",
  checkpoints: [
    {
      accentClassName: "bg-rfWarning",
      description: "Wird beim Start gespeichert",
      iconName: "map-marker",
      label: "Start (GPS)",
      statusLabel: "Noch offen",
    },
    {
      accentClassName: "bg-rfWarning",
      description: "Wird beim Ende gespeichert",
      iconName: "map-marker",
      label: "Ende (GPS)",
      statusLabel: "Noch offen",
    },
  ],
  dateLabel: "Heute",
  depotId: "",
  depotAddress: "Depot nicht zugewiesen",
  depotName: "Depot nicht zugewiesen",
  locationSummary: "GPS nur beim Start und Ende. Keine Live-Ortung.",
  packageMetrics: [
    {
      helper: "Im Bericht",
      iconName: "package-variant-closed",
      label: "Zustellungen",
      value: "0",
    },
    {
      helper: "Im Bericht",
      iconName: "backup-restore",
      label: "Ruecklaeufer",
      value: "0",
    },
    {
      helper: "Im Bericht",
      iconName: "hand-coin-outline",
      label: "Abholungen",
      value: "0",
    },
  ],
  paymentMode: "daily_fixed",
  paymentModeLabel: "Tagespauschale",
  paymentSummary: "Echte Arbeitszeit wird gespeichert.",
  plannedDurationLabel: "Offen",
  plannedStartLabel: "Offen",
  plannedWindowLabel: "Offen",
  primaryActionLabel: "Schicht starten",
  proofSummary: "Nachweise werden im Tagesbericht erfasst.",
  reportStatusLabel: "Noch nicht begonnen",
  statusLabel: "Noch nicht gestartet",
  statusTone: "success",
  syncStatusLabel: "Online bereit",
  timerTitleLabel: "Echte Arbeitszeit heute",
  timerLabel: "00:00",
  vehicleLabel: "Nicht eingetragen",
  vehicleStatusLabel: "Im Bericht",
};
