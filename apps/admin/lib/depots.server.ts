import "server-only";

import type { Depot, Profile, ProfileDepotAccess } from "@routeforge/shared";

import type { AdminAuthSession } from "@/lib/auth";
import {
  formatAdminDepotListItem,
  getAdminDepotSummary,
} from "@/lib/depots";
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

export async function loadAdminDepotPageData(session: AdminAuthSession) {
  const client = await createRouteForgeServerClient();
  const { data: depotRows, error } = await client.database
    .from("depots")
    .select(depotSelect)
    .eq("company_id", session.profile.company_id)
    .order("is_active", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    return {
      canManage: session.profile.role === "admin",
      depots: [],
      error: "Depots konnten nicht geladen werden.",
      summary: getAdminDepotSummary([]),
    };
  }

  const depotRecords = (depotRows ?? []) as Depot[];
  const depotIds = depotRecords.map((depot) => depot.id);

  if (depotIds.length === 0) {
    return {
      canManage: session.profile.role === "admin",
      depots: [],
      error: null,
      summary: getAdminDepotSummary([]),
    };
  }

  const [{ data: courierRows }, { data: accessRows }] = await Promise.all([
    client.database
      .from("profiles")
      .select("id, primary_depot_id")
      .eq("company_id", session.profile.company_id)
      .eq("role", "courier")
      .in("primary_depot_id", depotIds),
    client.database
      .from("profile_depot_access")
      .select("id, depot_id")
      .eq("company_id", session.profile.company_id)
      .in("depot_id", depotIds),
  ]);

  const courierCounts = countByDepotId(
    (courierRows ?? []) as Pick<Profile, "id" | "primary_depot_id">[],
    "primary_depot_id",
  );
  const dispatcherCounts = countByDepotId(
    (accessRows ?? []) as Pick<ProfileDepotAccess, "id" | "depot_id">[],
    "depot_id",
  );
  const depots = depotRecords.map((depot) =>
    formatAdminDepotListItem({
      courierCount: courierCounts.get(depot.id) ?? 0,
      depot,
      dispatcherCount: dispatcherCounts.get(depot.id) ?? 0,
    }),
  );

  return {
    canManage: session.profile.role === "admin",
    depots,
    error: null,
    summary: getAdminDepotSummary(depots),
  };
}

function countByDepotId<T extends { id: string }>(
  rows: T[],
  key: keyof T,
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const depotId = row[key];

    if (typeof depotId === "string") {
      counts.set(depotId, (counts.get(depotId) ?? 0) + 1);
    }
  }

  return counts;
}
