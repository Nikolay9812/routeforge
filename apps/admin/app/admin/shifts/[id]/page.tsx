import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAdminShiftReviewDetail,
  type AdminShiftAuditItem,
  type AdminShiftCounter,
  type AdminShiftDetailMetric,
  type AdminShiftLocationCheckpoint,
  type AdminShiftPhotoEvidence,
} from "@/lib/mock/adminShiftDetails";
import type { AdminShiftTone } from "@/lib/mock/adminShifts";

const toneClasses: Record<
  AdminShiftTone,
  {
    badge: string;
    dot: string;
    panel: string;
    text: string;
  }
> = {
  primary: {
    badge: "bg-primary-lightest text-primary-darker",
    dot: "bg-primary",
    panel: "border-primary-light bg-primary-lightest",
    text: "text-primary-darker",
  },
  info: {
    badge: "bg-info-lightest text-info-foreground",
    dot: "bg-info",
    panel: "border-info-light bg-info-lightest",
    text: "text-info-foreground",
  },
  success: {
    badge: "bg-success-lightest text-success-foreground",
    dot: "bg-success",
    panel: "border-success-light bg-success-lightest",
    text: "text-success-foreground",
  },
  warning: {
    badge: "bg-warning-lightest text-warning-foreground",
    dot: "bg-warning",
    panel: "border-warning-light bg-warning-lightest",
    text: "text-warning-foreground",
  },
  error: {
    badge: "bg-error-lightest text-error-foreground",
    dot: "bg-error",
    panel: "border-error-light bg-error-lightest",
    text: "text-error-foreground",
  },
  neutral: {
    badge: "bg-neutral-light text-neutral-foreground",
    dot: "bg-neutral",
    panel: "border-border bg-neutral-light",
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

function DetailCard({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      {children}
    </section>
  );
}

function MetricGrid({ metrics }: { metrics: AdminShiftDetailMetric[] }) {
  return (
    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <div
          className="rounded-xl border border-border-light bg-surface-secondary p-4"
          key={metric.label}
        >
          <p className="text-xs font-semibold uppercase text-text-muted">
            {metric.label}
          </p>
          <p
            className={`mt-2 text-2xl font-bold leading-8 ${
              metric.tone ? toneClasses[metric.tone].text : "text-text-primary"
            }`}
          >
            {metric.value}
          </p>
          <p className="mt-1 text-xs font-medium text-text-secondary">
            {metric.helper}
          </p>
        </div>
      ))}
    </div>
  );
}

function CounterGrid({ counters }: { counters: AdminShiftCounter[] }) {
  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      {counters.map((counter) => (
        <div
          className="rounded-xl border border-border-light bg-surface-secondary p-4"
          key={counter.label}
        >
          <p className="text-xs font-semibold uppercase text-text-muted">
            {counter.label}
          </p>
          <p className="mt-2 text-3xl font-bold leading-9 text-text-primary">
            {counter.value}
          </p>
          <p className="mt-1 text-xs font-medium text-text-secondary">
            {counter.helper}
          </p>
        </div>
      ))}
    </div>
  );
}

function PhotoGrid({ photos }: { photos: AdminShiftPhotoEvidence[] }) {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {photos.map((photo) => (
        <div
          className="rounded-xl border border-border bg-surface-secondary p-3"
          key={photo.typeLabel}
        >
          <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-border-muted bg-surface">
            <span className="text-xs font-semibold uppercase text-text-muted">
              {photo.typeLabel}
            </span>
          </div>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {photo.label}
              </p>
              <p className="mt-1 text-xs font-medium text-text-secondary">
                {photo.description} - {photo.capturedAt}
              </p>
            </div>
            <StatusBadge label={photo.statusLabel} tone={photo.statusTone} />
          </div>
        </div>
      ))}
    </div>
  );
}

function LocationCheckpoints({
  checkpoints,
}: {
  checkpoints: AdminShiftLocationCheckpoint[];
}) {
  return (
    <div className="mt-5 flex flex-col gap-3">
      {checkpoints.map((checkpoint) => (
        <div
          className={`rounded-xl border p-4 ${toneClasses[checkpoint.tone].panel}`}
          key={checkpoint.label}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p
                className={`text-sm font-semibold ${toneClasses[checkpoint.tone].text}`}
              >
                {checkpoint.label} {checkpoint.time}
              </p>
              <p className="mt-1 text-sm font-medium text-text-primary">
                {checkpoint.address}
              </p>
            </div>
            <StatusBadge label={checkpoint.stateLabel} tone={checkpoint.tone} />
          </div>
          <div className="mt-3 grid gap-2 text-xs font-medium text-text-secondary sm:grid-cols-2">
            <span>{checkpoint.distance}</span>
            <span>{checkpoint.accuracy}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function LocationMapCard({
  checkpoints,
  geofenceLabel,
  geofenceTone,
}: {
  checkpoints: AdminShiftLocationCheckpoint[];
  geofenceLabel: string;
  geofenceTone: AdminShiftTone;
}) {
  const startCheckpoint = checkpoints.find(
    (checkpoint) => checkpoint.label === "Start",
  );
  const stopCheckpoint = checkpoints.find(
    (checkpoint) => checkpoint.label === "Stopp",
  );
  const startTone = startCheckpoint?.tone ?? "neutral";
  const stopTone = stopCheckpoint?.tone ?? geofenceTone;

  return (
    <div className="mt-5">
      <div className="relative h-64 overflow-hidden rounded-xl border border-border bg-surface-secondary">
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-80">
          {Array.from({ length: 16 }).map((_, index) => (
            <span
              className="border-b border-r border-border-light"
              key={index}
            />
          ))}
        </div>
        <div className="absolute left-0 top-1/3 h-8 w-full -rotate-6 bg-info-lightest" />
        <div className="absolute left-0 top-2/3 h-6 w-full rotate-3 bg-success-lightest" />
        <div className="absolute left-1/4 top-0 h-full w-7 rotate-12 bg-surface" />
        <div className="absolute left-1/2 top-0 h-full w-5 -rotate-12 bg-surface" />
        <div className="absolute left-[30%] top-[32%] h-px w-[42%] rotate-[28deg] border-t border-dashed border-border-strong" />

        <div className="absolute left-[18%] top-[18%] rounded-xl border border-success-light bg-surface px-3 py-2 shadow-card">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${toneClasses[startTone].dot}`}
              aria-hidden="true"
            />
            <span className={`text-xs font-bold ${toneClasses[startTone].text}`}>
              Start {startCheckpoint?.time ?? "offen"}
            </span>
          </div>
        </div>

        <div className="absolute bottom-[20%] right-[14%] rounded-xl border border-error-light bg-surface px-3 py-2 shadow-card">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${toneClasses[stopTone].dot}`}
              aria-hidden="true"
            />
            <span className={`text-xs font-bold ${toneClasses[stopTone].text}`}>
              Stopp {stopCheckpoint?.time ?? "offen"}
            </span>
          </div>
        </div>

        <span className="absolute left-[47%] top-[48%] h-3 w-3 rounded-full bg-primary" />
        <span className="absolute bottom-2 right-3 text-[10px] font-semibold text-text-muted">
          Start/Stopp-Nachweis
        </span>
      </div>
      <div
        className={`mt-4 rounded-xl border px-4 py-3 ${toneClasses[geofenceTone].panel}`}
      >
        <p className={`text-sm font-semibold ${toneClasses[geofenceTone].text}`}>
          {geofenceLabel}
        </p>
        <p className="mt-1 text-xs leading-5 text-text-secondary">
          RouteForge speichert nur Start- und Stopp-Standort. Live-Tracking und
          Routenverlauf bleiben in v1 ausgeschlossen.
        </p>
      </div>
    </div>
  );
}

function AuditList({ items }: { items: AdminShiftAuditItem[] }) {
  return (
    <div className="mt-5 divide-y divide-border-light">
      {items.map((item) => (
        <div className="py-3 first:pt-0 last:pb-0" key={`${item.time}-${item.action}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-text-primary">
              {item.action}
            </p>
            <p className="text-xs font-medium text-text-muted">{item.time}</p>
          </div>
          <p className="mt-1 text-xs font-medium text-text-secondary">
            {item.actor}
          </p>
          {item.reason ? (
            <p className="mt-2 rounded-xl border border-border-light bg-surface-secondary px-3 py-2 text-xs leading-5 text-text-secondary">
              {item.reason}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default async function AdminShiftReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shift = getAdminShiftReviewDetail(id);

  if (!shift) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-text-secondary">
              <Link className="text-primary" href="/admin/shifts">
                Schichten
              </Link>
              <span className="text-text-muted">/</span>
              <span>Schicht-Review</span>
              <span className="text-text-muted">/</span>
              <span className="text-text-muted">{shift.id}</span>
            </nav>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold leading-[38px] text-text-primary">
                Schicht-Review
              </h1>
              <StatusBadge label={shift.statusLabel} tone={shift.statusTone} />
            </div>
            <Link
              className="mt-4 inline-flex h-10 items-center rounded-xl px-3 text-sm font-semibold text-primary transition hover:bg-surface-secondary"
              href="/admin/shifts"
            >
              Zurueck zur Schichtliste
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
              href={`/admin/shifts/${shift.id}/correction`}
            >
              Korrigieren
            </Link>
            <button
              className="inline-flex h-10 items-center justify-center rounded-xl bg-error px-4 text-sm font-semibold text-text-inverse transition hover:bg-error-dark"
              type="button"
            >
              Ablehnen
            </button>
            <button
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
              type="button"
            >
              Genehmigen
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr]">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-lightest text-lg font-bold text-primary-darker">
              {shift.initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-text-primary">
                {shift.courierName}
              </p>
              <p className="mt-1 text-sm font-medium text-text-secondary">
                {shift.courierCode}
              </p>
              <span className="mt-2 inline-flex rounded-full bg-success-lightest px-2.5 py-1 text-xs font-semibold text-success-foreground">
                {shift.courierStatusLabel}
              </span>
            </div>
          </div>

          <div className="border-t border-border-light pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
            <p className="text-xs font-semibold uppercase text-text-muted">
              Datum
            </p>
            <p className="mt-2 text-sm font-semibold text-text-primary">
              {shift.dateLabel}
            </p>
            <p className="mt-1 text-xs font-medium text-text-secondary">
              Eingereicht {shift.submittedAt}
            </p>
          </div>

          <div className="border-t border-border-light pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
            <p className="text-xs font-semibold uppercase text-text-muted">
              Depot
            </p>
            <p className="mt-2 text-sm font-semibold text-text-primary">
              {shift.depotName}
            </p>
            <p className="mt-1 text-xs font-medium text-text-secondary">
              {shift.depotCode}
            </p>
          </div>

          <div className="border-t border-border-light pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
            <p className="text-xs font-semibold uppercase text-text-muted">
              Start
            </p>
            <p className="mt-2 text-sm font-semibold text-text-primary">
              {shift.startTime}
            </p>
            <p className="mt-1 text-xs font-medium text-text-secondary">
              {shift.shiftDate}
            </p>
          </div>

          <div className="border-t border-border-light pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
            <p className="text-xs font-semibold uppercase text-text-muted">
              Stopp
            </p>
            <p className="mt-2 text-sm font-semibold text-text-primary">
              {shift.endTime}
            </p>
            <p className="mt-1 text-xs font-medium text-text-secondary">
              {shift.shiftDate}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)]">
        <div className="flex flex-col gap-6">
          <DetailCard title="Arbeitszeit-Uebersicht">
            <MetricGrid metrics={shift.timeMetrics} />
          </DetailCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <DetailCard title="Zahlung und Abrechnung">
              <div className="mt-5 rounded-xl border border-primary-light bg-primary-lightest p-4">
                <p className="text-xs font-semibold uppercase text-primary-darker">
                  {shift.paymentModeLabel}
                </p>
                <p className="mt-2 text-3xl font-bold leading-9 text-text-primary">
                  {shift.billableTime}
                </p>
                <p className="mt-1 text-sm font-semibold text-primary-darker">
                  {shift.billableSourceLabel}
                </p>
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  {shift.billableRuleLabel}
                </p>
              </div>
            </DetailCard>

            <DetailCard title="KM und Fahrzeug">
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border-light bg-surface-secondary p-4">
                  <p className="text-xs font-semibold uppercase text-text-muted">
                    Fahrzeug
                  </p>
                  <p className="mt-2 text-sm font-semibold text-text-primary">
                    {shift.vehiclePlate}
                  </p>
                  <p className="mt-1 text-xs font-medium text-text-secondary">
                    {shift.routeCode}
                  </p>
                </div>
                <div className="rounded-xl border border-border-light bg-surface-secondary p-4">
                  <p className="text-xs font-semibold uppercase text-text-muted">
                    Gefahren
                  </p>
                  <p className="mt-2 text-sm font-semibold text-text-primary">
                    {shift.drivenKm}
                  </p>
                  <p className="mt-1 text-xs font-medium text-text-secondary">
                    {shift.startKm} - {shift.endKm}
                  </p>
                </div>
              </div>
            </DetailCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <DetailCard title="Pakete und Stopps">
              <CounterGrid counters={shift.packageCounters} />
            </DetailCard>

            <DetailCard title="Schicht-Details">
              <dl className="mt-5 grid gap-4 text-sm">
                <div className="flex justify-between gap-4 border-b border-border-light pb-3">
                  <dt className="font-medium text-text-secondary">
                    Erste Zustellung
                  </dt>
                  <dd className="font-semibold text-text-primary">
                    {shift.firstDelivery}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border-light pb-3">
                  <dt className="font-medium text-text-secondary">
                    Letzte Zustellung
                  </dt>
                  <dd className="font-semibold text-text-primary">
                    {shift.lastDelivery}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border-light pb-3">
                  <dt className="font-medium text-text-secondary">
                    Schicht-ID
                  </dt>
                  <dd className="font-semibold text-text-primary">{shift.id}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-text-secondary">
                    Zahlungsart
                  </dt>
                  <dd className="font-semibold text-text-primary">
                    {shift.paymentModeLabel}
                  </dd>
                </div>
              </dl>
            </DetailCard>
          </div>

          <DetailCard title="GPS- und Geofence-Pruefung">
            <div
              className={`mt-5 rounded-xl border p-4 ${toneClasses[shift.geofenceTone].panel}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p
                    className={`text-sm font-semibold ${toneClasses[shift.geofenceTone].text}`}
                  >
                    {shift.geofenceLabel}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    {shift.geofenceDetail}. RouteForge speichert nur Start- und
                    Stopp-Standort, keine Live-Route.
                  </p>
                </div>
                <span
                  className={`h-3 w-3 rounded-full ${toneClasses[shift.geofenceTone].dot}`}
                  aria-hidden="true"
                />
              </div>
            </div>
            <LocationCheckpoints checkpoints={shift.locationCheckpoints} />
            {shift.geofenceWarnings.length > 0 ? (
              <AuditList items={shift.geofenceWarnings} />
            ) : (
              <p className="mt-5 rounded-xl border border-success-light bg-success-lightest px-4 py-3 text-sm font-semibold text-success-foreground">
                Keine Geofence-Warnungen fuer diese Schicht.
              </p>
            )}
          </DetailCard>
        </div>

        <aside className="flex flex-col gap-6">
          <DetailCard title="Start & Stopp Standorte">
            <LocationMapCard
              checkpoints={shift.locationCheckpoints}
              geofenceLabel={shift.geofenceLabel}
              geofenceTone={shift.geofenceTone}
            />
          </DetailCard>

          <DetailCard title="Nachweise">
            <PhotoGrid photos={shift.photoEvidence} />
            <p className="mt-4 rounded-xl border border-border-light bg-surface-secondary px-4 py-3 text-xs leading-5 text-text-secondary">
              {shift.photoRetentionLabel}
            </p>
          </DetailCard>

          <DetailCard title="Unterschrift">
            <div className="mt-5 rounded-xl border border-border-light bg-surface-secondary p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {shift.signatureLabel}
                  </p>
                  <p className="mt-1 text-xs font-medium text-text-secondary">
                    {shift.signedBy} - {shift.signedAt}
                  </p>
                </div>
                <StatusBadge label="Signiert" tone="success" />
              </div>
              <div className="mt-5 flex h-24 items-center justify-center rounded-xl border border-dashed border-border-muted bg-surface">
                <span className="text-sm font-semibold text-text-muted">
                  Signatur-Nachweis
                </span>
              </div>
            </div>
          </DetailCard>

          <DetailCard title="Admin-Notizen">
            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-border-light bg-surface-secondary p-4">
                <p className="text-xs font-semibold uppercase text-text-muted">
                  Kuriernotiz
                </p>
                <p className="mt-2 text-sm leading-6 text-text-primary">
                  {shift.courierNote}
                </p>
              </div>
              <div className="rounded-xl border border-border-light bg-surface-secondary p-4">
                <p className="text-xs font-semibold uppercase text-text-muted">
                  Review-Hinweis
                </p>
                <p className="mt-2 text-sm leading-6 text-text-primary">
                  {shift.adminNote}
                </p>
              </div>
            </div>
          </DetailCard>

          <DetailCard title="Audit Log">
            <AuditList items={shift.auditTrail} />
          </DetailCard>

          <DetailCard title="Review-Aktionen">
            <div className="mt-5 flex flex-col gap-3">
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
                type="button"
              >
                Schicht genehmigen
              </button>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
                href={`/admin/shifts/${shift.id}/correction`}
              >
                Korrektur vorbereiten
              </Link>
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl bg-error px-4 text-sm font-semibold text-text-inverse transition hover:bg-error-dark"
                type="button"
              >
                Schicht ablehnen
              </button>
            </div>
            <p className="mt-4 rounded-xl border border-warning-light bg-warning-lightest px-4 py-3 text-xs leading-5 text-warning-foreground">
              Ablehnung, Korrektur und Abrechnungs-Override benoetigen im
              Backend spaeter einen Grund und einen Audit-Log-Eintrag.
            </p>
          </DetailCard>
        </aside>
      </div>
    </div>
  );
}
