"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-context";

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, isLoading, openAuthDialog, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          SEO Product Managers
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/jobs"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Browse jobs
          </Link>
          {!isLoading && (
            user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Applications
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Settings
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openAuthDialog()}
              >
                Sign in
              </Button>
            )
          )}
        </nav>

        {/* Mobile nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="sm" />} className="md:hidden">
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
          <SheetContent side="right" className="w-64">
            <nav className="mt-8 flex flex-col gap-4">
              <Link
                href="/jobs"
                className="text-lg font-medium"
                onClick={() => setOpen(false)}
              >
                Browse jobs
              </Link>
              {!isLoading && (
                user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-lg font-medium"
                      onClick={() => setOpen(false)}
                    >
                      Applications
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="text-lg font-medium"
                      onClick={() => setOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      className="text-lg font-medium text-left"
                      onClick={() => { signOut(); setOpen(false); }}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <button
                    className="text-lg font-medium text-left"
                    onClick={() => { openAuthDialog(); setOpen(false); }}
                  >
                    Sign in
                  </button>
                )
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
