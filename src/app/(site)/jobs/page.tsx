import { Suspense } from "react";
import type { Metadata } from "next";
import { JobFilters } from "@/components/jobs/job-filters";
import { JobList } from "@/components/jobs/job-list";
import { Skeleton } from "@/components/ui/skeleton";
import { getActiveJobs } from "@/lib/queries/jobs";
import { getApplicationJobIds } from "@/lib/queries/applications";
import { getSessionId } from "@/lib/session";
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

  const [result, sessionId] = await Promise.all([getActiveJobs(filters), getSessionId()]);
  const activeJobIds = sessionId ? await getApplicationJobIds(sessionId) : new Set<number>();

  // Raw SQL returns snake_case keys and plain strings (not Date objects)
  const jobs: Job[] = result.jobs.map((j: Record<string, unknown>) => ({
    id: j.id as number,
    serpJobId: j.serp_job_id as string,
    title: j.title as string,
    companyName: j.company_name as string,
    companyLogoUrl: (j.company_logo_url as string) ?? null,
    location: (j.location as string) ?? null,
    workType: j.work_type as Job["workType"],
    jobType: j.job_type as Job["jobType"],
    experienceLevel: j.experience_level as Job["experienceLevel"],
    salaryMin: (j.salary_min as number) ?? null,
    salaryMax: (j.salary_max as number) ?? null,
    salaryRaw: (j.salary_raw as string) ?? null,
    description: (j.description as string) ?? null,
    highlights: j.highlights as Job["highlights"],
    applyUrl: (j.apply_url as string) ?? null,
    source: (j.source as string) ?? null,
    postedAt: j.posted_at ? String(j.posted_at) : null,
    status: j.status as Job["status"],
    lastSeenAt: String(j.last_seen_at),
    createdAt: j.created_at ? String(j.created_at) : null,
    updatedAt: j.updated_at ? String(j.updated_at) : null,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
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
          <h1 className="mb-6 text-3xl font-bold">Browse Product & Growth SEO roles</h1>
          <Suspense
            fallback={
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            }
          >
            <JobList jobs={jobs} pagination={result.pagination} activeJobIds={Array.from(activeJobIds)} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
