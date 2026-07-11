import {
  shiftReportSubmissionSchema,
  type Shift,
  type ShiftReportSubmissionInput,
} from "@routeforge/shared";

import type { DailyReportValidationDraft } from "@/features/report/dailyReportValidation";
import type { LocalSignature } from "@/features/report/signatureCapture";
import { insforge } from "@/lib/insforge-client";

type SubmitDailyReportInput = {
  localSignature: LocalSignature;
  missingProofExplanation: string;
  shift: Shift;
  validationDraft: DailyReportValidationDraft;
};

type SubmitDailyReportResult = {
  shift: Shift;
  signatureStorageKey: string;
  signatureUrl: string;
};

const SIGNATURE_BUCKET = "generated-pdfs" as const;
const SIGNATURE_FILE_NAME = "signature.svg";

export async function submitDailyReport(
  input: SubmitDailyReportInput,
): Promise<SubmitDailyReportResult> {
  const signatureStorageKey = buildDailyReportSignatureStorageKey(input.shift);
  const signatureUpload = await uploadDailyReportSignature(
    signatureStorageKey,
    input.localSignature,
  );
  const submission = createShiftReportSubmission({
    input,
    signatureStorageKey: signatureUpload.key,
    signatureUrl: signatureUpload.url,
  });
  const { data, error } = await insforge.database.rpc(
    "submit_courier_shift_report",
    {
      p_courier_note: submission.courierNote,
      p_end_km: submission.endKm,
      p_missing_proof_explanation: submission.missingProofExplanation,
      p_packages_delivered: submission.packagesDelivered,
      p_packages_picked_up: submission.packagesPickedUp,
      p_packages_returned: submission.packagesReturned,
      p_shift_id: submission.shiftId,
      p_signature_storage_key: submission.signatureStorageKey,
      p_signature_url: submission.signatureUrl,
      p_signed_at: submission.signedAt,
      p_start_km: submission.startKm,
      p_total_stops: submission.totalStops,
      p_tour_number: submission.tourNumber,
      p_van_plate: submission.vanPlate,
    },
  );

  if (error || !data) {
    throw new Error(
      error?.message ?? "Tagesbericht konnte nicht eingereicht werden.",
    );
  }

  return {
    shift: normalizeShiftRow(data),
    signatureStorageKey: submission.signatureStorageKey,
    signatureUrl: submission.signatureUrl,
  };
}

export function buildDailyReportSignatureStorageKey(shift: Shift): string {
  return `companies/${shift.company_id}/reports/${shift.id}/${SIGNATURE_FILE_NAME}`;
}

function createShiftReportSubmission({
  input,
  signatureStorageKey,
  signatureUrl,
}: {
  input: SubmitDailyReportInput;
  signatureStorageKey: string;
  signatureUrl: string;
}): ShiftReportSubmissionInput {
  return shiftReportSubmissionSchema.parse({
    courierNote: input.validationDraft.courierNote,
    endKm: input.validationDraft.endKm,
    missingProofExplanation: input.missingProofExplanation.trim()
      ? input.missingProofExplanation
      : null,
    packagesDelivered: input.validationDraft.packagesDelivered,
    packagesPickedUp: input.validationDraft.packagesPickedUp,
    packagesReturned: input.validationDraft.packagesReturned,
    shiftId: input.shift.id,
    signatureStorageKey,
    signatureUrl,
    signedAt: input.localSignature.signedAt,
    startKm: input.validationDraft.startKm,
    totalStops: input.validationDraft.totalStops,
    tourNumber: input.validationDraft.tourNumber,
    vanPlate: input.validationDraft.vanPlate,
  });
}

async function uploadDailyReportSignature(
  storageKey: string,
  signature: LocalSignature,
): Promise<{ key: string; url: string }> {
  const signatureBlob = await createSignatureBlob(signature.uploadPayload.localDataUri);
  const { data, error } = await insforge.storage
    .from(SIGNATURE_BUCKET)
    .upload(storageKey, signatureBlob);

  if (error || !data) {
    throw new Error(error?.message ?? "Unterschrift konnte nicht gespeichert werden.");
  }

  return {
    key: data.key,
    url: data.url,
  };
}

async function createSignatureBlob(localDataUri: string): Promise<Blob> {
  const response = await fetch(localDataUri);

  return response.blob();
}

function normalizeShiftRow(row: unknown): Shift {
  return row as Shift;
}
