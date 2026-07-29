import { config as loadEnvironment } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "drizzle-kit";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const loaded = loadEnvironment({ path: resolve(projectRoot, ".env"), quiet: true, override: true });
const environment = loaded.parsed ?? {};
let databaseUrl = environment.DATABASE_URL ?? process.env.DATABASE_URL;
if (!databaseUrl && environment.POSTGRES_USER && environment.POSTGRES_PASSWORD && environment.POSTGRES_DB) {
  const host = environment.POSTGRES_HOST ?? "127.0.0.1";
  const port = environment.POSTGRES_PORT ?? "5432";
  databaseUrl = `postgresql://${encodeURIComponent(environment.POSTGRES_USER)}:${encodeURIComponent(environment.POSTGRES_PASSWORD)}@${host}:${port}/${encodeURIComponent(environment.POSTGRES_DB)}`;
}
if (!databaseUrl) throw new Error("Configure DATABASE_URL or PostgreSQL variables in .env");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/infrastructure/database/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: databaseUrl },
  strict: true,
  verbose: true,
});
