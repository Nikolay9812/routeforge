export default function AdminDashboardPage() {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">
            Ivanov Transport
          </p>
          <h1 className="mt-2 text-3xl font-bold text-text-primary">
            Dashboard
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Heute: Schichtprüfungen, Depot-Warnungen und Freigaben.
          </p>
        </div>
        <div className="rounded-full bg-success-lightest px-3 py-1 text-xs font-semibold text-success-foreground">
          Angemeldet
        </div>
      </div>
    </section>
  );
}
