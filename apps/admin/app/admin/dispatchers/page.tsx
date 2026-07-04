import Link from "next/link";

import { DispatcherDepotAccess } from "@/components/dispatchers/DispatcherDepotAccess";
import {
  adminDispatcherAccessDraft,
  adminDispatcherDepotOptions,
  adminDispatcherFilterGroups,
  adminDispatcherListItems,
  adminDispatcherSummary,
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

      <DispatcherDepotAccess
        auditReminder={adminDispatcherAccessDraft.auditReminder}
        depotOptions={adminDispatcherDepotOptions}
        dispatchers={adminDispatcherListItems}
        securityRules={[
          "Dispatcher duerfen nur zugewiesene Depots sehen.",
          "Depot-Zugriff ist fuer operative Ansichten verbindlich.",
          "Jede Aenderung wird im Audit Log dokumentiert.",
        ]}
      />
    </div>
  );
}
