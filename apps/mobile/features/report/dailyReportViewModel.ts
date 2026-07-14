import type { ShiftPhotoType } from "@routeforge/shared";

import type { RfIconName } from "@/components/ui/RfIcon";
import type { DailyReportValidationDraft } from "@/features/report/dailyReportValidation";

export type DailyReportPhotoViewModel = {
  helper: string;
  iconName?: RfIconName;
  label: string;
  photoType: ShiftPhotoType;
  required: boolean;
  state: "missing" | "uploaded";
};

export type DailyReportViewModel = {
  dateLabel: string;
  draftId: string;
  photos: DailyReportPhotoViewModel[];
  signatureHelper: string;
  submittedHint: string;
  validationDraft: DailyReportValidationDraft;
};

export const requiredShiftPhotoTypes: ShiftPhotoType[] = [
  "start_km",
  "end_km",
  "fahrtenbuch",
  "mentor",
];

export const dailyReportPhotoCards: DailyReportPhotoViewModel[] = [
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
];

export function createEmptyDailyReportViewModel({
  courierProfileId,
  depotId,
}: {
  courierProfileId: string | null;
  depotId: string | null;
}): DailyReportViewModel {
  const shiftDate = getGermanLocalDateString(new Date());

  return {
    dateLabel: formatReportDateLabel(shiftDate),
    draftId: `daily-report-${shiftDate}-${courierProfileId ?? "pending"}`,
    photos: dailyReportPhotoCards,
    signatureHelper: "Bestaetige, dass die Angaben fuer diesen Bericht korrekt sind.",
    submittedHint: "Nach dem Einreichen kann der Bericht nicht mehr bearbeitet werden.",
    validationDraft: {
      courierNote: null,
      courierProfileId: courierProfileId ?? "",
      depotId: depotId ?? "",
      endKm: -1,
      endTime: `${shiftDate}T00:00:00.000+01:00`,
      packagesDelivered: 0,
      packagesPickedUp: 0,
      packagesReturned: 0,
      paymentModeSnapshot: "daily_fixed",
      requiredPhotoTypes: requiredShiftPhotoTypes,
      shiftDate,
      signatureUrl: null,
      signedAt: null,
      startKm: -1,
      startTime: `${shiftDate}T00:00:00.000+01:00`,
      totalStops: 0,
      tourNumber: "",
      uploadedPhotoTypes: [],
      vanPlate: "",
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

export function formatReportDateLabel(shiftDate: string): string {
  const [year, month, day] = shiftDate.split("-").map(Number);
  const localNoon = new Date(Date.UTC(year, month - 1, day, 12));

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    timeZone: "Europe/Berlin",
    year: "numeric",
  }).format(localNoon);
}
