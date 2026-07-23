import { headers } from "next/headers";
import { getDatabase } from "@/infrastructure/database/client";
import { auditLogs } from "@/infrastructure/database/schema";

export async function writeAudit(input: {
  actorId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  outcome?: "success" | "denied" | "failed";
  metadata?: Record<string, unknown>;
}) {
  const requestHeaders = await headers();
  await getDatabase().insert(auditLogs).values({
    ...input,
    ipAddress: requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim(),
    userAgent: requestHeaders.get("user-agent"),
  });
}
