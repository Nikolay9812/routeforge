import { DepotManagementView } from "@/components/depots/DepotManagementView";
import { requireAdminSession } from "@/lib/auth";
import { loadAdminDepotPageData } from "@/lib/depots.server";

export default async function AdminDepotsPage() {
  const session = await requireAdminSession();
  const data = await loadAdminDepotPageData(session);

  return (
    <DepotManagementView
      canManage={data.canManage}
      initialDepots={data.depots}
      loadError={data.error}
    />
  );
}
