"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CTASection() {
  return (
    <section className="border-t bg-muted/50 py-16 text-center">
      <h2 className="text-2xl font-bold md:text-3xl">
        Ready to find your next role?
      </h2>
      <div className="mt-8">
        <Link href="/jobs" className={cn(buttonVariants({ variant: "default", size: "lg" }))}>
          Browse jobs now
        </Link>
      </div>
    </section>
  );
}
