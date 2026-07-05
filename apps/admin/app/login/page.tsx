import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { getCurrentAdminSession } from "@/lib/auth";

const loginStats = [
  { label: "Offene Schichtprüfungen", value: "23" },
  { label: "Depot-Warnungen", value: "7" },
  { label: "Aktive Kuriere heute", value: "128" },
];

export default async function LoginPage() {
  const session = await getCurrentAdminSession();

  if (session) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="routeforge-dotted-bg flex min-h-screen items-center justify-center px-6 py-10">
      <section className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_440px] lg:items-center">
        <div className="max-w-2xl">
          <div className="mb-10 flex items-center gap-3">
            <div className="routeforge-logo-mark flex h-12 w-12 items-center justify-center rounded-xl shadow-card">
              <span className="text-lg font-bold text-primary-foreground">
                RF
              </span>
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">RouteForge</p>
              <p className="text-sm font-medium text-text-secondary">
                Admin Panel
              </p>
            </div>
          </div>

          <div className="mb-8 inline-flex rounded-full border border-primary-light bg-primary-lightest px-3 py-1 text-xs font-semibold text-primary-darker">
            Ivanov Transport · Mannheim
          </div>

          <h1 className="text-4xl font-bold leading-tight text-text-primary lg:text-5xl">
            Verwaltung für Schichten, Kuriere und Dokumente.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary">
            Melde dich als Admin oder Dispatcher an, um Tagesberichte,
            Depot-Warnungen und Freigaben im Blick zu behalten.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {loginStats.map((item) => (
              <div
                className="rounded-2xl border border-border bg-surface p-4 shadow-card"
                key={item.label}
              >
                <p className="text-2xl font-bold text-text-primary">
                  {item.value}
                </p>
                <p className="mt-1 text-xs font-medium leading-4 text-text-secondary">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card-lg">
          <div className="mb-6">
            <p className="text-sm font-semibold text-primary">Admin Login</p>
            <h2 className="mt-2 text-2xl font-bold text-text-primary">
              Einloggen
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Zugriff für Admins und Dispatcher deiner Firma.
            </p>
          </div>

          <AdminLoginForm />

          <div className="mt-6 flex items-center justify-between border-t border-border-light pt-5 text-sm">
            <span className="font-medium text-text-secondary">
              Sprache: Deutsch
            </span>
            <span className="rounded-full bg-success-lightest px-2.5 py-1 text-xs font-semibold text-success-foreground">
              Admin UI
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
