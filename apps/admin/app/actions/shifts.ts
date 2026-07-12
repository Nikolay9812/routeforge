"use server";

import {
  shiftCorrectionSchema,
  shiftRejectionSchema,
  uuidSchema,
  type Shift,
  type ShiftCorrectionInput,
  type ShiftRejectionInput,
} from "@routeforge/shared";
import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import { createRouteForgeServerClient } from "@/lib/insforge/server";

export type ShiftReviewMutationResult = {
  error: string | null;
  shift: Shift | null;
};

export async function approveShiftAction(
  shiftId: string,
): Promise<ShiftReviewMutationResult> {
  const parsed = uuidSchema.safeParse(shiftId);

  if (!parsed.success) {
    return invalidShiftResult();
  }

  const session = await requireAdminSession();

  if (session.profile.role !== "admin") {
    return adminOnlyResult();
  }

  const client = await createRouteForgeServerClient();
  const { data, error } = await client.database.rpc("approve_admin_shift", {
    p_shift_id: parsed.data,
  });

  if (error || !data) {
    return {
      error: error?.message ?? "Schicht konnte nicht genehmigt werden.",
      shift: null,
    };
  }

  const shift = normalizeShiftResult(data);
  revalidateShiftReviewPaths(shift.id);

  return { error: null, shift };
}

export async function rejectShiftAction(
  input: ShiftRejectionInput,
): Promise<ShiftReviewMutationResult> {
  const parsed = shiftRejectionSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: "Bitte gib einen gueltigen Ablehnungsgrund ein.",
      shift: null,
    };
  }

  const session = await requireAdminSession();

  if (session.profile.role !== "admin") {
    return adminOnlyResult();
  }

  const client = await createRouteForgeServerClient();
  const { data, error } = await client.database.rpc("reject_admin_shift", {
    p_rejection_reason: parsed.data.rejectionReason,
    p_shift_id: parsed.data.shiftId,
  });

  if (error || !data) {
    return {
      error: error?.message ?? "Schicht konnte nicht abgelehnt werden.",
      shift: null,
    };
  }

  const shift = normalizeShiftResult(data);
  revalidateShiftReviewPaths(shift.id);

  return { error: null, shift };
}

export async function correctShiftAction(
  input: ShiftCorrectionInput,
): Promise<ShiftReviewMutationResult> {
  const parsed = shiftCorrectionSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: "Bitte pruefe alle Korrekturfelder und den Grund.",
      shift: null,
    };
  }

  const session = await requireAdminSession();

  if (session.profile.role !== "admin") {
    return adminOnlyResult();
  }

  const client = await createRouteForgeServerClient();
  const { data, error } = await client.database.rpc("correct_admin_shift", {
    p_billable_minutes: parsed.data.billableMinutes ?? null,
    p_break_minutes: parsed.data.breakMinutes ?? null,
    p_correction_reason: parsed.data.correctionReason,
    p_courier_note: parsed.data.courierNote ?? null,
    p_end_km: parsed.data.endKm ?? null,
    p_end_time: parsed.data.endTime ?? null,
    p_packages_delivered: parsed.data.packagesDelivered ?? null,
    p_packages_picked_up: parsed.data.packagesPickedUp ?? null,
    p_packages_returned: parsed.data.packagesReturned ?? null,
    p_shift_id: parsed.data.shiftId,
    p_start_km: parsed.data.startKm ?? null,
    p_start_time: parsed.data.startTime ?? null,
    p_total_stops: parsed.data.totalStops ?? null,
  });

  if (error || !data) {
    return {
      error: error?.message ?? "Schicht konnte nicht korrigiert werden.",
      shift: null,
    };
  }

  const shift = normalizeShiftResult(data);
  revalidateShiftReviewPaths(shift.id);

  return { error: null, shift };
}

function normalizeShiftResult(data: unknown): Shift {
  return (Array.isArray(data) ? data[0] : data) as Shift;
}

function revalidateShiftReviewPaths(shiftId: string): void {
  revalidatePath("/admin/shifts");
  revalidatePath(`/admin/shifts/${shiftId}`);
  revalidatePath(`/admin/shifts/${shiftId}/correction`);
}

function adminOnlyResult(): ShiftReviewMutationResult {
  return {
    error: "Aktuell koennen nur aktive Admins Schichten pruefen.",
    shift: null,
  };
}

function invalidShiftResult(): ShiftReviewMutationResult {
  return {
    error: "Schicht-ID ist ungueltig.",
    shift: null,
  };
}
