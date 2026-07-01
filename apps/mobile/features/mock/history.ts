import type { RfIconName } from "@/components/ui/RfIcon";

export type HistoryShiftStatus = "approved" | "submitted" | "rejected";

export type HistoryCalendarDayMock = {
  dateLabel: string;
  dayNumber: string;
  isCurrentMonth: boolean;
  isToday?: boolean;
  shiftId?: string;
};

export type HistorySummaryMetricMock = {
  helper: string;
  iconName: RfIconName;
  label: string;
  value: string;
};

export type HistoryShiftMock = {
  billableTimeLabel: string;
  dateIso: string;
  dateLabel: string;
  dayLabel: string;
  depotLabel: string;
  distanceLabel: string;
  id: string;
  packageLabel: string;
  paymentModeLabel: string;
  realTimeLabel: string;
  routeLabel: string;
  status: HistoryShiftStatus;
  statusLabel: string;
};

export type HistoryDayMetricMock = {
  helper: string;
  iconName: RfIconName;
  label: string;
  tone?: "default" | "success" | "warning";
  value: string;
};

export type HistoryDayPhotoMock = {
  helper: string;
  iconName: RfIconName;
  label: string;
  state: "available" | "expired" | "missing";
};

export type HistoryDayReportRowMock = {
  helper: string;
  iconName: RfIconName;
  label: string;
  statusLabel?: string;
  value: string;
};

export type HistoryDayDetailMock = {
  billablePercentLabel: string;
  courierIdLabel: string;
  courierInitials: string;
  courierName: string;
  dateIso: string;
  dateLabel: string;
  dayLabel: string;
  detailRows: HistoryDayReportRowMock[];
  geofenceWarning: {
    helper: string;
    title: string;
  };
  headerShift: HistoryShiftMock;
  isReadOnly: boolean;
  kmSummary: {
    distanceLabel: string;
    endKmLabel: string;
    startKmLabel: string;
  };
  note: string;
  packageCounters: {
    helper: string;
    iconName: RfIconName;
    label: string;
    value: string;
  }[];
  pdfLabel: string;
  photos: HistoryDayPhotoMock[];
  signature: {
    helper: string;
    signedAtLabel: string;
    signedByLabel: string;
  };
  timeMetrics: HistoryDayMetricMock[];
};

export type HistoryMonthMock = {
  calendarDays: HistoryCalendarDayMock[];
  filters: string[];
  monthLabel: string;
  monthlyPdfLabel: string;
  recentShifts: HistoryShiftMock[];
  selectedDayHelper: string;
  shiftDetails: HistoryShiftMock[];
  summary: HistorySummaryMetricMock[];
};

const dayLabels = ["Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa.", "So."];
const fullDayLabels = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const workedDays = [2, 3, 4, 5, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 27, 28, 29];

function getShiftId(dayNumber: number) {
  return `shift-2026-06-${String(dayNumber).padStart(2, "0")}`;
}

function getDayLabel(dayNumber: number) {
  return dayLabels[(dayNumber - 1) % dayLabels.length];
}

function getFullDayLabel(dayNumber: number) {
  return fullDayLabels[(dayNumber - 1) % fullDayLabels.length];
}

function createShift(dayNumber: number, index: number): HistoryShiftMock {
  const status = dayNumber === 27 ? "rejected" : dayNumber === 29 ? "submitted" : "approved";
  const paymentModeLabel = dayNumber === 27 ? "Tagespauschale" : "Stundenbasis";
  const realMinutes = 470 + (index % 6) * 5;
  const billableMinutes = paymentModeLabel === "Tagespauschale" ? 500 : realMinutes - 30;

  return {
    billableTimeLabel: formatMinutes(billableMinutes),
    dateIso: `2026-06-${String(dayNumber).padStart(2, "0")}`,
    dateLabel: `${dayNumber}. Juni`,
    dayLabel: getDayLabel(dayNumber),
    depotLabel: "Mannheim HBW3",
    distanceLabel: `${142 + (index % 7) * 6} km`,
    id: getShiftId(dayNumber),
    packageLabel: `${86 + (index % 8) * 3} Pakete`,
    paymentModeLabel,
    realTimeLabel: formatMinutes(realMinutes),
    routeLabel: `Tour ${1020 + index}`,
    status,
    statusLabel:
      status === "approved" ? "Abgeschlossen" : status === "submitted" ? "Eingereicht" : "Rueckfrage",
  };
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${String(minutes).padStart(2, "0")}min`;
}

const shiftDetails = workedDays.map((dayNumber, index) => createShift(dayNumber, index));
const recentShiftIds = [29, 28, 27, 26].map(getShiftId);

function getDayNumberFromIso(dateIso: string) {
  return Number(dateIso.slice(-2));
}

function createDayDetail(shift: HistoryShiftMock): HistoryDayDetailMock {
  const dayNumber = getDayNumberFromIso(shift.dateIso);
  const isApproved = shift.status === "approved";
  const hasWarning = dayNumber === 27 || dayNumber === 28;
  const isDailyFixed = shift.paymentModeLabel === "Tagespauschale";
  const startHour = 7 + (dayNumber % 2);
  const startMinute = dayNumber % 3 === 0 ? "05" : "12";
  const endHour = startHour + 8;
  const endMinute = dayNumber % 4 === 0 ? "48" : "45";
  const startKm = 42810 + dayNumber * 37;
  const distance = 142 + (dayNumber % 7) * 6;
  const delivered = 86 + (dayNumber % 8) * 3;
  const returns = dayNumber % 5;
  const pickups = 4 + (dayNumber % 4);

  return {
    billablePercentLabel: isDailyFixed ? "Pauschale" : "92%",
    courierIdLabel: "Kurier ID 1057",
    courierInitials: "MK",
    courierName: "Mihail Kolev",
    dateIso: shift.dateIso,
    dateLabel: shift.dateLabel,
    dayLabel: getFullDayLabel(dayNumber),
    detailRows: [
      {
        helper: "Eingereicht von Mihail Kolev",
        iconName: "clipboard-text-outline",
        label: "Tagesbericht",
        statusLabel: shift.status === "submitted" ? "Eingereicht" : "Abgeschlossen",
        value: shift.status === "submitted" ? "17:05" : "17:12",
      },
      {
        helper: dayNumber === 27 ? "Rueckfrage zur Endzeit" : "Keine offenen Rueckfragen",
        iconName: "message-text-outline",
        label: "Notizen",
        value: dayNumber === 27 ? "1 Notiz vorhanden" : "Alles vollstaendig",
      },
    ],
    geofenceWarning: {
      helper: hasWarning
        ? "Start: 1,2 km entfernt - Ende: 1,6 km entfernt"
        : "Start und Ende lagen innerhalb des Depotbereichs",
      title: hasWarning
        ? "Start und Endzeit ausserhalb der Depot-Geofence"
        : "Start und Endzeit innerhalb der Depot-Geofence",
    },
    headerShift: shift,
    isReadOnly: isApproved,
    kmSummary: {
      distanceLabel: `${distance} km`,
      endKmLabel: `${startKm + distance} km`,
      startKmLabel: `${startKm} km`,
    },
    note:
      dayNumber === 27
        ? "Admin-Rueckfrage offen: Endzeit und Rueckgabe am Depot pruefen."
        : "Bericht wurde eingereicht und ist fuer den Kurier schreibgeschuetzt.",
    packageCounters: [
      {
        helper: "zugestellt",
        iconName: "package-variant-closed-check",
        label: "Pakete",
        value: String(delivered),
      },
      {
        helper: "zurueck",
        iconName: "package-variant",
        label: "Retouren",
        value: String(returns),
      },
      {
        helper: "Kunden",
        iconName: "tray-arrow-down",
        label: "Abholungen",
        value: String(pickups),
      },
      {
        helper: "gesamt",
        iconName: "map-marker-path",
        label: "Stopps",
        value: String(delivered + returns + pickups),
      },
    ],
    pdfLabel: "Tageszusammenfassung (PDF)",
    photos: [
      {
        helper: `${String(startHour).padStart(2, "0")}:${startMinute} hochgeladen`,
        iconName: "speedometer",
        label: "Start KM",
        state: "available",
      },
      {
        helper: `${String(endHour).padStart(2, "0")}:${endMinute} hochgeladen`,
        iconName: "speedometer-slow",
        label: "End KM",
        state: "available",
      },
      {
        helper: "Fahrtenbuch",
        iconName: "book-open-page-variant-outline",
        label: "Fahrtenbuch",
        state: "available",
      },
      {
        helper: "Mentor Screenshot",
        iconName: "cellphone-screenshot",
        label: "Mentor",
        state: isApproved && dayNumber < 16 ? "expired" : "available",
      },
    ],
    signature: {
      helper: "Unterschrift ist privat gespeichert und erscheint spaeter im PDF.",
      signedAtLabel: `${shift.dateLabel} - ${String(endHour + 1).padStart(2, "0")}:05`,
      signedByLabel: "Mihail Kolev",
    },
    timeMetrics: [
      {
        helper: shift.dateLabel,
        iconName: "play-outline",
        label: "Startzeit",
        tone: hasWarning ? "warning" : "default",
        value: `${String(startHour).padStart(2, "0")}:${startMinute}`,
      },
      {
        helper: shift.dateLabel,
        iconName: "stop-circle-outline",
        label: "Endzeit",
        tone: hasWarning ? "warning" : "default",
        value: `${String(endHour).padStart(2, "0")}:${endMinute}`,
      },
      {
        helper: `${String(startHour).padStart(2, "0")}:${startMinute} - ${String(endHour).padStart(2, "0")}:${endMinute}`,
        iconName: "clock-outline",
        label: "Nettozeit",
        value: shift.realTimeLabel,
      },
      {
        helper: isDailyFixed ? "Standard 8:20" : shift.paymentModeLabel,
        iconName: "cash-clock",
        label: "Abrechenbar",
        value: shift.billableTimeLabel,
      },
      {
        helper: "1 Pause",
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
        helper: isDailyFixed ? "Tagespauschale" : "Stundenbasis",
        iconName: "calendar-clock",
        label: "Schichttyp",
        value: isDailyFixed ? "Fix" : "Standard",
      },
      {
        helper: isApproved ? "Schreibgeschuetzt" : "Wartet auf Pruefung",
        iconName: "shield-check-outline",
        label: "Status",
        tone: isApproved ? "success" : "default",
        value: shift.statusLabel,
      },
    ],
  };
}

function getShiftDetail(shiftId: string) {
  const shift = shiftDetails.find((item) => item.id === shiftId);

  if (!shift) {
    throw new Error(`Missing mock shift for ${shiftId}`);
  }

  return shift;
}

function getOptionalShiftId(dayNumber: number) {
  return workedDays.includes(dayNumber) ? getShiftId(dayNumber) : undefined;
}

function createCalendarDay(dayNumber: number): HistoryCalendarDayMock {
  return {
    dateLabel: `2026-06-${String(dayNumber).padStart(2, "0")}`,
    dayNumber: String(dayNumber),
    isCurrentMonth: true,
    isToday: dayNumber === 27,
    shiftId: getOptionalShiftId(dayNumber),
  };
}

function createTrailingDay(dayNumber: number): HistoryCalendarDayMock {
  return {
    dateLabel: `2026-07-${String(dayNumber).padStart(2, "0")}`,
    dayNumber: String(dayNumber),
    isCurrentMonth: false,
  };
}

const calendarDays = [
  ...Array.from({ length: 30 }, (_, index) => createCalendarDay(index + 1)),
  ...Array.from({ length: 5 }, (_, index) => createTrailingDay(index + 1)),
];

const recentShifts = recentShiftIds.map(getShiftDetail);
const dayDetails = shiftDetails.map(createDayDetail);

const selectedDayHelper = "Ausgewaehlter Tag aus deiner eigenen Kurier-Historie.";

export function getHistoryDayDetail(dateIso: string): HistoryDayDetailMock {
  return dayDetails.find((day) => day.dateIso === dateIso) ?? dayDetails[dayDetails.length - 1];
}

export const mockHistoryMonth: HistoryMonthMock = {
  calendarDays,
  filters: ["Status: Alle", "Depot: HBW3"],
  monthLabel: "Juni 2026",
  monthlyPdfLabel: "Monats-PDF",
  recentShifts,
  selectedDayHelper,
  shiftDetails,
  summary: [
    {
      helper: "echte Zeit",
      iconName: "clock-outline",
      label: "Arbeitszeit",
      value: "168:45 h",
    },
    {
      helper: "abrechenbar",
      iconName: "clock-check-outline",
      label: "Abrechenbar",
      value: "154:30 h",
    },
    {
      helper: "im Monat",
      iconName: "calendar-check-outline",
      label: "Schichten",
      value: "22",
    },
  ],
};
