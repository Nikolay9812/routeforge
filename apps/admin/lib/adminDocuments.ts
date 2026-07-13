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
  count: number;
  label: string;
  tone: AdminDocumentTone;
};

export type AdminDocumentFilterGroup = {
  label: string;
  value: string;
};

export type AdminDocumentUploadDraft = {
  auditReminder: string;
  courierName: string;
  depotName: string;
  documentType: DocumentType;
  fileName: string;
  fileSizeLabel: string;
  fileType: string;
  mailboxEnabled: boolean;
  mailboxMessage: string;
  mailboxTitle: string;
  title: string;
};

export const adminDocumentTabs: AdminDocumentTab[] = [
  { label: "Alle Dokumente", count: 0, tone: "primary" },
  { label: "Lohnabrechnungen", count: 0, tone: "success" },
  { label: "Vertraege", count: 0, tone: "info" },
  { label: "Hinweise", count: 0, tone: "warning" },
  { label: "Nachweise", count: 0, tone: "neutral" },
];

export const adminDocumentFilterGroups: AdminDocumentFilterGroup[] = [
  { label: "Dokumenttyp", value: "Alle Typen" },
  { label: "Zielgruppe", value: "Alle Kuriere" },
  { label: "Sichtbarkeit", value: "Alle Sichtbarkeiten" },
];

export const adminDocumentUploadDraft: AdminDocumentUploadDraft = {
  auditReminder:
    "Upload speichert private Datei, Dokument-Metadaten und optional ein Postfach-Element. Uploads bleiben auditierbar.",
  courierName: "",
  depotName: "",
  documentType: "payslip",
  fileName: "Noch keine Datei ausgewaehlt",
  fileSizeLabel: "-",
  fileType: "DATEI",
  mailboxEnabled: true,
  mailboxMessage:
    "Das Dokument wird als privater Eintrag im Postfach bereitgestellt.",
  mailboxTitle: "Postfach-Benachrichtigung",
  title: "",
};
