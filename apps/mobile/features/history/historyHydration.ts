import type {
  Shift,
  ShiftLocation,
  ShiftPhoto,
  ShiftPhotoType,
  ShiftSignatureArtifact,
  ShiftStatus,
} from "@routeforge/shared";

import type {
  HistoryCalendarDayViewModel,
  HistoryDayDetailViewModel,
  HistoryDayPhotoViewModel,
  HistoryDayReportRowViewModel,
  HistoryMonthViewModel,
  HistoryShiftViewModel,
  HistoryShiftStatus,
  HistorySummaryMetricViewModel,
} from "@/features/history/historyTypes";

export type HistoryMonthRange = {
  monthEnd: string;
  monthLabel: string;
  monthStart: string;
};

export type HydratedHistoryMonth = Pick<
  HistoryMonthViewModel,
  "calendarDays" | "filters" | "monthLabel" | "recentShifts" | "selectedDayHelper" | "shiftDetails" | "summary"
>;

export type ServerHistoryDayDetailInput = {
  courierName: string;
  depotLabel: string;
  locations: ShiftLocation[];
  photos: ShiftPhoto[];
  shift: Shift;
  signatureArtifact: ShiftSignatureArtifact | null;
};

const timeZone = "Europe/Berlin";

export function getCurrentGermanMonthRange(referenceDate = new Date()): HistoryMonthRange {
  const parts = new Intl.DateTimeFormat("en-CA", {
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(referenceDate);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  const year = Number(values.get("year"));
  const month = Number(values.get("month"));
  const monthStart = formatIsoDate(year, month, 1);
  const nextMonthDate = new Date(Date.UTC(year, month, 1, 12));
  const monthEnd = formatIsoDate(
    nextMonthDate.getUTCFullYear(),
    nextMonthDate.getUTCMonth() + 1,
    1,
  );

  return {
    monthEnd,
    monthLabel: formatMonthLabel(monthStart),
    monthStart,
  };
}

export function getGermanMonthRangeForIsoDate(shiftDate: string): HistoryMonthRange {
  return getCurrentGermanMonthRange(createDate(shiftDate));
}

export function createHydratedHistoryMonth({
  depotLabel,
  monthRange,
  shifts,
}: {
  depotLabel: string;
  monthRange: HistoryMonthRange;
  shifts: Shift[];
}): HydratedHistoryMonth {
  const shiftRows = shifts.map((shift) => createHistoryShiftFromServerShift(shift, depotLabel));
  const calendarDays = createCalendarDays(monthRange, shiftRows);
  const summary = createHistorySummary(shifts);

  return {
    calendarDays,
    filters: ["Status: Alle", `Depot: ${depotLabel}`],
    monthLabel: monthRange.monthLabel,
    recentShifts: shiftRows.slice(0, 5),
    selectedDayHelper: "Serverdaten aus deiner eigenen Kurier-Historie.",
    shiftDetails: shiftRows,
    summary,
  };
}

export function createHistoryShiftFromServerShift(
  shift: Shift,
  depotLabel: string,
): HistoryShiftViewModel {
  const grossMinutes = getGrossMinutes(shift);
  const statusDisplay = getStatusDisplay(shift.status);

  return {
    billableTimeLabel: formatMinutes(shift.billable_minutes),
    dateIso: shift.shift_date,
    dateLabel: formatShortDateLabel(shift.shift_date),
    dayLabel: formatShortWeekdayLabel(shift.shift_date),
    depotLabel,
    distanceLabel: formatDistanceLabel(shift),
    id: shift.id,
    packageLabel: `${shift.packages_delivered} Pakete`,
    paymentModeLabel:
      shift.payment_mode_snapshot === "daily_fixed" ? "Tagespauschale" : "Stundenbasis",
    realTimeLabel: formatMinutes(grossMinutes),
    routeLabel: shift.tour_number ? `Tour ${shift.tour_number}` : "Tour offen",
    status: statusDisplay.status,
    statusLabel: statusDisplay.label,
  };
}

export function createHistoryDayDetailFromServerShift({
  courierName,
  depotLabel,
  locations,
  photos,
  shift,
  signatureArtifact,
}: ServerHistoryDayDetailInput): HistoryDayDetailViewModel {
  const headerShift = createHistoryShiftFromServerShift(shift, depotLabel);
  const grossMinutes = getGrossMinutes(shift);
  const totalStops = shift.total_stops ?? getFallbackStopCount(shift);
  const startLocation = locations.find((location) => location.location_type === "start");
  const stopLocation = locations.find((location) => location.location_type === "stop");
  const geofenceWarning = createGeofenceWarning(startLocation, stopLocation);
  const submittedAtLabel = formatOptionalTime(shift.submitted_at ?? shift.signed_at);
  const isReadOnly = shift.status !== "draft" && shift.status !== "rejected";

  return {
    billablePercentLabel: createBillablePercentLabel(shift),
    courierIdLabel: `Kurier ID ${shift.courier_profile_id.slice(0, 8)}`,
    courierInitials: createInitials(courierName),
    courierName,
    dateIso: shift.shift_date,
    dateLabel: formatShortDateLabel(shift.shift_date),
    dayLabel: formatFullWeekdayLabel(shift.shift_date),
    detailRows: createDetailRows(shift, submittedAtLabel),
    geofenceWarning,
    headerShift,
    isReadOnly,
    kmSummary: {
      distanceLabel: formatDistanceLabel(shift),
      endKmLabel: formatKmLabel(shift.end_km),
      startKmLabel: formatKmLabel(shift.start_km),
    },
    note: createHistoryNote(shift),
    packageCounters: [
      {
        helper: "zugestellt",
        iconName: "package-variant-closed-check",
        label: "Pakete",
        value: String(Math.max(shift.packages_delivered, 0)),
      },
      {
        helper: "zurueck",
        iconName: "package-variant",
        label: "Retouren",
        value: String(Math.max(shift.packages_returned, 0)),
      },
      {
        helper: "Kunden",
        iconName: "tray-arrow-down",
        label: "Abholungen",
        value: String(Math.max(shift.packages_picked_up, 0)),
      },
      {
        helper: "gesamt",
        iconName: "map-marker-path",
        label: "Stopps",
        value: String(totalStops),
      },
    ],
    pdfLabel: "Tages-PDF herunterladen",
    photos: createPhotoStates(photos),
    signature: createSignatureDetail({
      courierName,
      shift,
      signatureArtifact,
    }),
    timeMetrics: [
      {
        helper: formatShortDateLabel(shift.shift_date),
        iconName: "play-outline",
        label: "Startzeit",
        tone: startLocation?.is_inside_depot_geofence === false ? "warning" : "default",
        value: formatOptionalTime(shift.start_time),
      },
      {
        helper: formatShortDateLabel(shift.shift_date),
        iconName: "stop-circle-outline",
        label: "Endzeit",
        tone: stopLocation?.is_inside_depot_geofence === false ? "warning" : "default",
        value: formatOptionalTime(shift.end_time),
      },
      {
        helper: createTimeRangeLabel(shift),
        iconName: "clock-outline",
        label: "Nettozeit",
        value: formatMinutes(shift.net_minutes > 0 ? shift.net_minutes : grossMinutes),
      },
      {
        helper:
          shift.payment_mode_snapshot === "daily_fixed" ? "Standard 8:20" : "Stundenbasis",
        iconName: "cash-clock",
        label: "Abrechenbar",
        value: formatMinutes(shift.billable_minutes),
      },
      {
        helper: shift.break_minutes > 0 ? "Pause erfasst" : "Keine Pause erfasst",
        iconName: "coffee-outline",
        label: "Pause",
        value: formatMinutes(shift.break_minutes),
      },
      {
        helper: shift.depot_id.slice(0, 8),
        iconName: "warehouse",
        label: "Depot",
        value: depotLabel,
      },
      {
        helper:
          shift.payment_mode_snapshot === "daily_fixed"
            ? "Tagespauschale"
            : "Stundenbasis",
        iconName: "calendar-clock",
        label: "Schichttyp",
        value: shift.payment_mode_snapshot === "daily_fixed" ? "Fix" : "Standard",
      },
      {
        helper: isReadOnly ? "Schreibgeschuetzt" : "Bearbeitbar",
        iconName: "shield-check-outline",
        label: "Status",
        tone: shift.status === "approved" || shift.status === "corrected" ? "success" : "default",
        value: headerShift.statusLabel,
      },
    ],
  };
}

function createCalendarDays(
  monthRange: HistoryMonthRange,
  shifts: HistoryShiftViewModel[],
): HistoryCalendarDayViewModel[] {
  const [year, month] = monthRange.monthStart.split("-").map(Number);
  const firstDay = new Date(Date.UTC(year, month - 1, 1, 12));
  const lastDay = new Date(Date.UTC(year, month, 0, 12));
  const leadingDays = (firstDay.getUTCDay() + 6) % 7;
  const daysInMonth = lastDay.getUTCDate();
  const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7;
  const firstVisibleDay = new Date(firstDay);
  firstVisibleDay.setUTCDate(firstVisibleDay.getUTCDate() - leadingDays);
  const shiftIdByDate = new Map(shifts.map((shift) => [shift.dateIso, shift.id]));
  const todayIso = formatGermanDateString();

  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(firstVisibleDay);
    date.setUTCDate(firstVisibleDay.getUTCDate() + index);
    const dateIso = formatIsoDate(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
    );
    const isCurrentMonth = date.getUTCMonth() === month - 1;

    return {
      dateLabel: dateIso,
      dayNumber: String(date.getUTCDate()),
      isCurrentMonth,
      isToday: dateIso === todayIso,
      shiftId: shiftIdByDate.get(dateIso),
    };
  });
}

function createHistorySummary(shifts: Shift[]): HistorySummaryMetricViewModel[] {
  const grossMinutes = shifts.reduce((total, shift) => total + getGrossMinutes(shift), 0);
  const billableMinutes = shifts.reduce(
    (total, shift) => total + Math.max(shift.billable_minutes, 0),
    0,
  );

  return [
    {
      helper: "echte Zeit",
      iconName: "clock-outline",
      label: "Arbeitszeit",
      value: formatHoursSummary(grossMinutes),
    },
    {
      helper: "abrechenbar",
      iconName: "clock-check-outline",
      label: "Abrechenbar",
      value: formatHoursSummary(billableMinutes),
    },
    {
      helper: "im Monat",
      iconName: "calendar-check-outline",
      label: "Schichten",
      value: String(shifts.length),
    },
  ];
}

function getStatusDisplay(status: ShiftStatus): {
  label: string;
  status: HistoryShiftStatus;
} {
  switch (status) {
    case "approved":
      return { label: "Abgeschlossen", status: "approved" };
    case "corrected":
      return { label: "Korrigiert", status: "approved" };
    case "draft":
      return { label: "Entwurf", status: "draft" };
    case "rejected":
      return { label: "Rueckfrage", status: "rejected" };
    case "submitted":
      return { label: "Eingereicht", status: "submitted" };
    case "under_review":
      return { label: "In Pruefung", status: "submitted" };
  }
}

function getGrossMinutes(shift: Shift): number {
  if (shift.gross_minutes > 0) {
    return shift.gross_minutes;
  }

  if (!shift.end_time) {
    return 0;
  }

  const startMs = Date.parse(shift.start_time);
  const endMs = Date.parse(shift.end_time);

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
    return 0;
  }

  return Math.floor((endMs - startMs) / 60000);
}

function formatDistanceLabel(shift: Shift): string {
  const distance = shift.end_km - shift.start_km;

  return distance > 0 ? `${distance} km` : "-- km";
}

function createBillablePercentLabel(shift: Shift): string {
  if (shift.billable_source === "manual_override") {
    return "Korrektur";
  }

  if (shift.payment_mode_snapshot === "daily_fixed") {
    return "Pauschale";
  }

  if (shift.net_minutes <= 0) {
    return "--";
  }

  return `${Math.round((shift.billable_minutes / shift.net_minutes) * 100)}%`;
}

function createDetailRows(
  shift: Shift,
  submittedAtLabel: string,
): HistoryDayReportRowViewModel[] {
  const noteText = shift.rejection_reason
    ? "Rueckfrage vorhanden"
    : shift.courier_note
      ? "Kuriernotiz vorhanden"
      : shift.missing_proof_explanation
        ? "Nachweis-Erklaerung vorhanden"
        : "Alles vollstaendig";

  return [
    {
      helper:
        shift.submitted_at || shift.signed_at
          ? "Bericht wurde serverseitig eingereicht"
          : "Bericht noch nicht eingereicht",
      iconName: "clipboard-text-outline",
      label: "Tagesbericht",
      statusLabel: getStatusDisplay(shift.status).label,
      value: submittedAtLabel,
    },
    {
      helper: shift.rejection_reason ?? shift.courier_note ?? "Keine offenen Rueckfragen",
      iconName: "message-text-outline",
      label: "Notizen",
      value: noteText,
    },
  ];
}

function createGeofenceWarning(
  startLocation: ShiftLocation | undefined,
  stopLocation: ShiftLocation | undefined,
): HistoryDayDetailViewModel["geofenceWarning"] {
  if (!startLocation || !stopLocation) {
    return {
      helper: "Start- oder Endstandort fehlt im Backend.",
      title: "Standortnachweis ausserhalb oder nicht vollstaendig",
    };
  }

  if (startLocation.capture_status === "missing" || stopLocation.capture_status === "missing") {
    return {
      helper: `Start: ${formatLocationCaptureStatus(startLocation)} - Ende: ${formatLocationCaptureStatus(stopLocation)}`,
      title: "Standortnachweis fehlt oder ist nicht vollstaendig",
    };
  }

  if (
    startLocation.is_inside_depot_geofence === false ||
    stopLocation.is_inside_depot_geofence === false
  ) {
    return {
      helper: `Start: ${formatMeters(startLocation.distance_from_depot_meters)} entfernt - Ende: ${formatMeters(stopLocation.distance_from_depot_meters)} entfernt`,
      title: "Start oder Ende ausserhalb der Depot-Geofence",
    };
  }

  return {
    helper: "Start und Ende lagen innerhalb des Depotbereichs.",
    title: "Start und Ende innerhalb der Depot-Geofence",
  };
}

function formatLocationCaptureStatus(location: ShiftLocation): string {
  if (location.capture_status === "captured") {
    return "gespeichert";
  }

  return location.missing_reason === "permission_denied"
    ? "Berechtigung verweigert"
    : "nicht verfuegbar";
}

function createHistoryNote(shift: Shift): string {
  if (shift.rejection_reason) {
    return `Rueckfrage: ${shift.rejection_reason}`;
  }

  if (shift.billable_override_reason) {
    return `Abrechnungszeit korrigiert: ${shift.billable_override_reason}`;
  }

  if (shift.courier_note) {
    return shift.courier_note;
  }

  if (shift.missing_proof_explanation) {
    return `Nachweis-Erklaerung: ${shift.missing_proof_explanation}`;
  }

  return "Bericht wurde aus deiner eigenen Backend-Historie geladen.";
}

function createPhotoStates(photos: ShiftPhoto[]): HistoryDayPhotoViewModel[] {
  const photosByType = new Map(photos.map((photo) => [photo.photo_type, photo]));
  const photoTypes: ShiftPhotoType[] = ["start_km", "end_km", "fahrtenbuch", "mentor"];

  return photoTypes.map((photoType) => {
    const photo = photosByType.get(photoType);

    return {
      helper: photo ? `${formatOptionalTime(photo.uploaded_at)} hochgeladen` : "Nicht vorhanden",
      iconName: getPhotoIconName(photoType),
      label: getPhotoLabel(photoType),
      state: photo ? "available" : "missing",
    };
  });
}

function createSignatureDetail({
  courierName,
  shift,
  signatureArtifact,
}: {
  courierName: string;
  shift: Shift;
  signatureArtifact: ShiftSignatureArtifact | null;
}): HistoryDayDetailViewModel["signature"] {
  if (signatureArtifact) {
    return {
      helper: "Private Server-Signatur wurde fuer diese Schicht verifiziert.",
      signedAtLabel: formatDateTimeLabel(signatureArtifact.signed_at),
      signedByLabel: signatureArtifact.signed_by_name,
      storageLabel: "Server-Nachweis verfuegbar",
    };
  }

  if (shift.signed_at) {
    return {
      helper: "Signatur-Metadaten sind in der Schicht gespeichert.",
      signedAtLabel: formatDateTimeLabel(shift.signed_at),
      signedByLabel: courierName,
      storageLabel: "Signaturdatei nicht geladen",
    };
  }

  return {
    helper: "Noch keine Signatur fuer diese Schicht gespeichert.",
    signedAtLabel: "--",
    signedByLabel: courierName,
    storageLabel: "Nicht verfuegbar",
  };
}

function createTimeRangeLabel(shift: Shift): string {
  if (!shift.end_time) {
    return "Schicht laeuft oder ist noch offen";
  }

  return `${formatOptionalTime(shift.start_time)} - ${formatOptionalTime(shift.end_time)}`;
}

function createInitials(name: string): string {
  const initials = name
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return initials || "RF";
}

function getFallbackStopCount(shift: Shift): number {
  return Math.max(
    shift.packages_delivered + shift.packages_returned + shift.packages_picked_up,
    0,
  );
}

function getPhotoIconName(photoType: ShiftPhotoType): HistoryDayPhotoViewModel["iconName"] {
  switch (photoType) {
    case "end_km":
      return "speedometer-slow";
    case "fahrtenbuch":
      return "book-open-page-variant-outline";
    case "mentor":
      return "cellphone-screenshot";
    case "start_km":
      return "speedometer";
  }
}

function getPhotoLabel(photoType: ShiftPhotoType): string {
  switch (photoType) {
    case "end_km":
      return "End KM";
    case "fahrtenbuch":
      return "Fahrtenbuch";
    case "mentor":
      return "Mentor";
    case "start_km":
      return "Start KM";
  }
}

function formatKmLabel(value: number): string {
  return value > 0 ? `${value} km` : "-- km";
}

function formatMeters(value: number | null): string {
  if (value === null) {
    return "unbekannt";
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(".", ",")} km`;
  }

  return `${Math.round(value)} m`;
}

function formatMinutes(totalMinutes: number): string {
  const safeMinutes = Math.max(Math.floor(totalMinutes), 0);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  return `${hours}h ${String(minutes).padStart(2, "0")}min`;
}

function formatHoursSummary(totalMinutes: number): string {
  const safeMinutes = Math.max(Math.floor(totalMinutes), 0);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  return `${hours}:${String(minutes).padStart(2, "0")} h`;
}

function formatShortDateLabel(shiftDate: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    timeZone,
  }).format(createDate(shiftDate));
}

function formatShortWeekdayLabel(shiftDate: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone,
    weekday: "short",
  }).format(createDate(shiftDate));
}

function formatFullWeekdayLabel(shiftDate: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone,
    weekday: "long",
  }).format(createDate(shiftDate));
}

function formatDateTimeLabel(value: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).format(new Date(value));
}

function formatOptionalTime(value: string | null): string {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(new Date(value));
}

function formatMonthLabel(shiftDate: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    month: "long",
    timeZone,
    year: "numeric",
  }).format(createDate(shiftDate));
}

function formatGermanDateString(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);
  const values = new Map(parts.map((part) => [part.type, part.value]));

  return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}

function createDate(shiftDate: string): Date {
  const [year, month, day] = shiftDate.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day, 12));
}

function formatIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

