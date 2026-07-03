import {
  adminDepotDetailDraft,
  adminDepotFilterGroups,
  adminDepotListItems,
  adminDepotSummary,
  type AdminDepotTone,
} from "@/lib/mock/adminDepots";

const toneClasses: Record<
  AdminDepotTone,
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
  tone: AdminDepotTone;
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
  tone: AdminDepotTone;
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

export default function AdminDepotsPage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              Depot-Verwaltung
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-[38px] text-text-primary">
              Depots
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
              Verwalte Standorte, Adressen, Start/Stopp-Geofence und operative
              Zuweisungen fuer den aktuellen Mandanten.
            </p>
          </div>
          <button
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
            type="button"
          >
            Depot hinzufuegen
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          label="Depots gesamt"
          tone="primary"
          value={String(adminDepotSummary.total)}
        />
        <SummaryTile
          label="Aktiv"
          tone="success"
          value={String(adminDepotSummary.active)}
        />
        <SummaryTile
          label="Geofence-Warnungen"
          tone="error"
          value={String(adminDepotSummary.geofenceWarnings)}
        />
        <SummaryTile
          label="Zugewiesene Kuriere"
          tone="info"
          value={String(adminDepotSummary.assignedCouriers)}
        />
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Filter</h2>
            <p className="mt-1 text-sm leading-5 text-text-secondary">
              Statische UI-Filter fuer Standortsuche, Status, Geofence und
              Zuweisungen. Lokale Filterlogik folgt in einer spaeteren Phase.
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
              placeholder="Depot suchen (Name, Code, Stadt)"
              type="search"
            />
          </label>

          {adminDepotFilterGroups.map((filter) => (
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
                Depot-Liste
              </h2>
              <p className="mt-1 text-sm leading-5 text-text-secondary">
                Admin sieht alle company-scoped Depots. Dispatcher-Ansicht wird
                spaeter ueber `profile_depot_access` begrenzt.
              </p>
            </div>
            <p className="text-sm font-semibold text-text-secondary">
              {adminDepotListItems.length} Depots angezeigt
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1180px]">
              <div className="grid grid-cols-[1.05fr_1.2fr_0.7fr_0.85fr_0.85fr_0.85fr_0.75fr] bg-surface-secondary px-6 py-3 text-xs font-semibold uppercase text-text-subtle">
                <span>Depot</span>
                <span>Adresse</span>
                <span>Status</span>
                <span>Geofence</span>
                <span>Zuweisung</span>
                <span>Kontakt</span>
                <span>Aktionen</span>
              </div>

              <div className="divide-y divide-border-light">
                {adminDepotListItems.map((depot) => (
                  <div
                    className="grid grid-cols-[1.05fr_1.2fr_0.7fr_0.85fr_0.85fr_0.85fr_0.75fr] items-center px-6 py-4 text-sm text-text-primary transition hover:bg-surface-secondary"
                    key={depot.id}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-lightest text-sm font-bold text-primary-darker">
                        {depot.code}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">
                          {depot.name}
                        </span>
                        <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                          {depot.id}
                        </span>
                        <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                          {depot.operatingHours}
                        </span>
                      </span>
                    </span>

                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {depot.address_line_1}
                      </span>
                      <span className="mt-1 block text-xs font-medium text-text-muted">
                        {depot.postal_code} {depot.city}
                      </span>
                      <span className="mt-1 block text-xs font-medium text-text-muted">
                        {depot.latitude}, {depot.longitude}
                      </span>
                    </span>

                    <span>
                      <StatusBadge
                        label={depot.statusLabel}
                        tone={depot.statusTone}
                      />
                      <span className="mt-2 block text-xs font-medium text-text-muted">
                        {depot.lastShiftLabel}
                      </span>
                    </span>

                    <span>
                      <span
                        className={`inline-flex rounded-xl border px-3 py-2 ${toneClasses[depot.geofenceTone].soft}`}
                      >
                        <span
                          className={`text-xs font-semibold ${toneClasses[depot.geofenceTone].text}`}
                        >
                          {depot.geofenceLabel}
                        </span>
                      </span>
                      <span className="mt-2 block text-xs font-medium text-text-muted">
                        Radius {depot.geofence_radius_meters} m
                      </span>
                    </span>

                    <span>
                      <span className="block font-semibold">
                        {depot.dispatcherCount} Dispatcher
                      </span>
                      <span className="mt-1 block text-xs font-medium text-text-muted">
                        {depot.courierCount} Kuriere
                      </span>
                    </span>

                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {depot.contactName}
                      </span>
                      <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                        {depot.contactPhone}
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
                        className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:bg-primary-dark"
                        type="button"
                      >
                        Bearbeiten
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
                  Depot-Details bearbeiten
                </h2>
                <p className="mt-1 text-sm leading-5 text-text-secondary">
                  Mock-Entwurf fuer {adminDepotDetailDraft.depotName}.
                </p>
              </div>
              <StatusBadge
                label={adminDepotDetailDraft.statusLabel}
                tone={adminDepotDetailDraft.statusTone}
              />
            </div>

            <div className="mt-5 rounded-xl border border-primary-light bg-primary-lightest p-4">
              <p className="text-xs font-semibold uppercase text-primary-darker">
                Ausgewaehltes Depot
              </p>
              <p className="mt-2 text-sm font-semibold text-text-primary">
                {adminDepotDetailDraft.depotName}
              </p>
              <p className="mt-1 text-xs font-medium text-text-secondary">
                {adminDepotDetailDraft.depotCode} - {adminDepotDetailDraft.depotId}
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {adminDepotDetailDraft.fields.map((field) => (
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

            <div className="mt-5 flex flex-col gap-3">
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
                type="button"
              >
                Depot speichern
              </button>
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
                type="button"
              >
                Entwurf verwerfen
              </button>
            </div>

            <p className="mt-4 rounded-xl border border-warning-light bg-warning-lightest px-4 py-3 text-xs leading-5 text-warning-foreground">
              {adminDepotDetailDraft.auditReminder}
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">
              Zuweisungen
            </h2>

            <div className="mt-5 flex flex-col gap-3">
              {adminDepotDetailDraft.assignedDispatchers.map((dispatcher) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-xl border border-border-light bg-surface-secondary px-4 py-3"
                  key={dispatcher.name}
                >
                  <p className="text-sm font-semibold text-text-primary">
                    {dispatcher.name}
                  </p>
                  <StatusBadge
                    label={dispatcher.accessLabel}
                    tone={dispatcher.tone}
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3">
              {adminDepotDetailDraft.courierPreview.map((item) => (
                <div
                  className={`rounded-xl border px-4 py-3 ${toneClasses[item.tone].soft}`}
                  key={item.label}
                >
                  <p className={`text-xs font-semibold ${toneClasses[item.tone].text}`}>
                    {item.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-text-primary">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">
              Geofence-Pruefung
            </h2>
            <p className="mt-1 text-sm leading-5 text-text-secondary">
              Nur Start- und Stopp-Standorte zaehlen in v1. Kein Live-Tracking.
            </p>

            <div className="mt-5 flex flex-col gap-3">
              {adminDepotDetailDraft.geofenceChecks.map((check) => (
                <div
                  className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${toneClasses[check.tone].soft}`}
                  key={check.label}
                >
                  <span
                    className={`text-sm font-semibold ${toneClasses[check.tone].text}`}
                  >
                    {check.label}
                  </span>
                  <span className="text-sm font-bold text-text-primary">
                    {check.value}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
