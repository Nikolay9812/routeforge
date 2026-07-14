import type { Document, MailboxCategory, MailboxItem } from "@routeforge/shared";

import type { MailboxFileKind, MailboxItemViewModel } from "@/features/mailbox/mailboxTypes";
import { insforge } from "@/lib/insforge-client";

type MailboxDocumentRow = Pick<
  Document,
  | "id"
  | "document_type"
  | "mime_type"
  | "size_bytes"
  | "storage_bucket"
  | "storage_path"
  | "title"
> | null;

type MailboxItemRow = MailboxItem & {
  documents?: MailboxDocumentRow | MailboxDocumentRow[];
};

type DocumentDownloadAccess = {
  document_id: string;
  mime_type: string;
  size_bytes: number;
  storage_bucket: "courier-documents" | "generated-pdfs" | "payslips";
  storage_path: string;
  title: string;
};

const mailboxSelect = `
  id,
  company_id,
  courier_profile_id,
  document_id,
  title,
  message,
  category,
  read_at,
  created_by,
  created_at,
  documents (
    id,
    document_type,
    title,
    storage_bucket,
    storage_path,
    mime_type,
    size_bytes
  )
`;

export async function loadCourierMailboxItems(
  companyId: string,
  courierProfileId: string,
): Promise<{ error: string | null; items: MailboxItemViewModel[] }> {
  const { data, error } = await insforge.database
    .from("mailbox_items")
    .select(mailboxSelect)
    .eq("company_id", companyId)
    .eq("courier_profile_id", courierProfileId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      error: "Postfach konnte nicht vom Server geladen werden.",
      items: [],
    };
  }

  return {
    error: null,
    items: ((data ?? []) as MailboxItemRow[]).map(formatMailboxItem),
  };
}

export async function loadMailboxItemById(
  companyId: string,
  courierProfileId: string,
  mailboxItemId: string,
): Promise<{ error: string | null; item: MailboxItemViewModel | null }> {
  const { data, error } = await insforge.database
    .from("mailbox_items")
    .select(mailboxSelect)
    .eq("company_id", companyId)
    .eq("courier_profile_id", courierProfileId)
    .eq("id", mailboxItemId)
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      error: "Postfach-Eintrag konnte nicht geladen werden.",
      item: null,
    };
  }

  return {
    error: null,
    item: data ? formatMailboxItem(data as MailboxItemRow) : null,
  };
}

export async function markMailboxItemRead(
  mailboxItemId: string,
): Promise<{ error: string | null; item: MailboxItemViewModel | null }> {
  const { data, error } = await insforge.database.rpc("mark_mailbox_item_read", {
    p_mailbox_item_id: mailboxItemId,
  });

  if (error || !data) {
    return {
      error: "Lesestatus konnte nicht gespeichert werden.",
      item: null,
    };
  }

  const row = Array.isArray(data) ? data[0] : data;

  return {
    error: null,
    item: row ? formatMailboxItem(row as MailboxItemRow) : null,
  };
}

export async function downloadMailboxDocument(
  documentId: string,
): Promise<{ blob: Blob | null; error: string | null; title: string | null }> {
  const { data, error } = await insforge.database.rpc(
    "get_document_download_access",
    {
      p_document_id: documentId,
    },
  );

  if (error || !data) {
    return {
      blob: null,
      error: "Download-Zugriff konnte nicht geprueft werden.",
      title: null,
    };
  }

  const access = normalizeDownloadAccess(data);

  if (!access) {
    return {
      blob: null,
      error: "Download-Zugriff ist unvollstaendig.",
      title: null,
    };
  }

  const download = await insforge.storage
    .from(access.storage_bucket)
    .download(access.storage_path);

  if (download.error || !download.data) {
    return {
      blob: null,
      error: "Dokument konnte nicht heruntergeladen werden.",
      title: access.title,
    };
  }

  return {
    blob: download.data,
    error: null,
    title: access.title,
  };
}

function formatMailboxItem(row: MailboxItemRow): MailboxItemViewModel {
  const document = normalizeDocument(row.documents);
  const fileKind = getFileKind(document);
  const categoryLabel = getCategoryLabel(row.category);

  return {
    attachmentHelper: document
      ? getAttachmentHelper(row.category)
      : "Nachricht ohne PDF-Anhang",
    attachmentLabel: document?.title ?? row.title,
    category: row.category,
    categoryLabel,
    detailBody: [
      row.message ?? "Ein neues Dokument wurde fuer Sie bereitgestellt.",
      document
        ? "Der Zugriff erfolgt ueber private RouteForge Storage-Berechtigungen."
        : "Diese Nachricht enthaelt keinen Datei-Anhang.",
    ],
    documentId: row.document_id,
    fileKind,
    fileSizeLabel: document ? formatFileSize(document.size_bytes) : null,
    iconName: getIconName(row.category, fileKind),
    id: row.id,
    message: row.message ?? "Ein neuer Postfach-Eintrag ist verfuegbar.",
    readAt: row.read_at,
    receivedLabel: formatDate(row.created_at),
    senderLabel: "RouteForge Admin",
    sizeBytes: document?.size_bytes ?? null,
    storageBucket: document?.storage_bucket ?? null,
    storagePath: document?.storage_path ?? null,
    subtitle: categoryLabel,
    title: row.title,
    tone: getTone(row.category, fileKind),
  };
}

function normalizeDocument(
  document: MailboxDocumentRow | MailboxDocumentRow[] | undefined,
): MailboxDocumentRow {
  return Array.isArray(document) ? document[0] ?? null : document ?? null;
}

function normalizeDownloadAccess(data: unknown): DocumentDownloadAccess | null {
  const row = Array.isArray(data) ? data[0] : data;

  if (!row || typeof row !== "object") {
    return null;
  }

  return row as DocumentDownloadAccess;
}

function getFileKind(document: MailboxDocumentRow): MailboxFileKind {
  return document ? "PDF" : "Nachricht";
}

function getCategoryLabel(category: MailboxCategory): string {
  const labels: Record<MailboxCategory, string> = {
    contract: "Vertrag",
    document: "Dokument",
    notice: "Hinweis",
    payslip: "Gehaltsabrechnung",
  };

  return labels[category];
}

function getAttachmentHelper(category: MailboxCategory): string {
  if (category === "payslip") {
    return "Privates Lohn-Dokument";
  }

  if (category === "contract") {
    return "Privates Vertragsdokument";
  }

  return "Privates Dokument";
}

function getIconName(
  category: MailboxCategory,
  fileKind: MailboxFileKind,
): MailboxItemViewModel["iconName"] {
  if (fileKind === "PDF") {
    return "file-pdf-box";
  }

  if (category === "notice") {
    return "bullhorn-outline";
  }

  return "email-outline";
}

function getTone(
  category: MailboxCategory,
  fileKind: MailboxFileKind,
): MailboxItemViewModel["tone"] {
  if (category === "payslip" || fileKind === "PDF") {
    return "error";
  }

  if (category === "contract") {
    return "primary";
  }

  if (category === "notice") {
    return "warning";
  }

  return "success";
}

function formatDate(dateTime: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateTime));
}

function formatFileSize(sizeBytes: number): string {
  if (sizeBytes >= 1024 * 1024) {
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
}

