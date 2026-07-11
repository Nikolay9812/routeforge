import { z } from "zod";
import {
  billableSourceSchema,
  dateStringSchema,
  dateTimeStringSchema,
  nonEmptyStringSchema,
  nonNegativeIntegerSchema,
  optionalLongTextSchema,
  paymentModeSchema,
  reasonSchema,
  shiftLocationTypeSchema,
  shiftStatusSchema,
  uuidSchema,
} from "./common";

const packageCounterShape = {
  packagesDelivered: nonNegativeIntegerSchema,
  packagesReturned: nonNegativeIntegerSchema,
  packagesPickedUp: nonNegativeIntegerSchema,
  totalStops: nonNegativeIntegerSchema.nullable().optional(),
};

const kilometerFieldsShape = {
  startKm: nonNegativeIntegerSchema,
  endKm: nonNegativeIntegerSchema,
};

const shiftTimeRangeShape = {
  startTime: dateTimeStringSchema,
  endTime: dateTimeStringSchema,
};

export const packageCountersSchema = z.object(packageCounterShape);

export const kilometerFieldsSchema = z.object(kilometerFieldsShape).refine(
  (value) => value.endKm >= value.startKm,
  {
    message: "endKm must be greater than or equal to startKm.",
    path: ["endKm"],
  },
);

export const shiftTimeRangeSchema = z.object(shiftTimeRangeShape).refine(
  (value) => Date.parse(value.endTime) > Date.parse(value.startTime),
  {
    message: "endTime must be after startTime.",
    path: ["endTime"],
  },
);

export const billableOverrideSchema = z
  .object({
    billableSource: billableSourceSchema,
    billableMinutes: nonNegativeIntegerSchema,
    billableOverrideReason: z.string().trim().max(1000).nullable().optional(),
  })
  .refine(
    (value) =>
      value.billableSource !== "manual_override" ||
      Boolean(value.billableOverrideReason?.trim()),
    {
      message: "billableOverrideReason is required for manual overrides.",
      path: ["billableOverrideReason"],
    },
  );

export const shiftReportSchema = z
  .object({
    depotId: uuidSchema,
    courierProfileId: uuidSchema,
    shiftDate: dateStringSchema,
    paymentModeSnapshot: paymentModeSchema,
    vanPlate: nonEmptyStringSchema.max(32),
    courierNote: optionalLongTextSchema,
    signatureUrl: nonEmptyStringSchema.max(2048),
    signedAt: dateTimeStringSchema,
    ...shiftTimeRangeShape,
    ...kilometerFieldsShape,
    ...packageCounterShape,
  })
  .refine((value) => value.endKm >= value.startKm, {
    message: "endKm must be greater than or equal to startKm.",
    path: ["endKm"],
  })
  .refine((value) => Date.parse(value.endTime) > Date.parse(value.startTime), {
    message: "endTime must be after startTime.",
    path: ["endTime"],
  });

export const shiftReportSubmissionSchema = z
  .object({
    shiftId: uuidSchema,
    tourNumber: nonEmptyStringSchema.max(64),
    vanPlate: nonEmptyStringSchema.max(32),
    startKm: nonNegativeIntegerSchema,
    endKm: nonNegativeIntegerSchema,
    packagesDelivered: nonNegativeIntegerSchema,
    packagesReturned: nonNegativeIntegerSchema,
    packagesPickedUp: nonNegativeIntegerSchema,
    totalStops: nonNegativeIntegerSchema.nullable(),
    courierNote: z.string().trim().max(1000).nullable(),
    missingProofExplanation: z.string().trim().max(1000).nullable(),
    signatureUrl: nonEmptyStringSchema
      .max(2048)
      .refine((value) => !value.startsWith("local-signature://"), {
        message: "signatureUrl must point to durable storage.",
      }),
    signatureStorageKey: nonEmptyStringSchema.max(2048),
    signedAt: dateTimeStringSchema,
  })
  .refine((value) => value.endKm >= value.startKm, {
    message: "endKm must be greater than or equal to startKm.",
    path: ["endKm"],
  });

export const shiftRejectionSchema = z.object({
  shiftId: uuidSchema,
  rejectionReason: reasonSchema,
});

export const shiftCorrectionSchema = z
  .object({
    shiftId: uuidSchema,
    startTime: dateTimeStringSchema.optional(),
    endTime: dateTimeStringSchema.optional(),
    breakMinutes: nonNegativeIntegerSchema.optional(),
    billableMinutes: nonNegativeIntegerSchema.optional(),
    courierNote: optionalLongTextSchema,
    correctionReason: reasonSchema,
    startKm: nonNegativeIntegerSchema.optional(),
    endKm: nonNegativeIntegerSchema.optional(),
    packagesDelivered: nonNegativeIntegerSchema.optional(),
    packagesReturned: nonNegativeIntegerSchema.optional(),
    packagesPickedUp: nonNegativeIntegerSchema.optional(),
    totalStops: nonNegativeIntegerSchema.nullable().optional(),
  })
  .refine(
    (value) =>
      value.startKm == null ||
      value.endKm == null ||
      value.endKm >= value.startKm,
    {
      message: "endKm must be greater than or equal to startKm.",
      path: ["endKm"],
    },
  )
  .refine(
    (value) =>
      value.startTime == null ||
      value.endTime == null ||
      Date.parse(value.endTime) > Date.parse(value.startTime),
    {
      message: "endTime must be after startTime.",
      path: ["endTime"],
    },
  );

export const shiftStatusUpdateSchema = z
  .object({
    shiftId: uuidSchema,
    status: shiftStatusSchema,
    reason: z.string().trim().max(1000).nullable().optional(),
  })
  .refine(
    (value) =>
      (value.status !== "rejected" && value.status !== "corrected") ||
      Boolean(value.reason?.trim()),
    {
      message: "reason is required for rejected or corrected shifts.",
      path: ["reason"],
    },
  );

export const shiftStartMutationSchema = z.object({
  depotId: uuidSchema,
});

export const shiftEndMutationSchema = z.object({
  shiftId: uuidSchema,
});

export const shiftLocationMutationSchema = z.object({
  accuracyMeters: z.number().nonnegative().nullable().optional(),
  latitude: z.number().min(-90).max(90),
  locationType: shiftLocationTypeSchema,
  longitude: z.number().min(-180).max(180),
  shiftId: uuidSchema,
});

export type PackageCountersInput = z.infer<typeof packageCountersSchema>;
export type KilometerFieldsInput = z.infer<typeof kilometerFieldsSchema>;
export type ShiftTimeRangeInput = z.infer<typeof shiftTimeRangeSchema>;
export type BillableOverrideInput = z.infer<typeof billableOverrideSchema>;
export type ShiftReportInput = z.infer<typeof shiftReportSchema>;
export type ShiftReportSubmissionInput = z.infer<
  typeof shiftReportSubmissionSchema
>;
export type ShiftRejectionInput = z.infer<typeof shiftRejectionSchema>;
export type ShiftCorrectionInput = z.infer<typeof shiftCorrectionSchema>;
export type ShiftStatusUpdateInput = z.infer<typeof shiftStatusUpdateSchema>;
export type ShiftStartMutationInput = z.infer<typeof shiftStartMutationSchema>;
export type ShiftEndMutationInput = z.infer<typeof shiftEndMutationSchema>;
export type ShiftLocationMutationInput = z.infer<typeof shiftLocationMutationSchema>;
