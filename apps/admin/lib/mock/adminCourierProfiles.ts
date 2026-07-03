import {
  adminCourierListItems,
  type AdminCourierListItem,
  type AdminCourierTone,
} from "@/lib/mock/adminCouriers";

export type AdminCourierProfileInfoItem = {
  label: string;
  value: string;
  helper?: string;
  tone?: AdminCourierTone;
};

export type AdminCourierProfileDocument = {
  title: string;
  detail: string;
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

const profileOverrides: Record<string, Partial<AdminCourierProfile>> = {
  "KUR-10458": {
    approvedAt: "18. Juni 2026, 09:15",
    approvedBy: "Nikolay Ivanov",
    address: "Brunnenstrasse 18, 10119 Berlin",
    lastLoginLabel: "Heute, 06:01",
  },
  "KUR-10506": {
    approvedAt: "Noch nicht freigegeben",
    approvedBy: "Ausstehend",
    lastLoginLabel: "Noch kein Login",
    invitationStatusLabel: "Gesendet",
  },
  "KUR-10344": {
    lastLoginLabel: "30. Juni 2026, 07:51",
  },
};

function buildDefaultProfile(courier: AdminCourierListItem): AdminCourierProfile {
  const override = profileOverrides[courier.id];

  return {
    ...courier,
    address: override?.address ?? "Industriestrasse 21, 68169 Mannheim",
    approvedAt:
      override?.approvedAt ??
      (courier.status === "pending_approval"
        ? "Noch nicht freigegeben"
        : "12. Juni 2026, 10:30"),
    approvedBy:
      override?.approvedBy ??
      (courier.status === "pending_approval" ? "Ausstehend" : "Admin Demo"),
    createdAt: "10. Juni 2026, 09:15",
    dailyFixedMinutesLabel: "08:20 h Standard",
    hourlyMaxLabel: "10:00 h Cap",
    invitationStatusLabel: override?.invitationStatusLabel ?? "Angenommen",
    lastLoginLabel: override?.lastLoginLabel ?? "Heute, 05:48",
    languageLabel: "Deutsch",
    personalData: [
      { label: "Telefon", value: courier.phone },
      { label: "E-Mail", value: courier.email },
      { label: "Adresse", value: override?.address ?? "Industriestrasse 21" },
      { label: "Sprache", value: "Deutsch" },
    ],
    accountData: [
      { label: "Kurier-ID", value: courier.id },
      { label: "Profilstatus", value: courier.statusLabel, tone: courier.statusTone },
      { label: "Einladung", value: override?.invitationStatusLabel ?? "Angenommen" },
      { label: "Letzter Login", value: override?.lastLoginLabel ?? "Heute, 05:48" },
    ],
    paymentData: [
      { label: "Zahlungsart", value: courier.paymentModeLabel },
      {
        label: "Stundenregel",
        value:
          courier.paymentMode === "hourly"
            ? "Maximal 10:00 h abrechenbar"
            : "Realzeit wird weiter gespeichert",
      },
      {
        label: "Tagespauschale",
        value:
          courier.paymentMode === "daily_fixed"
            ? "08:20 h Standard"
            : "Nicht aktiv",
      },
      { label: "Override-Regel", value: "Nur mit Grund und Audit Log" },
    ],
    depotAccess: [
      {
        name: courier.depotName,
        code: courier.depotCode,
        roleLabel: "Primaeres Depot",
        accessLabel: "Vollzugriff",
        tone: "success",
      },
      {
        name: "Mannheim Nord",
        code: "MA-N",
        roleLabel: "Ersatzdepot",
        accessLabel: "Nur Schichten",
        tone: courier.depotCode === "MA-N" ? "success" : "info",
      },
    ],
    documents: [
      {
        title: "Fuehrerschein",
        detail: "Gueltig bis 20.06.2028",
        statusLabel: courier.documentsState === "missing" ? "Fehlt" : "Gueltig",
        tone: courier.documentsState === "missing" ? "error" : "success",
      },
      {
        title: "Personalausweis",
        detail: "Gueltig bis 11.03.2030",
        statusLabel: "Gueltig",
        tone: "success",
      },
      {
        title: "Adressnachweis",
        detail: "Pruefung durch Admin",
        statusLabel: courier.documentsState === "review" ? "Pruefen" : "Gueltig",
        tone: courier.documentsState === "review" ? "warning" : "success",
      },
      {
        title: "IBAN-Nachweis",
        detail: "Private Ablage",
        statusLabel: courier.documentsState === "missing" ? "Fehlt" : "Gueltig",
        tone: courier.documentsState === "missing" ? "error" : "success",
      },
    ],
    recentShifts: [
      {
        id: "SR-2026-07-01-0842",
        date: "1. Juli 2026",
        depot: courier.depotName,
        duration: "10:13 h",
        billable: courier.paymentMode === "hourly" ? "10:00 h" : "08:20 h",
        statusLabel: "In Pruefung",
        tone: "warning",
        href: "/admin/shifts/SR-2026-07-01-0842",
      },
      {
        id: "SR-2026-06-30-0668",
        date: "30. Juni 2026",
        depot: courier.depotName,
        duration: "07:42 h",
        billable: courier.paymentMode === "hourly" ? "07:27 h" : "08:20 h",
        statusLabel: "Genehmigt",
        tone: "success",
        href: "/admin/shifts/SR-2026-06-30-0668",
      },
      {
        id: "SR-2026-06-29-0511",
        date: "29. Juni 2026",
        depot: courier.depotName,
        duration: "08:04 h",
        billable: courier.paymentMode === "hourly" ? "07:49 h" : "08:20 h",
        statusLabel: "Genehmigt",
        tone: "success",
        href: "/admin/shifts/SR-2026-07-01-0774",
      },
    ],
    notes: [
      {
        author: "Admin Demo",
        date: "1. Juli 2026",
        text: "Dokumentenstatus vor der naechsten Monatsabrechnung erneut pruefen.",
      },
      {
        author: "System",
        date: "30. Juni 2026",
        text: "Geofence-Hinweise stammen nur aus Start- und Stopp-Standorten.",
      },
    ],
    accessHistory: [
      {
        time: "Heute, 10:22",
        actor: "System",
        action: "Profil fuer Adminansicht geladen",
      },
      {
        time: "18. Juni 2026, 09:15",
        actor: "Nikolay Ivanov",
        action:
          courier.status === "pending_approval"
            ? "Freigabe noch ausstehend"
            : "Kurierprofil freigegeben",
      },
      {
        time: "10. Juni 2026, 09:15",
        actor: "Einladung",
        action: "Kurierkonto aus Einladung erstellt",
      },
    ],
  };
}

export function getAdminCourierProfile(id: string): AdminCourierProfile | null {
  const courier = adminCourierListItems.find((item) => item.id === id);

  if (!courier) {
    return null;
  }

  return buildDefaultProfile(courier);
}
