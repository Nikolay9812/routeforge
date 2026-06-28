import type { PaymentMode } from "@routeforge/shared";

import {
  readJsonStorageItem,
  removeStorageItem,
  writeJsonStorageItem,
} from "@/lib/storage";

import type { ActiveShiftState, StoredActiveShiftSnapshot } from "./types";

const ACTIVE_SHIFT_STORAGE_KEY = "routeforge:active-shift";
const ACTIVE_SHIFT_STORAGE_VERSION = 1;

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

function parseActiveShiftState(value: unknown): ActiveShiftState | null {
  const shiftId = parseNullableString(readRecordValue(value, "shiftId"));
  const startedAt = parseNullableString(readRecordValue(value, "startedAt"));
  const currentDepotId = parseNullableString(readRecordValue(value, "currentDepotId"));
  const paymentMode = readRecordValue(value, "paymentMode");
  const isRunning = readRecordValue(value, "isRunning");
  const autoStoppedAtMaxHours = readRecordValue(value, "autoStoppedAtMaxHours");

  if (
    shiftId === undefined ||
    startedAt === undefined ||
    currentDepotId === undefined ||
    !isPaymentMode(paymentMode) ||
    typeof isRunning !== "boolean" ||
    typeof autoStoppedAtMaxHours !== "boolean"
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
