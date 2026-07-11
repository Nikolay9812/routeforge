import {
  shiftPhotoMetadataSchema,
  shiftReportSubmissionSchema,
  type Shift,
  type ShiftPhoto,
  type ShiftPhotoMetadataInput,
  type ShiftPhotoType,
  type ShiftReportSubmissionInput,
} from "@routeforge/shared";

import type { DailyReportValidationDraft } from "@/features/report/dailyReportValidation";
import type { LocalShiftPhoto } from "@/features/report/photoCapture";
import type { LocalSignature } from "@/features/report/signatureCapture";
import { insforge } from "@/lib/insforge-client";

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
}> {
  const { data, error } = await insforge.database
    .from("shift_photos")
    .select(shiftPhotoSelect)
    .eq("shift_id", shiftId)
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
  const { data, error } = await insforge.storage
    .from(SHIFT_PHOTO_BUCKET)
    .upload(storageKey, photoBlob);

  if (error || !data) {
    const existingMetadata = await trySaveExistingShiftPhotoMetadata({
      photo,
      shift,
      sizeBytes: photoBlob.size,
      storagePath: storageKey,
    });

    if (existingMetadata) {
      return existingMetadata;
    }

    throw new Error(error?.message ?? "Nachweisfoto konnte nicht gespeichert werden.");
  }

  return saveShiftPhotoMetadata({
    photo,
    shift,
    sizeBytes: data.size,
    storagePath: data.key,
  });
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
  const signatureBlob = await createSignatureBlob(signature.uploadPayload.localDataUri);
  const { data, error } = await insforge.storage
    .from(SIGNATURE_BUCKET)
    .upload(storageKey, signatureBlob);

  if (error || !data) {
    throw new Error(error?.message ?? "Unterschrift konnte nicht gespeichert werden.");
  }

  return {
    key: data.key,
    url: data.url,
  };
}

async function createSignatureBlob(localDataUri: string): Promise<Blob> {
  const response = await fetch(localDataUri);

  return response.blob();
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
