import type { DefaultSession } from "next-auth";
import type { UserRole, AccountStatus } from "@/modules/identity/domain/role";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { id: string; roles: UserRole[]; status: AccountStatus };
  }
  interface User { roles?: UserRole[]; status?: AccountStatus }
}

declare module "next-auth/jwt" {
  interface JWT { userId?: string; roles?: UserRole[]; status?: AccountStatus }
}
