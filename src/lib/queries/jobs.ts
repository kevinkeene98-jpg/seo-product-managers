import { eq, and, gte, lte, ilike, or, sql, SQL } from "drizzle-orm";
import { db } from "@/db";
import { jobs } from "@/db/schema";
import type { JobsQuery } from "@/lib/validators/jobs";

export async function getActiveJobs(filters: JobsQuery) {
  const conditions: SQL[] = [eq(jobs.status, "active")];

  // Only show jobs mentioning SEO (word boundary) or "search engine optimization"
  conditions.push(
    or(
      sql`${jobs.title} ~* '\\yseo\\y'`,
      sql`${jobs.description} ~* '\\yseo\\y'`,
      ilike(jobs.title, "%search engine optimization%"),
      ilike(jobs.description, "%search engine optimization%")
    )!
  );

  // Keyword search (title, company name, description)
  if (filters.q) {
    const term = `%${filters.q}%`;
    conditions.push(
      or(
        ilike(jobs.title, term),
        ilike(jobs.companyName, term),
        ilike(jobs.description, term)
      )!
    );
  }

  // Location filter
  if (filters.location) {
    if (filters.location === "remote") {
      conditions.push(eq(jobs.workType, "remote"));
    } else if (filters.location === "new_york") {
      conditions.push(ilike(jobs.location, "%New York%"));
    } else if (filters.location === "colorado") {
      conditions.push(ilike(jobs.location, "%Colorado%"));
    }
  }

  // Salary filters
  if (filters.salary_min !== undefined) {
    conditions.push(gte(jobs.salaryMax, filters.salary_min));
  }
  if (filters.salary_max !== undefined) {
    conditions.push(lte(jobs.salaryMin, filters.salary_max));
  }

  // Enum filters
  if (filters.work_type) {
    conditions.push(eq(jobs.workType, filters.work_type));
  }
  if (filters.experience) {
    conditions.push(eq(jobs.experienceLevel, filters.experience));
  }

  // New only (less than 7 days old)
  if (filters.new_only) {
    conditions.push(
      gte(jobs.createdAt, sql`NOW() - INTERVAL '7 days'`)
    );
  }

  const where = and(...conditions);
  const offset = (filters.page - 1) * filters.limit;

  // Deduplicated count: count unique title+company combos
  const [{ count: total }] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(
      sql`(
        SELECT DISTINCT ON (LOWER(TRIM(title)), LOWER(TRIM(company_name))) id
        FROM jobs
        WHERE ${where}
        ORDER BY LOWER(TRIM(title)), LOWER(TRIM(company_name)), salary_max DESC NULLS LAST, id
      ) AS deduped`
    );

  // Deduplicated results using DISTINCT ON (title, company_name)
  // Keeps the row with the highest salary_max for each title+company pair
  const results = await db.execute(
    sql`
      SELECT * FROM (
        SELECT DISTINCT ON (LOWER(TRIM(title)), LOWER(TRIM(company_name))) *
        FROM jobs
        WHERE ${where}
        ORDER BY LOWER(TRIM(title)), LOWER(TRIM(company_name)), salary_max DESC NULLS LAST, id
      ) AS deduped
      ORDER BY salary_max DESC NULLS LAST
      LIMIT ${filters.limit}
      OFFSET ${offset}
    `
  );

  return {
    jobs: results.rows as (typeof jobs.$inferSelect)[],
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
}

export async function getJobById(id: number, activeOnly = true) {
  const conditions = [eq(jobs.id, id)];
  if (activeOnly) conditions.push(eq(jobs.status, "active"));

  const [job] = await db
    .select()
    .from(jobs)
    .where(and(...conditions));

  return job || null;
}
