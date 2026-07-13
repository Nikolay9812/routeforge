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
};

export type AdminDashboardCourier = {
  id: string;
  name: string;
  depot: string;
  shiftWindow: string;
  statusLabel: string;
  statusTone: AdminDashboardTone;
  packages: string;
  billableTime: string;
};

export type AdminDashboardReviewShift = {
  id: string;
  href: string;
  courier: string;
  depot: string;
  submittedAt: string;
  paymentMode: string;
  billableTime: string;
  statusLabel: string;
  statusTone: AdminDashboardTone;
};

export type AdminDashboardWarning = {
  id: string;
  depot: string;
  courier: string;
  checkpoint: string;
  distance: string;
  severityLabel: string;
  severityTone: AdminDashboardTone;
  time: string;
};

export type AdminDashboardActivity = {
  id: string;
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

export type AdminDashboardData = {
  activeCouriers: AdminDashboardCourier[];
  companyName: string;
  geofenceWarnings: AdminDashboardWarning[];
  metrics: AdminDashboardMetric[];
  quickActions: AdminDashboardQuickAction[];
  recentActivity: AdminDashboardActivity[];
  reviewShifts: AdminDashboardReviewShift[];
  todayLabel: string;
};

export const adminDashboardQuickActions: AdminDashboardQuickAction[] = [
  {
    description: "Offene Berichte und GPS-Warnungen bearbeiten",
    href: "/admin/shifts",
    label: "Schichten pruefen",
    tone: "primary",
  },
  {
    description: "Einladungscode fuer Kurier oder Dispatcher erstellen",
    href: "/admin/invitations",
    label: "Einladung erstellen",
    tone: "success",
  },
  {
    description: "Private Datei in das Kurier-Postfach legen",
    href: "/admin/documents",
    label: "Dokument senden",
    tone: "info",
  },
  {
    description: "Live Audit-Verlauf fuer sensible Aenderungen pruefen",
    href: "/admin/audit-logs",
    label: "Audit Logs",
    tone: "warning",
  },
];

export function formatDashboardMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(
    2,
    "0",
  )}`;
}

export function formatDashboardDateTime(value: string | null): string {
  if (!value) {
    return "Noch offen";
  }

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

export function formatDashboardTime(value: string | null): string {
  if (!value) {
    return "Offen";
  }

  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
