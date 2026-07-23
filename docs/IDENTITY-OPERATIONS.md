# Identity Operations

## Bootstrap

1. Configure PostgreSQL and Redis with separate environment variables.
2. Set a strong `AUTH_SECRET` and `PICOO_SUPER_ADMIN_EMAIL`.
3. Run `pnpm db:migrate`.
4. Register the bootstrap email and sign in once.
5. Confirm the `super_admin` role in `/admin/users`.

## Role rules

- Every registered account receives `member`.
- An approved creator verification receives `creator`.
- `admin` can review users and creator verifications.
- Only `super_admin` has `role:grant` and `platform:configure`.
- Account state and creator verification are independent from roles.

## Security defaults

- Passwords use Argon2id.
- Registration is limited by Redis per source IP.
- Admin changes and verification decisions write audit records.
- Database and Redis passwords are encoded from separate environment variables.
- Sensitive configuration files are ignored by Git.

## Current rollout boundaries

Email delivery and verification links, GitHub OAuth UI, TOTP MFA, device session revocation, and traditional forum-account migration remain scheduled work. The database schema includes Auth.js verification tokens and authenticators so these can be added without replacing the identity model.
