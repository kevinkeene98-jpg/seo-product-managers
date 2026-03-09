import { notFound } from "next/navigation";
import Link from "next/link";
import { getJobById } from "@/lib/queries/jobs";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatSalary,
  formatWorkType,
  formatExperience,
  formatJobType,
  timeAgo,
} from "@/lib/format";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ company: string; id: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(Number(id), false);
  if (!job) return { title: "Job Not Found" };

  return {
    title: `${job.title} at ${job.companyName} | SEO Product Managers`,
    description: job.description?.slice(0, 160) || `${job.title} position at ${job.companyName}`,
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const job = await getJobById(Number(id), false);
  if (!job) notFound();

  const isInactive = job.status === "inactive";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {isInactive && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          This job posting may no longer be active. It was last seen{" "}
          {timeAgo(job.lastSeenAt)}.
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
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
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p className="text-lg text-muted-foreground">{job.companyName}</p>
            {job.location && (
              <p className="text-sm text-muted-foreground">{job.location}</p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          {job.workType && <Badge variant="secondary">{formatWorkType(job.workType)}</Badge>}
          {job.jobType && <Badge variant="outline">{formatJobType(job.jobType)}</Badge>}
          {job.experienceLevel && <Badge variant="outline">{formatExperience(job.experienceLevel)}</Badge>}
          <Badge variant="outline">{formatSalary(job.salaryMin, job.salaryMax)}</Badge>
          {job.postedAt && (
            <Badge variant="outline" className="text-muted-foreground">
              Posted {timeAgo(job.postedAt)}
            </Badge>
          )}
        </div>

        {/* CTAs */}
        <div className="mt-6 flex gap-3">
          <Link
            href={`/builder/${job.id}`}
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Build Resume
          </Link>
          {job.applyUrl && (
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              View Original Posting
            </a>
          )}
        </div>
      </div>

      {/* Highlights */}
      {Boolean(job.highlights) && (job.highlights as Array<{ title: string; items: string[] }>).length > 0 && (
        <div className="mb-8 space-y-4">
          {(job.highlights as Array<{ title: string; items: string[] }>).map((section, i) => (
            <div key={i}>
              <h2 className="mb-2 text-lg font-semibold">{section.title}</h2>
              <ul className="list-inside list-disc space-y-1 text-muted-foreground">
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
          <h2 className="mb-3 text-lg font-semibold">Full Description</h2>
          <div className="whitespace-pre-wrap text-muted-foreground">
            {job.description}
          </div>
        </div>
      )}

      {/* Back link */}
      <div className="mt-8 border-t pt-6">
        <Link href="/jobs" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Back to all jobs
        </Link>
      </div>
    </div>
  );
}
