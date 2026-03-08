import {
  pgTable,
  pgEnum,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const workTypeEnum = pgEnum("work_type", [
  "remote",
  "hybrid",
  "in_office",
]);

export const jobTypeEnum = pgEnum("job_type", ["product", "growth"]);

export const experienceLevelEnum = pgEnum("experience_level", [
  "entry",
  "mid",
  "senior",
]);

export const jobStatusEnum = pgEnum("job_status", ["active", "inactive"]);

export const jobs = pgTable(
  "jobs",
  {
    id: serial("id").primaryKey(),
    serpJobId: text("serp_job_id").unique().notNull(),
    title: text("title").notNull(),
    companyName: text("company_name").notNull(),
    companyLogoUrl: text("company_logo_url"),
    location: text("location").notNull(),
    workType: workTypeEnum("work_type"),
    jobType: jobTypeEnum("job_type"),
    experienceLevel: experienceLevelEnum("experience_level"),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    salaryRaw: text("salary_raw"),
    description: text("description").notNull(),
    highlights: jsonb("highlights"),
    applyUrl: text("apply_url"),
    source: text("source").default("serpapi"),
    postedAt: timestamp("posted_at"),
    status: jobStatusEnum("status").default("active").notNull(),
    lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
    missedCrawlCount: integer("missed_crawl_count").default(0).notNull(),
    searchKeyword: text("search_keyword"),
    searchLocation: text("search_location"),
    rawSerpData: jsonb("raw_serp_data"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("jobs_status_idx").on(table.status),
    index("jobs_work_type_idx").on(table.workType),
    index("jobs_job_type_idx").on(table.jobType),
    index("jobs_experience_level_idx").on(table.experienceLevel),
    index("jobs_salary_max_idx").on(table.salaryMax),
    index("jobs_created_at_idx").on(table.createdAt),
    index("jobs_composite_idx").on(
      table.status,
      table.workType,
      table.jobType,
      table.experienceLevel
    ),
  ]
);
