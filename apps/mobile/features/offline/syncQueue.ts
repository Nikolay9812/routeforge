import {
  readJsonStorageItem,
  writeJsonStorageItem,
} from "@/lib/storage";

const SYNC_QUEUE_STORAGE_KEY = "routeforge:sync-queue";
const SYNC_QUEUE_STORAGE_VERSION = 1;

export type SyncQueueOperationType = "daily_report_draft_upsert";
export type SyncQueueStatus = "pending";

export type SyncQueueEntry = {
  attempts: number;
  createdAt: string;
  draftId: string;
  id: string;
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
    operationType !== "daily_report_draft_upsert" ||
    status !== "pending" ||
    !isValidIsoDateString(updatedAt)
  ) {
    return null;
  }

  return {
    attempts,
    createdAt,
    draftId,
    id,
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

  return parseSyncQueuePayload(storedValue);
}

export async function upsertDailyReportDraftSyncQueueEntry(
  draftId: string,
  updatedAt: string,
): Promise<SyncQueueEntry> {
  const entries = await getPendingSyncQueueEntries();
  const existingEntry = entries.find(
    (entry) =>
      entry.draftId === draftId &&
      entry.operationType === "daily_report_draft_upsert" &&
      entry.status === "pending",
  );
  const nextEntry: SyncQueueEntry = existingEntry
    ? {
        ...existingEntry,
        updatedAt,
      }
    : {
        attempts: 0,
        createdAt: updatedAt,
        draftId,
        id: `sync-${draftId}-${updatedAt.replace(/[:.]/g, "-")}`,
        operationType: "daily_report_draft_upsert",
        status: "pending",
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
