"use server";

import { randomUUID } from "crypto";

import type { Document } from "@routeforge/shared";
import { documentTypeSchema, type DocumentType } from "@routeforge/shared";
import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import {
  formatAdminDocumentListItem,
  type AdminDocumentCourierOption,
} from "@/lib/adminDocuments.server";
import { createRouteForgeServerClient } from "@/lib/insforge/server";
import type { AdminDocumentListItem } from "@/lib/mock/adminDocuments";

export type DocumentUploadMutationResult = {
  document: AdminDocumentListItem | null;
  error: string | null;
};

const maxDocumentSizeBytes = 50 * 1024 * 1024;

export async function uploadCourierDocumentAction(
  formData: FormData,
): Promise<DocumentUploadMutationResult> {
  const session = await requireAdminSession();

  if (session.profile.role !== "admin") {
    return {
      document: null,
      error: "Aktuell koennen nur Admins echte Dokumente hochladen.",
    };
  }

  const fileValue = formData.get("file");
  const courierProfileId = getFormString(formData, "courierProfileId");
  const title = getFormString(formData, "title");
  const documentTypeValue = getFormString(formData, "documentType");
  const mailboxEnabled = getFormString(formData, "mailboxEnabled") !== "false";
  const mailboxMessage = getFormString(formData, "mailboxMessage");

  if (!(fileValue instanceof File)) {
    return { document: null, error: "Bitte eine Datei auswaehlen." };
  }

  if (!courierProfileId || !title || !documentTypeValue) {
    return { document: null, error: "Bitte Dokument, Kurier und Titel pruefen." };
  }

  if (fileValue.size <= 0 || fileValue.size > maxDocumentSizeBytes) {
    return {
      document: null,
      error: "Datei muss groesser als 0 Byte und maximal 50 MB sein.",
    };
  }

  const parsedDocumentType = documentTypeSchema.safeParse(documentTypeValue);

  if (!parsedDocumentType.success) {
    return { document: null, error: "Dokumenttyp ist ungueltig." };
  }

  const documentType = parsedDocumentType.data;
  const storageBucket = getStorageBucket(documentType);
  const storagePath = buildStoragePath({
    companyId: session.profile.company_id,
    courierProfileId,
    documentType,
    fileName: fileValue.name,
  });
  const mimeType = fileValue.type || "application/octet-stream";
  const client = await createRouteForgeServerClient();
  const upload = await client.storage.from(storageBucket).upload(storagePath, fileValue);

  if (upload.error || !upload.data) {
    return {
      document: null,
      error: upload.error?.message ?? "Dokument konnte nicht gespeichert werden.",
    };
  }

  const { data, error } = await client.database.rpc(
    "create_courier_document_mailbox_item",
    {
      p_courier_profile_id: courierProfileId,
      p_create_mailbox_item: mailboxEnabled,
      p_document_type: documentType,
      p_mailbox_message: mailboxMessage || null,
      p_mime_type: upload.data.mimeType || mimeType,
      p_size_bytes: upload.data.size || fileValue.size,
      p_storage_bucket: storageBucket,
      p_storage_path: upload.data.key,
      p_title: title.trim(),
    },
  );

  if (error || !data) {
    await client.storage.from(storageBucket).remove(upload.data.key);

    return {
      document: null,
      error: error?.message ?? "Dokument konnte nicht registriert werden.",
    };
  }

  const document = (Array.isArray(data) ? data[0] : data) as Document;
  const courierOption = await loadCourierOption(courierProfileId);
  const documentListItem = formatAdminDocumentListItem({
    courier: null,
    depot: null,
    document,
    uploader: session.profile,
  });

  revalidatePath("/admin/documents");

  return {
    document: {
      ...documentListItem,
      courierName: courierOption?.name ?? documentListItem.courierName,
      depotName: courierOption?.depotName ?? documentListItem.depotName,
    },
    error: null,
  };
}

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getStorageBucket(documentType: DocumentType): Document["storage_bucket"] {
  return documentType === "payslip" ? "payslips" : "courier-documents";
}

function buildStoragePath({
  companyId,
  courierProfileId,
  documentType,
  fileName,
}: {
  companyId: string;
  courierProfileId: string;
  documentType: DocumentType;
  fileName: string;
}): string {
  const folder = documentType === "payslip" ? "payslips" : "docs";
  const safeFileName = sanitizeFileName(fileName);

  return `companies/${companyId}/couriers/${courierProfileId}/${folder}/${randomUUID()}-${safeFileName}`;
}

function sanitizeFileName(fileName: string): string {
  const fallback = "dokument";
  const sanitized = fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");

  return sanitized || fallback;
}

async function loadCourierOption(
  courierProfileId: string,
): Promise<AdminDocumentCourierOption | null> {
  const client = await createRouteForgeServerClient();
  const { data } = await client.database
    .from("profiles")
    .select("id, full_name, primary_depot_id, depots(name)")
    .eq("id", courierProfileId)
    .limit(1)
    .maybeSingle();

  if (!data) {
    return null;
  }

  const row = data as {
    depots?: { name: string | null } | { name: string | null }[] | null;
    full_name?: string | null;
    id: string;
  };
  const depot = Array.isArray(row.depots) ? row.depots[0] : row.depots;

  return {
    depotName: depot?.name ?? "Kein Depot",
    name: row.full_name ?? "Kurier",
    profileId: row.id,
  };
}
