import { notFound } from "next/navigation";
import { getJobById } from "@/lib/queries/jobs";
import { requireSessionId } from "@/lib/session";
import { getAuthUser } from "@/lib/auth";
import { getOrCreateApplication } from "@/lib/queries/applications";
import { getOrCreateResume } from "@/lib/queries/resumes";
import { getChatMessages, getDailyMessageCount } from "@/lib/queries/chat";
import { BuilderShell } from "@/components/builder/builder-shell";
import type { Job } from "@/lib/types";
import type { ResumeData, QAEntry } from "@/lib/types/resume";

interface PageProps {
  params: Promise<{ jobId: string }>;
}

const FREE_DAILY_LIMIT = 20;

export default async function BuilderPage({ params }: PageProps) {
  const { jobId } = await params;
  const sessionId = await requireSessionId();
  const authUser = await getAuthUser();
  const isPaid = authUser?.subscriptionStatus === "active";
  const raw = await getJobById(Number(jobId));
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

  // Get or create application and resume
  const application = await getOrCreateApplication(sessionId, raw.id);
  const resume = await getOrCreateResume(sessionId);

  // Load chat messages
  const chatMessages = await getChatMessages(application.id);
  const messageCount = await getDailyMessageCount(sessionId);

  // Use application's resume content, falling back to the resume record
  const resumeData = (application.resumeContent ?? resume.parsedContent) as ResumeData | null;

  return (
    <BuilderShell
      job={job}
      applicationId={application.id}
      initialResumeData={resumeData}
      initialCoverLetter={(application.coverLetterContent as string) ?? null}
      initialQA={(application.qaContent as QAEntry[]) ?? null}
      initialChatMessages={chatMessages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        targetSection: m.targetSection,
        suggestedContent: m.suggestedContent,
        suggestionStatus: m.suggestionStatus,
      }))}
      initialRemaining={isPaid ? 999 : Math.max(0, FREE_DAILY_LIMIT - messageCount)}
    />
  );
}
