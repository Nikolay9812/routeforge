import type { PaymentMode } from "@routeforge/shared";

import {
  createPendingLocationCheckpoint,
  type LocalShiftLocationCheckpoint,
  type LocalShiftLocationMissingReason,
} from "@/features/location/shiftLocationCapture";
import {
  readJsonStorageItem,
  removeStorageItem,
  writeJsonStorageItem,
} from "@/lib/storage";

import type { ActiveShiftState, StoredActiveShiftSnapshot } from "./types";

const ACTIVE_SHIFT_STORAGE_KEY = "routeforge:active-shift";
const ACTIVE_SHIFT_STORAGE_VERSION = 2;

type StoredActiveShiftPayload = StoredActiveShiftSnapshot & {
  schemaVersion: typeof ACTIVE_SHIFT_STORAGE_VERSION;
  savedAt: string;
};

function readRecordValue(value: unknown, key: string): unknown {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  return Object.getOwnPropertyDescriptor(value, key)?.value;
}

function isPaymentMode(value: unknown): value is PaymentMode {
  return value === "hourly" || value === "daily_fixed";
}

function isLocationMissingReason(value: unknown): value is LocalShiftLocationMissingReason {
  return value === "permission_denied" || value === "unavailable";
}

function isValidIsoDateString(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  return Number.isFinite(Date.parse(value));
}

function parseNullableString(value: unknown): string | null | undefined {
  if (value === null) {
    return null;
  }

  return typeof value === "string" ? value : undefined;
}

function parseNullableNumber(value: unknown): number | null | undefined {
  if (value === null) {
    return null;
  }

  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function parseOptionalNullableNumber(value: unknown): number | null | undefined {
  if (value === undefined) {
    return null;
  }

  return parseNullableNumber(value);
}

function parseOptionalNullableBoolean(value: unknown): boolean | null | undefined {
  if (value === undefined || value === null) {
    return null;
  }

  return typeof value === "boolean" ? value : undefined;
}

function parseLocationCheckpoint(
  value: unknown,
  fallbackType: "start" | "stop",
): LocalShiftLocationCheckpoint | null {
  const locationType = readRecordValue(value, "locationType");
  const status = readRecordValue(value, "status");
  const message = readRecordValue(value, "message");
  const capturedAt = parseNullableString(readRecordValue(value, "capturedAt"));
  const latitude = parseNullableNumber(readRecordValue(value, "latitude"));
  const longitude = parseNullableNumber(readRecordValue(value, "longitude"));
  const accuracyMeters = parseNullableNumber(readRecordValue(value, "accuracyMeters"));
  const distanceFromDepotMeters = parseOptionalNullableNumber(
    readRecordValue(value, "distanceFromDepotMeters"),
  );
  const isInsideDepotGeofence = parseOptionalNullableBoolean(
    readRecordValue(value, "isInsideDepotGeofence"),
  );
  const missingReason = readRecordValue(value, "missingReason");

  if (locationType !== fallbackType || typeof message !== "string") {
    return null;
  }

  if (
    status === "pending" &&
    capturedAt === null &&
    latitude === null &&
    longitude === null &&
    accuracyMeters === null &&
    distanceFromDepotMeters === null &&
    isInsideDepotGeofence === null &&
    missingReason === null
  ) {
    return createPendingLocationCheckpoint(fallbackType);
  }

  if (
    status === "captured" &&
    typeof capturedAt === "string" &&
    isValidIsoDateString(capturedAt) &&
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    (typeof accuracyMeters === "number" || accuracyMeters === null) &&
    (typeof distanceFromDepotMeters === "number" || distanceFromDepotMeters === null) &&
    (typeof isInsideDepotGeofence === "boolean" || isInsideDepotGeofence === null) &&
    missingReason === null
  ) {
    return {
      accuracyMeters,
      capturedAt,
      distanceFromDepotMeters,
      isInsideDepotGeofence,
      latitude,
      locationType: fallbackType,
      longitude,
      message,
      missingReason: null,
      status,
    };
  }

  if (
    status === "missing" &&
    typeof capturedAt === "string" &&
    isValidIsoDateString(capturedAt) &&
    latitude === null &&
    longitude === null &&
    accuracyMeters === null &&
    distanceFromDepotMeters === null &&
    isInsideDepotGeofence === null &&
    isLocationMissingReason(missingReason)
  ) {
    return {
      accuracyMeters: null,
      capturedAt,
      distanceFromDepotMeters: null,
      isInsideDepotGeofence: null,
      latitude: null,
      locationType: fallbackType,
      longitude: null,
      message,
      missingReason,
      status,
    };
  }

  return null;
}

function parseActiveShiftState(value: unknown): ActiveShiftState | null {
  const shiftId = parseNullableString(readRecordValue(value, "shiftId"));
  const startedAt = parseNullableString(readRecordValue(value, "startedAt"));
  const currentDepotId = parseNullableString(readRecordValue(value, "currentDepotId"));
  const paymentMode = readRecordValue(value, "paymentMode");
  const isRunning = readRecordValue(value, "isRunning");
  const autoStoppedAtMaxHours = readRecordValue(value, "autoStoppedAtMaxHours");
  const startLocation = parseLocationCheckpoint(readRecordValue(value, "startLocation"), "start");
  const stopLocation = parseLocationCheckpoint(readRecordValue(value, "stopLocation"), "stop");

  if (
    shiftId === undefined ||
    startedAt === undefined ||
    currentDepotId === undefined ||
    !isPaymentMode(paymentMode) ||
    typeof isRunning !== "boolean" ||
    typeof autoStoppedAtMaxHours !== "boolean" ||
    startLocation === null ||
    stopLocation === null
  ) {
    return null;
  }

  if (startedAt !== null && !isValidIsoDateString(startedAt)) {
    return null;
  }

  return {
    shiftId,
    startedAt,
    currentDepotId,
    paymentMode,
    isRunning,
    autoStoppedAtMaxHours,
    startLocation,
    stopLocation,
  };
}

function parseStoredPayload(value: unknown): StoredActiveShiftSnapshot | null {
  const schemaVersion = readRecordValue(value, "schemaVersion");
  const activeShift = parseActiveShiftState(readRecordValue(value, "activeShift"));
  const completedAt = parseNullableString(readRecordValue(value, "completedAt"));

  if (
    schemaVersion !== ACTIVE_SHIFT_STORAGE_VERSION ||
    activeShift === null ||
    completedAt === undefined
  ) {
    return null;
  }

  if (completedAt !== null && !isValidIsoDateString(completedAt)) {
    return null;
  }

  if (!activeShift.isRunning && completedAt === null) {
    return null;
  }

  return {
    activeShift,
    completedAt,
  };
}

function isSameLocalDate(value: string, comparisonDate: Date): boolean {
  const date = new Date(value);

  return (
    date.getFullYear() === comparisonDate.getFullYear() &&
    date.getMonth() === comparisonDate.getMonth() &&
    date.getDate() === comparisonDate.getDate()
  );
}

export async function getStoredActiveShiftSnapshot(
  comparisonDate: Date = new Date(),
): Promise<StoredActiveShiftSnapshot | null> {
  const storedValue = await readJsonStorageItem(ACTIVE_SHIFT_STORAGE_KEY);
  const parsedValue = parseStoredPayload(storedValue);

  if (!parsedValue || !parsedValue.activeShift.startedAt) {
    await clearStoredActiveShiftSnapshot();

    return null;
  }

  if (!isSameLocalDate(parsedValue.activeShift.startedAt, comparisonDate)) {
    await clearStoredActiveShiftSnapshot();

    return null;
  }

  return parsedValue;
}

export async function saveStoredActiveShiftSnapshot(
  activeShift: ActiveShiftState,
  completedAt: string | null,
): Promise<void> {
  if (!activeShift.startedAt) {
    await clearStoredActiveShiftSnapshot();

    return;
  }

  const payload: StoredActiveShiftPayload = {
    schemaVersion: ACTIVE_SHIFT_STORAGE_VERSION,
    activeShift,
    completedAt,
    savedAt: new Date().toISOString(),
  };

  await writeJsonStorageItem(ACTIVE_SHIFT_STORAGE_KEY, payload);
}

export async function clearStoredActiveShiftSnapshot(): Promise<void> {
  await removeStorageItem(ACTIVE_SHIFT_STORAGE_KEY);
}
