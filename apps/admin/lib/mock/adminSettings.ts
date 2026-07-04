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

export type AdminSettingsDraft = {
  company: Company;
  profileFields: AdminSettingsField[];
  assets: AdminSettingsAsset[];
  languageOptions: AdminSettingsLanguageOption[];
  retentionItems: AdminSettingsRetentionItem[];
  operationalItems: AdminSettingsOperationalItem[];
  checklist: Array<{
    label: string;
    done: boolean;
  }>;
  auditReminder: string;
  storageReminder: string;
};

export const adminSettingsDraft: AdminSettingsDraft = {
  company: {
    id: "company-ivt",
    name: "Ivanov Transport",
    slug: "ivanov-transport",
    country_code: "DE",
    default_language: "de",
    logo_url: null,
    stamp_url: "companies/company-ivt/assets/stamp.png",
    created_at: "2026-06-01T08:00:00.000Z",
    updated_at: "2026-07-04T06:30:00.000Z",
  },
  profileFields: [
    { label: "Firmenname", value: "Ivanov Transport" },
    { label: "Workspace Slug", value: "ivanov-transport" },
    { label: "Land", value: "Deutschland" },
    { label: "Mandant", value: "company-ivt" },
  ],
  assets: [
    {
      label: "Logo",
      title: "Firmenlogo hochladen",
      helper:
        "Wird spaeter in der Admin-Oberflaeche und auf ausgewaehlten PDFs verwendet.",
      fileLabel: "Noch kein Logo hinterlegt",
      statusLabel: "Optional",
      tone: "info",
    },
    {
      label: "PNG",
      title: "Stempel PNG hochladen",
      helper:
        "Der Firmenstempel wird fuer Tages- und Monats-PDFs aus dem privaten company-assets Bucket vorbereitet.",
      fileLabel: "companies/company-ivt/assets/stamp.png",
      statusLabel: "Bereit",
      tone: "success",
    },
  ],
  languageOptions: [
    {
      code: "de",
      label: "Deutsch",
      helper: "Standard fuer Admin und mobile Kurier-App",
      selected: true,
      tone: "primary",
    },
    {
      code: "bg",
      label: "Bulgarisch",
      helper: "Optional ueber vorhandene Uebersetzungsschluessel",
      selected: false,
      tone: "neutral",
    },
  ],
  retentionItems: [
    {
      label: "Schichtnachweis-Fotos",
      value: "14 Tage",
      helper: "Nur Dateien im shift-photos Bucket werden automatisch geloescht.",
      tone: "warning",
    },
    {
      label: "Lohnabrechnungen",
      value: "Dauerhaft privat",
      helper: "Nicht Teil der 14-Tage-Bereinigung.",
      tone: "success",
    },
    {
      label: "Vertraege & Dokumente",
      value: "Dauerhaft privat",
      helper: "Private Buckets, Zugriff spaeter ueber signierte Downloads.",
      tone: "success",
    },
    {
      label: "Audit Logs",
      value: "Unveraenderbar",
      helper: "Sensitive Aenderungen muessen serverseitig protokolliert werden.",
      tone: "primary",
    },
  ],
  operationalItems: [
    {
      label: "Zahlungsarten",
      value: "Stundenlohn und Tagespauschale",
      helper: "Hourly bleibt auf 10:00h gedeckelt, daily fixed bleibt 8:20h.",
      tone: "primary",
    },
    {
      label: "GPS-Pruefung",
      value: "Nur Start und Stopp",
      helper: "Keine Live-Ortung, keine Routenhistorie.",
      tone: "success",
    },
    {
      label: "Dispatcher-Scope",
      value: "Depot-basiert",
      helper: "Zugriff wird spaeter ueber profile_depot_access erzwungen.",
      tone: "info",
    },
  ],
  checklist: [
    { label: "Company Scope sichtbar", done: true },
    { label: "Logo/Stempel als private Assets geplant", done: true },
    { label: "14-Tage-Foto-Retention sichtbar", done: true },
    { label: "Speichern bleibt mock-only", done: true },
  ],
  auditReminder:
    "Echte Aenderungen an Firmenprofil, Stempel, Sprache oder Retention muessen spaeter serverseitig permission-geprueft und bei sensiblen Aenderungen audit-logfaehig sein.",
  storageReminder:
    "Logo und Stempel gehoeren in den privaten company-assets Bucket unter companies/{company_id}/assets/.",
};

export const adminSettingsSummary: AdminSettingsSummaryItem[] = [
  { label: "Mandant", tone: "primary", value: "IVT" },
  { label: "Sprache", tone: "success", value: "DE" },
  { label: "Foto-Retention", tone: "warning", value: "14 Tage" },
  { label: "PDF-Stempel", tone: "info", value: "PNG" },
];
