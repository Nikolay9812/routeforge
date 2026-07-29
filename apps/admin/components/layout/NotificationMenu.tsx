"use client";

import Link from "next/link";
import { useState } from "react";

import type {
  AdminShellNotificationItem,
  AdminShellNotificationTone,
  AdminShellText,
} from "@/lib/adminShell";

type NotificationMenuProps = {
  count: number;
  items: AdminShellNotificationItem[];
  label: string;
  text: AdminShellText;
};

const toneClasses: Record<
  AdminShellNotificationTone,
  {
    badge: string;
  }
> = {
  info: {
    badge: "bg-info-lightest text-info-foreground",
  },
  primary: {
    badge: "bg-primary-lightest text-primary-darker",
  },
  warning: {
    badge: "bg-warning-lightest text-warning-foreground",
  },
};

export function NotificationMenu({
  count,
  items,
  label,
  text,
}: NotificationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        aria-expanded={isOpen}
        aria-label={`${label}: ${count}`}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-sm font-bold text-text-secondary shadow-card transition hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        N
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-warning px-1 text-[10px] font-bold text-primary-foreground">
          {count}
        </span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-12 z-20 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-border bg-surface p-3 shadow-card">
          <div className="flex items-start justify-between gap-4 px-2 py-2">
            <div>
              <p className="text-sm font-semibold text-text-primary">{label}</p>
              <p className="mt-1 text-xs font-medium text-text-secondary">
                {text.notificationsSubtitle}
              </p>
            </div>
            <span className="rounded-full bg-warning-lightest px-2.5 py-1 text-xs font-semibold text-warning-foreground">
              {count}
            </span>
          </div>

          <div className="mt-2 flex flex-col gap-2">
            {items.map((item) => (
              <Link
                className="rounded-xl border border-border-light bg-surface-secondary px-3 py-3 transition hover:border-primary-light hover:bg-primary-lightest"
                href={item.href}
                key={item.id}
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xs font-medium leading-5 text-text-secondary">
                      {item.description}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[item.tone].badge}`}
                  >
                    {text.resultTypes[item.type === "shift_review" ? "shift" : "courier"]}
                  </span>
                </div>
              </Link>
            ))}

            {items.length === 0 ? (
              <p className="rounded-xl border border-border-light bg-surface-secondary px-3 py-4 text-sm font-semibold text-text-secondary">
                {text.notificationsEmpty}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
