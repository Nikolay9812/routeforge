import type { PaymentMode } from "@routeforge/shared";

import type { RfIconName } from "@/components/ui/RfIcon";

type StatusTone = "success" | "info" | "warning" | "neutral";

export type CurrentShiftCheckpointMock = {
  accentClassName: string;
  description: string;
  iconName: RfIconName;
  label: string;
  statusLabel: string;
};

export type CurrentShiftMetricMock = {
  helper: string;
  iconName: RfIconName;
  label: string;
  value: string;
};

export type CurrentShiftMock = {
  billableSummary:
    | {
        helper: string;
        label: string;
        value: string;
      }
    | null;
  breakHint: string;
  breakLabel: string;
  checkpoints: CurrentShiftCheckpointMock[];
  dateLabel: string;
  depotId: string;
  depotAddress: string;
  depotName: string;
  locationSummary: string;
  packageMetrics: CurrentShiftMetricMock[];
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

export const mockCurrentShift: CurrentShiftMock = {
  billableSummary: {
    helper: "Standardwert. Korrektur nur im Review mit Grund.",
    label: "Abrechenbar",
    value: "8:20h",
  },
  breakHint: "Automatisch berechnet",
  breakLabel: "45min",
  checkpoints: [
    {
      accentClassName: "bg-rfSuccess",
      description: "Am Depot starten",
      iconName: "map-marker",
      label: "Start (GPS)",
      statusLabel: "Noch offen",
    },
    {
      accentClassName: "bg-rfError",
      description: "Am Depot beenden",
      iconName: "map-marker",
      label: "Ende (GPS)",
      statusLabel: "Noch offen",
    },
  ],
  dateLabel: "Sonntag, 28. Juni 2026",
  depotId: "mannheim-hbw3",
  depotAddress: "Mallaustrasse 99, Mannheim",
  depotName: "Mannheim HBW3",
  locationSummary: "GPS nur beim Start und Ende. Keine Live-Ortung.",
  packageMetrics: [
    {
      helper: "Heute erfasst",
      iconName: "package-variant-closed",
      label: "Zustellungen",
      value: "0",
    },
    {
      helper: "Retouren",
      iconName: "backup-restore",
      label: "Rückläufer",
      value: "0",
    },
    {
      helper: "Kundenabholung",
      iconName: "hand-coin-outline",
      label: "Abholungen",
      value: "0",
    },
  ],
  paymentMode: "daily_fixed",
  paymentModeLabel: "Tagespauschale",
  paymentSummary: "Echte Arbeitszeit wird gespeichert. Abrechnung standardmaessig 8:20h.",
  plannedDurationLabel: "9h 00min",
  plannedStartLabel: "07:00",
  plannedWindowLabel: "07:00 - 16:00",
  primaryActionLabel: "Schicht starten",
  proofSummary: "Fotos bei Start und Ende erforderlich.",
  reportStatusLabel: "Noch nicht begonnen",
  statusLabel: "Noch nicht gestartet",
  statusTone: "success",
  syncStatusLabel: "Online bereit",
  timerTitleLabel: "Echte Arbeitszeit heute",
  timerLabel: "00:00",
  vehicleLabel: "MA-RF 204",
  vehicleStatusLabel: "Heute zugeteilt",
};
