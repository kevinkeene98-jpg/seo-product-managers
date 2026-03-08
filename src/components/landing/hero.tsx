"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="flex flex-col items-center px-4 py-24 text-center md:py-32">
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
        Find Your Next SEO &amp; Growth Product Role
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
        Curated job listings, AI-powered resume builder, and application
        tracking — built for SEO and growth product managers.
      </p>
      <div className="mt-10 flex flex-col items-center gap-4">
        <Link href="/jobs" className={cn(buttonVariants({ variant: "default", size: "lg" }))}>
          Browse Jobs
        </Link>
        <p className="text-sm text-muted-foreground">
          No account required to start browsing
        </p>
      </div>
    </section>
  );
}
