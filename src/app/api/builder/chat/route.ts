import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { getAuthUser } from "@/lib/auth";
import { getChatMessages, addChatMessage, getDailyMessageCount, getMessageLimitResetTime } from "@/lib/queries/chat";
import { updateApplicationField, linkApplicationToUser } from "@/lib/queries/applications";
import { streamChat, generateFitAssessment, parseSuggestions } from "@/lib/ai/client";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { applications } from "@/db/schema";
import type { ResumeData, BuilderTab } from "@/lib/types/resume";

const FREE_DAILY_LIMIT = 20;

export async function POST(request: Request) {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  const { applicationId, message, activeTab } = await request.json();

  if (!applicationId) {
    return NextResponse.json({ error: "Missing applicationId" }, { status: 400 });
  }

  // Check auth and subscription
  const authUser = await getAuthUser();
  const isPaid = authUser?.subscriptionStatus === "active";

  // Link application to user if authenticated
  if (authUser) {
    await linkApplicationToUser(applicationId, authUser.userId);
  }

  // Check rate limit (paid users are unlimited)
  const messageCount = await getDailyMessageCount(sessionId);
  if (!isPaid && messageCount >= FREE_DAILY_LIMIT) {
    return NextResponse.json(
      {
        error: "Daily message limit reached. Upgrade to Pro for unlimited messages.",
        resetAt: getMessageLimitResetTime(),
        remaining: 0,
      },
      { status: 429 }
    );
  }

  // Get the application with job data
  const [app] = await db
    .select()
    .from(applications)
    .where(and(eq(applications.id, applicationId), eq(applications.sessionId, sessionId)))
    .limit(1);

  if (!app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  // Get job data
  const { jobs } = await import("@/db/schema");
  const [job] = await db.select().from(jobs).where(eq(jobs.id, app.jobId)).limit(1);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const resumeData = app.resumeContent as ResumeData | null;

  // Get existing messages
  const existingMessages = await getChatMessages(applicationId);
  const isFirstMessage = existingMessages.length === 0;

  // If this is the first interaction and we have resume data, run fit assessment via Opus
  if (isFirstMessage && resumeData) {
    // Save user message
    await addChatMessage({
      applicationId,
      role: "user",
      content: message || "Please assess my fit for this role.",
      activeTab,
    });

    const assessment = await generateFitAssessment(
      resumeData,
      job.title,
      job.companyName,
      job.description
    );

    // Save assessment
    await addChatMessage({
      applicationId,
      role: "assistant",
      content: assessment,
      activeTab,
    });

    // Store fit assessment on the application
    await updateApplicationField(applicationId, "fitAssessment", assessment);

    // Parse any suggestions
    const suggestions = parseSuggestions(assessment);
    for (const suggestion of suggestions) {
      await addChatMessage({
        applicationId,
        role: "assistant",
        content: `Suggestion for ${suggestion.sectionPath}`,
        activeTab,
        targetSection: suggestion.sectionPath,
        suggestedContent: suggestion.content,
      });
    }

    return NextResponse.json({
      content: assessment,
      remaining: isPaid ? 999 : FREE_DAILY_LIMIT - messageCount - 1,
      suggestions,
    });
  }

  // Regular chat — save user message
  if (message) {
    await addChatMessage({
      applicationId,
      role: "user",
      content: message,
      activeTab,
    });
  }

  // Build chat history for context
  const allMessages = await getChatMessages(applicationId);
  const chatHistory = allMessages
    .filter((m) => m.role === "user" || (m.role === "assistant" && !m.targetSection))
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  // Stream response using Sonnet
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = "";
      try {
        const gen = streamChat(chatHistory, {
          resume: resumeData,
          jobTitle: job.title,
          jobCompany: job.companyName,
          jobDescription: job.description,
          fitAssessment: app.fitAssessment,
          activeTab: (activeTab || "resume") as BuilderTab,
          coverLetter: app.coverLetterContent as string | null,
          qaContent: app.qaContent ? JSON.stringify(app.qaContent) : null,
        });

        for await (const chunk of gen) {
          fullResponse += chunk;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
        }

        // Save assistant response
        await addChatMessage({
          applicationId,
          role: "assistant",
          content: fullResponse,
          activeTab,
        });

        // Parse and save any suggestions
        const suggestions = parseSuggestions(fullResponse);
        for (const suggestion of suggestions) {
          await addChatMessage({
            applicationId,
            role: "assistant",
            content: `Suggestion for ${suggestion.sectionPath}`,
            activeTab,
            targetSection: suggestion.sectionPath,
            suggestedContent: suggestion.content,
          });
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ done: true, remaining: isPaid ? 999 : FREE_DAILY_LIMIT - messageCount - 1, suggestions })}\n\n`
          )
        );
        controller.close();
      } catch (error) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: "Chat failed" })}\n\n`)
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
}
