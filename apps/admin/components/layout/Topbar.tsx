import { CompanySwitcher } from "@/components/layout/CompanySwitcher";
import { signOutAdminAction } from "@/app/actions/auth";
import type {
  AdminShellCompany,
  AdminShellUser,
} from "@/lib/adminShell";

type TopbarProps = {
  company: AdminShellCompany;
  notificationCount: number;
  notificationLabel: string;
  user: AdminShellUser;
};

export function Topbar({
  company,
  notificationCount,
  notificationLabel,
  user,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface px-4 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <div className="routeforge-logo-mark flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-card lg:hidden">
          <span className="text-xs font-bold text-primary-foreground">RF</span>
        </div>
        <CompanySwitcher company={company} />
      </div>

      <div className="hidden min-w-0 flex-1 justify-center md:flex">
        <label className="sr-only" htmlFor="admin-search">
          Suche
        </label>
        <input
          className="h-10 w-full max-w-md rounded-xl border border-border bg-surface-secondary px-4 text-sm font-medium text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:bg-surface focus:ring-1 focus:ring-primary"
          id="admin-search"
          placeholder="Suche nach Kurieren, Schichten, Depots"
          type="search"
        />
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button
          aria-label={`${notificationLabel}: ${notificationCount}`}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-sm font-bold text-text-secondary shadow-card transition hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
          type="button"
        >
          N
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-warning px-1 text-[10px] font-bold text-primary-foreground">
            {notificationCount}
          </span>
        </button>

        <button
          className="flex h-10 items-center gap-3 rounded-xl border border-border bg-surface px-2.5 shadow-card transition hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
          type="button"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-lightest text-xs font-bold text-primary">
            {user.initials}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-semibold text-text-primary">
              {user.name}
            </span>
            <span className="block text-xs font-medium text-text-secondary">
              {user.roleLabel}
            </span>
          </span>
        </button>

        <form action={signOutAdminAction}>
          <button
            className="flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-3 text-xs font-bold text-text-secondary shadow-card transition hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
            type="submit"
          >
            Abmelden
          </button>
        </form>
      </div>
    </header>
  );
}
