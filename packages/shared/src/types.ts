export type UserRole = "admin" | "dispatcher" | "courier";

export type PaymentMode = "hourly" | "daily_fixed";

export type ShiftStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "corrected";

export type BillableSource = "auto" | "manual_override";

export interface PayrollSettings {
  paymentMode: PaymentMode;
  dailyFixedMinutes: number; // 500 = 8:20
  hourlyMaxMinutes: number; // 600 = 10:00
}