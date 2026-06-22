import type { PayrollSettings, BillableSource } from "./types";

export function calculateLegalBreakMinutes(grossMinutes: number): number {
  if (grossMinutes > 540) return 45;
  if (grossMinutes > 360) return 30;
  return 0;
}

export function calculateBillableMinutes(params: {
  grossMinutes: number;
  manualBreakMinutes?: number;
  payroll: PayrollSettings;
  manualOverrideMinutes?: number;
}): {
  grossMinutes: number;
  breakMinutes: number;
  netMinutes: number;
  billableMinutes: number;
  billableSource: BillableSource;
  autoStoppedAtMaxHours: boolean;
} {
  const legalBreak = calculateLegalBreakMinutes(params.grossMinutes);
  const manualBreak = params.manualBreakMinutes ?? 0;
  const breakMinutes = Math.max(legalBreak, manualBreak);

  const netMinutes = Math.max(params.grossMinutes - breakMinutes, 0);

  if (typeof params.manualOverrideMinutes === "number") {
    return {
      grossMinutes: params.grossMinutes,
      breakMinutes,
      netMinutes,
      billableMinutes: params.manualOverrideMinutes,
      billableSource: "manual_override",
      autoStoppedAtMaxHours: false,
    };
  }

  if (params.payroll.paymentMode === "daily_fixed") {
    return {
      grossMinutes: params.grossMinutes,
      breakMinutes,
      netMinutes,
      billableMinutes: params.payroll.dailyFixedMinutes,
      billableSource: "auto",
      autoStoppedAtMaxHours: false,
    };
  }

  const cappedNetMinutes = Math.min(netMinutes, params.payroll.hourlyMaxMinutes);

  return {
    grossMinutes: params.grossMinutes,
    breakMinutes,
    netMinutes,
    billableMinutes: cappedNetMinutes,
    billableSource: "auto",
    autoStoppedAtMaxHours: netMinutes >= params.payroll.hourlyMaxMinutes,
  };
}