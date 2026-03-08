import { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { jobs } from "@/db/schema";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://seoproductmanagers.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const activeJobs = await db
    .select({ id: jobs.id, updatedAt: jobs.updatedAt })
    .from(jobs)
    .where(eq(jobs.status, "active"));

  const jobEntries: MetadataRoute.Sitemap = activeJobs.map((job) => ({
    url: `${BASE_URL}/jobs/${job.id}`,
    lastModified: job.updatedAt ?? new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/jobs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...jobEntries,
  ];
}
