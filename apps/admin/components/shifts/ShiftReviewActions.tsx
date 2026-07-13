"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import {
  approveShiftAction,
  rejectShiftAction,
  type ShiftReviewMutationResult,
} from "@/app/actions/shifts";

type ShiftReviewActionsProps = {
  correctionHref: string;
  shiftId: string;
};

type ActionStatus = {
  message: string;
  tone: "success" | "error" | "info";
};

export function ShiftReviewActions({
  correctionHref,
  shiftId,
}: ShiftReviewActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [rejectionReason, setRejectionReason] = useState("");
  const [status, setStatus] = useState<ActionStatus | null>(null);
  const trimmedReason = rejectionReason.trim();
  const canReject = trimmedReason.length >= 3;

  function handleResult(
    result: ShiftReviewMutationResult,
    successMessage: string,
  ) {
    if (result.error) {
      setStatus({ message: result.error, tone: "error" });
      return;
    }

    setStatus({ message: successMessage, tone: "success" });
  }

  function approveShift() {
    setStatus(null);
    startTransition(async () => {
      const result = await approveShiftAction(shiftId);
      handleResult(result, "Schicht wurde genehmigt.");
    });
  }

  function rejectShift() {
    if (!canReject) {
      setStatus({
        message: "Bitte gib vor der Ablehnung einen Grund ein.",
        tone: "error",
      });
      return;
    }

    setStatus(null);
    startTransition(async () => {
      const result = await rejectShiftAction({
        rejectionReason: trimmedReason,
        shiftId,
      });
      handleResult(result, "Schicht wurde abgelehnt.");
    });
  }

  const statusClasses =
    status?.tone === "success"
      ? "border-success-light bg-success-lightest text-success-foreground"
      : status?.tone === "error"
        ? "border-error-light bg-error-lightest text-error-foreground"
        : "border-info-light bg-info-lightest text-info-foreground";

  return (
    <div className="mt-5 flex flex-col gap-3" id="review-actions">
      <button
        className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground"
        disabled={isPending}
        onClick={approveShift}
        type="button"
      >
        {isPending ? "Speichert..." : "Schicht genehmigen"}
      </button>

      <Link
        className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-card transition hover:bg-surface-secondary"
        href={correctionHref}
      >
        Korrektur vorbereiten
      </Link>

      <label className="block">
        <span className="text-sm font-semibold text-text-primary">
          Ablehnungsgrund
        </span>
        <span className="mt-1 block text-xs font-medium text-text-secondary">
          Pflichtfeld fuer Ablehnung und Audit-Log.
        </span>
        <textarea
          className="mt-3 min-h-24 w-full resize-y rounded-xl border border-border bg-surface px-3 py-3 text-sm font-medium leading-6 text-text-primary outline-none transition focus:border-primary"
          disabled={isPending}
          maxLength={1000}
          onChange={(event) => setRejectionReason(event.currentTarget.value)}
          placeholder="Grund der Ablehnung eintragen"
          value={rejectionReason}
        />
      </label>

      <button
        className="inline-flex h-11 items-center justify-center rounded-xl bg-error px-4 text-sm font-semibold text-text-inverse transition hover:bg-error-dark disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground"
        disabled={!canReject || isPending}
        onClick={rejectShift}
        type="button"
      >
        {isPending ? "Speichert..." : "Schicht ablehnen"}
      </button>

      {status ? (
        <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${statusClasses}`}>
          {status.message}
        </div>
      ) : null}
    </div>
  );
}
