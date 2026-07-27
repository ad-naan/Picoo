export interface ViewerCreationState {
  liked: boolean;
  favorited: boolean;
}

export interface CreationComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorImage?: string;
  createdAt: Date;
}

export interface SocialCounts {
  likes: number;
  favorites: number;
  comments: number;
}
