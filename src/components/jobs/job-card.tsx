"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NewBadge } from "./new-badge";
import { SalaryBadge } from "./salary-badge";
import { isNewJob, formatWorkType, formatExperience, formatJobType, jobUrl } from "@/lib/format";
import type { Job } from "@/lib/types";

interface JobCardProps {
  job: Job;
  hasApplication?: boolean;
}

export function JobCard({ job, hasApplication }: JobCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Company logo */}
          <div className="hidden shrink-0 sm:block">
            {job.companyLogoUrl ? (
              <img
                src={job.companyLogoUrl}
                alt={job.companyName}
                className="h-12 w-12 rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-lg font-bold text-muted-foreground">
                {job.companyName.charAt(0)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  href={jobUrl(job)}
                  className="text-lg font-semibold hover:underline"
                >
                  {job.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {job.companyName}
                </p>
              </div>
              {isNewJob(job.createdAt) && <NewBadge />}
            </div>

            <p className="mt-1 text-sm text-muted-foreground">{job.location}</p>

            {/* Badges */}
            <div className="mt-3 flex flex-wrap gap-2">
              {job.workType && (
                <Badge variant="secondary">{formatWorkType(job.workType)}</Badge>
              )}
              {job.jobType && (
                <Badge variant="outline">{formatJobType(job.jobType)}</Badge>
              )}
              {job.experienceLevel && (
                <Badge variant="outline">
                  {formatExperience(job.experienceLevel)}
                </Badge>
              )}
            </div>

            {/* Salary + CTAs */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <SalaryBadge
                salaryMin={job.salaryMin}
                salaryMax={job.salaryMax}
              />
              <Link href={`/builder/${job.id}`} className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
                {hasApplication ? "Continue" : "Build Resume"}
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
