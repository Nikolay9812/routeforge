import {
  adminSettingsDraft,
  adminSettingsSummary,
  type AdminSettingsTone,
} from "@/lib/mock/adminSettings";

const toneClasses: Record<
  AdminSettingsTone,
  {
    badge: string;
    dot: string;
    soft: string;
    text: string;
  }
> = {
  primary: {
    badge: "bg-primary-lightest text-primary-darker",
    dot: "bg-primary",
    soft: "border-primary-light bg-primary-lightest",
    text: "text-primary",
  },
  info: {
    badge: "bg-info-lightest text-info-foreground",
    dot: "bg-info",
    soft: "border-info-light bg-info-lightest",
    text: "text-info-foreground",
  },
  success: {
    badge: "bg-success-lightest text-success-foreground",
    dot: "bg-success",
    soft: "border-success-light bg-success-lightest",
    text: "text-success-foreground",
  },
  warning: {
    badge: "bg-warning-lightest text-warning-foreground",
    dot: "bg-warning",
    soft: "border-warning-light bg-warning-lightest",
    text: "text-warning-foreground",
  },
  error: {
    badge: "bg-error-lightest text-error-foreground",
    dot: "bg-error",
    soft: "border-error-light bg-error-lightest",
    text: "text-error-foreground",
  },
  neutral: {
    badge: "bg-neutral-light text-neutral-foreground",
    dot: "bg-neutral",
    soft: "border-border bg-neutral-light",
    text: "text-neutral-foreground",
  },
};

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: AdminSettingsTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[tone].badge}`}
    >
      {label}
    </span>
  );
}

function SummaryTile({
  label,
  tone,
  value,
}: {
  label: string;
  tone: AdminSettingsTone;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 rounded-full ${toneClasses[tone].dot}`}
          aria-hidden="true"
        />
        <p className="text-sm font-semibold text-text-secondary">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-bold leading-9 text-text-primary">
        {value}
      </p>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { company } = adminSettingsDraft;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              Mandant & Plattform
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-[38px] text-text-primary">
              Einstellungen
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
              Verwalte Firmenprofil, Logo, PDF-Stempel, Standardsprache und
              Retention-Vorgaben fuer den aktuellen Mandanten. Diese Ansicht
              ist mock-only und speichert noch keine Aenderungen.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
              type="button"
            >
              Aenderungen verwerfen
            </button>
            <button
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
              type="button"
            >
              Einstellungen speichern
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminSettingsSummary.map((item) => (
          <SummaryTile
            key={item.label}
            label={item.label}
            tone={item.tone}
            value={item.value}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(380px,0.65fr)]">
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Firmenprofil
                </h2>
                <p className="mt-1 text-sm leading-5 text-text-secondary">
                  Company-Daten bleiben spaeter company-scoped. Dispatcher
                  duerfen diese Einstellungen nicht veraendern.
                </p>
              </div>
              <StatusBadge label="Admin only" tone="primary" />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {adminSettingsDraft.profileFields.map((field) => (
                <label className="block" key={field.label}>
                  <span className="text-xs font-semibold uppercase text-text-muted">
                    {field.label}
                  </span>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none transition focus:border-primary"
                    readOnly
                    value={field.value}
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Logo & PDF-Stempel
                </h2>
                <p className="mt-1 text-sm leading-5 text-text-secondary">
                  Upload-Platzhalter fuer Firmenlogo und Stempel PNG. Dateien
                  werden in dieser Phase nicht ausgewaehlt oder hochgeladen.
                </p>
              </div>
              <StatusBadge label="company-assets" tone="info" />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {adminSettingsDraft.assets.map((asset) => (
                <div
                  className="rounded-2xl border border-dashed border-primary-light bg-primary-lightest p-5"
                  key={asset.label}
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface text-sm font-bold text-primary shadow-card">
                      {asset.label}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-text-primary">
                          {asset.title}
                        </h3>
                        <StatusBadge
                          label={asset.statusLabel}
                          tone={asset.tone}
                        />
                      </div>
                      <p className="mt-2 text-sm leading-5 text-text-secondary">
                        {asset.helper}
                      </p>
                      <p className="mt-3 truncate rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-text-secondary shadow-card">
                        {asset.fileLabel}
                      </p>
                    </div>
                  </div>
                  <label className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary">
                    Datei auswaehlen
                    <input className="sr-only" disabled type="file" />
                  </label>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Standardsprache
                </h2>
                <p className="mt-1 text-sm leading-5 text-text-secondary">
                  Deutsch bleibt Standard. Bulgarisch ist nur optional ueber
                  vorhandene Translation Keys sichtbar.
                </p>
              </div>
              <StatusBadge label={company.default_language.toUpperCase()} tone="success" />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {adminSettingsDraft.languageOptions.map((language) => (
                <div
                  className={`rounded-xl border px-4 py-3 ${
                    language.selected
                      ? "border-primary-light bg-primary-lightest"
                      : "border-border-light bg-surface-secondary"
                  }`}
                  key={language.code}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {language.label}
                      </p>
                      <p className="mt-1 text-xs font-medium text-text-secondary">
                        {language.helper}
                      </p>
                    </div>
                    <StatusBadge
                      label={language.selected ? "Aktiv" : "Optional"}
                      tone={language.tone}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Retention & Datenschutz
                </h2>
                <p className="mt-1 text-sm leading-5 text-text-secondary">
                  Die 14-Tage-Regel gilt nur fuer operative Schichtfotos.
                  Lohnabrechnungen, Vertraege und private Dokumente bleiben
                  kontrolliert gespeichert.
                </p>
              </div>
              <StatusBadge label="DSGVO" tone="warning" />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {adminSettingsDraft.retentionItems.map((item) => (
                <div
                  className={`rounded-xl border px-4 py-3 ${toneClasses[item.tone].soft}`}
                  key={item.label}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-xs font-semibold ${toneClasses[item.tone].text}`}>
                        {item.label}
                      </p>
                      <p className="mt-1 text-lg font-bold text-text-primary">
                        {item.value}
                      </p>
                    </div>
                    <span
                      className={`mt-1 h-2.5 w-2.5 rounded-full ${toneClasses[item.tone].dot}`}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-text-secondary">
                    {item.helper}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Einstellungsentwurf
                </h2>
                <p className="mt-1 text-sm leading-5 text-text-secondary">
                  Statische Vorschau fuer spaetere Firmen-Einstellungen.
                </p>
              </div>
              <StatusBadge label="Mock" tone="info" />
            </div>

            <div className="mt-5 rounded-xl border border-primary-light bg-primary-lightest p-4">
              <p className="text-xs font-semibold uppercase text-primary-darker">
                Workspace
              </p>
              <p className="mt-2 text-2xl font-bold text-text-primary">
                {company.name}
              </p>
              <p className="mt-1 text-xs font-medium text-text-secondary">
                {company.slug} - {company.country_code}
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              {[
                ["Aktualisiert", "04.07.2026, 06:30"],
                ["Logo", "Optional vorbereitet"],
                ["Stempel", company.stamp_url ?? "Nicht hinterlegt"],
                ["Sprache", "Deutsch"],
                ["Fotoloeschung", "14 Tage"],
              ].map(([label, value]) => (
                <label className="block" key={label}>
                  <span className="text-xs font-semibold uppercase text-text-muted">
                    {label}
                  </span>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none"
                    readOnly
                    value={value}
                  />
                </label>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
                type="button"
              >
                Einstellungen speichern
              </button>
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
                type="button"
              >
                Vorschau zuruecksetzen
              </button>
            </div>

            <p className="mt-4 rounded-xl border border-warning-light bg-warning-lightest px-4 py-3 text-xs leading-5 text-warning-foreground">
              {adminSettingsDraft.auditReminder}
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">
              Betriebsregeln
            </h2>
            <div className="mt-5 flex flex-col gap-3">
              {adminSettingsDraft.operationalItems.map((item) => (
                <div
                  className={`rounded-xl border px-4 py-3 ${toneClasses[item.tone].soft}`}
                  key={item.label}
                >
                  <p className={`text-xs font-semibold ${toneClasses[item.tone].text}`}>
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-text-secondary">
                    {item.helper}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">
              Settings-Checkliste
            </h2>
            <div className="mt-5 flex flex-col gap-3">
              {adminSettingsDraft.checklist.map((item) => (
                <div
                  className="flex items-center gap-3 rounded-xl border border-border-light bg-surface-secondary px-4 py-3"
                  key={item.label}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      item.done ? "bg-success" : "bg-disabled"
                    }`}
                    aria-hidden="true"
                  />
                  <p className="text-sm font-semibold text-text-primary">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">
              Private Assets
            </h2>
            <p className="mt-4 rounded-xl border border-info-light bg-info-lightest px-4 py-3 text-xs leading-5 text-info-foreground">
              {adminSettingsDraft.storageReminder}
            </p>
          </section>
        </aside>
      </section>
    </div>
  );
}
