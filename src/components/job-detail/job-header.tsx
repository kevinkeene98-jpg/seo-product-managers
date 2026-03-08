import { Badge } from "@/components/ui/badge";
import { SalaryBadge } from "@/components/jobs/salary-badge";
import { NewBadge } from "@/components/jobs/new-badge";
import {
  formatWorkType,
  formatExperience,
  formatJobType,
  timeAgo,
  isNewJob,
} from "@/lib/format";
import type { Job } from "@/lib/types";

interface JobHeaderProps {
  job: Job;
}

export function JobHeader({ job }: JobHeaderProps) {
  return (
    <div>
      <div className="flex items-start gap-4">
        {job.companyLogoUrl ? (
          <img
            src={job.companyLogoUrl}
            alt={job.companyName}
            className="h-16 w-16 rounded-lg object-contain"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-2xl font-bold text-muted-foreground">
            {job.companyName.charAt(0)}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold md:text-3xl">{job.title}</h1>
            {isNewJob(job.createdAt) && <NewBadge />}
          </div>
          <p className="mt-1 text-lg text-muted-foreground">
            {job.companyName}
          </p>
          <p className="text-sm text-muted-foreground">{job.location}</p>
          {job.postedAt && (
            <p className="mt-1 text-sm text-muted-foreground">
              Posted {timeAgo(job.postedAt)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
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
        <SalaryBadge salaryMin={job.salaryMin} salaryMax={job.salaryMax} />
      </div>
    </div>
  );
}
