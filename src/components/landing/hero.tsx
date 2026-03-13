"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="flex flex-col items-center px-4 py-16 text-center md:py-20">
      <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
        Find your next SEO product role
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
        The only job board for SEO-first product managers
      </p>
      <div className="mt-10">
        <Link href="/jobs" className={cn(buttonVariants({ variant: "default", size: "lg" }))}>
          Browse open roles
        </Link>
      </div>
    </section>
  );
}
