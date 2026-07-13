import Link from "next/link";

import { requireAdminSession } from "@/lib/auth";
import type { AdminCourierTone } from "@/lib/couriers";
import { loadAdminCourierPageData } from "@/lib/couriers.server";

const toneClasses: Record<
  AdminCourierTone,
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
  tone: AdminCourierTone;
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
  tone: AdminCourierTone;
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

export default async function AdminCouriersPage() {
  const session = await requireAdminSession();
  const { couriers, filters, summary } = await loadAdminCourierPageData(session);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              Kurierverwaltung
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-[38px] text-text-primary">
              Kuriere
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
              Verwalte Kuriere, Depot-Zuordnung, Zahlungsart, Profilstatus und
              Dokumentenbereitschaft fuer den aktuellen Mandanten.
            </p>
          </div>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
            href="/admin/invitations"
          >
            Kurier einladen
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          label="Kuriere gesamt"
          tone="primary"
          value={String(summary.total)}
        />
        <SummaryTile
          label="Aktiv"
          tone="success"
          value={String(summary.active)}
        />
        <SummaryTile
          label="Warten auf Freigabe"
          tone="warning"
          value={String(summary.pendingApproval)}
        />
        <SummaryTile
          label="Dokumente offen"
          tone="error"
          value={String(summary.documentIssues)}
        />
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Filter</h2>
            <p className="mt-1 text-sm leading-5 text-text-secondary">
              Statische UI-Filter fuer Suche, Depot, Status und Zahlungsart.
              Interaktive Filter folgen in einer spaeteren Admin-Logikphase.
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
              placeholder="Kuriere suchen (Name, E-Mail, Telefon)"
              type="search"
            />
          </label>

          {filters.map((filter) => (
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

      <section className="rounded-2xl border border-border bg-surface shadow-card">
        <div className="flex flex-col gap-3 border-b border-border-light p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Kurierliste
            </h2>
            <p className="mt-1 text-sm leading-5 text-text-secondary">
              Admin sieht alle company-scoped Kuriere. Dispatcher-Ansicht wird
              spaeter depot-scoped gefiltert.
            </p>
          </div>
          <p className="text-sm font-semibold text-text-secondary">
            {couriers.length} Kuriere angezeigt
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1120px]">
            <div className="grid grid-cols-[1.35fr_0.9fr_0.75fr_0.85fr_0.95fr_0.8fr_0.75fr] bg-surface-secondary px-6 py-3 text-xs font-semibold uppercase text-text-subtle">
              <span>Name</span>
              <span>Depot</span>
              <span>Status</span>
              <span>Zahlungsart</span>
              <span>Letzte Schicht</span>
              <span>Dokumente</span>
              <span>Aktionen</span>
            </div>

            <div className="divide-y divide-border-light">
              {couriers.map((courier) => (
                <div
                  className="grid grid-cols-[1.35fr_0.9fr_0.75fr_0.85fr_0.95fr_0.8fr_0.75fr] items-center px-6 py-4 text-sm text-text-primary transition hover:bg-surface-secondary"
                  key={courier.id}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-lightest text-sm font-bold text-primary-darker">
                      {courier.initials}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {courier.fullName}
                      </span>
                      <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                        {courier.email}
                      </span>
                      <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                        {courier.phone}
                      </span>
                    </span>
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate font-semibold">
                      {courier.depotName}
                    </span>
                    <span className="mt-1 block text-xs font-medium text-text-muted">
                      {courier.depotCode}
                    </span>
                  </span>

                  <span>
                    <StatusBadge
                      label={courier.statusLabel}
                      tone={courier.statusTone}
                    />
                    <span className="mt-2 block text-xs font-medium text-text-muted">
                      {courier.invitationLabel}
                    </span>
                  </span>

                  <span>
                    <span className="block font-semibold">
                      {courier.paymentModeLabel}
                    </span>
                    <span className="mt-1 block text-xs font-medium text-text-muted">
                      {courier.paymentMode}
                    </span>
                  </span>

                  <span>
                    <span className="block font-semibold">
                      {courier.lastShiftLabel}
                    </span>
                    <span className="mt-1 block text-xs font-medium text-text-muted">
                      {courier.lastShiftDetail}
                    </span>
                  </span>

                  <span
                    className={`inline-flex w-fit rounded-xl border px-3 py-2 ${toneClasses[courier.documentsTone].soft}`}
                  >
                    <span
                      className={`text-xs font-semibold ${toneClasses[courier.documentsTone].text}`}
                    >
                      {courier.documentsLabel}
                    </span>
                  </span>

                  <span className="flex flex-wrap gap-2">
                    <Link
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
                      href={courier.href}
                    >
                      Profil
                    </Link>
                    <Link
                      className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:bg-primary-dark"
                      href="/admin/documents"
                    >
                      Docs
                    </Link>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
