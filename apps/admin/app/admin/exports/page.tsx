import { ExportPreviewLocalLogic } from "@/components/exports/ExportPreviewLocalLogic";
import {
  adminExportDraft,
  adminExportPreviewRows,
} from "@/lib/mock/adminExports";

export default function AdminExportsPage() {
  return (
    <ExportPreviewLocalLogic
      exportDraft={adminExportDraft}
      initialRows={adminExportPreviewRows}
    />
  );
}
