import {
  adminInvitationDraft,
  adminInvitationFilterGroups,
  adminInvitationListItems,
  adminInvitationSummary,
  type AdminInvitationTone,
} from "@/lib/mock/adminInvitations";

const toneClasses: Record<
  AdminInvitationTone,
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
  tone: AdminInvitationTone;
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
  tone: AdminInvitationTone;
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

export default function AdminInvitationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              Einladungsverwaltung
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-[38px] text-text-primary">
              Einladungen
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
              Erstelle E-Mail-Codes fuer Kuriere und Dispatcher. Codes sind
              einmalig nutzbar, laufen ab und starten neue Kuriere mit
              ausstehender Freigabe.
            </p>
          </div>
          <button
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
            type="button"
          >
            Einladung erstellen
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          label="Einladungen gesamt"
          tone="primary"
          value={String(adminInvitationSummary.total)}
        />
        <SummaryTile
          label="Aktiv"
          tone="success"
          value={String(adminInvitationSummary.active)}
        />
        <SummaryTile
          label="Verwendet"
          tone="neutral"
          value={String(adminInvitationSummary.used)}
        />
        <SummaryTile
          label="Gesperrt"
          tone="warning"
          value={String(adminInvitationSummary.blocked)}
        />
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Filter</h2>
            <p className="mt-1 text-sm leading-5 text-text-secondary">
              Statische UI-Filter fuer E-Mail, Rolle, Depot und Status. Lokale
              Einladungslogik folgt in einer spaeteren Phase.
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
              Filter anwenden
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,0.9fr))]">
          <label className="block">
            <span className="text-xs font-semibold uppercase text-text-muted">
              Suche
            </span>
            <input
              className="mt-2 flex h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none transition placeholder:text-text-muted focus:border-primary"
              placeholder="Einladung suchen (E-Mail, Code, Ersteller)"
              type="search"
            />
          </label>

          {adminInvitationFilterGroups.map((filter) => (
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

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(380px,0.65fr)]">
        <div className="rounded-2xl border border-border bg-surface shadow-card">
          <div className="flex flex-col gap-3 border-b border-border-light p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Einladungsliste
              </h2>
              <p className="mt-1 text-sm leading-5 text-text-secondary">
                Admin sieht company-scoped Einladungen. Dispatcher-Erstellung
                muss spaeter depot-scoped und permission-geprueft bleiben.
              </p>
            </div>
            <p className="text-sm font-semibold text-text-secondary">
              {adminInvitationListItems.length} Einladungen angezeigt
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1180px]">
              <div className="grid grid-cols-[1.25fr_0.65fr_0.9fr_0.9fr_0.9fr_0.8fr_0.75fr] bg-surface-secondary px-6 py-3 text-xs font-semibold uppercase text-text-subtle">
                <span>Empfaenger</span>
                <span>Rolle</span>
                <span>Depot</span>
                <span>Code</span>
                <span>Ablauf</span>
                <span>Status</span>
                <span>Aktionen</span>
              </div>

              <div className="divide-y divide-border-light">
                {adminInvitationListItems.map((invitation) => (
                  <div
                    className="grid grid-cols-[1.25fr_0.65fr_0.9fr_0.9fr_0.9fr_0.8fr_0.75fr] items-center px-6 py-4 text-sm text-text-primary transition hover:bg-surface-secondary"
                    key={invitation.id}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-lightest text-sm font-bold text-primary-darker">
                        {invitation.role === "courier" ? "KU" : "DP"}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">
                          {invitation.email}
                        </span>
                        <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                          {invitation.id}
                        </span>
                        <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                          Erstellt von {invitation.createdByName}
                        </span>
                      </span>
                    </span>

                    <span>
                      <StatusBadge
                        label={invitation.roleLabel}
                        tone={invitation.role === "courier" ? "primary" : "info"}
                      />
                      <span className="mt-2 block text-xs font-medium text-text-muted">
                        {invitation.registrationLabel}
                      </span>
                    </span>

                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {invitation.depotName}
                      </span>
                      <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                        {invitation.depot_id ?? "Optional"}
                      </span>
                    </span>

                    <span>
                      <span className="inline-flex rounded-xl border border-border bg-surface px-3 py-2 font-semibold tracking-wide shadow-card">
                        {invitation.invite_code}
                      </span>
                      <span className="mt-2 block text-xs font-medium text-text-muted">
                        Einmal-Code
                      </span>
                    </span>

                    <span>
                      <span className="block font-semibold">
                        {invitation.expiresAtLabel}
                      </span>
                      <span className="mt-1 block text-xs font-medium text-text-muted">
                        Genutzt: {invitation.usedAtLabel}
                      </span>
                    </span>

                    <span>
                      <StatusBadge
                        label={invitation.statusLabel}
                        tone={invitation.statusTone}
                      />
                      <span className="mt-2 block text-xs font-medium text-text-muted">
                        {invitation.deliveryLabel}
                      </span>
                    </span>

                    <span className="flex flex-wrap gap-2">
                      <button
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
                        type="button"
                      >
                        Details
                      </button>
                      <button
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-error-light bg-error-lightest px-3 text-xs font-semibold text-error-foreground transition hover:bg-surface-secondary"
                        type="button"
                      >
                        Widerrufen
                      </button>
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
                  Einladung erstellen
                </h2>
                <p className="mt-1 text-sm leading-5 text-text-secondary">
                  Statische Dialog-Vorschau fuer einen neuen E-Mail-Code.
                </p>
              </div>
              <StatusBadge label="Mock" tone="info" />
            </div>

            <div className="mt-5 rounded-xl border border-primary-light bg-primary-lightest p-4">
              <p className="text-xs font-semibold uppercase text-primary-darker">
                Code-Vorschau
              </p>
              <p className="mt-2 text-2xl font-bold tracking-wide text-text-primary">
                {adminInvitationDraft.inviteCodePreview}
              </p>
              <p className="mt-1 text-xs font-medium text-text-secondary">
                {adminInvitationDraft.validityLabel}
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              <label className="block">
                <span className="text-xs font-semibold uppercase text-text-muted">
                  E-Mail
                </span>
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none"
                  readOnly
                  type="email"
                  value={adminInvitationDraft.email}
                />
              </label>

              {adminInvitationDraft.fields.slice(1).map((field) => (
                <label className="block" key={field.label}>
                  <span className="text-xs font-semibold uppercase text-text-muted">
                    {field.label}
                  </span>
                  <span className="mt-2 flex min-h-11 items-center justify-between rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card">
                    <span className="truncate">{field.value}</span>
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

            <div className="mt-5 rounded-xl border border-border-light bg-surface-secondary p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    E-Mail-Versand
                  </p>
                  <p className="mt-1 text-xs font-medium text-text-secondary">
                    {adminInvitationDraft.expiresAtLabel}
                  </p>
                </div>
                <StatusBadge label="Vorbereitet" tone="warning" />
              </div>
              <p className="mt-3 text-xs leading-5 text-text-secondary">
                {adminInvitationDraft.deliveryMessage}
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
                type="button"
              >
                Einladung vorbereiten
              </button>
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
                type="button"
              >
                Entwurf verwerfen
              </button>
            </div>

            <p className="mt-4 rounded-xl border border-warning-light bg-warning-lightest px-4 py-3 text-xs leading-5 text-warning-foreground">
              {adminInvitationDraft.auditReminder}
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">
              Registrierung & Scope
            </h2>
            <div className="mt-5 flex flex-col gap-3">
              {adminInvitationDraft.visibilityRows.map((row) => (
                <div
                  className={`rounded-xl border px-4 py-3 ${toneClasses[row.tone].soft}`}
                  key={row.label}
                >
                  <p className={`text-xs font-semibold ${toneClasses[row.tone].text}`}>
                    {row.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">
              Einladungs-Checkliste
            </h2>
            <div className="mt-5 flex flex-col gap-3">
              {adminInvitationDraft.checklist.map((item) => (
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
