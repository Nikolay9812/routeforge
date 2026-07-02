import type { AdminShiftReviewDetail } from "@/lib/mock/adminShiftDetails";

export type AdminShiftCorrectionDraft = {
  shiftId: string;
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

function timeLabelToMinutes(value: string): number {
  const [hours = "0", minutes = "0"] = value.split(":");

  return Number(hours) * 60 + Number(minutes);
}

function numericLabelToNumber(value: string): number {
  return Number(value.replace(/\D/g, ""));
}

export function buildAdminShiftCorrectionDraft(
  shift: AdminShiftReviewDetail,
): AdminShiftCorrectionDraft {
  return {
    shiftId: shift.id,
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
