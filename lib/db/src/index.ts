import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Lazy initialization to support build-time scenarios where DATABASE_URL might not be available
let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

function initializeDb() {
  if (db && pool) {
    return { db, pool };
  }

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });

  return { db, pool };
}

export function getDb() {
  return initializeDb().db;
}

export function getPool() {
  return initializeDb().pool;
}

// For backwards compatibility, export lazy getters
export { schema };
export * from "./schema";
