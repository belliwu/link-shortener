import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Links table schema for storing shortened URLs
 */
export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 191 }).notNull(),
  originalUrl: text("original_url").notNull(),
  shortCode: varchar("short_code", { length: 20 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

/**
 * Type for selecting a link from the database
 */
export type Link = typeof links.$inferSelect;

/**
 * Type for inserting a new link into the database
 */
export type NewLink = typeof links.$inferInsert;
