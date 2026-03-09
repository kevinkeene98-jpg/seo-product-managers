import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import { chatMessages, applications } from "@/db/schema";

export async function getChatMessages(applicationId: number) {
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.applicationId, applicationId))
    .orderBy(chatMessages.createdAt);
}

export async function addChatMessage(data: {
  applicationId: number;
  role: "user" | "assistant";
  content: string;
  activeTab?: string;
  targetSection?: string;
  suggestedContent?: unknown;
}) {
  const [msg] = await db
    .insert(chatMessages)
    .values({
      applicationId: data.applicationId,
      role: data.role,
      content: data.content,
      activeTab: data.activeTab ?? null,
      targetSection: data.targetSection ?? null,
      suggestedContent: data.suggestedContent ?? null,
      suggestionStatus: data.targetSection ? "pending" : null,
    })
    .returning();

  return msg;
}

export async function updateSuggestionStatus(
  messageId: number,
  status: "accepted" | "dismissed"
) {
  await db
    .update(chatMessages)
    .set({ suggestionStatus: status })
    .where(eq(chatMessages.id, messageId));
}

export async function getDailyMessageCount(sessionId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(chatMessages)
    .innerJoin(applications, eq(chatMessages.applicationId, applications.id))
    .where(
      and(
        eq(applications.sessionId, sessionId),
        eq(chatMessages.role, "user"),
        sql`${chatMessages.createdAt} >= (CURRENT_DATE AT TIME ZONE 'America/New_York')::timestamptz`
      )
    );

  return result?.count ?? 0;
}

export function getMessageLimitResetTime(): string {
  const now = new Date();
  const est = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const midnight = new Date(est);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  return midnight.toISOString();
}
