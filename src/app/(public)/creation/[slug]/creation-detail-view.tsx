"use client";

import Link from "next/link";
import { EyeIcon as Eye, GitForkIcon as Fork } from "@phosphor-icons/react";
import { AppShell } from "@/components/site/app-shell";
import { useLocale } from "@/i18n/locale-provider";
import { CreationEngagement, type EngagementComment } from "./creation-engagement";

const TYPE_LABEL: Record<string, string> = {
  agent: "Agent", workflow: "工作流", prompt: "Prompt", tool: "工具", article: "文章",
};

export interface CreationDetailData {
  id: string;
  slug: string;
  type: string;
  title: string;
  description: string;
  content: string;
  coverUrl?: string;
  tags: string[];
  compatibleModels: string[];
  authorHandle: string;
  authorName: string;
  likes: number;
  views: number;
  forks: number;
  favorites: number;
  remixFromSlug?: string;
  remixFromTitle?: string;
  publishedAt?: string;
  authenticated: boolean;
  liked: boolean;
  favorited: boolean;
  comments: EngagementComment[];
}

export function CreationDetailView({ data }: { data: CreationDetailData }) {
  const { t } = useLocale();
  return <AppShell activeHref="/explore">
    <article className="detail" style={{ marginTop: 22 }}>
      <header className="detail-head">
        <span className="type-pill" style={{ position: "static" }}>{TYPE_LABEL[data.type] ?? data.type}</span>
        <h1>{data.title}</h1>
        <p className="detail-desc">{data.description}</p>
        <div className="detail-meta">
          <Link href={`/creator/${data.authorHandle}`} className="detail-author">
            <span className="avatar">{data.authorHandle[0]?.toUpperCase()}</span>
            <b>{data.authorName}</b><small>@{data.authorHandle}</small>
          </Link>
          <span className="grow" />
          <span><Eye size={15} /> {data.views}</span>
          <span><Fork size={15} /> {data.forks}</span>
        </div>
      </header>

      <CreationEngagement creationId={data.id} slug={data.slug} authenticated={data.authenticated} initialLiked={data.liked} initialFavorited={data.favorited} initialLikes={data.likes} initialFavorites={data.favorites} initialComments={data.comments} />

      {data.coverUrl && <img src={data.coverUrl} alt={data.title} className="detail-cover" />}

      {data.remixFromSlug && <p className="detail-remix">{t("creation.remixFrom")}：<Link href={`/creation/${data.remixFromSlug}`}>{data.remixFromTitle}</Link></p>}

      {data.content && <section className="detail-content">{data.content.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}</section>}

      {data.compatibleModels.length > 0 && <section className="detail-block">
        <h3>{t("creation.compatibleModels")}</h3>
        <div className="chip-row">{data.compatibleModels.map((model) => <span key={model} className="chip">{model}</span>)}</div>
      </section>}

      {data.tags.length > 0 && <section className="detail-block">
        <div className="chip-row">{data.tags.map((tag) => <Link key={tag} href={`/explore?tag=${encodeURIComponent(tag)}`} className="chip"># {tag}</Link>)}</div>
      </section>}
    </article>
  </AppShell>;
}
