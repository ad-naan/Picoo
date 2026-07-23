export const USER_ROLES = ["guest", "member", "creator", "curator", "moderator", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_PERMISSIONS = {
  guest: ["creation:read"],
  member: ["creation:read", "creation:like", "creation:collect", "comment:create"],
  creator: ["creation:read", "creation:like", "creation:collect", "comment:create", "creation:publish", "creation:remix"],
  curator: ["creation:read", "creation:feature", "collection:publish"],
  moderator: ["creation:read", "creation:moderate", "comment:moderate"],
  admin: ["*"],
} as const satisfies Record<UserRole, readonly string[]>;

export function can(role: UserRole, permission: string) {
  const permissions = ROLE_PERMISSIONS[role] as readonly string[];
  return permissions.includes("*") || permissions.includes(permission);
}
