"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "/dashboard", label: "Applications" },
  { href: "/dashboard/settings", label: "Settings" },
];

interface Props {
  userName: string;
}

function NavContent({ userName, onNavigate }: { userName: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <>
      <div className="border-b px-4 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          SPM
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <p className="truncate text-sm font-medium">{userName}</p>
        <button
          onClick={() => signOut()}
          className="mt-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Sign Out
        </button>
      </div>
    </>
  );
}

export function DashboardSidebar({ userName }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-56 flex-col border-r bg-background md:flex">
        <NavContent userName={userName} />
      </aside>

      {/* Mobile header + sheet */}
      <div className="flex h-14 items-center border-b bg-background px-4 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="sm" />}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0">
            <div className="flex h-full flex-col">
              <NavContent userName={userName} onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="ml-3 text-lg font-bold">
          SPM
        </Link>
      </div>
    </>
  );
}
