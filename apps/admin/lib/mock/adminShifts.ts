import type { PaymentMode, ShiftStatus } from "@routeforge/shared";

export type AdminShiftTone =
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "neutral";

export type AdminShiftGeofenceState = "inside" | "outside" | "missing";

export type AdminShiftListItem = {
  id: string;
  courierName: string;
  courierCode: string;
  shiftDate: string;
  dateLabel: string;
  depotName: string;
  depotCode: string;
  startTime: string;
  endTime: string;
  grossTime: string;
  breakTime: string;
  billableTime: string;
  paymentMode: PaymentMode;
  paymentModeLabel: string;
  status: ShiftStatus;
  statusLabel: string;
  statusTone: AdminShiftTone;
  geofenceState: AdminShiftGeofenceState;
  geofenceLabel: string;
  geofenceTone: AdminShiftTone;
  geofenceDetail: string;
  packageSummary: string;
  submittedAt: string;
  href: string;
};

export type AdminShiftFilterGroup = {
  label: string;
  value: string;
};

export type AdminShiftFilterOption = {
  label: string;
  value: string;
};

export type AdminShiftFilterOptions = {
  couriers: AdminShiftFilterOption[];
  dates: AdminShiftFilterOption[];
  depots: AdminShiftFilterOption[];
  paymentModes: AdminShiftFilterOption[];
  statuses: AdminShiftFilterOption[];
};

export const adminShiftFilterGroups: AdminShiftFilterGroup[] = [
  { label: "Datum", value: "Heute, 1. Juli 2026" },
  { label: "Depot", value: "Alle Depots" },
  { label: "Status", value: "Eingereicht, in Pruefung" },
  { label: "Kurier", value: "Alle Kuriere" },
  { label: "Zahlungsart", value: "Alle Zahlungsarten" },
];

export const adminShiftListItems: AdminShiftListItem[] = [
  {
    id: "SR-2026-07-01-0842",
    courierName: "Nico Weber",
    courierCode: "KUR-10458",
    shiftDate: "2026-07-01",
    dateLabel: "Mi., 1. Juli",
    depotName: "Mannheim Nord",
    depotCode: "MA-N",
    startTime: "06:04",
    endTime: "16:17",
    grossTime: "10:13",
    breakTime: "00:45",
    billableTime: "10:00",
    paymentMode: "hourly",
    paymentModeLabel: "Stundenlohn",
    status: "under_review",
    statusLabel: "In Pruefung",
    statusTone: "warning",
    geofenceState: "outside",
    geofenceLabel: "Ausserhalb",
    geofenceTone: "error",
    geofenceDetail: "Stopp 410 m ausserhalb Depot",
    packageSummary: "52 geliefert - 3 Retouren",
    submittedAt: "Heute, 10:18",
    href: "/admin/shifts/SR-2026-07-01-0842",
  },
  {
    id: "SR-2026-07-01-0816",
    courierName: "Elena Dimitrova",
    courierCode: "KUR-10412",
    shiftDate: "2026-07-01",
    dateLabel: "Mi., 1. Juli",
    depotName: "Mannheim Sued",
    depotCode: "MA-S",
    startTime: "07:02",
    endTime: "15:08",
    grossTime: "08:06",
    breakTime: "00:30",
    billableTime: "08:20",
    paymentMode: "daily_fixed",
    paymentModeLabel: "Tagespauschale",
    status: "submitted",
    statusLabel: "Eingereicht",
    statusTone: "info",
    geofenceState: "inside",
    geofenceLabel: "Im Depot",
    geofenceTone: "success",
    geofenceDetail: "Start und Stopp innerhalb Geofence",
    packageSummary: "41 geliefert - 1 Abholung",
    submittedAt: "Heute, 09:48",
    href: "/admin/shifts/SR-2026-07-01-0816",
  },
  {
    id: "SR-2026-07-01-0774",
    courierName: "Sofia Petrovic",
    courierCode: "KUR-10387",
    shiftDate: "2026-07-01",
    dateLabel: "Mi., 1. Juli",
    depotName: "Mannheim Sued",
    depotCode: "MA-S",
    startTime: "06:55",
    endTime: "14:52",
    grossTime: "07:57",
    breakTime: "00:30",
    billableTime: "08:20",
    paymentMode: "daily_fixed",
    paymentModeLabel: "Tagespauschale",
    status: "submitted",
    statusLabel: "Eingereicht",
    statusTone: "info",
    geofenceState: "outside",
    geofenceLabel: "Warnung",
    geofenceTone: "warning",
    geofenceDetail: "Start 185 m ausserhalb Depot",
    packageSummary: "37 geliefert - 2 Retouren",
    submittedAt: "Heute, 09:31",
    href: "/admin/shifts/SR-2026-07-01-0774",
  },
  {
    id: "SR-2026-06-30-0692",
    courierName: "Ahmet Yilmaz",
    courierCode: "KUR-10231",
    shiftDate: "2026-06-30",
    dateLabel: "Di., 30. Juni",
    depotName: "Mannheim Nord",
    depotCode: "MA-N",
    startTime: "06:00",
    endTime: "14:12",
    grossTime: "08:12",
    breakTime: "00:45",
    billableTime: "07:27",
    paymentMode: "hourly",
    paymentModeLabel: "Stundenlohn",
    status: "approved",
    statusLabel: "Genehmigt",
    statusTone: "success",
    geofenceState: "inside",
    geofenceLabel: "Im Depot",
    geofenceTone: "success",
    geofenceDetail: "Keine Warnung",
    packageSummary: "48 geliefert - 0 Retouren",
    submittedAt: "Gestern, 15:02",
    href: "/admin/shifts/SR-2026-06-30-0692",
  },
  {
    id: "SR-2026-06-30-0668",
    courierName: "Maria Rossi",
    courierCode: "KUR-10344",
    shiftDate: "2026-06-30",
    dateLabel: "Di., 30. Juni",
    depotName: "Heidelberg",
    depotCode: "HD",
    startTime: "08:08",
    endTime: "16:20",
    grossTime: "08:12",
    breakTime: "00:30",
    billableTime: "07:42",
    paymentMode: "hourly",
    paymentModeLabel: "Stundenlohn",
    status: "rejected",
    statusLabel: "Abgelehnt",
    statusTone: "error",
    geofenceState: "missing",
    geofenceLabel: "Standort fehlt",
    geofenceTone: "warning",
    geofenceDetail: "Stopp-GPS nicht gespeichert",
    packageSummary: "28 geliefert - 1 Retoure",
    submittedAt: "Gestern, 17:04",
    href: "/admin/shifts/SR-2026-06-30-0668",
  },
];

export const adminShiftFilterOptions: AdminShiftFilterOptions = {
  dates: [
    { label: "Alle Daten", value: "all" },
    { label: "Mi., 1. Juli", value: "2026-07-01" },
    { label: "Di., 30. Juni", value: "2026-06-30" },
  ],
  depots: [
    { label: "Alle Depots", value: "all" },
    { label: "Mannheim Nord", value: "Mannheim Nord" },
    { label: "Mannheim Sued", value: "Mannheim Sued" },
    { label: "Heidelberg", value: "Heidelberg" },
  ],
  statuses: [
    { label: "Alle Status", value: "all" },
    { label: "Eingereicht", value: "submitted" },
    { label: "In Pruefung", value: "under_review" },
    { label: "Genehmigt", value: "approved" },
    { label: "Abgelehnt", value: "rejected" },
  ],
  couriers: [
    { label: "Alle Kuriere", value: "all" },
    { label: "Nico Weber", value: "Nico Weber" },
    { label: "Elena Dimitrova", value: "Elena Dimitrova" },
    { label: "Sofia Petrovic", value: "Sofia Petrovic" },
    { label: "Ahmet Yilmaz", value: "Ahmet Yilmaz" },
    { label: "Maria Rossi", value: "Maria Rossi" },
  ],
  paymentModes: [
    { label: "Alle Zahlungsarten", value: "all" },
    { label: "Stundenlohn", value: "hourly" },
    { label: "Tagespauschale", value: "daily_fixed" },
  ],
};

export const adminShiftSummary = {
  submitted: 12,
  underReview: 6,
  approvedToday: 19,
  geofenceWarnings: 3,
};
