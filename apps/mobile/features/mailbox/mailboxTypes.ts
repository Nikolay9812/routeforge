import type { MailboxCategory } from "@routeforge/shared";

import type { RfIconName } from "@/components/ui/RfIcon";

export type MailboxFileKind = "PDF" | "Nachricht";

export type MailboxItemViewModel = {
  documentId?: string | null;
  id: string;
  category: MailboxCategory;
  categoryLabel: string;
  title: string;
  subtitle: string;
  message: string;
  detailBody: string[];
  receivedLabel: string;
  readAt: string | null;
  fileKind: MailboxFileKind;
  fileSizeLabel: string | null;
  attachmentLabel: string;
  attachmentHelper: string;
  senderLabel: string;
  sizeBytes?: number | null;
  storageBucket?: "courier-documents" | "generated-pdfs" | "payslips" | null;
  storagePath?: string | null;
  iconName: RfIconName;
  tone: "primary" | "success" | "warning" | "error" | "neutral";
};

export type MailboxFilterId =
  | "all"
  | "unread"
  | "document"
  | "payslip"
  | "contract"
  | "notice";

export type MailboxFilter = {
  id: MailboxFilterId;
  label: string;
};

export const mailboxFilters: MailboxFilter[] = [
  { id: "all", label: "Alle" },
  { id: "unread", label: "Ungelesen" },
  { id: "document", label: "Dokumente" },
  { id: "payslip", label: "Abrechnungen" },
  { id: "contract", label: "Vertraege" },
  { id: "notice", label: "Hinweise" },
];

export const mailboxPrivacyNotice =
  "Vertraulich und nur fuer dein eigenes Kurierprofil sichtbar.";
