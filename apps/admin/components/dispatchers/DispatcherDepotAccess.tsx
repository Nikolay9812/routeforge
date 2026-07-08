"use client";

import { useMemo, useState, useTransition } from "react";

import type {
  AdminDispatcherDepotAccess,
  AdminDispatcherDepotOption,
  AdminDispatcherListItem,
  AdminDispatcherPermission,
  AdminDispatcherTone,
} from "@/lib/dispatchers";

type DispatcherDepotAccessProps = {
  auditReminder: string;
  canManage: boolean;
  depotOptions: AdminDispatcherDepotOption[];
  dispatchers: AdminDispatcherListItem[];
  saveDispatcherDepotAccessAction: (input: {
    depotIds: string[];
    dispatcherProfileId: string;
    reason?: string | null;
  }) => Promise<{
    depotIds: string[];
    dispatcherProfileId: string;
    error: string | null;
    savedAtLabel: string | null;
  }>;
  securityRules: string[];
};

const toneClasses: Record<
  AdminDispatcherTone,
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

function buildInitialAccessState(
  dispatchers: AdminDispatcherListItem[],
): Record<string, string[]> {
  const accessState: Record<string, string[]> = {};

  dispatchers.forEach((dispatcher) => {
    accessState[dispatcher.id] = dispatcher.depotAccess.map(
      (depot) => depot.depotId,
    );
  });

  return accessState;
}

function areSelectionsEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((depotId) => right.includes(depotId));
}

function getAccessTone(
  dispatcher: AdminDispatcherListItem,
): AdminDispatcherTone {
  if (dispatcher.status === "pending_approval") {
    return "warning";
  }

  if (dispatcher.status === "inactive") {
    return "neutral";
  }

  return "success";
}

function getAccessLabel(dispatcher: AdminDispatcherListItem): string {
  if (dispatcher.status === "pending_approval") {
    return "Geplant";
  }

  if (dispatcher.status === "inactive") {
    return "Pausiert";
  }

  return "Vollzugriff";
}

function getDepotSummaryLabel(
  dispatcher: AdminDispatcherListItem,
  selectedDepotCount: number,
  totalDepotCount: number,
): string {
  if (selectedDepotCount === 0) {
    return "Kein Depot";
  }

  if (selectedDepotCount === totalDepotCount) {
    return "Alle Depots";
  }

  if (dispatcher.status === "pending_approval") {
    return selectedDepotCount === 1
      ? "1 geplant"
      : `${selectedDepotCount} geplant`;
  }

  if (dispatcher.status === "inactive") {
    return selectedDepotCount === 1
      ? "1 pausiert"
      : `${selectedDepotCount} pausiert`;
  }

  return selectedDepotCount === 1 ? "1 Depot" : `${selectedDepotCount} Depots`;
}

function getSavedLabel(savedAtLabel: string | undefined): string {
  return savedAtLabel ?? "Backend-Ausgangszustand";
}

function buildDepotAccess(
  depotOptions: AdminDispatcherDepotOption[],
  dispatcher: AdminDispatcherListItem,
  depotIds: string[],
): AdminDispatcherDepotAccess[] {
  return depotOptions
    .filter((depot) => depotIds.includes(depot.id))
    .map((depot) => ({
      depotId: depot.id,
      depotCode: depot.code,
      depotName: depot.name,
      accessLabel: getAccessLabel(dispatcher),
      tone: getAccessTone(dispatcher),
    }));
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: AdminDispatcherTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[tone].badge}`}
    >
      {label}
    </span>
  );
}

function DepotAccessPills({
  depots,
}: {
  depots: AdminDispatcherDepotAccess[];
}) {
  if (depots.length === 0) {
    return (
      <span className="inline-flex rounded-xl border border-border bg-neutral-light px-3 py-2">
        <span className="text-xs font-semibold text-neutral-foreground">
          Kein Zugriff
        </span>
      </span>
    );
  }

  return (
    <span className="flex flex-wrap gap-2">
      {depots.map((depot) => (
        <span
          className={`inline-flex rounded-xl border px-3 py-2 ${toneClasses[depot.tone].soft}`}
          key={`${depot.depotCode}-${depot.accessLabel}`}
        >
          <span className={`text-xs font-semibold ${toneClasses[depot.tone].text}`}>
            {depot.depotCode} - {depot.accessLabel}
          </span>
        </span>
      ))}
    </span>
  );
}

function PermissionList({
  permissions,
}: {
  permissions: AdminDispatcherPermission[];
}) {
  return (
    <div className="flex flex-col gap-2">
      {permissions.map((permission) => (
        <span className="flex items-center gap-2" key={permission.label}>
          <span
            className={`h-2 w-2 rounded-full ${
              permission.enabled ? "bg-success" : "bg-disabled"
            }`}
            aria-hidden="true"
          />
          <span
            className={`text-xs font-semibold ${
              permission.enabled
                ? "text-text-secondary"
                : "text-disabled-foreground"
            }`}
          >
            {permission.label}
          </span>
        </span>
      ))}
    </div>
  );
}

export function DispatcherDepotAccess({
  auditReminder,
  canManage,
  depotOptions,
  dispatchers,
  saveDispatcherDepotAccessAction,
  securityRules,
}: DispatcherDepotAccessProps) {
  const [isSaving, startSaving] = useTransition();
  const initialAccessState = useMemo(
    () => buildInitialAccessState(dispatchers),
    [dispatchers],
  );
  const [selectedDispatcherId, setSelectedDispatcherId] = useState(
    dispatchers[0]?.id ?? "",
  );
  const [draftAccessByDispatcher, setDraftAccessByDispatcher] =
    useState(initialAccessState);
  const [savedAccessByDispatcher, setSavedAccessByDispatcher] =
    useState(initialAccessState);
  const [savedAtByDispatcher, setSavedAtByDispatcher] = useState<
    Record<string, string>
  >({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const selectedDispatcher = dispatchers.find(
    (dispatcher) => dispatcher.id === selectedDispatcherId,
  );
  const savedScopedDepotCount = useMemo(
    () =>
      new Set(
        Object.values(savedAccessByDispatcher).flatMap((depotIds) => depotIds),
      ).size,
    [savedAccessByDispatcher],
  );

  if (!selectedDispatcher) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <h2 className="text-lg font-semibold text-text-primary">
          Dispatcher-Liste
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Keine Dispatcherprofile im aktuellen Unternehmen gefunden.
        </p>
      </section>
    );
  }

  const activeDispatcher = selectedDispatcher;
  const selectedDraftDepotIds =
    draftAccessByDispatcher[activeDispatcher.id] ?? [];
  const selectedSavedDepotIds =
    savedAccessByDispatcher[activeDispatcher.id] ?? [];
  const allDepotsSelected = selectedDraftDepotIds.length === depotOptions.length;
  const hasDraftChanges = !areSelectionsEqual(
    selectedDraftDepotIds,
    selectedSavedDepotIds,
  );
  const addedDepotCount = selectedDraftDepotIds.filter(
    (depotId) => !selectedSavedDepotIds.includes(depotId),
  ).length;
  const removedDepotCount = selectedSavedDepotIds.filter(
    (depotId) => !selectedDraftDepotIds.includes(depotId),
  ).length;
  const selectedDraftDepots = buildDepotAccess(
    depotOptions,
    activeDispatcher,
    selectedDraftDepotIds,
  );

  function handleSelectDispatcher(dispatcherId: string): void {
    setSelectedDispatcherId(dispatcherId);
    setSaveError(null);
    setSaveSuccess(null);
  }

  function handleToggleDepot(depotId: string): void {
    if (!canManage || isSaving) {
      return;
    }

    setDraftAccessByDispatcher((currentState) => {
      const currentDepotIds = currentState[activeDispatcher.id] ?? [];
      const nextDepotIds = currentDepotIds.includes(depotId)
        ? currentDepotIds.filter((currentDepotId) => currentDepotId !== depotId)
        : [...currentDepotIds, depotId];

      return {
        ...currentState,
        [activeDispatcher.id]: nextDepotIds,
      };
    });
  }

  function handleToggleAllDepots(): void {
    if (!canManage || isSaving) {
      return;
    }

    setDraftAccessByDispatcher((currentState) => {
      const currentDepotIds = currentState[activeDispatcher.id] ?? [];
      const nextDepotIds =
        currentDepotIds.length === depotOptions.length
          ? []
          : depotOptions.map((depot) => depot.id);

      return {
        ...currentState,
        [activeDispatcher.id]: nextDepotIds,
      };
    });
  }

  function handleDiscardChanges(): void {
    setSaveError(null);
    setSaveSuccess(null);
    setDraftAccessByDispatcher((currentState) => ({
      ...currentState,
      [activeDispatcher.id]: selectedSavedDepotIds,
    }));
  }

  function handleSaveAccess(): void {
    if (!canManage || !hasDraftChanges || isSaving) {
      return;
    }

    setSaveError(null);
    setSaveSuccess(null);

    startSaving(async () => {
      const result = await saveDispatcherDepotAccessAction({
        depotIds: selectedDraftDepotIds,
        dispatcherProfileId: activeDispatcher.profileId,
      });

      if (result.error) {
        setSaveError(result.error);
        return;
      }

      setSavedAccessByDispatcher((currentState) => ({
        ...currentState,
        [activeDispatcher.id]: result.depotIds,
      }));
      setDraftAccessByDispatcher((currentState) => ({
        ...currentState,
        [activeDispatcher.id]: result.depotIds,
      }));
      setSavedAtByDispatcher((currentState) => ({
        ...currentState,
        [activeDispatcher.id]:
          result.savedAtLabel ?? "Gerade eben serverseitig gespeichert",
      }));
      setSaveSuccess("Depot-Zugriff wurde serverseitig gespeichert.");
    });
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(380px,0.65fr)]">
      <div className="rounded-2xl border border-border bg-surface shadow-card">
        <div className="flex flex-col gap-3 border-b border-border-light p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Dispatcher-Liste
            </h2>
            <p className="mt-1 text-sm leading-5 text-text-secondary">
              Uebersicht der Dispatcher im aktuellen Unternehmen.
            </p>
          </div>
          <div className="text-sm font-semibold text-text-secondary">
            <p>{dispatchers.length} Dispatcher angezeigt</p>
            <p className="mt-1 text-xs text-text-muted">
              {savedScopedDepotCount} Depots im Backend-Zugriff
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1180px]">
            <div className="grid grid-cols-[1.2fr_0.65fr_1fr_1fr_0.8fr_0.75fr] bg-surface-secondary px-6 py-3 text-xs font-semibold uppercase text-text-subtle">
              <span>Name</span>
              <span>Status</span>
              <span>Depot-Zugriff</span>
              <span>Berechtigungen</span>
              <span>Letzte Aktivitaet</span>
              <span>Aktionen</span>
            </div>

            <div className="divide-y divide-border-light">
              {dispatchers.map((dispatcher) => {
                const savedDepotIds = savedAccessByDispatcher[dispatcher.id] ?? [];
                const displayedDepotAccess = buildDepotAccess(
                  depotOptions,
                  dispatcher,
                  savedDepotIds,
                );
                const isSelected = dispatcher.id === activeDispatcher.id;

                return (
                  <div
                    className={`grid grid-cols-[1.2fr_0.65fr_1fr_1fr_0.8fr_0.75fr] items-center px-6 py-4 text-sm text-text-primary transition hover:bg-surface-secondary ${
                      isSelected ? "bg-primary-muted" : ""
                    }`}
                    key={dispatcher.id}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-lightest text-sm font-bold text-primary-darker">
                        {dispatcher.initials}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">
                          {dispatcher.fullName}
                        </span>
                        <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                          {dispatcher.email}
                        </span>
                        <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                          {dispatcher.phone}
                        </span>
                      </span>
                    </span>

                    <span>
                      <StatusBadge
                        label={dispatcher.statusLabel}
                        tone={dispatcher.statusTone}
                      />
                      <span className="mt-2 block text-xs font-medium text-text-muted">
                        {dispatcher.inviteLabel}
                      </span>
                    </span>

                    <span>
                      <span className="mb-2 block text-xs font-semibold text-text-secondary">
                        {getDepotSummaryLabel(
                          dispatcher,
                          savedDepotIds.length,
                          depotOptions.length,
                        )}
                      </span>
                      <DepotAccessPills depots={displayedDepotAccess} />
                    </span>

                    <span>
                      <span className="mb-2 block text-xs font-semibold text-text-secondary">
                        {dispatcher.permissionSummaryLabel}
                      </span>
                      <PermissionList permissions={dispatcher.permissions} />
                    </span>

                    <span className="font-semibold text-text-secondary">
                      {dispatcher.lastActivityLabel}
                    </span>

                    <span className="flex flex-wrap gap-2">
                      <button
                        className={`inline-flex h-9 items-center justify-center rounded-xl border px-3 text-xs font-semibold shadow-card transition ${
                          isSelected
                            ? "border-primary-light bg-primary-lightest text-primary-darker"
                            : "border-border bg-surface text-text-primary hover:bg-surface-secondary"
                        }`}
                        type="button"
                        onClick={() => handleSelectDispatcher(dispatcher.id)}
                      >
                        Zugriff
                      </button>
                      <button
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-surface-secondary px-3 text-xs font-semibold text-text-secondary"
                        disabled
                        type="button"
                      >
                        Status spaeter
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <aside className="flex flex-col gap-6">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Depot-Zugriff bearbeiten
              </h2>
              <p className="mt-1 text-sm leading-5 text-text-secondary">
                Aktuelle Auswahl fuer {activeDispatcher.fullName}.
              </p>
            </div>
            <StatusBadge
              label={hasDraftChanges ? "Entwurf" : "Gespeichert"}
              tone={hasDraftChanges ? "info" : "success"}
            />
          </div>

          <div className="mt-5 rounded-xl border border-primary-light bg-primary-lightest p-4">
            <p className="text-xs font-semibold uppercase text-primary-darker">
              Dispatcher
            </p>
            <p className="mt-2 text-sm font-semibold text-text-primary">
              {activeDispatcher.fullName}
            </p>
            <p className="mt-1 text-xs font-medium text-text-secondary">
              {activeDispatcher.id} / {activeDispatcher.profileId}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border-light bg-surface-secondary px-4 py-3">
              <p className="text-xs font-semibold uppercase text-text-muted">
                Gespeichert
              </p>
              <p className="mt-2 text-lg font-bold text-text-primary">
                {selectedSavedDepotIds.length}
              </p>
            </div>
            <div className="rounded-xl border border-border-light bg-surface-secondary px-4 py-3">
              <p className="text-xs font-semibold uppercase text-text-muted">
                Entwurf
              </p>
              <p className="mt-2 text-lg font-bold text-text-primary">
                {selectedDraftDepotIds.length}
              </p>
            </div>
            <div className="rounded-xl border border-border-light bg-surface-secondary px-4 py-3">
              <p className="text-xs font-semibold uppercase text-text-muted">
                Aenderung
              </p>
              <p className="mt-2 text-lg font-bold text-text-primary">
                +{addedDepotCount} / -{removedDepotCount}
              </p>
            </div>
          </div>

          <label className="mt-5 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-card transition hover:bg-surface-secondary">
            <span>
              <span className="block text-sm font-semibold text-text-primary">
                Alle Depots
              </span>
              <span className="mt-1 block text-xs font-medium text-text-secondary">
                Schaltet den Backend-Zugriff fuer alle vorhandenen Depots um.
              </span>
            </span>
            <input
              checked={allDepotsSelected}
              className="h-4 w-4 rounded border-border text-primary"
              disabled={!canManage || isSaving}
              type="checkbox"
              onChange={handleToggleAllDepots}
            />
          </label>

          <div className="mt-5 divide-y divide-border-light">
            {depotOptions.map((depot) => {
              const isSelected = selectedDraftDepotIds.includes(depot.id);

              return (
                <label
                  className="flex cursor-pointer flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  key={depot.id}
                >
                  <span>
                    <span className="block text-sm font-semibold text-text-primary">
                      {depot.name}
                    </span>
                    <span className="mt-1 block text-xs font-medium text-text-secondary">
                      {depot.code} - {depot.city}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <StatusBadge
                      label={
                        isSelected
                          ? getAccessLabel(activeDispatcher)
                          : "Kein Zugriff"
                      }
                      tone={
                        isSelected ? getAccessTone(activeDispatcher) : "neutral"
                      }
                    />
                    <input
                      checked={isSelected}
                      className="h-4 w-4 rounded border-border text-primary"
                      disabled={!canManage || isSaving}
                      type="checkbox"
                      onChange={() => handleToggleDepot(depot.id)}
                    />
                  </span>
                </label>
              );
            })}
          </div>

          <div className="mt-5 rounded-xl border border-border-light bg-surface-secondary px-4 py-3">
            <p className="text-xs font-semibold uppercase text-text-muted">
              profile_depot_access Vorschau
            </p>
            <p className="mt-2 text-xs font-medium leading-5 text-text-secondary">
              company_id {activeDispatcher.companyId} / profile_id{" "}
              {activeDispatcher.profileId} / depot_ids{" "}
              {selectedDraftDepotIds.length > 0
                ? selectedDraftDepotIds.join(", ")
                : "keine"}
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <button
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground"
              disabled={!canManage || !hasDraftChanges || isSaving}
              type="button"
              onClick={handleSaveAccess}
            >
              {isSaving ? "Speichert..." : "Zugriff speichern"}
            </button>
            <button
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary disabled:cursor-not-allowed disabled:bg-disabled-light disabled:text-disabled-foreground"
              disabled={!hasDraftChanges || isSaving}
              type="button"
              onClick={handleDiscardChanges}
            >
              Auswahl verwerfen
            </button>
          </div>

          {saveError ? (
            <p className="mt-4 rounded-xl border border-error-light bg-error-lightest px-4 py-3 text-xs font-semibold leading-5 text-error-foreground">
              {saveError}
            </p>
          ) : null}

          {saveSuccess ? (
            <p className="mt-4 rounded-xl border border-success-light bg-success-lightest px-4 py-3 text-xs font-semibold leading-5 text-success-foreground">
              {saveSuccess}
            </p>
          ) : null}

          <p className="mt-4 text-xs font-medium leading-5 text-text-secondary">
            {getSavedLabel(savedAtByDispatcher[activeDispatcher.id])}
          </p>

          <div className="mt-4">
            <DepotAccessPills depots={selectedDraftDepots} />
          </div>

          <p className="mt-4 rounded-xl border border-warning-light bg-warning-lightest px-4 py-3 text-xs leading-5 text-warning-foreground">
            {auditReminder}
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <h2 className="text-lg font-semibold text-text-primary">
            Sicherheitsgrenze
          </h2>
          <div className="mt-5 flex flex-col gap-3">
            {securityRules.map((rule) => (
              <div
                className="rounded-xl border border-border-light bg-surface-secondary px-4 py-3"
                key={rule}
              >
                <p className="text-sm font-semibold text-text-primary">
                  {rule}
                </p>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </section>
  );
}
