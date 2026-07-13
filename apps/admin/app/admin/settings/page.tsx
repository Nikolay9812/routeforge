import {
  getLanguageLabel,
  type AdminSettingsData,
  type AdminSettingsTone,
} from "@/lib/adminSettings";
import { loadAdminSettingsData } from "@/lib/adminSettings.server";
import { requireAdminSession } from "@/lib/auth";

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
      <p className="mt-3 truncate text-3xl font-bold leading-9 text-text-primary">
        {value}
      </p>
    </div>
  );
}

export default async function AdminSettingsPage() {
  const session = await requireAdminSession();
  const data = await loadAdminSettingsData(session);

  return <AdminSettingsContent data={data} />;
}

function AdminSettingsContent({ data }: { data: AdminSettingsData }) {
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
              Firmenprofil, Logo, PDF-Stempel, Standardsprache und
              Retention-Vorgaben fuer den aktuellen Mandanten. Diese Ansicht
              liest echte Daten und bleibt bis zur Einstellungen-Phase
              schreibgeschuetzt.
            </p>
          </div>
          <StatusBadge label="Schreibgeschuetzt" tone="primary" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.summary.map((item) => (
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
                  Company-Daten bleiben company-scoped. Aenderungen kommen erst
                  mit einer echten serverseitigen Mutation.
                </p>
              </div>
              <StatusBadge label="Admin only" tone="primary" />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {data.profileFields.map((field) => (
                <label className="block" key={field.label}>
                  <span className="text-xs font-semibold uppercase text-text-muted">
                    {field.label}
                  </span>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none"
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
                  Private Company-Assets werden hier nur angezeigt. Uploads
                  werden nicht in diesem Stabilisierungspass implementiert.
                </p>
              </div>
              <StatusBadge label="company-assets" tone="info" />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {data.assets.map((asset) => (
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
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">
              Sprache & Betrieb
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {data.languageOptions.map((option) => (
                <div
                  className={`rounded-xl border px-4 py-3 ${toneClasses[option.tone].soft}`}
                  key={option.code}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {getLanguageLabel(option.code)}
                      </p>
                      <p className="mt-1 text-xs font-medium text-text-secondary">
                        {option.helper}
                      </p>
                    </div>
                    <StatusBadge
                      label={option.selected ? "Standard" : "Optional"}
                      tone={option.tone}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {data.operationalItems.map((item) => (
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
                  <p className="mt-1 text-xs font-medium leading-5 text-text-secondary">
                    {item.helper}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">
              Retention & Sicherheit
            </h2>
            <div className="mt-5 flex flex-col gap-3">
              {data.retentionItems.map((item) => (
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
                  <p className="mt-1 text-xs font-medium leading-5 text-text-secondary">
                    {item.helper}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">
              Bereitschaft
            </h2>
            <div className="mt-5 flex flex-col gap-3">
              {data.checklist.map((item) => (
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
              Hinweise
            </h2>
            <p className="mt-4 rounded-xl border border-warning-light bg-warning-lightest px-4 py-3 text-xs leading-5 text-warning-foreground">
              {data.auditReminder}
            </p>
            <p className="mt-3 rounded-xl border border-primary-light bg-primary-lightest px-4 py-3 text-xs leading-5 text-primary-darker">
              {data.storageReminder}
            </p>
          </section>
        </aside>
      </section>
    </div>
  );
}
