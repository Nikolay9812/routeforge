"use client";

import Link from "next/link";
import { useState } from "react";

import type { AdminShiftCorrectionDraft } from "@/lib/mock/adminShiftCorrections";

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

export function ShiftCorrectionForm({
  cancelHref,
  initialDraft,
}: ShiftCorrectionFormProps) {
  const [draft, setDraft] =
    useState<AdminShiftCorrectionDraft>(initialDraft);
  const [reason, setReason] = useState("");
  const [savedLocally, setSavedLocally] = useState(false);
  const hasReason = reason.trim().length > 0;

  function updateTextField(field: TextField, value: string) {
    setSavedLocally(false);
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  }

  function updateNumberField(field: NumberField, value: string) {
    setSavedLocally(false);
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: Number(value),
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasReason) {
      return;
    }

    setSavedLocally(true);
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
                setSavedLocally(false);
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
                Lokaler Mock-Status
              </p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Speichern wird erst aktiv, wenn ein Grund vorhanden ist. Es wird
                noch keine Backend-Aktion ausgefuehrt.
              </p>
              {savedLocally ? (
                <p className="mt-3 rounded-xl border border-success-light bg-success-lightest px-3 py-2 text-xs font-semibold text-success-foreground">
                  Korrektur lokal vorgemerkt.
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3">
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground"
                disabled={!hasReason}
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
    </form>
  );
}
