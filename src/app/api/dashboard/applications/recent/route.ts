import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { applications, jobs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ apps: [] });
    }

    const rows = await db
      .select({
        id: applications.id,
        jobId: jobs.id,
        jobTitle: jobs.title,
        companyName: jobs.companyName,
        companyLogoUrl: jobs.companyLogoUrl,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(applications.userId, user.userId))
      .orderBy(desc(applications.updatedAt))
      .limit(5);

    return NextResponse.json({ apps: rows });
  } catch {
    return NextResponse.json({ apps: [] });
  }
}
