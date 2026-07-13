import "server-only";

import type { AdminAuthSession } from "@/lib/auth";
import type { AdminShellNotifications } from "@/lib/adminShell";
import { createRouteForgeServerClient } from "@/lib/insforge/server";

export async function loadAdminShellNotifications(
  session: AdminAuthSession,
): Promise<AdminShellNotifications> {
  const client = await createRouteForgeServerClient();
  const [{ data: shiftRows }, { data: courierRows }] = await Promise.all([
    client.database
      .from("shifts")
      .select("id")
      .eq("company_id", session.profile.company_id)
      .in("status", ["submitted", "under_review"]),
    client.database
      .from("profiles")
      .select("id")
      .eq("company_id", session.profile.company_id)
      .eq("role", "courier")
      .eq("status", "pending_approval"),
  ]);

  return {
    label: "Offene Aufgaben",
    pendingCount: (shiftRows?.length ?? 0) + (courierRows?.length ?? 0),
  };
}
