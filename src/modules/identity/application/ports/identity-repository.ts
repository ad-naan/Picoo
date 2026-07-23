import type { AccountStatus, UserRole } from "../../domain/role";

export interface IdentityUser {
  id: string;
  email: string;
  name: string | null;
  handle: string | null;
  passwordHash: string | null;
  status: AccountStatus;
  roles: readonly UserRole[];
}

export interface IdentityRepository {
  findByEmail(email: string): Promise<IdentityUser | null>;
  findById(id: string): Promise<IdentityUser | null>;
  createWithPassword(input: { email: string; name: string; handle: string; passwordHash: string }): Promise<IdentityUser>;
  assignRole(userId: string, role: UserRole, grantedBy?: string): Promise<void>;
}
