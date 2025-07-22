import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const files = pgTable('files', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  key: text().notNull().unique(),
  contentType: text().notNull(),
  createdAt: timestamp().defaultNow().notNull()
})