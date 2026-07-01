import Link from "next/link";

import type { AdminNavItem } from "@/lib/mock/adminShell";

type SidebarItemProps = {
  isActive: boolean;
  item: AdminNavItem;
};

export function SidebarItem({ isActive, item }: SidebarItemProps) {
  const itemClasses = isActive
    ? "bg-primary-lightest text-primary"
    : "text-text-secondary hover:bg-surface-secondary";

  const markerClasses = isActive
    ? "border-primary-light bg-surface text-primary"
    : "border-border bg-surface-secondary text-text-subtle";

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={`group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${itemClasses}`}
      href={item.href}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[10px] font-bold transition ${markerClasses}`}
      >
        {item.marker}
      </span>
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
