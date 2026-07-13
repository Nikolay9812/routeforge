import Link from "next/link";

import type { AdminNavIcon, AdminNavItem } from "@/lib/adminShell";

type SidebarItemProps = {
  isActive: boolean;
  item: AdminNavItem;
};

type IconProps = {
  icon: AdminNavIcon;
};

function SidebarIcon({ icon }: IconProps) {
  const sharedProps = {
    "aria-hidden": true,
    className: "h-4 w-4",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2,
    viewBox: "0 0 24 24",
  };

  const paths: Record<AdminNavIcon, React.ReactNode> = {
    audit: (
      <>
        <path d="M8 4h8" />
        <path d="M8 8h8" />
        <path d="M8 12h5" />
        <path d="M6 20h12a2 2 0 0 0 2-2V6l-4-4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" />
        <path d="M16 2v4h4" />
      </>
    ),
    couriers: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    dashboard: (
      <>
        <path d="M3 11 12 3l9 8" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    depots: (
      <>
        <path d="M4 21V9l8-5 8 5v12" />
        <path d="M9 21v-7h6v7" />
        <path d="M9 10h6" />
      </>
    ),
    dispatchers: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 21v-2a6 6 0 0 1 12 0v2" />
        <path d="M16 11h5" />
        <path d="M16 16h5" />
      </>
    ),
    documents: (
      <>
        <path d="M6 20h12a2 2 0 0 0 2-2V8l-6-6H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
      </>
    ),
    exports: (
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </>
    ),
    invitations: (
      <>
        <path d="M4 6h16v12H4z" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3" />
        <path d="M12 19v3" />
        <path d="m4.9 4.9 2.1 2.1" />
        <path d="m17 17 2.1 2.1" />
        <path d="M2 12h3" />
        <path d="M19 12h3" />
        <path d="m4.9 19.1 2.1-2.1" />
        <path d="m17 7 2.1-2.1" />
      </>
    ),
    shifts: (
      <>
        <path d="M7 3v4" />
        <path d="M17 3v4" />
        <path d="M4 8h16" />
        <path d="M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />
      </>
    ),
  };

  return <svg {...sharedProps}>{paths[icon]}</svg>;
}

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
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition ${markerClasses}`}
      >
        <SidebarIcon icon={item.icon} />
      </span>
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
