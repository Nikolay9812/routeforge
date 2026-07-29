import type { ReactNode } from "react";

import { getTranslations } from "@routeforge/shared";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import {
  buildAdminShellNavGroups,
  buildAdminShellText,
} from "@/lib/adminShell";
import {
  loadAdminShellNotifications,
  loadAdminShellSearchItems,
} from "@/lib/adminShell.server";
import { requireAdminSession } from "@/lib/auth";

type AdminLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await requireAdminSession();
  const translation = getTranslations(session.company.defaultLanguage);
  const navGroups = buildAdminShellNavGroups(translation);
  const shellText = buildAdminShellText(translation);
  const [notifications, searchItems] = await Promise.all([
    loadAdminShellNotifications(session, translation),
    loadAdminShellSearchItems(session, translation),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <Sidebar
          adminPanelLabel={shellText.adminPanel}
          company={session.company}
          navGroups={navGroups}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            company={session.company}
            notificationCount={notifications.pendingCount}
            notificationItems={notifications.items}
            notificationLabel={notifications.label}
            searchItems={searchItems}
            text={shellText}
            user={session.shellUser}
          />
          <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
