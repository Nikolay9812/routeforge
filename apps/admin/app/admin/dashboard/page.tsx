import Link from "next/link";

import {
  adminDashboardActiveCouriers,
  adminDashboardGeofenceWarnings,
  adminDashboardMetrics,
  adminDashboardQuickActions,
  adminDashboardRecentActivity,
  adminDashboardReviewShifts,
  type AdminDashboardTone,
} from "@/lib/mock/adminDashboard";

const toneClasses: Record<
  AdminDashboardTone,
  {
    badge: string;
    icon: string;
    line: string;
    soft: string;
    text: string;
  }
> = {
  primary: {
    badge: "bg-primary-lightest text-primary-darker",
    icon: "bg-primary-lightest text-primary",
    line: "bg-primary",
    soft: "border-primary-light bg-primary-lightest",
    text: "text-primary",
  },
  info: {
    badge: "bg-info-lightest text-info-foreground",
    icon: "bg-info-lightest text-info-foreground",
    line: "bg-info",
    soft: "border-info-light bg-info-lightest",
    text: "text-info-foreground",
  },
  success: {
    badge: "bg-success-lightest text-success-foreground",
    icon: "bg-success-lightest text-success-foreground",
    line: "bg-success",
    soft: "border-success-light bg-success-lightest",
    text: "text-success-foreground",
  },
  warning: {
    badge: "bg-warning-lightest text-warning-foreground",
    icon: "bg-warning-lightest text-warning-foreground",
    line: "bg-warning",
    soft: "border-warning-light bg-warning-lightest",
    text: "text-warning-foreground",
  },
  error: {
    badge: "bg-error-lightest text-error-foreground",
    icon: "bg-error-lightest text-error-foreground",
    line: "bg-error",
    soft: "border-error-light bg-error-lightest",
    text: "text-error-foreground",
  },
  neutral: {
    badge: "bg-neutral-light text-neutral-foreground",
    icon: "bg-neutral-light text-neutral-foreground",
    line: "bg-neutral",
    soft: "border-border bg-neutral-light",
    text: "text-neutral-foreground",
  },
};

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: AdminDashboardTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[tone].badge}`}
    >
      {label}
    </span>
  );
}

function MiniTrend({
  trend,
  tone,
}: {
  trend: number[];
  tone: AdminDashboardTone;
}) {
  return (
    <div className="flex h-12 items-end gap-1" aria-hidden="true">
      {trend.map((point, index) => (
        <span
          className={`w-full rounded-full ${toneClasses[tone].line}`}
          key={`${point}-${index}`}
          style={{ height: `${Math.max(point, 12)}%` }}
        />
      ))}
    </div>
  );
}

function SectionHeader({
  actionHref,
  actionLabel,
  subtitle,
  title,
}: {
  actionHref?: string;
  actionLabel?: string;
  subtitle?: string;
  title: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm leading-5 text-text-secondary">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link
          className="shrink-0 text-sm font-semibold text-primary hover:text-primary-dark"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              Ivanov Transport
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-[38px] text-text-primary">
              Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Heute im Blick: aktive Kuriere, offene Schichtpruefungen,
              Depot-Warnungen und die wichtigsten administrativen Aktionen.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-primary-lightest px-3 py-1 text-xs font-semibold text-primary-darker">
              Heute, 1. Juli 2026
            </span>
            <span className="rounded-full bg-success-lightest px-3 py-1 text-xs font-semibold text-success-foreground">
              Mock-Daten
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminDashboardMetrics.map((metric) => (
          <article
            className="rounded-2xl border border-border bg-surface p-5 shadow-card"
            key={metric.label}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold leading-5 text-text-secondary">
                  {metric.label}
                </p>
                <p className="mt-3 text-3xl font-bold leading-9 text-text-primary">
                  {metric.value}
                </p>
              </div>
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${toneClasses[metric.tone].icon}`}
              >
                {metric.label.slice(0, 1)}
              </span>
            </div>
            <div className="mt-5">
              <MiniTrend tone={metric.tone} trend={metric.trend} />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className={`text-xs font-semibold ${toneClasses[metric.tone].text}`}>
                {metric.helper}
              </p>
              <p className="text-xs font-medium text-text-muted">
                {metric.detail}
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.75fr)]">
        <div className="rounded-2xl border border-border bg-surface shadow-card">
          <div className="border-b border-border-light p-6">
            <SectionHeader
              actionHref="/admin/couriers"
              actionLabel="Alle Kuriere"
              subtitle="Laufende Einsaetze mit Depot, Status und abrechenbarer Zeit."
              title="Aktive Kuriere"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-surface-secondary">
                <tr className="border-b border-border-light text-xs font-semibold uppercase text-text-subtle">
                  <th className="px-6 py-3">Kurier</th>
                  <th className="px-6 py-3">Depot</th>
                  <th className="px-6 py-3">Schicht</th>
                  <th className="px-6 py-3">Pakete</th>
                  <th className="px-6 py-3">Abrechenbar</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {adminDashboardActiveCouriers.map((courier) => (
                  <tr
                    className="text-sm text-text-primary hover:bg-surface-secondary"
                    key={`${courier.name}-${courier.depot}`}
                  >
                    <td className="px-6 py-4 font-semibold">{courier.name}</td>
                    <td className="px-6 py-4 text-text-secondary">
                      {courier.depot}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {courier.shiftWindow}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {courier.packages}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {courier.billableTime}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        label={courier.statusLabel}
                        tone={courier.statusTone}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <SectionHeader
            actionHref="/admin/shifts"
            actionLabel="Zur Pruefung"
            subtitle="Schichten, die eine Entscheidung oder Klaerung brauchen."
            title="Warteschlange"
          />
          <div className="mt-5 space-y-4">
            {adminDashboardReviewShifts.map((shift) => (
              <div
                className="rounded-xl border border-border-light bg-surface-secondary p-4"
                key={`${shift.courier}-${shift.submittedAt}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {shift.courier}
                    </p>
                    <p className="mt-1 text-xs font-medium text-text-secondary">
                      {shift.depot} · {shift.submittedAt}
                    </p>
                  </div>
                  <StatusBadge label={shift.statusLabel} tone={shift.statusTone} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="font-medium text-text-muted">Zahlungsart</p>
                    <p className="mt-1 font-semibold text-text-primary">
                      {shift.paymentMode}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-text-muted">Abrechenbar</p>
                    <p className="mt-1 font-semibold text-text-primary">
                      {shift.billableTime}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <SectionHeader
            actionHref="/admin/shifts"
            actionLabel="Alle Warnungen"
            subtitle="Start-/Stop-GPS bleibt pruefbar, ohne Live-Tracking."
            title="Geofence-Warnungen"
          />
          <div className="mt-5 space-y-4">
            {adminDashboardGeofenceWarnings.map((warning) => (
              <div
                className={`rounded-xl border p-4 ${toneClasses[warning.severityTone].soft}`}
                key={`${warning.depot}-${warning.courier}-${warning.time}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {warning.depot}
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      {warning.courier} · {warning.checkpoint}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-text-muted">
                    {warning.time}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className={`text-sm font-semibold ${toneClasses[warning.severityTone].text}`}>
                    {warning.distance}
                  </p>
                  <StatusBadge
                    label={warning.severityLabel}
                    tone={warning.severityTone}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <SectionHeader
            subtitle="Letzte relevante Aenderungen im aktuellen Arbeitsbereich."
            title="Aktivitaet"
          />
          <div className="mt-5 space-y-4">
            {adminDashboardRecentActivity.map((activity) => (
              <div
                className="flex items-start gap-3"
                key={`${activity.title}-${activity.time}`}
              >
                <span
                  className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${toneClasses[activity.tone].icon}`}
                >
                  {activity.title.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1 border-b border-border-light pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-text-primary">
                      {activity.title}
                    </p>
                    <p className="shrink-0 text-xs font-medium text-text-muted">
                      {activity.time}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <SectionHeader
          subtitle="Schnelle Einstiege fuer die naechsten Admin-Features."
          title="Schnellaktionen"
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {adminDashboardQuickActions.map((action) => (
            <Link
              className={`rounded-xl border p-4 transition hover:bg-surface-secondary ${toneClasses[action.tone].soft}`}
              href={action.href}
              key={action.href}
            >
              <p className={`text-sm font-semibold ${toneClasses[action.tone].text}`}>
                {action.label}
              </p>
              <p className="mt-2 text-sm leading-5 text-text-secondary">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
