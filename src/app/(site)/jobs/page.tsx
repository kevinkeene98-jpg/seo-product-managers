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

  // Raw SQL returns snake_case columns — map them to camelCase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jobs: Job[] = result.jobs.map((row: any) => {
    const j = {
      id: row.id,
      serpJobId: row.serp_job_id ?? row.serpJobId,
      title: row.title,
      companyName: row.company_name ?? row.companyName,
      companyLogoUrl: row.company_logo_url ?? row.companyLogoUrl ?? null,
      location: row.location,
      workType: row.work_type ?? row.workType ?? null,
      jobType: row.job_type ?? row.jobType ?? null,
      experienceLevel: row.experience_level ?? row.experienceLevel ?? null,
      salaryMin: row.salary_min ?? row.salaryMin ?? null,
      salaryMax: row.salary_max ?? row.salaryMax ?? null,
      salaryRaw: row.salary_raw ?? row.salaryRaw ?? null,
      description: row.description,
      highlights: (row.highlights ?? null) as Job["highlights"],
      applyUrl: row.apply_url ?? row.applyUrl ?? null,
      source: row.source ?? null,
      postedAt: row.posted_at ?? row.postedAt,
      status: (row.status ?? "active") as Job["status"],
      lastSeenAt: row.last_seen_at ?? row.lastSeenAt,
      createdAt: row.created_at ?? row.createdAt ?? null,
      updatedAt: row.updated_at ?? row.updatedAt ?? null,
    };

    return {
      ...j,
      postedAt: j.postedAt ? new Date(j.postedAt).toISOString() : null,
      lastSeenAt: new Date(j.lastSeenAt).toISOString(),
      createdAt: j.createdAt ? new Date(j.createdAt).toISOString() : null,
      updatedAt: j.updatedAt ? new Date(j.updatedAt).toISOString() : null,
    };
  });

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
