"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Job } from "@/lib/types";

interface JobCTABarProps {
  job: Job;
  resumeLabel?: string;
}

export function JobCTABar({ job, resumeLabel = "Build Resume" }: JobCTABarProps) {
  return (
    <div className="flex flex-col gap-3">
      <Link href={`/builder/${job.id}`} className={cn(buttonVariants({ variant: "default", size: "lg" }))}>
        {resumeLabel}
      </Link>
    </div>
  );
}
