import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { getSessionId } from "@/lib/session";
import { eq, and, or } from "drizzle-orm";
import { db } from "@/db";
import { applications, chatMessages } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();
    const sessionId = await getSessionId();
    const { applicationId } = await request.json();

    if (!applicationId) {
      return NextResponse.json({ error: "Missing applicationId" }, { status: 400 });
    }

    // Build ownership condition: match by userId OR sessionId
    const ownershipConditions = [eq(applications.userId, user.userId)];
    if (sessionId) {
      ownershipConditions.push(eq(applications.sessionId, sessionId));
    }

    // Delete chat messages first (foreign key)
    await db
      .delete(chatMessages)
      .where(eq(chatMessages.applicationId, applicationId));

    // Delete the application (only if owned by user or session)
    await db
      .delete(applications)
      .where(
        and(
          eq(applications.id, applicationId),
          or(...ownershipConditions)
        )
      );

    // Invalidate cached pages so "Continue" CTAs update
    revalidatePath("/jobs", "layout");
    revalidatePath("/dashboard");

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
