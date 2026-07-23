import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import type { Provider } from "next-auth/providers";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { z } from "zod";
import { getDatabase } from "@/infrastructure/database/client";
import { accounts, authenticators, sessions, users, verificationTokens } from "@/infrastructure/database/schema";
import { DrizzleIdentityRepository } from "@/infrastructure/identity/drizzle-identity-repository";
import { verifyPassword } from "@/infrastructure/security/password";
import { canSignIn } from "@/modules/identity/domain/role";
import type { AccountStatus, UserRole } from "@/modules/identity/domain/role";
import { hasDatabaseConfiguration } from "@/shared/config/connections";

const credentialsSchema = z.object({ email: z.string().email(), password: z.string().min(8).max(128) });
const identityRepository = new DrizzleIdentityRepository();

const providers: Provider[] = [
  Credentials({
    credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
    async authorize(rawCredentials) {
      const parsed = credentialsSchema.safeParse(rawCredentials);
      if (!parsed.success) return null;
      const user = await identityRepository.findByEmail(parsed.data.email);
      if (!user?.passwordHash || !canSignIn(user.status)) return null;
      const passwordMatches = await verifyPassword(user.passwordHash, parsed.data.password);
      if (!passwordMatches) return null;
      const roles = [...user.roles];
      if (process.env.PICOO_SUPER_ADMIN_EMAIL?.toLowerCase() === user.email.toLowerCase() && !roles.includes("super_admin")) {
        await identityRepository.assignRole(user.id, "super_admin");
        roles.push("super_admin");
      }
      return { id: user.id, email: user.email, name: user.name, roles, status: user.status };
    },
  }),
];

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(GitHub({ clientId: process.env.AUTH_GITHUB_ID, clientSecret: process.env.AUTH_GITHUB_SECRET }));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: hasDatabaseConfiguration() ? DrizzleAdapter(getDatabase(), { usersTable: users, accountsTable: accounts, sessionsTable: sessions, verificationTokensTable: verificationTokens, authenticatorsTable: authenticators }) : undefined,
  providers,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: "/sign-in", error: "/sign-in" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
        token.roles = user.roles ?? ["member"];
        token.status = user.status ?? "active";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
        session.user.roles = (token.roles as UserRole[] | undefined) ?? ["member"];
        session.user.status = (token.status as AccountStatus | undefined) ?? "active";
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      await identityRepository.assignRole(user.id, "member");
      if (user.email && process.env.PICOO_SUPER_ADMIN_EMAIL?.toLowerCase() === user.email.toLowerCase()) await identityRepository.assignRole(user.id, "super_admin");
    },
  },
  trustHost: true,
});
