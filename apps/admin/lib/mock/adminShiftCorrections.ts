import {
  calculateBillableMinutes,
} from "@routeforge/shared/src/payroll";
import {
  canTransitionShiftStatus,
} from "@routeforge/shared/src/shifts";
import type {
  BillableSource,
  PaymentMode,
  ShiftStatus,
} from "@routeforge/shared/src/types";

import type { AdminShiftReviewDetail } from "@/lib/mock/adminShiftDetails";

export type AdminShiftCorrectionDraft = {
  shiftId: string;
  shiftDate: string;
  paymentMode: PaymentMode;
  paymentModeLabel: string;
  status: ShiftStatus;
  statusLabel: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  billableMinutes: number;
  startKm: string;
  endKm: string;
  deliveredPackages: number;
  returnedPackages: number;
  pickedUpPackages: number;
  totalStops: number;
};

export type AdminShiftCorrectionPreview = {
  auditActions: string[];
  autoStoppedAtMaxHours: boolean;
  automaticBillableLabel: string;
  billableDifferenceLabel: string;
  billableSource: BillableSource;
  breakLabel: string;
  canSave: boolean;
  finalBillableLabel: string;
  grossLabel: string;
  isManualBillableOverride: boolean;
  netLabel: string;
  validationMessages: string[];
};

const INVALID_TIME_LABEL = "--:--";

function timeLabelToMinutes(value: string): number {
  const [hours = "0", minutes = "0"] = value.split(":");

  return Number(hours) * 60 + Number(minutes);
}

function numericLabelToNumber(value: string): number {
  return Number(value.replace(/\D/g, ""));
}

function parseTimeInput(value: string): number | null {
  const [hours, minutes] = value.split(":").map(Number);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

function formatMinutesLabel(minutes: number): string {
  const safeMinutes = Math.max(Math.trunc(minutes), 0);
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(
    2,
    "0",
  )}`;
}

function formatSignedMinutesLabel(minutes: number): string {
  const sign = minutes >= 0 ? "+" : "-";

  return `${sign}${formatMinutesLabel(Math.abs(minutes))}`;
}

function hasValidWholeMinutes(value: number): boolean {
  return Number.isFinite(value) && Number.isInteger(value) && value >= 0;
}

export function buildAdminShiftCorrectionDraft(
  shift: AdminShiftReviewDetail,
): AdminShiftCorrectionDraft {
  return {
    shiftId: shift.id,
    shiftDate: shift.shiftDate,
    paymentMode: shift.paymentMode,
    paymentModeLabel: shift.paymentModeLabel,
    status: shift.status,
    statusLabel: shift.statusLabel,
    startTime: shift.startTime,
    endTime: shift.endTime,
    breakMinutes: timeLabelToMinutes(shift.breakTime),
    billableMinutes: timeLabelToMinutes(shift.billableTime),
    startKm: shift.startKm,
    endKm: shift.endKm,
    deliveredPackages: numericLabelToNumber(shift.deliveredPackages),
    returnedPackages: numericLabelToNumber(shift.returnedPackages),
    pickedUpPackages: numericLabelToNumber(shift.pickedUpPackages),
    totalStops: numericLabelToNumber(shift.totalStops),
  };
}

export function buildAdminShiftCorrectionPreview(
  draft: AdminShiftCorrectionDraft,
  reason: string,
): AdminShiftCorrectionPreview {
  const validationMessages: string[] = [];
  const trimmedReason = reason.trim();
  const startMinutes = parseTimeInput(draft.startTime);
  const endMinutes = parseTimeInput(draft.endTime);
  const startKm = numericLabelToNumber(draft.startKm);
  const endKm = numericLabelToNumber(draft.endKm);

  if (!trimmedReason) {
    validationMessages.push("Korrekturgrund ist erforderlich.");
  }

  if (startMinutes == null || endMinutes == null) {
    validationMessages.push("Start- und Stoppzeit muessen gueltig sein.");
  }

  const grossMinutes =
    startMinutes != null && endMinutes != null ? endMinutes - startMinutes : 0;

  if (startMinutes != null && endMinutes != null && grossMinutes <= 0) {
    validationMessages.push("Stoppzeit muss nach der Startzeit liegen.");
  }

  if (!hasValidWholeMinutes(draft.breakMinutes)) {
    validationMessages.push("Pause muss eine ganze, positive Minutenzahl sein.");
  }

  if (!hasValidWholeMinutes(draft.billableMinutes)) {
    validationMessages.push(
      "Abrechenbare Minuten muessen eine ganze, positive Minutenzahl sein.",
    );
  }

  if (draft.breakMinutes > grossMinutes && grossMinutes > 0) {
    validationMessages.push("Pause darf die Bruttozeit nicht ueberschreiten.");
  }

  if (endKm < startKm) {
    validationMessages.push("End-KM muss groesser oder gleich Start-KM sein.");
  }

  const canCalculatePayroll =
    grossMinutes > 0 &&
    hasValidWholeMinutes(draft.breakMinutes) &&
    hasValidWholeMinutes(draft.billableMinutes);

  if (!canCalculatePayroll) {
    return {
      auditActions: ["shift_corrected"],
      autoStoppedAtMaxHours: false,
      automaticBillableLabel: INVALID_TIME_LABEL,
      billableDifferenceLabel: "+00:00",
      billableSource: "auto",
      breakLabel: INVALID_TIME_LABEL,
      canSave: false,
      finalBillableLabel: INVALID_TIME_LABEL,
      grossLabel: INVALID_TIME_LABEL,
      isManualBillableOverride: false,
      netLabel: INVALID_TIME_LABEL,
      validationMessages,
    };
  }

  const automaticResult = calculateBillableMinutes({
    grossMinutes,
    manualBreakMinutes: draft.breakMinutes,
    payroll: {
      paymentMode: draft.paymentMode,
    },
  });
  const isManualBillableOverride =
    draft.billableMinutes !== automaticResult.billableMinutes;
  const finalResult =
    isManualBillableOverride && trimmedReason
      ? calculateBillableMinutes({
          grossMinutes,
          manualBreakMinutes: draft.breakMinutes,
          manualOverrideMinutes: draft.billableMinutes,
          manualOverrideReason: trimmedReason,
          payroll: {
            paymentMode: draft.paymentMode,
          },
        })
      : automaticResult;
  const finalBillableMinutes = isManualBillableOverride
    ? draft.billableMinutes
    : finalResult.billableMinutes;
  const transition = canTransitionShiftStatus({
    from: draft.status,
    reason: trimmedReason,
    to: "corrected",
  });

  if (isManualBillableOverride && !trimmedReason) {
    validationMessages.push(
      "Abrechnungs-Override braucht ebenfalls einen Grund.",
    );
  }

  if (!transition.allowed && trimmedReason) {
    validationMessages.push(
      "Dieser Schichtstatus kann lokal nicht in korrigiert wechseln.",
    );
  }

  return {
    auditActions: isManualBillableOverride
      ? ["shift_corrected", "billable_time_overridden"]
      : ["shift_corrected"],
    autoStoppedAtMaxHours: finalResult.autoStoppedAtMaxHours,
    automaticBillableLabel: formatMinutesLabel(
      automaticResult.billableMinutes,
    ),
    billableDifferenceLabel: formatSignedMinutesLabel(
      finalBillableMinutes - automaticResult.billableMinutes,
    ),
    billableSource: isManualBillableOverride ? "manual_override" : "auto",
    breakLabel: formatMinutesLabel(finalResult.breakMinutes),
    canSave: validationMessages.length === 0 && transition.allowed,
    finalBillableLabel: formatMinutesLabel(finalBillableMinutes),
    grossLabel: formatMinutesLabel(finalResult.grossMinutes),
    isManualBillableOverride,
    netLabel: formatMinutesLabel(finalResult.netMinutes),
    validationMessages,
  };
}
