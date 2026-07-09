import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  calculateBillableMinutes,
  HOURLY_MAX_MINUTES,
  type PaymentMode,
  type Shift,
  type ShiftLocation,
} from "@routeforge/shared";

import {
  captureShiftLocation,
  createPendingLocationCheckpoint,
  type LocalShiftLocationCheckpoint,
} from "@/features/location/shiftLocationCapture";
import {
  clearStoredActiveShiftSnapshot,
  getStoredActiveShiftSnapshot,
  saveStoredActiveShiftSnapshot,
} from "@/features/shifts/activeShiftStorage";
import {
  endCourierShift,
  loadShiftLocations,
  loadTodayCourierShift,
  saveShiftLocation,
  startCourierShift,
} from "@/features/shifts/shiftBackend";

import type { ActiveShiftState } from "./types";

const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;
const HOURLY_MAX_SECONDS = HOURLY_MAX_MINUTES * SECONDS_PER_MINUTE;
const AUTO_STOP_WARNING_MINUTES = 30;
const AUTO_STOP_WARNING_SECONDS = AUTO_STOP_WARNING_MINUTES * SECONDS_PER_MINUTE;

type UseLocalShiftTimerParams = {
  courierProfileId: string | null;
  currentDepotId: string | null;
  enabled?: boolean;
  paymentMode: PaymentMode;
};

type LocalTimerStatus = "idle" | "running" | "ended" | "auto_stopped";
type BackendStatus = "idle" | "loading" | "saving";

type UseLocalShiftTimerResult = {
  activeShift: ActiveShiftState;
  backendError: string | null;
  backendStatus: BackendStatus;
  billableMinutes: number;
  billableTimeLabel: string;
  capturingLocationType: "start" | "stop" | null;
  clearBackendError: () => void;
  completedAt: string | null;
  elapsedSeconds: number;
  isAutoStopWarning: boolean;
  isBackendBusy: boolean;
  isCapturingLocation: boolean;
  remainingSecondsUntilAutoStop: number | null;
  refreshShift: () => Promise<void>;
  status: LocalTimerStatus;
  timerLabel: string;
  startedAtLabel: string | null;
  startShift: () => Promise<void>;
  stopShift: () => Promise<void>;
};

function createInitialActiveShift({
  currentDepotId,
  paymentMode,
}: UseLocalShiftTimerParams): ActiveShiftState {
  return {
    shiftId: null,
    startedAt: null,
    currentDepotId,
    paymentMode,
    isRunning: false,
    autoStoppedAtMaxHours: false,
    startLocation: createPendingLocationCheckpoint("start"),
    stopLocation: createPendingLocationCheckpoint("stop"),
  };
}

function parseDateMs(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function getHourlyAutoStopAtMs(activeShift: ActiveShiftState): number | null {
  if (activeShift.paymentMode !== "hourly") {
    return null;
  }

  const startedAtMs = parseDateMs(activeShift.startedAt);

  if (startedAtMs == null) {
    return null;
  }

  return startedAtMs + HOURLY_MAX_SECONDS * MILLISECONDS_PER_SECOND;
}

function formatElapsedTime(totalSeconds: number): string {
  const safeSeconds = Math.max(Math.floor(totalSeconds), 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
}

function formatStartedAtLabel(value: string | null): string | null {
  const timestamp = parseDateMs(value);

  if (timestamp == null) {
    return null;
  }

  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function formatMinutesLabel(totalMinutes: number): string {
  const safeMinutes = Math.max(Math.floor(totalMinutes), 0);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  return `${hours}:${minutes.toString().padStart(2, "0")}h`;
}

function createAutoStopMissingLocation(): LocalShiftLocationCheckpoint {
  return {
    accuracyMeters: null,
    capturedAt: new Date().toISOString(),
    latitude: null,
    locationType: "stop",
    longitude: null,
    message: "Endstandort beim Auto-Stopp nicht erfasst.",
    missingReason: "unavailable",
    distanceFromDepotMeters: null,
    isInsideDepotGeofence: null,
    status: "missing",
  };
}

function isBackendShiftId(shiftId: string | null): shiftId is string {
  return Boolean(shiftId && !shiftId.startsWith("local-"));
}

function buildLocationCheckpointFromServer(
  location: ShiftLocation,
): LocalShiftLocationCheckpoint {
  return {
    accuracyMeters: location.accuracy_meters,
    capturedAt: location.created_at,
    distanceFromDepotMeters: location.distance_from_depot_meters,
    isInsideDepotGeofence: location.is_inside_depot_geofence,
    latitude: Number(location.latitude),
    locationType: location.location_type,
    longitude: Number(location.longitude),
    message:
      location.location_type === "start"
        ? "Startstandort serverseitig gespeichert."
        : "Endstandort serverseitig gespeichert.",
    missingReason: null,
    status: "captured",
  };
}

function getLocationCheckpointFromServer(
  locations: ShiftLocation[],
  locationType: "start" | "stop",
): LocalShiftLocationCheckpoint | null {
  const location = locations.find((item) => item.location_type === locationType);

  return location ? buildLocationCheckpointFromServer(location) : null;
}

async function saveCapturedLocationCheckpoint({
  checkpoint,
  shiftId,
}: {
  checkpoint: LocalShiftLocationCheckpoint;
  shiftId: string;
}): Promise<{
  checkpoint: LocalShiftLocationCheckpoint;
  error: string | null;
}> {
  if (checkpoint.status !== "captured") {
    return {
      checkpoint,
      error: null,
    };
  }

  const result = await saveShiftLocation({
    accuracyMeters: checkpoint.accuracyMeters,
    latitude: checkpoint.latitude,
    locationType: checkpoint.locationType,
    longitude: checkpoint.longitude,
    shiftId,
  });

  if (result.error || !result.location) {
    return {
      checkpoint,
      error: result.error ?? "Schichtstandort konnte nicht gespeichert werden.",
    };
  }

  return {
    checkpoint: buildLocationCheckpointFromServer(result.location),
    error: null,
  };
}

function buildActiveShiftFromBackendShift(
  shift: Shift,
  storedActiveShift: ActiveShiftState | null,
  locations: ShiftLocation[] = [],
): ActiveShiftState {
  const canReuseStoredLocations = storedActiveShift?.shiftId === shift.id;
  const storedStartLocation = canReuseStoredLocations
    ? storedActiveShift.startLocation
    : null;
  const storedStopLocation = canReuseStoredLocations
    ? storedActiveShift.stopLocation
    : null;
  const serverStartLocation = getLocationCheckpointFromServer(locations, "start");
  const serverStopLocation = getLocationCheckpointFromServer(locations, "stop");

  return {
    autoStoppedAtMaxHours: shift.auto_stopped_at_max_hours,
    currentDepotId: shift.depot_id,
    isRunning: shift.end_time === null,
    paymentMode: shift.payment_mode_snapshot,
    shiftId: shift.id,
    startedAt: shift.start_time,
    startLocation:
      serverStartLocation ?? storedStartLocation ?? createPendingLocationCheckpoint("start"),
    stopLocation:
      serverStopLocation ??
      storedStopLocation ??
      (shift.auto_stopped_at_max_hours
        ? createAutoStopMissingLocation()
        : createPendingLocationCheckpoint("stop")),
  };
}

export function useLocalShiftTimer({
  courierProfileId,
  currentDepotId,
  enabled = true,
  paymentMode,
}: UseLocalShiftTimerParams): UseLocalShiftTimerResult {
  const [activeShift, setActiveShift] = useState<ActiveShiftState>(() =>
    createInitialActiveShift({ courierProfileId, currentDepotId, enabled, paymentMode }),
  );
  const [backendError, setBackendError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("idle");
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [capturingLocationType, setCapturingLocationType] = useState<"start" | "stop" | null>(
    null,
  );
  const [nowMs, setNowMs] = useState(() => Date.now());
  const autoStopAttemptedShiftIdRef = useRef<string | null>(null);

  const refreshShift = useCallback(async (): Promise<void> => {
    if (!enabled || !courierProfileId) {
      const nextShift = createInitialActiveShift({
        courierProfileId,
        currentDepotId,
        enabled,
        paymentMode,
      });

      setActiveShift(nextShift);
      setCompletedAt(null);
      setBackendError(null);
      await clearStoredActiveShiftSnapshot();
      return;
    }

    setBackendStatus("loading");
    setBackendError(null);

    try {
      const storedSnapshot = await getStoredActiveShiftSnapshot();
      const result = await loadTodayCourierShift(courierProfileId);

      if (result.error) {
        setBackendError(result.error);

        if (
          storedSnapshot &&
          isBackendShiftId(storedSnapshot.activeShift.shiftId)
        ) {
          setActiveShift(storedSnapshot.activeShift);
          setCompletedAt(storedSnapshot.completedAt);
        }

        return;
      }

      if (!result.shift) {
        const nextShift = createInitialActiveShift({
          courierProfileId,
          currentDepotId,
          enabled,
          paymentMode,
        });

        setActiveShift(nextShift);
        setCompletedAt(null);
        await clearStoredActiveShiftSnapshot();
        return;
      }

      const locationsResult = await loadShiftLocations(result.shift.id);
      const backendLocations = locationsResult.error ? [] : locationsResult.locations;

      if (locationsResult.error) {
        setBackendError(locationsResult.error);
      }

      const nextShift = buildActiveShiftFromBackendShift(
        result.shift,
        storedSnapshot?.activeShift ?? null,
        backendLocations,
      );
      const nextCompletedAt = result.shift.end_time;

      setActiveShift(nextShift);
      setCompletedAt(nextCompletedAt);
      setNowMs(Date.now());
      await saveStoredActiveShiftSnapshot(nextShift, nextCompletedAt);
    } finally {
      setBackendStatus("idle");
    }
  }, [courierProfileId, currentDepotId, enabled, paymentMode]);

  useEffect(() => {
    let isMounted = true;

    async function hydrateShift(): Promise<void> {
      await refreshShift();
    }

    if (isMounted) {
      void hydrateShift();
    }

    return () => {
      isMounted = false;
    };
  }, [refreshShift]);

  useEffect(() => {
    if (!activeShift.isRunning) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [activeShift.isRunning]);

  const startShift = useCallback(async () => {
    if (
      completedAt ||
      activeShift.isRunning ||
      capturingLocationType ||
      backendStatus !== "idle"
    ) {
      return;
    }

    if (!currentDepotId) {
      setBackendError("Kein Depot fuer dein Kurierprofil hinterlegt.");
      return;
    }

    setBackendStatus("saving");
    setBackendError(null);
    setCapturingLocationType("start");
    const locationResult = await captureShiftLocation("start");
    setCapturingLocationType(null);

    const result = await startCourierShift({ depotId: currentDepotId });

    if (result.error || !result.shift) {
      setBackendError(result.error ?? "Schicht konnte nicht gestartet werden.");
      setBackendStatus("idle");
      return;
    }

    const savedLocationResult = await saveCapturedLocationCheckpoint({
      checkpoint: locationResult.checkpoint,
      shiftId: result.shift.id,
    });

    if (savedLocationResult.error) {
      setBackendError(
        `Schicht gestartet, aber Standort wurde noch nicht serverseitig gespeichert: ${savedLocationResult.error}`,
      );
    }

    const nextShift = buildActiveShiftFromBackendShift(result.shift, {
      shiftId: result.shift.id,
      startedAt: result.shift.start_time,
      currentDepotId: result.shift.depot_id,
      paymentMode: result.shift.payment_mode_snapshot,
      isRunning: true,
      autoStoppedAtMaxHours: false,
      startLocation: savedLocationResult.checkpoint,
      stopLocation: createPendingLocationCheckpoint("stop"),
    });

    setNowMs(Date.now());
    setActiveShift(nextShift);
    setCompletedAt(null);
    await saveStoredActiveShiftSnapshot(nextShift, null);
    setBackendStatus("idle");
  }, [
    activeShift.isRunning,
    backendStatus,
    capturingLocationType,
    completedAt,
    currentDepotId,
  ]);

  const completeShift = useCallback(
    async ({
      captureStopLocation,
    }: {
      captureStopLocation: boolean;
    }): Promise<void> => {
      if (
        !activeShift.isRunning ||
        !isBackendShiftId(activeShift.shiftId) ||
        capturingLocationType ||
        backendStatus !== "idle"
      ) {
        return;
      }

      setBackendStatus("saving");
      setBackendError(null);

      let stopLocation = activeShift.stopLocation;

      if (captureStopLocation) {
        setCapturingLocationType("stop");
        const locationResult = await captureShiftLocation("stop");
        setCapturingLocationType(null);
        stopLocation = locationResult.checkpoint;
      } else {
        stopLocation = createAutoStopMissingLocation();
      }

      const result = await endCourierShift({ shiftId: activeShift.shiftId });

      if (result.error || !result.shift) {
        setBackendError(result.error ?? "Schicht konnte nicht beendet werden.");
        setBackendStatus("idle");
        return;
      }

      const savedLocationResult = await saveCapturedLocationCheckpoint({
        checkpoint: stopLocation,
        shiftId: result.shift.id,
      });

      if (savedLocationResult.error) {
        setBackendError(
          `Schicht beendet, aber Endstandort wurde noch nicht serverseitig gespeichert: ${savedLocationResult.error}`,
        );
      }

      const nextShift = buildActiveShiftFromBackendShift(result.shift, {
        ...activeShift,
        stopLocation: savedLocationResult.checkpoint,
      });
      const nextCompletedAt = result.shift.end_time;

      setCompletedAt(nextCompletedAt);
      setNowMs(Date.now());
      setActiveShift(nextShift);
      await saveStoredActiveShiftSnapshot(nextShift, nextCompletedAt);
      setBackendStatus("idle");
    },
    [activeShift, backendStatus, capturingLocationType],
  );

  useEffect(() => {
    if (!activeShift.isRunning || backendStatus !== "idle") {
      return;
    }

    const autoStopAtMs = getHourlyAutoStopAtMs(activeShift);

    if (autoStopAtMs == null || nowMs < autoStopAtMs) {
      return;
    }

    if (
      !isBackendShiftId(activeShift.shiftId) ||
      autoStopAttemptedShiftIdRef.current === activeShift.shiftId
    ) {
      return;
    }

    autoStopAttemptedShiftIdRef.current = activeShift.shiftId;

    void completeShift({ captureStopLocation: false });
  }, [activeShift, backendStatus, completeShift, nowMs]);

  const stopShift = useCallback(async () => {
    if (!activeShift.isRunning || capturingLocationType || backendStatus !== "idle") {
      return;
    }

    await completeShift({ captureStopLocation: true });
  }, [activeShift.isRunning, backendStatus, capturingLocationType, completeShift]);

  const elapsedSeconds = useMemo(() => {
    const startedAtMs = parseDateMs(activeShift.startedAt);

    if (startedAtMs == null) {
      return 0;
    }

    const completedAtMs = parseDateMs(completedAt);
    const endMs = activeShift.isRunning ? nowMs : completedAtMs ?? nowMs;

    const rawElapsedSeconds = Math.max(
      Math.floor((endMs - startedAtMs) / MILLISECONDS_PER_SECOND),
      0,
    );

    return activeShift.paymentMode === "hourly"
      ? Math.min(rawElapsedSeconds, HOURLY_MAX_SECONDS)
      : rawElapsedSeconds;
  }, [activeShift.isRunning, activeShift.paymentMode, activeShift.startedAt, completedAt, nowMs]);

  const remainingSecondsUntilAutoStop = useMemo(() => {
    if (!activeShift.isRunning || activeShift.paymentMode !== "hourly") {
      return null;
    }

    return Math.max(HOURLY_MAX_SECONDS - elapsedSeconds, 0);
  }, [activeShift.isRunning, activeShift.paymentMode, elapsedSeconds]);

  const billableMinutes = useMemo(() => {
    const result = calculateBillableMinutes({
      grossMinutes: Math.floor(elapsedSeconds / SECONDS_PER_MINUTE),
      payroll: {
        paymentMode: activeShift.paymentMode,
      },
    });

    return result.billableMinutes;
  }, [activeShift.paymentMode, elapsedSeconds]);

  const isAutoStopWarning =
    remainingSecondsUntilAutoStop != null &&
    remainingSecondsUntilAutoStop <= AUTO_STOP_WARNING_SECONDS;

  const status: LocalTimerStatus = activeShift.autoStoppedAtMaxHours
    ? "auto_stopped"
    : activeShift.isRunning
      ? "running"
      : completedAt
        ? "ended"
        : "idle";

  return {
    activeShift,
    backendError,
    backendStatus,
    billableMinutes,
    billableTimeLabel: formatMinutesLabel(billableMinutes),
    capturingLocationType,
    clearBackendError: () => setBackendError(null),
    completedAt,
    elapsedSeconds,
    isAutoStopWarning,
    isBackendBusy: backendStatus !== "idle",
    isCapturingLocation: capturingLocationType !== null,
    remainingSecondsUntilAutoStop,
    refreshShift,
    status,
    timerLabel: formatElapsedTime(elapsedSeconds),
    startedAtLabel: formatStartedAtLabel(activeShift.startedAt),
    startShift,
    stopShift,
  };
}
