"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";

import {
  buildAdminShiftCorrectionPreview,
  type AdminShiftCorrectionDraft,
  type AdminShiftCorrectionPreview,
} from "@/lib/mock/adminShiftCorrections";

type ShiftCorrectionFormProps = {
  cancelHref: string;
  initialDraft: AdminShiftCorrectionDraft;
};

type TextField = "startTime" | "endTime" | "startKm" | "endKm";

type NumberField =
  | "breakMinutes"
  | "billableMinutes"
  | "deliveredPackages"
  | "returnedPackages"
  | "pickedUpPackages"
  | "totalStops";

type SavedCorrection = {
  draft: AdminShiftCorrectionDraft;
  preview: AdminShiftCorrectionPreview;
  reason: string;
  savedAtLabel: string;
};

function FieldLabel({
  helper,
  label,
}: {
  helper: string;
  label: string;
}) {
  return (
    <span>
      <span className="block text-sm font-semibold text-text-primary">
        {label}
      </span>
      <span className="mt-1 block text-xs font-medium text-text-secondary">
        {helper}
      </span>
    </span>
  );
}

function PreviewTile({
  helper,
  label,
  tone = "neutral",
  value,
}: {
  helper: string;
  label: string;
  tone?: "neutral" | "primary" | "warning" | "success";
  value: string;
}) {
  const toneClasses = {
    neutral: "border-border-light bg-surface-secondary text-text-primary",
    primary: "border-primary-light bg-primary-lightest text-primary-darker",
    success: "border-success-light bg-success-lightest text-success-foreground",
    warning: "border-warning-light bg-warning-lightest text-warning-foreground",
  };

  return (
    <div className={`rounded-xl border p-4 ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase text-text-muted">
        {label}
      </p>
      <p className="mt-2 text-xl font-bold">{value}</p>
      <p className="mt-1 text-xs font-medium leading-5">{helper}</p>
    </div>
  );
}

function ValidationPanel({
  messages,
}: {
  messages: string[];
}) {
  if (messages.length === 0) {
    return (
      <div className="rounded-xl border border-success-light bg-success-lightest px-4 py-3 text-sm font-semibold text-success-foreground">
        Korrektur ist lokal speicherbereit. Backend-Pruefung und Audit-Log
        bleiben spaeter serverseitig.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-error-light bg-error-lightest px-4 py-3">
      <p className="text-sm font-semibold text-error-foreground">
        Bitte vor dem Speichern pruefen:
      </p>
      <ul className="mt-2 grid gap-1 text-sm font-medium leading-6 text-error-foreground">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}

export function ShiftCorrectionForm({
  cancelHref,
  initialDraft,
}: ShiftCorrectionFormProps) {
  const [draft, setDraft] =
    useState<AdminShiftCorrectionDraft>(initialDraft);
  const [reason, setReason] = useState("");
  const [savedCorrection, setSavedCorrection] =
    useState<SavedCorrection | null>(null);
  const preview = useMemo(
    () => buildAdminShiftCorrectionPreview(draft, reason),
    [draft, reason],
  );

  function updateTextField(field: TextField, value: string) {
    setSavedCorrection(null);
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  }

  function updateNumberField(field: NumberField, value: string) {
    setSavedCorrection(null);
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: Number(value),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!preview.canSave) {
      return;
    }

    setSavedCorrection({
      draft,
      preview,
      reason: reason.trim(),
      savedAtLabel: "Gerade eben",
    });
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-text-primary">
            Arbeitszeit korrigieren
          </h2>
          <p className="text-sm leading-6 text-text-secondary">
            Zeiten bleiben als Mock-Daten lokal im Formular. Die spaetere
            Speicherlogik muss Berechtigungen pruefen und einen Audit-Log mit
            Grund schreiben.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block rounded-xl border border-border-light bg-surface-secondary p-4">
            <FieldLabel helper="HH:MM" label="Startzeit" />
            <input
              className="mt-3 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary outline-none transition focus:border-primary"
              onChange={(event) =>
                updateTextField("startTime", event.currentTarget.value)
              }
              type="time"
              value={draft.startTime}
            />
          </label>

          <label className="block rounded-xl border border-border-light bg-surface-secondary p-4">
            <FieldLabel helper="HH:MM" label="Stoppzeit" />
            <input
              className="mt-3 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary outline-none transition focus:border-primary"
              onChange={(event) =>
                updateTextField("endTime", event.currentTarget.value)
              }
              type="time"
              value={draft.endTime}
            />
          </label>

          <label className="block rounded-xl border border-border-light bg-surface-secondary p-4">
            <FieldLabel helper="Minuten" label="Pause" />
            <input
              className="mt-3 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary outline-none transition focus:border-primary"
              min="0"
              onChange={(event) =>
                updateNumberField("breakMinutes", event.currentTarget.value)
              }
              type="number"
              value={draft.breakMinutes}
            />
          </label>

          <label className="block rounded-xl border border-border-light bg-surface-secondary p-4">
            <FieldLabel helper="Max. 600 bei Stundenlohn" label="Abrechenbar" />
            <input
              className="mt-3 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary outline-none transition focus:border-primary"
              max="600"
              min="0"
              onChange={(event) =>
                updateNumberField("billableMinutes", event.currentTarget.value)
              }
              type="number"
              value={draft.billableMinutes}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-text-primary">
            Abrechnungs-Preview
          </h2>
          <p className="text-sm leading-6 text-text-secondary">
            Vorschau nutzt die gemeinsame Payroll-Logik: gesetzliche Pause,
            Stundenlohn-Kappung bei 10:00 h und Tagespauschale mit 08:20 h
            Standardwert.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <PreviewTile
            helper="Start bis Stopp"
            label="Brutto"
            value={preview.grossLabel}
          />
          <PreviewTile
            helper="Hoechster Wert aus Regel und Eingabe"
            label="Pause"
            value={preview.breakLabel}
          />
          <PreviewTile
            helper="Brutto minus Pause"
            label="Netto"
            value={preview.netLabel}
          />
          <PreviewTile
            helper={
              preview.isManualBillableOverride
                ? "Manueller Override"
                : initialDraft.paymentModeLabel
            }
            label="Abrechenbar"
            tone={preview.isManualBillableOverride ? "warning" : "primary"}
            value={preview.finalBillableLabel}
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border-light bg-surface-secondary p-4">
            <p className="text-xs font-semibold uppercase text-text-muted">
              Regelwert
            </p>
            <p className="mt-2 text-sm font-semibold text-text-primary">
              {preview.automaticBillableLabel}
            </p>
            <p className="mt-1 text-xs font-medium leading-5 text-text-secondary">
              Automatisch aus Zahlungsart und Zeitspanne berechnet.
            </p>
          </div>

          <div className="rounded-xl border border-border-light bg-surface-secondary p-4">
            <p className="text-xs font-semibold uppercase text-text-muted">
              Abweichung
            </p>
            <p className="mt-2 text-sm font-semibold text-text-primary">
              {preview.billableDifferenceLabel}
            </p>
            <p className="mt-1 text-xs font-medium leading-5 text-text-secondary">
              Differenz zwischen Regelwert und gespeichertem Entwurf.
            </p>
          </div>

          <div className="rounded-xl border border-border-light bg-surface-secondary p-4">
            <p className="text-xs font-semibold uppercase text-text-muted">
              Quelle
            </p>
            <p className="mt-2 text-sm font-semibold text-text-primary">
              {preview.billableSource === "manual_override"
                ? "Manueller Override"
                : "Automatisch"}
            </p>
            <p className="mt-1 text-xs font-medium leading-5 text-text-secondary">
              {preview.autoStoppedAtMaxHours
                ? "Stundenlohn wurde bei 10:00 h gekappt."
                : "Keine Auto-Stopp-Kappung in dieser Vorschau."}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-text-primary">
            Berichtswerte korrigieren
          </h2>
          <p className="text-sm leading-6 text-text-secondary">
            Kilometer und Paketzaehler bleiben sichtbar, damit Dispatcher die
            Korrektur vor dem Speichern vollstaendig pruefen koennen.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="block rounded-xl border border-border-light bg-surface-secondary p-4">
            <FieldLabel helper="Start Kilometerstand" label="Start-KM" />
            <input
              className="mt-3 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary outline-none transition focus:border-primary"
              onChange={(event) =>
                updateTextField("startKm", event.currentTarget.value)
              }
              value={draft.startKm}
            />
          </label>

          <label className="block rounded-xl border border-border-light bg-surface-secondary p-4">
            <FieldLabel helper="End Kilometerstand" label="End-KM" />
            <input
              className="mt-3 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary outline-none transition focus:border-primary"
              onChange={(event) =>
                updateTextField("endKm", event.currentTarget.value)
              }
              value={draft.endKm}
            />
          </label>

          <label className="block rounded-xl border border-border-light bg-surface-secondary p-4">
            <FieldLabel helper="Zugestellte Pakete" label="Geliefert" />
            <input
              className="mt-3 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary outline-none transition focus:border-primary"
              min="0"
              onChange={(event) =>
                updateNumberField(
                  "deliveredPackages",
                  event.currentTarget.value,
                )
              }
              type="number"
              value={draft.deliveredPackages}
            />
          </label>

          <label className="block rounded-xl border border-border-light bg-surface-secondary p-4">
            <FieldLabel helper="Zurueckgefuehrte Pakete" label="Retouren" />
            <input
              className="mt-3 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary outline-none transition focus:border-primary"
              min="0"
              onChange={(event) =>
                updateNumberField(
                  "returnedPackages",
                  event.currentTarget.value,
                )
              }
              type="number"
              value={draft.returnedPackages}
            />
          </label>

          <label className="block rounded-xl border border-border-light bg-surface-secondary p-4">
            <FieldLabel helper="Kundenabholungen" label="Abholungen" />
            <input
              className="mt-3 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary outline-none transition focus:border-primary"
              min="0"
              onChange={(event) =>
                updateNumberField(
                  "pickedUpPackages",
                  event.currentTarget.value,
                )
              }
              type="number"
              value={draft.pickedUpPackages}
            />
          </label>

          <label className="block rounded-xl border border-border-light bg-surface-secondary p-4">
            <FieldLabel helper="Alle Stopps gesamt" label="Stopps" />
            <input
              className="mt-3 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary outline-none transition focus:border-primary"
              min="0"
              onChange={(event) =>
                updateNumberField("totalStops", event.currentTarget.value)
              }
              type="number"
              value={draft.totalStops}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-primary-light bg-surface p-6 shadow-card">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <label className="block">
            <span className="text-sm font-semibold text-text-primary">
              Korrekturgrund
            </span>
            <span className="mt-1 block text-xs font-medium text-text-secondary">
              Pflichtfeld. Dieser Grund gehoert spaeter in den Audit-Log.
            </span>
            <textarea
              className="mt-3 min-h-32 w-full resize-y rounded-xl border border-border bg-surface px-3 py-3 text-sm font-medium leading-6 text-text-primary outline-none transition focus:border-primary"
              maxLength={240}
              onChange={(event) => {
                setSavedCorrection(null);
                setReason(event.currentTarget.value);
              }}
              placeholder="Grund der Korrektur eintragen"
              value={reason}
            />
            <span className="mt-2 block text-xs font-medium text-text-muted">
              {reason.length} / 240
            </span>
          </label>

          <div className="flex flex-col justify-between gap-4 rounded-xl border border-border-light bg-surface-secondary p-4">
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Lokaler Korrekturstatus
              </p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Speichern wird erst aktiv, wenn Grund, Zeitwerte,
                Abrechnungswerte und Statuswechsel lokal gueltig sind.
              </p>
              <div className="mt-3">
                <ValidationPanel messages={preview.validationMessages} />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground"
                disabled={!preview.canSave}
                type="submit"
              >
                Korrektur speichern
              </button>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
                href={cancelHref}
              >
                Abbrechen
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-text-primary">
            Lokale Mock-Aktualisierung
          </h2>
          <p className="text-sm leading-6 text-text-secondary">
            Diese Ansicht simuliert die spaetere Mutation nur im Browser. Der
            echte Serverpfad muss company scope, depot scope und Audit-Log
            erneut pruefen.
          </p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <PreviewTile
            helper="Vor dem lokalen Speichern"
            label="Alter Status"
            value={initialDraft.statusLabel}
          />
          <PreviewTile
            helper={
              savedCorrection
                ? `Gespeichert: ${savedCorrection.savedAtLabel}`
                : "Noch nicht lokal gespeichert"
            }
            label="Neuer Status"
            tone={savedCorrection ? "success" : "neutral"}
            value={savedCorrection ? "Korrigiert" : "Unveraendert"}
          />
          <PreviewTile
            helper="Mock-Audit-Aktionen"
            label="Audit"
            tone={preview.isManualBillableOverride ? "warning" : "primary"}
            value={preview.auditActions.length.toString()}
          />
        </div>

        {savedCorrection ? (
          <div className="mt-4 rounded-xl border border-success-light bg-success-lightest p-4">
            <p className="text-sm font-semibold text-success-foreground">
              Korrektur lokal gespeichert.
            </p>
            <dl className="mt-3 grid gap-3 text-sm lg:grid-cols-2">
              <div>
                <dt className="font-medium text-success-foreground">Zeit</dt>
                <dd className="mt-1 font-semibold text-text-primary">
                  {savedCorrection.draft.startTime} -{" "}
                  {savedCorrection.draft.endTime}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-success-foreground">
                  Abrechenbar
                </dt>
                <dd className="mt-1 font-semibold text-text-primary">
                  {savedCorrection.preview.finalBillableLabel}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-success-foreground">Grund</dt>
                <dd className="mt-1 font-semibold text-text-primary">
                  {savedCorrection.reason}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-success-foreground">
                  Aktionen
                </dt>
                <dd className="mt-1 font-semibold text-text-primary">
                  {savedCorrection.preview.auditActions.join(", ")}
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-border-light bg-surface-secondary px-4 py-3 text-sm leading-6 text-text-secondary">
            Nach gueltigem Speichern erscheint hier die lokale korrigierte
            Schicht mit Grund und Audit-Aktionsvorschau.
          </p>
        )}
      </section>
    </form>
  );
}
