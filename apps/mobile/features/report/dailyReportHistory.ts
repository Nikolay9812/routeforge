import type { ShiftPhotoType } from "@routeforge/shared";

import type {
  HistoryDayDetailMock,
  HistoryDayPhotoMock,
  HistoryShiftMock,
} from "@/features/mock/history";
import type { StoredDailyReportDraft } from "@/features/report/dailyReportDraftStorage";

const photoLabels: Record<ShiftPhotoType, string> = {
  end_km: "End-KM Foto",
  fahrtenbuch: "Fahrtenbuch",
  mentor: "Mentor Screenshot",
  start_km: "Start-KM Foto",
};

export function createHistoryShiftFromSubmittedReport(
  report: StoredDailyReportDraft,
): HistoryShiftMock {
  const draft = report.validationDraft;

  return {
    billableTimeLabel: "8h 20min",
    dateIso: draft.shiftDate,
    dateLabel: formatShortDateLabel(draft.shiftDate),
    dayLabel: formatShortWeekdayLabel(draft.shiftDate),
    depotLabel: "Mannheim HBW3",
    distanceLabel: `${Math.max(draft.endKm - draft.startKm, 0)} km`,
    id: report.draftId,
    packageLabel: `${draft.packagesDelivered} Pakete`,
    paymentModeLabel: draft.paymentModeSnapshot === "daily_fixed" ? "Tagespauschale" : "Stundenbasis",
    realTimeLabel: "9h 30min",
    routeLabel: `Tour ${draft.tourNumber}`,
    status: "submitted",
    statusLabel: "Eingereicht",
  };
}

export function createHistoryDayDetailFromSubmittedReport(
  report: StoredDailyReportDraft,
): HistoryDayDetailMock {
  const draft = report.validationDraft;
  const headerShift = createHistoryShiftFromSubmittedReport(report);
  const uploadedPhotoTypes = new Set(draft.uploadedPhotoTypes);
  const photos: HistoryDayPhotoMock[] = draft.requiredPhotoTypes.map((photoType) => ({
    helper: uploadedPhotoTypes.has(photoType)
      ? "Server-Nachweis vorhanden"
      : report.missingProofExplanation || "Pflichtfoto fehlt",
    iconName:
      photoType === "mentor"
        ? "cellphone-screenshot"
        : photoType === "fahrtenbuch"
          ? "book-open-page-variant-outline"
          : "speedometer",
    label: photoLabels[photoType],
    state: uploadedPhotoTypes.has(photoType) ? "available" : "missing",
  }));

  return {
    billablePercentLabel: draft.paymentModeSnapshot === "daily_fixed" ? "Pauschale" : "Lokal",
    courierIdLabel: "Kurier ID 1057",
    courierInitials: "MK",
    courierName: "Mihail Kolev",
    dateIso: draft.shiftDate,
    dateLabel: formatShortDateLabel(draft.shiftDate),
    dayLabel: formatFullWeekdayLabel(draft.shiftDate),
    detailRows: [
      {
        helper: "Serverbestaetigt eingereicht",
        iconName: "clipboard-text-outline",
        label: "Tagesbericht",
        statusLabel: "Eingereicht",
        value: report.submittedAt ? formatTimeLabel(report.submittedAt) : "Heute",
      },
      {
        helper: report.missingProofExplanation || "Keine offene Erklärung",
        iconName: "message-text-outline",
        label: "Erklärung",
        value: report.missingProofExplanation ? "Vorhanden" : "Keine",
      },
    ],
    geofenceWarning: {
      helper: "Start/Stop-GPS wird später durch den Backend-Abgleich geprüft.",
      title: "Sync wartet auf Backend-Anbindung",
    },
    headerShift,
    isReadOnly: true,
    kmSummary: {
      distanceLabel: `${Math.max(draft.endKm - draft.startKm, 0)} km`,
      endKmLabel: `${draft.endKm} km`,
      startKmLabel: `${draft.startKm} km`,
    },
    note:
      draft.courierNote ||
      "Bericht eingereicht. Für Korrekturen wenden Sie sich an Ihren Disponenten.",
    packageCounters: [
      {
        helper: "zugestellt",
        iconName: "package-variant-closed-check",
        label: "Pakete",
        value: String(draft.packagesDelivered),
      },
      {
        helper: "zurück",
        iconName: "package-variant",
        label: "Rückläufer",
        value: String(draft.packagesReturned),
      },
      {
        helper: "Kunden",
        iconName: "tray-arrow-down",
        label: "Abholungen",
        value: String(draft.packagesPickedUp),
      },
      {
        helper: "gesamt",
        iconName: "map-marker-path",
        label: "Stopps",
        value: String(draft.totalStops ?? 0),
      },
    ],
    pdfLabel: "Tageszusammenfassung (PDF)",
    photos,
    signature: {
      helper: "Unterschrift ist lokal bestätigt und schreibgeschützt.",
      signedAtLabel: draft.signedAt ? formatSignedAtLabel(draft.signedAt) : "nicht signiert",
      signedByLabel: "Mihail Kolev",
    },
    timeMetrics: [
      {
        helper: formatShortDateLabel(draft.shiftDate),
        iconName: "play-outline",
        label: "Startzeit",
        value: "07:00",
      },
      {
        helper: formatShortDateLabel(draft.shiftDate),
        iconName: "stop-circle-outline",
        label: "Endzeit",
        value: "16:30",
      },
      {
        helper: "07:00 - 16:30",
        iconName: "clock-outline",
        label: "Nettozeit",
        value: "9h 30min",
      },
      {
        helper: draft.paymentModeSnapshot === "daily_fixed" ? "Standard 8:20" : "Stundenbasis",
        iconName: "cash-clock",
        label: "Abrechenbar",
        value: "8h 20min",
      },
      {
        helper: "lokal",
        iconName: "coffee-outline",
        label: "Pause",
        value: "0h 45min",
      },
      {
        helper: "Mannheim",
        iconName: "warehouse",
        label: "Depot",
        value: "HBW3",
      },
      {
        helper: draft.paymentModeSnapshot === "daily_fixed" ? "Tagespauschale" : "Stundenbasis",
        iconName: "calendar-clock",
        label: "Schichttyp",
        value: draft.paymentModeSnapshot === "daily_fixed" ? "Fix" : "Standard",
      },
      {
        helper: "Wartet auf Backend-Anbindung",
        iconName: "shield-check-outline",
        label: "Status",
        value: "Eingereicht",
      },
    ],
  };
}

function createDate(shiftDate: string): Date {
  const [year, month, day] = shiftDate.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day, 12));
}

function formatShortDateLabel(shiftDate: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Berlin",
  }).format(createDate(shiftDate));
}

function formatShortWeekdayLabel(shiftDate: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    weekday: "short",
  }).format(createDate(shiftDate));
}

function formatFullWeekdayLabel(shiftDate: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    weekday: "long",
  }).format(createDate(shiftDate));
}

function formatTimeLabel(value: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(new Date(value));
}

function formatSignedAtLabel(value: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Berlin",
    year: "numeric",
  }).format(new Date(value));
}
