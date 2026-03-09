import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { jobAlerts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST() {
  try {
    const user = await requireAuthUser();

    // Check if already subscribed
    const [existing] = await db
      .select()
      .from(jobAlerts)
      .where(and(eq(jobAlerts.userId, user.userId), eq(jobAlerts.active, true)))
      .limit(1);

    if (existing) {
      return NextResponse.json({ subscribed: true, message: "Already subscribed" });
    }

    await db.insert(jobAlerts).values({
      userId: user.userId,
      email: user.email,
    });

    return NextResponse.json({ subscribed: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const user = await requireAuthUser();

    await db
      .update(jobAlerts)
      .set({ active: false })
      .where(eq(jobAlerts.userId, user.userId));

    return NextResponse.json({ subscribed: false });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
