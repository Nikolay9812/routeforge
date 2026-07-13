"use client";

import { usePathname } from "next/navigation";

import { CompanySwitcher } from "@/components/layout/CompanySwitcher";
import { SidebarItem } from "@/components/layout/SidebarItem";
import type {
  AdminNavGroup,
  AdminShellCompany,
} from "@/lib/adminShell";

type SidebarProps = {
  company: AdminShellCompany;
  navGroups: AdminNavGroup[];
};

function isActivePath(pathname: string, href: string) {
  if (href === "/admin/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ company, navGroups }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[260px] shrink-0 border-r border-border bg-surface lg:flex lg:min-h-screen lg:flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="routeforge-logo-mark flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-card">
          <span className="text-sm font-bold text-primary-foreground">RF</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-text-primary">
            RouteForge
          </p>
          <p className="truncate text-xs font-medium text-text-secondary">
            Admin Panel
          </p>
        </div>
      </div>

      <div className="border-b border-border-light px-4 py-4">
        <CompanySwitcher company={company} />
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-5">
        {navGroups.map((group) => (
          <div className="space-y-2" key={group.label}>
            <p className="px-3 text-xs font-semibold uppercase text-text-muted">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <SidebarItem
                  isActive={isActivePath(pathname, item.href)}
                  item={item}
                  key={item.href}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
