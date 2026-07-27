"use client";

import { useState, useTransition } from "react";
import { BookmarkSimpleIcon, ChatCircleIcon, GitForkIcon, HeartIcon } from "@phosphor-icons/react";
import { addCreationComment, createCreationRemix, toggleCreationFavorite, toggleCreationLike } from "./actions";

export interface EngagementComment {
  id: string;
  content: string;
  authorName: string;
  authorHandle: string;
  createdAt: string;
}

export function CreationEngagement({ creationId, slug, authenticated, initialLiked, initialFavorited, initialLikes, initialFavorites, initialComments }: {
  creationId: string; slug: string; authenticated: boolean; initialLiked: boolean; initialFavorited: boolean;
  initialLikes: number; initialFavorites: number; initialComments: EngagementComment[];
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [likes, setLikes] = useState(initialLikes);
  const [favorites, setFavorites] = useState(initialFavorites);
  const [comments, setComments] = useState(initialComments);
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();

  function requireAuthentication() {
    if (authenticated) return true;
    window.location.href = `/sign-in?callbackUrl=${encodeURIComponent(`/creation/${slug}`)}`;
    return false;
  }

  function like() {
    if (!requireAuthentication()) return;
    startTransition(async () => { const result = await toggleCreationLike(creationId, slug); setLiked(result.active); setLikes(result.counts.likes); });
  }

  function favorite() {
    if (!requireAuthentication()) return;
    startTransition(async () => { const result = await toggleCreationFavorite(creationId, slug); setFavorited(result.active); setFavorites(result.counts.favorites); });
  }

  function submitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requireAuthentication() || !comment.trim()) return;
    startTransition(async () => { const created = await addCreationComment(creationId, slug, comment); setComments((items) => [created, ...items]); setComment(""); });
  }

  return <>
    <div className="engagement-actions">
      <button onClick={like} disabled={pending} aria-pressed={liked} className={liked ? "active like" : "like"}><HeartIcon size={19} weight={liked ? "fill" : "duotone"} /><span>{likes}</span><small>点赞</small></button>
      <button onClick={favorite} disabled={pending} aria-pressed={favorited} className={favorited ? "active favorite" : "favorite"}><BookmarkSimpleIcon size={19} weight={favorited ? "fill" : "duotone"} /><span>{favorites}</span><small>收藏</small></button>
      <form action={createCreationRemix.bind(null, creationId)}><button type="submit"><GitForkIcon size={19} weight="duotone" /><small>Remix 为草稿</small></button></form>
    </div>
    <section className="comment-section">
      <div className="comment-heading"><h2>讨论与反馈</h2><span><ChatCircleIcon size={17} /> {comments.length}</span></div>
      <form className="comment-form" onSubmit={submitComment}><textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1000} placeholder="分享你的使用体验、改进建议或 Remix 想法..." /><button disabled={pending || !comment.trim()}>发表评论</button></form>
      <div className="comment-list">{comments.map((item) => <article className="comment-item" key={item.id}><span className="avatar">{item.authorHandle[0]?.toUpperCase()}</span><div><header><b>{item.authorName}</b><small>@{item.authorHandle} · {new Date(item.createdAt).toLocaleDateString()}</small></header><p>{item.content}</p></div></article>)}{comments.length === 0 && <p className="comment-empty">还没有评论，成为第一个分享使用体验的人。</p>}</div>
    </section>
  </>;
}
