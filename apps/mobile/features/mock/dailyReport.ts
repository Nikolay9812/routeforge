import type { RfIconName } from "@/components/ui/RfIcon";

export type DailyReportFieldMock = {
  helper?: string;
  iconName: RfIconName;
  label: string;
  required?: boolean;
  value: string;
};

export type DailyReportCounterMock = {
  helper?: string;
  iconName: RfIconName;
  label: string;
  value: string;
};

export type DailyReportPhotoMock = {
  helper: string;
  iconName?: RfIconName;
  label: string;
  state: "missing" | "uploaded";
};

export type DailyReportMock = {
  counters: DailyReportCounterMock[];
  dateLabel: string;
  depotFields: DailyReportFieldMock[];
  note: string;
  photos: DailyReportPhotoMock[];
  routeCode: string;
  routeLabel: string;
  shiftStatusLabel: string;
  signatureHelper: string;
  signatureStatusLabel: string;
  submittedHint: string;
  timeLabel: string;
  totalDurationLabel: string;
};

export const mockDailyReport: DailyReportMock = {
  counters: [
    {
      helper: "zugestellt",
      iconName: "package-variant-closed",
      label: "Zustellungen",
      value: "98",
    },
    {
      helper: "Retouren",
      iconName: "backup-restore",
      label: "Rückläufer",
      value: "4",
    },
    {
      helper: "Kundenabholung",
      iconName: "hand-coin-outline",
      label: "Abholungen",
      value: "2",
    },
    {
      helper: "gesamt",
      iconName: "map-marker-distance",
      label: "Stopps",
      value: "74",
    },
  ],
  dateLabel: "27. Juni 2026",
  depotFields: [
    {
      helper: "zugewiesen",
      iconName: "warehouse",
      label: "Depot",
      required: true,
      value: "Mannheim HBW3",
    },
    {
      helper: "heutiges Fahrzeug",
      iconName: "truck-delivery-outline",
      label: "Fahrzeug",
      required: true,
      value: "MA-RF 204",
    },
    {
      helper: "Schichtbeginn",
      iconName: "speedometer",
      label: "Start-KM",
      required: true,
      value: "42.118",
    },
    {
      helper: "Schichtende",
      iconName: "speedometer",
      label: "End-KM",
      required: true,
      value: "42.286",
    },
  ],
  note:
    "Leichte Verkehrsbehinderung am Vormittag in Mannheim. Kunde bei Tour 1047 war nicht anwesend, zweiter Versuch geplant.",
  photos: [
    {
      helper: "Pflichtfoto",
      iconName: "speedometer",
      label: "Start-KM Foto",
      state: "uploaded",
    },
    {
      helper: "Pflichtfoto",
      iconName: "speedometer-medium",
      label: "End-KM Foto",
      state: "missing",
    },
    {
      helper: "Pflichtfoto",
      iconName: "book-open-variant",
      label: "Fahrtenbuch",
      state: "missing",
    },
    {
      helper: "Pflichtfoto",
      iconName: "cellphone-screenshot",
      label: "Mentor Screenshot",
      state: "missing",
    },
  ],
  routeCode: "Tour 1047",
  routeLabel: "Heavy Bulky Mannheim",
  shiftStatusLabel: "Entwurf",
  signatureHelper: "Die echte Unterschrift wird in RF-MOB-018 verbunden.",
  signatureStatusLabel: "Fehlt",
  submittedHint: "Nach dem Einreichen kann der Bericht nicht mehr bearbeitet werden.",
  timeLabel: "07:00 - 16:30",
  totalDurationLabel: "9h 30min",
};
