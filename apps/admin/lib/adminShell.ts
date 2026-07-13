export type AdminNavItem = {
  href: string;
  icon: AdminNavIcon;
  label: string;
  marker: string;
};

export type AdminNavIcon =
  | "audit"
  | "couriers"
  | "dashboard"
  | "depots"
  | "dispatchers"
  | "documents"
  | "exports"
  | "invitations"
  | "settings"
  | "shifts";

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

export type AdminShellCompany = {
  name: string;
  location: string;
  workspaceCode: string;
};

export type AdminShellUser = {
  name: string;
  roleLabel: string;
  initials: string;
};

export type AdminShellNotifications = {
  label: string;
  pendingCount: number;
};

export const adminShellNavGroups: AdminNavGroup[] = [
  {
    label: "Betrieb",
    items: [
      {
        href: "/admin/dashboard",
        icon: "dashboard",
        label: "Dashboard",
        marker: "D",
      },
      { href: "/admin/shifts", icon: "shifts", label: "Schichten", marker: "S" },
      {
        href: "/admin/couriers",
        icon: "couriers",
        label: "Kuriere",
        marker: "K",
      },
      {
        href: "/admin/dispatchers",
        icon: "dispatchers",
        label: "Dispatcher",
        marker: "DP",
      },
      { href: "/admin/depots", icon: "depots", label: "Depots", marker: "DE" },
    ],
  },
  {
    label: "Verwaltung",
    items: [
      {
        href: "/admin/documents",
        icon: "documents",
        label: "Dokumente",
        marker: "DO",
      },
      {
        href: "/admin/invitations",
        icon: "invitations",
        label: "Einladungen",
        marker: "E",
      },
      { href: "/admin/exports", icon: "exports", label: "Exporte", marker: "EX" },
      {
        href: "/admin/audit-logs",
        icon: "audit",
        label: "Audit Logs",
        marker: "A",
      },
      {
        href: "/admin/settings",
        icon: "settings",
        label: "Einstellungen",
        marker: "ES",
      },
    ],
  },
];
