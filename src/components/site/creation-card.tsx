"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookmarkSimpleIcon,
  ChatCircleIcon,
  FlowArrowIcon,
  HeartIcon,
  MagicWandIcon,
  RobotIcon,
  SparkleIcon,
  WrenchIcon,
} from "@phosphor-icons/react";
import type { MessageKey } from "@/i18n/catalog";
import { useLocale } from "@/i18n/locale-provider";

const ART_KINDS = ["agent", "workflow", "prompt", "tool"] as const;
type ArtKind = (typeof ART_KINDS)[number];

const TYPE_LABEL: Record<string, MessageKey> = {
  agent: "creation.type.agent",
  workflow: "creation.type.workflow",
  prompt: "creation.type.prompt",
  tool: "creation.type.tool",
  article: "creation.type.article",
};

const ART_ICON: Record<ArtKind, React.ElementType> = {
  agent: RobotIcon,
  workflow: FlowArrowIcon,
  prompt: MagicWandIcon,
  tool: WrenchIcon,
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
  href?: string;
  authorHref?: string;
}

function artFor(slug: string, type: string): ArtKind {
  if (ART_KINDS.includes(type as ArtKind)) return type as ArtKind;
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return ART_KINDS[hash % ART_KINDS.length];
}

function Artwork({ kind, title }: { kind: ArtKind; title: string }) {
  const Icon = ART_ICON[kind];
  return (
    <div className={`creation-art creation-art-${kind}`} aria-hidden="true">
      <div className="creation-art-grid" />
      <span className="creation-art-orbit" />
      <div className="creation-art-icon"><Icon weight="duotone" /></div>
      <div className="creation-art-copy"><small>Picoo / {kind}</small><strong>{title}</strong></div>
      <SparkleIcon className="creation-art-spark" weight="fill" />
    </div>
  );
}

export function CreationCard({ item, index }: { item: CreationCardData; index: number }) {
  const { t } = useLocale();
  const creationHref = item.href ?? `/creation/${item.slug}`;
  const authorHref = item.authorHref ?? `/creator/${item.authorHandle}`;
  let typeLabel = item.type;
  const typeMessage = TYPE_LABEL[item.type];
  if (typeMessage) typeLabel = t(typeMessage);
  const kind = artFor(item.slug, item.type);
  const animationDelay = Math.min(index, 5) * 0.045;
  let visual: React.ReactNode = <Artwork kind={kind} title={item.title} />;
  if (item.coverUrl) visual = <img src={item.coverUrl} alt={item.title} className="cover-image" />;
  return (
    <motion.article className="creation-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: animationDelay }}>
      <Link href={creationHref} className="cover">{visual}<span className="type-pill">{typeLabel}</span></Link>
      <button className="save" aria-label={t("action.collect")}><BookmarkSimpleIcon size={17} weight="duotone" /></button>
      <Link href={creationHref} className="card-copy"><h3>{item.title}</h3><p>{item.description}</p></Link>
      <div className="card-meta">
        <Link href={authorHref} className="avatar tiny">{item.authorHandle[0]?.toUpperCase()}</Link>
        <Link href={authorHref} className="card-author">@{item.authorHandle}</Link>
        <span className="grow" />
        <span><HeartIcon weight="duotone" />{item.likes}</span>
        <span><ChatCircleIcon weight="duotone" />{item.comments}</span>
      </div>
    </motion.article>
  );
}
