import Link from "next/link";

import { requireAdminSession } from "@/lib/auth";
import {
  type AdminDashboardTone,
  type AdminDashboardData,
} from "@/lib/adminDashboard";
import { loadAdminDashboardData } from "@/lib/adminDashboard.server";

const toneClasses: Record<
  AdminDashboardTone,
  {
    badge: string;
    icon: string;
    soft: string;
    text: string;
  }
> = {
  primary: {
    badge: "bg-primary-lightest text-primary-darker",
    icon: "bg-primary-lightest text-primary",
    soft: "border-primary-light bg-primary-lightest",
    text: "text-primary",
  },
  info: {
    badge: "bg-info-lightest text-info-foreground",
    icon: "bg-info-lightest text-info-foreground",
    soft: "border-info-light bg-info-lightest",
    text: "text-info-foreground",
  },
  success: {
    badge: "bg-success-lightest text-success-foreground",
    icon: "bg-success-lightest text-success-foreground",
    soft: "border-success-light bg-success-lightest",
    text: "text-success-foreground",
  },
  warning: {
    badge: "bg-warning-lightest text-warning-foreground",
    icon: "bg-warning-lightest text-warning-foreground",
    soft: "border-warning-light bg-warning-lightest",
    text: "text-warning-foreground",
  },
  error: {
    badge: "bg-error-lightest text-error-foreground",
    icon: "bg-error-lightest text-error-foreground",
    soft: "border-error-light bg-error-lightest",
    text: "text-error-foreground",
  },
  neutral: {
    badge: "bg-neutral-light text-neutral-foreground",
    icon: "bg-neutral-light text-neutral-foreground",
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

function EmptyState({ text }: { text: string }) {
  return (
    <div className="px-6 py-10 text-sm font-semibold text-text-secondary">
      {text}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();
  const data = await loadAdminDashboardData(session);

  return <AdminDashboardContent data={data} />;
}

function AdminDashboardContent({ data }: { data: AdminDashboardData }) {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              {data.companyName}
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
              Heute, {data.todayLabel}
            </span>
            <span className="rounded-full bg-success-lightest px-3 py-1 text-xs font-semibold text-success-foreground">
              Live-Daten
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
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
              subtitle="Laufende und eingereichte Einsaetze mit Depot, Status und abrechenbarer Zeit."
              title="Aktive Einsaetze"
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
                {data.activeCouriers.map((courier) => (
                  <tr
                    className="text-sm text-text-primary hover:bg-surface-secondary"
                    key={courier.id}
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
            {data.activeCouriers.length === 0 ? (
              <EmptyState text="Keine laufenden oder offenen Einsaetze gefunden." />
            ) : null}
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <SectionHeader
              actionHref="/admin/shifts"
              actionLabel="Pruefen"
              subtitle="Eingereichte Schichten aus dem aktuellen Mandanten."
              title="Offene Pruefungen"
            />
            <div className="mt-5 flex flex-col gap-3">
              {data.reviewShifts.map((shift) => (
                <Link
                  className="rounded-xl border border-border-light bg-surface-secondary p-4 transition hover:border-primary-light hover:bg-primary-lightest"
                  href={shift.href}
                  key={shift.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {shift.courier}
                      </p>
                      <p className="mt-1 text-xs font-medium text-text-muted">
                        {shift.depot} - {shift.submittedAt}
                      </p>
                    </div>
                    <StatusBadge
                      label={shift.statusLabel}
                      tone={shift.statusTone}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs font-semibold text-text-secondary">
                    <span>{shift.paymentMode}</span>
                    <span>{shift.billableTime}</span>
                  </div>
                </Link>
              ))}
              {data.reviewShifts.length === 0 ? (
                <p className="rounded-xl border border-border-light bg-surface-secondary px-4 py-3 text-sm font-semibold text-text-secondary">
                  Keine Schichten warten auf Pruefung.
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <SectionHeader
              actionHref="/admin/audit-logs"
              actionLabel="Verlauf"
              subtitle="Letzte serverseitige Audit-Eintraege."
              title="Aktivitaet"
            />
            <div className="mt-5 flex flex-col gap-3">
              {data.recentActivity.map((activity) => (
                <div
                  className="flex gap-3 rounded-xl border border-border-light bg-surface-secondary p-4"
                  key={activity.id}
                >
                  <span
                    className={`mt-1 h-2.5 w-2.5 rounded-full ${toneClasses[activity.tone].icon}`}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {activity.title}
                    </p>
                    <p className="mt-1 text-xs font-medium text-text-secondary">
                      {activity.description}
                    </p>
                    <p className="mt-1 text-xs font-medium text-text-muted">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
              {data.recentActivity.length === 0 ? (
                <p className="rounded-xl border border-border-light bg-surface-secondary px-4 py-3 text-sm font-semibold text-text-secondary">
                  Noch keine Audit-Eintraege vorhanden.
                </p>
              ) : null}
            </div>
          </section>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.55fr)]">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <SectionHeader
            actionHref="/admin/shifts"
            actionLabel="Alle Schichten"
            subtitle="Start/Stop-Orte ausserhalb des Depot-Geofence oder fehlende Standortnachweise."
            title="Depot-Warnungen"
          />
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {data.geofenceWarnings.map((warning) => (
              <article
                className={`rounded-xl border p-4 ${toneClasses[warning.severityTone].soft}`}
                key={warning.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {warning.courier}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-text-secondary">
                      {warning.depot} - {warning.checkpoint}
                    </p>
                  </div>
                  <StatusBadge
                    label={warning.severityLabel}
                    tone={warning.severityTone}
                  />
                </div>
                <p className="mt-3 text-sm font-semibold text-text-primary">
                  {warning.distance}
                </p>
                <p className="mt-1 text-xs font-medium text-text-muted">
                  {warning.time}
                </p>
              </article>
            ))}
            {data.geofenceWarnings.length === 0 ? (
              <p className="rounded-xl border border-border-light bg-surface-secondary px-4 py-3 text-sm font-semibold text-text-secondary">
                Keine Depot-Warnungen in den letzten geladenen Schichten.
              </p>
            ) : null}
          </div>
        </div>

        <aside className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <SectionHeader
            subtitle="Direkte Wege in die wichtigsten Admin-Arbeitsbereiche."
            title="Schnellzugriff"
          />
          <div className="mt-5 grid gap-3">
            {data.quickActions.map((action) => (
              <Link
                className={`rounded-xl border px-4 py-3 transition hover:bg-surface-secondary ${toneClasses[action.tone].soft}`}
                href={action.href}
                key={action.label}
              >
                <p className={`text-sm font-semibold ${toneClasses[action.tone].text}`}>
                  {action.label}
                </p>
                <p className="mt-1 text-xs font-medium leading-5 text-text-secondary">
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
