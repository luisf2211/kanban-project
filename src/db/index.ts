import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!, {
  ssl: "require",   // IMPORTANTE para Railway
  prepare: false,
});

export const db = drizzle(client);
