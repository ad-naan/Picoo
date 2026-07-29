import { getDatabase } from "@/infrastructure/database/client";
import { translationJobs } from "@/infrastructure/database/schema";
import type { TranslationJobRepository } from "@/modules/localization/application/ports/translation-gateway";

export class DrizzleTranslationJobRepository implements TranslationJobRepository {
  async enqueue(input: { entityType: "creation" | "syndicated_item"; entityId: string; sourceLocale: string; targetLocale: string; requestedBy: string }) {
    const [job] = await getDatabase().insert(translationJobs).values(input).returning({ id: translationJobs.id });
    return job.id;
  }
}
