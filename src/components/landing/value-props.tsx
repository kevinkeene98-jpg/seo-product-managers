import { JobCard } from "@/components/jobs/job-card";
import { getActiveJobs } from "@/lib/queries/jobs";
import type { Job } from "@/lib/types";

export async function ValueProps() {
  const result = await getActiveJobs({ page: 1, limit: 6, sort: "salary_desc" });

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

  if (jobs.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="mb-6 text-2xl font-bold">Latest Roles</h2>
      <div className="space-y-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} hideResumeCta />
        ))}
      </div>
    </section>
  );
}
