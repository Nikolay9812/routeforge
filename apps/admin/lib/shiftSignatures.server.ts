import "server-only";

import {
  shiftSignatureArtifactSchema,
  type ShiftSignatureArtifact,
} from "@routeforge/shared";

import {
  createRouteForgeServerClient,
  getInsForgePublicConfig,
} from "@/lib/insforge/server";

export type AdminShiftSignatureArtifactResult =
  | {
      artifact: ShiftSignatureArtifact | null;
      error: null;
    }
  | {
      artifact: null;
      error: string;
    };

export async function getShiftSignatureArtifactForReview(
  shiftId: string,
): Promise<AdminShiftSignatureArtifactResult> {
  if (!getInsForgePublicConfig()) {
    return {
      artifact: null,
      error: null,
    };
  }

  const client = await createRouteForgeServerClient();
  const { data, error } = await client.database.rpc(
    "get_shift_signature_artifact",
    {
      p_shift_id: shiftId,
    },
  );

  if (error) {
    console.error("[admin/shifts/signature]", error);

    return {
      artifact: null,
      error: "Unterschrift konnte nicht geladen werden.",
    };
  }

  return {
    artifact: normalizeShiftSignatureArtifactRow(data),
    error: null,
  };
}

function normalizeShiftSignatureArtifactRow(
  row: unknown,
): ShiftSignatureArtifact | null {
  const artifactRow = Array.isArray(row) ? row[0] : row;
  const parsed = shiftSignatureArtifactSchema.safeParse(artifactRow);

  return parsed.success ? parsed.data : null;
}
