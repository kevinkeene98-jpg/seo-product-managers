import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { applications } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();
    const { applicationId, status } = await request.json();

    if (!applicationId || !["active", "applied", "archived"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await db
      .update(applications)
      .set({ status, updatedAt: new Date() })
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
