"use client";

import { useMemo, useRef, useState } from "react";

import {
  createInvitationAction,
  revokeInvitationAction,
} from "@/app/actions/invitations";
import type {
  AdminInvitationDepotOption,
  AdminInvitationDraft,
  AdminInvitationFilterGroup,
  AdminInvitationListItem,
  AdminInvitationTone,
} from "@/lib/invitations";
import {
  formatDateTime,
  getDateFromInput,
  getDefaultExpiryInput,
  getInvitationSummary,
} from "@/lib/invitations";
import type { InvitationRole } from "@routeforge/shared";

type InvitationRealDataProps = {
  depotOptions: AdminInvitationDepotOption[];
  filters: AdminInvitationFilterGroup[];
  initialInvitations: AdminInvitationListItem[];
  invitationDraft: AdminInvitationDraft;
};

const noDepotValue = "none";

const roleOptions: Array<{
  label: string;
  value: InvitationRole;
}> = [
  { label: "Kurier", value: "courier" },
  { label: "Dispatcher", value: "dispatcher" },
];

const toneClasses: Record<
  AdminInvitationTone,
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
  tone: AdminInvitationTone;
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
  tone: AdminInvitationTone;
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

function getDepotOptions(depots: AdminInvitationDepotOption[]) {
  return [
    ...depots,
    { label: "Depot spaeter zuweisen", value: noDepotValue },
  ];
}

function getDefaultDepotId(depotOptions: AdminInvitationDepotOption[]): string {
  return depotOptions[0]?.value ?? noDepotValue;
}

function getDepotLabel(
  depotOptions: AdminInvitationDepotOption[],
  depotId: string,
): string {
  return (
    depotOptions.find((option) => option.value === depotId)?.label ??
    "Depot spaeter zuweisen"
  );
}

export function InvitationRealData({
  depotOptions: initialDepotOptions,
  filters,
  initialInvitations,
  invitationDraft,
}: InvitationRealDataProps) {
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const defaultExpiryInput = useMemo(() => getDefaultExpiryInput(), []);
  const [renderReferenceTime] = useState(() => Date.now());
  const depotOptions = useMemo(
    () => getDepotOptions(initialDepotOptions),
    [initialDepotOptions],
  );
  const [invitations, setInvitations] = useState(initialInvitations);
  const [email, setEmail] = useState(invitationDraft.email);
  const [role, setRole] = useState<InvitationRole>(invitationDraft.role);
  const [selectedDepotId, setSelectedDepotId] = useState(
    getDefaultDepotId(depotOptions),
  );
  const [expiresAtInput, setExpiresAtInput] = useState(defaultExpiryInput);
  const [generatedCode, setGeneratedCode] = useState(
    invitationDraft.inviteCodePreview,
  );
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [savedAtLabel, setSavedAtLabel] = useState("Noch nicht gespeichert");

  const invitationSummary = getInvitationSummary(invitations);
  const selectedDepotName = getDepotLabel(depotOptions, selectedDepotId);
  const expiresAt = getDateFromInput(expiresAtInput);
  const draftIsExpired = expiresAt.getTime() <= renderReferenceTime;
  const trimmedEmail = email.trim();
  const canCreateInvitation =
    trimmedEmail.includes("@") && Boolean(expiresAtInput.trim()) && !isMutating;

  async function handleCreateInvitation(): Promise<void> {
    if (!canCreateInvitation) {
      return;
    }

    setIsMutating(true);
    setMutationError(null);

    const result = await createInvitationAction({
      depotId: selectedDepotId === noDepotValue ? null : selectedDepotId,
      email: trimmedEmail,
      expiresAt: expiresAt.toISOString(),
      role,
    });

    if (result.error || !result.invitation) {
      setMutationError(result.error ?? "Einladung konnte nicht erstellt werden.");
      setIsMutating(false);
      return;
    }

    setInvitations((currentInvitations) => [
      {
        ...result.invitation!,
        depotName: selectedDepotName,
      },
      ...currentInvitations,
    ]);
    setGeneratedCode(result.invitation.invite_code);
    setSavedAtLabel("Gerade eben in der Datenbank gespeichert");
    setIsMutating(false);
  }

  function handleDiscardDraft(): void {
    setEmail(invitationDraft.email);
    setRole(invitationDraft.role);
    setSelectedDepotId(getDefaultDepotId(depotOptions));
    setExpiresAtInput(defaultExpiryInput);
    setGeneratedCode(invitationDraft.inviteCodePreview);
    setMutationError(null);
    setSavedAtLabel("Entwurf zurueckgesetzt");
  }

  async function handleRevokeInvitation(invitationId: string): Promise<void> {
    setIsMutating(true);
    setMutationError(null);

    const result = await revokeInvitationAction(invitationId);

    if (result.error || !result.invitation) {
      setMutationError(result.error ?? "Einladung konnte nicht widerrufen werden.");
      setIsMutating(false);
      return;
    }

    setInvitations((currentInvitations) =>
      currentInvitations.map((invitation) =>
        invitation.id === invitationId
          ? {
              ...result.invitation!,
              createdByName: invitation.createdByName,
              depotName: invitation.depotName,
            }
          : invitation,
      ),
    );
    setSavedAtLabel("Einladung in der Datenbank widerrufen");
    setIsMutating(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              Einladungsverwaltung
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-[38px] text-text-primary">
              Einladungen
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
              Erstelle E-Mail-Codes fuer Kuriere und Dispatcher. Codes sind
              einmalig nutzbar, laufen ab und starten neue Kuriere mit
              ausstehender Freigabe.
            </p>
          </div>
          <button
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
            type="button"
            onClick={() => emailInputRef.current?.focus()}
          >
            Einladung erstellen
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          label="Einladungen gesamt"
          tone="primary"
          value={String(invitationSummary.total)}
        />
        <SummaryTile
          label="Aktiv"
          tone="success"
          value={String(invitationSummary.active)}
        />
        <SummaryTile
          label="Verwendet"
          tone="neutral"
          value={String(invitationSummary.used)}
        />
        <SummaryTile
          label="Gesperrt"
          tone="warning"
          value={String(invitationSummary.blocked)}
        />
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Filter</h2>
            <p className="mt-1 text-sm leading-5 text-text-secondary">
              Filter fuer E-Mail, Rolle, Depot und Status. Neue Einladungen
              werden direkt in der Datenbank gespeichert.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
              type="button"
            >
              Filter zuruecksetzen
            </button>
            <button
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
              type="button"
            >
              Filter anwenden
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,0.9fr))]">
          <label className="block">
            <span className="text-xs font-semibold uppercase text-text-muted">
              Suche
            </span>
            <input
              className="mt-2 flex h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none transition placeholder:text-text-muted focus:border-primary"
              placeholder="Einladung suchen (E-Mail, Code, Ersteller)"
              type="search"
            />
          </label>

          {filters.map((filter) => (
            <label className="block" key={filter.label}>
              <span className="text-xs font-semibold uppercase text-text-muted">
                {filter.label}
              </span>
              <span className="mt-2 flex min-h-11 items-center justify-between rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card">
                <span className="truncate">{filter.value}</span>
                <span
                  className="text-xs font-bold text-text-muted"
                  aria-hidden="true"
                >
                  v
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(380px,0.65fr)]">
        <div className="rounded-2xl border border-border bg-surface shadow-card">
          <div className="flex flex-col gap-3 border-b border-border-light p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Einladungsliste
              </h2>
              <p className="mt-1 text-sm leading-5 text-text-secondary">
                Admin sieht company-scoped Einladungen. Dispatcher-Erstellung
                bleibt bis zur expliziten Dispatcher-Permission admin-only.
              </p>
            </div>
            <p className="text-sm font-semibold text-text-secondary">
              {invitations.length} Einladungen angezeigt
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1180px]">
              <div className="grid grid-cols-[1.25fr_0.65fr_0.9fr_0.9fr_0.9fr_0.8fr_0.75fr] bg-surface-secondary px-6 py-3 text-xs font-semibold uppercase text-text-subtle">
                <span>Empfaenger</span>
                <span>Rolle</span>
                <span>Depot</span>
                <span>Code</span>
                <span>Ablauf</span>
                <span>Status</span>
                <span>Aktionen</span>
              </div>

              <div className="divide-y divide-border-light">
                {invitations.length === 0 ? (
                  <div className="px-6 py-10 text-sm font-semibold text-text-secondary">
                    Keine Einladungen vorhanden.
                  </div>
                ) : null}

                {invitations.map((invitation) => {
                  const canRevoke = invitation.status === "active";

                  return (
                    <div
                      className="grid grid-cols-[1.25fr_0.65fr_0.9fr_0.9fr_0.9fr_0.8fr_0.75fr] items-center px-6 py-4 text-sm text-text-primary transition hover:bg-surface-secondary"
                      key={invitation.id}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-lightest text-sm font-bold text-primary-darker">
                          {invitation.role === "courier" ? "KU" : "DP"}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">
                            {invitation.email}
                          </span>
                          <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                            {invitation.id}
                          </span>
                          <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                            Erstellt von {invitation.createdByName}
                          </span>
                        </span>
                      </span>

                      <span>
                        <StatusBadge
                          label={invitation.roleLabel}
                          tone={
                            invitation.role === "courier" ? "primary" : "info"
                          }
                        />
                        <span className="mt-2 block text-xs font-medium text-text-muted">
                          {invitation.registrationLabel}
                        </span>
                      </span>

                      <span className="min-w-0">
                        <span className="block truncate font-semibold">
                          {invitation.depotName}
                        </span>
                        <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                          {invitation.depot_id ?? "Optional"}
                        </span>
                      </span>

                      <span>
                        <span className="inline-flex rounded-xl border border-border bg-surface px-3 py-2 font-semibold tracking-wide shadow-card">
                          {invitation.invite_code}
                        </span>
                        <span className="mt-2 block text-xs font-medium text-text-muted">
                          Einmal-Code
                        </span>
                      </span>

                      <span>
                        <span className="block font-semibold">
                          {invitation.expiresAtLabel}
                        </span>
                        <span className="mt-1 block text-xs font-medium text-text-muted">
                          Genutzt: {invitation.usedAtLabel}
                        </span>
                      </span>

                      <span>
                        <StatusBadge
                          label={invitation.statusLabel}
                          tone={invitation.statusTone}
                        />
                        <span className="mt-2 block text-xs font-medium text-text-muted">
                          {invitation.deliveryLabel}
                        </span>
                      </span>

                      <span className="flex flex-wrap gap-2">
                        <button
                          className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
                          type="button"
                        >
                          Details
                        </button>
                        <button
                          className="inline-flex h-9 items-center justify-center rounded-xl border border-error-light bg-error-lightest px-3 text-xs font-semibold text-error-foreground transition hover:bg-surface-secondary disabled:cursor-not-allowed disabled:border-border disabled:bg-disabled-light disabled:text-disabled-foreground"
                          disabled={!canRevoke || isMutating}
                          type="button"
                          onClick={() => void handleRevokeInvitation(invitation.id)}
                        >
                          {canRevoke ? "Widerrufen" : "Gesperrt"}
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
                  Einladung erstellen
                </h2>
                <p className="mt-1 text-sm leading-5 text-text-secondary">
                  Backend-Entwurf fuer einen neuen E-Mail-Code.
                </p>
              </div>
              <StatusBadge label="Backend" tone="info" />
            </div>

            <div className="mt-5 rounded-xl border border-primary-light bg-primary-lightest p-4">
              <p className="text-xs font-semibold uppercase text-primary-darker">
                Generierter Code
              </p>
              <p className="mt-2 text-2xl font-bold tracking-wide text-text-primary">
                {generatedCode}
              </p>
              <p className="mt-1 text-xs font-medium text-text-secondary">
                {draftIsExpired
                  ? "Ablauf liegt in der Vergangenheit"
                  : invitationDraft.validityLabel}
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              <label className="block">
                <span className="text-xs font-semibold uppercase text-text-muted">
                  E-Mail
                </span>
                <input
                  ref={emailInputRef}
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none transition focus:border-primary"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase text-text-muted">
                  Rolle
                </span>
                <select
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none transition focus:border-primary"
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value as InvitationRole)
                  }
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase text-text-muted">
                  Depot optional
                </span>
                <select
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none transition focus:border-primary"
                  value={selectedDepotId}
                  onChange={(event) => setSelectedDepotId(event.target.value)}
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
                  Ablaufdatum
                </span>
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none transition focus:border-primary"
                  type="datetime-local"
                  value={expiresAtInput}
                  onChange={(event) => setExpiresAtInput(event.target.value)}
                />
              </label>
            </div>

            <div className="mt-5 rounded-xl border border-border-light bg-surface-secondary p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    E-Mail-Versand
                  </p>
                  <p className="mt-1 text-xs font-medium text-text-secondary">
                    Ablauf: {formatDateTime(expiresAt)}
                  </p>
                </div>
                <StatusBadge
                  label={draftIsExpired ? "Abgelaufen" : "Vorbereitet"}
                  tone={draftIsExpired ? "warning" : "success"}
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-text-secondary">
                {invitationDraft.deliveryMessage}
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground"
                disabled={!canCreateInvitation || draftIsExpired}
                type="button"
                onClick={() => void handleCreateInvitation()}
              >
                {isMutating ? "Speichern..." : "Einladung erstellen"}
              </button>
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
                type="button"
                onClick={handleDiscardDraft}
              >
                Entwurf verwerfen
              </button>
            </div>

            <p className="mt-4 text-xs font-medium leading-5 text-text-secondary">
              {savedAtLabel}
            </p>

            {mutationError ? (
              <p className="mt-3 rounded-xl border border-error-light bg-error-lightest px-4 py-3 text-xs font-semibold leading-5 text-error-foreground">
                {mutationError}
              </p>
            ) : null}

            <p className="mt-4 rounded-xl border border-warning-light bg-warning-lightest px-4 py-3 text-xs leading-5 text-warning-foreground">
              {invitationDraft.auditReminder}
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">
              Registrierung & Scope
            </h2>
            <div className="mt-5 flex flex-col gap-3">
              {(
                [
                  { label: "Mandant", value: "Aktuelle Firma", tone: "primary" },
                  {
                    label: "Nutzung",
                    value: draftIsExpired ? "Gesperrt" : "Einmalig",
                    tone: draftIsExpired ? "warning" : "success",
                  },
                  {
                    label: "Startstatus",
                    value: role === "courier" ? "pending_approval" : "dispatcher",
                    tone: role === "courier" ? "warning" : "info",
                  },
                  { label: "Depot", value: selectedDepotName, tone: "neutral" },
                ] satisfies Array<{
                  label: string;
                  tone: AdminInvitationTone;
                  value: string;
                }>
              ).map((row) => (
                <div
                  className={`rounded-xl border px-4 py-3 ${toneClasses[row.tone].soft}`}
                  key={row.label}
                >
                  <p className={`text-xs font-semibold ${toneClasses[row.tone].text}`}>
                    {row.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">
              Einladungs-Checkliste
            </h2>
            <div className="mt-5 flex flex-col gap-3">
              {[
                { label: "E-Mail eingetragen", done: trimmedEmail.includes("@") },
                { label: "Rolle courier oder dispatcher", done: Boolean(role) },
                { label: "Depot optional gewaehlt", done: Boolean(selectedDepotId) },
                { label: "Ablaufdatum gesetzt", done: Boolean(expiresAtInput) },
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
        </aside>
      </section>
    </div>
  );
}
