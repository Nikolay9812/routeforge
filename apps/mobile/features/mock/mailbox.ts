import type { MailboxCategory } from "@routeforge/shared";
import type { RfIconName } from "@/components/ui/RfIcon";

export type MailboxFileKind = "PDF" | "Nachricht";

export type MailboxItemMock = {
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
    categoryLabel: "Gehaltsabrechnung",
    title: "Gehaltsabrechnung - Mai 2025",
    subtitle: "Gehaltsabrechnung",
    message: "Ihre Gehaltsabrechnung fuer Mai 2025. Vielen Dank fuer Ihren Einsatz.",
    detailBody: [
      "Ihre Gehaltsabrechnung fuer Mai 2025 ist im privaten Postfach verfuegbar.",
      "Bitte laden Sie die PDF nur auf ein eigenes Geraet herunter und bewahren Sie die Datei vertraulich auf.",
    ],
    receivedLabel: "30.05.2025",
    readAt: null,
    fileKind: "PDF",
    fileSizeLabel: "186 KB",
    attachmentLabel: "Gehaltsabrechnung_Mai_2025.pdf",
    attachmentHelper: "Privates Lohn-Dokument",
    senderLabel: "Ivanov Transport",
    iconName: "file-pdf-box",
    tone: "error",
  },
  {
    id: "mailbox-contract-addendum",
    category: "contract",
    categoryLabel: "Vertrag",
    title: "Arbeitsvertrag - Nachtrag",
    subtitle: "Vertrag",
    message: "Nachtrag zum bestehenden Arbeitsvertrag. Bitte pruefen Sie das Dokument.",
    detailBody: [
      "Der Nachtrag zu Ihrem bestehenden Arbeitsvertrag wurde fuer Sie bereitgestellt.",
      "Bitte pruefen Sie die Angaben in Ruhe. Bei Fragen wenden Sie sich an das Personalbuero.",
    ],
    receivedLabel: "28.05.2025",
    readAt: null,
    fileKind: "PDF",
    fileSizeLabel: "244 KB",
    attachmentLabel: "Arbeitsvertrag_Nachtrag.pdf",
    attachmentHelper: "Privates Vertragsdokument",
    senderLabel: "Personalbuero",
    iconName: "file-document-edit-outline",
    tone: "primary",
  },
  {
    id: "mailbox-shift-week-23",
    category: "document",
    categoryLabel: "Dokument",
    title: "Schichtplan - Woche 23",
    subtitle: "Schichtplanung",
    message: "Der Schichtplan fuer die kommende Woche ist verfuegbar.",
    detailBody: [
      "Der Schichtplan fuer Woche 23 ist im Postfach hinterlegt.",
      "Bitte pruefen Sie Ihre geplanten Einsaetze und melden Sie Abweichungen fruehzeitig an die Disposition.",
    ],
    receivedLabel: "27.05.2025",
    readAt: null,
    fileKind: "Nachricht",
    fileSizeLabel: null,
    attachmentLabel: "Schichtplan Woche 23",
    attachmentHelper: "Nachricht ohne PDF-Anhang",
    senderLabel: "Disposition HBW3",
    iconName: "calendar-month-outline",
    tone: "success",
  },
  {
    id: "mailbox-safety-guidelines",
    category: "notice",
    categoryLabel: "Hinweis",
    title: "Neue Sicherheitsrichtlinien",
    subtitle: "Unternehmensdokument",
    message: "Aktualisierte Hinweise fuer schwere Lieferungen und Tragehilfen.",
    detailBody: [
      "Die Sicherheitsrichtlinien fuer schwere Lieferungen wurden aktualisiert.",
      "Bitte lesen Sie die Hinweise vor Ihrer naechsten Schicht, besonders die Abschnitte zu Tragehilfen und engeren Treppenhaeusern.",
    ],
    receivedLabel: "26.05.2025",
    readAt: "2025-05-26T14:40:00Z",
    fileKind: "PDF",
    fileSizeLabel: "91 KB",
    attachmentLabel: "Sicherheitsrichtlinien_2025.pdf",
    attachmentHelper: "Unternehmensdokument",
    senderLabel: "Betriebsleitung",
    iconName: "information-outline",
    tone: "neutral",
  },
  {
    id: "mailbox-company-meeting",
    category: "notice",
    categoryLabel: "Hinweis",
    title: "Betriebsversammlung - Einladung",
    subtitle: "Unternehmensnachricht",
    message: "Einladung zur Betriebsversammlung am Freitag im Depot Mannheim.",
    detailBody: [
      "Sie sind zur Betriebsversammlung am Freitag im Depot Mannheim eingeladen.",
      "Die Teilnahmeinformationen werden im Depot ausgehangen. Bitte planen Sie nach Moeglichkeit Zeit nach der Schicht ein.",
    ],
    receivedLabel: "23.05.2025",
    readAt: null,
    fileKind: "Nachricht",
    fileSizeLabel: null,
    attachmentLabel: "Einladung Betriebsversammlung",
    attachmentHelper: "Nachricht ohne PDF-Anhang",
    senderLabel: "Betriebsleitung",
    iconName: "bullhorn-outline",
    tone: "warning",
  },
  {
    id: "mailbox-pay-2025-04",
    category: "payslip",
    categoryLabel: "Gehaltsabrechnung",
    title: "Gehaltsabrechnung - April 2025",
    subtitle: "Gehaltsabrechnung",
    message: "Archivierte Gehaltsabrechnung fuer April 2025.",
    detailBody: [
      "Ihre Gehaltsabrechnung fuer April 2025 bleibt im privaten Postfach verfuegbar.",
      "Dieses Dokument ist nicht Teil der 14-Tage-Bereinigung fuer Schichtfotos.",
    ],
    receivedLabel: "30.04.2025",
    readAt: "2025-05-01T08:15:00Z",
    fileKind: "PDF",
    fileSizeLabel: "181 KB",
    attachmentLabel: "Gehaltsabrechnung_April_2025.pdf",
    attachmentHelper: "Privates Lohn-Dokument",
    senderLabel: "Ivanov Transport",
    iconName: "file-pdf-box",
    tone: "error",
  },
];

export const mailboxPrivacyNotice =
  "Vertraulich und nur fuer Ihr eigenes Kurierprofil sichtbar.";

export function getMailboxItemById(id: string | undefined): MailboxItemMock {
  return mailboxItems.find((item) => item.id === id) ?? mailboxItems[0];
}
