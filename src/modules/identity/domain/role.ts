export const USER_ROLES = ["member", "creator", "curator", "moderator", "admin", "super_admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ACCOUNT_STATUSES = ["pending", "active", "restricted", "suspended", "banned", "deleted"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const PERMISSIONS = [
  "creation:read", "creation:like", "creation:collect", "creation:publish", "creation:update:own", "creation:remix",
  "comment:create", "profile:update:own", "verification:submit", "verification:review", "discovery:curate",
  "moderation:review", "user:read", "user:manage", "role:grant", "platform:read", "platform:configure", "audit:read",
  "syndication:manage",
  "badge:read", "badge:manage", "badge:award",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  member: ["creation:read", "creation:like", "creation:collect", "creation:remix", "comment:create", "profile:update:own", "verification:submit", "badge:read"],
  creator: ["creation:read", "creation:like", "creation:collect", "creation:publish", "creation:update:own", "creation:remix", "comment:create", "profile:update:own", "verification:submit", "badge:read"],
  curator: ["creation:read", "creation:like", "creation:collect", "creation:remix", "comment:create", "profile:update:own", "discovery:curate", "badge:read"],
  moderator: ["creation:read", "creation:like", "creation:collect", "creation:remix", "comment:create", "profile:update:own", "moderation:review", "user:read", "badge:read"],
  admin: ["creation:read", "creation:like", "creation:collect", "creation:publish", "creation:update:own", "creation:remix", "comment:create", "profile:update:own", "verification:review", "discovery:curate", "moderation:review", "user:read", "user:manage", "platform:read", "audit:read", "syndication:manage", "badge:read", "badge:manage", "badge:award"],
  super_admin: [...PERMISSIONS],
};

export function permissionsFor(roles: readonly UserRole[]): ReadonlySet<Permission> {
  return new Set(roles.flatMap((role) => ROLE_PERMISSIONS[role]));
}

export function can(roles: readonly UserRole[], permission: Permission) {
  return permissionsFor(roles).has(permission);
}

export function canSignIn(status: AccountStatus) {
  return status === "active" || status === "pending";
}
