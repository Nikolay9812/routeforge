import type { RfIconName } from "@/components/ui/RfIcon";

export type SettingsLanguageId = "de" | "bg";

export type SettingsLanguageOption = {
  id: SettingsLanguageId;
  code: string;
  label: string;
  helperText: string;
};

export type SettingsSupportItem = {
  icon: RfIconName;
  label: string;
  value: string;
};

export const settingsLanguageOptions: SettingsLanguageOption[] = [
  {
    id: "de",
    code: "DE",
    label: "Deutsch",
    helperText: "Standardsprache fuer RouteForge",
  },
  {
    id: "bg",
    code: "BG",
    label: "Bulgarisch",
    helperText: "Optionale Sprache fuer Kuriere",
  },
];

export const mockMobileSettings = {
  appVersion: "1.0.0",
  buildLabel: "UI Mock Phase",
  privacyTitle: "Datenschutz",
  privacyText:
    "RouteForge zeigt hier nur eigene Profildaten. Dokumente, PDFs und Postfach-Dateien bleiben privat und werden spaeter authentifiziert geladen.",
  logoutHelper:
    "Mock-Aktion: Spaeter beendet diese Taste die InsForge Sitzung und fuehrt zur Anmeldung zurueck.",
  supportItems: [
    {
      icon: "email-outline",
      label: "Support",
      value: "support@routeforge.local",
    },
    {
      icon: "office-building-outline",
      label: "Firma",
      value: "Ivanov Transport",
    },
    {
      icon: "clock-outline",
      label: "Antwortzeit",
      value: "Werktags innerhalb eines Tages",
    },
  ] satisfies SettingsSupportItem[],
};
