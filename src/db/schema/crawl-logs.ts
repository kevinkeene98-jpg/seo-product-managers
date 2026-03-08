import {
  pgTable,
  pgEnum,
  serial,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const crawlStatusEnum = pgEnum("crawl_status", [
  "running",
  "completed",
  "failed",
]);

export const crawlLogs = pgTable("crawl_logs", {
  id: serial("id").primaryKey(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  keyword: text("keyword").notNull(),
  location: text("location").notNull(),
  newJobsCount: integer("new_jobs_count").default(0),
  totalResults: integer("total_results").default(0),
  status: crawlStatusEnum("status").default("running"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
});
