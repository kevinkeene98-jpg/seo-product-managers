import { Suspense } from "react";
import type { Metadata } from "next";
import { JobFilters } from "@/components/jobs/job-filters";
import { JobList } from "@/components/jobs/job-list";
import { Skeleton } from "@/components/ui/skeleton";
import { getActiveJobs } from "@/lib/queries/jobs";
import type { Job } from "@/lib/types";

export const metadata: Metadata = {
  title: "Browse Jobs | SEO Product Managers",
  description:
    "Browse curated SEO and growth product manager jobs across Remote, New York, and Colorado.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function JobsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters = {
    page: params.page ? Number(params.page) : 1,
    limit: 20,
    q: typeof params.q === "string" ? params.q : undefined,
    location: typeof params.location === "string" && params.location !== "all"
      ? (params.location as "new_york" | "colorado" | "remote")
      : undefined,
    salary_min: params.salary_min ? Number(params.salary_min) : undefined,
    salary_max: params.salary_max ? Number(params.salary_max) : undefined,
    work_type: typeof params.work_type === "string" && params.work_type !== "any"
      ? (params.work_type as "remote" | "hybrid" | "in_office")
      : undefined,
    experience: typeof params.experience === "string" && params.experience !== "all"
      ? (params.experience as "entry" | "mid" | "senior")
      : undefined,
    new_only: params.new_only === "true" ? (true as const) : undefined,
    sort: "salary_desc" as const,
  };

  const result = await getActiveJobs(filters);

  const jobs: Job[] = result.jobs.map((j) => ({
    id: j.id,
    serpJobId: j.serpJobId,
    title: j.title,
    companyName: j.companyName,
    companyLogoUrl: j.companyLogoUrl,
    location: j.location,
    workType: j.workType,
    jobType: j.jobType,
    experienceLevel: j.experienceLevel,
    salaryMin: j.salaryMin,
    salaryMax: j.salaryMax,
    salaryRaw: j.salaryRaw,
    description: j.description,
    highlights: j.highlights as Job["highlights"],
    applyUrl: j.applyUrl,
    source: j.source,
    postedAt: j.postedAt?.toISOString() ?? null,
    status: j.status,
    lastSeenAt: j.lastSeenAt.toISOString(),
    createdAt: j.createdAt?.toISOString() ?? null,
    updatedAt: j.updatedAt?.toISOString() ?? null,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Browse Jobs</h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sticky sidebar filters */}
        <div className="w-full shrink-0 lg:w-60">
          <div className="lg:sticky lg:top-24">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <JobFilters />
            </Suspense>
          </div>
        </div>

        {/* Job list */}
        <div className="min-w-0 flex-1">
          <Suspense
            fallback={
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            }
          >
            <JobList jobs={jobs} pagination={result.pagination} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
