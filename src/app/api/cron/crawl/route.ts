import { NextResponse } from "next/server";
import { runCrawl } from "@/lib/ingestion/orchestrator";

export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runCrawl();
    const success = summary.totalErrors === 0;
    return NextResponse.json({
      success,
      summary,
    }, { status: success ? 200 : 502 });
  } catch (error) {
    console.error("Crawl failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
