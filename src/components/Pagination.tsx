"use client";

import { useState } from "react";
import type { Theme } from "@/types";

interface PagBtnProps {
  label: string | number;
  disabled: boolean;
  onClick: () => void;
  t: Theme;
  active: boolean;
}

function PagBtn({ label, disabled, onClick, t, active }: PagBtnProps) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => setHov(false)}
      disabled={disabled}
      style={{
        minWidth: 34,
        height: 34,
        borderRadius: 7,
        border: active ? "none" : `1px solid ${disabled ? "transparent" : t.pi.border}`,
        background: active
          ? t.pa.bg
          : disabled
          ? "transparent"
          : hov
          ? t.accentSoft
          : t.pi.bg,
        color: active
          ? t.pa.text
          : disabled
          ? t.textMuted
          : hov
          ? t.accentText
          : t.pi.text,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.35 : 1,
        transition: "all 0.15s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 6px",
      }}
    >
      {label}
    </button>
  );
}

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
  t: Theme;
}

export default function Pagination({ page, total, pageSize, onChange, t }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 36 }}>
      <PagBtn label="←" disabled={page === 1} onClick={() => onChange(page - 1)} t={t} active={false} />
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <PagBtn key={p} label={p} disabled={false} onClick={() => onChange(p)} t={t} active={p === page} />
      ))}
      <PagBtn label="→" disabled={page === totalPages} onClick={() => onChange(page + 1)} t={t} active={false} />
    </div>
  );
}
