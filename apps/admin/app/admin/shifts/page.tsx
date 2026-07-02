import Link from "next/link";

import {
  adminShiftFilterGroups,
  adminShiftListItems,
  adminShiftSummary,
  type AdminShiftTone,
} from "@/lib/mock/adminShifts";

const toneClasses: Record<
  AdminShiftTone,
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
  tone: AdminShiftTone;
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
  tone: AdminShiftTone;
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

export default function AdminShiftsPage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              Schichtverwaltung
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-[38px] text-text-primary">
              Schichten
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
              Pruefe eingereichte Schichten, erkenne Geofence-Warnungen und
              oeffne einzelne Berichte fuer die Detailpruefung.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-primary-lightest px-3 py-1 text-xs font-semibold text-primary-darker">
              Heute, 1. Juli 2026
            </span>
            <span className="rounded-full bg-warning-lightest px-3 py-1 text-xs font-semibold text-warning-foreground">
              Mock-Filter
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          label="Eingereicht"
          tone="info"
          value={String(adminShiftSummary.submitted)}
        />
        <SummaryTile
          label="In Pruefung"
          tone="warning"
          value={String(adminShiftSummary.underReview)}
        />
        <SummaryTile
          label="Heute genehmigt"
          tone="success"
          value={String(adminShiftSummary.approvedToday)}
        />
        <SummaryTile
          label="Geofence-Warnungen"
          tone="error"
          value={String(adminShiftSummary.geofenceWarnings)}
        />
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Filter</h2>
            <p className="mt-1 text-sm leading-5 text-text-secondary">
              Statische UI-Filter fuer Datum, Depot, Status, Kurier und
              Zahlungsart. Lokale Filterlogik folgt in RF-ADM-016.
            </p>
          </div>
          <button
            className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
            type="button"
          >
            Filter zuruecksetzen
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {adminShiftFilterGroups.map((filter) => (
            <label className="block" key={filter.label}>
              <span className="text-xs font-semibold uppercase text-text-muted">
                {filter.label}
              </span>
              <span className="mt-2 flex min-h-11 items-center justify-between rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card">
                <span className="truncate">{filter.value}</span>
                <span className="text-xs font-bold text-text-muted" aria-hidden="true">
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
              Schichtliste
            </h2>
            <p className="mt-1 text-sm leading-5 text-text-secondary">
              Eingereichte, genehmigte und abgelehnte Schichten mit sichtbarem
              Geofence-Status.
            </p>
          </div>
          <p className="text-sm font-semibold text-text-secondary">
            {adminShiftListItems.length} Schichten angezeigt
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1040px]">
            <div className="grid grid-cols-[1.25fr_0.85fr_0.9fr_0.8fr_0.75fr_0.85fr_1fr] bg-surface-secondary px-6 py-3 text-xs font-semibold uppercase text-text-subtle">
              <span>Kurier</span>
              <span>Datum</span>
              <span>Depot</span>
              <span>Start/Stopp</span>
              <span>Abrechenbar</span>
              <span>Status</span>
              <span>Geofence</span>
            </div>

            <div className="divide-y divide-border-light">
              {adminShiftListItems.map((shift) => (
                <Link
                  className="grid grid-cols-[1.25fr_0.85fr_0.9fr_0.8fr_0.75fr_0.85fr_1fr] items-center px-6 py-4 text-sm text-text-primary transition hover:bg-surface-secondary"
                  href={shift.href}
                  key={shift.id}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">
                      {shift.courierName}
                    </span>
                    <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                      {shift.courierCode} - {shift.id}
                    </span>
                  </span>

                  <span className="min-w-0">
                    <span className="block font-semibold">{shift.dateLabel}</span>
                    <span className="mt-1 block text-xs font-medium text-text-muted">
                      Eingereicht {shift.submittedAt}
                    </span>
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate font-semibold">
                      {shift.depotName}
                    </span>
                    <span className="mt-1 block text-xs font-medium text-text-muted">
                      {shift.depotCode}
                    </span>
                  </span>

                  <span>
                    <span className="block font-semibold">
                      {shift.startTime} - {shift.endTime}
                    </span>
                    <span className="mt-1 block text-xs font-medium text-text-muted">
                      Brutto {shift.grossTime}, Pause {shift.breakTime}
                    </span>
                  </span>

                  <span>
                    <span className="block font-semibold">{shift.billableTime}</span>
                    <span className="mt-1 block text-xs font-medium text-text-muted">
                      {shift.paymentModeLabel}
                    </span>
                  </span>

                  <span>
                    <StatusBadge label={shift.statusLabel} tone={shift.statusTone} />
                  </span>

                  <span
                    className={`rounded-xl border px-3 py-2 ${toneClasses[shift.geofenceTone].soft}`}
                  >
                    <span
                      className={`block text-xs font-semibold ${toneClasses[shift.geofenceTone].text}`}
                    >
                      {shift.geofenceLabel}
                    </span>
                    <span className="mt-1 block truncate text-xs font-medium text-text-secondary">
                      {shift.geofenceDetail}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
