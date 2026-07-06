import { z } from "zod";
import {
  dateTimeStringSchema,
  invitationRoleSchema,
  uuidSchema,
} from "./common";

export const inviteCodeSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .pipe(z.string().min(6).max(24).regex(/^[A-Z0-9-]+$/));

export const invitationCreateSchema = z.object({
  companyId: uuidSchema,
  email: z.string().trim().email().max(254),
  role: invitationRoleSchema,
  depotId: uuidSchema.nullable().optional(),
  expiresAt: dateTimeStringSchema,
  createdBy: uuidSchema,
});

export const invitationUseSchema = z.object({
  email: z.string().trim().email().max(254),
  fullName: z.string().trim().min(1).max(160),
  inviteCode: inviteCodeSchema,
});

export type InviteCodeInput = z.infer<typeof inviteCodeSchema>;
export type InvitationCreateInput = z.infer<typeof invitationCreateSchema>;
export type InvitationUseInput = z.infer<typeof invitationUseSchema>;
