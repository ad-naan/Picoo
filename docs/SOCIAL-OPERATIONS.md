# Social And Library Operations

## Interaction model

- Likes use `creation_likes`; `creations.likes` is a transactionally maintained ranking counter.
- Favorites use `favorites`; `creations.favorites` is maintained in the same transaction.
- Comments are attached to published Creations and retain moderation status.
- Follows connect a member to a creator and create a recipient notification.
- Notifications are immutable events with a separate `read_at` state.

Server Actions reject interaction with non-published Creations, even when invoked outside the UI.

## Collections

Favorites are the quick-save layer. Collections provide organization:

- `private`: owner only.
- `unlisted`: accessible by exact URL and excluded from indexing.
- `public`: shareable and indexable.

Public routes use `/collection/[handle]/[slug]`. Collection membership and deletion always verify ownership on the server.

## Remix

Remix creates a new draft with `remixed_from_id` pointing to the published source. Source content, compatibility and tags are copied as a starting point. The source fork counter is incremented in the same transaction. Only Creator/Admin roles can create the editable Remix draft; other members are sent to creator verification.

## Notifications

Current event types:

- `creation.liked`
- `creation.commented`
- `creator.followed`

Self-actions do not create notifications. Notification records preserve actor, entity and display metadata for later email/webhook delivery.

## Migration

`drizzle/0002_stormy_zemo.sql` adds social, collection and notification tables. Apply it with `pnpm db:migrate` after setting valid PostgreSQL variables.
