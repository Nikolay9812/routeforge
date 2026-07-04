import {
  adminAuditDetail,
  adminAuditFilterGroups,
  adminAuditLogItems,
  adminAuditSummary,
  type AdminAuditLogItem,
  type AdminAuditTone,
} from "@/lib/mock/adminAuditLogs";

const toneClasses: Record<
  AdminAuditTone,
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
  tone: AdminAuditTone;
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
  tone: AdminAuditTone;
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

function AuditReason({ item }: { item: AdminAuditLogItem }) {
  return (
    <span>
      <span className="block font-semibold text-text-primary">
        {item.reasonLabel}
      </span>
      <span className="mt-1 block text-xs font-medium text-text-muted">
        {item.id}
      </span>
    </span>
  );
}

export default function AdminAuditLogsPage() {
  const selectedLog = adminAuditLogItems.find(
    (item) => item.id === adminAuditDetail.selectedLogId,
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              Sicherheit & Verlauf
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-[38px] text-text-primary">
              Audit Logs
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
              Pruefe sensible Aenderungen fuer Schichten, Abrechnung, Zugriff,
              Dokumente und Exporte. Die Ansicht ist in dieser Phase
              mock-basiert und schreibgeschuetzt.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
              type="button"
            >
              CSV Pruefspur
            </button>
            <button
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
              type="button"
            >
              Bericht vorbereiten
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          label="Eintraege"
          tone="primary"
          value={String(adminAuditSummary.total)}
        />
        <SummaryTile
          label="Geldrelevant"
          tone="warning"
          value={String(adminAuditSummary.money)}
        />
        <SummaryTile
          label="Zugriff"
          tone="info"
          value={String(adminAuditSummary.access)}
        />
        <SummaryTile
          label="Dokumente"
          tone="success"
          value={String(adminAuditSummary.documents)}
        />
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Filter</h2>
            <p className="mt-1 text-sm leading-5 text-text-secondary">
              Statische UI-Filter fuer Akteur, Aktion, Datum und Ziel. Reale
              Abfragen muessen spaeter company-scoped und permission-geprueft
              bleiben.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
              type="button"
            >
              Filter zuruecksetzen
            </button>
            <button
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
              type="button"
            >
              Verlauf aktualisieren
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-4">
          {adminAuditFilterGroups.map((filter) => (
            <label className="block" key={filter.label}>
              <span className="text-xs font-semibold uppercase text-text-muted">
                {filter.label}
              </span>
              <span className="mt-2 flex min-h-11 items-center justify-between rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card">
                <span className="truncate">{filter.value}</span>
                <span
                  className="text-xs font-bold text-text-muted"
                  aria-hidden="true"
                >
                  v
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(380px,0.55fr)]">
        <div className="rounded-2xl border border-border bg-surface shadow-card">
          <div className="flex flex-col gap-3 border-b border-border-light p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Audit-Verlauf
              </h2>
              <p className="mt-1 text-sm leading-5 text-text-secondary">
                Jeder Eintrag zeigt Zeitpunkt, Akteur, Aktion, Ziel und Grund.
                Reale Logs duerfen spaeter nicht clientseitig veraendert werden.
              </p>
            </div>
            <p className="text-sm font-semibold text-text-secondary">
              {adminAuditLogItems.length} Eintraege angezeigt
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1280px]">
              <div className="grid grid-cols-[0.9fr_1fr_0.9fr_1.15fr_1.35fr_0.75fr] bg-surface-secondary px-6 py-3 text-xs font-semibold uppercase text-text-subtle">
                <span>Zeitpunkt</span>
                <span>Akteur</span>
                <span>Aktion</span>
                <span>Ziel</span>
                <span>Grund</span>
                <span>Scope</span>
              </div>

              <div className="divide-y divide-border-light">
                {adminAuditLogItems.map((item) => (
                  <div
                    className="grid grid-cols-[0.9fr_1fr_0.9fr_1.15fr_1.35fr_0.75fr] items-center px-6 py-4 text-sm text-text-primary transition hover:bg-surface-secondary"
                    key={item.id}
                  >
                    <span>
                      <span className="block font-semibold">
                        {item.timestampLabel}
                      </span>
                      <span className="mt-1 block text-xs font-medium text-text-muted">
                        {item.created_at}
                      </span>
                    </span>

                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-lightest text-xs font-bold text-primary-darker">
                        {item.actorName
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">
                          {item.actorName}
                        </span>
                        <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                          {item.actorRoleLabel}
                        </span>
                      </span>
                    </span>

                    <span>
                      <StatusBadge
                        label={item.actionLabel}
                        tone={item.actionTone}
                      />
                      <span className="mt-2 block text-xs font-medium text-text-muted">
                        {item.action}
                      </span>
                    </span>

                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {item.targetLabel}
                      </span>
                      <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                        {item.targetDetail}
                      </span>
                      <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                        {item.target_table}
                      </span>
                    </span>

                    <AuditReason item={item} />

                    <span>
                      <StatusBadge label={item.scopeLabel} tone="neutral" />
                      <span className="mt-2 block text-xs font-medium text-text-muted">
                        {item.depotScopeLabel}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Change Detail
                </h2>
                <p className="mt-1 text-sm leading-5 text-text-secondary">
                  {adminAuditDetail.helper}
                </p>
              </div>
              <StatusBadge label="Mock" tone="info" />
            </div>

            {selectedLog ? (
              <div className="mt-5 rounded-xl border border-primary-light bg-primary-lightest p-4">
                <p className="text-xs font-semibold uppercase text-primary-darker">
                  Ausgewaehlter Eintrag
                </p>
                <p className="mt-2 text-sm font-semibold text-text-primary">
                  {selectedLog.actionLabel}
                </p>
                <p className="mt-1 text-xs font-medium text-text-secondary">
                  {selectedLog.targetLabel} - {selectedLog.timestampLabel}
                </p>
              </div>
            ) : null}

            <div className="mt-5 divide-y divide-border-light rounded-xl border border-border-light">
              {adminAuditDetail.rows.map((row) => (
                <div
                  className="grid gap-3 p-4 sm:grid-cols-[0.85fr_1fr_1fr]"
                  key={row.label}
                >
                  <p className="text-xs font-semibold uppercase text-text-muted">
                    {row.label}
                  </p>
                  <div>
                    <p className="text-xs font-semibold text-text-muted">
                      Vorher
                    </p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">
                      {row.beforeValue}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-muted">
                      Nachher
                    </p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">
                      {row.afterValue}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {selectedLog ? (
              <div className="mt-5 rounded-xl border border-warning-light bg-warning-lightest px-4 py-3">
                <p className="text-xs font-semibold uppercase text-warning-foreground">
                  Grund
                </p>
                <p className="mt-2 text-sm leading-6 text-text-primary">
                  {selectedLog.reasonLabel}
                </p>
              </div>
            ) : null}

            <p className="mt-4 rounded-xl border border-warning-light bg-warning-lightest px-4 py-3 text-xs leading-5 text-warning-foreground">
              {adminAuditDetail.immutableReminder}
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">
              Sicherheitsnotizen
            </h2>
            <div className="mt-5 flex flex-col gap-3">
              {adminAuditDetail.securityNotes.map((note) => (
                <div
                  className={`rounded-xl border px-4 py-3 ${toneClasses[note.tone].soft}`}
                  key={note.label}
                >
                  <p className={`text-xs font-semibold ${toneClasses[note.tone].text}`}>
                    {note.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">
                    {note.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">
              Audit-Checkliste
            </h2>
            <div className="mt-5 flex flex-col gap-3">
              {adminAuditDetail.checklist.map((item) => (
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
        </aside>
      </section>
    </div>
  );
}
