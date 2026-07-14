import type { RfIconName } from "@/components/ui/RfIcon";

export type SettingsLanguageId = "bg" | "de";

export type SettingsLanguageOption = {
  code: "BG" | "DE";
  helperText: string;
  id: SettingsLanguageId;
  label: string;
};

export const settingsLanguageOptions: SettingsLanguageOption[] = [
  {
    code: "DE",
    helperText: "Standard fuer RouteForge Mobile",
    id: "de",
    label: "Deutsch",
  },
  {
    code: "BG",
    helperText: "Optional ueber vorhandene Uebersetzungsschluessel",
    id: "bg",
    label: "Bulgarisch",
  },
];

export const mobileSettings = {
  appVersion: "1.0.0",
  buildLabel: "Live-Daten",
  logoutHelper: "Beendet deine InsForge Sitzung und fuehrt zur Anmeldung zurueck.",
  privacyText:
    "RouteForge zeigt hier nur eigene Profildaten. Dokumente, PDFs und Postfach-Dateien bleiben privat und werden authentifiziert geladen.",
  privacyTitle: "Datenschutz",
  supportItems: [
    {
      icon: "email-outline" as RfIconName,
      label: "Support",
      value: "support@routeforge.local",
    },
    {
      icon: "shield-check-outline" as RfIconName,
      label: "Datenzugriff",
      value: "Nur eigenes Kurierprofil",
    },
  ],
};
