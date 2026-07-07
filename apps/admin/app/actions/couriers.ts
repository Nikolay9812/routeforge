"use server";

import type { Profile } from "@routeforge/shared";
import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import {
  formatAdminCourierApprovalState,
  type AdminCourierApprovalState,
  type AdminCourierProfileAuditItem,
} from "@/lib/couriers";
import { createRouteForgeServerClient } from "@/lib/insforge/server";

export type CourierApprovalMutationResult = {
  approvalState: AdminCourierApprovalState | null;
  error: string | null;
};

export async function approveCourierProfileAction(
  profileId: string,
  existingHistory: AdminCourierProfileAuditItem[],
): Promise<CourierApprovalMutationResult> {
  const session = await requireAdminSession();

  if (session.profile.role !== "admin") {
    return {
      approvalState: null,
      error: "Aktuell koennen nur Admins Kurierprofile freigeben.",
    };
  }

  const client = await createRouteForgeServerClient();
  const { data, error } = await client.database.rpc("approve_courier_profile", {
    p_profile_id: profileId,
  });

  if (error || !data) {
    return {
      approvalState: null,
      error: error?.message ?? "Kurierprofil konnte nicht freigegeben werden.",
    };
  }

  const profile = (Array.isArray(data) ? data[0] : data) as Profile;

  revalidatePath("/admin/couriers");
  revalidatePath(`/admin/couriers/${profile.id}`);

  return {
    approvalState: formatAdminCourierApprovalState({
      actorName: session.profile.full_name,
      existingHistory,
      profile,
    }),
    error: null,
  };
}
