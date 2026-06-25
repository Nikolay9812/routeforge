import { z } from "zod";
import {
  documentTypeSchema,
  nonEmptyStringSchema,
  positiveIntegerSchema,
  uuidSchema,
} from "./common";

export const documentStorageBucketSchema = z.enum([
  "payslips",
  "courier-documents",
  "generated-pdfs",
]);

export const documentUploadMetadataSchema = z.object({
  companyId: uuidSchema,
  courierProfileId: uuidSchema.nullable().optional(),
  uploadedBy: uuidSchema,
  documentType: documentTypeSchema,
  title: nonEmptyStringSchema.max(180),
  storageBucket: documentStorageBucketSchema,
  storagePath: nonEmptyStringSchema.max(2048),
  mimeType: nonEmptyStringSchema.max(120),
  sizeBytes: positiveIntegerSchema,
  createMailboxItem: z.boolean().optional(),
  mailboxMessage: z.string().trim().max(1000).nullable().optional(),
});

export type DocumentStorageBucketInput = z.infer<
  typeof documentStorageBucketSchema
>;
export type DocumentUploadMetadataInput = z.infer<
  typeof documentUploadMetadataSchema
>;
