import {
  DAILY_FIXED_MINUTES,
  HOURLY_MAX_MINUTES,
  LEGAL_BREAK_AFTER_NINE_HOURS_MINUTES,
  LEGAL_BREAK_AFTER_SIX_HOURS_MINUTES,
  NINE_HOURS_MINUTES,
  SIX_HOURS_MINUTES,
} from "./constants";
import type { BillableSource, PayrollSettings } from "./types";

export type PayrollCalculationSettings = Pick<PayrollSettings, "paymentMode"> &
  Partial<Pick<PayrollSettings, "dailyFixedMinutes" | "hourlyMaxMinutes">>;

export type PayrollCalculationInput = {
  grossMinutes: number;
  manualBreakMinutes?: number | null;
  payroll: PayrollCalculationSettings;
  manualOverrideMinutes?: number | null;
  manualOverrideReason?: string | null;
};

export type PayrollCalculationResult = {
  grossMinutes: number;
  breakMinutes: number;
  netMinutes: number;
  billableMinutes: number;
  billableSource: BillableSource;
  autoStoppedAtMaxHours: boolean;
};

export function calculateLegalBreakMinutes(grossMinutes: number): number {
  assertWholeMinutes(grossMinutes, "grossMinutes");

  if (grossMinutes > NINE_HOURS_MINUTES) {
    return LEGAL_BREAK_AFTER_NINE_HOURS_MINUTES;
  }

  if (grossMinutes > SIX_HOURS_MINUTES) {
    return LEGAL_BREAK_AFTER_SIX_HOURS_MINUTES;
  }

  return 0;
}

export function calculateBillableMinutes(
  params: PayrollCalculationInput,
): PayrollCalculationResult {
  assertWholeMinutes(params.grossMinutes, "grossMinutes");

  const dailyFixedMinutes =
    params.payroll.dailyFixedMinutes ?? DAILY_FIXED_MINUTES;
  const hourlyMaxMinutes = params.payroll.hourlyMaxMinutes ?? HOURLY_MAX_MINUTES;

  assertWholeMinutes(dailyFixedMinutes, "dailyFixedMinutes");
  assertWholeMinutes(hourlyMaxMinutes, "hourlyMaxMinutes");

  const autoStoppedAtMaxHours =
    params.payroll.paymentMode === "hourly" &&
    params.grossMinutes >= hourlyMaxMinutes;

  const legalBreak = calculateLegalBreakMinutes(params.grossMinutes);
  const manualBreak = params.manualBreakMinutes ?? 0;
  assertWholeMinutes(manualBreak, "manualBreakMinutes");

  const breakMinutes = Math.max(legalBreak, manualBreak);
  const netMinutes = Math.max(params.grossMinutes - breakMinutes, 0);

  if (params.manualOverrideMinutes != null) {
    assertWholeMinutes(params.manualOverrideMinutes, "manualOverrideMinutes");
    assertManualOverrideReason(params.manualOverrideReason);

    return {
      grossMinutes: params.grossMinutes,
      breakMinutes,
      netMinutes,
      billableMinutes: params.manualOverrideMinutes,
      billableSource: "manual_override",
      autoStoppedAtMaxHours,
    };
  }

  if (params.payroll.paymentMode === "daily_fixed") {
    return {
      grossMinutes: params.grossMinutes,
      breakMinutes,
      netMinutes,
      billableMinutes: dailyFixedMinutes,
      billableSource: "auto",
      autoStoppedAtMaxHours: false,
    };
  }

  const cappedNetMinutes = Math.min(netMinutes, hourlyMaxMinutes);

  return {
    grossMinutes: params.grossMinutes,
    breakMinutes,
    netMinutes,
    billableMinutes: cappedNetMinutes,
    billableSource: "auto",
    autoStoppedAtMaxHours,
  };
}

function assertWholeMinutes(value: number, fieldName: string): void {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
    throw new RangeError(`${fieldName} must be a non-negative whole minute value.`);
  }
}

function assertManualOverrideReason(reason: string | null | undefined): void {
  if (!reason?.trim()) {
    throw new Error("manualOverrideReason is required for billable overrides.");
  }
}
