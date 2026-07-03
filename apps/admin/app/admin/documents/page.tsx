import {
  adminDocumentFilterGroups,
  adminDocumentListItems,
  adminDocumentSummary,
  adminDocumentTabs,
  adminDocumentUploadDraft,
  type AdminDocumentTone,
} from "@/lib/mock/adminDocuments";

const toneClasses: Record<
  AdminDocumentTone,
  {
    badge: string;
    dot: string;
    soft: string;
    text: string;
  }
> = {
  primary: {
    badge: "bg-primary-lightest text-primary-darker",
    dot: "bg-primary",
    soft: "border-primary-light bg-primary-lightest",
    text: "text-primary",
  },
  info: {
    badge: "bg-info-lightest text-info-foreground",
    dot: "bg-info",
    soft: "border-info-light bg-info-lightest",
    text: "text-info-foreground",
  },
  success: {
    badge: "bg-success-lightest text-success-foreground",
    dot: "bg-success",
    soft: "border-success-light bg-success-lightest",
    text: "text-success-foreground",
  },
  warning: {
    badge: "bg-warning-lightest text-warning-foreground",
    dot: "bg-warning",
    soft: "border-warning-light bg-warning-lightest",
    text: "text-warning-foreground",
  },
  error: {
    badge: "bg-error-lightest text-error-foreground",
    dot: "bg-error",
    soft: "border-error-light bg-error-lightest",
    text: "text-error-foreground",
  },
  neutral: {
    badge: "bg-neutral-light text-neutral-foreground",
    dot: "bg-neutral",
    soft: "border-border bg-neutral-light",
    text: "text-neutral-foreground",
  },
};

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: AdminDocumentTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[tone].badge}`}
    >
      {label}
    </span>
  );
}

function SummaryTile({
  label,
  tone,
  value,
}: {
  label: string;
  tone: AdminDocumentTone;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 rounded-full ${toneClasses[tone].dot}`}
          aria-hidden="true"
        />
        <p className="text-sm font-semibold text-text-secondary">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-bold leading-9 text-text-primary">
        {value}
      </p>
    </div>
  );
}

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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          label="Dokumente gesamt"
          tone="primary"
          value={String(adminDocumentSummary.total)}
        />
        <SummaryTile
          label="Aktiv"
          tone="success"
          value={String(adminDocumentSummary.active)}
        />
        <SummaryTile
          label="Private Dateien"
          tone="warning"
          value={String(adminDocumentSummary.privateFiles)}
        />
        <SummaryTile
          label="Postfach bereit"
          tone="info"
          value={String(adminDocumentSummary.mailboxReady)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(380px,0.65fr)]">
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <div className="flex flex-wrap gap-2 border-b border-border-light pb-4">
              {adminDocumentTabs.map((tab, index) => (
                <button
                  className={`inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition ${
                    index === 0
                      ? "bg-primary-lightest text-primary"
                      : "text-text-secondary hover:bg-surface-secondary"
                  }`}
                  key={tab.label}
                  type="button"
                >
                  {tab.label}
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${toneClasses[tab.tone].badge}`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-primary-light bg-primary-lightest p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface text-sm font-bold text-primary shadow-card">
                    UP
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                      Dateien hier ablegen
                    </h2>
                    <p className="mt-1 text-sm leading-5 text-text-secondary">
                      PDF, DOCX, XLSX, JPG oder PNG als privates Dokument
                      vormerken. Maximal 50 MB pro Datei.
                    </p>
                    <p className="mt-2 text-xs font-medium text-primary-darker">
                      Mock-Upload: Datei wird in dieser Phase nicht gespeichert.
                    </p>
                  </div>
                </div>
                <label className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary">
                  Datei auswaehlen
                  <input className="sr-only" disabled type="file" />
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Filter
                </h2>
                <p className="mt-1 text-sm leading-5 text-text-secondary">
                  Statische UI-Filter fuer Dokumenttyp, Zielgruppe und
                  Sichtbarkeit. Lokale Upload-Logik folgt spaeter.
                </p>
              </div>
              <button
                className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
                type="button"
              >
                Filter zuruecksetzen
              </button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,0.9fr))]">
              <label className="block">
                <span className="text-xs font-semibold uppercase text-text-muted">
                  Suche
                </span>
                <input
                  className="mt-2 flex h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none transition placeholder:text-text-muted focus:border-primary"
                  placeholder="Dokument suchen (Titel, Kurier, Depot)"
                  type="search"
                />
              </label>

              {adminDocumentFilterGroups.map((filter) => (
                <label className="block" key={filter.label}>
                  <span className="text-xs font-semibold uppercase text-text-muted">
                    {filter.label}
                  </span>
                  <span className="mt-2 flex min-h-11 items-center justify-between rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card">
                    <span className="truncate">{filter.value}</span>
                    <span
                      className="text-xs font-bold text-text-muted"
                      aria-hidden="true"
                    >
                      v
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface shadow-card">
            <div className="flex flex-col gap-3 border-b border-border-light p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Dokumentenliste
                </h2>
                <p className="mt-1 text-sm leading-5 text-text-secondary">
                  Private Dateien und Postfach-Metadaten fuer den aktuellen
                  Mandanten.
                </p>
              </div>
              <p className="text-sm font-semibold text-text-secondary">
                {adminDocumentListItems.length} Dokumente angezeigt
              </p>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[1180px]">
                <div className="grid grid-cols-[1.25fr_0.8fr_1fr_0.9fr_0.85fr_0.8fr_0.75fr] bg-surface-secondary px-6 py-3 text-xs font-semibold uppercase text-text-subtle">
                  <span>Dateiname</span>
                  <span>Kategorie</span>
                  <span>Zielgruppe</span>
                  <span>Hochgeladen</span>
                  <span>Sichtbarkeit</span>
                  <span>Status</span>
                  <span>Aktionen</span>
                </div>

                <div className="divide-y divide-border-light">
                  {adminDocumentListItems.map((document) => (
                    <div
                      className="grid grid-cols-[1.25fr_0.8fr_1fr_0.9fr_0.85fr_0.8fr_0.75fr] items-center px-6 py-4 text-sm text-text-primary transition hover:bg-surface-secondary"
                      key={document.id}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-lightest text-xs font-bold text-primary-darker">
                          {document.mime_type === "application/pdf" ? "PDF" : "DOC"}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">
                            {document.title}
                          </span>
                          <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                            {document.id} - {document.fileSizeLabel}
                          </span>
                          <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                            {document.retentionLabel}
                          </span>
                        </span>
                      </span>

                      <span>
                        <StatusBadge
                          label={document.documentTypeLabel}
                          tone={
                            document.document_type === "payslip"
                              ? "success"
                              : document.document_type === "contract"
                                ? "info"
                                : "neutral"
                          }
                        />
                        <span className="mt-2 block text-xs font-medium text-text-muted">
                          {document.storage_bucket}
                        </span>
                      </span>

                      <span className="min-w-0">
                        <span className="block truncate font-semibold">
                          {document.courierName ?? "Alle Kuriere"}
                        </span>
                        <span className="mt-1 block truncate text-xs font-medium text-text-muted">
                          {document.depotName}
                        </span>
                      </span>

                      <span>
                        <span className="block font-semibold">
                          {document.uploadedAtLabel}
                        </span>
                        <span className="mt-1 block text-xs font-medium text-text-muted">
                          {document.uploadedByName}
                        </span>
                      </span>

                      <span>
                        <StatusBadge
                          label={document.visibilityLabel}
                          tone={document.visibilityTone}
                        />
                        <span className="mt-2 block text-xs font-medium text-text-muted">
                          {document.mailboxCategory}
                        </span>
                      </span>

                      <span>
                        <StatusBadge
                          label={document.statusLabel}
                          tone={document.statusTone}
                        />
                      </span>

                      <span className="flex flex-wrap gap-2">
                        <button
                          className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
                          type="button"
                        >
                          Details
                        </button>
                        <button
                          className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:bg-primary-dark"
                          type="button"
                        >
                          Teilen
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Upload-Entwurf
                </h2>
                <p className="mt-1 text-sm leading-5 text-text-secondary">
                  Statische Vorschau fuer den naechsten Dokument-Upload.
                </p>
              </div>
              <StatusBadge label="Mock" tone="info" />
            </div>

            <div className="mt-5 rounded-xl border border-primary-light bg-primary-lightest p-4">
              <p className="text-xs font-semibold uppercase text-primary-darker">
                Datei
              </p>
              <p className="mt-2 text-sm font-semibold text-text-primary">
                {adminDocumentUploadDraft.fileName}
              </p>
              <p className="mt-1 text-xs font-medium text-text-secondary">
                {adminDocumentUploadDraft.fileType} -{" "}
                {adminDocumentUploadDraft.fileSizeLabel}
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              {[
                ["Titel", adminDocumentUploadDraft.title],
                ["Kurier", adminDocumentUploadDraft.courierName],
                ["Depot", adminDocumentUploadDraft.depotName],
                ["Dokumenttyp", adminDocumentUploadDraft.documentTypeLabel],
                ["Private Bucket", adminDocumentUploadDraft.storageBucket],
              ].map(([label, value]) => (
                <label className="block" key={label}>
                  <span className="text-xs font-semibold uppercase text-text-muted">
                    {label}
                  </span>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none"
                    readOnly
                    value={value}
                  />
                </label>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-border-light bg-surface-secondary p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Postfach-Benachrichtigung
                  </p>
                  <p className="mt-1 text-xs font-medium text-text-secondary">
                    {adminDocumentUploadDraft.mailboxTitle}
                  </p>
                </div>
                <StatusBadge
                  label={adminDocumentUploadDraft.mailboxEnabled ? "An" : "Aus"}
                  tone={adminDocumentUploadDraft.mailboxEnabled ? "success" : "neutral"}
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-text-secondary">
                {adminDocumentUploadDraft.mailboxMessage}
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
                type="button"
              >
                Upload vorbereiten
              </button>
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
                type="button"
              >
                Entwurf verwerfen
              </button>
            </div>

            <p className="mt-4 rounded-xl border border-warning-light bg-warning-lightest px-4 py-3 text-xs leading-5 text-warning-foreground">
              {adminDocumentUploadDraft.auditReminder}
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">
              Zugriff & Sichtbarkeit
            </h2>
            <div className="mt-5 flex flex-col gap-3">
              {adminDocumentUploadDraft.visibilityRows.map((row) => (
                <div
                  className={`rounded-xl border px-4 py-3 ${toneClasses[row.tone].soft}`}
                  key={row.label}
                >
                  <p className={`text-xs font-semibold ${toneClasses[row.tone].text}`}>
                    {row.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">
              Upload-Checkliste
            </h2>
            <div className="mt-5 flex flex-col gap-3">
              {adminDocumentUploadDraft.checklist.map((item) => (
                <div
                  className="flex items-center gap-3 rounded-xl border border-border-light bg-surface-secondary px-4 py-3"
                  key={item.label}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      item.done ? "bg-success" : "bg-disabled"
                    }`}
                    aria-hidden="true"
                  />
                  <p className="text-sm font-semibold text-text-primary">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
