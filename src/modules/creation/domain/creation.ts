export const CREATION_TYPES = ["agent", "workflow", "prompt", "tool", "article"] as const;
export type CreationType = (typeof CREATION_TYPES)[number];

export type CreationStats = Readonly<{ likes: number; views: number; forks: number; favorites: number }>;

export interface CreationProps {
  id: string;
  type: CreationType;
  title: string;
  description: string;
  authorId: string;
  tags: readonly string[];
  stats: CreationStats;
  remixedFromId?: string;
  createdAt: Date;
}

export class Creation {
  private constructor(readonly props: CreationProps) {}

  static create(props: CreationProps) {
    if (!props.title.trim()) throw new Error("Creation title is required");
    if (!props.authorId) throw new Error("Creation author is required");
    return new Creation({ ...props, title: props.title.trim(), description: props.description.trim() });
  }
}
