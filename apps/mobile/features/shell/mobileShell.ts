export type MobileShellDepot = {
  addressLabel: string;
  code: string;
  name: string;
};

export type MobileShellLanguage = {
  code: "DE" | "BG";
  label: string;
};

export type MobileShellNotification = {
  id: string;
  message: string;
  timeLabel: string;
  title: string;
  unread: boolean;
};

export const mobileShellLanguages: MobileShellLanguage[] = [
  { code: "DE", label: "Deutsch" },
  { code: "BG", label: "Bulgarisch" },
];
