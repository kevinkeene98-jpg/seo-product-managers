"use client";

import { useAuth } from "@/components/auth/auth-context";

export function UnsavedBanner() {
  const { openAuthDialog } = useAuth();

  return (
    <div className="bg-amber-50 px-4 py-2 text-center text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
      Your work isn&apos;t saved yet.{" "}
      <button
        onClick={() => openAuthDialog("Sign in to save your progress")}
        className="font-medium underline hover:no-underline"
      >
        Sign in
      </button>{" "}
      to save your progress.
    </div>
  );
}
