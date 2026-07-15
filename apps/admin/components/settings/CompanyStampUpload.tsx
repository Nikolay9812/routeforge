"use client";

import { useRef, useState, useTransition } from "react";
import type { ChangeEvent } from "react";

import { uploadCompanyStampAction } from "@/app/actions/settings";
import type { AdminSettingsAsset, AdminSettingsTone } from "@/lib/adminSettings";

type CompanyStampUploadProps = {
  asset: AdminSettingsAsset;
  initialStampPath: string | null;
};

type SelectedStampFile = {
  file: File;
  name: string;
  size: number;
};

const toneClasses: Record<
  AdminSettingsTone,
  {
    badge: string;
    soft: string;
  }
> = {
  primary: {
    badge: "bg-primary-lightest text-primary-darker",
    soft: "border-primary-light bg-primary-lightest",
  },
  info: {
    badge: "bg-info-lightest text-info-foreground",
    soft: "border-info-light bg-info-lightest",
  },
  success: {
    badge: "bg-success-lightest text-success-foreground",
    soft: "border-success-light bg-success-lightest",
  },
  warning: {
    badge: "bg-warning-lightest text-warning-foreground",
    soft: "border-warning-light bg-warning-lightest",
  },
  error: {
    badge: "bg-error-lightest text-error-foreground",
    soft: "border-error-light bg-error-lightest",
  },
  neutral: {
    badge: "bg-neutral-light text-neutral-foreground",
    soft: "border-border bg-neutral-light",
  },
};

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: AdminSettingsTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[tone].badge}`}
    >
      {label}
    </span>
  );
}

function formatFileSize(sizeBytes: number): string {
  if (sizeBytes >= 1024 * 1024) {
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
}

export function CompanyStampUpload({
  asset,
  initialStampPath,
}: CompanyStampUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentStampPath, setCurrentStampPath] = useState(initialStampPath);
  const [selectedFile, setSelectedFile] = useState<SelectedStampFile | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const statusTone: AdminSettingsTone = currentStampPath ? "success" : asset.tone;
  const statusLabel = currentStampPath ? "Bereit" : asset.statusLabel;
  const fileLabel = currentStampPath ?? asset.fileLabel;
  const canUpload = Boolean(selectedFile && !isPending);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];

    setMessage(null);
    setError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.type !== "image/png" && !file.name.toLowerCase().endsWith(".png")) {
      setSelectedFile(null);
      setError("Bitte nur PNG-Dateien auswaehlen.");
      return;
    }

    setSelectedFile({
      file,
      name: file.name,
      size: file.size,
    });
  }

  function handleUpload(): void {
    if (!selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.set("stamp", selectedFile.file);
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await uploadCompanyStampAction(formData);

      if (result.error || !result.stampPath) {
        setError(result.error ?? "Stempel konnte nicht hochgeladen werden.");
        return;
      }

      setCurrentStampPath(result.stampPath);
      setSelectedFile(null);
      setMessage("Firmenstempel gespeichert. Neue PDFs verwenden diese PNG-Datei.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    });
  }

  function handleResetSelection(): void {
    setSelectedFile(null);
    setError(null);
    setMessage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className={`rounded-2xl border border-dashed p-5 ${toneClasses[statusTone].soft}`}>
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface text-sm font-bold text-primary shadow-card">
          {asset.label}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary">
              {asset.title}
            </h3>
            <StatusBadge label={statusLabel} tone={statusTone} />
          </div>
          <p className="mt-2 text-sm leading-5 text-text-secondary">
            {asset.helper}
          </p>
          <p className="mt-3 truncate rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-text-secondary shadow-card">
            {fileLabel}
          </p>

          <div className="mt-4 rounded-xl border border-border bg-surface p-4 shadow-card">
            <label className="block">
              <span className="text-xs font-semibold uppercase text-text-muted">
                PNG-Datei
              </span>
              <input
                ref={fileInputRef}
                accept="image/png"
                className="mt-2 block w-full text-sm font-semibold text-text-secondary file:mr-4 file:h-10 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary-dark"
                type="file"
                onChange={handleFileChange}
              />
            </label>

            <div className="mt-4 rounded-xl border border-primary-light bg-primary-lightest px-4 py-3">
              <p className="text-xs font-semibold text-primary-darker">
                {selectedFile ? "Ausgewaehlt" : "Bereit fuer Upload"}
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-text-primary">
                {selectedFile
                  ? `${selectedFile.name} - ${formatFileSize(selectedFile.size)}`
                  : "PNG, maximal 2 MB, private Ablage im company-assets Bucket."}
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground"
                disabled={!canUpload}
                type="button"
                onClick={handleUpload}
              >
                {isPending ? "Stempel wird hochgeladen" : "Stempel hochladen"}
              </button>
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
                type="button"
                onClick={handleResetSelection}
              >
                Auswahl loeschen
              </button>
            </div>

            {message ? (
              <p className="mt-4 rounded-xl border border-success-light bg-success-lightest px-4 py-3 text-xs leading-5 text-success-foreground">
                {message}
              </p>
            ) : null}

            {error ? (
              <p className="mt-4 rounded-xl border border-error-light bg-error-lightest px-4 py-3 text-xs leading-5 text-error-foreground">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
