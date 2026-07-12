import type { ShiftPhoto, ShiftPhotoType } from "@routeforge/shared";
import { shiftPhotoTypeSchema } from "@routeforge/shared";
import { NextResponse } from "next/server";

import { getCurrentAdminSession } from "@/lib/auth";
import { createRouteForgeServerClient } from "@/lib/insforge/server";
import { getShiftSignatureArtifactForReview } from "@/lib/shiftSignatures.server";

export const dynamic = "force-dynamic";

const photoSelect = `
  id,
  company_id,
  shift_id,
  photo_type,
  storage_bucket,
  storage_path,
  mime_type,
  size_bytes,
  compressed,
  uploaded_by,
  uploaded_at,
  expires_at,
  deleted_at
`;

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ evidenceType: string; shiftId: string }>;
  },
) {
  const { evidenceType, shiftId } = await params;
  const session = await getCurrentAdminSession();

  if (!session) {
    return textResponse("Nicht angemeldet.", 401);
  }

  if (evidenceType === "signature") {
    return getSignatureEvidenceResponse(shiftId);
  }

  const photoType = normalizePhotoType(evidenceType);

  if (!photoType) {
    return textResponse("Nachweistyp unbekannt.", 404);
  }

  return getPhotoEvidenceResponse({
    companyId: session.profile.company_id,
    photoType,
    shiftId,
  });
}

async function getPhotoEvidenceResponse({
  companyId,
  photoType,
  shiftId,
}: {
  companyId: string;
  photoType: ShiftPhotoType;
  shiftId: string;
}) {
  const client = await createRouteForgeServerClient();
  const { data, error } = await client.database
    .from("shift_photos")
    .select(photoSelect)
    .eq("shift_id", shiftId)
    .eq("company_id", companyId)
    .eq("photo_type", photoType)
    .is("deleted_at", null)
    .order("uploaded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return textResponse("Nachweisfoto nicht gefunden.", 404);
  }

  const photo = data as ShiftPhoto;
  const download = await client.storage
    .from(photo.storage_bucket)
    .download(photo.storage_path);

  if (download.error || !download.data) {
    return textResponse("Nachweisfoto konnte nicht geladen werden.", 404);
  }

  return fileResponse(download.data, photo.mime_type);
}

async function getSignatureEvidenceResponse(shiftId: string) {
  const client = await createRouteForgeServerClient();
  const { artifact, error } = await getShiftSignatureArtifactForReview(shiftId);

  if (error || !artifact) {
    return textResponse(error ?? "Unterschrift nicht gefunden.", 404);
  }

  const download = await client.storage
    .from(artifact.storage_bucket)
    .download(artifact.signature_storage_key);

  if (download.error || !download.data) {
    return textResponse("Unterschrift konnte nicht geladen werden.", 404);
  }

  return fileResponse(download.data, artifact.mime_type);
}

function normalizePhotoType(value: string): ShiftPhotoType | null {
  const parsed = shiftPhotoTypeSchema.safeParse(value);

  return parsed.success ? parsed.data : null;
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
