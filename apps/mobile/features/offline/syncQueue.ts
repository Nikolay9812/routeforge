import {
  readJsonStorageItem,
  writeJsonStorageItem,
} from "@/lib/storage";

const SYNC_QUEUE_STORAGE_KEY = "routeforge:sync-queue";
const SYNC_QUEUE_STORAGE_VERSION = 1;

export type SyncQueueOperationType = "daily_report_draft_upsert";
export type SyncQueueStatus = "pending" | "syncing" | "synced";

export type SyncQueueEntry = {
  attempts: number;
  createdAt: string;
  draftId: string;
  id: string;
  lastError: string | null;
  operationType: SyncQueueOperationType;
  status: SyncQueueStatus;
  updatedAt: string;
};

type StoredSyncQueuePayload = {
  entries: SyncQueueEntry[];
  savedAt: string;
  schemaVersion: typeof SYNC_QUEUE_STORAGE_VERSION;
};

function readRecordValue(value: unknown, key: string): unknown {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  return Object.getOwnPropertyDescriptor(value, key)?.value;
}

function isValidIsoDateString(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  return Number.isFinite(Date.parse(value));
}

function parseSyncQueueEntry(value: unknown): SyncQueueEntry | null {
  const attempts = readRecordValue(value, "attempts");
  const createdAt = readRecordValue(value, "createdAt");
  const draftId = readRecordValue(value, "draftId");
  const id = readRecordValue(value, "id");
  const lastError = readRecordValue(value, "lastError");
  const operationType = readRecordValue(value, "operationType");
  const status = readRecordValue(value, "status");
  const updatedAt = readRecordValue(value, "updatedAt");

  if (
    typeof attempts !== "number" ||
    !Number.isInteger(attempts) ||
    attempts < 0 ||
    !isValidIsoDateString(createdAt) ||
    typeof draftId !== "string" ||
    typeof id !== "string" ||
    !(lastError === undefined || lastError === null || typeof lastError === "string") ||
    operationType !== "daily_report_draft_upsert" ||
    !isValidSyncQueueStatus(status) ||
    !isValidIsoDateString(updatedAt)
  ) {
    return null;
  }

  return {
    attempts,
    createdAt,
    draftId,
    id,
    lastError: lastError === undefined ? null : lastError,
    operationType,
    status,
    updatedAt,
  };
}

function parseSyncQueuePayload(value: unknown): SyncQueueEntry[] {
  const schemaVersion = readRecordValue(value, "schemaVersion");
  const entries = readRecordValue(value, "entries");

  if (schemaVersion !== SYNC_QUEUE_STORAGE_VERSION || !Array.isArray(entries)) {
    return [];
  }

  return entries
    .map((entry) => parseSyncQueueEntry(entry))
    .filter((entry): entry is SyncQueueEntry => entry !== null);
}

export async function getPendingSyncQueueEntries(): Promise<SyncQueueEntry[]> {
  const storedValue = await readJsonStorageItem(SYNC_QUEUE_STORAGE_KEY);

  return parseSyncQueuePayload(storedValue).filter(
    (entry) => entry.status !== "synced",
  );
}

export async function upsertDailyReportDraftSyncQueueEntry(
  draftId: string,
  updatedAt: string,
  status: Extract<SyncQueueStatus, "pending" | "syncing"> = "pending",
  lastError: string | null = null,
): Promise<SyncQueueEntry> {
  const entries = await getPendingSyncQueueEntries();
  const existingEntry = entries.find(
    (entry) =>
      entry.draftId === draftId &&
      entry.operationType === "daily_report_draft_upsert",
  );
  const nextEntry: SyncQueueEntry = existingEntry
    ? {
        ...existingEntry,
        lastError,
        status,
        updatedAt,
      }
    : {
        attempts: 0,
        createdAt: updatedAt,
        draftId,
        id: `sync-${draftId}-${updatedAt.replace(/[:.]/g, "-")}`,
        lastError,
        operationType: "daily_report_draft_upsert",
        status,
        updatedAt,
      };
  const nextEntries = [
    ...entries.filter((entry) => entry.id !== nextEntry.id),
    nextEntry,
  ];
  const payload: StoredSyncQueuePayload = {
    entries: nextEntries,
    savedAt: updatedAt,
    schemaVersion: SYNC_QUEUE_STORAGE_VERSION,
  };

  await writeJsonStorageItem(SYNC_QUEUE_STORAGE_KEY, payload);

  return nextEntry;
}

export async function markDailyReportDraftSyncQueueEntrySyncing(
  draftId: string,
  updatedAt: string,
): Promise<SyncQueueEntry> {
  const entries = await getPendingSyncQueueEntries();
  const existingEntry = entries.find(
    (entry) =>
      entry.draftId === draftId &&
      entry.operationType === "daily_report_draft_upsert",
  );
  const nextEntry: SyncQueueEntry = existingEntry
    ? {
        ...existingEntry,
        attempts: existingEntry.attempts + 1,
        lastError: null,
        status: "syncing",
        updatedAt,
      }
    : {
        attempts: 1,
        createdAt: updatedAt,
        draftId,
        id: `sync-${draftId}-${updatedAt.replace(/[:.]/g, "-")}`,
        lastError: null,
        operationType: "daily_report_draft_upsert",
        status: "syncing",
        updatedAt,
      };

  await writeSyncQueueEntries(
    [...entries.filter((entry) => entry.id !== nextEntry.id), nextEntry],
    updatedAt,
  );

  return nextEntry;
}

export async function markDailyReportDraftSyncQueueEntryPending(
  draftId: string,
  updatedAt: string,
  lastError: string,
): Promise<SyncQueueEntry> {
  return upsertDailyReportDraftSyncQueueEntry(draftId, updatedAt, "pending", lastError);
}

export async function removeDailyReportDraftSyncQueueEntry(
  draftId: string,
  updatedAt: string,
): Promise<void> {
  const entries = await getPendingSyncQueueEntries();

  await writeSyncQueueEntries(
    entries.filter(
      (entry) =>
        entry.draftId !== draftId ||
        entry.operationType !== "daily_report_draft_upsert",
    ),
    updatedAt,
  );
}

function isValidSyncQueueStatus(value: unknown): value is SyncQueueStatus {
  return value === "pending" || value === "syncing" || value === "synced";
}

async function writeSyncQueueEntries(
  entries: SyncQueueEntry[],
  savedAt: string,
): Promise<void> {
  const payload: StoredSyncQueuePayload = {
    entries,
    savedAt,
    schemaVersion: SYNC_QUEUE_STORAGE_VERSION,
  };

  await writeJsonStorageItem(SYNC_QUEUE_STORAGE_KEY, payload);
}
