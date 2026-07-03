import type { Document, DocumentType, MailboxCategory } from "@routeforge/shared";

export type AdminDocumentTone =
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "neutral";

export type AdminDocumentVisibility = "courier_private" | "depot_scoped" | "company";

export type AdminDocumentStatus = "active" | "draft" | "review";

export type AdminDocumentListItem = Document & {
  courierName: string | null;
  depotName: string;
  documentTypeLabel: string;
  mailboxCategory: MailboxCategory;
  visibility: AdminDocumentVisibility;
  visibilityLabel: string;
  visibilityTone: AdminDocumentTone;
  status: AdminDocumentStatus;
  statusLabel: string;
  statusTone: AdminDocumentTone;
  uploadedAtLabel: string;
  uploadedByName: string;
  fileSizeLabel: string;
  retentionLabel: string;
};

export type AdminDocumentTab = {
  label: string;
  count: number;
  tone: AdminDocumentTone;
};

export type AdminDocumentFilterGroup = {
  label: string;
  value: string;
};

export type AdminDocumentUploadDraft = {
  title: string;
  fileName: string;
  fileType: string;
  fileSizeLabel: string;
  courierName: string;
  depotName: string;
  documentType: DocumentType;
  documentTypeLabel: string;
  storageBucket: Document["storage_bucket"];
  mailboxEnabled: boolean;
  mailboxTitle: string;
  mailboxMessage: string;
  visibilityRows: Array<{
    label: string;
    value: string;
    tone: AdminDocumentTone;
  }>;
  checklist: Array<{
    label: string;
    done: boolean;
  }>;
  auditReminder: string;
};

export const adminDocumentTabs: AdminDocumentTab[] = [
  { label: "Alle Dokumente", count: 6, tone: "primary" },
  { label: "Lohnabrechnungen", count: 2, tone: "success" },
  { label: "Vertraege", count: 1, tone: "info" },
  { label: "Hinweise", count: 2, tone: "warning" },
  { label: "Nachweise", count: 1, tone: "neutral" },
];

export const adminDocumentFilterGroups: AdminDocumentFilterGroup[] = [
  { label: "Dokumenttyp", value: "Alle Typen" },
  { label: "Zielgruppe", value: "Alle Kuriere" },
  { label: "Sichtbarkeit", value: "Alle Sichtbarkeiten" },
];

export const adminDocumentListItems: AdminDocumentListItem[] = [
  {
    id: "DOC-2026-0703-001",
    company_id: "company-ivt",
    courier_profile_id: "KUR-10458",
    uploaded_by: "ADM-10001",
    document_type: "payslip",
    title: "Lohnabrechnung Juni 2026",
    storage_bucket: "payslips",
    storage_path:
      "companies/company-ivt/couriers/KUR-10458/payslips/2026-06.pdf",
    mime_type: "application/pdf",
    size_bytes: 512000,
    created_at: "2026-07-03T08:15:00.000Z",
    courierName: "Nico Weber",
    depotName: "Mannheim Nord",
    documentTypeLabel: "Lohnabrechnung",
    mailboxCategory: "payslip",
    visibility: "courier_private",
    visibilityLabel: "Privat",
    visibilityTone: "success",
    status: "active",
    statusLabel: "Aktiv",
    statusTone: "success",
    uploadedAtLabel: "03.07.2026, 08:15",
    uploadedByName: "Nikolay Ivanov",
    fileSizeLabel: "512 KB",
    retentionLabel: "Dauerhaft privat",
  },
  {
    id: "DOC-2026-0702-014",
    company_id: "company-ivt",
    courier_profile_id: "KUR-10472",
    uploaded_by: "ADM-10001",
    document_type: "contract",
    title: "Arbeitsvertrag Kurier v2",
    storage_bucket: "courier-documents",
    storage_path:
      "companies/company-ivt/couriers/KUR-10472/docs/arbeitsvertrag-v2.pdf",
    mime_type: "application/pdf",
    size_bytes: 724000,
    created_at: "2026-07-02T15:40:00.000Z",
    courierName: "Maria Schmidt",
    depotName: "Mannheim Sued",
    documentTypeLabel: "Vertrag",
    mailboxCategory: "contract",
    visibility: "courier_private",
    visibilityLabel: "Privat",
    visibilityTone: "success",
    status: "review",
    statusLabel: "Pruefen",
    statusTone: "warning",
    uploadedAtLabel: "02.07.2026, 15:40",
    uploadedByName: "Nikolay Ivanov",
    fileSizeLabel: "724 KB",
    retentionLabel: "Dauerhaft privat",
  },
  {
    id: "DOC-2026-0701-009",
    company_id: "company-ivt",
    courier_profile_id: null,
    uploaded_by: "DSP-20014",
    document_type: "instruction",
    title: "Ladungssicherung Heavy Bulky",
    storage_bucket: "courier-documents",
    storage_path:
      "companies/company-ivt/couriers/company-wide/docs/ladungssicherung.pdf",
    mime_type: "application/pdf",
    size_bytes: 1210000,
    created_at: "2026-07-01T11:22:00.000Z",
    courierName: null,
    depotName: "Alle Depots",
    documentTypeLabel: "Anweisung",
    mailboxCategory: "document",
    visibility: "company",
    visibilityLabel: "Alle Kuriere",
    visibilityTone: "info",
    status: "active",
    statusLabel: "Aktiv",
    statusTone: "success",
    uploadedAtLabel: "01.07.2026, 11:22",
    uploadedByName: "Anna Mueller",
    fileSizeLabel: "1.2 MB",
    retentionLabel: "Company Dokument",
  },
  {
    id: "DOC-2026-0630-006",
    company_id: "company-ivt",
    courier_profile_id: null,
    uploaded_by: "DSP-20027",
    document_type: "notice",
    title: "Depot-Hinweis Heidelberg Juli",
    storage_bucket: "courier-documents",
    storage_path:
      "companies/company-ivt/couriers/depot-hd/docs/depot-hinweis-juli.pdf",
    mime_type: "application/pdf",
    size_bytes: 284000,
    created_at: "2026-06-30T16:10:00.000Z",
    courierName: null,
    depotName: "Heidelberg",
    documentTypeLabel: "Hinweis",
    mailboxCategory: "notice",
    visibility: "depot_scoped",
    visibilityLabel: "Depot",
    visibilityTone: "warning",
    status: "active",
    statusLabel: "Aktiv",
    statusTone: "success",
    uploadedAtLabel: "30.06.2026, 16:10",
    uploadedByName: "Georg Keller",
    fileSizeLabel: "284 KB",
    retentionLabel: "Depot Nachricht",
  },
  {
    id: "DOC-2026-0628-003",
    company_id: "company-ivt",
    courier_profile_id: "KUR-10483",
    uploaded_by: "ADM-10001",
    document_type: "other",
    title: "Fuehrerschein Nachweis",
    storage_bucket: "courier-documents",
    storage_path:
      "companies/company-ivt/couriers/KUR-10483/docs/fuehrerschein.pdf",
    mime_type: "application/pdf",
    size_bytes: 310000,
    created_at: "2026-06-28T09:35:00.000Z",
    courierName: "Todor Petrov",
    depotName: "Mannheim Nord",
    documentTypeLabel: "Nachweis",
    mailboxCategory: "document",
    visibility: "courier_private",
    visibilityLabel: "Privat",
    visibilityTone: "success",
    status: "draft",
    statusLabel: "Entwurf",
    statusTone: "neutral",
    uploadedAtLabel: "28.06.2026, 09:35",
    uploadedByName: "Nikolay Ivanov",
    fileSizeLabel: "310 KB",
    retentionLabel: "Dauerhaft privat",
  },
  {
    id: "DOC-2026-0625-017",
    company_id: "company-ivt",
    courier_profile_id: "KUR-10458",
    uploaded_by: "ADM-10001",
    document_type: "payslip",
    title: "Lohnabrechnung Mai 2026",
    storage_bucket: "payslips",
    storage_path:
      "companies/company-ivt/couriers/KUR-10458/payslips/2026-05.pdf",
    mime_type: "application/pdf",
    size_bytes: 498000,
    created_at: "2026-06-25T10:05:00.000Z",
    courierName: "Nico Weber",
    depotName: "Mannheim Nord",
    documentTypeLabel: "Lohnabrechnung",
    mailboxCategory: "payslip",
    visibility: "courier_private",
    visibilityLabel: "Privat",
    visibilityTone: "success",
    status: "active",
    statusLabel: "Aktiv",
    statusTone: "success",
    uploadedAtLabel: "25.06.2026, 10:05",
    uploadedByName: "Nikolay Ivanov",
    fileSizeLabel: "498 KB",
    retentionLabel: "Dauerhaft privat",
  },
];

export const adminDocumentSummary = {
  total: adminDocumentListItems.length,
  active: adminDocumentListItems.filter((document) => document.status === "active")
    .length,
  privateFiles: adminDocumentListItems.filter(
    (document) => document.visibility === "courier_private",
  ).length,
  mailboxReady: adminDocumentListItems.filter(
    (document) => document.status !== "draft",
  ).length,
};

export const adminDocumentUploadDraft: AdminDocumentUploadDraft = {
  title: "Lohnabrechnung Juli 2026",
  fileName: "lohnabrechnung_juli_2026.pdf",
  fileType: "PDF",
  fileSizeLabel: "486 KB",
  courierName: "Nico Weber",
  depotName: "Mannheim Nord",
  documentType: "payslip",
  documentTypeLabel: "Lohnabrechnung",
  storageBucket: "payslips",
  mailboxEnabled: true,
  mailboxTitle: "Neue Lohnabrechnung verfuegbar",
  mailboxMessage:
    "Die Lohnabrechnung wird als privates Dokument im Postfach bereitgestellt.",
  visibilityRows: [
    { label: "Sichtbarkeit", value: "Nur Zielkurier", tone: "success" },
    { label: "Speicher", value: "Private Storage", tone: "primary" },
    { label: "Postfach", value: "Benachrichtigung an", tone: "info" },
  ],
  checklist: [
    { label: "Datei ausgewaehlt", done: true },
    { label: "Kurier ausgewaehlt", done: true },
    { label: "Dokumenttyp gesetzt", done: true },
    { label: "Mailbox-Option aktiv", done: true },
  ],
  auditReminder:
    "Realer Upload speichert spaeter private Datei, Dokument-Metadaten und optional ein Postfach-Element. Uploads muessen auditierbar bleiben.",
};
