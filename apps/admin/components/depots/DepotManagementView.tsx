"use client";

import type { DepotMutationInput } from "@routeforge/shared";
import { useMemo, useState } from "react";

import {
  createDepotAction,
  updateDepotAction,
} from "@/app/actions/depots";
import {
  getAdminDepotSummary,
  type AdminDepotListItem,
} from "@/lib/depots";

type DepotManagementViewProps = {
  canManage: boolean;
  initialDepots: AdminDepotListItem[];
  loadError: string | null;
};

type DepotDraft = {
  addressLine1: string;
  city: string;
  code: string;
  countryCode: string;
  geofenceRadiusMeters: string;
  isActive: boolean;
  latitude: string;
  longitude: string;
  name: string;
  postalCode: string;
};

const emptyDraft: DepotDraft = {
  addressLine1: "",
  city: "",
  code: "",
  countryCode: "DE",
  geofenceRadiusMeters: "150",
  isActive: true,
  latitude: "",
  longitude: "",
  name: "",
  postalCode: "",
};

export function DepotManagementView({
  canManage,
  initialDepots,
  loadError,
}: DepotManagementViewProps) {
  const [depots, setDepots] = useState(initialDepots);
  const [draft, setDraft] = useState<DepotDraft>(
    initialDepots[0] ? draftFromDepot(initialDepots[0]) : emptyDraft,
  );
  const [editingDepotId, setEditingDepotId] = useState<string | null>(
    initialDepots[0]?.id ?? null,
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all",
  );
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const summary = useMemo(() => getAdminDepotSummary(depots), [depots]);
  const filteredDepots = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return depots.filter((depot) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? depot.is_active : !depot.is_active);
      const matchesSearch =
        !normalizedSearch ||
        [depot.name, depot.code, depot.city, depot.postal_code]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [depots, search, statusFilter]);

  function selectDepot(depot: AdminDepotListItem) {
    setEditingDepotId(depot.id);
    setDraft(draftFromDepot(depot));
    setMutationError(null);
    setSavedMessage(null);
  }

  function startNewDepot() {
    setEditingDepotId(null);
    setDraft(emptyDraft);
    setMutationError(null);
    setSavedMessage(null);
  }

  async function saveDepot() {
    const input = parseDraft(draft);

    if (!input) {
      setMutationError("Bitte pruefe Koordinaten und Geofence-Radius.");
      return;
    }

    setSubmitting(true);
    setMutationError(null);
    setSavedMessage(null);

    const result = editingDepotId
      ? await updateDepotAction(editingDepotId, input)
      : await createDepotAction(input);

    setSubmitting(false);

    if (result.error || !result.depot) {
      setMutationError(result.error ?? "Depot konnte nicht gespeichert werden.");
      return;
    }

    const existing = depots.find((depot) => depot.id === result.depot?.id);
    const savedDepot: AdminDepotListItem = {
      ...result.depot,
      courierCount: existing?.courierCount ?? 0,
      dispatcherCount: existing?.dispatcherCount ?? 0,
      statusLabel: result.depot.is_active ? "Aktiv" : "Inaktiv",
      statusTone: result.depot.is_active ? "success" : "neutral",
    };

    setDepots((current) => {
      const hasDepot = current.some((depot) => depot.id === savedDepot.id);
      return hasDepot
        ? current.map((depot) => (depot.id === savedDepot.id ? savedDepot : depot))
        : [savedDepot, ...current];
    });
    setEditingDepotId(savedDepot.id);
    setDraft(draftFromDepot(savedDepot));
    setSavedMessage(
      existing ? "Depot wurde aktualisiert." : "Depot wurde erstellt.",
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Depot-Verwaltung</p>
            <h1 className="mt-2 text-3xl font-bold leading-[38px] text-text-primary">
              Depots
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
              Company-scoped Standorte, Adressen und Start/Stopp-Geofences.
              Dispatcher sehen nur ihre zugewiesenen Depots.
            </p>
          </div>
          {canManage ? (
            <button
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
              onClick={startNewDepot}
              type="button"
            >
              Depot hinzufuegen
            </button>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryTile label="Depots gesamt" value={summary.total} />
        <SummaryTile label="Aktive Depots" value={summary.active} />
        <SummaryTile
          label="Zugewiesene Kuriere"
          value={summary.assignedCouriers}
        />
      </section>

      {loadError ? <FeedbackMessage tone="error">{loadError}</FeedbackMessage> : null}

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <label className="block">
            <span className="text-xs font-semibold uppercase text-text-muted">
              Suche
            </span>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, Code, Stadt oder PLZ"
              type="search"
              value={search}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase text-text-muted">
              Status
            </span>
            <select
              className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary outline-none focus:border-primary"
              onChange={(event) =>
                setStatusFilter(event.target.value as typeof statusFilter)
              }
              value={statusFilter}
            >
              <option value="all">Alle Status</option>
              <option value="active">Aktiv</option>
              <option value="inactive">Inaktiv</option>
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(380px,0.75fr)]">
        <div className="rounded-2xl border border-border bg-surface shadow-card">
          <div className="border-b border-border-light p-6">
            <h2 className="text-lg font-semibold text-text-primary">Depot-Liste</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {filteredDepots.length} Depots angezeigt
            </p>
          </div>

          {filteredDepots.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-semibold text-text-primary">
                Keine Depots gefunden
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                Passe die Filter an oder lege als Admin das erste Depot an.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border-light">
              {filteredDepots.map((depot) => (
                <button
                  className={`grid w-full gap-4 p-5 text-left transition md:grid-cols-[1.1fr_1.3fr_0.7fr_0.75fr] md:items-center ${
                    editingDepotId === depot.id
                      ? "bg-primary-lightest"
                      : "hover:bg-surface-secondary"
                  }`}
                  key={depot.id}
                  onClick={() => selectDepot(depot)}
                  type="button"
                >
                  <span>
                    <span className="block font-semibold text-text-primary">
                      {depot.name}
                    </span>
                    <span className="mt-1 block text-xs font-bold text-primary">
                      {depot.code}
                    </span>
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-text-primary">
                      {depot.address_line_1}
                    </span>
                    <span className="mt-1 block text-xs text-text-muted">
                      {depot.postal_code} {depot.city}
                    </span>
                  </span>
                  <span>
                    <StatusBadge active={depot.is_active} />
                    <span className="mt-2 block text-xs text-text-muted">
                      Radius {depot.geofence_radius_meters} m
                    </span>
                  </span>
                  <span className="text-sm text-text-secondary">
                    <span className="block font-semibold text-text-primary">
                      {depot.courierCount} Kuriere
                    </span>
                    <span className="mt-1 block text-xs">
                      {depot.dispatcherCount} Dispatcher
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <div>
            <p className="text-xs font-semibold uppercase text-primary">
              {editingDepotId ? "Depot bearbeiten" : "Neues Depot"}
            </p>
            <h2 className="mt-2 text-xl font-bold text-text-primary">
              {draft.name || "Depot-Daten"}
            </h2>
            <p className="mt-2 text-sm leading-5 text-text-secondary">
              Geofence gilt nur fuer Start- und Stopp-Standorte. Kein
              Live-Tracking.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <TextField
              disabled={!canManage}
              label="Name"
              onChange={(value) => setDraft({ ...draft, name: value })}
              value={draft.name}
            />
            <TextField
              disabled={!canManage}
              label="Code"
              onChange={(value) => setDraft({ ...draft, code: value.toUpperCase() })}
              value={draft.code}
            />
            <div className="sm:col-span-2">
              <TextField
                disabled={!canManage}
                label="Adresse"
                onChange={(value) => setDraft({ ...draft, addressLine1: value })}
                value={draft.addressLine1}
              />
            </div>
            <TextField
              disabled={!canManage}
              label="PLZ"
              onChange={(value) => setDraft({ ...draft, postalCode: value })}
              value={draft.postalCode}
            />
            <TextField
              disabled={!canManage}
              label="Stadt"
              onChange={(value) => setDraft({ ...draft, city: value })}
              value={draft.city}
            />
            <TextField
              disabled={!canManage}
              label="Land"
              onChange={(value) =>
                setDraft({ ...draft, countryCode: value.toUpperCase() })
              }
              value={draft.countryCode}
            />
            <TextField
              disabled={!canManage}
              label="Geofence-Radius (m)"
              onChange={(value) =>
                setDraft({ ...draft, geofenceRadiusMeters: value })
              }
              type="number"
              value={draft.geofenceRadiusMeters}
            />
            <TextField
              disabled={!canManage}
              label="Breitengrad"
              onChange={(value) => setDraft({ ...draft, latitude: value })}
              type="number"
              value={draft.latitude}
            />
            <TextField
              disabled={!canManage}
              label="Laengengrad"
              onChange={(value) => setDraft({ ...draft, longitude: value })}
              type="number"
              value={draft.longitude}
            />
          </div>

          <label className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-border bg-surface-secondary px-4 py-3">
            <span>
              <span className="block text-sm font-semibold text-text-primary">
                Depot aktiv
              </span>
              <span className="mt-1 block text-xs text-text-secondary">
                Inaktive Depots bleiben fuer Historie und Audit erhalten.
              </span>
            </span>
            <input
              checked={draft.isActive}
              disabled={!canManage}
              onChange={(event) =>
                setDraft({ ...draft, isActive: event.target.checked })
              }
              type="checkbox"
            />
          </label>

          {mutationError ? (
            <div className="mt-5">
              <FeedbackMessage tone="error">{mutationError}</FeedbackMessage>
            </div>
          ) : null}
          {savedMessage ? (
            <div className="mt-5">
              <FeedbackMessage tone="success">{savedMessage}</FeedbackMessage>
            </div>
          ) : null}

          {canManage ? (
            <button
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-neutral"
              disabled={submitting}
              onClick={() => void saveDepot()}
              type="button"
            >
              {submitting ? "Depot wird gespeichert..." : "Depot speichern"}
            </button>
          ) : (
            <p className="mt-6 rounded-xl border border-info-light bg-info-lightest p-4 text-sm text-info-foreground">
              Dispatcher koennen ihre zugewiesenen Depots ansehen. Aenderungen
              sind Admins vorbehalten.
            </p>
          )}
        </aside>
      </section>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <p className="text-sm font-semibold text-text-secondary">{label}</p>
      <p className="mt-3 text-3xl font-bold text-text-primary">{value}</p>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-success-lightest text-success-foreground"
          : "bg-neutral-light text-neutral-foreground"
      }`}
    >
      {active ? "Aktiv" : "Inaktiv"}
    </span>
  );
}

function TextField({
  disabled,
  label,
  onChange,
  type = "text",
  value,
}: {
  disabled: boolean;
  label: string;
  onChange: (value: string) => void;
  type?: "number" | "text";
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-text-muted">
        {label}
      </span>
      <input
        className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary outline-none transition disabled:bg-surface-secondary disabled:text-text-muted focus:border-primary"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        step={type === "number" ? "any" : undefined}
        type={type}
        value={value}
      />
    </label>
  );
}

function FeedbackMessage({
  children,
  tone,
}: {
  children: string;
  tone: "error" | "success";
}) {
  return (
    <p
      className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
        tone === "error"
          ? "border-error-light bg-error-lightest text-error-foreground"
          : "border-success-light bg-success-lightest text-success-foreground"
      }`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}

function draftFromDepot(depot: AdminDepotListItem): DepotDraft {
  return {
    addressLine1: depot.address_line_1,
    city: depot.city,
    code: depot.code,
    countryCode: depot.country_code,
    geofenceRadiusMeters: String(depot.geofence_radius_meters),
    isActive: depot.is_active,
    latitude: String(depot.latitude),
    longitude: String(depot.longitude),
    name: depot.name,
    postalCode: depot.postal_code,
  };
}

function parseDraft(draft: DepotDraft): DepotMutationInput | null {
  const latitude = Number(draft.latitude);
  const longitude = Number(draft.longitude);
  const geofenceRadiusMeters = Number(draft.geofenceRadiusMeters);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    !Number.isInteger(geofenceRadiusMeters)
  ) {
    return null;
  }

  return {
    ...draft,
    geofenceRadiusMeters,
    latitude,
    longitude,
  };
}
