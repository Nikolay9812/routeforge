import { DocumentUploadLocalLogic } from "@/components/documents/DocumentUploadLocalLogic";
import {
  adminDocumentFilterGroups,
  adminDocumentListItems,
  adminDocumentTabs,
  adminDocumentUploadDraft,
} from "@/lib/mock/adminDocuments";

export default function AdminDocumentsPage() {
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

      <DocumentUploadLocalLogic
        filters={adminDocumentFilterGroups}
        initialDocuments={adminDocumentListItems}
        tabs={adminDocumentTabs}
        uploadDraft={adminDocumentUploadDraft}
      />
    </div>
  );
}
