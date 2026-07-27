import type { CreationComment, SocialCounts, ViewerCreationState } from "../../domain/social";

export interface SocialRepository {
  getCreationState(userId: string | undefined, creationId: string): Promise<ViewerCreationState>;
  toggleLike(userId: string, creationId: string): Promise<{ active: boolean; counts: SocialCounts }>;
  toggleFavorite(userId: string, creationId: string): Promise<{ active: boolean; counts: SocialCounts }>;
  listComments(creationId: string, limit?: number): Promise<readonly CreationComment[]>;
  createComment(userId: string, creationId: string, content: string): Promise<CreationComment>;
  isFollowing(followerId: string | undefined, followingId: string): Promise<boolean>;
  toggleFollow(followerId: string, followingId: string): Promise<boolean>;
}
