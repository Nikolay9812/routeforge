"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { AdminCourierTone } from "@/lib/mock/adminCouriers";
import type {
  AdminCourierDepotAccess,
  AdminCourierProfile,
  AdminCourierProfileAuditItem,
  AdminCourierProfileDocument,
  AdminCourierProfileInfoItem,
  AdminCourierProfileNote,
  AdminCourierProfileShift,
} from "@/lib/mock/adminCourierProfiles";
import type { ProfileStatus } from "@routeforge/shared";

type CourierProfileApprovalViewProps = {
  courier: AdminCourierProfile;
};

type ApprovalState = {
  accessHistory: AdminCourierProfileAuditItem[];
  approvedAt: string;
  approvedBy: string;
  invitationStatusLabel: string;
  status: ProfileStatus;
  statusLabel: string;
  statusTone: AdminCourierTone;
};

const localApprovalTimestamp = "4. Juli 2026, gerade eben";
const localApprovalActor = "Admin Demo";

const toneClasses: Record<
  AdminCourierTone,
  {
    badge: string;
    dot: string;
    panel: string;
    soft: string;
    text: string;
  }
> = {
  primary: {
    badge: "bg-primary-lightest text-primary-darker",
    dot: "bg-primary",
    panel: "border-primary-light bg-primary-lightest",
    soft: "border-primary-light bg-primary-lightest",
    text: "text-primary-darker",
  },
  info: {
    badge: "bg-info-lightest text-info-foreground",
    dot: "bg-info",
    panel: "border-info-light bg-info-lightest",
    soft: "border-info-light bg-info-lightest",
    text: "text-info-foreground",
  },
  success: {
    badge: "bg-success-lightest text-success-foreground",
    dot: "bg-success",
    panel: "border-success-light bg-success-lightest",
    soft: "border-success-light bg-success-lightest",
    text: "text-success-foreground",
  },
  warning: {
    badge: "bg-warning-lightest text-warning-foreground",
    dot: "bg-warning",
    panel: "border-warning-light bg-warning-lightest",
    soft: "border-warning-light bg-warning-lightest",
    text: "text-warning-foreground",
  },
  error: {
    badge: "bg-error-lightest text-error-foreground",
    dot: "bg-error",
    panel: "border-error-light bg-error-lightest",
    soft: "border-error-light bg-error-lightest",
    text: "text-error-foreground",
  },
  neutral: {
    badge: "bg-neutral-light text-neutral-foreground",
    dot: "bg-neutral",
    panel: "border-border bg-neutral-light",
    soft: "border-border bg-neutral-light",
    text: "text-neutral-foreground",
  },
};

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: AdminCourierTone;
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
  action,
  children,
  title,
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function InfoList({ items }: { items: AdminCourierProfileInfoItem[] }) {
  return (
    <dl className="mt-5 grid gap-4">
      {items.map((item) => (
        <div
          className="flex flex-wrap items-start justify-between gap-3 border-b border-border-light pb-3 last:border-b-0 last:pb-0"
          key={item.label}
        >
          <dt className="text-sm font-medium text-text-secondary">
            {item.label}
          </dt>
          <dd className="text-right">
            {item.tone ? (
              <StatusBadge label={item.value} tone={item.tone} />
            ) : (
              <span className="text-sm font-semibold text-text-primary">
                {item.value}
              </span>
            )}
            {item.helper ? (
              <span className="mt-1 block text-xs font-medium text-text-muted">
                {item.helper}
              </span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function DocumentsGrid({
  documents,
}: {
  documents: AdminCourierProfileDocument[];
}) {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {documents.map((document) => (
        <div
          className="rounded-xl border border-border-light bg-surface-secondary p-4"
          key={document.title}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-lightest text-primary">
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M6 20h12a2 2 0 0 0 2-2V8l-6-6H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" />
              <path d="M14 2v6h6" />
            </svg>
          </div>
          <p className="mt-4 text-sm font-semibold text-text-primary">
            {document.title}
          </p>
          <p className="mt-1 text-xs font-medium text-text-secondary">
            {document.detail}
          </p>
          <span
            className={`mt-4 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[document.tone].badge}`}
          >
            {document.statusLabel}
          </span>
        </div>
      ))}
    </div>
  );
}

function RecentShiftsTable({ shifts }: { shifts: AdminCourierProfileShift[] }) {
  return (
    <div className="mt-5 overflow-x-auto">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-[0.9fr_1fr_0.8fr_0.8fr_0.8fr_0.7fr] rounded-t-xl bg-surface-secondary px-4 py-3 text-xs font-semibold uppercase text-text-subtle">
          <span>Datum</span>
          <span>Schicht</span>
          <span>Depot</span>
          <span>Dauer</span>
          <span>Abrechenbar</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-border-light rounded-b-xl border-x border-b border-border-light">
          {shifts.map((shift) => (
            <Link
              className="grid grid-cols-[0.9fr_1fr_0.8fr_0.8fr_0.8fr_0.7fr] px-4 py-3 text-sm text-text-primary transition hover:bg-surface-secondary"
              href={shift.href}
              key={shift.id}
            >
              <span className="font-semibold">{shift.date}</span>
              <span className="font-medium text-text-secondary">{shift.id}</span>
              <span>{shift.depot}</span>
              <span>{shift.duration}</span>
              <span>{shift.billable}</span>
              <span>
                <StatusBadge label={shift.statusLabel} tone={shift.tone} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function DepotAccessList({ depots }: { depots: AdminCourierDepotAccess[] }) {
  return (
    <div className="mt-5 divide-y divide-border-light">
      {depots.map((depot) => (
        <div
          className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          key={`${depot.code}-${depot.roleLabel}`}
        >
          <div>
            <p className="text-sm font-semibold text-text-primary">
              {depot.name}
            </p>
            <p className="mt-1 text-xs font-medium text-text-secondary">
              {depot.code} - {depot.roleLabel}
            </p>
          </div>
          <StatusBadge label={depot.accessLabel} tone={depot.tone} />
        </div>
      ))}
    </div>
  );
}

function NotesList({ notes }: { notes: AdminCourierProfileNote[] }) {
  return (
    <div className="mt-5 flex flex-col gap-3">
      {notes.map((note) => (
        <div
          className="rounded-xl border border-border-light bg-surface-secondary p-4"
          key={`${note.author}-${note.date}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-text-primary">
              {note.author}
            </p>
            <p className="text-xs font-medium text-text-muted">{note.date}</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {note.text}
          </p>
        </div>
      ))}
    </div>
  );
}

function AuditList({ items }: { items: AdminCourierProfileAuditItem[] }) {
  return (
    <div className="mt-5 divide-y divide-border-light">
      {items.map((item) => (
        <div
          className="py-3 first:pt-0 last:pb-0"
          key={`${item.time}-${item.action}`}
        >
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

function replaceInfoItem(
  items: AdminCourierProfileInfoItem[],
  label: string,
  nextItem: AdminCourierProfileInfoItem,
): AdminCourierProfileInfoItem[] {
  return items.map((item) => (item.label === label ? nextItem : item));
}

function buildInitialApprovalState(
  courier: AdminCourierProfile,
): ApprovalState {
  return {
    accessHistory: courier.accessHistory,
    approvedAt: courier.approvedAt,
    approvedBy: courier.approvedBy,
    invitationStatusLabel: courier.invitationStatusLabel,
    status: courier.status,
    statusLabel: courier.statusLabel,
    statusTone: courier.statusTone,
  };
}

function buildApprovedAccessHistory(
  currentHistory: AdminCourierProfileAuditItem[],
): AdminCourierProfileAuditItem[] {
  return [
    {
      time: localApprovalTimestamp,
      actor: localApprovalActor,
      action: "Kurierprofil lokal freigegeben",
      reason:
        "Mock-Aktion courier_approved: pending_approval zu active. Der echte Server muss company_id, Rolle, Depot-Scope und Audit-Log pruefen.",
    },
    ...currentHistory,
  ];
}

export function CourierProfileApprovalView({
  courier,
}: CourierProfileApprovalViewProps) {
  const [approvalState, setApprovalState] = useState<ApprovalState>(() =>
    buildInitialApprovalState(courier),
  );
  const canApprove = approvalState.status === "pending_approval";
  const wasApprovedLocally =
    approvalState.status === "active" &&
    approvalState.approvedAt === localApprovalTimestamp;
  const approvalButtonLabel = canApprove
    ? "Freigeben"
    : approvalState.status === "active"
      ? "Freigegeben"
      : "Nicht freigebbar";
  const personalData = courier.personalData;
  const accountData = useMemo(() => {
    const withStatus = replaceInfoItem(courier.accountData, "Profilstatus", {
      label: "Profilstatus",
      value: approvalState.statusLabel,
      tone: approvalState.statusTone,
    });

    return replaceInfoItem(withStatus, "Einladung", {
      label: "Einladung",
      value: approvalState.invitationStatusLabel,
    });
  }, [
    approvalState.invitationStatusLabel,
    approvalState.statusLabel,
    approvalState.statusTone,
    courier.accountData,
  ]);

  function handleApprove(): void {
    if (!canApprove) {
      return;
    }

    setApprovalState((currentState) => ({
      accessHistory: buildApprovedAccessHistory(currentState.accessHistory),
      approvedAt: localApprovalTimestamp,
      approvedBy: localApprovalActor,
      invitationStatusLabel: "Angenommen",
      status: "active",
      statusLabel: "Aktiv",
      statusTone: "success",
    }));
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-text-secondary">
              <Link className="text-primary" href="/admin/couriers">
                Kuriere
              </Link>
              <span className="text-text-muted">/</span>
              <span>Kurierprofil</span>
              <span className="text-text-muted">/</span>
              <span className="text-text-muted">{courier.id}</span>
            </nav>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold leading-[38px] text-text-primary">
                {courier.fullName}
              </h1>
              <StatusBadge
                label={approvalState.statusLabel}
                tone={approvalState.statusTone}
              />
              {wasApprovedLocally ? (
                <span className="inline-flex rounded-full bg-success-lightest px-2.5 py-1 text-xs font-semibold text-success-foreground">
                  Lokal freigegeben
                </span>
              ) : null}
            </div>
            <Link
              className="mt-4 inline-flex h-10 items-center rounded-xl px-3 text-sm font-semibold text-primary transition hover:bg-surface-secondary"
              href="/admin/couriers"
            >
              Zurueck zur Kurierliste
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
              type="button"
            >
              Dokument senden
            </button>
            <button
              className="inline-flex h-10 items-center justify-center rounded-xl bg-error px-4 text-sm font-semibold text-text-inverse transition hover:bg-error-dark"
              type="button"
            >
              Sperren
            </button>
            <button
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground"
              disabled={!canApprove}
              onClick={handleApprove}
              type="button"
            >
              {approvalButtonLabel}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
          <div className="flex flex-col items-center rounded-2xl border border-border-light bg-surface-secondary p-4 text-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-primary-lightest text-3xl font-bold text-primary-darker">
              {courier.initials}
            </div>
            <span
              className={`mt-4 inline-flex h-2.5 w-2.5 rounded-full ${toneClasses[approvalState.statusTone].dot}`}
              aria-hidden="true"
            />
            <p className="mt-2 text-sm font-semibold text-text-primary">
              {approvalState.statusLabel}
            </p>
            <p className="mt-1 text-xs font-medium text-text-muted">
              {approvalState.approvedAt}
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <InfoList items={personalData} />
            <InfoList items={accountData} />
            <InfoList items={courier.paymentData} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border-b border-border-light bg-background px-1">
        <div className="flex flex-wrap gap-2">
          {["Profil", "Schichten", "Dokumente", "Postfach"].map((tab, index) => (
            <span
              className={`inline-flex h-11 items-center rounded-xl px-4 text-sm font-semibold ${
                index === 0
                  ? "bg-primary-lightest text-primary"
                  : "text-text-secondary hover:bg-surface-secondary"
              }`}
              key={tab}
            >
              {tab}
            </span>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)]">
        <div className="flex flex-col gap-6">
          <DetailCard
            action={
              <Link
                className="text-sm font-semibold text-primary"
                href="/admin/shifts"
              >
                Alle Schichten anzeigen
              </Link>
            }
            title="Zuletzt absolvierte Schichten"
          >
            <RecentShiftsTable shifts={courier.recentShifts} />
          </DetailCard>

          <DetailCard
            action={
              <Link
                className="text-sm font-semibold text-primary"
                href="/admin/documents"
              >
                Alle Dokumente anzeigen
              </Link>
            }
            title={`Dokumente (${courier.documents.length})`}
          >
            <DocumentsGrid documents={courier.documents} />
            <p className="mt-4 rounded-xl border border-border-light bg-surface-secondary px-4 py-3 text-xs leading-5 text-text-secondary">
              Dokumente bleiben private Dateien. Download und Upload benoetigen
              spaeter signierte oder authentifizierte Zugriffe.
            </p>
          </DetailCard>

          <DetailCard title="Notizen">
            <NotesList notes={courier.notes} />
          </DetailCard>
        </div>

        <aside className="flex flex-col gap-6">
          <DetailCard
            action={
              <button
                className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
                type="button"
              >
                Bearbeiten
              </button>
            }
            title="Depot-Zugriff"
          >
            <DepotAccessList depots={courier.depotAccess} />
          </DetailCard>

          <DetailCard title="Lokale Freigabe">
            <div className="mt-5 grid gap-3">
              <div
                className={`rounded-xl border px-4 py-3 ${toneClasses[approvalState.statusTone].soft}`}
              >
                <p
                  className={`text-sm font-semibold ${toneClasses[approvalState.statusTone].text}`}
                >
                  {approvalState.statusLabel}
                </p>
                <p className="mt-1 text-xs font-medium leading-5 text-text-secondary">
                  Pending-Profile koennen lokal in den Status aktiv wechseln.
                </p>
              </div>
              <div className="rounded-xl border border-warning-light bg-warning-lightest px-4 py-3">
                <p className="text-sm font-semibold text-warning-foreground">
                  Audit-Vorschau
                </p>
                <p className="mt-1 text-xs font-medium leading-5 text-warning-foreground">
                  Aktion: courier_approved. Backend muss spaeter actor, target,
                  before, after und timestamp schreiben.
                </p>
              </div>
            </div>
          </DetailCard>

          <DetailCard title="Einladung und Konto">
            <InfoList
              items={[
                {
                  label: "Einladung",
                  value: approvalState.invitationStatusLabel,
                  tone:
                    approvalState.status === "pending_approval"
                      ? "warning"
                      : "info",
                },
                { label: "Erstellt", value: courier.createdAt },
                { label: "Freigegeben am", value: approvalState.approvedAt },
                { label: "Freigegeben durch", value: approvalState.approvedBy },
              ]}
            />
          </DetailCard>

          <DetailCard title="Access History">
            <AuditList items={approvalState.accessHistory} />
            <p className="mt-4 rounded-xl border border-warning-light bg-warning-lightest px-4 py-3 text-xs leading-5 text-warning-foreground">
              Freigabe, Sperrung, Depot-Zugriff und Dokument-Uploads muessen
              spaeter serverseitig geprueft und auditierbar gespeichert werden.
            </p>
          </DetailCard>
        </aside>
      </div>
    </div>
  );
}
