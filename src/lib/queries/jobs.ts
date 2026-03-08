import { eq, and, gte, lte, ilike, sql, SQL } from "drizzle-orm";
import { db } from "@/db";
import { jobs } from "@/db/schema";
import type { JobsQuery } from "@/lib/validators/jobs";

export async function getActiveJobs(filters: JobsQuery) {
  const conditions: SQL[] = [eq(jobs.status, "active")];

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
  if (filters.job_type) {
    conditions.push(eq(jobs.jobType, filters.job_type));
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

  // Get total count
  const [{ count: total }] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(jobs)
    .where(where);

  // Get paginated results, sorted by salary descending with nulls last
  const results = await db
    .select()
    .from(jobs)
    .where(where)
    .orderBy(sql`${jobs.salaryMax} DESC NULLS LAST`)
    .limit(filters.limit)
    .offset(offset);

  return {
    jobs: results,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
}

export async function getJobById(id: number) {
  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, id), eq(jobs.status, "active")));

  return job || null;
}
