"use client";

import type { Theme, Lang } from "@/types";
import type { Leader } from "@/lib/content";
import { useS } from "@/context/I18nContext";
import ProfileImage from "./ProfileImage";
import RelatedChip from "./RelatedChip";

function Divider({ t }: { t: Theme }) {
  return <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${t.accent}33, transparent)`, margin: "4px 0 22px" }} />;
}

function SLabel({ children, t }: { children: React.ReactNode; t: Theme }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: t.accentText, flexShrink: 0 }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${t.accent}28, transparent)` }} />
    </div>
  );
}

interface Props {
  leader: Leader | null;
  t: Theme;
  lang: Lang;
  onClose: () => void;
  onOpen: (leader: Leader) => void;
  onShare: (item: Leader) => void;
  onViewWorks: (leaderId: string) => void;
  leaderById: (id: string) => Leader | null;
  worksCount: number;
}

export default function LeaderModal({ leader, t, lang, onClose, onOpen, onShare, onViewWorks, leaderById, worksCount }: Props) {
  const s = useS();
  const isTa = lang === "ta";
  if (!leader) return null;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn 0.18s ease" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: t.modal, border: `1px solid ${t.border}`, borderTop: `2px solid ${t.accent}`, borderRadius: 12, width: "100%", maxWidth: 660, maxHeight: "90vh", overflowY: "auto", boxShadow: t.shadowModal, animation: "slideUp 0.22s ease" }}>
        <div style={{ padding: "28px 28px 36px" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <ProfileImage leader={leader} size={80} t={t} />
              <div>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: t.text, lineHeight: 1.2 }}>
                  {isTa ? leader.tamil_name : leader.name}
                </h2>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: t.textMuted, marginTop: 4 }}>
                  {leader.born}–{leader.died ?? s.present} · {leader.region}
                </p>
                <span style={{ display: "inline-block", marginTop: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: t.pill.text, background: t.pill.bg, border: `1px solid ${t.pill.border}`, borderRadius: 4, padding: "2px 8px" }}>
                  {leader.category}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={() => onShare(leader)} style={{ background: t.accentSoft, border: `1px solid ${t.accentBorder}`, borderRadius: 7, padding: "6px 12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: t.accentText }}>
                ⬆ {s.shareCard}
              </button>
              <button onClick={onClose} style={{ background: t.tag.bg, border: `1px solid ${t.border}`, borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: t.textSub, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
          </div>

          <Divider t={t} />

          {/* Biography */}
          <div style={{ marginBottom: 24 }}>
            <SLabel t={t}>{s.biography}</SLabel>
            {leader.full_bio.split("\n\n").map((p, i) => (
              <p key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: t.textSub, lineHeight: 1.85, marginBottom: 14 }}>{p}</p>
            ))}
          </div>

          {/* Highlights */}
          <div style={{ marginBottom: 24 }}>
            <SLabel t={t}>{s.highlights}</SLabel>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {leader.highlights.map((h, i) => (
                <li key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <span style={{ color: t.accent, flexShrink: 0, marginTop: 6, fontSize: 5 }}>◆</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: t.textSub, lineHeight: 1.75 }}>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/*Read more link - hyperlink to know more about this leader */}
          {leader.wiki && (
            <div style={{ marginBottom: 24 }}>
              <a target="_blank" href={`https://en.wikipedia.org/wiki/${encodeURIComponent(leader.wiki)}`} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: t.accent, background: t.accentSoft, border: `1px solid ${t.accentBorder}`, borderRadius: 8, padding: "8px 16px", cursor: "pointer", transition: "all 0.15s" }}>
                {s.readMoreButton} <span style={{ fontSize: 10, opacity: 0.7 }}>↗</span>
              </a>
            </div>
          )}

          {/* Works link - hyperlink to works section filtered by this leader */}
          {worksCount > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SLabel t={t}>{s.nav["works"] ?? "Works"}</SLabel>
              <button
                onClick={() => { onClose(); onViewWorks(leader.id); }}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: t.accent, background: t.accentSoft, border: `1px solid ${t.accentBorder}`, borderRadius: 8, padding: "8px 16px", cursor: "pointer", transition: "all 0.15s" }}>
                {s.viewWorks(worksCount)}
              </button>
            </div>
          )}

          {/* Related figures */}
          <div style={{ marginBottom: 24 }}>
            <SLabel t={t}>{s.relatedFigures}</SLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {leader.related_figures.map((id) => {
                const relatedLeader = leaderById(id);
                return relatedLeader ? (
                  <RelatedChip key={id} id={id} t={t} onOpen={onOpen} leaderById={leaderById} />
                ) : null;
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <SLabel t={t}>{s.tags}</SLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {leader.tags.map((tag) => (
                <span key={tag} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, padding: "3px 10px", background: t.tag.bg, border: `1px solid ${t.tag.border}`, borderRadius: 4, color: t.tag.text }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
