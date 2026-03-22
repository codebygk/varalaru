"use client";

import { useState } from "react";
import type { Theme, Lang } from "@/types";
import type { Leader, Work } from "@/lib/content";
import { useS, useLang } from "@/context/I18nContext";
import ProfileImage from "./ProfileImage";

interface Props {
  work: Work;
  t: Theme;
  lang: Lang;
  onClick: (work: Work) => void;
  onShare: (item: Work) => void;
  leaderById: (id: string) => Leader | null;
}

export default function WorkCard({ work, t, lang, onClick, onShare, leaderById }: Props) {
  const [hov, setHov] = useState(false);
  const s    = useS();
  const isTa = lang === "ta";
  const leader = leaderById(work.leader_id);

  const typeColor: Record<string, string> = { quote: t.accent,       poem: "#6b9e6b",              kural: "#7a6ba8" };
  const bgColor:   Record<string, string> = { quote: t.accentSoft,   poem: "rgba(107,158,107,0.08)", kural: "rgba(122,107,168,0.08)" };
  const bdColor:   Record<string, string> = { quote: t.accentBorder, poem: "rgba(107,158,107,0.22)", kural: "rgba(122,107,168,0.22)" };

  return (
    <div
      onClick={() => onClick(work)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? t.surfaceHover : t.surface,
        border: `1px solid ${hov ? t.accentBorder : t.border}`,
        borderRadius: 10,
        padding: "16px 16px 14px",
        cursor: "pointer",
        transition: "all 0.17s ease",
        boxShadow: hov ? t.shadow : "none",
        /* Fixed card height */
        height: 240,
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {/* Type badge row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, flexShrink: 0 }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: typeColor[work.type] ?? t.accent, background: bgColor[work.type] ?? t.accentSoft, border: `1px solid ${bdColor[work.type] ?? t.accentBorder}`, borderRadius: 4, padding: "2px 8px" }}>
          {s.workTypeLabel[work.type] ?? work.type}
        </span>
        {work.type === "kural" && work.kural_number != null && (
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: t.textMuted }}>{s.kuralNumber(work.kural_number)}</span>
        )}
        {work.type === "kural" && work.chapter_name && (
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>· {work.chapter_name}</span>
        )}
      </div>

      {/* Main text - clamped to 4 lines */}
      <div style={{ flex: 1, overflow: "hidden", marginBottom: 8 }}>
        <p style={{
          fontFamily: isTa ? "'Noto Serif Tamil', serif" : "'Fraunces', serif",
          fontSize: work.type === "kural" ? 15 : 14,
          color: t.text,
          lineHeight: 1.75,
          display: "-webkit-box",
          WebkitLineClamp: 4,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          margin: 0,
        }}>
          <span style={{ fontSize: 20, color: t.accent, lineHeight: 0.5, verticalAlign: -4, marginRight: 2 }}>&ldquo;</span>
          {work.text}
          <span style={{ fontSize: 20, color: t.accent, lineHeight: 0.5, verticalAlign: -4, marginLeft: 2 }}>&rdquo;</span>
        </p>
      </div>

      {/* Source - 1 line max */}
      <div style={{ flexShrink: 0, marginBottom: 8, minHeight: 16 }}>
        {work.source && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: t.textMuted, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {work.source}
          </p>
        )}
      </div>

      {/* Author footer */}
      <div style={{ display: "flex", alignItems: "center", paddingTop: 8, borderTop: `1px solid ${t.border}`, flexShrink: 0 }}>
        {leader ? (
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <ProfileImage leader={leader} size={22} t={t} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: t.accentText }}>
              {work.author}
            </span>
          </div>
        ) : (
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: t.textSub }}>{s.by}{work.author}</span>
        )}
      </div>
    </div>
  );
}