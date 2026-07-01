import type { PaymentMode, ShiftPhotoType } from "@routeforge/shared";

import {
  upsertDailyReportDraftSyncQueueEntry,
  type SyncQueueEntry,
} from "@/features/offline/syncQueue";
import type {
  DailyReportLifecycleStatus,
  DailyReportValidationDraft,
} from "@/features/report/dailyReportValidation";
import type { LocalShiftPhoto } from "@/features/report/photoCapture";
import type { LocalSignature, SignatureStroke } from "@/features/report/signatureCapture";
import { readJsonStorageItem, writeJsonStorageItem } from "@/lib/storage";

const DAILY_REPORT_DRAFT_STORAGE_VERSION = 2;
const LEGACY_DAILY_REPORT_DRAFT_STORAGE_VERSION = 1;
const SUBMITTED_REPORT_INDEX_KEY = "routeforge:submitted-daily-reports";

export type DailyReportCorrectionState =
  | "none"
  | "correction_requested"
  | "unlocked_by_admin"
  | "corrected_by_admin";

export type DailyReportSyncStatus = "pending_sync";

export type StoredDailyReportDraft = {
  capturedPhotos: Partial<Record<ShiftPhotoType, LocalShiftPhoto>>;
  correctionState: DailyReportCorrectionState;
  draftId: string;
  isLocked: boolean;
  localSignature: LocalSignature | null;
  lockedAt: string | null;
  missingProofExplanation: string;
  queueOperationId: string;
  reportStatus: DailyReportLifecycleStatus;
  savedAt: string;
  schemaVersion: typeof DAILY_REPORT_DRAFT_STORAGE_VERSION;
  submittedAt: string | null;
  syncStatus: DailyReportSyncStatus;
  validationDraft: DailyReportValidationDraft;
};

export type SaveDailyReportDraftInput = {
  capturedPhotos: Partial<Record<ShiftPhotoType, LocalShiftPhoto>>;
  correctionState?: DailyReportCorrectionState;
  draftId: string;
  isLocked?: boolean;
  localSignature: LocalSignature | null;
  lockedAt?: string | null;
  missingProofExplanation: string;
  reportStatus?: DailyReportLifecycleStatus;
  submittedAt?: string | null;
  validationDraft: DailyReportValidationDraft;
};

export type SaveDailyReportDraftResult = {
  draft: StoredDailyReportDraft;
  queueEntry: SyncQueueEntry;
};

type SubmittedReportIndex = {
  draftIds: string[];
  savedAt: string;
  schemaVersion: typeof DAILY_REPORT_DRAFT_STORAGE_VERSION;
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

function parseString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function parseNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isValidIsoDateString(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isShiftPhotoType(value: unknown): value is ShiftPhotoType {
  return (
    value === "start_km" ||
    value === "end_km" ||
    value === "fahrtenbuch" ||
    value === "mentor"
  );
}

function isPaymentMode(value: unknown): value is PaymentMode {
  return value === "hourly" || value === "daily_fixed";
}

function isReportStatus(value: unknown): value is DailyReportLifecycleStatus {
  return value === "draft" || value === "ready_to_submit" || value === "submitted";
}

function isCorrectionState(value: unknown): value is DailyReportCorrectionState {
  return (
    value === "none" ||
    value === "correction_requested" ||
    value === "unlocked_by_admin" ||
    value === "corrected_by_admin"
  );
}

function parseLocalShiftPhoto(value: unknown, photoType: ShiftPhotoType): LocalShiftPhoto | null {
  const compressed = readRecordValue(value, "compressed");
  const compressionQuality = parseNumber(readRecordValue(value, "compressionQuality"));
  const fileName = parseString(readRecordValue(value, "fileName"));
  const height = parseNumber(readRecordValue(value, "height"));
  const localUri = parseString(readRecordValue(value, "localUri"));
  const mimeType = readRecordValue(value, "mimeType");
  const originalUri = parseString(readRecordValue(value, "originalUri"));
  const preparedAt = readRecordValue(value, "preparedAt");
  const storedPhotoType = readRecordValue(value, "photoType");
  const targetMaxWidth = parseNumber(readRecordValue(value, "targetMaxWidth"));
  const uploadPayload = readRecordValue(value, "uploadPayload");
  const width = parseNumber(readRecordValue(value, "width"));

  if (
    compressed !== true ||
    compressionQuality === null ||
    fileName === null ||
    height === null ||
    localUri === null ||
    mimeType !== "image/jpeg" ||
    originalUri === null ||
    !isValidIsoDateString(preparedAt) ||
    storedPhotoType !== photoType ||
    targetMaxWidth === null ||
    width === null ||
    readRecordValue(uploadPayload, "photoType") !== photoType ||
    readRecordValue(uploadPayload, "storageBucket") !== "shift-photos"
  ) {
    return null;
  }

  return value as LocalShiftPhoto;
}

function parseCapturedPhotos(
  value: unknown,
): Partial<Record<ShiftPhotoType, LocalShiftPhoto>> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const capturedPhotos: Partial<Record<ShiftPhotoType, LocalShiftPhoto>> = {};

  for (const photoType of ["start_km", "end_km", "fahrtenbuch", "mentor"]) {
    const photo = readRecordValue(value, photoType);

    if (!isShiftPhotoType(photoType) || photo === undefined) {
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

function parseLocalSignature(value: unknown): LocalSignature | null | undefined {
  if (value === null) {
    return null;
  }

  const fileName = parseString(readRecordValue(value, "fileName"));
  const signedAt = readRecordValue(value, "signedAt");
  const signedAtLabel = parseString(readRecordValue(value, "signedAtLabel"));
  const signatureUrl = parseString(readRecordValue(value, "signatureUrl"));
  const strokes = parseSignatureStrokes(readRecordValue(value, "strokes"));
  const uploadPayload = readRecordValue(value, "uploadPayload");

  if (
    fileName === null ||
    !isValidIsoDateString(signedAt) ||
    signedAtLabel === null ||
    signatureUrl === null ||
    strokes === null ||
    parseString(readRecordValue(uploadPayload, "fileName")) === null ||
    readRecordValue(uploadPayload, "mimeType") !== "image/svg+xml"
  ) {
    return undefined;
  }

  return value as LocalSignature;
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
  const tourNumber = parseString(readRecordValue(value, "tourNumber")) ?? "1047";
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
    !isPaymentMode(paymentModeSnapshot) ||
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
    tourNumber,
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
  const queueOperationId = parseString(readRecordValue(value, "queueOperationId"));
  const capturedPhotos = parseCapturedPhotos(readRecordValue(value, "capturedPhotos"));
  const localSignature = parseLocalSignature(readRecordValue(value, "localSignature"));
  const validationDraft = parseValidationDraft(readRecordValue(value, "validationDraft"));

  if (
    storedDraftId !== draftId ||
    !isValidIsoDateString(savedAt) ||
    queueOperationId === null ||
    capturedPhotos === null ||
    localSignature === undefined ||
    validationDraft === null
  ) {
    return null;
  }

  if (schemaVersion === LEGACY_DAILY_REPORT_DRAFT_STORAGE_VERSION) {
    return {
      capturedPhotos,
      correctionState: "none",
      draftId,
      isLocked: false,
      localSignature,
      lockedAt: null,
      missingProofExplanation: "",
      queueOperationId,
      reportStatus: "draft",
      savedAt,
      schemaVersion: DAILY_REPORT_DRAFT_STORAGE_VERSION,
      submittedAt: null,
      syncStatus: "pending_sync",
      validationDraft,
    };
  }

  const correctionState = readRecordValue(value, "correctionState");
  const isLocked = readRecordValue(value, "isLocked");
  const lockedAt = readRecordValue(value, "lockedAt");
  const missingProofExplanation = parseString(readRecordValue(value, "missingProofExplanation"));
  const reportStatus = readRecordValue(value, "reportStatus");
  const submittedAt = readRecordValue(value, "submittedAt");
  const syncStatus = readRecordValue(value, "syncStatus");

  if (
    schemaVersion !== DAILY_REPORT_DRAFT_STORAGE_VERSION ||
    !isCorrectionState(correctionState) ||
    typeof isLocked !== "boolean" ||
    !(lockedAt === null || isValidIsoDateString(lockedAt)) ||
    missingProofExplanation === null ||
    !isReportStatus(reportStatus) ||
    !(submittedAt === null || isValidIsoDateString(submittedAt)) ||
    syncStatus !== "pending_sync"
  ) {
    return null;
  }

  return {
    capturedPhotos,
    correctionState,
    draftId,
    isLocked,
    localSignature,
    lockedAt,
    missingProofExplanation,
    queueOperationId,
    reportStatus,
    savedAt,
    schemaVersion: DAILY_REPORT_DRAFT_STORAGE_VERSION,
    submittedAt,
    syncStatus,
    validationDraft,
  };
}

function parseSubmittedReportIndex(value: unknown): string[] {
  const schemaVersion = readRecordValue(value, "schemaVersion");
  const draftIds = readRecordValue(value, "draftIds");

  if (schemaVersion !== DAILY_REPORT_DRAFT_STORAGE_VERSION || !Array.isArray(draftIds)) {
    return [];
  }

  return draftIds.filter((draftId): draftId is string => typeof draftId === "string");
}

async function saveSubmittedReportIndex(draftId: string, savedAt: string): Promise<void> {
  const storedValue = await readJsonStorageItem(SUBMITTED_REPORT_INDEX_KEY);
  const existingDraftIds = parseSubmittedReportIndex(storedValue);
  const payload: SubmittedReportIndex = {
    draftIds: [draftId, ...existingDraftIds.filter((item) => item !== draftId)],
    savedAt,
    schemaVersion: DAILY_REPORT_DRAFT_STORAGE_VERSION,
  };

  await writeJsonStorageItem(SUBMITTED_REPORT_INDEX_KEY, payload);
}

export async function getStoredDailyReportDraft(
  draftId: string,
): Promise<StoredDailyReportDraft | null> {
  const storedValue = await readJsonStorageItem(getDailyReportDraftStorageKey(draftId));

  return parseStoredDailyReportDraft(storedValue, draftId);
}

export async function getStoredSubmittedDailyReports(): Promise<StoredDailyReportDraft[]> {
  const storedValue = await readJsonStorageItem(SUBMITTED_REPORT_INDEX_KEY);
  const draftIds = parseSubmittedReportIndex(storedValue);
  const reports = await Promise.all(draftIds.map((draftId) => getStoredDailyReportDraft(draftId)));

  return reports.filter(
    (report): report is StoredDailyReportDraft =>
      report !== null && report.reportStatus === "submitted",
  );
}

export async function saveDailyReportDraft(
  input: SaveDailyReportDraftInput,
): Promise<SaveDailyReportDraftResult> {
  const savedAt = new Date().toISOString();
  const queueEntry = await upsertDailyReportDraftSyncQueueEntry(input.draftId, savedAt);
  const draft: StoredDailyReportDraft = {
    capturedPhotos: input.capturedPhotos,
    correctionState: input.correctionState ?? "none",
    draftId: input.draftId,
    isLocked: input.isLocked ?? false,
    localSignature: input.localSignature,
    lockedAt: input.lockedAt ?? null,
    missingProofExplanation: input.missingProofExplanation,
    queueOperationId: queueEntry.id,
    reportStatus: input.reportStatus ?? "draft",
    savedAt,
    schemaVersion: DAILY_REPORT_DRAFT_STORAGE_VERSION,
    submittedAt: input.submittedAt ?? null,
    syncStatus: "pending_sync",
    validationDraft: input.validationDraft,
  };

  await writeJsonStorageItem(getDailyReportDraftStorageKey(input.draftId), draft);

  if (draft.reportStatus === "submitted") {
    await saveSubmittedReportIndex(input.draftId, savedAt);
  }

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

export function formatSubmittedAtLabel(submittedAt: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(submittedAt));
}
