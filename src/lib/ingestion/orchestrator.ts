import { eq, and, lt, ilike, sql } from "drizzle-orm";
import { db } from "@/db";
import { jobs, crawlLogs } from "@/db/schema";
import { SEARCH_KEYWORDS, SEARCH_LOCATIONS } from "@/lib/constants";
import { SerpProvider } from "./serp-provider";
import { transformToJobInsert } from "./transformer";
import { getCompanyLogoUrl, clearLogoCache } from "./brandfetch";
import type { CrawlSummary, SearchQuery } from "./types";

export async function runCrawl(): Promise<CrawlSummary> {
  const provider = new SerpProvider();
  const crawlStartTime = new Date();
  clearLogoCache();
  let totalNew = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  let queryCount = 0;

  // Track title+company pairs seen during this crawl to avoid duplicates
  const seenThisCrawl = new Set<string>();

  for (const keyword of SEARCH_KEYWORDS) {
    for (const loc of SEARCH_LOCATIONS) {
      queryCount++;
      const query: SearchQuery = {
        keyword: "keywordSuffix" in loc ? `${keyword} ${loc.keywordSuffix}` : keyword,
        location: loc.serpApiParam,
      };

      // Insert crawl log entry
      const [logEntry] = await db
        .insert(crawlLogs)
        .values({
          keyword,
          location: loc.label,
          status: "running",
        })
        .returning({ id: crawlLogs.id });

      try {
        const results = await provider.search(query);
        let newCount = 0;

        for (const raw of results) {
          const data = transformToJobInsert(raw, keyword, loc.label);

          // Deduplicate by title + company name (case-insensitive)
          const dedupKey = `${data.title.trim().toLowerCase()}||${data.companyName.trim().toLowerCase()}`;

          // Skip if we already saw this title+company in this crawl
          if (seenThisCrawl.has(dedupKey)) {
            totalSkipped++;
            // Still update lastSeenAt on the existing record via serpJobId upsert
            await db
              .insert(jobs)
              .values(data)
              .onConflictDoUpdate({
                target: jobs.serpJobId,
                set: { lastSeenAt: new Date(), missedCrawlCount: 0, status: "active" },
              });
            continue;
          }

          // Check if a job with same title+company already exists in DB (from prior crawls)
          const [existing] = await db
            .select({ id: jobs.id })
            .from(jobs)
            .where(
              and(
                ilike(jobs.title, data.title.trim()),
                ilike(jobs.companyName, data.companyName.trim()),
                eq(jobs.status, "active")
              )
            )
            .limit(1);

          if (existing) {
            seenThisCrawl.add(dedupKey);
            totalSkipped++;
            // Update lastSeenAt on the existing record so it doesn't go inactive
            await db
              .update(jobs)
              .set({ lastSeenAt: new Date(), missedCrawlCount: 0 })
              .where(eq(jobs.id, existing.id));
            continue;
          }

          seenThisCrawl.add(dedupKey);

          // Fetch Brandfetch logo (cached per company name within this crawl)
          const brandfetchLogo = await getCompanyLogoUrl(raw.companyName);
          if (brandfetchLogo) {
            data.companyLogoUrl = brandfetchLogo;
          }

          const result = await db
            .insert(jobs)
            .values(data)
            .onConflictDoUpdate({
              target: jobs.serpJobId,
              set: {
                title: data.title,
                companyName: data.companyName,
                companyLogoUrl: data.companyLogoUrl,
                description: data.description,
                salaryMin: data.salaryMin,
                salaryMax: data.salaryMax,
                salaryRaw: data.salaryRaw,
                highlights: data.highlights,
                applyUrl: data.applyUrl,
                workType: data.workType,
                jobType: data.jobType,
                experienceLevel: data.experienceLevel,
                postedAt: data.postedAt,
                rawSerpData: data.rawSerpData,
                lastSeenAt: new Date(),
                missedCrawlCount: 0,
                status: "active",
                updatedAt: new Date(),
              },
            })
            .returning({ id: jobs.id, createdAt: jobs.createdAt });

          // If createdAt is very recent, it's a new job
          if (result[0]) {
            const created = result[0].createdAt;
            if (
              created &&
              new Date(created).getTime() > crawlStartTime.getTime() - 5000
            ) {
              newCount++;
            }
          }
        }

        totalNew += newCount;
        totalUpdated += results.length - newCount;

        // Update crawl log
        await db
          .update(crawlLogs)
          .set({
            status: "completed",
            completedAt: new Date(),
            newJobsCount: newCount,
            totalResults: results.length,
          })
          .where(eq(crawlLogs.id, logEntry.id));
      } catch (error) {
        totalErrors++;
        await db
          .update(crawlLogs)
          .set({
            status: "failed",
            completedAt: new Date(),
            error: error instanceof Error ? error.message : String(error),
          })
          .where(eq(crawlLogs.id, logEntry.id));

        console.error(
          `Crawl failed for "${keyword}" in "${loc.label}":`,
          error
        );
        // Continue with next query
      }
    }
  }

  // Failed searches cannot tell us whether existing jobs are still listed.
  // Preserve freshness for the whole crawl if any query was incomplete.
  if (totalErrors > 0) {
    return {
      totalNew,
      totalUpdated,
      totalDeactivated: 0,
      totalErrors,
      queries: queryCount,
    };
  }

  // Freshness pass: increment missed count for active jobs not seen this crawl
  await db
    .update(jobs)
    .set({
      missedCrawlCount: sql`${jobs.missedCrawlCount} + 1`,
    })
    .where(
      and(eq(jobs.status, "active"), lt(jobs.lastSeenAt, crawlStartTime))
    );

  // Deactivate jobs that have missed 3+ consecutive crawls
  const deactivated = await db
    .update(jobs)
    .set({
      status: "inactive",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(jobs.status, "active"),
        sql`${jobs.missedCrawlCount} >= 3`
      )
    )
    .returning({ id: jobs.id });

  return {
    totalNew,
    totalUpdated,
    totalDeactivated: deactivated.length,
    totalErrors,
    queries: queryCount,
  };
}
