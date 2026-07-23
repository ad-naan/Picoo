function validUrl(value: string | undefined, protocol: string) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (!parsed.protocol.startsWith(protocol)) return null;
    return value;
  } catch {
    return null;
  }
}

export function resolveDatabaseUrl() {
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DB;
  if (user && password && database) {
    const host = process.env.POSTGRES_HOST ?? "127.0.0.1";
    const port = process.env.POSTGRES_PORT ?? "5432";
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(database)}`;
  }
  const configured = validUrl(process.env.DATABASE_URL, "postgres");
  if (configured) return configured;
  throw new Error("Configure POSTGRES_USER, POSTGRES_PASSWORD and POSTGRES_DB, or provide a valid DATABASE_URL");
}

export function hasDatabaseConfiguration() {
  if (process.env.POSTGRES_USER && process.env.POSTGRES_PASSWORD && process.env.POSTGRES_DB) return true;
  return validUrl(process.env.DATABASE_URL, "postgres") !== null;
}

export function resolveRedisUrl() {
  const password = process.env.REDIS_PASSWORD;
  if (password) {
    const host = process.env.REDIS_HOST ?? "127.0.0.1";
    const port = process.env.REDIS_PORT ?? "6379";
    const database = process.env.REDIS_DB ?? "0";
    return `redis://:${encodeURIComponent(password)}@${host}:${port}/${database}`;
  }
  return validUrl(process.env.REDIS_URL, "redis") ?? "redis://127.0.0.1:6379/0";
}
