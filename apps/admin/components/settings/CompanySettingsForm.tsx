"use client";

import { useActionState } from "react";

import {
  updateCompanySettingsAction,
  type CompanySettingsActionState,
} from "@/app/actions/settings";
import { getLanguageLabel } from "@/lib/adminSettings";
import type { SupportedLanguage } from "@routeforge/shared";

type CompanySettingsFormProps = {
  canEdit: boolean;
  initialLanguage: SupportedLanguage;
  initialName: string;
};

export function CompanySettingsForm({
  canEdit,
  initialLanguage,
  initialName,
}: CompanySettingsFormProps) {
  const initialState: CompanySettingsActionState = {
    companyName: initialName,
    defaultLanguage: initialLanguage,
    error: null,
    message: null,
  };
  const [state, formAction, isPending] = useActionState(
    updateCompanySettingsAction,
    initialState,
  );
  const companyName = state.companyName ?? initialName;
  const language = state.defaultLanguage ?? initialLanguage;

  return (
    <form
      action={formAction}
      className="mt-5 rounded-2xl border border-border-light bg-surface-secondary p-4"
      key={`${companyName}-${language}`}
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
        <label className="block">
          <span className="text-xs font-semibold uppercase text-text-muted">
            Firmenname
          </span>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground"
            defaultValue={companyName}
            disabled={!canEdit || isPending}
            maxLength={120}
            name="name"
            required
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase text-text-muted">
            Standardsprache
          </span>
          <select
            className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text-primary shadow-card outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground"
            defaultValue={language}
            disabled={!canEdit || isPending}
            name="default_language"
          >
            {(["de", "bg"] as const).map((option) => (
              <option key={option} value={option}>
                {getLanguageLabel(option)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground"
          disabled={!canEdit || isPending}
          type="submit"
        >
          {isPending ? "Speichert..." : "Speichern"}
        </button>
        <span className="text-xs font-medium text-text-muted">
          Slug, Land und Retention bleiben gesperrt.
        </span>
      </div>

      {!canEdit ? (
        <p className="mt-4 rounded-xl border border-warning-light bg-warning-lightest px-4 py-3 text-xs leading-5 text-warning-foreground">
          Nur aktive Admins koennen Firmennamen und Standardsprache aendern.
        </p>
      ) : null}

      {state.message ? (
        <p className="mt-4 rounded-xl border border-success-light bg-success-lightest px-4 py-3 text-xs leading-5 text-success-foreground">
          {state.message}
        </p>
      ) : null}

      {state.error ? (
        <p className="mt-4 rounded-xl border border-error-light bg-error-lightest px-4 py-3 text-xs leading-5 text-error-foreground">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
