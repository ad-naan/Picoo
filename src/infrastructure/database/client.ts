import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { resolveDatabaseUrl } from "@/shared/config/connections";

let database: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDatabase() {
  if (!database) {
    const client = postgres(resolveDatabaseUrl(), { max: 10 });
    database = drizzle(client, { schema });
  }
  return database;
}
