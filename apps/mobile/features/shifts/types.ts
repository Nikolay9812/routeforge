import type { PaymentMode } from "@routeforge/shared";

export type ActiveShiftState = {
  shiftId: string | null;
  startedAt: string | null;
  currentDepotId: string | null;
  paymentMode: PaymentMode;
  isRunning: boolean;
  autoStoppedAtMaxHours: boolean;
};

export type StoredActiveShiftSnapshot = {
  activeShift: ActiveShiftState;
  completedAt: string | null;
};
