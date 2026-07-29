import type { LocalizedContent } from "../../domain/localized-content";

export interface TranslationRequest {
  source: LocalizedContent;
  targetLocale: string;
  glossary?: Readonly<Record<string, string>>;
}

export interface TranslationGateway {
  translate(request: TranslationRequest): Promise<LocalizedContent>;
}

export interface TranslationJobRepository {
  enqueue(input: { entityType: "creation" | "syndicated_item"; entityId: string; sourceLocale: string; targetLocale: string; requestedBy: string }): Promise<string>;
}
