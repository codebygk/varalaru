"use client";

import { useState } from "react";
import type { Leader, Theme } from "@/types";
import { useS, useLang } from "@/context/I18nContext";

interface RelatedChipProps {
  id: string;
  t: Theme;
  onOpen: (leader: Leader) => void;
  leaderById: (id: string) => Leader | null;
}

export default function RelatedChip({ id, t, onOpen, leaderById }: RelatedChipProps) {
  const [hov, setHov] = useState(false);
  const s    = useS();
  const lang = useLang();
  const exists = leaderById(id);
  // Display the name in the active language if the leader exists, otherwise show the raw name
  const displayName = exists
    ? (lang === "ta" ? exists.tamil_name : exists.name)
    : id;

  if (exists) {
    return (
      <button
        onClick={() => onOpen(exists)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{ fontFamily: lang === "ta" ? "'Noto Serif Tamil', serif" : "'DM Sans', sans-serif", fontSize: 12, padding: "5px 12px", background: hov ? t.accentBorder : t.accentSoft, border: `1px solid ${hov ? t.accent : t.accentBorder}`, borderRadius: 6, color: hov ? t.accent : t.accentText, cursor: "pointer", transition: "all 0.15s", display: "inline-flex", alignItems: "center", gap: 5 }}
      >
        {displayName}
        <span style={{ fontSize: 10, opacity: 0.7 }}>↗</span>
      </button>
    );
  }

  return (
    <span
      title="Not yet in the database"
      style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: "5px 12px", background: t.disabled.bg, border: `1px dashed ${t.disabled.border}`, borderRadius: 6, color: t.disabled.text, cursor: "not-allowed", display: "inline-flex", alignItems: "center", gap: 5 }}
    >
      {displayName}
      <span style={{ fontSize: 9, opacity: 0.6 }}>{s.notYet}</span>
    </span>
  );
}
