import type { PaymentMode } from "@routeforge/shared";

import type { LocalShiftLocationCheckpoint } from "@/features/location/shiftLocationCapture";

export type ActiveShiftState = {
  shiftId: string | null;
  startedAt: string | null;
  currentDepotId: string | null;
  paymentMode: PaymentMode;
  isRunning: boolean;
  autoStoppedAtMaxHours: boolean;
  startLocation: LocalShiftLocationCheckpoint;
  stopLocation: LocalShiftLocationCheckpoint;
};

export type StoredActiveShiftSnapshot = {
  activeShift: ActiveShiftState;
  completedAt: string | null;
};
