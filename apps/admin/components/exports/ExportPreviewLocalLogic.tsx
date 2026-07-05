"use client";

import { useMemo, useState } from "react";

import type {
  AdminExportDraft,
  AdminExportPreviewRow,
  AdminExportTone,
} from "@/lib/mock/adminExports";

type ExportPreviewLocalLogicProps = {
  exportDraft: AdminExportDraft;
  initialRows: AdminExportPreviewRow[];
};

type SelectOption = {
  label: string;
  value: string;
};

const allValue = "all";
const monthOptions: SelectOption[] = [
  { label: "Juli 2026", value: "2026-07" },
  { label: "August 2026", value: "2026-08" },
];

const paymentOptions: SelectOption[] = [
  { label: "Alle Zahlungsarten", value: allValue },
  { label: "Stundenlohn", value: "hourly" },
  { label: "Tagespauschale", value: "daily_fixed" },
];

const toneClasses: Record<
  AdminExportTone,
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
  tone: AdminExportTone;
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
  tone: AdminExportTone;
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

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(
    2,
    "0",
  )}`;
}

function getMonthValue(shiftDate: string): string {
  return shiftDate.slice(0, 7);
}

function getOptionLabel(options: SelectOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

function getDepotOptions(rows: AdminExportPreviewRow[]): SelectOption[] {
  const depotOptionsByCode = new Map<string, SelectOption>();

  rows.forEach((row) => {
    depotOptionsByCode.set(row.depotCode, {
      label: row.depotName,
      value: row.depotCode,
    });
  });

  return [
    { label: "Alle Depots", value: allValue },
    ...Array.from(depotOptionsByCode.values()),
  ];
}

function getPreviewRows({
  depotCode,
  month,
  paymentMode,
  rows,
}: {
  depotCode: string;
  month: string;
  paymentMode: string;
  rows: AdminExportPreviewRow[];
}): AdminExportPreviewRow[] {
  return rows.filter((row) => {
    const matchesApproved = row.status === "approved";
    const matchesMonth = getMonthValue(row.shiftDate) === month;
    const matchesDepot = depotCode === allValue || row.depotCode === depotCode;
    const matchesPayment =
      paymentMode === allValue || row.paymentMode === paymentMode;

    return matchesApproved && matchesMonth && matchesDepot && matchesPayment;
  });
}

function getPreviewSummary(rows: AdminExportPreviewRow[]) {
  return {
    approvedShifts: rows.length,
    billableTimeLabel: formatMinutes(
      rows.reduce((total, row) => total + row.billableMinutes, 0),
    ),
    couriers: new Set(rows.map((row) => row.courierCode)).size,
    overrideCount: rows.filter((row) => row.overrideReason).length,
    realTimeLabel: formatMinutes(
      rows.reduce((total, row) => total + row.grossMinutes, 0),
    ),
  };
}

export function ExportPreviewLocalLogic({
  exportDraft,
  initialRows,
}: ExportPreviewLocalLogicProps) {
  const depotOptions = useMemo(() => getDepotOptions(initialRows), [initialRows]);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);
  const [selectedDepotCode, setSelectedDepotCode] = useState(allValue);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(allValue);
  const [preparedFormat, setPreparedFormat] = useState<"CSV" | "XLSX" | null>(
    null,
  );
  const [updatedLabel, setUpdatedLabel] = useState(
    "Mock-Ausgangszustand aus genehmigten Schichten",
  );

  const previewRows = getPreviewRows({
    depotCode: selectedDepotCode,
    month: selectedMonth,
    paymentMode: selectedPaymentMode,
    rows: initialRows,
  });
  const previewSummary = getPreviewSummary(previewRows);
  const selectedMonthLabel = getOptionLabel(monthOptions, selectedMonth);
  const selectedDepotLabel = getOptionLabel(depotOptions, selectedDepotCode);
  const selectedPaymentLabel = getOptionLabel(
    paymentOptions,
    selectedPaymentMode,
  );
  const hasPreviewRows = previewRows.length > 0;

  function handleResetFilters(): void {
    setSelectedMonth(monthOptions[0].value);
    setSelectedDepotCode(allValue);
    setSelectedPaymentMode(allValue);
    setPreparedFormat(null);
    setUpdatedLabel("Filter lokal zurueckgesetzt");
  }

  function handleRefreshPreview(): void {
    setPreparedFormat(null);
    setUpdatedLabel("Vorschau lokal aktualisiert");
  }

  function handlePrepareFormat(format: "CSV" | "XLSX"): void {
    setPreparedFormat(format);
    setUpdatedLabel(`${format} lokal vorbereitet`);
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              Steuerberater-Export
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-[38px] text-text-primary">
              Exporte
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
              Bereite Monatsdaten fuer den Steuerberater vor. Die Vorschau zeigt
              nur genehmigte Schichten und verwendet abrechenbare Minuten.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary disabled:cursor-not-allowed disabled:bg-disabled-light disabled:text-disabled-foreground"
              disabled={!hasPreviewRows}
              type="button"
              onClick={() => handlePrepareFormat("CSV")}
            >
              CSV herunterladen
            </button>
            <button
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground"
              disabled={!hasPreviewRows}
              type="button"
              onClick={() => handlePrepareFormat("XLSX")}
            >
              XLSX herunterladen
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          label="Genehmigte Schichten"
          tone="success"
          value={String(previewSummary.approvedShifts)}
        />
        <SummaryTile
          label="Kuriere"
          tone="primary"
          value={String(previewSummary.couriers)}
        />
        <SummaryTile
          label="Reale Arbeitszeit"
          tone="info"
          value={previewSummary.realTimeLabel}
        />
        <SummaryTile
          label="Abrechenbar"
          tone="warning"
          value={previewSummary.billableTimeLabel}
        />
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Filter</h2>
            <p className="mt-1 text-sm leading-5 text-text-secondary">
              Lokale Filter fuer Monat, Depot und Zahlungsart. Die Vorschau
              bleibt auf genehmigte Schichten begrenzt.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
              type="button"
              onClick={handleResetFilters}
            >
              Filter zuruecksetzen
            </button>
            <button
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
              type="button"
              onClick={handleRefreshPreview}
            >
              Vorschau aktualisieren
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase text-text-muted">
              Monat
            </span>
            <select
              className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none transition focus:border-primary"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase text-text-muted">
              Depot
            </span>
            <select
              className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none transition focus:border-primary"
              value={selectedDepotCode}
              onChange={(event) => setSelectedDepotCode(event.target.value)}
            >
              {depotOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase text-text-muted">
              Zahlungsart
            </span>
            <select
              className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none transition focus:border-primary"
              value={selectedPaymentMode}
              onChange={(event) => setSelectedPaymentMode(event.target.value)}
            >
              {paymentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.55fr)]">
        <div className="rounded-2xl border border-border bg-surface shadow-card">
          <div className="flex flex-col gap-3 border-b border-border-light p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Export-Vorschau
              </h2>
              <p className="mt-1 text-sm leading-5 text-text-secondary">
                Nur genehmigte Schichten werden fuer CSV und XLSX vorbereitet.
                Nicht genehmigte Tage bleiben aus der Vorschau.
              </p>
            </div>
            <div className="text-sm font-semibold text-text-secondary">
              <p>{previewRows.length} Zeilen angezeigt</p>
              <p className="mt-1 text-xs text-text-muted">{updatedLabel}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1360px]">
              <div className="grid grid-cols-[1.1fr_0.75fr_0.7fr_0.75fr_0.7fr_0.7fr_0.7fr_0.8fr_0.95fr_0.75fr] bg-surface-secondary px-6 py-3 text-xs font-semibold uppercase text-text-subtle">
                <span>Kurier</span>
                <span>Datum</span>
                <span>Depot</span>
                <span>Zahlung</span>
                <span>Start/Ende</span>
                <span>Brutto</span>
                <span>Pause</span>
                <span>Netto</span>
                <span>Abrechenbar</span>
                <span>Status</span>
              </div>

              <div className="divide-y divide-border-light">
                {previewRows.map((row) => (
                  <div
                    className="grid grid-cols-[1.1fr_0.75fr_0.7fr_0.75fr_0.7fr_0.7fr_0.7fr_0.8fr_0.95fr_0.75fr] items-center px-6 py-4 text-sm text-text-primary transition hover:bg-surface-secondary"
                    key={row.id}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-lightest text-xs font-bold text-primary-darker">
                        {row.courierCode.replace("KUR-", "")}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">
                          {row.courierName}
                        </span>
                        <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                          {row.courierCode}
                        </span>
                      </span>
                    </span>

                    <span>
                      <span className="block font-semibold">{row.dateLabel}</span>
                      <span className="mt-1 block text-xs font-medium text-text-muted">
                        {row.companyName}
                      </span>
                    </span>

                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {row.depotCode}
                      </span>
                      <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                        {row.depotName}
                      </span>
                    </span>

                    <span>
                      <StatusBadge
                        label={row.paymentModeLabel}
                        tone={row.paymentMode === "hourly" ? "primary" : "success"}
                      />
                    </span>

                    <span>
                      <span className="block font-semibold">
                        {row.startTime} - {row.endTime}
                      </span>
                      <span className="mt-1 block text-xs font-medium text-text-muted">
                        {row.shiftDate}
                      </span>
                    </span>

                    <span className="font-semibold">{row.grossTimeLabel}</span>
                    <span className="font-semibold">{row.breakTimeLabel}</span>
                    <span className="font-semibold">{row.netTimeLabel}</span>

                    <span>
                      <span className="block font-semibold">
                        {row.billableTimeLabel}
                      </span>
                      <span className="mt-1 block text-xs font-medium text-text-muted">
                        {row.billableSourceLabel}
                      </span>
                      {row.overrideReason ? (
                        <span className="mt-1 block text-xs font-medium text-warning-foreground">
                          {row.overrideReason}
                        </span>
                      ) : null}
                    </span>

                    <span>
                      <StatusBadge label={row.statusLabel} tone={row.statusTone} />
                    </span>
                  </div>
                ))}

                {!hasPreviewRows ? (
                  <div className="px-6 py-10 text-sm font-semibold text-text-secondary">
                    Keine genehmigten Schichten fuer diese lokale Vorschau.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Export-Entwurf
                </h2>
                <p className="mt-1 text-sm leading-5 text-text-secondary">
                  Lokale Vorschau fuer die Monatsdateien.
                </p>
              </div>
              <StatusBadge label={preparedFormat ?? "Lokal"} tone="info" />
            </div>

            <div className="mt-5 rounded-xl border border-primary-light bg-primary-lightest p-4">
              <p className="text-xs font-semibold uppercase text-primary-darker">
                Zeitraum
              </p>
              <p className="mt-2 text-2xl font-bold text-text-primary">
                {selectedMonthLabel}
              </p>
              <p className="mt-1 text-xs font-medium text-text-secondary">
                {previewRows.length} Vorschauzeilen
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              {[
                ["Mandant", exportDraft.companyName],
                ["Depot", selectedDepotLabel],
                ["Zahlungsart", selectedPaymentLabel],
                ["Regel", exportDraft.approvedOnlyLabel],
                ["Erstellt von", exportDraft.generatedByName],
              ].map(([label, value]) => (
                <label className="block" key={label}>
                  <span className="text-xs font-semibold uppercase text-text-muted">
                    {label}
                  </span>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none"
                    readOnly
                    value={value}
                  />
                </label>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {exportDraft.formats.map((format) => (
                <div
                  className={`rounded-xl border px-4 py-3 ${toneClasses[format.tone].soft}`}
                  key={format.label}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className={`text-sm font-semibold ${toneClasses[format.tone].text}`}>
                      {format.label}
                    </p>
                    <StatusBadge
                      label={preparedFormat === format.label ? "Vorbereitet" : "Bereit"}
                      tone={format.tone}
                    />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-text-primary">
                    {format.value}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-text-secondary">
                    {format.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground"
                disabled={!hasPreviewRows}
                type="button"
                onClick={() => handlePrepareFormat("XLSX")}
              >
                XLSX herunterladen
              </button>
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary disabled:cursor-not-allowed disabled:bg-disabled-light disabled:text-disabled-foreground"
                disabled={!hasPreviewRows}
                type="button"
                onClick={() => handlePrepareFormat("CSV")}
              >
                CSV herunterladen
              </button>
            </div>

            <p className="mt-4 text-xs font-medium leading-5 text-text-secondary">
              {updatedLabel}
            </p>

            <p className="mt-4 rounded-xl border border-warning-light bg-warning-lightest px-4 py-3 text-xs leading-5 text-warning-foreground">
              {exportDraft.auditReminder}
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">
              Export-Checkliste
            </h2>
            <div className="mt-5 flex flex-col gap-3">
              {[
                { label: "Monat ausgewaehlt", done: Boolean(selectedMonth) },
                { label: "Nur genehmigte Schichten", done: true },
                { label: "Billable Minutes enthalten", done: true },
                { label: "CSV und XLSX sichtbar", done: true },
                { label: "Vorschau hat Zeilen", done: hasPreviewRows },
              ].map((item) => (
                <div
                  className="flex items-center gap-3 rounded-xl border border-border-light bg-surface-secondary px-4 py-3"
                  key={item.label}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      item.done ? "bg-success" : "bg-disabled"
                    }`}
                    aria-hidden="true"
                  />
                  <p className="text-sm font-semibold text-text-primary">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">
              Monatsstatus
            </h2>
            <div className="mt-5 grid gap-3">
              <div className="rounded-xl border border-success-light bg-success-lightest px-4 py-3">
                <p className="text-xs font-semibold text-success-foreground">
                  Genehmigte Zeilen
                </p>
                <p className="mt-1 text-2xl font-bold text-text-primary">
                  {previewSummary.approvedShifts}
                </p>
              </div>
              <div className="rounded-xl border border-warning-light bg-warning-lightest px-4 py-3">
                <p className="text-xs font-semibold text-warning-foreground">
                  Manuelle Korrekturen
                </p>
                <p className="mt-1 text-2xl font-bold text-text-primary">
                  {previewSummary.overrideCount}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
