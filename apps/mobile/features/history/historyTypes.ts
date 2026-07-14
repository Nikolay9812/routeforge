import type { RfIconName } from "@/components/ui/RfIcon";

export type HistoryShiftStatus = "approved" | "draft" | "submitted" | "rejected";

export type HistoryCalendarDayViewModel = {
  dateLabel: string;
  dayNumber: string;
  isCurrentMonth: boolean;
  isToday?: boolean;
  shiftId?: string;
};

export type HistorySummaryMetricViewModel = {
  helper: string;
  iconName: RfIconName;
  label: string;
  value: string;
};

export type HistoryShiftViewModel = {
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

export type HistoryDayMetricViewModel = {
  helper: string;
  iconName: RfIconName;
  label: string;
  tone?: "default" | "success" | "warning";
  value: string;
};

export type HistoryDayPhotoViewModel = {
  helper: string;
  iconName: RfIconName;
  label: string;
  state: "available" | "expired" | "missing";
};

export type HistoryDayReportRowViewModel = {
  helper: string;
  iconName: RfIconName;
  label: string;
  statusLabel?: string;
  value: string;
};

export type HistoryDayDetailViewModel = {
  billablePercentLabel: string;
  courierIdLabel: string;
  courierInitials: string;
  courierName: string;
  dateIso: string;
  dateLabel: string;
  dayLabel: string;
  detailRows: HistoryDayReportRowViewModel[];
  geofenceWarning: {
    helper: string;
    title: string;
  };
  headerShift: HistoryShiftViewModel;
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
  photos: HistoryDayPhotoViewModel[];
  signature: {
    helper: string;
    signedAtLabel: string;
    signedByLabel: string;
    storageLabel?: string;
  };
  timeMetrics: HistoryDayMetricViewModel[];
};

export type HistoryMonthViewModel = {
  calendarDays: HistoryCalendarDayViewModel[];
  filters: string[];
  monthLabel: string;
  monthlyPdfLabel: string;
  recentShifts: HistoryShiftViewModel[];
  selectedDayHelper: string;
  shiftDetails: HistoryShiftViewModel[];
  summary: HistorySummaryMetricViewModel[];
};
