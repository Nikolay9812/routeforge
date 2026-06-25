import type { ShiftStatus } from "./types";

export const SHIFT_STATUSES: readonly ShiftStatus[] = [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "corrected",
];

export type ShiftStatusTransitionInput = {
  from: ShiftStatus;
  to: ShiftStatus;
  reason?: string | null;
};

export type ShiftStatusTransitionResult =
  | { allowed: true }
  | { allowed: false; reason: string };

export const SHIFT_STATUS_TRANSITIONS: Readonly<
  Record<ShiftStatus, readonly ShiftStatus[]>
> = {
  draft: ["submitted"],
  submitted: ["under_review", "approved", "rejected", "corrected"],
  under_review: ["approved", "rejected", "corrected"],
  approved: [],
  rejected: ["submitted"],
  corrected: ["approved", "rejected"],
};

export function isShiftEditableByCourier(status: ShiftStatus): boolean {
  return status === "draft" || status === "rejected";
}

export function isShiftReadyForReview(status: ShiftStatus): boolean {
  return status === "submitted" || status === "under_review";
}

export function isShiftApproved(status: ShiftStatus): status is "approved" {
  return status === "approved";
}

export function isShiftLockedForCourier(status: ShiftStatus): boolean {
  return !isShiftEditableByCourier(status);
}

export function requiresShiftTransitionReason(
  status: ShiftStatus,
): boolean {
  return status === "rejected" || status === "corrected";
}

export function canTransitionShiftStatus(
  input: ShiftStatusTransitionInput,
): ShiftStatusTransitionResult {
  if (input.from === input.to) {
    return {
      allowed: false,
      reason: "Shift status is already in the requested state.",
    };
  }

  if (!SHIFT_STATUS_TRANSITIONS[input.from].includes(input.to)) {
    return {
      allowed: false,
      reason: `Cannot transition shift from ${input.from} to ${input.to}.`,
    };
  }

  if (requiresShiftTransitionReason(input.to) && !input.reason?.trim()) {
    return {
      allowed: false,
      reason: `A reason is required to transition shift to ${input.to}.`,
    };
  }

  return { allowed: true };
}
