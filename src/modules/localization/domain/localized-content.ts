export type LocalizedContent = Readonly<{
  locale: string;
  title: string;
  description: string;
  content: string;
}>;

export type TranslationJobState = "queued" | "running" | "succeeded" | "failed";
