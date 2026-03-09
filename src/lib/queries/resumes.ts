import { eq } from "drizzle-orm";
import { db } from "@/db";
import { resumes } from "@/db/schema";
import type { ResumeData } from "@/lib/types/resume";

export async function getOrCreateResume(sessionId: string) {
  const [existing] = await db
    .select()
    .from(resumes)
    .where(eq(resumes.sessionId, sessionId))
    .limit(1);

  if (existing) return existing;

  const [created] = await db
    .insert(resumes)
    .values({ sessionId })
    .returning();

  return created;
}

export async function updateResumeParsedContent(
  resumeId: number,
  content: ResumeData
) {
  await db
    .update(resumes)
    .set({ parsedContent: content, updatedAt: new Date() })
    .where(eq(resumes.id, resumeId));
}

export async function updateResumeRawText(
  resumeId: number,
  rawText: string,
  filename?: string
) {
  await db
    .update(resumes)
    .set({
      rawText,
      originalFilename: filename ?? null,
      updatedAt: new Date(),
    })
    .where(eq(resumes.id, resumeId));
}
