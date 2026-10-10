import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/lib/schema";

function databaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local.");
  }
  return url;
}

const globalForDb = globalThis as unknown as {
  habitDb?: ReturnType<typeof createDb>;
};

function createDb() {
  return drizzle(neon(databaseUrl()), { schema });
}

export function getDb() {
  if (!globalForDb.habitDb) {
    globalForDb.habitDb = createDb();
  }
  return globalForDb.habitDb;
}
