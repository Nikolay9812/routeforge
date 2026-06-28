export type MobileShellUser = {
  initials: string;
  fullName: string;
  roleLabel: string;
  statusLabel: string;
  languageLabel: string;
};

export type MobileShellCompany = {
  name: string;
  depotName: string;
  depotCode: string;
};

export type MobileShellDepot = {
  code: string;
  name: string;
  addressLabel: string;
};

export type MobileShellLanguage = {
  code: "DE" | "BG";
  label: string;
};

export type MobileShellNotification = {
  id: string;
  title: string;
  message: string;
  timeLabel: string;
  unread: boolean;
};

export const mockMobileShellUser: MobileShellUser = {
  initials: "MK",
  fullName: "Mihail Kolev",
  roleLabel: "Kurier",
  statusLabel: "Aktiv",
  languageLabel: "DE",
};

export const mockMobileShellCompany: MobileShellCompany = {
  name: "Ivanov Transport",
  depotName: "Mannheim HBW3",
  depotCode: "HBW3",
};

export const mockMobileShellDepots: MobileShellDepot[] = [
  {
    code: "HBW3",
    name: "Mannheim HBW3",
    addressLabel: "Hauptdepot Mannheim",
  },
  {
    code: "MA-S",
    name: "Mannheim Sued",
    addressLabel: "Touren fuer Suedstadt",
  },
  {
    code: "LU",
    name: "Ludwigshafen",
    addressLabel: "Rhein-Neckar Aussenstelle",
  },
];

export const mockMobileShellLanguages: MobileShellLanguage[] = [
  {
    code: "DE",
    label: "Deutsch",
  },
  {
    code: "BG",
    label: "Bulgarisch",
  },
];

export const mockMobileShellNotifications: MobileShellNotification[] = [
  {
    id: "mailbox-payslip",
    title: "Neue Abrechnung",
    message: "Mai 2026 liegt im Postfach bereit.",
    timeLabel: "Heute",
    unread: true,
  },
  {
    id: "document-check",
    title: "Dokument pruefen",
    message: "IBAN-Nachweis muss erneuert werden.",
    timeLabel: "Gestern",
    unread: true,
  },
  {
    id: "shift-approved",
    title: "Schicht genehmigt",
    message: "Dein Bericht vom 26.06. wurde freigegeben.",
    timeLabel: "Fr",
    unread: false,
  },
];
