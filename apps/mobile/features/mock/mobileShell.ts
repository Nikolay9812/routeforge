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
