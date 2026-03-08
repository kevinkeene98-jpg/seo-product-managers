import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Deactivate duplicate jobs, keeping the best row per title+company
  const result = await db.execute(sql`
    UPDATE jobs SET status = 'inactive', updated_at = NOW()
    WHERE id NOT IN (
      SELECT DISTINCT ON (LOWER(TRIM(title)), LOWER(TRIM(company_name)))
        id
      FROM jobs
      WHERE status = 'active'
      ORDER BY LOWER(TRIM(title)), LOWER(TRIM(company_name)), salary_max DESC NULLS LAST, id
    )
    AND status = 'active'
  `);

  const countResult = await db.execute(
    sql`SELECT COUNT(*) as cnt FROM jobs WHERE status = 'active'`
  );

  return NextResponse.json({
    deactivated: result.rowCount,
    activeRemaining: countResult.rows[0]?.cnt ?? 0,
  });
}
