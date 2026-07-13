import { DocumentUploadRealData } from "@/components/documents/DocumentUploadRealData";
import { requireAdminSession } from "@/lib/auth";
import { loadAdminDocumentPageData } from "@/lib/adminDocuments.server";

export default async function AdminDocumentsPage() {
  const session = await requireAdminSession();
  const data = await loadAdminDocumentPageData(session);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              Dokumentenverwaltung
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-[38px] text-text-primary">
              Dokumente
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
              Lade private Dokumente, Lohnabrechnungen und Hinweise fuer Kuriere
              hoch. Dateien bleiben private Mandanten-Daten.
            </p>
          </div>
          <button
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
            type="button"
          >
            Dokument hochladen
          </button>
        </div>
      </section>

      <DocumentUploadRealData
        courierOptions={data.courierOptions}
        filters={data.filters}
        initialDocuments={data.initialDocuments}
        tabs={data.tabs}
        uploadDraft={data.uploadDraft}
      />
    </div>
  );
}
