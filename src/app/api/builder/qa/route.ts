import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { generateQA } from "@/lib/ai/client";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { applications, jobs } from "@/db/schema";
import type { ResumeData } from "@/lib/types/resume";

export async function POST(request: Request) {
  try {
    const sessionId = await getSessionId();
    if (!sessionId) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }

    const { applicationId } = await request.json();

    const [app] = await db
      .select()
      .from(applications)
      .where(and(eq(applications.id, applicationId), eq(applications.sessionId, sessionId)))
      .limit(1);

    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    let resumeData = app.resumeContent as ResumeData | null;
    if (!resumeData) {
      const { resumes } = await import("@/db/schema");
      const [resume] = await db
        .select()
        .from(resumes)
        .where(eq(resumes.sessionId, sessionId))
        .limit(1);
      if (resume?.parsedContent) {
        resumeData = resume.parsedContent as ResumeData;
      }
    }

    if (!resumeData) {
      return NextResponse.json({ error: "Upload your resume first" }, { status: 400 });
    }

    const [job] = await db.select().from(jobs).where(eq(jobs.id, app.jobId)).limit(1);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const qaEntries = await generateQA(resumeData, job.title, job.companyName, job.description);
    return NextResponse.json({ entries: qaEntries });
  } catch (err) {
    console.error("QA generation error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate Q&A";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
