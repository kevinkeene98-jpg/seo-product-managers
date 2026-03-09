import { sql, eq, and, notInArray } from "drizzle-orm";
import { db } from "@/db";
import { jobs, applications } from "@/db/schema";

/**
 * Get recommended jobs for a user — active jobs they haven't applied to yet.
 * Orders by most recently posted.
 */
export async function getRecommendedJobs(userId: number, limit = 20) {
  // Get job IDs the user has already applied to
  const applied = await db
    .select({ jobId: applications.jobId })
    .from(applications)
    .where(eq(applications.userId, userId));

  const appliedJobIds = applied.map((a) => a.jobId);

  const conditions = [eq(jobs.status, "active")];
  if (appliedJobIds.length > 0) {
    conditions.push(notInArray(jobs.id, appliedJobIds));
  }

  return db
    .select()
    .from(jobs)
    .where(and(...conditions))
    .orderBy(sql`${jobs.postedAt} DESC NULLS LAST`)
    .limit(limit);
}
