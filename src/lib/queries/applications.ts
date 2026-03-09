import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { jobs } from "@/db/schema";

export async function getOrCreateApplication(sessionId: string, jobId: number) {
  const [existing] = await db
    .select()
    .from(applications)
    .where(and(eq(applications.sessionId, sessionId), eq(applications.jobId, jobId)))
    .limit(1);

  if (existing) return existing;

  const [created] = await db
    .insert(applications)
    .values({ sessionId, jobId })
    .returning();

  return created;
}

export async function getApplicationWithJob(sessionId: string, jobId: number) {
  const [result] = await db
    .select({
      application: applications,
      job: jobs,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(and(eq(applications.sessionId, sessionId), eq(applications.jobId, jobId)))
    .limit(1);

  return result ?? null;
}

export async function linkApplicationToUser(applicationId: number, userId: number) {
  await db
    .update(applications)
    .set({ userId })
    .where(and(eq(applications.id, applicationId), sql`${applications.userId} IS NULL`));
}

export async function getApplicationsByUser(userId: number) {
  return db
    .select({
      application: applications,
      job: jobs,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(eq(applications.userId, userId))
    .orderBy(applications.updatedAt);
}

export async function updateApplicationField(
  applicationId: number,
  field: "resumeContent" | "coverLetterContent" | "qaContent" | "fitAssessment",
  content: unknown
) {
  await db
    .update(applications)
    .set({ [field]: content, updatedAt: new Date() })
    .where(eq(applications.id, applicationId));
}
