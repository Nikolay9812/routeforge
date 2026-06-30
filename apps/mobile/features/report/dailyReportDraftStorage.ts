import type { ShiftPhotoType } from "@routeforge/shared";

import {
  upsertDailyReportDraftSyncQueueEntry,
  type SyncQueueEntry,
} from "@/features/offline/syncQueue";
import type { DailyReportValidationDraft } from "@/features/report/dailyReportValidation";
import type {
  LocalShiftPhoto,
  ShiftPhotoUploadPayload,
} from "@/features/report/photoCapture";
import type {
  LocalSignature,
  SignatureStroke,
  SignatureUploadPayload,
} from "@/features/report/signatureCapture";
import {
  readJsonStorageItem,
  writeJsonStorageItem,
} from "@/lib/storage";

const DAILY_REPORT_DRAFT_STORAGE_VERSION = 1;

export type StoredDailyReportDraft = {
  capturedPhotos: Partial<Record<ShiftPhotoType, LocalShiftPhoto>>;
  draftId: string;
  localSignature: LocalSignature | null;
  queueOperationId: string;
  savedAt: string;
  schemaVersion: typeof DAILY_REPORT_DRAFT_STORAGE_VERSION;
  syncStatus: "unsynced";
  validationDraft: DailyReportValidationDraft;
};

export type SaveDailyReportDraftInput = {
  capturedPhotos: Partial<Record<ShiftPhotoType, LocalShiftPhoto>>;
  draftId: string;
  localSignature: LocalSignature | null;
  validationDraft: DailyReportValidationDraft;
};

export type SaveDailyReportDraftResult = {
  draft: StoredDailyReportDraft;
  queueEntry: SyncQueueEntry;
};

function getDailyReportDraftStorageKey(draftId: string): string {
  return `routeforge:draft-report:${draftId}`;
}

function readRecordValue(value: unknown, key: string): unknown {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  return Object.getOwnPropertyDescriptor(value, key)?.value;
}

function isShiftPhotoType(value: unknown): value is ShiftPhotoType {
  return (
    value === "start_km" ||
    value === "end_km" ||
    value === "fahrtenbuch" ||
    value === "mentor"
  );
}

function isValidIsoDateString(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  return Number.isFinite(Date.parse(value));
}

function parseNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function parseString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function parseShiftPhotoUploadPayload(
  value: unknown,
  photoType: ShiftPhotoType,
): ShiftPhotoUploadPayload | null {
  const compressed = readRecordValue(value, "compressed");
  const expiresInDays = readRecordValue(value, "expiresInDays");
  const fileName = parseString(readRecordValue(value, "fileName"));
  const localUri = parseString(readRecordValue(value, "localUri"));
  const mimeType = readRecordValue(value, "mimeType");
  const storedPhotoType = readRecordValue(value, "photoType");
  const storageBucket = readRecordValue(value, "storageBucket");
  const storagePathTemplate = readRecordValue(value, "storagePathTemplate");

  if (
    compressed !== true ||
    expiresInDays !== 14 ||
    fileName === null ||
    localUri === null ||
    mimeType !== "image/jpeg" ||
    storedPhotoType !== photoType ||
    storageBucket !== "shift-photos" ||
    storagePathTemplate !== "companies/{company_id}/shifts/{shift_id}/photos/{file_name}"
  ) {
    return null;
  }

  return {
    compressed: true,
    expiresInDays,
    fileName,
    localUri,
    mimeType,
    photoType,
    storageBucket,
    storagePathTemplate,
  };
}

function parseLocalShiftPhoto(value: unknown, photoType: ShiftPhotoType): LocalShiftPhoto | null {
  const compressed = readRecordValue(value, "compressed");
  const compressionQuality = parseNumber(readRecordValue(value, "compressionQuality"));
  const fileName = parseString(readRecordValue(value, "fileName"));
  const height = parseNumber(readRecordValue(value, "height"));
  const localUri = parseString(readRecordValue(value, "localUri"));
  const mimeType = readRecordValue(value, "mimeType");
  const originalUri = parseString(readRecordValue(value, "originalUri"));
  const storedPhotoType = readRecordValue(value, "photoType");
  const preparedAt = readRecordValue(value, "preparedAt");
  const targetMaxWidth = parseNumber(readRecordValue(value, "targetMaxWidth"));
  const uploadPayload = parseShiftPhotoUploadPayload(
    readRecordValue(value, "uploadPayload"),
    photoType,
  );
  const width = parseNumber(readRecordValue(value, "width"));

  if (
    compressed !== true ||
    compressionQuality === null ||
    fileName === null ||
    height === null ||
    localUri === null ||
    mimeType !== "image/jpeg" ||
    originalUri === null ||
    storedPhotoType !== photoType ||
    !isValidIsoDateString(preparedAt) ||
    targetMaxWidth === null ||
    width === null ||
    uploadPayload === null
  ) {
    return null;
  }

  return {
    compressed: true,
    compressionQuality,
    fileName,
    height,
    localUri,
    mimeType,
    originalUri,
    photoType,
    preparedAt,
    targetMaxWidth,
    uploadPayload,
    width,
  };
}

function parseCapturedPhotos(
  value: unknown,
): Partial<Record<ShiftPhotoType, LocalShiftPhoto>> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const capturedPhotos: Partial<Record<ShiftPhotoType, LocalShiftPhoto>> = {};

  for (const photoType of ["start_km", "end_km", "fahrtenbuch", "mentor"]) {
    if (!isShiftPhotoType(photoType)) {
      continue;
    }

    const photo = readRecordValue(value, photoType);

    if (photo === undefined) {
      continue;
    }

    const parsedPhoto = parseLocalShiftPhoto(photo, photoType);

    if (parsedPhoto === null) {
      return null;
    }

    capturedPhotos[photoType] = parsedPhoto;
  }

  return capturedPhotos;
}

function parseSignatureStrokes(value: unknown): SignatureStroke[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const strokes: SignatureStroke[] = [];

  for (const stroke of value) {
    if (!Array.isArray(stroke)) {
      return null;
    }

    const points = [];

    for (const point of stroke) {
      const x = parseNumber(readRecordValue(point, "x"));
      const y = parseNumber(readRecordValue(point, "y"));

      if (x === null || y === null) {
        return null;
      }

      points.push({ x, y });
    }

    strokes.push(points);
  }

  return strokes;
}

function parseSignatureUploadPayload(value: unknown): SignatureUploadPayload | null {
  const fileName = parseString(readRecordValue(value, "fileName"));
  const localDataUri = parseString(readRecordValue(value, "localDataUri"));
  const mimeType = readRecordValue(value, "mimeType");
  const signedAt = readRecordValue(value, "signedAt");
  const storageBucket = readRecordValue(value, "storageBucket");
  const storagePathTemplate = readRecordValue(value, "storagePathTemplate");

  if (
    fileName === null ||
    localDataUri === null ||
    mimeType !== "image/svg+xml" ||
    !isValidIsoDateString(signedAt) ||
    storageBucket !== "generated-pdfs" ||
    storagePathTemplate !== "companies/{company_id}/reports/{shift_id}/{file_name}"
  ) {
    return null;
  }

  return {
    fileName,
    localDataUri,
    mimeType,
    signedAt,
    storageBucket,
    storagePathTemplate,
  };
}

function parseLocalSignature(value: unknown): LocalSignature | null | undefined {
  if (value === null) {
    return null;
  }

  const fileName = parseString(readRecordValue(value, "fileName"));
  const signedAt = readRecordValue(value, "signedAt");
  const signedAtLabel = parseString(readRecordValue(value, "signedAtLabel"));
  const signatureUrl = parseString(readRecordValue(value, "signatureUrl"));
  const strokes = parseSignatureStrokes(readRecordValue(value, "strokes"));
  const uploadPayload = parseSignatureUploadPayload(readRecordValue(value, "uploadPayload"));

  if (
    fileName === null ||
    !isValidIsoDateString(signedAt) ||
    signedAtLabel === null ||
    signatureUrl === null ||
    strokes === null ||
    uploadPayload === null
  ) {
    return undefined;
  }

  return {
    fileName,
    signedAt,
    signedAtLabel,
    signatureUrl,
    strokes,
    uploadPayload,
  };
}

function parseValidationDraft(value: unknown): DailyReportValidationDraft | null {
  const courierNote = readRecordValue(value, "courierNote");
  const courierProfileId = parseString(readRecordValue(value, "courierProfileId"));
  const depotId = parseString(readRecordValue(value, "depotId"));
  const endKm = parseNumber(readRecordValue(value, "endKm"));
  const endTime = readRecordValue(value, "endTime");
  const packagesDelivered = parseNumber(readRecordValue(value, "packagesDelivered"));
  const packagesPickedUp = parseNumber(readRecordValue(value, "packagesPickedUp"));
  const packagesReturned = parseNumber(readRecordValue(value, "packagesReturned"));
  const paymentModeSnapshot = readRecordValue(value, "paymentModeSnapshot");
  const requiredPhotoTypes = readRecordValue(value, "requiredPhotoTypes");
  const shiftDate = parseString(readRecordValue(value, "shiftDate"));
  const signatureUrl = readRecordValue(value, "signatureUrl");
  const signedAt = readRecordValue(value, "signedAt");
  const startKm = parseNumber(readRecordValue(value, "startKm"));
  const startTime = readRecordValue(value, "startTime");
  const totalStops = readRecordValue(value, "totalStops");
  const uploadedPhotoTypes = readRecordValue(value, "uploadedPhotoTypes");
  const vanPlate = parseString(readRecordValue(value, "vanPlate"));

  if (
    !(courierNote === null || typeof courierNote === "string") ||
    courierProfileId === null ||
    depotId === null ||
    endKm === null ||
    !isValidIsoDateString(endTime) ||
    packagesDelivered === null ||
    packagesPickedUp === null ||
    packagesReturned === null ||
    !(paymentModeSnapshot === "hourly" || paymentModeSnapshot === "daily_fixed") ||
    !Array.isArray(requiredPhotoTypes) ||
    shiftDate === null ||
    !(signatureUrl === null || typeof signatureUrl === "string") ||
    !(signedAt === null || isValidIsoDateString(signedAt)) ||
    startKm === null ||
    !isValidIsoDateString(startTime) ||
    !(totalStops === null || typeof totalStops === "number") ||
    !Array.isArray(uploadedPhotoTypes) ||
    vanPlate === null
  ) {
    return null;
  }

  if (
    !requiredPhotoTypes.every(isShiftPhotoType) ||
    !uploadedPhotoTypes.every(isShiftPhotoType)
  ) {
    return null;
  }

  return {
    courierNote,
    courierProfileId,
    depotId,
    endKm,
    endTime,
    packagesDelivered,
    packagesPickedUp,
    packagesReturned,
    paymentModeSnapshot,
    requiredPhotoTypes,
    shiftDate,
    signatureUrl,
    signedAt,
    startKm,
    startTime,
    totalStops,
    uploadedPhotoTypes,
    vanPlate,
  };
}

function parseStoredDailyReportDraft(
  value: unknown,
  draftId: string,
): StoredDailyReportDraft | null {
  const schemaVersion = readRecordValue(value, "schemaVersion");
  const storedDraftId = readRecordValue(value, "draftId");
  const savedAt = readRecordValue(value, "savedAt");
  const syncStatus = readRecordValue(value, "syncStatus");
  const queueOperationId = parseString(readRecordValue(value, "queueOperationId"));
  const capturedPhotos = parseCapturedPhotos(readRecordValue(value, "capturedPhotos"));
  const localSignature = parseLocalSignature(readRecordValue(value, "localSignature"));
  const validationDraft = parseValidationDraft(readRecordValue(value, "validationDraft"));

  if (
    schemaVersion !== DAILY_REPORT_DRAFT_STORAGE_VERSION ||
    storedDraftId !== draftId ||
    !isValidIsoDateString(savedAt) ||
    syncStatus !== "unsynced" ||
    queueOperationId === null ||
    capturedPhotos === null ||
    localSignature === undefined ||
    validationDraft === null
  ) {
    return null;
  }

  return {
    capturedPhotos,
    draftId,
    localSignature,
    queueOperationId,
    savedAt,
    schemaVersion: DAILY_REPORT_DRAFT_STORAGE_VERSION,
    syncStatus,
    validationDraft,
  };
}

export async function getStoredDailyReportDraft(
  draftId: string,
): Promise<StoredDailyReportDraft | null> {
  const storedValue = await readJsonStorageItem(getDailyReportDraftStorageKey(draftId));

  return parseStoredDailyReportDraft(storedValue, draftId);
}

export async function saveDailyReportDraft(
  input: SaveDailyReportDraftInput,
): Promise<SaveDailyReportDraftResult> {
  const savedAt = new Date().toISOString();
  const queueEntry = await upsertDailyReportDraftSyncQueueEntry(input.draftId, savedAt);
  const draft: StoredDailyReportDraft = {
    capturedPhotos: input.capturedPhotos,
    draftId: input.draftId,
    localSignature: input.localSignature,
    queueOperationId: queueEntry.id,
    savedAt,
    schemaVersion: DAILY_REPORT_DRAFT_STORAGE_VERSION,
    syncStatus: "unsynced",
    validationDraft: input.validationDraft,
  };

  await writeJsonStorageItem(getDailyReportDraftStorageKey(input.draftId), draft);

  return {
    draft,
    queueEntry,
  };
}

export function formatDraftSavedAtLabel(savedAt: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(new Date(savedAt));
}
