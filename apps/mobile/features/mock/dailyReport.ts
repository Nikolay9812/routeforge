import type { ShiftPhotoType } from "@routeforge/shared";

import type { RfIconName } from "@/components/ui/RfIcon";
import type { DailyReportValidationDraft } from "@/features/report/dailyReportValidation";

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
  photoType: ShiftPhotoType;
  required: boolean;
  state: "missing" | "uploaded";
};

export type DailyReportMock = {
  counters: DailyReportCounterMock[];
  dateLabel: string;
  depotFields: DailyReportFieldMock[];
  draftId: string;
  note: string;
  photos: DailyReportPhotoMock[];
  routeCode: string;
  routeLabel: string;
  shiftStatusLabel: string;
  signatureHelper: string;
  submittedHint: string;
  timeLabel: string;
  totalDurationLabel: string;
  validationDraft: DailyReportValidationDraft;
};

export const mockDailyReport: DailyReportMock = createMockDailyReport();

export function createMockDailyReport(): DailyReportMock {
  const shiftDate = getGermanLocalDateString(new Date());
  const dateLabel = formatReportDateLabel(shiftDate);
  const draftId = `daily-report-${shiftDate}-mannheim-hbw3`;

  return {
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
    dateLabel,
    depotFields: [
      {
        helper: "heutige Tour",
        iconName: "routes",
        label: "Tournummer",
        required: true,
        value: "1047",
      },
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
        label: "Kennzeichen",
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
    draftId,
    note:
      "Leichte Verkehrsbehinderung am Vormittag in Mannheim. Kunde bei Tour 1047 war nicht anwesend, zweiter Versuch geplant.",
    photos: [
      {
        helper: "Pflichtfoto",
        iconName: "speedometer",
        label: "Start-KM Foto",
        photoType: "start_km",
        required: true,
        state: "missing",
      },
      {
        helper: "Pflichtfoto",
        iconName: "speedometer-medium",
        label: "End-KM Foto",
        photoType: "end_km",
        required: true,
        state: "missing",
      },
      {
        helper: "Pflichtfoto",
        iconName: "book-open-variant",
        label: "Fahrtenbuch",
        photoType: "fahrtenbuch",
        required: true,
        state: "missing",
      },
      {
        helper: "Pflichtfoto",
        iconName: "cellphone-screenshot",
        label: "Mentor Screenshot",
        photoType: "mentor",
        required: true,
        state: "missing",
      },
    ],
    routeCode: "Tour 1047",
    routeLabel: "Heavy Bulky Mannheim",
    shiftStatusLabel: "Entwurf",
    signatureHelper: "Bestätige, dass die Angaben für diesen Bericht korrekt sind.",
    submittedHint: "Nach dem Einreichen kann der Bericht nicht mehr bearbeitet werden.",
    timeLabel: "07:00 - 16:30",
    totalDurationLabel: "9h 30min",
    validationDraft: {
      courierNote:
        "Leichte Verkehrsbehinderung am Vormittag in Mannheim. Kunde bei Tour 1047 war nicht anwesend, zweiter Versuch geplant.",
      courierProfileId: "2ebf9e0f-b502-44dd-a7b5-bb6f7f3414ac",
      depotId: "afc7a1e9-f420-4913-a3e1-9f2f8a09de41",
      endKm: 42286,
      endTime: `${shiftDate}T16:30:00.000+02:00`,
      packagesDelivered: 98,
      packagesPickedUp: 2,
      packagesReturned: 4,
      paymentModeSnapshot: "daily_fixed",
      requiredPhotoTypes: ["start_km", "end_km", "fahrtenbuch", "mentor"],
      shiftDate,
      signatureUrl: null,
      signedAt: null,
      startKm: 42118,
      startTime: `${shiftDate}T07:00:00.000+02:00`,
      totalStops: 74,
      tourNumber: "1047",
      uploadedPhotoTypes: [],
      vanPlate: "MA-RF 204",
    },
  };
}

export function getGermanLocalDateString(date: Date): string {
  const parts = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Berlin",
    year: "numeric",
  }).formatToParts(date);
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const year = parts.find((part) => part.type === "year")?.value ?? "2026";

  return `${year}-${month}-${day}`;
}

function formatReportDateLabel(shiftDate: string): string {
  const [year, month, day] = shiftDate.split("-").map(Number);
  const localNoon = new Date(Date.UTC(year, month - 1, day, 12));

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    timeZone: "Europe/Berlin",
    year: "numeric",
  }).format(localNoon);
}
