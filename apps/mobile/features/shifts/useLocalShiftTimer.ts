import { useCallback, useEffect, useMemo, useState } from "react";

import {
  calculateBillableMinutes,
  HOURLY_MAX_MINUTES,
  type PaymentMode,
} from "@routeforge/shared";

import {
  captureShiftLocation,
  createPendingLocationCheckpoint,
} from "@/features/location/shiftLocationCapture";
import {
  getStoredActiveShiftSnapshot,
  saveStoredActiveShiftSnapshot,
} from "@/features/shifts/activeShiftStorage";

import type { ActiveShiftState } from "./types";

const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;
const HOURLY_MAX_SECONDS = HOURLY_MAX_MINUTES * SECONDS_PER_MINUTE;
const AUTO_STOP_WARNING_MINUTES = 30;
const AUTO_STOP_WARNING_SECONDS = AUTO_STOP_WARNING_MINUTES * SECONDS_PER_MINUTE;

type UseLocalShiftTimerParams = {
  currentDepotId: string;
  paymentMode: PaymentMode;
};

type LocalTimerStatus = "idle" | "running" | "ended" | "auto_stopped";

type UseLocalShiftTimerResult = {
  activeShift: ActiveShiftState;
  billableMinutes: number;
  billableTimeLabel: string;
  capturingLocationType: "start" | "stop" | null;
  completedAt: string | null;
  elapsedSeconds: number;
  isAutoStopWarning: boolean;
  isCapturingLocation: boolean;
  remainingSecondsUntilAutoStop: number | null;
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

function buildAutoStoppedShift(activeShift: ActiveShiftState): ActiveShiftState {
  return {
    ...activeShift,
    isRunning: false,
    autoStoppedAtMaxHours: true,
    stopLocation:
      activeShift.stopLocation.status === "pending"
        ? {
            accuracyMeters: null,
            capturedAt: new Date().toISOString(),
            latitude: null,
            locationType: "stop",
            longitude: null,
            message: "Endstandort beim Auto-Stopp nicht erfasst.",
            missingReason: "unavailable",
            status: "missing",
          }
        : activeShift.stopLocation,
  };
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

export function useLocalShiftTimer({
  currentDepotId,
  paymentMode,
}: UseLocalShiftTimerParams): UseLocalShiftTimerResult {
  const [activeShift, setActiveShift] = useState<ActiveShiftState>(() =>
    createInitialActiveShift({ currentDepotId, paymentMode }),
  );
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [capturingLocationType, setCapturingLocationType] = useState<"start" | "stop" | null>(
    null,
  );
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    let isMounted = true;

    async function hydrateStoredShift(): Promise<void> {
      const storedSnapshot = await getStoredActiveShiftSnapshot();

      if (!isMounted || !storedSnapshot) {
        return;
      }

      const currentNowMs = Date.now();
      const autoStopAtMs = getHourlyAutoStopAtMs(storedSnapshot.activeShift);

      if (
        storedSnapshot.activeShift.isRunning &&
        autoStopAtMs != null &&
        currentNowMs >= autoStopAtMs
      ) {
        const stoppedAt = new Date(autoStopAtMs).toISOString();
        const nextShift = buildAutoStoppedShift(storedSnapshot.activeShift);

        setActiveShift(nextShift);
        setCompletedAt(stoppedAt);
        setNowMs(autoStopAtMs);
        void saveStoredActiveShiftSnapshot(nextShift, stoppedAt);
        return;
      }

      setActiveShift(storedSnapshot.activeShift);
      setCompletedAt(storedSnapshot.completedAt);
      setNowMs(currentNowMs);
    }

    void hydrateStoredShift();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeShift.isRunning) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [activeShift.isRunning]);

  useEffect(() => {
    if (!activeShift.isRunning) {
      return;
    }

    const autoStopAtMs = getHourlyAutoStopAtMs(activeShift);

    if (autoStopAtMs == null || nowMs < autoStopAtMs) {
      return;
    }

    const stoppedAt = new Date(autoStopAtMs).toISOString();
    const nextShift = buildAutoStoppedShift(activeShift);

    setCompletedAt(stoppedAt);
    setNowMs(autoStopAtMs);
    setActiveShift(nextShift);
    void saveStoredActiveShiftSnapshot(nextShift, stoppedAt);
  }, [activeShift, nowMs]);

  const startShift = useCallback(async () => {
    if (completedAt || activeShift.isRunning || capturingLocationType) {
      return;
    }

    setCapturingLocationType("start");
    const locationResult = await captureShiftLocation("start");
    setCapturingLocationType(null);

    const startedAt = new Date().toISOString();
    const nextShift: ActiveShiftState = {
      shiftId: `local-${startedAt}`,
      startedAt,
      currentDepotId,
      paymentMode,
      isRunning: true,
      autoStoppedAtMaxHours: false,
      startLocation: locationResult.checkpoint,
      stopLocation: createPendingLocationCheckpoint("stop"),
    };

    setNowMs(Date.now());
    setActiveShift(nextShift);
    void saveStoredActiveShiftSnapshot(nextShift, null);
  }, [activeShift.isRunning, capturingLocationType, completedAt, currentDepotId, paymentMode]);

  const stopShift = useCallback(async () => {
    if (!activeShift.isRunning || capturingLocationType) {
      return;
    }

    setCapturingLocationType("stop");
    const locationResult = await captureShiftLocation("stop");
    setCapturingLocationType(null);

    const currentNowMs = Date.now();
    const autoStopAtMs = getHourlyAutoStopAtMs(activeShift);
    const shouldAutoStopAtLimit = autoStopAtMs != null && currentNowMs >= autoStopAtMs;
    const stoppedAt = new Date(shouldAutoStopAtLimit ? autoStopAtMs : currentNowMs).toISOString();
    const nextShift: ActiveShiftState = {
      ...(shouldAutoStopAtLimit ? buildAutoStoppedShift(activeShift) : activeShift),
      isRunning: false,
      stopLocation: locationResult.checkpoint,
    };

    setCompletedAt(stoppedAt);
    setNowMs(shouldAutoStopAtLimit && autoStopAtMs != null ? autoStopAtMs : currentNowMs);
    setActiveShift(nextShift);
    void saveStoredActiveShiftSnapshot(nextShift, stoppedAt);
  }, [activeShift, capturingLocationType]);

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
    billableMinutes,
    billableTimeLabel: formatMinutesLabel(billableMinutes),
    capturingLocationType,
    completedAt,
    elapsedSeconds,
    isAutoStopWarning,
    isCapturingLocation: capturingLocationType !== null,
    remainingSecondsUntilAutoStop,
    status,
    timerLabel: formatElapsedTime(elapsedSeconds),
    startedAtLabel: formatStartedAtLabel(activeShift.startedAt),
    startShift,
    stopShift,
  };
}
