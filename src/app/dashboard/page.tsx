import { requireAuthUser } from "@/lib/auth";
import { getApplicationsByUser } from "@/lib/queries/applications";
import { ApplicationList } from "@/components/dashboard/application-list";

export default async function DashboardPage() {
  const user = await requireAuthUser();
  const rows = await getApplicationsByUser(user.userId);

  const applications = rows.map((r) => ({
    id: r.application.id,
    status: r.application.status as "active" | "applied" | "archived",
    jobId: r.job.id,
    jobTitle: r.job.title,
    companyName: r.job.companyName,
    companyLogoUrl: r.job.companyLogoUrl,
    location: r.job.location,
    salaryMin: r.job.salaryMin,
    salaryMax: r.job.salaryMax,
    updatedAt: r.application.updatedAt?.toISOString() ?? null,
    hasResume: !!r.application.resumeContent,
    hasCoverLetter: !!r.application.coverLetterContent,
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">My Applications</h1>
      {applications.length === 0 ? (
        <div className="rounded-lg border bg-background p-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            No applications yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse jobs and start building your resume to get started.
          </p>
        </div>
      ) : (
        <ApplicationList applications={applications} />
      )}
    </div>
  );
}
