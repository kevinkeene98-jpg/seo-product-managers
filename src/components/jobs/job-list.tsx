"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { JobCard } from "./job-card";
import type { Job } from "@/lib/types";

interface JobListProps {
  jobs: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function JobList({ jobs, pagination }: JobListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (jobs.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-muted-foreground">
          No jobs found matching your filters.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        {pagination.total} job{pagination.total !== 1 ? "s" : ""} found
      </p>

      <div className="space-y-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => goToPage(pagination.page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => goToPage(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
