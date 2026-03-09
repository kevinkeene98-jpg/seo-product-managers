import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import { applications, resumes } from "@/db/schema";

/**
 * Migrate anonymous session data to a user account.
 * Anonymous work always wins on merge (it's more recent).
 */
export async function migrateSessionToUser(
  sessionId: string,
  userId: number
): Promise<{ migratedApplications: number; migratedResumes: number }> {
  let migratedApplications = 0;
  let migratedResumes = 0;

  // Get all anonymous applications for this session
  const anonApps = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.sessionId, sessionId),
        isNull(applications.userId)
      )
    );

  for (const app of anonApps) {
    // Check if user already has an application for this job
    const [existing] = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.userId, userId),
          eq(applications.jobId, app.jobId)
        )
      )
      .limit(1);

    if (existing) {
      // Anonymous work wins — overwrite the existing user application with anonymous data
      await db
        .update(applications)
        .set({
          resumeContent: app.resumeContent,
          coverLetterContent: app.coverLetterContent,
          qaContent: app.qaContent,
          fitAssessment: app.fitAssessment,
          updatedAt: new Date(),
        })
        .where(eq(applications.id, existing.id));

      // Delete the anonymous application (it's been merged)
      await db.delete(applications).where(eq(applications.id, app.id));
    } else {
      // No conflict — just link it to the user
      await db
        .update(applications)
        .set({ userId, updatedAt: new Date() })
        .where(eq(applications.id, app.id));
    }
    migratedApplications++;
  }

  // Migrate resumes: anonymous work wins
  const anonResumes = await db
    .select()
    .from(resumes)
    .where(
      and(
        eq(resumes.sessionId, sessionId),
        isNull(resumes.userId)
      )
    );

  for (const resume of anonResumes) {
    // Check if user already has a resume
    const [existing] = await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .limit(1);

    if (existing) {
      // Anonymous work wins — overwrite
      await db
        .update(resumes)
        .set({
          parsedContent: resume.parsedContent,
          rawText: resume.rawText,
          originalFilename: resume.originalFilename,
          updatedAt: new Date(),
        })
        .where(eq(resumes.id, existing.id));

      await db.delete(resumes).where(eq(resumes.id, resume.id));
    } else {
      await db
        .update(resumes)
        .set({ userId, updatedAt: new Date() })
        .where(eq(resumes.id, resume.id));
    }
    migratedResumes++;
  }

  return { migratedApplications, migratedResumes };
}
