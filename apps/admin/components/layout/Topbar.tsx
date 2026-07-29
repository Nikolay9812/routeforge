import { CompanySwitcher } from "@/components/layout/CompanySwitcher";
import { NotificationMenu } from "@/components/layout/NotificationMenu";
import { signOutAdminAction } from "@/app/actions/auth";
import type {
  AdminShellNotificationItem,
  AdminShellCompany,
  AdminShellSearchItem,
  AdminShellText,
  AdminShellUser,
} from "@/lib/adminShell";
import { AdminSearch } from "@/components/layout/AdminSearch";

type TopbarProps = {
  company: AdminShellCompany;
  notificationItems: AdminShellNotificationItem[];
  notificationCount: number;
  notificationLabel: string;
  searchItems: AdminShellSearchItem[];
  text: AdminShellText;
  user: AdminShellUser;
};

export function Topbar({
  company,
  notificationItems,
  notificationCount,
  notificationLabel,
  searchItems,
  text,
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
        <AdminSearch items={searchItems} text={text} />
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <NotificationMenu
          count={notificationCount}
          items={notificationItems}
          label={notificationLabel}
          text={text}
        />

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
              {text.roles[user.role]}
            </span>
          </span>
        </button>

        <form action={signOutAdminAction}>
          <button
            className="flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-3 text-xs font-bold text-text-secondary shadow-card transition hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
            type="submit"
          >
            {text.logoutAction}
          </button>
        </form>
      </div>
    </header>
  );
}
