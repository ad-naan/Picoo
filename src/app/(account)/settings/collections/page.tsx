import Link from "next/link";
import { and, count, desc, eq } from "drizzle-orm";
import { requireUser } from "@/modules/identity/application/authorization";
import { getDatabase } from "@/infrastructure/database/client";
import { collectionItems, collections, creations, favorites, users } from "@/infrastructure/database/schema";
import { addToCollection, createCollection, deleteCollection } from "./actions";

export default async function CollectionsPage() {
  const user = await requireUser();
  const db = getDatabase();
  const [collectionRows, favoriteRows, ownerRows] = await Promise.all([
    db.select({ id: collections.id, title: collections.title, slug: collections.slug, description: collections.description, visibility: collections.visibility, itemCount: count(collectionItems.creationId) }).from(collections).leftJoin(collectionItems, eq(collectionItems.collectionId, collections.id)).where(eq(collections.ownerId, user.id)).groupBy(collections.id).orderBy(desc(collections.updatedAt)),
    db.select({ id: creations.id, slug: creations.slug, title: creations.title, type: creations.type, createdAt: favorites.createdAt }).from(favorites).innerJoin(creations, eq(creations.id, favorites.creationId)).where(and(eq(favorites.userId, user.id), eq(creations.status, "published"))).orderBy(desc(favorites.createdAt)).limit(50),
    db.select({ handle: users.handle }).from(users).where(eq(users.id, user.id)).limit(1),
  ]);
  const ownerHandle = ownerRows[0]?.handle;
  return <><header className="dashboard-header"><div><h1>我的收藏夹</h1><p>把收藏的 Agent、Workflow 和 Prompt 整理成可复用的资产库。</p></div></header><div className="dashboard-row"><section className="dashboard-card"><h2>新建收藏夹</h2><form className="dashboard-form" action={createCollection}><label>名称<input name="title" placeholder="例如：我的 AI 工具箱" required /></label><label>说明<textarea name="description" maxLength={240} /></label><label>可见性<select name="visibility" defaultValue="private"><option value="private">仅自己</option><option value="unlisted">通过链接访问</option><option value="public">公开</option></select></label><button>创建收藏夹</button></form></section><section className="dashboard-card"><h2>收藏夹</h2><div className="setting-list">{collectionRows.map((collection) => <div className="setting-item" key={collection.id}><div><b>{ownerHandle && collection.visibility !== "private" ? <Link href={`/collection/${ownerHandle}/${collection.slug}`}>{collection.title}</Link> : collection.title}</b><small>{collection.itemCount} 个作品 · {collection.visibility}</small></div><form action={deleteCollection}><input type="hidden" name="collectionId" value={collection.id} /><button>删除</button></form></div>)}{collectionRows.length === 0 && <p>还没有收藏夹。</p>}</div></section></div><section className="dashboard-card" style={{ marginTop: 16 }}><h2>最近收藏</h2><table className="dashboard-table"><thead><tr><th>作品</th><th>类型</th><th>整理到收藏夹</th></tr></thead><tbody>{favoriteRows.map((favorite) => <tr key={favorite.id}><td><Link href={`/creation/${favorite.slug}`}>{favorite.title}</Link></td><td><span className="role-badge">{favorite.type}</span></td><td><form className="review-actions" action={addToCollection}><input type="hidden" name="creationId" value={favorite.id} /><select name="collectionId" required><option value="">选择收藏夹</option>{collectionRows.map((collection) => <option key={collection.id} value={collection.id}>{collection.title}</option>)}</select><button>加入</button></form></td></tr>)}</tbody></table>{favoriteRows.length === 0 && <p>你还没有收藏任何作品。</p>}</section></>;
}
