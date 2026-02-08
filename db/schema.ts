import { 
  date, 
  integer, 
  pgTable, 
  time, 
  varchar, 
  timestamp, 
  boolean,
  uuid,
  pgEnum
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Optionnel : Enum pour le statut du ticket
export const ticketStatusEnum = pgEnum('ticket_status', ['valid', 'used', 'cancelled']);

// --- TABLE UTILISATEURS ---
export const usersTable = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  // L'email doit être unique pour servir d'identifiant
  email: varchar("email", { length: 255 }).notNull().unique(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  // Ajout de timestamps pour le suivi
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- TABLE ÉVÉNEMENTS ---
export const eventsTable = pgTable("events", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  // Le slug doit être unique pour les URLs
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description"), // Utile d'avoir une description
  date: date("date").notNull(),
  time: time("time").notNull(),
  place: varchar("place", { length: 255 }).notNull(),
  // Si null = illimité, sinon nombre max
  participantsLimit: integer("participants_limit"), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- TABLE TICKETS (Le lien manquant) ---
export const ticketsTable = pgTable("tickets", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  
  // Clés étrangères
  userId: integer("user_id").notNull().references(() => usersTable.id),
  eventId: integer("event_id").notNull().references(() => eventsTable.id),
  
  // Token unique pour le QR Code (ex: UUID v4)
  // C'est ce que contiendra le QR Code. Si on scanne, on cherche ce token.
  qrToken: uuid("qr_token").defaultRandom().notNull().unique(),
  
  // Statut du ticket
  status: ticketStatusEnum("status").default('valid').notNull(),
  
  // Date d'inscription
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Date à laquelle le ticket a été scanné/validé
  scannedAt: timestamp("scanned_at"),
});

// --- RELATIONS (Pour faciliter les requêtes avec Drizzle Query API) ---

export const usersRelations = relations(usersTable, ({ many }) => ({
  tickets: many(ticketsTable),
}));

export const eventsRelations = relations(eventsTable, ({ many }) => ({
  tickets: many(ticketsTable),
}));

export const ticketsRelations = relations(ticketsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [ticketsTable.userId],
    references: [usersTable.id],
  }),
  event: one(eventsTable, {
    fields: [ticketsTable.eventId],
    references: [eventsTable.id],
  }),
}));