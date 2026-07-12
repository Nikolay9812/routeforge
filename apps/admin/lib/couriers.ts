import type {
  AuditLog,
  Depot,
  Document,
  PaymentMode,
  Profile,
  ProfileStatus,
  Shift,
} from "@routeforge/shared";

export type AdminCourierTone =
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "neutral";

export type AdminCourierDocumentState = "complete" | "missing" | "review";

export type AdminCourierListItem = {
  id: string;
  initials: string;
  fullName: string;
  email: string;
  phone: string;
  depotName: string;
  depotCode: string;
  status: ProfileStatus;
  statusLabel: string;
  statusTone: AdminCourierTone;
  paymentMode: PaymentMode;
  paymentModeLabel: string;
  lastShiftLabel: string;
  lastShiftDetail: string;
  documentsState: AdminCourierDocumentState;
  documentsLabel: string;
  documentsTone: AdminCourierTone;
  invitationLabel: string;
  href: string;
};

export type AdminCourierFilterGroup = {
  label: string;
  value: string;
};

export type AdminCourierSummary = {
  active: number;
  documentIssues: number;
  pendingApproval: number;
  total: number;
};

export type AdminCourierProfileInfoItem = {
  label: string;
  value: string;
  helper?: string;
  tone?: AdminCourierTone;
};

export type AdminCourierProfileDocument = {
  title: string;
  detail: string;
  previewUrl: string | null;
  statusLabel: string;
  tone: AdminCourierTone;
};

export type AdminCourierProfileShift = {
  id: string;
  date: string;
  depot: string;
  duration: string;
  billable: string;
  statusLabel: string;
  tone: AdminCourierTone;
  href: string;
};

export type AdminCourierDepotAccess = {
  name: string;
  code: string;
  roleLabel: string;
  accessLabel: string;
  tone: AdminCourierTone;
};

export type AdminCourierProfileNote = {
  author: string;
  date: string;
  text: string;
};

export type AdminCourierProfileAuditItem = {
  time: string;
  actor: string;
  action: string;
  reason?: string;
};

export type AdminCourierProfile = AdminCourierListItem & {
  address: string;
  approvedAt: string;
  approvedBy: string;
  createdAt: string;
  dailyFixedMinutesLabel: string;
  hourlyMaxLabel: string;
  invitationStatusLabel: string;
  lastLoginLabel: string;
  languageLabel: string;
  personalData: AdminCourierProfileInfoItem[];
  accountData: AdminCourierProfileInfoItem[];
  paymentData: AdminCourierProfileInfoItem[];
  depotAccess: AdminCourierDepotAccess[];
  documents: AdminCourierProfileDocument[];
  recentShifts: AdminCourierProfileShift[];
  notes: AdminCourierProfileNote[];
  accessHistory: AdminCourierProfileAuditItem[];
};

export type AdminCourierApprovalState = {
  accessHistory: AdminCourierProfileAuditItem[];
  approvedAt: string;
  approvedBy: string;
  invitationStatusLabel: string;
  status: ProfileStatus;
  statusLabel: string;
  statusTone: AdminCourierTone;
};

export const adminCourierFilterGroups: AdminCourierFilterGroup[] = [
  { label: "Depot", value: "Alle Depots" },
  { label: "Status", value: "Alle Status" },
  { label: "Zahlungsart", value: "Alle Zahlungsarten" },
];

type ShiftSummary = Pick<
  Shift,
  "billable_minutes" | "courier_profile_id" | "id" | "net_minutes" | "shift_date" | "status"
>;

export function getAdminCourierSummary(
  couriers: AdminCourierListItem[],
): AdminCourierSummary {
  return {
    active: couriers.filter((courier) => courier.status === "active").length,
    documentIssues: couriers.filter(
      (courier) => courier.documentsState !== "complete",
    ).length,
    pendingApproval: couriers.filter(
      (courier) => courier.status === "pending_approval",
    ).length,
    total: couriers.length,
  };
}

export function formatAdminCourierListItem({
  depot,
  lastShift,
  profile,
}: {
  depot: Pick<Depot, "code" | "name"> | null;
  lastShift: ShiftSummary | null;
  profile: Profile;
}): AdminCourierListItem {
  const documentState = getDocumentState(profile);

  return {
    id: profile.id,
    depotCode: depot?.code ?? "-",
    depotName: depot?.name ?? "Depot offen",
    documentsLabel: getDocumentLabel(documentState),
    documentsState: documentState,
    documentsTone: getDocumentTone(documentState),
    email: profile.email,
    fullName: profile.full_name,
    href: `/admin/couriers/${profile.id}`,
    initials: buildInitials(profile.full_name),
    invitationLabel: getInvitationLabel(profile.status),
    lastShiftDetail: getLastShiftDetail(profile, lastShift),
    lastShiftLabel: lastShift ? formatDate(lastShift.shift_date) : "Keine Schicht",
    paymentMode: profile.payment_mode,
    paymentModeLabel: getPaymentModeLabel(profile.payment_mode),
    phone: profile.phone ?? "-",
    status: profile.status,
    statusLabel: getStatusLabel(profile.status),
    statusTone: getStatusTone(profile.status),
  };
}

export function formatAdminCourierProfile({
  approvalActor,
  auditLogs,
  depot,
  profile,
  profileDocuments = [],
  recentShifts,
}: {
  approvalActor: Pick<Profile, "full_name"> | null;
  auditLogs: AuditLog[];
  depot: Pick<Depot, "code" | "name"> | null;
  profile: Profile;
  profileDocuments?: Document[];
  recentShifts: ShiftSummary[];
}): AdminCourierProfile {
  const base = formatAdminCourierListItem({
    depot,
    lastShift: recentShifts[0] ?? null,
    profile,
  });
  const address = [profile.address_line_1, profile.postal_code, profile.city]
    .filter(Boolean)
    .join(", ");
  const documents = buildDocuments(profile, profileDocuments);
  const approvedBy = profile.approved_by
    ? approvalActor?.full_name ?? "Admin"
    : "Ausstehend";

  return {
    ...base,
    accessHistory: buildAccessHistory({ auditLogs, profile }),
    accountData: [
      { label: "Kurier-ID", value: profile.id },
      { label: "Profilstatus", value: base.statusLabel, tone: base.statusTone },
      { label: "Einladung", value: getInvitationLabel(profile.status) },
      { label: "Letzter Login", value: "Noch nicht synchronisiert" },
    ],
    address: address || "Nicht hinterlegt",
    approvedAt: profile.approved_at
      ? formatDateTime(profile.approved_at)
      : "Noch nicht freigegeben",
    approvedBy,
    createdAt: formatDateTime(profile.created_at),
    dailyFixedMinutesLabel: `${formatMinutes(profile.daily_fixed_minutes)} Standard`,
    depotAccess: [
      {
        accessLabel: profile.primary_depot_id ? "Primaeres Depot" : "Offen",
        code: depot?.code ?? "-",
        name: depot?.name ?? "Depot offen",
        roleLabel: "Kurier",
        tone: profile.primary_depot_id ? "success" : "warning",
      },
    ],
    documents,
    hourlyMaxLabel: `${formatMinutes(profile.hourly_max_minutes)} Cap`,
    invitationStatusLabel: getInvitationLabel(profile.status),
    languageLabel: profile.preferred_language === "bg" ? "Bulgarisch" : "Deutsch",
    lastLoginLabel: "Noch nicht synchronisiert",
    notes: [
      {
        author: "System",
        date: formatDateTime(profile.updated_at),
        text: "Profilstatus wird aus InsForge geladen. Statusaenderungen muessen auditierbar gespeichert werden.",
      },
    ],
    paymentData: [
      { label: "Zahlungsart", value: getPaymentModeLabel(profile.payment_mode) },
      {
        label: "Stundenregel",
        value:
          profile.payment_mode === "hourly"
            ? `Maximal ${formatMinutes(profile.hourly_max_minutes)} abrechenbar`
            : "Realzeit wird weiter gespeichert",
      },
      {
        label: "Tagespauschale",
        value:
          profile.payment_mode === "daily_fixed"
            ? `${formatMinutes(profile.daily_fixed_minutes)} Standard`
            : "Nicht aktiv",
      },
      { label: "Override-Regel", value: "Nur mit Grund und Audit Log" },
    ],
    personalData: [
      { label: "Telefon", value: profile.phone ?? "Nicht hinterlegt" },
      { label: "E-Mail", value: profile.email },
      { label: "Adresse", value: address || "Nicht hinterlegt" },
      {
        label: "Sprache",
        value: profile.preferred_language === "bg" ? "Bulgarisch" : "Deutsch",
      },
    ],
    recentShifts: recentShifts.map((shift) =>
      formatProfileShift({
        depotName: depot?.name ?? "Depot offen",
        shift,
      }),
    ),
  };
}

export function formatAdminCourierApprovalState({
  actorName,
  existingHistory,
  profile,
}: {
  actorName: string;
  existingHistory: AdminCourierProfileAuditItem[];
  profile: Profile;
}): AdminCourierApprovalState {
  const approvedAt = profile.approved_at
    ? formatDateTime(profile.approved_at)
    : "Gerade eben";

  return {
    accessHistory: [
      {
        action: "Kurierprofil freigegeben",
        actor: actorName,
        reason: "courier_approved wurde serverseitig mit Audit Log gespeichert.",
        time: approvedAt,
      },
      ...existingHistory,
    ],
    approvedAt,
    approvedBy: actorName,
    invitationStatusLabel: getInvitationLabel(profile.status),
    status: profile.status,
    statusLabel: getStatusLabel(profile.status),
    statusTone: getStatusTone(profile.status),
  };
}

function buildAccessHistory({
  auditLogs,
  profile,
}: {
  auditLogs: AuditLog[];
  profile: Profile;
}): AdminCourierProfileAuditItem[] {
  const mappedLogs = auditLogs.map((log) => ({
    action: getAuditActionLabel(log.action),
    actor: log.actor_profile_id,
    reason: log.reason ?? undefined,
    time: formatDateTime(log.created_at),
  }));

  return [
    ...mappedLogs,
    {
      action: "Kurierkonto aus Einladung erstellt",
      actor: "System",
      time: formatDateTime(profile.created_at),
    },
  ];
}

type ProfileDocumentKind = "bank" | "driver_license" | "id_card" | "registration";

function buildDocuments(
  profile: Profile,
  profileDocuments: Document[],
): AdminCourierProfileDocument[] {
  return [
    buildProfileDocumentCard({
      documentKind: "driver_license",
      profile,
      profileDocuments,
      reference: profile.driver_license_document_url,
      title: "Fuehrerschein",
    }),
    buildProfileDocumentCard({
      documentKind: "id_card",
      profile,
      profileDocuments,
      reference: profile.id_card_document_url,
      title: "Personalausweis",
    }),
    buildProfileDocumentCard({
      documentKind: "registration",
      profile,
      profileDocuments,
      reference: profile.registration_document_url,
      title: "Adressnachweis",
    }),
    buildProfileDocumentCard({
      documentKind: "bank",
      profile,
      profileDocuments,
      reference: profile.bank_document_url,
      title: "IBAN-Nachweis",
    }),
  ];
}

function buildProfileDocumentCard({
  documentKind,
  profile,
  profileDocuments,
  reference,
  title,
}: {
  documentKind: ProfileDocumentKind;
  profile: Profile;
  profileDocuments: Document[];
  reference: string | null;
  title: string;
}): AdminCourierProfileDocument {
  const document = getLatestProfileDocument(profileDocuments, documentKind);
  const hasDocument = Boolean(reference || document);

  return {
    detail: document
      ? `Foto - ${formatDateTime(document.created_at)}`
      : hasDocument
        ? "Private Ablage vorhanden"
        : "Noch nicht hochgeladen",
    previewUrl: document
      ? `/api/couriers/${profile.id}/documents/${document.id}/preview`
      : null,
    statusLabel: hasDocument ? "Vorhanden" : "Fehlt",
    title,
    tone: hasDocument ? "success" : "error",
  };
}

function getLatestProfileDocument(
  documents: Document[],
  documentKind: ProfileDocumentKind,
): Document | null {
  const expectedTitle = getProfileDocumentTitle(documentKind);

  return (
    documents.find(
      (document) =>
        document.title === expectedTitle ||
        document.storage_path.includes(`/docs/${documentKind}-`),
    ) ?? null
  );
}

function getProfileDocumentTitle(documentKind: ProfileDocumentKind): string {
  const titles: Record<ProfileDocumentKind, string> = {
    bank: "Profil - IBAN-Nachweis",
    driver_license: "Profil - Fuehrerschein",
    id_card: "Profil - Personalausweis",
    registration: "Profil - Adressnachweis",
  };

  return titles[documentKind];
}

function buildInitials(name: string): string {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "RF";
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(remainder).padStart(2, "0")} h`;
}

function formatProfileShift({
  depotName,
  shift,
}: {
  depotName: string;
  shift: ShiftSummary;
}): AdminCourierProfileShift {
  return {
    billable: formatMinutes(shift.billable_minutes),
    date: formatDate(shift.shift_date),
    depot: depotName,
    duration: formatMinutes(shift.net_minutes),
    href: `/admin/shifts/${shift.id}`,
    id: shift.id,
    statusLabel: getShiftStatusLabel(shift.status),
    tone: getShiftStatusTone(shift.status),
  };
}

function getAuditActionLabel(action: string): string {
  if (action === "courier_approved") {
    return "Kurierprofil freigegeben";
  }

  if (action === "invitation_used") {
    return "Einladung verwendet";
  }

  return action;
}

function getDocumentLabel(state: AdminCourierDocumentState): string {
  if (state === "complete") {
    return "Vollstaendig";
  }

  if (state === "review") {
    return "Pruefen";
  }

  return "Fehlt";
}

function getDocumentState(profile: Profile): AdminCourierDocumentState {
  const documentCount = [
    profile.bank_document_url,
    profile.driver_license_document_url,
    profile.id_card_document_url,
    profile.registration_document_url,
  ].filter(Boolean).length;

  if (documentCount === 4) {
    return "complete";
  }

  if (documentCount > 0) {
    return "review";
  }

  return "missing";
}

function getDocumentTone(state: AdminCourierDocumentState): AdminCourierTone {
  if (state === "complete") {
    return "success";
  }

  if (state === "review") {
    return "warning";
  }

  return "error";
}

function getInvitationLabel(status: ProfileStatus): string {
  if (status === "pending_approval") {
    return "Wartet auf Freigabe";
  }

  if (status === "active") {
    return "Angenommen";
  }

  return "Zugang eingeschraenkt";
}

function getLastShiftDetail(profile: Profile, lastShift: ShiftSummary | null): string {
  if (!lastShift) {
    return profile.status === "pending_approval"
      ? "Profil muss freigegeben werden"
      : "Noch keine Schicht gespeichert";
  }

  return `${getShiftStatusLabel(lastShift.status)} - ${formatMinutes(lastShift.billable_minutes)}`;
}

function getPaymentModeLabel(paymentMode: PaymentMode): string {
  return paymentMode === "hourly" ? "Stundenlohn" : "Tagespauschale";
}

function getShiftStatusLabel(status: Shift["status"]): string {
  if (status === "draft") {
    return "Entwurf";
  }

  if (status === "submitted") {
    return "Eingereicht";
  }

  if (status === "under_review") {
    return "In Pruefung";
  }

  if (status === "approved") {
    return "Genehmigt";
  }

  if (status === "rejected") {
    return "Abgelehnt";
  }

  return "Korrigiert";
}

function getShiftStatusTone(status: Shift["status"]): AdminCourierTone {
  if (status === "approved") {
    return "success";
  }

  if (status === "rejected") {
    return "error";
  }

  if (status === "submitted" || status === "under_review") {
    return "warning";
  }

  return "neutral";
}

function getStatusLabel(status: ProfileStatus): string {
  if (status === "active") {
    return "Aktiv";
  }

  if (status === "pending_approval") {
    return "Wartet auf Freigabe";
  }

  if (status === "suspended") {
    return "Gesperrt";
  }

  return "Inaktiv";
}

function getStatusTone(status: ProfileStatus): AdminCourierTone {
  if (status === "active") {
    return "success";
  }

  if (status === "pending_approval") {
    return "warning";
  }

  if (status === "suspended") {
    return "error";
  }

  return "neutral";
}
