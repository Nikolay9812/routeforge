import Link from "next/link";
import { notFound } from "next/navigation";

import { ShiftCorrectionForm } from "@/components/shifts/ShiftCorrectionForm";
import { getAdminShiftReviewDetailFromBackend } from "@/lib/adminShifts.server";
import { buildAdminShiftCorrectionDraft } from "@/lib/mock/adminShiftCorrections";
import { getAdminShiftReviewDetail } from "@/lib/mock/adminShiftDetails";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export default async function AdminShiftCorrectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shift =
    getAdminShiftReviewDetail(id) ??
    (isUuid(id) ? await getAdminShiftReviewDetailFromBackend(id) : null);

  if (!shift) {
    notFound();
  }

  const detailHref = `/admin/shifts/${shift.id}`;
  const correctionDraft = buildAdminShiftCorrectionDraft(shift);

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
              <Link className="text-primary" href={detailHref}>
                Schicht-Review
              </Link>
              <span className="text-text-muted">/</span>
              <span>Korrektur</span>
              <span className="text-text-muted">/</span>
              <span className="text-text-muted">{shift.id}</span>
            </nav>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold leading-[38px] text-text-primary">
                Schicht korrigieren
              </h1>
              <span className="inline-flex rounded-full bg-warning-lightest px-2.5 py-1 text-xs font-semibold text-warning-foreground">
                Grund erforderlich
              </span>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">
              Korrigiere Zeiten, Kilometer und Paketzaehler fuer diese
              eingereichte Schicht. RF-ADM-017 nutzt lokale Mock-Logik mit
              Payroll-Preview; echte Datenbankmutation, RLS-Pruefung und
              Audit-Log-Write bleiben spaeter serverseitig.
            </p>
          </div>

          <Link
            className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
            href={detailHref}
          >
            Zurueck zum Review
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
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
              Schicht
            </p>
            <p className="mt-2 text-sm font-semibold text-text-primary">
              {shift.dateLabel}
            </p>
            <p className="mt-1 text-xs font-medium text-text-secondary">
              {shift.depotName} - {shift.depotCode}
            </p>
          </div>

          <div className="border-t border-border-light pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
            <p className="text-xs font-semibold uppercase text-text-muted">
              Aktuelle Zeit
            </p>
            <p className="mt-2 text-sm font-semibold text-text-primary">
              {shift.startTime} - {shift.endTime}
            </p>
            <p className="mt-1 text-xs font-medium text-text-secondary">
              Pause {shift.breakTime}
            </p>
          </div>

          <div className="border-t border-border-light pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
            <p className="text-xs font-semibold uppercase text-text-muted">
              Abrechnung
            </p>
            <p className="mt-2 text-sm font-semibold text-text-primary">
              {shift.billableTime}
            </p>
            <p className="mt-1 text-xs font-medium text-text-secondary">
              {shift.paymentModeLabel}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ShiftCorrectionForm
          cancelHref={detailHref}
          canUseBackendActions={isUuid(shift.id)}
          initialDraft={correctionDraft}
        />

        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl border border-warning-light bg-warning-lightest p-6 shadow-card">
            <h2 className="text-lg font-semibold text-warning-foreground">
              Audit-Regel
            </h2>
            <p className="mt-3 text-sm leading-6 text-warning-foreground">
              Jede Korrektur und jeder Abrechnungs-Override braucht einen
              nachvollziehbaren Grund. Spaeter muss der Server actor, target,
              before, after, reason und timestamp in audit_logs speichern.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">
              Referenzwerte
            </h2>
            <dl className="mt-5 grid gap-4 text-sm">
              <div className="flex justify-between gap-4 border-b border-border-light pb-3">
                <dt className="font-medium text-text-secondary">Fahrzeug</dt>
                <dd className="font-semibold text-text-primary">
                  {shift.vehiclePlate}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border-light pb-3">
                <dt className="font-medium text-text-secondary">Route</dt>
                <dd className="font-semibold text-text-primary">
                  {shift.routeCode}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border-light pb-3">
                <dt className="font-medium text-text-secondary">KM</dt>
                <dd className="font-semibold text-text-primary">
                  {shift.startKm} - {shift.endKm}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-medium text-text-secondary">Pakete</dt>
                <dd className="font-semibold text-text-primary">
                  {shift.packageSummary}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">
              Review-Hinweis
            </h2>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              {shift.adminNote}
            </p>
            <p className="mt-4 rounded-xl border border-border-light bg-surface-secondary px-4 py-3 text-xs leading-5 text-text-secondary">
              GPS bleibt auf Start/Stopp-Pruefung beschraenkt. Diese Korrektur
              fuegt keine Live-Route hinzu.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
