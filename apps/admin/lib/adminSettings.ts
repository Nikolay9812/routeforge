import type { Company, SupportedLanguage } from "@routeforge/shared";

export type AdminSettingsTone =
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "neutral";

export type AdminSettingsSummaryItem = {
  label: string;
  tone: AdminSettingsTone;
  value: string;
};

export type AdminSettingsField = {
  label: string;
  value: string;
};

export type AdminSettingsAsset = {
  kind: "logo" | "stamp";
  label: string;
  title: string;
  helper: string;
  fileLabel: string;
  statusLabel: string;
  tone: AdminSettingsTone;
};

export type AdminSettingsLanguageOption = {
  code: SupportedLanguage;
  label: string;
  helper: string;
  selected: boolean;
  tone: AdminSettingsTone;
};

export type AdminSettingsRetentionItem = {
  label: string;
  value: string;
  helper: string;
  tone: AdminSettingsTone;
};

export type AdminSettingsOperationalItem = {
  label: string;
  value: string;
  helper: string;
  tone: AdminSettingsTone;
};

export type AdminSettingsData = {
  auditReminder: string;
  checklist: Array<{
    label: string;
    done: boolean;
  }>;
  company: Company;
  profileFields: AdminSettingsField[];
  assets: AdminSettingsAsset[];
  languageOptions: AdminSettingsLanguageOption[];
  operationalItems: AdminSettingsOperationalItem[];
  retentionItems: AdminSettingsRetentionItem[];
  storageReminder: string;
  summary: AdminSettingsSummaryItem[];
};

export function getLanguageLabel(language: SupportedLanguage): string {
  const labels: Record<SupportedLanguage, string> = {
    bg: "Bulgarisch",
    de: "Deutsch",
  };

  return labels[language];
}

export function getCountryLabel(countryCode: string): string {
  return countryCode === "DE" ? "Deutschland" : countryCode;
}
