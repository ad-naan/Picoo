import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { DrizzleIdentityRepository } from "@/infrastructure/identity/drizzle-identity-repository";
import { hashPassword } from "@/infrastructure/security/password";
import { consumeRateLimit } from "@/infrastructure/security/rate-limit";
import { writeAudit } from "@/infrastructure/audit/audit-service";

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(50),
  handle: z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9_-]{2,29}$/),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(10).max(128).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/),
});

export async function POST(request: Request) {
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const rateLimit = await consumeRateLimit(`auth:register:${ip}`, 5, 60 * 60);
  if (!rateLimit.allowed) return NextResponse.json({ error: "RATE_LIMITED", retryAfter: rateLimit.retryAfter }, { status: 429 });

  const body = await request.json().catch(() => null);
  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT", fields: parsed.error.flatten().fieldErrors }, { status: 400 });

  const repository = new DrizzleIdentityRepository();
  if (await repository.findByEmail(parsed.data.email)) return NextResponse.json({ error: "EMAIL_IN_USE" }, { status: 409 });

  try {
    const passwordHash = await hashPassword(parsed.data.password);
    const user = await repository.createWithPassword({ ...parsed.data, passwordHash });
    await writeAudit({ actorId: user.id, action: "account.register", resourceType: "user", resourceId: user.id });
    return NextResponse.json({ id: user.id, status: user.status }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "ACCOUNT_CREATE_FAILED" }, { status: 409 });
  }
}
