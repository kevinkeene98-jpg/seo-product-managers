import { NextResponse } from "next/server";
import { db } from "@/db";
import { jobAlerts, jobs } from "@/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import { sendJobAlertEmail } from "@/lib/email/client";
import { jobUrl } from "@/lib/format";

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get new jobs from the last 24 hours
  const newJobs = await db
    .select()
    .from(jobs)
    .where(
      and(
        eq(jobs.status, "active"),
        gt(jobs.createdAt, sql`NOW() - INTERVAL '24 hours'`)
      )
    )
    .orderBy(sql`${jobs.postedAt} DESC NULLS LAST`)
    .limit(20);

  if (newJobs.length === 0) {
    return NextResponse.json({ sent: 0, message: "No new jobs" });
  }

  // Get all active alert subscribers
  const subscribers = await db
    .select()
    .from(jobAlerts)
    .where(eq(jobAlerts.active, true));

  if (subscribers.length === 0) {
    return NextResponse.json({ sent: 0, message: "No subscribers" });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://seoproductmanagers.com";
  const jobList = newJobs.map((j) => ({
    title: j.title,
    company: j.companyName,
    url: `${appUrl}${jobUrl({ id: j.id, companyName: j.companyName, title: j.title })}`,
  }));

  let sent = 0;
  for (const sub of subscribers) {
    try {
      await sendJobAlertEmail(sub.email, jobList);
      await db
        .update(jobAlerts)
        .set({ lastSentAt: new Date() })
        .where(eq(jobAlerts.id, sub.id));
      sent++;
    } catch (err) {
      console.error(`Failed to send alert to ${sub.email}:`, err);
    }
  }

  return NextResponse.json({ sent, totalJobs: newJobs.length });
}
