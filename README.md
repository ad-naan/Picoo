# Picoo

Picoo is an AI creator community and reusable asset marketplace built with Next.js. The codebase uses domain boundaries for creations, identity/RBAC, and content syndication.

## Local setup

Copy `.env.example` to `.env.local` for Next.js, and to `.env` if using Docker Compose. Replace both passwords before starting services.

```powershell
docker compose up -d
pnpm install
pnpm dev
```

The app runs at `http://localhost:3000` by default.

## PostgreSQL

Docker Compose creates the configured database and owner automatically. For an existing PostgreSQL server, connect as an administrator and run:

```sql
CREATE USER picoo_app WITH PASSWORD 'replace-with-a-strong-password';
CREATE DATABASE picoo OWNER picoo_app ENCODING 'UTF8';
GRANT ALL PRIVILEGES ON DATABASE picoo TO picoo_app;
```

Then configure `DATABASE_URL=postgresql://picoo_app:<url-encoded-password>@127.0.0.1:5432/picoo`.

## Redis password

Use `REDIS_URL=redis://:<url-encoded-password>@127.0.0.1:6379/0`. Passwords containing `@`, `#`, `:`, `/`, or spaces must be URL encoded. Docker Compose reads `REDIS_PASSWORD` and enables `requirepass` automatically.

## Architecture

- `src/modules/creation`: Creation aggregate and repository contracts
- `src/modules/identity`: role and permission policy
- `src/modules/syndication`: inbound RSS aggregation and outbound publishing ports
- `src/infrastructure`: PostgreSQL/Drizzle and Redis adapters
- `src/app`: Next.js delivery layer

External RSS entries are modeled separately from native Creations. This preserves source attribution and allows deduplication by source plus external ID. Outbound delivery targets use ports so RSS output, webhooks, newsletters, and social channels can be added without coupling them to the core domain.
