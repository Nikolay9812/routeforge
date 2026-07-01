const loginStats = [
  { label: "Offene Schichtprüfungen", value: "23" },
  { label: "Depot-Warnungen", value: "7" },
  { label: "Aktive Kuriere heute", value: "128" },
];

export default function LoginPage() {
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

          <form action="/admin/dashboard" className="space-y-5" method="get">
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

            <div className="rounded-2xl border border-info-light bg-info-lightest p-4">
              <p className="text-sm font-semibold text-info-foreground">
                Mock-Zugang
              </p>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                Die Anmeldung ist in dieser UI-Phase lokal und verbindet noch
                keine InsForge-Sitzung.
              </p>
            </div>

            <button
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
              type="submit"
            >
              Zum Dashboard
            </button>
          </form>

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
