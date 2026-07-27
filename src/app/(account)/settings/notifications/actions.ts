"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/modules/identity/application/authorization";
import { getDatabase } from "@/infrastructure/database/client";
import { notifications } from "@/infrastructure/database/schema";

export async function markAllNotificationsRead() {
  const user = await requireUser();
  await getDatabase().update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.recipientId, user.id), isNull(notifications.readAt)));
  revalidatePath("/settings/notifications");
}
