import Link from "next/link";

import {
  adminDispatcherAccessDraft,
  adminDispatcherFilterGroups,
  adminDispatcherListItems,
  adminDispatcherSummary,
  type AdminDispatcherDepotAccess,
  type AdminDispatcherPermission,
  type AdminDispatcherTone,
} from "@/lib/mock/adminDispatchers";

const toneClasses: Record<
  AdminDispatcherTone,
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
  tone: AdminDispatcherTone;
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
  tone: AdminDispatcherTone;
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

function DepotAccessPills({
  depots,
}: {
  depots: AdminDispatcherDepotAccess[];
}) {
  return (
    <span className="flex flex-wrap gap-2">
      {depots.map((depot) => (
        <span
          className={`inline-flex rounded-xl border px-3 py-2 ${toneClasses[depot.tone].soft}`}
          key={`${depot.depotCode}-${depot.accessLabel}`}
        >
          <span className={`text-xs font-semibold ${toneClasses[depot.tone].text}`}>
            {depot.depotCode} - {depot.accessLabel}
          </span>
        </span>
      ))}
    </span>
  );
}

function PermissionList({
  permissions,
}: {
  permissions: AdminDispatcherPermission[];
}) {
  return (
    <div className="flex flex-col gap-2">
      {permissions.map((permission) => (
        <span className="flex items-center gap-2" key={permission.label}>
          <span
            className={`h-2 w-2 rounded-full ${
              permission.enabled ? "bg-success" : "bg-disabled"
            }`}
            aria-hidden="true"
          />
          <span
            className={`text-xs font-semibold ${
              permission.enabled
                ? "text-text-secondary"
                : "text-disabled-foreground"
            }`}
          >
            {permission.label}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function AdminDispatchersPage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              Dispatcher-Verwaltung
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-[38px] text-text-primary">
              Dispatcher
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
              Verwalte Dispatcher, Depot-Zugriff und operative Rechte im
              aktuellen Mandanten. Jeder Dispatcher arbeitet nur in den
              zugewiesenen Depots.
            </p>
          </div>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
            href="/admin/invitations"
          >
            Dispatcher einladen
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          label="Dispatcher gesamt"
          tone="primary"
          value={String(adminDispatcherSummary.total)}
        />
        <SummaryTile
          label="Aktiv"
          tone="success"
          value={String(adminDispatcherSummary.active)}
        />
        <SummaryTile
          label="Einladungen offen"
          tone="warning"
          value={String(adminDispatcherSummary.pending)}
        />
        <SummaryTile
          label="Depots im Zugriff"
          tone="info"
          value={String(adminDispatcherSummary.scopedDepots)}
        />
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Filter</h2>
            <p className="mt-1 text-sm leading-5 text-text-secondary">
              Grenze die Ansicht nach Depot-Zugriff, Status und Berechtigungen
              ein.
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
              placeholder="Dispatcher suchen (Name, E-Mail, Telefon)"
              type="search"
            />
          </label>

          {adminDispatcherFilterGroups.map((filter) => (
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
                Dispatcher-Liste
              </h2>
              <p className="mt-1 text-sm leading-5 text-text-secondary">
                Uebersicht der Dispatcher im aktuellen Unternehmen.
              </p>
            </div>
            <p className="text-sm font-semibold text-text-secondary">
              {adminDispatcherListItems.length} Dispatcher angezeigt
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1180px]">
              <div className="grid grid-cols-[1.2fr_0.65fr_1fr_1fr_0.8fr_0.75fr] bg-surface-secondary px-6 py-3 text-xs font-semibold uppercase text-text-subtle">
                <span>Name</span>
                <span>Status</span>
                <span>Depot-Zugriff</span>
                <span>Berechtigungen</span>
                <span>Letzte Aktivitaet</span>
                <span>Aktionen</span>
              </div>

              <div className="divide-y divide-border-light">
                {adminDispatcherListItems.map((dispatcher) => (
                  <div
                    className="grid grid-cols-[1.2fr_0.65fr_1fr_1fr_0.8fr_0.75fr] items-center px-6 py-4 text-sm text-text-primary transition hover:bg-surface-secondary"
                    key={dispatcher.id}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-lightest text-sm font-bold text-primary-darker">
                        {dispatcher.initials}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">
                          {dispatcher.fullName}
                        </span>
                        <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                          {dispatcher.email}
                        </span>
                        <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                          {dispatcher.phone}
                        </span>
                      </span>
                    </span>

                    <span>
                      <StatusBadge
                        label={dispatcher.statusLabel}
                        tone={dispatcher.statusTone}
                      />
                      <span className="mt-2 block text-xs font-medium text-text-muted">
                        {dispatcher.inviteLabel}
                      </span>
                    </span>

                    <span>
                      <span className="mb-2 block text-xs font-semibold text-text-secondary">
                        {dispatcher.depotSummaryLabel}
                      </span>
                      <DepotAccessPills depots={dispatcher.depotAccess} />
                    </span>

                    <span>
                      <span className="mb-2 block text-xs font-semibold text-text-secondary">
                        {dispatcher.permissionSummaryLabel}
                      </span>
                      <PermissionList permissions={dispatcher.permissions} />
                    </span>

                    <span className="font-semibold text-text-secondary">
                      {dispatcher.lastActivityLabel}
                    </span>

                    <span className="flex flex-wrap gap-2">
                      <button
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
                        type="button"
                      >
                        Zugriff
                      </button>
                      <button
                        className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:bg-primary-dark"
                        type="button"
                      >
                        Aktivieren
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
                  Depot-Zugriff bearbeiten
                </h2>
                <p className="mt-1 text-sm leading-5 text-text-secondary">
                  Aktuelle Auswahl fuer {adminDispatcherAccessDraft.dispatcherName}.
                </p>
              </div>
              <StatusBadge label="Entwurf" tone="info" />
            </div>

            <div className="mt-5 rounded-xl border border-primary-light bg-primary-lightest p-4">
              <p className="text-xs font-semibold uppercase text-primary-darker">
                Dispatcher
              </p>
              <p className="mt-2 text-sm font-semibold text-text-primary">
                {adminDispatcherAccessDraft.dispatcherName}
              </p>
              <p className="mt-1 text-xs font-medium text-text-secondary">
                {adminDispatcherAccessDraft.dispatcherId}
              </p>
            </div>

            <div className="mt-5 divide-y divide-border-light">
              {adminDispatcherAccessDraft.editableDepots.map((depot) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  key={depot.depotCode}
                >
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {depot.depotName}
                    </p>
                    <p className="mt-1 text-xs font-medium text-text-secondary">
                      {depot.depotCode}
                    </p>
                  </div>
                  <StatusBadge label={depot.stateLabel} tone={depot.tone} />
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
                type="button"
              >
                Zugriff speichern
              </button>
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
                type="button"
              >
                Auswahl verwerfen
              </button>
            </div>

            <p className="mt-4 rounded-xl border border-warning-light bg-warning-lightest px-4 py-3 text-xs leading-5 text-warning-foreground">
              {adminDispatcherAccessDraft.auditReminder}
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">
              Sicherheitsgrenze
            </h2>
            <div className="mt-5 flex flex-col gap-3">
              {[
                "Dispatcher duerfen nur zugewiesene Depots sehen.",
                "Depot-Zugriff ist fuer operative Ansichten verbindlich.",
                "Jede Aenderung wird im Audit Log dokumentiert.",
              ].map((rule) => (
                <div
                  className="rounded-xl border border-border-light bg-surface-secondary px-4 py-3"
                  key={rule}
                >
                  <p className="text-sm font-semibold text-text-primary">
                    {rule}
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
