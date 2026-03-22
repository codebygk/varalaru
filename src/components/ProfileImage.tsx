"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { Leader, Theme } from "@/types";
import { fetchWikiImage } from "@/lib/wiki";

interface ProfileImageProps {
  leader: Leader;
  size?: number;
  t: Theme;
}

export default function ProfileImage({ leader, size = 72, t }: ProfileImageProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (leader.wiki) {
      fetchWikiImage(leader.wiki).then((url) => {
        if (!cancelled) {
          if (url) setSrc(url);
          else setErr(true);
        }
      });
    } else {
      setErr(true);
    }
    return () => {
      cancelled = true;
    };
  }, [leader.wiki]);

  const initials = leader.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  if (src && !err) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          border: `2px solid ${t.accentBorder}`,
          flexShrink: 0,
          position: "relative",
        }}
      >
        <Image
          src={src}
          alt={leader.name}
          fill
          style={{ objectFit: "cover" }}
          onError={() => {
            setErr(true);
            setSrc(null);
          }}
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg,${t.accentSoft},${t.accentBorder})`,
        border: `2px solid ${t.accentBorder}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: size * 0.3,
          fontWeight: 700,
          color: t.accent,
        }}
      >
        {initials}
      </span>
    </div>
  );
}
