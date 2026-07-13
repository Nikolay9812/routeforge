import type { AdminShellCompany } from "@/lib/adminShell";

type CompanySwitcherProps = {
  company: AdminShellCompany;
};

export function CompanySwitcher({ company }: CompanySwitcherProps) {
  return (
    <button
      className="flex h-11 min-w-0 items-center gap-3 rounded-xl border border-border bg-surface px-3 text-left shadow-card transition hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
      type="button"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-lightest text-primary">
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
          <circle cx="12" cy="7" r="4" />
          <path d="M18 8h3" />
          <path d="M19.5 6.5v3" />
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-text-primary">
          {company.name}
        </span>
        <span className="block truncate text-xs font-medium text-text-secondary">
          {company.location}
        </span>
      </span>
      <span className="text-xs font-bold text-text-muted" aria-hidden="true">
        v
      </span>
    </button>
  );
}
