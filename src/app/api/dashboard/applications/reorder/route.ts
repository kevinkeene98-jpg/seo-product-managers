import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { applications } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();
    const { order } = await request.json();

    if (!Array.isArray(order)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    for (const item of order) {
      await db
        .update(applications)
        .set({ sortOrder: item.sortOrder })
        .where(
          and(
            eq(applications.id, item.id),
            eq(applications.userId, user.userId)
          )
        );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
