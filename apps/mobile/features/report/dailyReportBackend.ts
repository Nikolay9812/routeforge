import {
  isShiftLockedForCourier,
  shiftPhotoMetadataSchema,
  shiftSignatureArtifactSchema,
  shiftReportSubmissionSchema,
  type Shift,
  type ShiftPhoto,
  type ShiftPhotoMetadataInput,
  type ShiftPhotoType,
  type ShiftSignatureArtifact,
  type ShiftReportSubmissionInput,
} from "@routeforge/shared";
import { Directory, File, Paths } from "expo-file-system";

import type { DailyReportValidationDraft } from "@/features/report/dailyReportValidation";
import type { LocalShiftPhoto } from "@/features/report/photoCapture";
import type { LocalSignature } from "@/features/report/signatureCapture";
import { loadCourierShiftById } from "@/features/shifts/shiftBackend";
import { insforge } from "@/lib/insforge-client";
import { uploadMobileStorageFile } from "@/lib/mobileStorageUpload";

export type ShiftPhotoUploadState = "error" | "uploaded" | "uploading";

type SubmitDailyReportInput = {
  capturedPhotos: Partial<Record<ShiftPhotoType, LocalShiftPhoto>>;
  localSignature: LocalSignature;
  missingProofExplanation: string;
  onPhotoUploadStateChange?: (
    photoType: ShiftPhotoType,
    state: ShiftPhotoUploadState,
  ) => void;
  persistedPhotoTypes: ShiftPhotoType[];
  shift: Shift;
  validationDraft: DailyReportValidationDraft;
};

type SubmitDailyReportResult = {
  shift: Shift;
  signatureStorageKey: string;
  signatureUrl: string;
};

const SIGNATURE_BUCKET = "generated-pdfs" as const;
const SHIFT_PHOTO_BUCKET = "shift-photos" as const;
const SIGNATURE_FILE_NAME = "signature.svg";
const requiredPhotoTypes: ShiftPhotoType[] = [
  "start_km",
  "end_km",
  "fahrtenbuch",
  "mentor",
];

const shiftPhotoSelect = `
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

export async function submitDailyReport(
  input: SubmitDailyReportInput,
): Promise<SubmitDailyReportResult> {
  const currentShiftResult = await loadCourierShiftById({
    companyId: input.shift.company_id,
    shiftId: input.shift.id,
  });

  if (currentShiftResult.error) {
    throw new Error(currentShiftResult.error);
  }

  if (currentShiftResult.shift && isShiftLockedForCourier(currentShiftResult.shift.status)) {
    return {
      shift: currentShiftResult.shift,
      signatureStorageKey:
        currentShiftResult.shift.signature_storage_key ??
        buildDailyReportSignatureStorageKey(currentShiftResult.shift),
      signatureUrl: currentShiftResult.shift.signature_url ?? "",
    };
  }

  await uploadShiftPhotos({
    capturedPhotos: input.capturedPhotos,
    onPhotoUploadStateChange: input.onPhotoUploadStateChange,
    persistedPhotoTypes: input.persistedPhotoTypes,
    shift: input.shift,
  });

  const signatureStorageKey = buildDailyReportSignatureStorageKey(input.shift);
  const signatureUpload = await uploadDailyReportSignature(
    signatureStorageKey,
    input.localSignature,
  );
  const submission = createShiftReportSubmission({
    input,
    signatureStorageKey: signatureUpload.key,
    signatureUrl: signatureUpload.url,
  });
  const { data, error } = await insforge.database.rpc(
    "submit_courier_shift_report",
    {
      p_courier_note: submission.courierNote,
      p_end_km: submission.endKm,
      p_missing_proof_explanation: submission.missingProofExplanation,
      p_packages_delivered: submission.packagesDelivered,
      p_packages_picked_up: submission.packagesPickedUp,
      p_packages_returned: submission.packagesReturned,
      p_shift_id: submission.shiftId,
      p_signature_storage_key: submission.signatureStorageKey,
      p_signature_url: submission.signatureUrl,
      p_signed_at: submission.signedAt,
      p_start_km: submission.startKm,
      p_total_stops: submission.totalStops,
      p_tour_number: submission.tourNumber,
      p_van_plate: submission.vanPlate,
    },
  );

  if (error || !data) {
    throw new Error(
      error?.message ?? "Tagesbericht konnte nicht eingereicht werden.",
    );
  }

  return {
    shift: normalizeShiftRow(data),
    signatureStorageKey: submission.signatureStorageKey,
    signatureUrl: submission.signatureUrl,
  };
}

export async function loadShiftPhotosForShift(shiftId: string): Promise<{
  error: string | null;
  photos: ShiftPhoto[];
}>;
export async function loadShiftPhotosForShift(
  shiftId: string,
  companyId: string,
): Promise<{
  error: string | null;
  photos: ShiftPhoto[];
}>;
export async function loadShiftPhotosForShift(
  shiftId: string,
  companyId?: string,
): Promise<{
  error: string | null;
  photos: ShiftPhoto[];
}> {
  let query = insforge.database
    .from("shift_photos")
    .select(shiftPhotoSelect)
    .eq("shift_id", shiftId);

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data, error } = await query
    .is("deleted_at", null)
    .order("uploaded_at", { ascending: false });

  if (error) {
    return {
      error: "Nachweisfotos konnten nicht vom Server geladen werden.",
      photos: [],
    };
  }

  return {
    error: null,
    photos: (data ?? []) as ShiftPhoto[],
  };
}

export async function loadShiftSignatureArtifact(
  shiftId: string,
): Promise<{
  artifact: ShiftSignatureArtifact | null;
  error: string | null;
}> {
  const { data, error } = await insforge.database.rpc(
    "get_shift_signature_artifact",
    {
      p_shift_id: shiftId,
    },
  );

  if (error) {
    return {
      artifact: null,
      error: "Unterschrift konnte nicht vom Server geladen werden.",
    };
  }

  return {
    artifact: normalizeShiftSignatureArtifactRow(data),
    error: null,
  };
}

export function buildDailyReportSignatureStorageKey(shift: Shift): string {
  return `companies/${shift.company_id}/reports/${shift.id}/${SIGNATURE_FILE_NAME}`;
}

async function uploadShiftPhotos({
  capturedPhotos,
  onPhotoUploadStateChange,
  persistedPhotoTypes,
  shift,
}: {
  capturedPhotos: Partial<Record<ShiftPhotoType, LocalShiftPhoto>>;
  onPhotoUploadStateChange?: (
    photoType: ShiftPhotoType,
    state: ShiftPhotoUploadState,
  ) => void;
  persistedPhotoTypes: ShiftPhotoType[];
  shift: Shift;
}): Promise<ShiftPhoto[]> {
  const uploadedPhotos: ShiftPhoto[] = [];
  const persistedPhotoTypeSet = new Set(persistedPhotoTypes);

  for (const photoType of requiredPhotoTypes) {
    if (persistedPhotoTypeSet.has(photoType)) {
      continue;
    }

    const photo = capturedPhotos[photoType];

    if (!photo) {
      continue;
    }

    onPhotoUploadStateChange?.(photoType, "uploading");

    try {
      const uploadedPhoto = await uploadShiftPhoto({
        photo,
        shift,
      });

      uploadedPhotos.push(uploadedPhoto);
      onPhotoUploadStateChange?.(photoType, "uploaded");
    } catch (error) {
      onPhotoUploadStateChange?.(photoType, "error");
      throw error;
    }
  }

  return uploadedPhotos;
}

async function uploadShiftPhoto({
  photo,
  shift,
}: {
  photo: LocalShiftPhoto;
  shift: Shift;
}): Promise<ShiftPhoto> {
  const storageKey = buildShiftPhotoStorageKey(shift, photo);
  const photoBlob = await createImageJpegBlob(photo.localUri);

  try {
    const uploadedPhoto = await uploadMobileStorageFile({
      bucket: SHIFT_PHOTO_BUCKET,
      key: storageKey,
      localUri: photo.localUri,
      mimeType: "image/jpeg",
      name: photo.fileName,
      sizeBytes: photoBlob.size,
    });

    return saveShiftPhotoMetadata({
      photo,
      shift,
      sizeBytes: uploadedPhoto.size,
      storagePath: uploadedPhoto.key,
    });
  } catch (error) {
    const existingMetadata = await trySaveExistingShiftPhotoMetadata({
      photo,
      shift,
      sizeBytes: photoBlob.size,
      storagePath: storageKey,
    });

    if (existingMetadata) {
      return existingMetadata;
    }

    throw new Error(
      error instanceof Error
        ? error.message
        : "Nachweisfoto konnte nicht gespeichert werden.",
    );
  }
}

async function trySaveExistingShiftPhotoMetadata({
  photo,
  shift,
  sizeBytes,
  storagePath,
}: {
  photo: LocalShiftPhoto;
  shift: Shift;
  sizeBytes: number;
  storagePath: string;
}): Promise<ShiftPhoto | null> {
  try {
    return await saveShiftPhotoMetadata({
      photo,
      shift,
      sizeBytes,
      storagePath,
    });
  } catch {
    return null;
  }
}

async function saveShiftPhotoMetadata({
  photo,
  shift,
  sizeBytes,
  storagePath,
}: {
  photo: LocalShiftPhoto;
  shift: Shift;
  sizeBytes: number;
  storagePath: string;
}): Promise<ShiftPhoto> {
  const metadata = createShiftPhotoMetadata({
    photo,
    shift,
    sizeBytes,
    storagePath,
  });
  const { data: metadataRow, error: metadataError } = await insforge.database.rpc(
    "save_shift_photo_metadata",
    {
      p_compressed: metadata.compressed,
      p_mime_type: metadata.mimeType,
      p_photo_type: metadata.photoType,
      p_shift_id: metadata.shiftId,
      p_size_bytes: metadata.sizeBytes,
      p_storage_path: metadata.storagePath,
    },
  );

  if (metadataError || !metadataRow) {
    throw new Error(
      metadataError?.message ?? "Nachweisfoto konnte nicht registriert werden.",
    );
  }

  return normalizeShiftPhotoRow(metadataRow);
}

function createShiftPhotoMetadata({
  photo,
  shift,
  sizeBytes,
  storagePath,
}: {
  photo: LocalShiftPhoto;
  shift: Shift;
  sizeBytes: number;
  storagePath: string;
}): ShiftPhotoMetadataInput {
  return shiftPhotoMetadataSchema.parse({
    compressed: photo.compressed,
    mimeType: photo.mimeType,
    photoType: photo.photoType,
    shiftId: shift.id,
    sizeBytes,
    storagePath,
  });
}

function buildShiftPhotoStorageKey(shift: Shift, photo: LocalShiftPhoto): string {
  return `companies/${shift.company_id}/shifts/${shift.id}/photos/${photo.fileName}`;
}

function createShiftReportSubmission({
  input,
  signatureStorageKey,
  signatureUrl,
}: {
  input: SubmitDailyReportInput;
  signatureStorageKey: string;
  signatureUrl: string;
}): ShiftReportSubmissionInput {
  return shiftReportSubmissionSchema.parse({
    courierNote: input.validationDraft.courierNote,
    endKm: input.validationDraft.endKm,
    missingProofExplanation: input.missingProofExplanation.trim()
      ? input.missingProofExplanation
      : null,
    packagesDelivered: input.validationDraft.packagesDelivered,
    packagesPickedUp: input.validationDraft.packagesPickedUp,
    packagesReturned: input.validationDraft.packagesReturned,
    shiftId: input.shift.id,
    signatureStorageKey,
    signatureUrl,
    signedAt: input.localSignature.signedAt,
    startKm: input.validationDraft.startKm,
    totalStops: input.validationDraft.totalStops,
    tourNumber: input.validationDraft.tourNumber,
    vanPlate: input.validationDraft.vanPlate,
  });
}

async function uploadDailyReportSignature(
  storageKey: string,
  signature: LocalSignature,
): Promise<{ key: string; url: string }> {
  const signatureFile = createSignatureUploadFile({
    localDataUri: signature.uploadPayload.localDataUri,
    storageKey,
  });
  const data = await uploadMobileStorageFile({
    bucket: SIGNATURE_BUCKET,
    key: storageKey,
    localUri: signatureFile.localUri,
    mimeType: "image/svg+xml",
    name: SIGNATURE_FILE_NAME,
    sizeBytes: signatureFile.sizeBytes,
  });

  return {
    key: data.key,
    url: data.url,
  };
}

function createSignatureUploadFile({
  localDataUri,
  storageKey,
}: {
  localDataUri: string;
  storageKey: string;
}): { localUri: string; sizeBytes: number } {
  const svgMarkup = decodeSignatureSvgDataUri(localDataUri);
  const directory = new Directory(Paths.cache, "routeforge-signatures");

  directory.create({
    idempotent: true,
    intermediates: true,
  });

  const file = new File(directory, `${createStorageCacheFileStem(storageKey)}.svg`);
  file.write(svgMarkup, { encoding: "utf8" });

  const info = file.info();

  if (!info.exists) {
    throw new Error("Unterschrift konnte nicht fuer den Upload vorbereitet werden.");
  }

  return {
    localUri: file.uri,
    sizeBytes: info.size && info.size > 0 ? info.size : svgMarkup.length,
  };
}

function decodeSignatureSvgDataUri(localDataUri: string): string {
  const signatureDataUriPrefix = "data:image/svg+xml;utf8,";

  if (!localDataUri.startsWith(signatureDataUriPrefix)) {
    throw new Error("Unterschrift konnte nicht fuer den Upload vorbereitet werden.");
  }

  try {
    const svgMarkup = decodeURIComponent(
      localDataUri.slice(signatureDataUriPrefix.length),
    );

    if (!svgMarkup.trim().startsWith("<svg")) {
      throw new Error("Invalid signature SVG.");
    }

    return svgMarkup;
  } catch {
    throw new Error("Unterschrift konnte nicht fuer den Upload vorbereitet werden.");
  }
}

function createStorageCacheFileStem(storageKey: string): string {
  return storageKey.replace(/[^A-Za-z0-9_-]/g, "_");
}

async function createImageJpegBlob(localUri: string): Promise<Blob> {
  const response = await fetch(localUri);
  const blob = await response.blob();

  if (blob.type === "image/jpeg") {
    return blob;
  }

  return new Blob([blob], { type: "image/jpeg" });
}

function normalizeShiftRow(row: unknown): Shift {
  return row as Shift;
}

function normalizeShiftPhotoRow(row: unknown): ShiftPhoto {
  return row as ShiftPhoto;
}

function normalizeShiftSignatureArtifactRow(
  row: unknown,
): ShiftSignatureArtifact | null {
  const artifactRow = Array.isArray(row) ? row[0] : row;
  const parsed = shiftSignatureArtifactSchema.safeParse(artifactRow);

  return parsed.success ? parsed.data : null;
}
