"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { cn } from "@/lib/utils";

interface RecentApp {
  id: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  companyLogoUrl: string | null;
}

const navItems = [
  { href: "/dashboard", label: "Applications", icon: "📋" },
  { href: "/jobs", label: "Browse Jobs", icon: "🔍" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export function BuilderSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [recentApps, setRecentApps] = useState<RecentApp[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/dashboard/applications/recent")
      .then((r) => (r.ok ? r.json() : { apps: [] }))
      .then((data) => setRecentApps(data.apps || []))
      .catch(() => {});
  }, [user]);

  return (
    <aside className="flex w-48 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          SPM
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-1.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
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
              <span className="shrink-0 text-base">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        {/* Recent Applications */}
        {recentApps.length > 0 && (
          <div className="mt-4 border-t pt-3">
            <p className="mb-1 px-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recent
            </p>
            {recentApps.map((app) => {
              const href = `/builder/${app.jobId}`;
              const isActive = pathname === href;
              return (
                <Link
                  key={app.id}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
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
              );
            })}
          </div>
        )}
      </nav>

      {/* User */}
      <div className="border-t p-2">
        <div className="flex flex-col gap-1">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
            title={user?.name || user?.email || ""}
          >
            {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
          </div>
          <p className="truncate px-1 text-xs font-medium">
            {user?.name || user?.email}
          </p>
          <button
            onClick={() => signOut()}
            className="px-1 text-left text-xs text-muted-foreground hover:text-foreground"
          >
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
