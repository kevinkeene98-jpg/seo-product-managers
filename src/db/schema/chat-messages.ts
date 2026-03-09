import {
  pgTable,
  pgEnum,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { applications } from "./applications";

export const chatRoleEnum = pgEnum("chat_role", ["user", "assistant"]);

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id")
    .references(() => applications.id)
    .notNull(),
  role: chatRoleEnum("role").notNull(),
  content: text("content").notNull(),
  activeTab: text("active_tab"),
  targetSection: text("target_section"),
  suggestionStatus: text("suggestion_status"),
  suggestedContent: jsonb("suggested_content"),
  createdAt: timestamp("created_at").defaultNow(),
});
