"use client";

import { useState } from "react";
import type { Theme } from "@/types";
import type { Leader } from "@/lib/content";
import { useS, useLang } from "@/context/I18nContext";
import ProfileImage from "./ProfileImage";

interface LeaderCardProps {
  leader: Leader;
  t: Theme;
  worksCount: number;
  onClick: (leader: Leader) => void;
  onShare: (item: Leader) => void;
  onViewWorks: (leaderId: string) => void;
}

export default function LeaderCard({ leader, t, onClick }: LeaderCardProps) {
  const [hov, setHov] = useState(false);
  const lang = useLang();
  const st   = useS();

  return (
    <div
      onClick={() => onClick(leader)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? t.surfaceHover : t.surface,
        border: `1px solid ${hov ? t.accentBorder : t.border}`,
        borderRadius: 10,
        padding: "18px 18px 16px",
        cursor: "pointer",
        transition: "all 0.17s ease",
        boxShadow: hov ? t.shadow : "none",
        position: "relative",
        overflow: "hidden",
        /* Fixed card height */
        height: 260,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Profile + name row */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10, flexShrink: 0 }}>
        <ProfileImage leader={leader} size={44} t={t} />
        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: t.text, lineHeight: 1.25, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {lang === "ta" ? leader.tamil_name : leader.name}
          </h3>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: t.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {leader.born}–{leader.died ?? st.present} · {leader.region}
          </p>
        </div>
      </div>

      {/* Category pill */}
      <div style={{ marginBottom: 8, flexShrink: 0 }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: t.pill.text, background: t.pill.bg, border: `1px solid ${t.pill.border}`, borderRadius: 4, padding: "2px 8px" }}>
          {leader.category}
        </span>
      </div>

      {/* Short bio - fixed 3 lines, overflow fades */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative", marginBottom: 10 }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: t.textSub,
          lineHeight: 1.65,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {leader.short_bio}
        </p>
      </div>

      {/* Tags row - single line, clipped */}
      <div style={{ display: "flex", flexWrap: "nowrap", gap: 4, overflow: "hidden", flexShrink: 0 }}>
        {leader.tags.slice(0, 4).map((tag) => (
          <span key={tag} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: t.tag.text, background: t.tag.bg, border: `1px solid ${t.tag.border}`, borderRadius: 4, padding: "2px 7px", whiteSpace: "nowrap" }}>{tag}</span>
        ))}
      </div>
    </div>
  );
}