import type { ReactNode } from "react";

type AdminStateTone = "empty" | "error" | "offline";

type AdminStateCardProps = {
  actionLabel?: string;
  children?: ReactNode;
  eyebrow?: string;
  message: string;
  onAction?: () => void;
  title: string;
  tone?: AdminStateTone;
};

const stateToneClasses: Record<
  AdminStateTone,
  {
    badge: string;
    panel: string;
    text: string;
  }
> = {
  empty: {
    badge: "bg-primary-lightest text-primary-darker",
    panel: "border-border bg-surface",
    text: "text-text-secondary",
  },
  error: {
    badge: "bg-error-lightest text-error-foreground",
    panel: "border-error-light bg-error-lightest",
    text: "text-error-foreground",
  },
  offline: {
    badge: "bg-warning-lightest text-warning-foreground",
    panel: "border-warning-light bg-warning-lightest",
    text: "text-warning-foreground",
  },
};

export function AdminStateCard({
  actionLabel,
  children,
  eyebrow = "Status",
  message,
  onAction,
  title,
  tone = "empty",
}: AdminStateCardProps) {
  const toneClass = stateToneClasses[tone];

  return (
    <section
      className={`rounded-2xl border p-6 shadow-card ${toneClass.panel}`}
      role={tone === "error" || tone === "offline" ? "alert" : "status"}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${toneClass.badge}`}
          >
            {eyebrow}
          </span>
          <h2 className="mt-3 text-xl font-bold leading-7 text-text-primary">
            {title}
          </h2>
          <p className={`mt-2 text-sm font-semibold leading-6 ${toneClass.text}`}>
            {message}
          </p>
          {children ? <div className="mt-4">{children}</div> : null}
        </div>
        {actionLabel && onAction ? (
          <button
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
            onClick={onAction}
            type="button"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
}

export function AdminPageSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6" role="status">
      <span className="sr-only">Admin-Seite wird geladen</span>
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="h-4 w-36 rounded-full bg-surface-tertiary" />
        <div className="mt-4 h-9 w-64 rounded-xl bg-surface-tertiary" />
        <div className="mt-4 h-4 max-w-2xl rounded-full bg-surface-tertiary" />
        <div className="mt-2 h-4 max-w-xl rounded-full bg-surface-tertiary" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {["metric-1", "metric-2", "metric-3", "metric-4"].map((key) => (
          <div
            className="rounded-2xl border border-border bg-surface p-5 shadow-card"
            key={key}
          >
            <div className="h-4 w-28 rounded-full bg-surface-tertiary" />
            <div className="mt-5 h-8 w-20 rounded-xl bg-surface-tertiary" />
            <div className="mt-5 h-3 w-full rounded-full bg-surface-tertiary" />
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-surface shadow-card">
        <div className="border-b border-border-light p-6">
          <div className="h-5 w-40 rounded-full bg-surface-tertiary" />
          <div className="mt-3 h-4 max-w-lg rounded-full bg-surface-tertiary" />
        </div>
        <div className="space-y-3 p-6">
          {["row-1", "row-2", "row-3", "row-4"].map((key) => (
            <div
              className="grid gap-4 rounded-xl border border-border-light bg-surface-secondary p-4 md:grid-cols-[1fr_0.8fr_0.8fr_0.6fr]"
              key={key}
            >
              <div className="h-4 rounded-full bg-surface-tertiary" />
              <div className="h-4 rounded-full bg-surface-tertiary" />
              <div className="h-4 rounded-full bg-surface-tertiary" />
              <div className="h-4 rounded-full bg-surface-tertiary" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
