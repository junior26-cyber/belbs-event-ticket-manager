import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  firstName: varchar().notNull(),
  lastName: varchar().notNull(),
  email: varchar().notNull(),
  phoneNumber: varchar().notNull(),
});
