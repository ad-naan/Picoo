import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getDatabase } from "@/infrastructure/database/client";
import { creations, users } from "@/infrastructure/database/schema";
import { DrizzleCreationRepository } from "@/infrastructure/creation/drizzle-creation-repository";
import { CreationDetailView, type CreationDetailData } from "./creation-detail-view";

const repository = new DrizzleCreationRepository();

async function loadDetail(slug: string): Promise<CreationDetailData | null> {
  const db = getDatabase();
  const [row] = await db.select({
    id: creations.id, slug: creations.slug, type: creations.type, status: creations.status,
    title: creations.title, description: creations.description, content: creations.content,
    coverUrl: creations.coverUrl, tags: creations.tags, compatibleModels: creations.compatibleModels,
    likes: creations.likes, views: creations.views, forks: creations.forks, favorites: creations.favorites,
    remixedFromId: creations.remixedFromId, publishedAt: creations.publishedAt,
    authorHandle: users.handle, authorName: users.name,
  }).from(creations).innerJoin(users, eq(users.id, creations.authorId))
    .where(and(eq(creations.slug, slug), eq(creations.status, "published"))).limit(1);
  if (!row) return null;

  let remixFromSlug: string | undefined;
  let remixFromTitle: string | undefined;
  if (row.remixedFromId) {
    const [source] = await db.select({ slug: creations.slug, title: creations.title })
      .from(creations).where(eq(creations.id, row.remixedFromId)).limit(1);
    remixFromSlug = source?.slug;
    remixFromTitle = source?.title;
  }

  return {
    slug: row.slug, type: row.type, title: row.title, description: row.description, content: row.content,
    coverUrl: row.coverUrl ?? undefined, tags: row.tags, compatibleModels: row.compatibleModels,
    authorHandle: row.authorHandle ?? row.authorName ?? "creator", authorName: row.authorName ?? "Creator",
    likes: row.likes, views: row.views, forks: row.forks, favorites: row.favorites,
    remixFromSlug, remixFromTitle, publishedAt: row.publishedAt?.toISOString(),
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const detail = await loadDetail(slug);
  if (!detail) return { title: "未找到 · Picoo" };
  return {
    title: `${detail.title} · Picoo`,
    description: detail.description,
    openGraph: { title: detail.title, description: detail.description, images: detail.coverUrl ? [detail.coverUrl] : undefined },
  };
}

export default async function CreationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const detail = await loadDetail(slug);
  if (!detail) notFound();
  const found = await repository.findBySlug(slug);
  if (found) await repository.incrementView(found.props.id);
  return <CreationDetailView data={detail} />;
}
