import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { requireAdminSession } from "@/lib/auth";
import {
  adminShellNavGroups,
  adminShellNotifications,
} from "@/lib/mock/adminShell";

type AdminLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await requireAdminSession();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <Sidebar company={session.company} navGroups={adminShellNavGroups} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            company={session.company}
            notificationCount={adminShellNotifications.pendingCount}
            notificationLabel={adminShellNotifications.label}
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
