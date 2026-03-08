"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Job } from "@/lib/types";

interface JobCTABarProps {
  job: Job;
}

export function JobCTABar({ job }: JobCTABarProps) {
  return (
    <div className="flex flex-col gap-3">
      {job.applyUrl && (
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "default", size: "lg" }))}
        >
          View Job Posting
        </a>
      )}
      <Link href={`/builder/${job.id}`} className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
        Build Resume
      </Link>
    </div>
  );
}
