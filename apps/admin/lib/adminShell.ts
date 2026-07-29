import type { SupportedLanguage, TranslationCatalog } from "@routeforge/shared";

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
  defaultLanguage: SupportedLanguage;
  name: string;
  location: string;
  workspaceCode: string;
};

export type AdminShellUser = {
  name: string;
  role: "admin" | "dispatcher";
  roleLabel: string;
  initials: string;
};

export type AdminShellNotifications = {
  items: AdminShellNotificationItem[];
  label: string;
  pendingCount: number;
};

export type AdminShellNotificationItem = {
  description: string;
  href: string;
  id: string;
  label: string;
  tone: AdminShellNotificationTone;
  type: "courier_approval" | "shift_review";
};

export type AdminShellNotificationTone =
  | "info"
  | "primary"
  | "warning";

export type AdminShellSearchItem = {
  description: string;
  href: string;
  id: string;
  keywords: string;
  label: string;
  meta: string;
  tone: AdminShellSearchTone;
  type: "courier" | "depot" | "shift";
};

export type AdminShellSearchTone =
  | "info"
  | "neutral"
  | "primary"
  | "success"
  | "warning";

export type AdminShellText = {
  adminPanel: string;
  logoutAction: string;
  notificationsEmpty: string;
  notificationsSubtitle: string;
  resultTypes: Record<AdminShellSearchItem["type"], string>;
  roles: Record<AdminShellUser["role"], string>;
  searchMatches: string;
  searchNoResults: string;
  searchPlaceholder: string;
  searchResults: string;
};

export function buildAdminShellNavGroups(
  translation: TranslationCatalog,
): AdminNavGroup[] {
  return [
    {
      label: translation.adminShell.operationGroup,
      items: [
        {
          href: "/admin/dashboard",
          icon: "dashboard",
          label: translation.navigation.dashboard,
          marker: "D",
        },
        {
          href: "/admin/shifts",
          icon: "shifts",
          label: translation.navigation.shifts,
          marker: "S",
        },
        {
          href: "/admin/couriers",
          icon: "couriers",
          label: translation.navigation.couriers,
          marker: "K",
        },
        {
          href: "/admin/dispatchers",
          icon: "dispatchers",
          label: translation.navigation.dispatchers,
          marker: "DP",
        },
        {
          href: "/admin/depots",
          icon: "depots",
          label: translation.navigation.depots,
          marker: "DE",
        },
      ],
    },
    {
      label: translation.adminShell.managementGroup,
      items: [
        {
          href: "/admin/documents",
          icon: "documents",
          label: translation.navigation.documents,
          marker: "DO",
        },
        {
          href: "/admin/invitations",
          icon: "invitations",
          label: translation.navigation.invitations,
          marker: "E",
        },
        {
          href: "/admin/exports",
          icon: "exports",
          label: translation.navigation.exports,
          marker: "EX",
        },
        {
          href: "/admin/audit-logs",
          icon: "audit",
          label: translation.navigation.auditLogs,
          marker: "A",
        },
        {
          href: "/admin/settings",
          icon: "settings",
          label: translation.navigation.settings,
          marker: "ES",
        },
      ],
    },
  ];
}

export function buildAdminShellText(
  translation: TranslationCatalog,
): AdminShellText {
  return {
    adminPanel: translation.adminShell.adminPanel,
    logoutAction: translation.adminShell.logoutAction,
    notificationsEmpty: translation.adminShell.notificationsEmpty,
    notificationsSubtitle: translation.adminShell.notificationsSubtitle,
    resultTypes: translation.adminShell.resultTypes,
    roles: translation.adminShell.roles,
    searchMatches: translation.adminShell.searchMatches,
    searchNoResults: translation.adminShell.searchNoResults,
    searchPlaceholder: translation.adminShell.searchPlaceholder,
    searchResults: translation.adminShell.searchResults,
  };
}
