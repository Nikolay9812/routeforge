import {
  shiftReportSchema,
  type PaymentMode,
  type ShiftPhotoType,
} from "@routeforge/shared";

export type DailyReportValidationDraft = {
  courierNote: string | null;
  courierProfileId: string;
  depotId: string;
  endKm: number;
  endTime: string;
  packagesDelivered: number;
  packagesPickedUp: number;
  packagesReturned: number;
  paymentModeSnapshot: PaymentMode;
  requiredPhotoTypes: ShiftPhotoType[];
  shiftDate: string;
  signatureUrl: string | null;
  signedAt: string | null;
  startKm: number;
  startTime: string;
  totalStops: number | null;
  tourNumber: string;
  uploadedPhotoTypes: ShiftPhotoType[];
  vanPlate: string;
};

export type DailyReportValidationField =
  | "courierNote"
  | "courierProfileId"
  | "depotId"
  | "endKm"
  | "endTime"
  | "packagesDelivered"
  | "packagesPickedUp"
  | "packagesReturned"
  | "paymentModeSnapshot"
  | "shiftDate"
  | "signature"
  | "startKm"
  | "startTime"
  | "totalStops"
  | "tourNumber"
  | "vanPlate";

export type DailyReportValidationResult = {
  fieldErrors: Partial<Record<DailyReportValidationField, string>>;
  isValid: boolean;
  missingProofExplanationError: string | null;
  missingPhotoTypes: ShiftPhotoType[];
  photoError: string | null;
  signatureError: string | null;
  summaryMessages: string[];
};

export type DailyReportLifecycleStatus = "draft" | "ready_to_submit" | "submitted";

export type DailyReportValidationInput = {
  draft: DailyReportValidationDraft;
  missingProofExplanation: string;
};

const fieldMessages: Record<DailyReportValidationField, string> = {
  courierNote: "Anmerkungen dürfen maximal 1000 Zeichen haben.",
  courierProfileId: "Kurierprofil fehlt.",
  depotId: "Depot ist erforderlich.",
  endKm: "End-KM muss größer oder gleich Start-KM sein.",
  endTime: "Endzeit muss nach der Startzeit liegen.",
  packagesDelivered: "Zustellungen müssen eine Zahl ab 0 sein.",
  packagesPickedUp: "Abholungen müssen eine Zahl ab 0 sein.",
  packagesReturned: "Rückläufer müssen eine Zahl ab 0 sein.",
  paymentModeSnapshot: "Vergütungsart ist erforderlich.",
  shiftDate: "Berichtstag ist erforderlich.",
  signature: "Unterschrift ist erforderlich.",
  startKm: "Start-KM ist erforderlich.",
  startTime: "Startzeit ist erforderlich.",
  totalStops: "Stopps müssen eine Zahl ab 0 sein.",
  tourNumber: "Tournummer ist erforderlich.",
  vanPlate: "Fahrzeug ist erforderlich.",
};

const schemaFieldMap: Record<string, DailyReportValidationField> = {
  courierNote: "courierNote",
  courierProfileId: "courierProfileId",
  depotId: "depotId",
  endKm: "endKm",
  endTime: "endTime",
  packagesDelivered: "packagesDelivered",
  packagesPickedUp: "packagesPickedUp",
  packagesReturned: "packagesReturned",
  paymentModeSnapshot: "paymentModeSnapshot",
  shiftDate: "shiftDate",
  signatureUrl: "signature",
  signedAt: "signature",
  startKm: "startKm",
  startTime: "startTime",
  totalStops: "totalStops",
  vanPlate: "vanPlate",
};

export function validateDailyReportDraft(
  input: DailyReportValidationDraft | DailyReportValidationInput,
): DailyReportValidationResult {
  const draft = "draft" in input ? input.draft : input;
  const missingProofExplanation =
    "draft" in input ? input.missingProofExplanation : "";
  const fieldErrors: Partial<Record<DailyReportValidationField, string>> = {};
  const trimmedTourNumber = draft.tourNumber.trim();

  if (!trimmedTourNumber) {
    fieldErrors.tourNumber = fieldMessages.tourNumber;
  }

  const schemaResult = shiftReportSchema.safeParse({
    courierNote: draft.courierNote,
    courierProfileId: draft.courierProfileId,
    depotId: draft.depotId,
    endKm: draft.endKm,
    endTime: draft.endTime,
    packagesDelivered: draft.packagesDelivered,
    packagesPickedUp: draft.packagesPickedUp,
    packagesReturned: draft.packagesReturned,
    paymentModeSnapshot: draft.paymentModeSnapshot,
    shiftDate: draft.shiftDate,
    signatureUrl: draft.signatureUrl ?? "",
    signedAt: draft.signedAt ?? "",
    startKm: draft.startKm,
    startTime: draft.startTime,
    totalStops: draft.totalStops,
    vanPlate: draft.vanPlate,
  });

  if (!schemaResult.success) {
    for (const issue of schemaResult.error.issues) {
      const schemaField = String(issue.path[0] ?? "");
      const field = schemaFieldMap[schemaField];

      if (field && !fieldErrors[field]) {
        fieldErrors[field] = fieldMessages[field];
      }
    }
  }

  const uploadedPhotoTypes = new Set(draft.uploadedPhotoTypes);
  const missingPhotoTypes = draft.requiredPhotoTypes.filter(
    (photoType) => !uploadedPhotoTypes.has(photoType),
  );
  const hasMissingProofExplanation = Boolean(missingProofExplanation.trim());
  const photoError =
    missingPhotoTypes.length > 0
      ? "Pflichtfoto fehlt. Bitte Foto nachreichen oder eine Erklärung erfassen."
      : null;
  const missingProofExplanationError =
    missingPhotoTypes.length > 0 && !hasMissingProofExplanation
      ? "Erklärung erforderlich, wenn Pflichtfotos fehlen."
      : null;
  const signatureError = fieldErrors.signature ?? null;
  const summaryMessages = [
    ...Object.values(fieldErrors),
    ...(photoError ? [photoError] : []),
    ...(missingProofExplanationError ? [missingProofExplanationError] : []),
  ];

  return {
    fieldErrors,
    isValid:
      schemaResult.success &&
      !fieldErrors.tourNumber &&
      (missingPhotoTypes.length === 0 || hasMissingProofExplanation),
    missingProofExplanationError,
    missingPhotoTypes,
    photoError,
    signatureError,
    summaryMessages,
  };
}
