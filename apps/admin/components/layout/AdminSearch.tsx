"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type {
  AdminShellSearchItem,
  AdminShellSearchTone,
  AdminShellText,
} from "@/lib/adminShell";

type AdminSearchProps = {
  items: AdminShellSearchItem[];
  text: AdminShellText;
};

const toneClasses: Record<AdminShellSearchTone, string> = {
  info: "bg-info-lightest text-info-foreground",
  neutral: "bg-neutral-light text-neutral-foreground",
  primary: "bg-primary-lightest text-primary-darker",
  success: "bg-success-lightest text-success-foreground",
  warning: "bg-warning-lightest text-warning-foreground",
};

export function AdminSearch({ items, text }: AdminSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (normalizedQuery.length < 2) {
      return [];
    }

    return items
      .filter((item) =>
        [item.label, item.description, item.meta, item.keywords]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      )
      .slice(0, 8);
  }, [items, normalizedQuery]);
  const hasQuery = normalizedQuery.length >= 2;
  const showPanel = isOpen && hasQuery;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (results[0]) {
      setIsOpen(false);
      router.push(results[0].href);
    }
  }

  return (
    <form className="relative w-full max-w-md" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="admin-search">
        Suche
      </label>
      <input
        autoComplete="off"
        className="h-10 w-full rounded-xl border border-border bg-surface-secondary px-4 text-sm font-medium text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:bg-surface focus:ring-1 focus:ring-primary"
        id="admin-search"
        placeholder={text.searchPlaceholder}
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
      />

      {showPanel ? (
        <div className="absolute left-0 right-0 top-12 z-20 rounded-2xl border border-border bg-surface p-3 shadow-card">
          <div className="flex items-center justify-between gap-3 px-2 py-2">
            <p className="text-xs font-semibold uppercase text-text-muted">
              {text.searchResults}
            </p>
            <span className="text-xs font-medium text-text-secondary">
              {results.length} {text.searchMatches}
            </span>
          </div>

          <div className="mt-1 flex flex-col gap-2">
            {results.map((item) => (
              <Link
                className="rounded-xl border border-border-light bg-surface-secondary px-3 py-3 transition hover:border-primary-light hover:bg-primary-lightest"
                href={item.href}
                key={item.id}
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">
                        {item.label}
                      </span>
                      <span className="text-xs font-medium text-text-muted">
                        {text.resultTypes[item.type]}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs font-medium text-text-secondary">
                      {item.description}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[item.tone]}`}
                  >
                    {item.meta}
                  </span>
                </div>
              </Link>
            ))}

            {results.length === 0 ? (
              <p className="rounded-xl border border-border-light bg-surface-secondary px-3 py-4 text-sm font-semibold text-text-secondary">
                {text.searchNoResults}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </form>
  );
}
