import type { PaymentMode, ProfileStatus } from "@routeforge/shared";

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

export const adminCourierFilterGroups: AdminCourierFilterGroup[] = [
  { label: "Depot", value: "Alle Depots" },
  { label: "Status", value: "Alle Status" },
  { label: "Zahlungsart", value: "Alle Zahlungsarten" },
];

export const adminCourierListItems: AdminCourierListItem[] = [
  {
    id: "KUR-10458",
    initials: "NW",
    fullName: "Nico Weber",
    email: "nico.weber@example.de",
    phone: "+49 621 104580",
    depotName: "Mannheim Nord",
    depotCode: "MA-N",
    status: "active",
    statusLabel: "Aktiv",
    statusTone: "success",
    paymentMode: "hourly",
    paymentModeLabel: "Stundenlohn",
    lastShiftLabel: "1. Juli 2026",
    lastShiftDetail: "In Pruefung - 10:00 h",
    documentsState: "review",
    documentsLabel: "Pruefen",
    documentsTone: "warning",
    invitationLabel: "Angenommen",
    href: "/admin/couriers/KUR-10458",
  },
  {
    id: "KUR-10412",
    initials: "ED",
    fullName: "Elena Dimitrova",
    email: "elena.dimitrova@example.de",
    phone: "+49 621 104120",
    depotName: "Mannheim Sued",
    depotCode: "MA-S",
    status: "active",
    statusLabel: "Aktiv",
    statusTone: "success",
    paymentMode: "daily_fixed",
    paymentModeLabel: "Tagespauschale",
    lastShiftLabel: "1. Juli 2026",
    lastShiftDetail: "Eingereicht - 08:20 h",
    documentsState: "complete",
    documentsLabel: "Vollstaendig",
    documentsTone: "success",
    invitationLabel: "Angenommen",
    href: "/admin/couriers/KUR-10412",
  },
  {
    id: "KUR-10387",
    initials: "SP",
    fullName: "Sofia Petrovic",
    email: "sofia.petrovic@example.de",
    phone: "+49 621 103870",
    depotName: "Mannheim Sued",
    depotCode: "MA-S",
    status: "active",
    statusLabel: "Aktiv",
    statusTone: "success",
    paymentMode: "daily_fixed",
    paymentModeLabel: "Tagespauschale",
    lastShiftLabel: "1. Juli 2026",
    lastShiftDetail: "Eingereicht - 08:20 h",
    documentsState: "missing",
    documentsLabel: "Fehlt",
    documentsTone: "error",
    invitationLabel: "Angenommen",
    href: "/admin/couriers/KUR-10387",
  },
  {
    id: "KUR-10231",
    initials: "AY",
    fullName: "Ahmet Yilmaz",
    email: "ahmet.yilmaz@example.de",
    phone: "+49 621 102310",
    depotName: "Mannheim Nord",
    depotCode: "MA-N",
    status: "active",
    statusLabel: "Aktiv",
    statusTone: "success",
    paymentMode: "hourly",
    paymentModeLabel: "Stundenlohn",
    lastShiftLabel: "30. Juni 2026",
    lastShiftDetail: "Genehmigt - 07:27 h",
    documentsState: "complete",
    documentsLabel: "Vollstaendig",
    documentsTone: "success",
    invitationLabel: "Angenommen",
    href: "/admin/couriers/KUR-10231",
  },
  {
    id: "KUR-10344",
    initials: "MR",
    fullName: "Maria Rossi",
    email: "maria.rossi@example.de",
    phone: "+49 621 103440",
    depotName: "Heidelberg",
    depotCode: "HD",
    status: "suspended",
    statusLabel: "Gesperrt",
    statusTone: "error",
    paymentMode: "hourly",
    paymentModeLabel: "Stundenlohn",
    lastShiftLabel: "30. Juni 2026",
    lastShiftDetail: "Abgelehnt - GPS fehlt",
    documentsState: "review",
    documentsLabel: "Pruefen",
    documentsTone: "warning",
    invitationLabel: "Angenommen",
    href: "/admin/couriers/KUR-10344",
  },
  {
    id: "KUR-10491",
    initials: "LS",
    fullName: "Lukas Schneider",
    email: "lukas.schneider@example.de",
    phone: "+49 6221 104910",
    depotName: "Heidelberg",
    depotCode: "HD",
    status: "inactive",
    statusLabel: "Inaktiv",
    statusTone: "neutral",
    paymentMode: "hourly",
    paymentModeLabel: "Stundenlohn",
    lastShiftLabel: "28. Juni 2026",
    lastShiftDetail: "Genehmigt - 06:45 h",
    documentsState: "complete",
    documentsLabel: "Vollstaendig",
    documentsTone: "success",
    invitationLabel: "Angenommen",
    href: "/admin/couriers/KUR-10491",
  },
  {
    id: "KUR-10506",
    initials: "VD",
    fullName: "Viktor Dimitrov",
    email: "viktor.dimitrov@example.de",
    phone: "+49 621 105060",
    depotName: "Mannheim Nord",
    depotCode: "MA-N",
    status: "pending_approval",
    statusLabel: "Wartet auf Freigabe",
    statusTone: "warning",
    paymentMode: "daily_fixed",
    paymentModeLabel: "Tagespauschale",
    lastShiftLabel: "Keine Schicht",
    lastShiftDetail: "Profil muss freigegeben werden",
    documentsState: "missing",
    documentsLabel: "Fehlt",
    documentsTone: "error",
    invitationLabel: "Gesendet",
    href: "/admin/couriers/KUR-10506",
  },
];

export const adminCourierSummary = {
  total: adminCourierListItems.length,
  active: adminCourierListItems.filter((courier) => courier.status === "active")
    .length,
  pendingApproval: adminCourierListItems.filter(
    (courier) => courier.status === "pending_approval",
  ).length,
  documentIssues: adminCourierListItems.filter(
    (courier) => courier.documentsState !== "complete",
  ).length,
};
