"use client";

import type { Theme } from "@/types";
import { useS } from "@/context/I18nContext";

interface PageHeaderProps {
  sec: string;
  t: Theme;
}

export default function PageHeader({ sec, t }: PageHeaderProps) {
  const s = useS();

  return (
    <header
      style={{
        maxWidth: 980,
        margin: "0 auto",
        padding: "44px 24px 32px",
        animation: "fadeUp 0.45s ease both",
      }}
    >
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: t.accent,
          marginBottom: 10,
          opacity: 0.75,
        }}
      >
        {s.tagline}
      </p>

      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
        <h1
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "clamp(28px, 5vw, 50px)",
            fontWeight: 700,
            color: t.text,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          {s.section[sec]?.title}
        </h1>
      </div>

      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: t.textSub,
          maxWidth: 500,
          lineHeight: 1.75,
        }}
      >
        {s.section[sec]?.desc}
      </p>
    </header>
  );
}
