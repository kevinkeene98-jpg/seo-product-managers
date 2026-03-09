import { requireAuthUser } from "@/lib/auth";
import { getRecommendedJobs } from "@/lib/queries/recommendations";
import { JobCard } from "@/components/jobs/job-card";
import type { Job } from "@/lib/types";

export default async function RecommendedJobsPage() {
  const user = await requireAuthUser();
  const rawJobs = await getRecommendedJobs(user.userId);

  const jobs: Job[] = rawJobs.map((r) => ({
    id: r.id,
    serpJobId: r.serpJobId,
    title: r.title,
    companyName: r.companyName,
    companyLogoUrl: r.companyLogoUrl,
    location: r.location,
    workType: r.workType,
    jobType: r.jobType,
    experienceLevel: r.experienceLevel,
    salaryMin: r.salaryMin,
    salaryMax: r.salaryMax,
    salaryRaw: r.salaryRaw,
    description: r.description,
    highlights: r.highlights as Job["highlights"],
    applyUrl: r.applyUrl,
    source: r.source,
    postedAt: r.postedAt?.toISOString() ?? null,
    status: r.status as Job["status"],
    lastSeenAt: r.lastSeenAt.toISOString(),
    createdAt: r.createdAt?.toISOString() ?? null,
    updatedAt: r.updatedAt?.toISOString() ?? null,
  }));

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Recommended Jobs</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Jobs you haven&apos;t applied to yet, sorted by relevance.
      </p>

      {jobs.length === 0 ? (
        <div className="rounded-lg border bg-background p-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            No new recommendations
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check back soon — new jobs are added daily.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
