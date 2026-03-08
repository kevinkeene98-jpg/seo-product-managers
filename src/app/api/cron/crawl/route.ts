import { NextResponse } from "next/server";
import { runCrawl } from "@/lib/ingestion/orchestrator";

export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runCrawl();
    return NextResponse.json({
      success: true,
      summary,
    });
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
