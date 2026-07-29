"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/modules/identity/application/authorization";
import { getDatabase } from "@/infrastructure/database/client";
import { deliveryTargets, feedSubscriptions } from "@/infrastructure/database/schema";
import { writeAudit } from "@/infrastructure/audit/audit-service";
import { assertPublicFeedUrl } from "@/infrastructure/syndication/public-feed-url";
import { DrizzleSyndicationRepository } from "@/infrastructure/syndication/drizzle-syndication-repository";
import { XmlFeedGateway } from "@/infrastructure/syndication/xml-feed-gateway";
import { pollFeed } from "@/modules/syndication/application/poll-feed";

const idSchema = z.string().uuid();
const feedSchema = z.object({ title: z.string().trim().min(1).max(120), url: z.string().url().max(2000) });
const targetSchema = z.object({
  name: z.string().trim().min(1).max(80),
  channel: z.enum(["webhook", "newsletter", "social"]),
  endpoint: z.string().url().max(2000),
});

function refresh() {
  revalidatePath("/admin/syndication");
}

export async function createFeedSubscription(formData: FormData) {
  const administrator = await requirePermission("syndication:manage");
  const input = feedSchema.parse(Object.fromEntries(formData.entries()));
  const url = await assertPublicFeedUrl(input.url);
  const [subscription] = await getDatabase().insert(feedSubscriptions).values({ title: input.title, url: url.href, createdBy: administrator.id }).returning({ id: feedSubscriptions.id });
  await writeAudit({ actorId: administrator.id, action: "syndication.feed.create", resourceType: "feed_subscription", resourceId: subscription.id, metadata: { host: url.hostname } });
  refresh();
}

export async function pollFeedSubscription(formData: FormData) {
  const administrator = await requirePermission("syndication:manage");
  const id = idSchema.parse(formData.get("id"));
  const result = await pollFeed(id, new DrizzleSyndicationRepository(), new XmlFeedGateway());
  await writeAudit({ actorId: administrator.id, action: "syndication.feed.poll", resourceType: "feed_subscription", resourceId: id, metadata: result });
  refresh();
}

export async function toggleFeedSubscription(formData: FormData) {
  const administrator = await requirePermission("syndication:manage");
  const id = idSchema.parse(formData.get("id"));
  const current = z.enum(["active", "paused", "failing"]).parse(formData.get("status"));
  const nextByStatus = { active: "paused", paused: "active", failing: "active" } as const;
  const status = nextByStatus[current];
  await getDatabase().update(feedSubscriptions).set({ status, updatedAt: new Date() }).where(eq(feedSubscriptions.id, id));
  await writeAudit({ actorId: administrator.id, action: "syndication.feed.status", resourceType: "feed_subscription", resourceId: id, metadata: { status } });
  refresh();
}

export async function deleteFeedSubscription(formData: FormData) {
  const administrator = await requirePermission("syndication:manage");
  const id = idSchema.parse(formData.get("id"));
  await getDatabase().delete(feedSubscriptions).where(eq(feedSubscriptions.id, id));
  await writeAudit({ actorId: administrator.id, action: "syndication.feed.delete", resourceType: "feed_subscription", resourceId: id });
  refresh();
}

export async function createDeliveryTarget(formData: FormData) {
  const administrator = await requirePermission("syndication:manage");
  const input = targetSchema.parse(Object.fromEntries(formData.entries()));
  const endpoint = await assertPublicFeedUrl(input.endpoint);
  const [target] = await getDatabase().insert(deliveryTargets).values({ name: input.name, channel: input.channel, endpoint: endpoint.href, createdBy: administrator.id }).returning({ id: deliveryTargets.id });
  await writeAudit({ actorId: administrator.id, action: "syndication.target.create", resourceType: "delivery_target", resourceId: target.id, metadata: { channel: input.channel, host: endpoint.hostname } });
  refresh();
}

export async function toggleDeliveryTarget(formData: FormData) {
  const administrator = await requirePermission("syndication:manage");
  const id = idSchema.parse(formData.get("id"));
  const enabled = z.enum(["true", "false"]).parse(formData.get("enabled"));
  const nextEnabled = enabled === "false";
  await getDatabase().update(deliveryTargets).set({ enabled: nextEnabled, updatedAt: new Date() }).where(eq(deliveryTargets.id, id));
  await writeAudit({ actorId: administrator.id, action: "syndication.target.status", resourceType: "delivery_target", resourceId: id, metadata: { enabled: nextEnabled } });
  refresh();
}
