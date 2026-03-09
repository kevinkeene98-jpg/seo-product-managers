import Anthropic from "@anthropic-ai/sdk";
import { RESUME_PARSE_PROMPT, FIT_ASSESSMENT_PROMPT, CHAT_SYSTEM_PROMPT } from "./prompts";
import type { ResumeData, BuilderTab } from "@/lib/types/resume";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return client;
}

export async function parseResume(rawText: string): Promise<ResumeData> {
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: "claude-opus-4-20250514",
    max_tokens: 4096,
    system: RESUME_PARSE_PROMPT,
    messages: [{ role: "user", content: rawText }],
  });

  let text = response.content[0].type === "text" ? response.content[0].text : "";
  // Strip markdown code fences if present
  text = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  return JSON.parse(text) as ResumeData;
}

export async function generateFitAssessment(
  resume: ResumeData,
  jobTitle: string,
  jobCompany: string,
  jobDescription: string
): Promise<string> {
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: "claude-opus-4-20250514",
    max_tokens: 2048,
    system: FIT_ASSESSMENT_PROMPT,
    messages: [
      {
        role: "user",
        content: `## Candidate Resume\n${JSON.stringify(resume, null, 2)}\n\n## Job: ${jobTitle} at ${jobCompany}\n${jobDescription}`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

interface ChatContext {
  resume: ResumeData | null;
  jobTitle: string;
  jobCompany: string;
  jobDescription: string;
  fitAssessment: string | null;
  activeTab: BuilderTab;
  coverLetter: string | null;
  qaContent: string | null;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function* streamChat(
  messages: ChatMessage[],
  context: ChatContext
): AsyncGenerator<string> {
  const anthropic = getClient();

  const systemParts = [
    CHAT_SYSTEM_PROMPT,
    `\n## Job: ${context.jobTitle} at ${context.jobCompany}\n${context.jobDescription}`,
  ];

  if (context.resume) {
    systemParts.push(`\n## Candidate Resume\n${JSON.stringify(context.resume, null, 2)}`);
  }
  if (context.fitAssessment) {
    systemParts.push(`\n## Your Previous Fit Assessment\n${context.fitAssessment}`);
  }
  if (context.coverLetter) {
    systemParts.push(`\n## Current Cover Letter\n${context.coverLetter}`);
  }
  if (context.qaContent) {
    systemParts.push(`\n## Current Q&A Prep\n${context.qaContent}`);
  }

  systemParts.push(`\nThe user is currently viewing the "${context.activeTab}" tab.`);

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: systemParts.join("\n"),
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}

export function parseSuggestions(
  text: string
): Array<{ sectionPath: string; content: string }> {
  const suggestions: Array<{ sectionPath: string; content: string }> = [];
  const regex = /\[SUGGESTION:([^\]]+)\]\n([\s\S]*?)\n\[\/SUGGESTION\]/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    suggestions.push({
      sectionPath: match[1].trim(),
      content: match[2].trim(),
    });
  }
  return suggestions;
}
