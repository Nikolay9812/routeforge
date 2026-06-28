import { useCallback, useEffect, useMemo, useState } from "react";

import type { PaymentMode } from "@routeforge/shared";

import {
  getStoredActiveShiftSnapshot,
  saveStoredActiveShiftSnapshot,
} from "@/features/shifts/activeShiftStorage";

import type { ActiveShiftState } from "./types";

type UseLocalShiftTimerParams = {
  currentDepotId: string;
  paymentMode: PaymentMode;
};

type LocalTimerStatus = "idle" | "running" | "ended";

type UseLocalShiftTimerResult = {
  activeShift: ActiveShiftState;
  completedAt: string | null;
  elapsedSeconds: number;
  status: LocalTimerStatus;
  timerLabel: string;
  startedAtLabel: string | null;
  startShift: () => void;
  stopShift: () => void;
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
  };
}

function parseDateMs(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);

  return Number.isFinite(parsed) ? parsed : null;
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

export function useLocalShiftTimer({
  currentDepotId,
  paymentMode,
}: UseLocalShiftTimerParams): UseLocalShiftTimerResult {
  const [activeShift, setActiveShift] = useState<ActiveShiftState>(() =>
    createInitialActiveShift({ currentDepotId, paymentMode }),
  );
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    let isMounted = true;

    async function hydrateStoredShift(): Promise<void> {
      const storedSnapshot = await getStoredActiveShiftSnapshot();

      if (!isMounted || !storedSnapshot) {
        return;
      }

      setActiveShift(storedSnapshot.activeShift);
      setCompletedAt(storedSnapshot.completedAt);
      setNowMs(Date.now());
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

  const startShift = useCallback(() => {
    if (completedAt || activeShift.isRunning) {
      return;
    }

    const startedAt = new Date().toISOString();
    const nextShift: ActiveShiftState = {
      shiftId: `local-${startedAt}`,
      startedAt,
      currentDepotId,
      paymentMode,
      isRunning: true,
      autoStoppedAtMaxHours: false,
    };

    setNowMs(Date.now());
    setActiveShift(nextShift);
    void saveStoredActiveShiftSnapshot(nextShift, null);
  }, [activeShift.isRunning, completedAt, currentDepotId, paymentMode]);

  const stopShift = useCallback(() => {
    if (!activeShift.isRunning) {
      return;
    }

    const stoppedAt = new Date().toISOString();
    const nextShift: ActiveShiftState = {
      ...activeShift,
      isRunning: false,
    };

    setCompletedAt(stoppedAt);
    setNowMs(Date.now());
    setActiveShift(nextShift);
    void saveStoredActiveShiftSnapshot(nextShift, stoppedAt);
  }, [activeShift]);

  const elapsedSeconds = useMemo(() => {
    const startedAtMs = parseDateMs(activeShift.startedAt);

    if (startedAtMs == null) {
      return 0;
    }

    const completedAtMs = parseDateMs(completedAt);
    const endMs = activeShift.isRunning ? nowMs : completedAtMs ?? nowMs;

    return Math.max(Math.floor((endMs - startedAtMs) / 1000), 0);
  }, [activeShift.isRunning, activeShift.startedAt, completedAt, nowMs]);

  const status: LocalTimerStatus = activeShift.isRunning
    ? "running"
    : completedAt
      ? "ended"
      : "idle";

  return {
    activeShift,
    completedAt,
    elapsedSeconds,
    status,
    timerLabel: formatElapsedTime(elapsedSeconds),
    startedAtLabel: formatStartedAtLabel(activeShift.startedAt),
    startShift,
    stopShift,
  };
}
