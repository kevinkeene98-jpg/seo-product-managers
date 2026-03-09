import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { streamCoverLetter } from "@/lib/ai/client";
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

    // Get resume data — check application first, fall back to resumes table
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

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const gen = streamCoverLetter(resumeData!, job.title, job.companyName, job.description);
          for await (const chunk of gen) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          controller.close();
        } catch (error) {
          console.error("Cover letter generation error:", error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "Generation failed" })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Cover letter error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate cover letter";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
