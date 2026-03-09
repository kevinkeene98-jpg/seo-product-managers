import { NextResponse } from "next/server";
import { requireSessionId } from "@/lib/session";
import { getOrCreateResume, updateResumeRawText, updateResumeParsedContent } from "@/lib/queries/resumes";
import { parseResume } from "@/lib/ai/client";

export async function POST(request: Request) {
  const sessionId = await requireSessionId();
  const { rawText } = await request.json();

  if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
    return NextResponse.json({ error: "Resume text is required" }, { status: 400 });
  }

  const resume = await getOrCreateResume(sessionId);
  await updateResumeRawText(resume.id, rawText);

  const parsed = await parseResume(rawText);
  await updateResumeParsedContent(resume.id, parsed);

  return NextResponse.json({ resumeData: parsed });
}
