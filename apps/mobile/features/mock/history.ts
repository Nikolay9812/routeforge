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
const workedDays = [2, 3, 4, 5, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 27, 28, 29];

function getShiftId(dayNumber: number) {
  return `shift-2026-06-${String(dayNumber).padStart(2, "0")}`;
}

function getDayLabel(dayNumber: number) {
  return dayLabels[(dayNumber - 1) % dayLabels.length];
}

function createShift(dayNumber: number, index: number): HistoryShiftMock {
  const status = dayNumber === 27 ? "rejected" : dayNumber === 29 ? "submitted" : "approved";
  const paymentModeLabel = dayNumber === 27 ? "Tagespauschale" : "Stundenbasis";
  const realMinutes = 470 + (index % 6) * 5;
  const billableMinutes = paymentModeLabel === "Tagespauschale" ? 500 : realMinutes - 30;

  return {
    billableTimeLabel: formatMinutes(billableMinutes),
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

const selectedDayHelper = "Ausgewaehlter Tag aus deiner eigenen Kurier-Historie.";

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
