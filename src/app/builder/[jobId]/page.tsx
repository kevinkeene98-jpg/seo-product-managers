"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function BuilderPlaceholder() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">Resume Builder</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        This feature is under development. Check back soon for our AI-powered
        resume builder.
      </p>
      <p className="mt-2 text-muted-foreground">
        In the meantime, browse more jobs and find your next role.
      </p>
      <Link href="/jobs" className={cn(buttonVariants({ variant: "default", size: "default" }), "mt-8")}>
        Browse Jobs
      </Link>
    </div>
  );
}
