import type { Creation, CreationStatus, CreationType } from "../../domain/creation";

export interface CreateCreationInput {
  authorId: string;
  type: CreationType;
  title: string;
  description: string;
  content: string;
  coverUrl?: string;
  tags: readonly string[];
  compatibleModels: readonly string[];
  remixedFromId?: string;
}

export type UpdateCreationPatch = Partial<Pick<
  CreateCreationInput,
  "type" | "title" | "description" | "content" | "coverUrl" | "tags" | "compatibleModels"
>>;

export interface ListPublishedOptions {
  type?: CreationType;
  tag?: string;
  sort?: "trending" | "latest";
  limit: number;
  offset: number;
}

export interface CreationRepository {
  findFeatured(limit: number): Promise<readonly Creation[]>;
  findTrending(type?: CreationType, limit?: number): Promise<readonly Creation[]>;
  findById(id: string): Promise<Creation | null>;
  findBySlug(slug: string): Promise<Creation | null>;
  findByAuthor(authorId: string, opts?: { status?: CreationStatus }): Promise<readonly Creation[]>;
  listPublished(opts: ListPublishedOptions): Promise<readonly Creation[]>;
  create(input: CreateCreationInput): Promise<Creation>;
  update(id: string, authorId: string, patch: UpdateCreationPatch): Promise<Creation>;
  setStatus(id: string, authorId: string, status: CreationStatus): Promise<Creation>;
  remove(id: string, authorId: string): Promise<void>;
  incrementView(id: string): Promise<void>;
  save(creation: Creation): Promise<void>;
}
