import { defineConfig } from "drizzle-kit";
import { resolveDatabaseUrl } from "./src/shared/config/connections";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/infrastructure/database/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: resolveDatabaseUrl() },
  strict: true,
  verbose: true,
});
