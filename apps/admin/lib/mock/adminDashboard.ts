export type AdminDashboardTone =
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "neutral";

export type AdminDashboardMetric = {
  label: string;
  value: string;
  helper: string;
  detail: string;
  tone: AdminDashboardTone;
  trend: number[];
};

export type AdminDashboardCourier = {
  name: string;
  depot: string;
  shiftWindow: string;
  statusLabel: string;
  statusTone: AdminDashboardTone;
  packages: string;
  billableTime: string;
};

export type AdminDashboardReviewShift = {
  courier: string;
  depot: string;
  submittedAt: string;
  paymentMode: string;
  billableTime: string;
  statusLabel: string;
  statusTone: AdminDashboardTone;
};

export type AdminDashboardWarning = {
  depot: string;
  courier: string;
  checkpoint: string;
  distance: string;
  severityLabel: string;
  severityTone: AdminDashboardTone;
  time: string;
};

export type AdminDashboardActivity = {
  title: string;
  description: string;
  time: string;
  tone: AdminDashboardTone;
};

export type AdminDashboardQuickAction = {
  label: string;
  description: string;
  href: string;
  tone: AdminDashboardTone;
};

export const adminDashboardMetrics: AdminDashboardMetric[] = [
  {
    label: "Monatliche abrechenbare Stunden",
    value: "1.286:40",
    helper: "+84:20 gegenueber Vormonat",
    detail: "Juli 2026",
    tone: "primary",
    trend: [34, 38, 35, 44, 48, 46, 52, 56],
  },
  {
    label: "Aktive Kuriere heute",
    value: "42",
    helper: "36 im Einsatz, 6 in Pause",
    detail: "3 Depots",
    tone: "success",
    trend: [28, 31, 34, 36, 38, 41, 39, 42],
  },
  {
    label: "Offene Schichtpruefungen",
    value: "18",
    helper: "7 seit gestern offen",
    detail: "Pruefung noetig",
    tone: "warning",
    trend: [22, 21, 19, 20, 18, 16, 18, 18],
  },
  {
    label: "Depot-Warnungen",
    value: "5",
    helper: "2 kritisch ausserhalb Geofence",
    detail: "Start/Stop GPS",
    tone: "error",
    trend: [2, 3, 2, 4, 3, 5, 4, 5],
  },
];

export const adminDashboardActiveCouriers: AdminDashboardCourier[] = [
  {
    name: "Ahmet Yilmaz",
    depot: "Mannheim Nord",
    shiftWindow: "06:00 - 14:00",
    statusLabel: "Aktiv",
    statusTone: "success",
    packages: "48 geliefert",
    billableTime: "06:35",
  },
  {
    name: "Sofia Petrovic",
    depot: "Mannheim Sued",
    shiftWindow: "07:00 - 15:00",
    statusLabel: "In Pause",
    statusTone: "warning",
    packages: "31 geliefert",
    billableTime: "05:10",
  },
  {
    name: "Lukas Schneider",
    depot: "Heidelberg",
    shiftWindow: "08:00 - 16:00",
    statusLabel: "Aktiv",
    statusTone: "success",
    packages: "22 geliefert",
    billableTime: "04:45",
  },
  {
    name: "Maria Rossi",
    depot: "Mannheim Nord",
    shiftWindow: "09:00 - 17:00",
    statusLabel: "Bericht offen",
    statusTone: "info",
    packages: "12 geliefert",
    billableTime: "03:20",
  },
];

export const adminDashboardReviewShifts: AdminDashboardReviewShift[] = [
  {
    courier: "David Klein",
    depot: "Mannheim Nord",
    submittedAt: "Heute, 10:12",
    paymentMode: "Stundenlohn",
    billableTime: "09:45",
    statusLabel: "Eingereicht",
    statusTone: "info",
  },
  {
    courier: "Elena Dimitrova",
    depot: "Mannheim Sued",
    submittedAt: "Heute, 09:48",
    paymentMode: "Tagespauschale",
    billableTime: "08:20",
    statusLabel: "In Pruefung",
    statusTone: "warning",
  },
  {
    courier: "Nico Weber",
    depot: "Heidelberg",
    submittedAt: "Gestern, 18:22",
    paymentMode: "Stundenlohn",
    billableTime: "10:00",
    statusLabel: "Klaerung",
    statusTone: "error",
  },
];

export const adminDashboardGeofenceWarnings: AdminDashboardWarning[] = [
  {
    depot: "Mannheim Nord",
    courier: "Nico Weber",
    checkpoint: "Schichtende",
    distance: "410 m ausserhalb",
    severityLabel: "Kritisch",
    severityTone: "error",
    time: "09:17",
  },
  {
    depot: "Mannheim Sued",
    courier: "Sofia Petrovic",
    checkpoint: "Schichtstart",
    distance: "185 m ausserhalb",
    severityLabel: "Hoch",
    severityTone: "warning",
    time: "08:42",
  },
  {
    depot: "Heidelberg",
    courier: "Lukas Schneider",
    checkpoint: "Standort fehlt",
    distance: "GPS nicht gespeichert",
    severityLabel: "Fehlt",
    severityTone: "warning",
    time: "07:58",
  },
];

export const adminDashboardRecentActivity: AdminDashboardActivity[] = [
  {
    title: "Schicht genehmigt",
    description: "Ahmet Yilmaz, Mannheim Nord",
    time: "vor 12 Min.",
    tone: "success",
  },
  {
    title: "Dokument hochgeladen",
    description: "Payslip fuer Elena Dimitrova",
    time: "vor 24 Min.",
    tone: "primary",
  },
  {
    title: "Korrektur angefragt",
    description: "Nico Weber, Grund erforderlich",
    time: "vor 41 Min.",
    tone: "warning",
  },
  {
    title: "Depot-Warnung erstellt",
    description: "Mannheim Nord, Schichtende",
    time: "vor 58 Min.",
    tone: "error",
  },
];

export const adminDashboardQuickActions: AdminDashboardQuickAction[] = [
  {
    label: "Schichten pruefen",
    description: "Offene Berichte und GPS-Warnungen bearbeiten",
    href: "/admin/shifts",
    tone: "primary",
  },
  {
    label: "Kurier einladen",
    description: "Einmaligen Einladungscode vorbereiten",
    href: "/admin/invitations",
    tone: "success",
  },
  {
    label: "Dokument senden",
    description: "Private Datei in das Postfach legen",
    href: "/admin/documents",
    tone: "info",
  },
  {
    label: "Export vorbereiten",
    description: "Genehmigte Monatsdaten fuer Steuerberater",
    href: "/admin/exports",
    tone: "warning",
  },
];
