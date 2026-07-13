import { ExportPreviewRealData } from "@/components/exports/ExportPreviewRealData";
import { requireAdminSession } from "@/lib/auth";
import { loadAdminExportPageData } from "@/lib/adminExports.server";

export default async function AdminExportsPage() {
  const session = await requireAdminSession();
  const { exportDraft, initialMonth, initialRows } =
    await loadAdminExportPageData(session);

  return (
    <ExportPreviewRealData
      exportDraft={exportDraft}
      initialMonth={initialMonth}
      initialRows={initialRows}
    />
  );
}
