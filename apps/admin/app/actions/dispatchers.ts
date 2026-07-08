"use server";

import {
  dispatcherDepotAccessMutationSchema,
  type DispatcherDepotAccessMutationInput,
} from "@routeforge/shared";
import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import { createRouteForgeServerClient } from "@/lib/insforge/server";

export type DispatcherDepotAccessMutationResult = {
  depotIds: string[];
  dispatcherProfileId: string;
  error: string | null;
  savedAtLabel: string | null;
};

export async function updateDispatcherDepotAccessAction(
  input: DispatcherDepotAccessMutationInput,
): Promise<DispatcherDepotAccessMutationResult> {
  const session = await requireAdminSession();

  if (session.profile.role !== "admin") {
    return {
      depotIds: [],
      dispatcherProfileId: input.dispatcherProfileId,
      error: "Nur aktive Admins koennen Dispatcher-Depot-Zugriff verwalten.",
      savedAtLabel: null,
    };
  }

  const parsed = dispatcherDepotAccessMutationSchema.safeParse(input);

  if (!parsed.success) {
    return {
      depotIds: [],
      dispatcherProfileId: input.dispatcherProfileId,
      error: "Bitte pruefe die Dispatcher- und Depot-Auswahl.",
      savedAtLabel: null,
    };
  }

  const client = await createRouteForgeServerClient();
  const { data, error } = await client.database.rpc(
    "set_dispatcher_depot_access",
    {
      p_depot_ids: parsed.data.depotIds,
      p_dispatcher_profile_id: parsed.data.dispatcherProfileId,
      p_reason: parsed.data.reason ?? null,
    },
  );

  if (error) {
    return {
      depotIds: [],
      dispatcherProfileId: parsed.data.dispatcherProfileId,
      error: error.message,
      savedAtLabel: null,
    };
  }

  const result = Array.isArray(data) ? data[0] : data;
  const depotIds = Array.isArray(result?.depot_ids)
    ? (result.depot_ids as string[])
    : parsed.data.depotIds;

  revalidatePath("/admin/dispatchers");
  revalidatePath("/admin/depots");

  return {
    depotIds,
    dispatcherProfileId: parsed.data.dispatcherProfileId,
    error: null,
    savedAtLabel: "Gerade eben serverseitig gespeichert",
  };
}
