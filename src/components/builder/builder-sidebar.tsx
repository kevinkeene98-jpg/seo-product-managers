"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Applications", icon: "📋" },
  { href: "/dashboard/recommended", label: "Recommended", icon: "⭐" },
  { href: "/jobs", label: "Browse Jobs", icon: "🔍" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export function BuilderSidebar() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const { user, signOut, openAuthDialog } = useAuth();

  return (
    <aside
      className={cn(
        "group/sidebar flex flex-col border-r bg-background transition-all duration-200",
        expanded ? "w-48" : "w-12"
      )}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          {expanded ? "SPM" : "S"}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-1.5">
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
              {expanded && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t p-2">
        {user ? (
          <div className={cn("flex flex-col", expanded ? "gap-1" : "items-center")}>
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
              title={user.name || user.email}
            >
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
            {expanded && (
              <>
                <p className="truncate px-1 text-xs font-medium">
                  {user.name || user.email}
                </p>
                <button
                  onClick={() => signOut()}
                  className="px-1 text-left text-xs text-muted-foreground hover:text-foreground"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => openAuthDialog()}
            title="Sign In"
            className={cn(
              "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
              !expanded && "justify-center"
            )}
          >
            <span className="shrink-0 text-base">👤</span>
            {expanded && <span>Sign In</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
