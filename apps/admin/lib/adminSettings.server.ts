import "server-only";

import type { Company } from "@routeforge/shared";

import type { AdminAuthSession } from "@/lib/auth";
import {
  getCountryLabel,
  type AdminSettingsAsset,
  type AdminSettingsData,
  type AdminSettingsOperationalItem,
  type AdminSettingsRetentionItem,
  type AdminSettingsSummaryItem,
} from "@/lib/adminSettings";
import { createRouteForgeServerClient } from "@/lib/insforge/server";

const companySelect = `
  id,
  name,
  slug,
  country_code,
  default_language,
  logo_url,
  stamp_url,
  created_at,
  updated_at
`;

export async function loadAdminSettingsData(
  session: AdminAuthSession,
): Promise<AdminSettingsData> {
  const client = await createRouteForgeServerClient();
  const [{ data: companyRow }, { data: depotRows }, { data: profileRows }] =
    await Promise.all([
      client.database
        .from("companies")
        .select(companySelect)
        .eq("id", session.profile.company_id)
        .limit(1)
        .maybeSingle(),
      client.database
        .from("depots")
        .select("id,is_active")
        .eq("company_id", session.profile.company_id),
      client.database
        .from("profiles")
        .select("id,role,status")
        .eq("company_id", session.profile.company_id),
    ]);

  const company =
    ((companyRow as Company | null) ?? buildFallbackCompany(session));
  const depotCount = (depotRows ?? []).length;
  const activeDepotCount = (depotRows ?? []).filter(
    (depot) => Boolean((depot as { is_active?: boolean }).is_active),
  ).length;
  const profileCount = (profileRows ?? []).length;
  const activeCourierCount = (profileRows ?? []).filter(
    (profile) =>
      (profile as { role?: string; status?: string }).role === "courier" &&
      (profile as { role?: string; status?: string }).status === "active",
  ).length;

  return {
    assets: buildAssets(company),
    auditReminder:
      "Echte Aenderungen an Firmenprofil, Stempel, Sprache oder Retention muessen spaeter serverseitig permission-geprueft und audit-logfaehig sein.",
    checklist: [
      { label: "Company Scope geladen", done: true },
      { label: "Logo/Stempel nur lesend angezeigt", done: true },
      { label: "14-Tage-Foto-Retention sichtbar", done: true },
      { label: "Keine Einstellungen-Mutation in diesem Pass", done: true },
    ],
    company,
    languageOptions: [
      {
        code: "de",
        helper: "Standard fuer Admin und mobile Kurier-App",
        label: "Deutsch",
        selected: company.default_language === "de",
        tone: company.default_language === "de" ? "primary" : "neutral",
      },
      {
        code: "bg",
        helper: "Optional ueber vorhandene Uebersetzungsschluessel",
        label: "Bulgarisch",
        selected: company.default_language === "bg",
        tone: company.default_language === "bg" ? "primary" : "neutral",
      },
    ],
    operationalItems: buildOperationalItems({
      activeCourierCount,
      activeDepotCount,
      depotCount,
      profileCount,
    }),
    profileFields: [
      { label: "Firmenname", value: company.name },
      { label: "Workspace Slug", value: company.slug },
      { label: "Land", value: getCountryLabel(company.country_code) },
      { label: "Mandant", value: company.id },
      { label: "Aktualisiert", value: formatDateTime(company.updated_at) },
      { label: "Angemeldet als", value: session.profile.full_name },
    ],
    retentionItems: buildRetentionItems(),
    storageReminder:
      "Logo und Stempel gehoeren in private company-assets Pfade unter companies/{company_id}/assets/.",
    summary: buildSummary(company),
  };
}

function buildAssets(company: Company): AdminSettingsAsset[] {
  return [
    {
      fileLabel: company.logo_url ?? "Noch kein Logo hinterlegt",
      helper:
        "Wird in spaeteren Einstellungen ueber private Company-Assets gepflegt.",
      label: "Logo",
      statusLabel: company.logo_url ? "Hinterlegt" : "Optional",
      title: "Firmenlogo",
      tone: company.logo_url ? "success" : "info",
    },
    {
      fileLabel: company.stamp_url ?? "Noch kein Stempel hinterlegt",
      helper:
        "Der Firmenstempel wird fuer Tages- und Monats-PDFs als PNG erwartet.",
      label: "PNG",
      statusLabel: company.stamp_url ? "Bereit" : "Fehlt",
      title: "PDF-Stempel",
      tone: company.stamp_url ? "success" : "warning",
    },
  ];
}

function buildOperationalItems({
  activeCourierCount,
  activeDepotCount,
  depotCount,
  profileCount,
}: {
  activeCourierCount: number;
  activeDepotCount: number;
  depotCount: number;
  profileCount: number;
}): AdminSettingsOperationalItem[] {
  return [
    {
      helper: "Hourly bleibt auf 10:00h gedeckelt, daily fixed bleibt 8:20h.",
      label: "Zahlungsarten",
      tone: "primary",
      value: "Stundenlohn und Tagespauschale",
    },
    {
      helper: "Keine Live-Ortung, keine Routenhistorie.",
      label: "GPS-Pruefung",
      tone: "success",
      value: "Nur Start und Stopp",
    },
    {
      helper: `${activeDepotCount} von ${depotCount} Depots aktiv.`,
      label: "Depots",
      tone: "info",
      value: String(depotCount),
    },
    {
      helper: `${activeCourierCount} aktive Kuriere in ${profileCount} Profilen.`,
      label: "Profile",
      tone: "neutral",
      value: String(profileCount),
    },
  ];
}

function buildRetentionItems(): AdminSettingsRetentionItem[] {
  return [
    {
      helper: "Nur Dateien im shift-photos Bucket werden automatisch geloescht.",
      label: "Schichtnachweis-Fotos",
      tone: "warning",
      value: "14 Tage",
    },
    {
      helper: "Nicht Teil der 14-Tage-Bereinigung.",
      label: "Lohnabrechnungen",
      tone: "success",
      value: "Dauerhaft privat",
    },
    {
      helper: "Private Buckets, Zugriff spaeter ueber signierte Downloads.",
      label: "Vertraege & Dokumente",
      tone: "success",
      value: "Dauerhaft privat",
    },
    {
      helper: "Sensitive Aenderungen werden serverseitig protokolliert.",
      label: "Audit Logs",
      tone: "primary",
      value: "Unveraenderbar",
    },
  ];
}

function buildSummary(company: Company): AdminSettingsSummaryItem[] {
  return [
    { label: "Mandant", tone: "primary", value: company.slug.toUpperCase() },
    {
      label: "Sprache",
      tone: "success",
      value: company.default_language.toUpperCase(),
    },
    { label: "Foto-Retention", tone: "warning", value: "14 Tage" },
    {
      label: "PDF-Stempel",
      tone: company.stamp_url ? "success" : "warning",
      value: company.stamp_url ? "PNG" : "Fehlt",
    },
  ];
}

function buildFallbackCompany(session: AdminAuthSession): Company {
  return {
    country_code: "DE",
    created_at: new Date().toISOString(),
    default_language: "de",
    id: session.profile.company_id,
    logo_url: null,
    name: session.company.name,
    slug: session.company.workspaceCode.toLowerCase(),
    stamp_url: null,
    updated_at: new Date().toISOString(),
  };
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
