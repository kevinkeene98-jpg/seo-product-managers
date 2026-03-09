"use client";

import { Badge } from "@/components/ui/badge";
import { formatSalary, formatWorkType, formatExperience } from "@/lib/format";
import type { Job } from "@/lib/types";

interface Props {
  job: Job;
}

export function JobDescriptionTab({ job }: Props) {
  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="text-lg font-semibold">{job.title}</h3>
        <p className="text-sm text-muted-foreground">{job.companyName}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {job.workType && <Badge variant="secondary">{formatWorkType(job.workType)}</Badge>}
        {job.experienceLevel && <Badge variant="outline">{formatExperience(job.experienceLevel)}</Badge>}
        <Badge variant="outline">{formatSalary(job.salaryMin, job.salaryMax)}</Badge>
      </div>

      {job.location && (
        <p className="text-sm text-muted-foreground">{job.location}</p>
      )}

      {/* Highlights */}
      {job.highlights && job.highlights.length > 0 && (
        <div className="space-y-3">
          {job.highlights.map((section, i) => (
            <div key={i}>
              <h4 className="mb-1 text-sm font-semibold">{section.title}</h4>
              <ul className="list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
                {section.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Full Description */}
      {job.description && (
        <div>
          <h4 className="mb-2 text-sm font-semibold">Full Description</h4>
          <div className="whitespace-pre-wrap text-sm text-muted-foreground">
            {job.description}
          </div>
        </div>
      )}
    </div>
  );
}
