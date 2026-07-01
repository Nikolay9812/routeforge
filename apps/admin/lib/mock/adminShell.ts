export type AdminNavItem = {
  href: string;
  label: string;
  marker: string;
};

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

export const adminShellCompany: AdminShellCompany = {
  name: "Ivanov Transport",
  location: "Mannheim",
  workspaceCode: "IVT",
};

export const adminShellUser: AdminShellUser = {
  name: "Nikolay Ivanov",
  roleLabel: "Admin",
  initials: "NI",
};

export const adminShellNavGroups: AdminNavGroup[] = [
  {
    label: "Betrieb",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", marker: "D" },
      { href: "/admin/shifts", label: "Schichten", marker: "S" },
      { href: "/admin/couriers", label: "Kuriere", marker: "K" },
      { href: "/admin/dispatchers", label: "Dispatcher", marker: "DP" },
      { href: "/admin/depots", label: "Depots", marker: "DE" },
    ],
  },
  {
    label: "Verwaltung",
    items: [
      { href: "/admin/documents", label: "Dokumente", marker: "DO" },
      { href: "/admin/invitations", label: "Einladungen", marker: "E" },
      { href: "/admin/exports", label: "Exporte", marker: "EX" },
      { href: "/admin/audit-logs", label: "Audit Logs", marker: "A" },
      { href: "/admin/settings", label: "Einstellungen", marker: "ES" },
    ],
  },
];

export const adminShellNotifications = {
  pendingCount: 7,
  label: "Benachrichtigungen",
};
