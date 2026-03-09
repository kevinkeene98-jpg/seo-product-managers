import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { applications, chatMessages } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();
    const { applicationId } = await request.json();

    if (!applicationId) {
      return NextResponse.json({ error: "Missing applicationId" }, { status: 400 });
    }

    // Delete chat messages first (foreign key)
    await db
      .delete(chatMessages)
      .where(eq(chatMessages.applicationId, applicationId));

    // Delete the application (only if owned by user)
    await db
      .delete(applications)
      .where(
        and(
          eq(applications.id, applicationId),
          eq(applications.userId, user.userId)
        )
      );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
