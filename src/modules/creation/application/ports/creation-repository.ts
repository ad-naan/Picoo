import type { Creation, CreationType } from "../../domain/creation";

export interface CreationRepository {
  findFeatured(limit: number): Promise<readonly Creation[]>;
  findTrending(type?: CreationType, limit?: number): Promise<readonly Creation[]>;
  findById(id: string): Promise<Creation | null>;
  save(creation: Creation): Promise<void>;
}
