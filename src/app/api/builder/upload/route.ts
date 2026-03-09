import { NextResponse } from "next/server";
import { requireSessionId } from "@/lib/session";
import { getOrCreateResume, updateResumeRawText, updateResumeParsedContent } from "@/lib/queries/resumes";
import { parseResume } from "@/lib/ai/client";

export async function POST(request: Request) {
  const sessionId = await requireSessionId();
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const filename = file.name.toLowerCase();
  if (!filename.endsWith(".pdf") && !filename.endsWith(".docx")) {
    return NextResponse.json(
      { error: "Only .pdf and .docx files are supported" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let rawText: string;

  if (filename.endsWith(".pdf")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
    const parsed = await pdfParse(buffer);
    rawText = parsed.text;
  } else {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    rawText = result.value;
  }

  if (!rawText.trim()) {
    return NextResponse.json(
      { error: "Could not extract text from file" },
      { status: 400 }
    );
  }

  const resume = await getOrCreateResume(sessionId);
  await updateResumeRawText(resume.id, rawText, file.name);

  const parsed = await parseResume(rawText);
  await updateResumeParsedContent(resume.id, parsed);

  return NextResponse.json({ resumeData: parsed });
}
