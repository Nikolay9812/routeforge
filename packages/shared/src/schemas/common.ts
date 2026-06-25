import { z } from "zod";

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

export const uuidSchema = z.string().uuid();
export const dateStringSchema = z
  .string()
  .regex(dateOnlyPattern)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);

    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  });
export const dateTimeStringSchema = z.string().datetime({ offset: true });

export const nonEmptyStringSchema = z.string().trim().min(1);
export const reasonSchema = nonEmptyStringSchema.min(3).max(1000);
export const optionalLongTextSchema = z.string().trim().max(1000).nullable().optional();
export const nonNegativeIntegerSchema = z.number().int().nonnegative();
export const positiveIntegerSchema = z.number().int().positive();

export const userRoleSchema = z.enum(["admin", "dispatcher", "courier"]);
export const invitationRoleSchema = z.enum(["dispatcher", "courier"]);
export const profileStatusSchema = z.enum([
  "pending_approval",
  "active",
  "inactive",
  "suspended",
]);
export const paymentModeSchema = z.enum(["hourly", "daily_fixed"]);
export const shiftStatusSchema = z.enum([
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "corrected",
]);
export const billableSourceSchema = z.enum(["auto", "manual_override"]);
export const invitationStatusSchema = z.enum([
  "active",
  "used",
  "expired",
  "revoked",
]);
export const shiftLocationTypeSchema = z.enum(["start", "stop"]);
export const shiftPhotoTypeSchema = z.enum([
  "start_km",
  "end_km",
  "fahrtenbuch",
  "mentor",
]);
export const documentTypeSchema = z.enum([
  "payslip",
  "contract",
  "instruction",
  "notice",
  "other",
]);
export const mailboxCategorySchema = z.enum([
  "document",
  "payslip",
  "contract",
  "notice",
]);
export const supportedLanguageSchema = z.enum(["de", "bg"]);

export type UUIDInput = z.infer<typeof uuidSchema>;
export type DateStringInput = z.infer<typeof dateStringSchema>;
export type DateTimeStringInput = z.infer<typeof dateTimeStringSchema>;
export type ReasonInput = z.infer<typeof reasonSchema>;
export type UserRoleInput = z.infer<typeof userRoleSchema>;
export type InvitationRoleInput = z.infer<typeof invitationRoleSchema>;
export type ProfileStatusInput = z.infer<typeof profileStatusSchema>;
export type PaymentModeInput = z.infer<typeof paymentModeSchema>;
export type ShiftStatusInput = z.infer<typeof shiftStatusSchema>;
export type BillableSourceInput = z.infer<typeof billableSourceSchema>;
export type InvitationStatusInput = z.infer<typeof invitationStatusSchema>;
export type ShiftLocationTypeInput = z.infer<typeof shiftLocationTypeSchema>;
export type ShiftPhotoTypeInput = z.infer<typeof shiftPhotoTypeSchema>;
export type DocumentTypeInput = z.infer<typeof documentTypeSchema>;
export type MailboxCategoryInput = z.infer<typeof mailboxCategorySchema>;
export type SupportedLanguageInput = z.infer<typeof supportedLanguageSchema>;
