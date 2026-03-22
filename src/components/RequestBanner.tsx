"use client";

import type { Theme } from "@/types";
import { useS } from "@/context/I18nContext";

const GOOGLE_FORM = process.env.NEXT_PUBLIC_GOOGLE_FORM ?? "https://forms.gle/YOUR_FORM_ID_HERE";

interface RequestBannerProps {
  t: Theme;
}

export default function RequestBanner({ t }: RequestBannerProps) {
  const s = useS();

  return (
    <div
      style={{
        background: t.request.bg,
        border: `1px solid ${t.request.border}`,
        borderRadius: 10,
        padding: "18px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 28,
      }}
    >
      <div>
        <p style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: t.text, marginBottom: 4 }}>
          {s.requestLeader}
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: t.textSub }}>
          {s.requestDesc}
        </p>
      </div>
      <a
        href={GOOGLE_FORM}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          padding: "9px 18px",
          background: t.pa.bg,
          color: t.pa.text,
          borderRadius: 8,
          textDecoration: "none",
          flexShrink: 0,
        }}
      >
        {s.requestBtn}
      </a>
    </div>
  );
}
