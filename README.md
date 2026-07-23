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

## Identity setup

Picoo uses Auth.js, Argon2id, PostgreSQL-backed identity data, Redis rate limiting, and multi-role RBAC.

Set these values in `.env.local` (and keep the file out of Git):

```env
AUTH_SECRET=<at-least-32-random-characters>
PICOO_SUPER_ADMIN_EMAIL=you@example.com

POSTGRES_USER=picoo_app
POSTGRES_PASSWORD=<password-may-contain-special-characters>
POSTGRES_DB=picoo
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432

REDIS_PASSWORD=<redis-password>
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=0
```

Separate connection variables are recommended because Picoo URL-encodes passwords automatically. This avoids broken URLs when passwords contain `#`, `@`, `:`, `/`, or spaces.

Generate and apply schema migrations:

```powershell
pnpm db:generate
pnpm db:migrate
```

Register with the email in `PICOO_SUPER_ADMIN_EMAIL`. Its first successful login receives the `super_admin` role. GitHub OAuth is enabled when both `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` are configured.

Identity routes:

- `/sign-in` and `/sign-up`
- `/settings/profile` and `/settings/security`
- `/studio` and `/studio/verification`
- `/admin`, `/admin/users`, `/admin/verifications`, `/admin/settings`

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
