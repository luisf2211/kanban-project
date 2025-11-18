import { pgTable, text, numeric, uuid, timestamp, date } from "drizzle-orm/pg-core";

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // Persona | Compañía
  value: numeric("value").notNull(),
  date_from: date("date_from"),
  date_to: date("date_to"),
  created_at: timestamp("created_at").defaultNow(),
});

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  file_type: text("file_type").notNull(),
  storage_url: text("storage_url").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull(),        // Backlog | En Progreso | En Revisión | Completado
  priority: text("priority").notNull(),    // Baja | Media | Alta | Urgente
  created_at: timestamp("created_at").defaultNow(),
});