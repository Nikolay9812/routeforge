import { NextResponse } from "next/server";

import { getCurrentAdminSession } from "@/lib/auth";
import { createRouteForgeServerClient } from "@/lib/insforge/server";

export const dynamic = "force-dynamic";

type DocumentAccessRow = {
  company_id: string;
  courier_profile_id: string | null;
  document_id: string;
  mime_type: string;
  size_bytes: number;
  storage_bucket: string;
  storage_path: string;
  title: string;
};

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ courierId: string; documentId: string }>;
  },
) {
  const { courierId, documentId } = await params;
  const session = await getCurrentAdminSession();

  if (!session) {
    return textResponse("Nicht angemeldet.", 401);
  }

  const client = await createRouteForgeServerClient();
  const { data, error } = await client.database.rpc(
    "get_document_download_access",
    {
      p_document_id: documentId,
    },
  );

  if (error) {
    console.error("[admin/couriers/document-preview/access]", error);
    return textResponse("Dokument konnte nicht geladen werden.", 404);
  }

  const access = normalizeDocumentAccessRow(data);

  if (
    !access ||
    access.company_id !== session.profile.company_id ||
    access.courier_profile_id !== courierId ||
    access.storage_bucket !== "courier-documents" ||
    !access.mime_type.startsWith("image/")
  ) {
    return textResponse("Dokument konnte nicht geladen werden.", 404);
  }

  const download = await client.storage
    .from(access.storage_bucket)
    .download(access.storage_path);

  if (download.error || !download.data) {
    console.error("[admin/couriers/document-preview/download]", download.error);
    return textResponse("Dokumentfoto konnte nicht geladen werden.", 404);
  }

  return fileResponse(download.data, access.mime_type);
}

function normalizeDocumentAccessRow(row: unknown): DocumentAccessRow | null {
  const accessRow = Array.isArray(row) ? row[0] : row;

  if (!accessRow || typeof accessRow !== "object") {
    return null;
  }

  const record = accessRow as Record<string, unknown>;

  if (
    typeof record.company_id !== "string" ||
    typeof record.document_id !== "string" ||
    typeof record.mime_type !== "string" ||
    typeof record.size_bytes !== "number" ||
    typeof record.storage_bucket !== "string" ||
    typeof record.storage_path !== "string" ||
    typeof record.title !== "string"
  ) {
    return null;
  }

  return {
    company_id: record.company_id,
    courier_profile_id:
      typeof record.courier_profile_id === "string"
        ? record.courier_profile_id
        : null,
    document_id: record.document_id,
    mime_type: record.mime_type,
    size_bytes: record.size_bytes,
    storage_bucket: record.storage_bucket,
    storage_path: record.storage_path,
    title: record.title,
  };
}

function fileResponse(file: Blob, contentType: string) {
  return new Response(file, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": "inline",
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function textResponse(message: string, status: number) {
  return new NextResponse(message, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
    status,
  });
}
