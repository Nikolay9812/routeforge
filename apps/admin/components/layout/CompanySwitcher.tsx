import type { AdminShellCompany } from "@/lib/mock/adminShell";

type CompanySwitcherProps = {
  company: AdminShellCompany;
};

export function CompanySwitcher({ company }: CompanySwitcherProps) {
  return (
    <button
      className="flex h-11 min-w-0 items-center gap-3 rounded-xl border border-border bg-surface px-3 text-left shadow-card transition hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
      type="button"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-lightest text-xs font-bold text-primary">
        {company.workspaceCode}
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
