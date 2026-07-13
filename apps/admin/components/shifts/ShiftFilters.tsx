"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type {
  AdminShiftFilterOptions,
  AdminShiftListItem,
  AdminShiftTone,
} from "@/lib/adminShifts";

type ShiftFilterState = {
  courierName: string;
  depotName: string;
  paymentMode: string;
  shiftDate: string;
  status: string;
};

type ShiftFiltersProps = {
  filterOptions: AdminShiftFilterOptions;
  shifts: AdminShiftListItem[];
};

const initialFilters: ShiftFilterState = {
  courierName: "all",
  depotName: "all",
  paymentMode: "all",
  shiftDate: "all",
  status: "all",
};

const toneClasses: Record<
  AdminShiftTone,
  {
    badge: string;
    soft: string;
    text: string;
  }
> = {
  primary: {
    badge: "bg-primary-lightest text-primary-darker",
    soft: "border-primary-light bg-primary-lightest",
    text: "text-primary",
  },
  info: {
    badge: "bg-info-lightest text-info-foreground",
    soft: "border-info-light bg-info-lightest",
    text: "text-info-foreground",
  },
  success: {
    badge: "bg-success-lightest text-success-foreground",
    soft: "border-success-light bg-success-lightest",
    text: "text-success-foreground",
  },
  warning: {
    badge: "bg-warning-lightest text-warning-foreground",
    soft: "border-warning-light bg-warning-lightest",
    text: "text-warning-foreground",
  },
  error: {
    badge: "bg-error-lightest text-error-foreground",
    soft: "border-error-light bg-error-lightest",
    text: "text-error-foreground",
  },
  neutral: {
    badge: "bg-neutral-light text-neutral-foreground",
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

function FilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-text-muted">
        {label}
      </span>
      <select
        className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function matchesFilter(value: string, filter: string) {
  return filter === "all" || value === filter;
}

export function ShiftFilters({ filterOptions, shifts }: ShiftFiltersProps) {
  const [filters, setFilters] = useState<ShiftFilterState>(initialFilters);

  const filteredShifts = useMemo(
    () =>
      shifts.filter(
        (shift) =>
          matchesFilter(shift.shiftDate, filters.shiftDate) &&
          matchesFilter(shift.depotName, filters.depotName) &&
          matchesFilter(shift.status, filters.status) &&
          matchesFilter(shift.courierName, filters.courierName) &&
          matchesFilter(shift.paymentMode, filters.paymentMode),
      ),
    [filters, shifts],
  );

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "all",
  ).length;

  function updateFilter(key: keyof ShiftFilterState, value: string) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function resetFilters() {
    setFilters(initialFilters);
  }

  return (
    <>
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Filter</h2>
            <p className="mt-1 text-sm leading-5 text-text-secondary">
              Filter aktualisieren die geladene Schichtliste im Browser. Die
              Daten wurden serverseitig fuer den aktuellen Mandanten geladen.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              label={`${activeFilterCount} aktiv`}
              tone={activeFilterCount > 0 ? "primary" : "neutral"}
            />
            <button
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
              onClick={resetFilters}
              type="button"
            >
              Filter zuruecksetzen
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <FilterSelect
            label="Datum"
            onChange={(value) => updateFilter("shiftDate", value)}
            options={filterOptions.dates}
            value={filters.shiftDate}
          />
          <FilterSelect
            label="Depot"
            onChange={(value) => updateFilter("depotName", value)}
            options={filterOptions.depots}
            value={filters.depotName}
          />
          <FilterSelect
            label="Status"
            onChange={(value) => updateFilter("status", value)}
            options={filterOptions.statuses}
            value={filters.status}
          />
          <FilterSelect
            label="Kurier"
            onChange={(value) => updateFilter("courierName", value)}
            options={filterOptions.couriers}
            value={filters.courierName}
          />
          <FilterSelect
            label="Zahlungsart"
            onChange={(value) => updateFilter("paymentMode", value)}
            options={filterOptions.paymentModes}
            value={filters.paymentMode}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface shadow-card">
        <div className="flex flex-col gap-3 border-b border-border-light p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Schichtliste
            </h2>
            <p className="mt-1 text-sm leading-5 text-text-secondary">
              Geladene Schichten mit sichtbarem Status, Zahlungsmodus und
              Geofence-Hinweis.
            </p>
          </div>
          <p className="text-sm font-semibold text-text-secondary">
            {filteredShifts.length} von {shifts.length} Schichten angezeigt
          </p>
        </div>

        {filteredShifts.length > 0 ? (
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
                {filteredShifts.map((shift) => (
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
                      <span className="block font-semibold">
                        {shift.dateLabel}
                      </span>
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
                      <span className="block font-semibold">
                        {shift.billableTime}
                      </span>
                      <span className="mt-1 block text-xs font-medium text-text-muted">
                        {shift.paymentModeLabel}
                      </span>
                    </span>

                    <span>
                      <StatusBadge
                        label={shift.statusLabel}
                        tone={shift.statusTone}
                      />
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
        ) : (
          <div className="p-6">
            <div className="rounded-2xl border border-border-light bg-surface-secondary p-6">
              <p className="text-lg font-semibold text-text-primary">
                Keine Schichten gefunden.
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                Passe Datum, Depot, Status, Kurier oder Zahlungsart an, um die
                Schichtliste wieder zu fuellen.
              </p>
              <button
                className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
                onClick={resetFilters}
                type="button"
              >
                Alle Filter entfernen
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
