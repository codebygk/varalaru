"use client";

import type { Theme, Lang } from "@/types";
import type { Leader, Work } from "@/lib/content";
import { useS } from "@/context/I18nContext";
import ProfileImage from "./ProfileImage";

function Divider({ t }: { t: Theme }) {
  return <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${t.accent}33,transparent)`, margin: "4px 0 20px" }} />;
}

function SLabel({ children, t }: { children: React.ReactNode; t: Theme }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: t.accentText, flexShrink: 0 }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${t.accent}28,transparent)` }} />
    </div>
  );
}

interface Props {
  work: Work | null;
  t: Theme;
  lang: Lang;
  onClose: () => void;
  onShare: (item: Work) => void;
  leaderById: (id: string) => Leader | null;
  onOpenLeader: (id: string) => void;
}

export default function WorkModal({ work, t, lang, onClose, onShare, leaderById, onOpenLeader }: Props) {
  const s    = useS();
  const isTa = lang === "ta";
  if (!work) return null;

  const leader = leaderById(work.leader_id);

  const typeColor: Record<string, string> = { quote: t.accent,       poem: "#6b9e6b",               kural: "#7a6ba8" };
  const bgColor:   Record<string, string> = { quote: t.accentSoft,   poem: "rgba(107,158,107,0.08)", kural: "rgba(122,107,168,0.08)" };
  const bdColor:   Record<string, string> = { quote: t.accentBorder, poem: "rgba(107,158,107,0.22)", kural: "rgba(122,107,168,0.22)" };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn 0.18s ease" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: t.modal, border: `1px solid ${t.border}`, borderTop: `2px solid ${typeColor[work.type] ?? t.accent}`, borderRadius: 12, width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto", boxShadow: t.shadowModal, animation: "slideUp 0.22s ease" }}>
        <div style={{ padding: "26px 26px 32px" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: typeColor[work.type] ?? t.accent, background: bgColor[work.type] ?? t.accentSoft, border: `1px solid ${bdColor[work.type] ?? t.accentBorder}`, borderRadius: 4, padding: "3px 10px" }}>
                {s.workTypeLabel[work.type] ?? work.type}
              </span>
              {work.type === "kural" && work.kural_number != null && (
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: t.textMuted }}>{s.kuralNumber(work.kural_number)}</span>
              )}
              {work.type === "kural" && work.chapter_name && (
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: t.textMuted }}>· {work.chapter_name}</span>
              )}
              {work.type === "kural" && work.book_name && (
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: t.textMuted }}>· {work.book_name}</span>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={() => onShare(work)} style={{ background: t.accentSoft, border: `1px solid ${t.accentBorder}`, borderRadius: 7, padding: "5px 11px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: t.accentText }}>
                ⬆ {s.shareCard}
              </button>
              <button onClick={onClose} style={{ background: t.tag.bg, border: `1px solid ${t.border}`, borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: t.textSub, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
          </div>

          <Divider t={t} />

          {/* Main text */}
          <div style={{ marginBottom: 20 }}>
            <SLabel t={t}>{work.type === "kural" ? "குறட்பா / Couplet" : work.type === "poem" ? "Verse" : "Quote"}</SLabel>
            <p style={{ fontFamily: isTa ? "'Noto Serif Tamil', serif" : "'Fraunces', serif", fontSize: 20, color: t.text, lineHeight: 1.85, margin: 0 }}>
              <span style={{ fontSize: 30, color: t.accent, lineHeight: 0.5, verticalAlign: -6, marginRight: 4 }}>&ldquo;</span>
              {work.text}
              <span style={{ fontSize: 30, color: t.accent, lineHeight: 0.5, verticalAlign: -6, marginLeft: 4 }}>&rdquo;</span>
            </p>
          </div>

          {/* Explanation */}
          {work.explanation && (
            <div style={{ marginBottom: 20 }}>
              <SLabel t={t}>{isTa ? "விளக்கம்" : "Explanation"}</SLabel>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: t.textSub, lineHeight: 1.8, margin: 0, borderLeft: `3px solid ${typeColor[work.type] ?? t.accent}33`, paddingLeft: 14 }}>
                {work.explanation}
              </p>
            </div>
          )}

          {/* Source */}
          {work.source && (
            <div style={{ marginBottom: 20 }}>
              <SLabel t={t}>{isTa ? "ஆதாரம்" : "Source"}</SLabel>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: t.textMuted, margin: 0 }}>{work.source}</p>
            </div>
          )}

          {/* Author / Leader */}
          {leader && (
            <div>
              <SLabel t={t}>{isTa ? "ஆசிரியர்" : "Author"}</SLabel>
              <button
                onClick={() => onOpenLeader(leader.id)}
                style={{ display: "flex", alignItems: "center", gap: 12, background: t.accentSoft, border: `1px solid ${t.accentBorder}`, borderRadius: 8, padding: "10px 14px", cursor: "pointer", width: "100%", textAlign: "left", transition: "all 0.15s" }}
              >
                <ProfileImage leader={leader} size={40} t={t} />
                <div>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 600, color: t.text, margin: 0 }}>
                    {isTa ? leader.tamil_name : leader.name}
                  </p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: t.textMuted, margin: "2px 0 0" }}>
                    {leader.category} · {leader.born}–{leader.died ?? s.present}
                  </p>
                </div>
                <span style={{ marginLeft: "auto", color: t.accent, fontSize: 16 }}>↗</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}