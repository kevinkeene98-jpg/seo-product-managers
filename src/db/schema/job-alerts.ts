import { pgTable, serial, integer, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";

export const jobAlerts = pgTable("job_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  email: text("email").notNull(),
  active: boolean("active").default(true),
  lastSentAt: timestamp("last_sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});
