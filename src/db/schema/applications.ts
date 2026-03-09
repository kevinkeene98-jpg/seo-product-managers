import {
  pgTable,
  pgEnum,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { jobs } from "./jobs";

export const applicationStatusEnum = pgEnum("application_status", [
  "active",
  "applied",
  "archived",
]);

export const applications = pgTable(
  "applications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    sessionId: text("session_id"),
    jobId: integer("job_id")
      .references(() => jobs.id)
      .notNull(),
    status: applicationStatusEnum("status").default("active"),
    sortOrder: integer("sort_order").default(0),
    resumeContent: jsonb("resume_content"),
    coverLetterContent: jsonb("cover_letter_content"),
    qaContent: jsonb("qa_content"),
    fitAssessment: text("fit_assessment"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    unique("applications_user_job_unique").on(table.userId, table.jobId),
    unique("applications_session_job_unique").on(table.sessionId, table.jobId),
  ]
);
