import { z } from "zod";
import {
  dateStringSchema,
  nonEmptyStringSchema,
  paymentModeSchema,
  profileStatusSchema,
  supportedLanguageSchema,
  uuidSchema,
} from "./common";

export const profileFormSchema = z.object({
  fullName: nonEmptyStringSchema.max(160),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).nullable().optional(),
  birthDate: dateStringSchema.nullable().optional(),
  addressLine1: z.string().trim().max(200).nullable().optional(),
  postalCode: z.string().trim().max(16).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  primaryDepotId: uuidSchema.nullable().optional(),
  paymentMode: paymentModeSchema,
  preferredLanguage: supportedLanguageSchema.default("de"),
});

export const profileStatusUpdateSchema = z.object({
  profileId: uuidSchema,
  status: profileStatusSchema,
  reason: z.string().trim().max(1000).nullable().optional(),
});

export type ProfileFormInput = z.infer<typeof profileFormSchema>;
export type ProfileStatusUpdateInput = z.infer<typeof profileStatusUpdateSchema>;
