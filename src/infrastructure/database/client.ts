import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let database: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDatabase() {
  if (!database) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
    const client = postgres(process.env.DATABASE_URL, { max: 10 });
    database = drizzle(client, { schema });
  }
  return database;
}
