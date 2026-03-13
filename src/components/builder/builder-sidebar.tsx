"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface RecentApp {
  id: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  companyLogoUrl: string | null;
}

const navItems = [
  { href: "/dashboard", label: "Applications" },
];

function EllipsisMenu({
  appId,
  onDeleted,
  onApplied,
}: {
  appId: number;
  onDeleted: (id: number) => void;
  onApplied: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState<"delete" | "applied" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirm(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleDelete = async () => {
    await fetch("/api/dashboard/applications/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: appId }),
    });
    onDeleted(appId);
    setOpen(false);
    setConfirm(null);
  };

  const handleApplied = async () => {
    await fetch("/api/dashboard/applications/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: appId, status: "applied" }),
    });
    onApplied(appId);
    setOpen(false);
    setConfirm(null);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
          setConfirm(null);
        }}
        className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-5 z-50 w-40 rounded-md border bg-background py-1 shadow-md">
          {confirm === "applied" ? (
            <div className="px-3 py-2">
              <p className="mb-2 text-xs text-muted-foreground">Mark as applied?</p>
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleApplied(); }}
                  className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90"
                >
                  Confirm
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirm(null); }}
                  className="rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : confirm === "delete" ? (
            <div className="px-3 py-2">
              <p className="mb-2 text-xs text-muted-foreground">Delete this application?</p>
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(); }}
                  className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                >
                  Delete
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirm(null); }}
                  className="rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirm("applied"); }}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-muted"
              >
                Mark as applied
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirm("delete"); }}
                className="w-full px-3 py-1.5 text-left text-xs text-red-500 hover:bg-muted"
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function BuilderSidebar() {
  const pathname = usePathname();
  const [recentApps, setRecentApps] = useState<RecentApp[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/applications/recent")
      .then((r) => (r.ok ? r.json() : { apps: [] }))
      .then((data) => setRecentApps(data.apps || []))
      .catch(() => {});
  }, []);

  const handleDeleted = (appId: number) => {
    setRecentApps((prev) => prev.filter((a) => a.id !== appId));
  };

  const handleApplied = (appId: number) => {
    setRecentApps((prev) => prev.filter((a) => a.id !== appId));
  };

  return (
    <aside className="flex w-48 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-3">
        <Link href="/" className="text-sm font-bold leading-tight tracking-tight">
          SEO Product Managers
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col overflow-y-auto">
        <div className="space-y-1 p-1.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Recent Applications */}
        {recentApps.length > 0 && (
          <div className="border-t">
            <p className="mb-1 px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recent
            </p>
            <div className="space-y-1 p-1.5 pt-0">
              {recentApps.map((app) => {
                const href = `/builder/${app.jobId}`;
                const isActive = pathname === href;
                return (
                  <div
                    key={app.id}
                    className={cn(
                      "group flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Link href={href} className="flex min-w-0 flex-1 items-center gap-2">
                      {app.companyLogoUrl ? (
                        <img
                          src={app.companyLogoUrl}
                          alt={app.companyName}
                          className="h-4 w-4 shrink-0 rounded object-contain"
                        />
                      ) : (
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-muted text-[8px] font-bold text-muted-foreground">
                          {app.companyName.charAt(0)}
                        </span>
                      )}
                      <span className="truncate text-xs">{app.jobTitle}</span>
                    </Link>
                    <EllipsisMenu
                      appId={app.id}
                      onDeleted={handleDeleted}
                      onApplied={handleApplied}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Link
          href="/jobs"
          className="mt-2 block px-4 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Browse more open roles &rarr;
        </Link>
      </nav>

      {/* Footer */}
      <div className="border-t p-2">
        <Link
          href="/dashboard/settings"
          className="px-1 text-left text-xs text-muted-foreground hover:text-foreground"
        >
          Settings
        </Link>
      </div>
    </aside>
  );
}
