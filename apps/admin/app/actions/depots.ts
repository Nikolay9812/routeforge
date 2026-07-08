"use server";

import {
  depotMutationSchema,
  type Depot,
  type DepotMutationInput,
} from "@routeforge/shared";
import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import { createRouteForgeServerClient } from "@/lib/insforge/server";

const depotSelect = `
  id,
  company_id,
  name,
  code,
  address_line_1,
  postal_code,
  city,
  country_code,
  latitude,
  longitude,
  geofence_radius_meters,
  is_active,
  created_at,
  updated_at
`;

export type DepotMutationResult = {
  depot: Depot | null;
  error: string | null;
};

export async function createDepotAction(
  input: DepotMutationInput,
): Promise<DepotMutationResult> {
  const session = await requireAdminSession();

  if (session.profile.role !== "admin") {
    return adminOnlyResult();
  }

  const parsed = depotMutationSchema.safeParse(input);

  if (!parsed.success) {
    return invalidDepotResult();
  }

  const client = await createRouteForgeServerClient();
  const values = toDepotWriteValues(parsed.data);
  const { data, error } = await client.database
    .from("depots")
    .insert([{ ...values, company_id: session.profile.company_id }])
    .select(depotSelect)
    .single();

  if (error || !data) {
    return {
      depot: null,
      error: getDepotWriteError(error?.message),
    };
  }

  revalidatePath("/admin/depots");
  return { depot: data as Depot, error: null };
}

export async function updateDepotAction(
  depotId: string,
  input: DepotMutationInput,
): Promise<DepotMutationResult> {
  const session = await requireAdminSession();

  if (session.profile.role !== "admin") {
    return adminOnlyResult();
  }

  const parsed = depotMutationSchema.safeParse(input);

  if (!parsed.success || !depotId) {
    return invalidDepotResult();
  }

  const client = await createRouteForgeServerClient();
  const { data, error } = await client.database
    .from("depots")
    .update(toDepotWriteValues(parsed.data))
    .eq("id", depotId)
    .eq("company_id", session.profile.company_id)
    .select(depotSelect)
    .maybeSingle();

  if (error || !data) {
    return {
      depot: null,
      error: getDepotWriteError(error?.message),
    };
  }

  revalidatePath("/admin/depots");
  return { depot: data as Depot, error: null };
}

function toDepotWriteValues(input: DepotMutationInput) {
  return {
    address_line_1: input.addressLine1,
    city: input.city,
    code: input.code,
    country_code: input.countryCode,
    geofence_radius_meters: input.geofenceRadiusMeters,
    is_active: input.isActive,
    latitude: input.latitude,
    longitude: input.longitude,
    name: input.name,
    postal_code: input.postalCode,
  };
}

function adminOnlyResult(): DepotMutationResult {
  return {
    depot: null,
    error: "Nur aktive Admins koennen Depots verwalten.",
  };
}

function invalidDepotResult(): DepotMutationResult {
  return {
    depot: null,
    error: "Bitte pruefe alle Depot- und Geofence-Felder.",
  };
}

function getDepotWriteError(message?: string): string {
  if (message?.toLowerCase().includes("unique")) {
    return "Dieser Depot-Code wird in der Firma bereits verwendet.";
  }

  return message ?? "Depot konnte nicht gespeichert werden.";
}
