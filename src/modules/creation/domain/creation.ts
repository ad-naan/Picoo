export const CREATION_TYPES = ["agent", "workflow", "prompt", "tool", "article"] as const;
export type CreationType = (typeof CREATION_TYPES)[number];

export const CREATION_STATUSES = ["draft", "published", "under_review", "archived"] as const;
export type CreationStatus = (typeof CREATION_STATUSES)[number];

export type CreationStats = Readonly<{ likes: number; views: number; forks: number; favorites: number }>;

export interface CreationProps {
  id: string;
  type: CreationType;
  slug: string;
  status: CreationStatus;
  title: string;
  description: string;
  content: string;
  coverUrl?: string;
  authorId: string;
  tags: readonly string[];
  compatibleModels: readonly string[];
  stats: CreationStats;
  remixedFromId?: string;
  publishedAt?: Date;
  createdAt: Date;
}

export class Creation {
  private constructor(readonly props: CreationProps) {}

  static create(props: CreationProps) {
    if (!props.title.trim()) throw new Error("Creation title is required");
    if (!props.authorId) throw new Error("Creation author is required");
    return new Creation({ ...props, title: props.title.trim(), description: props.description.trim() });
  }

  get isPublished() {
    return this.props.status === "published";
  }

  // 校验发布合法性并返回发布态 props。归档作品不能直接发布，须先恢复为草稿。
  publish(publishedAt: Date): CreationProps {
    if (this.props.status === "published") throw new Error("ALREADY_PUBLISHED");
    if (this.props.status === "archived") throw new Error("ARCHIVED_NOT_PUBLISHABLE");
    return { ...this.props, status: "published", publishedAt };
  }

  archive(): CreationProps {
    if (this.props.status === "archived") throw new Error("ALREADY_ARCHIVED");
    return { ...this.props, status: "archived" };
  }
}
