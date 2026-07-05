"use client";

import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";

import type {
  AdminDocumentFilterGroup,
  AdminDocumentListItem,
  AdminDocumentTab,
  AdminDocumentTone,
  AdminDocumentUploadDraft,
} from "@/lib/mock/adminDocuments";
import type { DocumentType, MailboxCategory } from "@routeforge/shared";

type DocumentUploadLocalLogicProps = {
  filters: AdminDocumentFilterGroup[];
  initialDocuments: AdminDocumentListItem[];
  tabs: AdminDocumentTab[];
  uploadDraft: AdminDocumentUploadDraft;
};

type CourierOption = {
  depotName: string;
  name: string;
  profileId: string;
};

type DocumentTypeOption = {
  label: string;
  value: DocumentType;
};

type SelectedFile = {
  name: string;
  size: number;
  type: string;
};

const documentTypeOptions: DocumentTypeOption[] = [
  { label: "Lohnabrechnung", value: "payslip" },
  { label: "Vertrag", value: "contract" },
  { label: "Anweisung", value: "instruction" },
  { label: "Hinweis", value: "notice" },
  { label: "Nachweis", value: "other" },
];

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

function getDocumentTypeLabel(documentType: DocumentType): string {
  return (
    documentTypeOptions.find((option) => option.value === documentType)?.label ??
    "Dokument"
  );
}

function isDocumentType(value: string): value is DocumentType {
  return documentTypeOptions.some((option) => option.value === value);
}

function getMailboxCategory(documentType: DocumentType): MailboxCategory {
  if (documentType === "payslip") {
    return "payslip";
  }

  if (documentType === "contract") {
    return "contract";
  }

  if (documentType === "notice") {
    return "notice";
  }

  return "document";
}

function getStorageBucket(
  documentType: DocumentType,
): AdminDocumentListItem["storage_bucket"] {
  return documentType === "payslip" ? "payslips" : "courier-documents";
}

function getFileTypeLabel(fileName: string, mimeType: string): string {
  const extension = fileName.split(".").pop();

  if (extension && extension !== fileName) {
    return extension.toUpperCase();
  }

  return mimeType.split("/").pop()?.toUpperCase() ?? "DATEI";
}

function getTitleFromFileName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^/.]+$/, "");

  return withoutExtension
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatFileSize(sizeBytes: number): string {
  if (sizeBytes >= 1024 * 1024) {
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getCourierOptions(
  documents: AdminDocumentListItem[],
  uploadDraft: AdminDocumentUploadDraft,
): CourierOption[] {
  const optionsById = new Map<string, CourierOption>();

  documents.forEach((document) => {
    if (!document.courier_profile_id || !document.courierName) {
      return;
    }

    optionsById.set(document.courier_profile_id, {
      depotName: document.depotName,
      name: document.courierName,
      profileId: document.courier_profile_id,
    });
  });

  if (
    !Array.from(optionsById.values()).some(
      (option) => option.name === uploadDraft.courierName,
    )
  ) {
    optionsById.set("KUR-LOCAL-DRAFT", {
      depotName: uploadDraft.depotName,
      name: uploadDraft.courierName,
      profileId: "KUR-LOCAL-DRAFT",
    });
  }

  return Array.from(optionsById.values());
}

function sanitizeStorageFileName(fileName: string): string {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-");
}

function buildLocalDocument({
  courier,
  documentType,
  file,
  index,
  mailboxEnabled,
  title,
}: {
  courier: CourierOption;
  documentType: DocumentType;
  file: SelectedFile;
  index: number;
  mailboxEnabled: boolean;
  title: string;
}): AdminDocumentListItem {
  const createdAt = new Date();
  const storageBucket = getStorageBucket(documentType);
  const storageFolder = documentType === "payslip" ? "payslips" : "docs";
  const storageFileName = sanitizeStorageFileName(file.name);

  return {
    id: `DOC-LOCAL-${String(index).padStart(3, "0")}`,
    company_id: "company-ivt",
    courier_profile_id: courier.profileId,
    uploaded_by: "ADM-10001",
    document_type: documentType,
    title,
    storage_bucket: storageBucket,
    storage_path: `companies/company-ivt/couriers/${courier.profileId}/${storageFolder}/${storageFileName}`,
    mime_type: file.type || "application/octet-stream",
    size_bytes: file.size,
    created_at: createdAt.toISOString(),
    courierName: courier.name,
    depotName: courier.depotName,
    documentTypeLabel: getDocumentTypeLabel(documentType),
    mailboxCategory: getMailboxCategory(documentType),
    visibility: "courier_private",
    visibilityLabel: mailboxEnabled ? "Privat + Postfach" : "Privat",
    visibilityTone: mailboxEnabled ? "success" : "primary",
    status: "active",
    statusLabel: "Lokal",
    statusTone: "info",
    uploadedAtLabel: formatDateTime(createdAt),
    uploadedByName: "Nikolay Ivanov",
    fileSizeLabel: formatFileSize(file.size),
    retentionLabel: "Dauerhaft privat",
  };
}

function getDocumentTypeTone(documentType: DocumentType): AdminDocumentTone {
  if (documentType === "payslip") {
    return "success";
  }

  if (documentType === "contract") {
    return "info";
  }

  if (documentType === "notice") {
    return "warning";
  }

  return "neutral";
}

export function DocumentUploadLocalLogic({
  filters,
  initialDocuments,
  tabs,
  uploadDraft,
}: DocumentUploadLocalLogicProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [documents, setDocuments] = useState(initialDocuments);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [title, setTitle] = useState(uploadDraft.title);
  const [selectedCourierId, setSelectedCourierId] = useState(
    initialDocuments.find((document) => document.courierName === uploadDraft.courierName)
      ?.courier_profile_id ?? "",
  );
  const [documentType, setDocumentType] = useState<DocumentType>(
    uploadDraft.documentType,
  );
  const [mailboxEnabled, setMailboxEnabled] = useState(
    uploadDraft.mailboxEnabled,
  );
  const [dragActive, setDragActive] = useState(false);
  const [localUploadCount, setLocalUploadCount] = useState(0);
  const [savedAtLabel, setSavedAtLabel] = useState("Noch nicht lokal gespeichert");

  const courierOptions = useMemo(
    () => getCourierOptions(initialDocuments, uploadDraft),
    [initialDocuments, uploadDraft],
  );
  const selectedCourier =
    courierOptions.find((courier) => courier.profileId === selectedCourierId) ??
    courierOptions[0];
  const selectedDocumentTypeLabel = getDocumentTypeLabel(documentType);
  const selectedFileType = selectedFile
    ? getFileTypeLabel(selectedFile.name, selectedFile.type)
    : uploadDraft.fileType;
  const selectedFileSizeLabel = selectedFile
    ? formatFileSize(selectedFile.size)
    : uploadDraft.fileSizeLabel;
  const selectedFileName = selectedFile?.name ?? uploadDraft.fileName;
  const canSubmit = Boolean(selectedFile && selectedCourier && title.trim());
  const summary = {
    total: documents.length,
    active: documents.filter((document) => document.status === "active").length,
    privateFiles: documents.filter(
      (document) => document.visibility === "courier_private",
    ).length,
    mailboxReady: documents.filter((document) => document.status !== "draft")
      .length,
  };
  const dynamicTabs = tabs.map((tab) => {
    if (tab.label === "Alle Dokumente") {
      return { ...tab, count: documents.length };
    }

    if (tab.label === "Lohnabrechnungen") {
      return {
        ...tab,
        count: documents.filter((document) => document.document_type === "payslip")
          .length,
      };
    }

    if (tab.label === "Vertraege") {
      return {
        ...tab,
        count: documents.filter((document) => document.document_type === "contract")
          .length,
      };
    }

    if (tab.label === "Hinweise") {
      return {
        ...tab,
        count: documents.filter((document) =>
          ["instruction", "notice"].includes(document.document_type),
        ).length,
      };
    }

    return {
      ...tab,
      count: documents.filter((document) => document.document_type === "other")
        .length,
    };
  });

  function handleFile(file: File | undefined): void {
    if (!file) {
      return;
    }

    const nextFile = {
      name: file.name,
      size: file.size,
      type: file.type,
    };
    const nextTitle = getTitleFromFileName(file.name);

    setSelectedFile(nextFile);

    if (nextTitle) {
      setTitle(nextTitle);
    }
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>): void {
    handleFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    setDragActive(false);
    handleFile(event.dataTransfer.files[0]);
  }

  function handleDiscard(): void {
    setSelectedFile(null);
    setTitle(uploadDraft.title);
    setDocumentType(uploadDraft.documentType);
    setMailboxEnabled(uploadDraft.mailboxEnabled);
    setSelectedCourierId(courierOptions[0]?.profileId ?? "");
    setSavedAtLabel("Entwurf lokal zurueckgesetzt");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSubmit(): void {
    if (!canSubmit || !selectedFile || !selectedCourier) {
      return;
    }

    const nextUploadCount = localUploadCount + 1;
    const nextDocument = buildLocalDocument({
      courier: selectedCourier,
      documentType,
      file: selectedFile,
      index: nextUploadCount,
      mailboxEnabled,
      title: title.trim(),
    });

    setDocuments((currentDocuments) => [nextDocument, ...currentDocuments]);
    setLocalUploadCount(nextUploadCount);
    setSavedAtLabel("Gerade eben lokal zur Tabelle hinzugefuegt");
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          label="Dokumente gesamt"
          tone="primary"
          value={String(summary.total)}
        />
        <SummaryTile label="Aktiv" tone="success" value={String(summary.active)} />
        <SummaryTile
          label="Private Dateien"
          tone="warning"
          value={String(summary.privateFiles)}
        />
        <SummaryTile
          label="Postfach bereit"
          tone="info"
          value={String(summary.mailboxReady)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(380px,0.65fr)]">
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <div className="flex flex-wrap gap-2 border-b border-border-light pb-4">
              {dynamicTabs.map((tab, index) => (
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

            <div
              className={`mt-5 rounded-2xl border border-dashed p-5 transition ${
                dragActive
                  ? "border-primary bg-primary-lightest"
                  : selectedFile
                    ? "border-success-light bg-success-lightest"
                    : "border-primary-light bg-primary-lightest"
              }`}
              onDragLeave={() => setDragActive(false)}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDrop={handleDrop}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface text-sm font-bold text-primary shadow-card">
                    UP
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                      {selectedFile ? "Datei ausgewaehlt" : "Dateien hier ablegen"}
                    </h2>
                    <p className="mt-1 text-sm leading-5 text-text-secondary">
                      {selectedFile
                        ? `${selectedFile.name} - ${selectedFileSizeLabel}`
                        : "PDF, DOCX, XLSX, JPG oder PNG als privates Dokument vormerken. Maximal 50 MB pro Datei."}
                    </p>
                    <p className="mt-2 text-xs font-medium text-primary-darker">
                      Mock-Upload: Datei wird in dieser Phase nur lokal angezeigt.
                    </p>
                  </div>
                </div>
                <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary">
                  Datei auswaehlen
                  <input
                    ref={fileInputRef}
                    className="sr-only"
                    type="file"
                    onChange={handleFileInputChange}
                  />
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
                  Sichtbarkeit. Der neue Upload erscheint lokal direkt in der
                  Liste.
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

              {filters.map((filter) => (
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
                {documents.length} Dokumente angezeigt
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
                  {documents.map((document) => (
                    <div
                      className="grid grid-cols-[1.25fr_0.8fr_1fr_0.9fr_0.85fr_0.8fr_0.75fr] items-center px-6 py-4 text-sm text-text-primary transition hover:bg-surface-secondary"
                      key={document.id}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-lightest text-xs font-bold text-primary-darker">
                          {document.mime_type === "application/pdf"
                            ? "PDF"
                            : getFileTypeLabel(document.title, document.mime_type)}
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
                          tone={getDocumentTypeTone(document.document_type)}
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
                  Lokale Vorschau fuer den naechsten Dokument-Upload.
                </p>
              </div>
              <StatusBadge label={selectedFile ? "Ausgewaehlt" : "Mock"} tone="info" />
            </div>

            <div className="mt-5 rounded-xl border border-primary-light bg-primary-lightest p-4">
              <p className="text-xs font-semibold uppercase text-primary-darker">
                Datei
              </p>
              <p className="mt-2 text-sm font-semibold text-text-primary">
                {selectedFileName}
              </p>
              <p className="mt-1 text-xs font-medium text-text-secondary">
                {selectedFileType} - {selectedFileSizeLabel}
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              <label className="block">
                <span className="text-xs font-semibold uppercase text-text-muted">
                  Titel
                </span>
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none transition focus:border-primary"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase text-text-muted">
                  Kurier
                </span>
                <select
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none transition focus:border-primary"
                  value={selectedCourier?.profileId ?? ""}
                  onChange={(event) => setSelectedCourierId(event.target.value)}
                >
                  {courierOptions.map((courier) => (
                    <option key={courier.profileId} value={courier.profileId}>
                      {courier.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase text-text-muted">
                  Depot
                </span>
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none"
                  readOnly
                  value={selectedCourier?.depotName ?? uploadDraft.depotName}
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase text-text-muted">
                  Dokumenttyp
                </span>
                <select
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none transition focus:border-primary"
                  value={documentType}
                  onChange={(event) => {
                    if (isDocumentType(event.target.value)) {
                      setDocumentType(event.target.value);
                    }
                  }}
                >
                  {documentTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase text-text-muted">
                  Private Bucket
                </span>
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none"
                  readOnly
                  value={getStorageBucket(documentType)}
                />
              </label>
            </div>

            <label className="mt-5 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border-light bg-surface-secondary p-4">
              <span>
                <span className="block text-sm font-semibold text-text-primary">
                  Postfach-Benachrichtigung
                </span>
                <span className="mt-1 block text-xs font-medium text-text-secondary">
                  {mailboxEnabled
                    ? uploadDraft.mailboxTitle
                    : "Nur Dokument-Metadaten lokal vormerken"}
                </span>
              </span>
              <span className="flex items-center gap-3">
                <StatusBadge label={mailboxEnabled ? "An" : "Aus"} tone={mailboxEnabled ? "success" : "neutral"} />
                <input
                  checked={mailboxEnabled}
                  className="h-4 w-4 rounded border-border text-primary"
                  type="checkbox"
                  onChange={() => setMailboxEnabled((current) => !current)}
                />
              </span>
            </label>

            <p className="mt-3 text-xs leading-5 text-text-secondary">
              {mailboxEnabled
                ? uploadDraft.mailboxMessage
                : "Ohne Benachrichtigung wird in dieser lokalen Phase kein Postfach-Hinweis simuliert."}
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground"
                disabled={!canSubmit}
                type="button"
                onClick={handleSubmit}
              >
                Mock-Dokument hinzufuegen
              </button>
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
                type="button"
                onClick={handleDiscard}
              >
                Entwurf verwerfen
              </button>
            </div>

            <p className="mt-4 text-xs font-medium leading-5 text-text-secondary">
              {savedAtLabel}
            </p>

            <p className="mt-4 rounded-xl border border-warning-light bg-warning-lightest px-4 py-3 text-xs leading-5 text-warning-foreground">
              {uploadDraft.auditReminder}
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">
              Zugriff & Sichtbarkeit
            </h2>
            <div className="mt-5 flex flex-col gap-3">
              {(
                [
                {
                  label: "Sichtbarkeit",
                  tone: mailboxEnabled ? "success" : "primary",
                  value: mailboxEnabled ? "Nur Zielkurier + Postfach" : "Nur Zielkurier",
                },
                {
                  label: "Speicher",
                  tone: "primary",
                  value: getStorageBucket(documentType),
                },
                {
                  label: "Postfach",
                  tone: mailboxEnabled ? "info" : "neutral",
                  value: mailboxEnabled ? "Benachrichtigung an" : "Aus",
                },
              ] satisfies Array<{
                label: string;
                tone: AdminDocumentTone;
                value: string;
              }>
              ).map((row) => (
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
              {[
                { done: Boolean(selectedFile), label: "Datei ausgewaehlt" },
                { done: Boolean(selectedCourier), label: "Kurier ausgewaehlt" },
                { done: Boolean(selectedDocumentTypeLabel), label: "Dokumenttyp gesetzt" },
                { done: mailboxEnabled, label: "Mailbox-Option aktiv" },
              ].map((item) => (
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
    </>
  );
}
