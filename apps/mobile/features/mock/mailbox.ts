import type { MailboxCategory } from "@routeforge/shared";
import type { RfIconName } from "@/components/ui/RfIcon";

export type MailboxFileKind = "PDF" | "Nachricht";

export type MailboxItemMock = {
  id: string;
  category: MailboxCategory;
  title: string;
  subtitle: string;
  message: string;
  receivedLabel: string;
  readAt: string | null;
  fileKind: MailboxFileKind;
  fileSizeLabel: string | null;
  senderLabel: string;
  iconName: RfIconName;
  tone: "primary" | "success" | "warning" | "error" | "neutral";
};

export type MailboxFilterId = "all" | "unread" | "document" | "payslip" | "contract" | "notice";

export type MailboxFilterMock = {
  id: MailboxFilterId;
  label: string;
};

export const mailboxFilters: MailboxFilterMock[] = [
  { id: "all", label: "Alle" },
  { id: "unread", label: "Ungelesen" },
  { id: "document", label: "Dokumente" },
  { id: "payslip", label: "Abrechnungen" },
  { id: "contract", label: "Vertraege" },
  { id: "notice", label: "Hinweise" },
];

export const mailboxItems: MailboxItemMock[] = [
  {
    id: "mailbox-pay-2025-05",
    category: "payslip",
    title: "Gehaltsabrechnung - Mai 2025",
    subtitle: "Gehaltsabrechnung",
    message: "Ihre Gehaltsabrechnung fuer Mai 2025. Vielen Dank fuer Ihren Einsatz.",
    receivedLabel: "30.05.2025",
    readAt: null,
    fileKind: "PDF",
    fileSizeLabel: "186 KB",
    senderLabel: "Ivanov Transport",
    iconName: "file-pdf-box",
    tone: "error",
  },
  {
    id: "mailbox-contract-addendum",
    category: "contract",
    title: "Arbeitsvertrag - Nachtrag",
    subtitle: "Vertrag",
    message: "Nachtrag zum bestehenden Arbeitsvertrag. Bitte pruefen Sie das Dokument.",
    receivedLabel: "28.05.2025",
    readAt: null,
    fileKind: "PDF",
    fileSizeLabel: "244 KB",
    senderLabel: "Personalbuero",
    iconName: "file-document-edit-outline",
    tone: "primary",
  },
  {
    id: "mailbox-shift-week-23",
    category: "document",
    title: "Schichtplan - Woche 23",
    subtitle: "Schichtplanung",
    message: "Der Schichtplan fuer die kommende Woche ist verfuegbar.",
    receivedLabel: "27.05.2025",
    readAt: null,
    fileKind: "Nachricht",
    fileSizeLabel: null,
    senderLabel: "Disposition HBW3",
    iconName: "calendar-month-outline",
    tone: "success",
  },
  {
    id: "mailbox-safety-guidelines",
    category: "notice",
    title: "Neue Sicherheitsrichtlinien",
    subtitle: "Unternehmensdokument",
    message: "Aktualisierte Hinweise fuer schwere Lieferungen und Tragehilfen.",
    receivedLabel: "26.05.2025",
    readAt: "2025-05-26T14:40:00Z",
    fileKind: "PDF",
    fileSizeLabel: "91 KB",
    senderLabel: "Betriebsleitung",
    iconName: "information-outline",
    tone: "neutral",
  },
  {
    id: "mailbox-company-meeting",
    category: "notice",
    title: "Betriebsversammlung - Einladung",
    subtitle: "Unternehmensnachricht",
    message: "Einladung zur Betriebsversammlung am Freitag im Depot Mannheim.",
    receivedLabel: "23.05.2025",
    readAt: null,
    fileKind: "Nachricht",
    fileSizeLabel: null,
    senderLabel: "Betriebsleitung",
    iconName: "bullhorn-outline",
    tone: "warning",
  },
  {
    id: "mailbox-pay-2025-04",
    category: "payslip",
    title: "Gehaltsabrechnung - April 2025",
    subtitle: "Gehaltsabrechnung",
    message: "Archivierte Gehaltsabrechnung fuer April 2025.",
    receivedLabel: "30.04.2025",
    readAt: "2025-05-01T08:15:00Z",
    fileKind: "PDF",
    fileSizeLabel: "181 KB",
    senderLabel: "Ivanov Transport",
    iconName: "file-pdf-box",
    tone: "error",
  },
];

export const mailboxPrivacyNotice =
  "Vertraulich und nur fuer Ihr eigenes Kurierprofil sichtbar.";
