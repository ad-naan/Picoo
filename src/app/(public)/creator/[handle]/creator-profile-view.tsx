"use client";

import Link from "next/link";
import { SealCheckIcon as Verified } from "@phosphor-icons/react";
import { AppShell } from "@/components/site/app-shell";
import { CreationCard, type CreationCardData } from "@/components/site/creation-card";
import { useLocale } from "@/i18n/locale-provider";

export interface CreatorProfileData {
  handle: string;
  name: string;
  bio?: string;
  displayTitle?: string;
  specialties: string[];
  verified: boolean;
  worksCount: number;
}

export function CreatorProfileView({ profile, works }: { profile: CreatorProfileData; works: CreationCardData[] }) {
  const { t } = useLocale();
  return <AppShell>
    <section className="creator-hero" style={{ marginTop: 22 }}>
      <span className="avatar" style={{ width: 72, height: 72, fontSize: 28 }}>{profile.handle[0]?.toUpperCase()}</span>
      <div>
        <h1>{profile.name} {profile.verified && <Verified size={22} weight="fill" style={{ color: "#6750f5" }} />}</h1>
        <p className="creator-handle">@{profile.handle}{profile.displayTitle && ` · ${profile.displayTitle}`}</p>
        {profile.bio && <p className="creator-bio">{profile.bio}</p>}
        <div className="chip-row">
          {profile.verified && <span className="chip">{t("creator.verified")}</span>}
          {profile.specialties.map((s) => <span key={s} className="chip">{s}</span>)}
        </div>
      </div>
      <span className="grow" />
      <div className="creator-stat"><strong>{profile.worksCount}</strong><small>{t("creator.works")}</small></div>
    </section>

    <section className="section-heading" style={{ marginTop: 28 }}><div><h2>{t("creator.works")}</h2></div></section>
    {works.length > 0
      ? <section className="creation-grid">{works.map((item, i) => <CreationCard key={item.slug} item={item} index={i} />)}</section>
      : <section className="dashboard-card" style={{ textAlign: "center", padding: 40 }}><p>{t("creator.empty")}</p></section>}
    <div style={{ height: 40 }} />
    <Link href="/explore">← {t("explore.title")}</Link>
  </AppShell>;
}
