import type { Shift, ShiftStatus } from "@routeforge/shared";

import type {
  HistoryCalendarDayMock,
  HistoryMonthMock,
  HistoryShiftMock,
  HistoryShiftStatus,
  HistorySummaryMetricMock,
} from "@/features/mock/history";

export type HistoryMonthRange = {
  monthEnd: string;
  monthLabel: string;
  monthStart: string;
};

export type HydratedHistoryMonth = Pick<
  HistoryMonthMock,
  "calendarDays" | "filters" | "monthLabel" | "recentShifts" | "selectedDayHelper" | "shiftDetails" | "summary"
>;

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

function createHistoryShiftFromServerShift(
  shift: Shift,
  depotLabel: string,
): HistoryShiftMock {
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

function createCalendarDays(
  monthRange: HistoryMonthRange,
  shifts: HistoryShiftMock[],
): HistoryCalendarDayMock[] {
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

function createHistorySummary(shifts: Shift[]): HistorySummaryMetricMock[] {
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
