import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { JobHeader } from "@/components/job-detail/job-header";
import { JobDescription } from "@/components/job-detail/job-description";
import { JobCTABar } from "@/components/job-detail/job-cta-bar";
import { getJobById } from "@/lib/queries/jobs";
import type { Job } from "@/lib/types";

interface PageProps {
  params: Promise<{ company: string; id: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const raw = await getJobById(Number(id));
  if (!raw) return { title: "Job Not Found" };

  return {
    title: `${raw.title} at ${raw.companyName} | SEO Product Managers`,
    description: raw.description.slice(0, 160),
    openGraph: {
      title: `${raw.title} at ${raw.companyName}`,
      description: raw.description.slice(0, 160),
      type: "article",
    },
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const raw = await getJobById(Number(id));
  if (!raw) notFound();

  const job: Job = {
    id: raw.id,
    serpJobId: raw.serpJobId,
    title: raw.title,
    companyName: raw.companyName,
    companyLogoUrl: raw.companyLogoUrl,
    location: raw.location,
    workType: raw.workType,
    jobType: raw.jobType,
    experienceLevel: raw.experienceLevel,
    salaryMin: raw.salaryMin,
    salaryMax: raw.salaryMax,
    salaryRaw: raw.salaryRaw,
    description: raw.description,
    highlights: raw.highlights as Job["highlights"],
    applyUrl: raw.applyUrl,
    source: raw.source,
    postedAt: raw.postedAt?.toISOString() ?? null,
    status: raw.status,
    lastSeenAt: raw.lastSeenAt.toISOString(),
    createdAt: raw.createdAt?.toISOString() ?? null,
    updatedAt: raw.updatedAt?.toISOString() ?? null,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          <JobHeader job={job} />
          <Separator className="my-8" />
          <JobDescription job={job} />
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <JobCTABar job={job} />
          </div>
        </aside>
      </div>

      {/* Mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 border-t bg-background p-4 lg:hidden">
        <div className="mx-auto flex max-w-6xl gap-3">
          <Link
            href={`/builder/${job.id}`}
            className="flex-1 rounded-md bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground"
          >
            Build Resume
          </Link>
          {job.applyUrl && (
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-md border border-input bg-background px-4 py-3 text-center text-sm font-medium"
            >
              View Posting
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
