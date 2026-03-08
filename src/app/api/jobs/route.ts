import { NextRequest, NextResponse } from "next/server";
import { jobsQuerySchema } from "@/lib/validators/jobs";
import { getActiveJobs } from "@/lib/queries/jobs";

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);

  const parsed = jobsQuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = await getActiveJobs(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
