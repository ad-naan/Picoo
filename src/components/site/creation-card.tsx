"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookmarkSimpleIcon as Bookmark, HeartIcon as Heart, ChatCircleIcon as MessageCircle, SparkleIcon as Sparkles } from "@phosphor-icons/react";

const ART_KINDS = ["planet", "robot", "nodes", "portrait"] as const;
type ArtKind = (typeof ART_KINDS)[number];

const TYPE_LABEL: Record<string, string> = {
  agent: "Agent", workflow: "工作流", prompt: "Prompt", tool: "工具", article: "文章",
};

export interface CreationCardData {
  slug: string;
  title: string;
  description: string;
  type: string;
  authorHandle: string;
  likes: string;
  comments: number;
  coverUrl?: string;
}

// 无封面时按 slug 稳定地选一个手绘 CSS 主题，避免每次渲染跳动。
function artFor(slug: string): ArtKind {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return ART_KINDS[hash % ART_KINDS.length];
}

function Artwork({ kind }: { kind: ArtKind }) {
  return <div className={`artwork ${kind}`} aria-hidden="true">
    {kind === "robot" && <><div className="bot-head"><span>•ᴗ•</span></div><div className="bot-body" /></>}
    {kind === "planet" && <><div className="planet-ball" /><div className="planet-ring" /><Sparkles size={25} /></>}
    {kind === "nodes" && <><span className="node n1">AI</span><span className="node n2">API</span><span className="node n3">DB</span><i /><i /><i /></>}
    {kind === "portrait" && <><div className="portrait-hair" /><div className="portrait-face" /><span className="bubble" /></>}
  </div>;
}

export function CreationCard({ item, index }: { item: CreationCardData; index: number }) {
  return <motion.article className="creation-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 * index }}>
    <Link href={`/creation/${item.slug}`} className="cover">
      {item.coverUrl
        ? <img src={item.coverUrl} alt={item.title} className="cover-image" />
        : <Artwork kind={artFor(item.slug)} />}
      <span className="type-pill">{TYPE_LABEL[item.type] ?? item.type}</span>
    </Link>
    <button className="save" aria-label="收藏"><Bookmark size={17} /></button>
    <Link href={`/creation/${item.slug}`} className="card-copy"><h3>{item.title}</h3><p>{item.description}</p></Link>
    <div className="card-meta">
      <Link href={`/creator/${item.authorHandle}`} className="avatar tiny">{item.authorHandle[0]?.toUpperCase()}</Link>
      <Link href={`/creator/${item.authorHandle}`}>@{item.authorHandle}</Link>
      <span className="grow" /><Heart size={14} /> {item.likes}<MessageCircle size={14} /> {item.comments}
    </div>
  </motion.article>;
}
