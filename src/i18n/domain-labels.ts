import type { MessageKey } from "./catalog";

export const ACCOUNT_STATUS_MESSAGES: Record<string, MessageKey> = {
  pending: "status.account.pending", active: "status.account.active", restricted: "status.account.restricted",
  suspended: "status.account.suspended", banned: "status.account.banned", deleted: "status.account.deleted",
};

export const ROLE_MESSAGES: Record<string, MessageKey> = {
  member: "role.member", creator: "role.creator", curator: "role.curator", moderator: "role.moderator",
  admin: "role.admin", super_admin: "role.superAdmin",
};

export const VERIFICATION_STATUS_MESSAGES: Record<string, MessageKey> = {
  draft: "status.verification.draft", submitted: "status.verification.submitted", under_review: "status.verification.underReview",
  approved: "status.verification.approved", rejected: "status.verification.rejected", revoked: "status.verification.revoked",
  expired: "status.verification.expired",
};

export const CREATION_STATUS_MESSAGES: Record<string, MessageKey> = {
  draft: "status.creation.draft", published: "status.creation.published", under_review: "status.creation.underReview",
  archived: "status.creation.archived",
};

export const CREATION_TYPE_MESSAGES: Record<string, MessageKey> = {
  agent: "creation.type.agent", workflow: "creation.type.workflow", prompt: "creation.type.prompt",
  tool: "creation.type.tool", article: "creation.type.article",
};

export const COLLECTION_VISIBILITY_MESSAGES: Record<string, MessageKey> = {
  private: "visibility.private", unlisted: "visibility.unlisted", public: "visibility.public",
};

export const FEED_STATUS_MESSAGES: Record<string, MessageKey> = {
  active: "status.feed.active", paused: "status.feed.paused", failing: "status.feed.failing",
};

export const DELIVERY_CHANNEL_MESSAGES: Record<string, MessageKey> = {
  rss: "channel.rss", webhook: "channel.webhook", newsletter: "channel.newsletter", social: "channel.social",
};

export const NOTIFICATION_MESSAGES: Record<string, MessageKey> = {
  "creation.liked": "notification.creationLiked", "creation.commented": "notification.creationCommented",
  "creator.followed": "notification.creatorFollowed",
};
