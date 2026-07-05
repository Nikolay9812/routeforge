"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  signInAdminAction,
  type AdminLoginState,
} from "@/app/actions/auth";

const initialState: AdminLoginState = {
  email: "",
  error: null,
};

export function AdminLoginForm() {
  const [state, formAction] = useActionState(signInAdminAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label
          className="text-sm font-semibold text-text-secondary"
          htmlFor="email"
        >
          E-Mail
        </label>
        <input
          autoComplete="email"
          className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm font-medium text-text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          defaultValue={state.email}
          id="email"
          name="email"
          placeholder="admin@ivanov-transport.de"
          required
          type="email"
        />
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-semibold text-text-secondary"
          htmlFor="password"
        >
          Passwort
        </label>
        <input
          autoComplete="current-password"
          className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm font-medium text-text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          id="password"
          name="password"
          placeholder="Passwort eingeben"
          required
          type="password"
        />
      </div>

      {state.error ? (
        <div className="rounded-2xl border border-error-light bg-error-lightest p-4">
          <p className="text-sm font-semibold text-error-foreground">
            Anmeldung nicht moeglich
          </p>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            {state.error}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-info-light bg-info-lightest p-4">
          <p className="text-sm font-semibold text-info-foreground">
            InsForge Auth
          </p>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            Admins und Dispatcher werden mit ihrer RouteForge-Sitzung
            angemeldet.
          </p>
        </div>
      )}

      <LoginSubmitButton />
    </form>
  );
}

function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground"
      disabled={pending}
      type="submit"
    >
      {pending ? "Anmeldung laeuft..." : "Einloggen"}
    </button>
  );
}
