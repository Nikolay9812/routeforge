import type { Depot } from "@routeforge/shared";

export type AdminDepotTone = "primary" | "success" | "neutral";

export type AdminDepotListItem = Depot & {
  courierCount: number;
  dispatcherCount: number;
  statusLabel: string;
  statusTone: AdminDepotTone;
};

export type AdminDepotSummary = {
  active: number;
  assignedCouriers: number;
  total: number;
};

export function formatAdminDepotListItem({
  courierCount,
  depot,
  dispatcherCount,
}: {
  courierCount: number;
  depot: Depot;
  dispatcherCount: number;
}): AdminDepotListItem {
  return {
    ...depot,
    courierCount,
    dispatcherCount,
    statusLabel: depot.is_active ? "Aktiv" : "Inaktiv",
    statusTone: depot.is_active ? "success" : "neutral",
  };
}

export function getAdminDepotSummary(
  depots: AdminDepotListItem[],
): AdminDepotSummary {
  return {
    active: depots.filter((depot) => depot.is_active).length,
    assignedCouriers: depots.reduce(
      (total, depot) => total + depot.courierCount,
      0,
    ),
    total: depots.length,
  };
}
