import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { AppShell } from "@/components/site/app-shell";
import { CreationCard, type CreationCardData } from "@/components/site/creation-card";
import { getDatabase } from "@/infrastructure/database/client";
import { collectionItems, collections, creations, users } from "@/infrastructure/database/schema";
import { formatCount } from "@/shared/lib/format";

async function loadCollection(handle: string, slug: string, viewerId?: string) {
  const db = getDatabase();
  const [collection] = await db.select({ id: collections.id, ownerId: collections.ownerId, title: collections.title, description: collections.description, visibility: collections.visibility, ownerName: users.name, ownerHandle: users.handle }).from(collections).innerJoin(users, eq(users.id, collections.ownerId)).where(and(eq(users.handle, handle.toLowerCase()), eq(collections.slug, slug))).limit(1);
  if (!collection) return null;
  if (collection.visibility === "private" && collection.ownerId !== viewerId) return null;
  const rows = await db.select({ slug: creations.slug, title: creations.title, description: creations.description, type: creations.type, coverUrl: creations.coverUrl, authorHandle: users.handle, likes: creations.likes }).from(collectionItems).innerJoin(creations, eq(creations.id, collectionItems.creationId)).innerJoin(users, eq(users.id, creations.authorId)).where(and(eq(collectionItems.collectionId, collection.id), eq(creations.status, "published"))).orderBy(desc(collectionItems.createdAt));
  const cards: CreationCardData[] = rows.map((row) => ({ slug: row.slug, title: row.title, description: row.description, type: row.type, coverUrl: row.coverUrl ?? undefined, authorHandle: row.authorHandle ?? "creator", likes: formatCount(row.likes), comments: 0 }));
  return { ...collection, cards };
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string; slug: string }> }): Promise<Metadata> {
  const { handle, slug } = await params;
  const loaded = await loadCollection(handle, slug);
  if (!loaded || loaded.visibility === "private") return { title: "收藏夹 · Picoo", robots: { index: false, follow: false } };
  return { title: `${loaded.title} · Picoo`, description: loaded.description ?? `${loaded.ownerName ?? handle} 整理的 AI 创作收藏夹`, robots: loaded.visibility === "public" ? undefined : { index: false, follow: true } };
}

export default async function PublicCollectionPage({ params }: { params: Promise<{ handle: string; slug: string }> }) {
  const { handle, slug } = await params;
  const session = await auth();
  const loaded = await loadCollection(handle, slug, session?.user?.id);
  if (!loaded) notFound();
  return <AppShell><header className="collection-hero"><span>COLLECTION</span><h1>{loaded.title}</h1><p>{loaded.description ?? "一组值得收藏和复用的 AI 创作。"}</p><small>由 @{loaded.ownerHandle ?? handle} 整理 · {loaded.cards.length} 个作品</small></header>{loaded.cards.length > 0 ? <section className="creation-grid">{loaded.cards.map((card, index) => <CreationCard key={card.slug} item={card} index={index} />)}</section> : <section className="dashboard-card"><p>这个收藏夹还没有公开作品。</p></section>}</AppShell>;
}
