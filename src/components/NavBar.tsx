"use client";

import type { Theme, Lang } from "@/types";
import { useS } from "@/context/I18nContext";



interface NavBarProps {
  allSections: string[];
  lang: Lang;
  setLang: (l: Lang) => void;
  dark: boolean;
  setDark: (d: boolean) => void;
  sec: string;
  go: (id: string) => void;
  t: Theme;
}

export default function NavBar({ lang, setLang, dark, setDark, sec, go, t, allSections }: NavBarProps) {
  const s = useS();

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: t.nav,
        backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          height: 54,
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", justifyContent: "start", alignItems: "baseline", gap: 10, flexShrink: 0 }}>
          {/* Wordmark */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexShrink: 0 }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>
              {s.appName}
            </span>
          </div>

          {/* Section tabs */}
          <div
            style={{
              display: "flex",
              gap: 2,
              background: t.tag.bg,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              padding: 3,
            }}
          >
            {allSections.map((id) => (
              <button
                key={id}
                onClick={() => go(id)}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "5px 13px",
                  borderRadius: 6,
                  border: "none",
                  background: sec === id ? t.surface : "transparent",
                  color: sec === id ? t.text : t.textMuted,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  boxShadow: sec === id ? t.shadow : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {s.nav[id]}
              </button>
            ))}
          </div>
        </div>
        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {/* Language toggle */}
          <div
            style={{
              display: "flex",
              background: t.tag.bg,
              border: `1px solid ${t.border}`,
              borderRadius: 7,
              padding: 3,
              gap: 2,
            }}
          >
            {(["en", "ta"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  fontFamily: l === "ta" ? "'Noto Serif Tamil', serif" : "'DM Sans', sans-serif",
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "4px 10px",
                  borderRadius: 5,
                  border: "none",
                  background: lang === l ? t.surface : "transparent",
                  color: lang === l ? t.text : t.textMuted,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  boxShadow: lang === l ? t.shadow : "none",
                }}
              >
                {l === "en" ? "EN" : "தமிழ்"}
              </button>
            ))}
          </div>

          {/* Dark/light toggle */}
          <button
            onClick={() => setDark(!dark)}
            style={{
              background: t.toggle.bg,
              border: `1px solid ${t.toggle.border}`,
              borderRadius: 7,
              padding: "6px 10px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              fontWeight: 500,
              color: t.toggle.text,
              cursor: "pointer",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span style={{ fontSize: 13 }}>{dark ? "☀︎" : "☾"}</span>
            {dark ? s.light : s.dark}
          </button>
        </div>
      </div>
    </nav>
  );
}
