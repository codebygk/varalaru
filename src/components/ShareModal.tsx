"use client";

import { useState, useEffect, useRef } from "react";
import type { Theme } from "@/types";
import type { Leader, Work } from "@/lib/content";
import { useS } from "@/context/I18nContext";
import { fetchWikiImage } from "@/lib/wiki";
import Spinner from "./Spinner";

type ShareType = "leader" | "work";
type ShareItem = Leader | Work;

function isLeader(item: ShareItem): item is Leader {
  return "full_bio" in item;
}

interface Props {
  item: ShareItem;
  type: ShareType;
  t: Theme;
  onClose: () => void;
  leaderById: (id: string) => Leader | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 99
): number {
  const words = text.split(" ");
  let line = "";
  let drawn = 0;
  for (const word of words) {
    if (drawn >= maxLines) break;
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
      drawn++;
    } else {
      line = test;
    }
  }
  if (line && drawn < maxLines) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Draws the kolam-inspired dot cluster at a corner
function drawKolam(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  color: string,
  flip = false
) {
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  const sign = flip ? -1 : 1;
  const dots: [number, number, number][] = [
    [0, 0, 5], [sign * 22, 0, 3.5], [sign * 44, 0, 2.5],
    [0, sign * 22, 3.5], [0, sign * 44, 2.5],
  ];
  dots.forEach(([dx, dy, r]) => {
    ctx.beginPath();
    ctx.arc(cx + dx, cy + dy, r, 0, Math.PI * 2);
    ctx.fill();
  });

  // small concentric rings at the inner dot
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.12;
  [9, 16].forEach((r) => {
    ctx.beginPath();
    ctx.arc(cx + sign * 22, cy + sign * 22, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // diagonal dashes
  ctx.globalAlpha = 0.1;
  ctx.setLineDash([2, 4]);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx + sign * 22, cy + sign * 22);
  ctx.lineTo(cx + sign * 44, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + sign * 22, cy + sign * 22);
  ctx.lineTo(cx, cy + sign * 44);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.restore();
}

// ─── Leader card (square 960×960) ────────────────────────────────────────────

function drawLeaderCard(
  ctx: CanvasRenderingContext2D,
  W: number,
  leader: Leader,
  img: HTMLImageElement | null,
  isDark: boolean,
  onDone: () => void
) {
  const GOLD   = isDark ? "#c9963a" : "#a07828";
  const GOLD_A = (a: number) => isDark
    ? `rgba(201,150,58,${a})` : `rgba(160,120,40,${a})`;
  const INK    = isDark ? "#0d0b09" : "#ffffff";
  const CREAM  = isDark ? "#f0e6cc" : "#18140f";
  const MUTED  = isDark ? "rgba(240,230,204,0.55)" : "rgba(24,20,15,0.55)";
  const FAINT  = isDark ? "rgba(240,230,204,0.28)" : "rgba(24,20,15,0.28)";
  const PAD    = 56;

  // Background
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, W);

  // Card border
  ctx.strokeStyle = GOLD_A(0.28);
  ctx.lineWidth = 1.5;
  drawRoundRect(ctx, 1, 1, W - 2, W - 2, 18);
  ctx.stroke();

  // Kolam corners
  drawKolam(ctx, PAD - 20, PAD - 20, GOLD, false);
  drawKolam(ctx, W - PAD + 20, W - PAD + 20, GOLD, true);

  // ── Portrait (top-right) ──────────────────────────────────────────────────
  const IMG_SIZE = 200;
  const IMG_X    = W - PAD - IMG_SIZE;
  const IMG_Y    = PAD + 20;
  const IMG_CX   = IMG_X + IMG_SIZE / 2;
  const IMG_CY   = IMG_Y + IMG_SIZE / 2;

  // Portrait rounded-rect clip
  ctx.save();
  drawRoundRect(ctx, IMG_X, IMG_Y, IMG_SIZE, IMG_SIZE, 14);
  ctx.clip();

  if (img) {
    // Fill bg first in case image has transparency
    ctx.fillStyle = isDark ? "#1a1510" : "#f0ead8";
    ctx.fillRect(IMG_X, IMG_Y, IMG_SIZE, IMG_SIZE);
    ctx.drawImage(img, IMG_X, IMG_Y, IMG_SIZE, IMG_SIZE);
  } else {
    // Initials fallback
    ctx.fillStyle = isDark ? "#1a1510" : "#f5efe0";
    ctx.fillRect(IMG_X, IMG_Y, IMG_SIZE, IMG_SIZE);

    // Mini kolam inside fallback
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 0.8;
    [20, 35, 50, 65].forEach((r) => {
      ctx.beginPath();
      ctx.arc(IMG_CX, IMG_CY, r, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();

    const initials = leader.name.split(" ").filter(Boolean).slice(0, 2)
      .map((w) => w[0]).join("").toUpperCase();
    ctx.font = `700 ${IMG_SIZE * 0.34}px Georgia, serif`;
    ctx.fillStyle = GOLD;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials, IMG_CX, IMG_CY);
    ctx.textBaseline = "alphabetic";
  }
  ctx.restore();

  // Portrait border ring
  ctx.strokeStyle = GOLD_A(0.45);
  ctx.lineWidth = 2;
  drawRoundRect(ctx, IMG_X, IMG_Y, IMG_SIZE, IMG_SIZE, 14);
  ctx.stroke();

  // ── Left column text ──────────────────────────────────────────────────────
  const TEXT_W = W - PAD * 2 - IMG_SIZE - 32;

  // Category pill
  const CAT_TEXT = leader.category.toUpperCase();
  ctx.font = "500 11px 'DM Sans', sans-serif";
  ctx.fillStyle = GOLD;
  ctx.textAlign = "left";
  const pillW = ctx.measureText(CAT_TEXT).width + 24;
  const pillH = 24;
  const pillX = PAD;
  const pillY = PAD + 8;
  ctx.strokeStyle = GOLD_A(0.3);
  ctx.lineWidth = 1;
  ctx.fillStyle = GOLD_A(0.14);
  drawRoundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = GOLD;
  ctx.fillText(CAT_TEXT, pillX + 12, pillY + 16);

  // Tamil name
  ctx.font = "400 18px 'Noto Serif Tamil', 'Nirmala UI', serif";
  ctx.fillStyle = GOLD_A(0.82);
  ctx.fillText(leader.tamil_name, PAD, pillY + pillH + 28);

  // English name
  ctx.font = "700 38px Georgia, serif";
  ctx.fillStyle = CREAM;
  let nameY = wrapText(ctx, leader.name, PAD, pillY + pillH + 68, TEXT_W, 46, 2);

  // Rule
  nameY += 12;
  ctx.strokeStyle = GOLD_A(0.25);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, nameY);
  ctx.lineTo(PAD + TEXT_W, nameY);
  ctx.stroke();
  nameY += 20;

  // Dates · Region
  ctx.font = "400 13px 'DM Sans', sans-serif";
  ctx.fillStyle = FAINT;
  const dateStr = `${leader.born} – ${leader.died ?? "present"}  ·  ${leader.region}`;
  ctx.fillText(dateStr, PAD, nameY + 4);
  nameY += 28;

  // Short bio
  ctx.font = "300 15px 'DM Sans', sans-serif";
  ctx.fillStyle = MUTED;
  nameY = wrapText(ctx, leader.short_bio, PAD, nameY + 8, TEXT_W, 26, 4);

  // ── Tags row (bottom area) ────────────────────────────────────────────────
  const TAG_Y  = W - PAD - 84;
  const TAG_H  = 22;
  let tagX     = PAD;
  ctx.font     = "500 10px 'DM Sans', sans-serif";

  leader.tags.slice(0, 5).forEach((tag) => {
    const tw = ctx.measureText(tag).width + 18;
    if (tagX + tw > W - PAD) return;
    ctx.strokeStyle = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
    ctx.lineWidth = 1;
    ctx.fillStyle  = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
    drawRoundRect(ctx, tagX, TAG_Y, tw, TAG_H, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = isDark ? "rgba(240,230,204,0.4)" : "rgba(24,20,15,0.4)";
    ctx.fillText(tag, tagX + 9, TAG_Y + 15);
    tagX += tw + 6;
  });

  // ── Bottom bar ────────────────────────────────────────────────────────────
  const BAR_Y = W - PAD - 44;
  ctx.strokeStyle = GOLD_A(0.2);
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, BAR_Y);
  ctx.lineTo(W - PAD, BAR_Y);
  ctx.stroke();

  // Dot separator
  ctx.beginPath();
  ctx.arc(W / 2, BAR_Y + 22, 3, 0, Math.PI * 2);
  ctx.fillStyle = GOLD_A(0.5);
  ctx.fill();

  // Dates left
  ctx.font      = "500 13px 'DM Sans', sans-serif";
  ctx.fillStyle = isDark ? "rgba(240,230,204,0.6)" : "rgba(24,20,15,0.6)";
  ctx.textAlign = "left";
  ctx.fillText(`${leader.born} – ${leader.died ?? "present"}`, PAD, BAR_Y + 26);

  // Region right
  ctx.textAlign = "right";
  ctx.fillStyle = FAINT;
  ctx.fillText(leader.region, W - PAD, BAR_Y + 26);

  // Brand watermark
  ctx.font      = "400 11px 'DM Sans', sans-serif";
  ctx.fillStyle = GOLD_A(0.22);
  ctx.textAlign = "center";
  ctx.fillText("Tamil Legacy", W / 2, W - 18);

  onDone();
}

// ─── Work card (square 960×960) ───────────────────────────────────────────────

function drawWorkCard(
  ctx: CanvasRenderingContext2D,
  W: number,
  work: Work,
  leader: Leader | null,
  isDark: boolean,
  onDone: () => void
) {
  const GOLD  = isDark ? "#c9963a" : "#a07828";
  const GOLD_A = (a: number) => isDark
    ? `rgba(201,150,58,${a})` : `rgba(160,120,40,${a})`;
  const INK   = isDark ? "#0d0b09" : "#ffffff";
  const CREAM = isDark ? "#f0e6cc" : "#18140f";
  const MUTED = isDark ? "rgba(240,230,204,0.55)" : "rgba(24,20,15,0.55)";
  const FAINT = isDark ? "rgba(240,230,204,0.28)" : "rgba(24,20,15,0.28)";
  const PAD   = 60;
  const TW    = W - PAD * 2;

  const TYPE_COLORS: Record<string, string> = {
    kural: isDark ? "#9b8fcb" : "#5e4ea0",
    poem:  isDark ? "#6aab8a" : "#2e7a52",
    quote: GOLD,
  };
  const TYPE_COLOR = TYPE_COLORS[work.type] ?? GOLD;

  // Background
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, W);

  // Border
  ctx.strokeStyle = GOLD_A(0.25);
  ctx.lineWidth = 1.5;
  drawRoundRect(ctx, 1, 1, W - 2, W - 2, 18);
  ctx.stroke();

  // Kolam corners
  drawKolam(ctx, PAD - 20, PAD - 20, GOLD, false);
  drawKolam(ctx, W - PAD + 20, W - PAD + 20, GOLD, true);

  // ── Type badge ────────────────────────────────────────────────────────────
  ctx.font = "500 11px 'DM Sans', sans-serif";
  ctx.fillStyle = TYPE_COLOR;
  ctx.textAlign = "left";
  const typeLabel = work.type === "kural"
    ? `THIRUKKURAL${work.kural_number ? ` · ${work.kural_number}` : ""}${work.chapter_name ? ` · ${work.chapter_name.toUpperCase()}` : ""}`
    : work.type.toUpperCase();
  const pillW = ctx.measureText(typeLabel).width + 24;
  const pillH = 24;
  const pillY = PAD + 8;
  const tc = TYPE_COLOR;
  ctx.fillStyle = tc + "22";
  ctx.strokeStyle = tc + "55";
  ctx.lineWidth = 1;
  drawRoundRect(ctx, PAD, pillY, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = TYPE_COLOR;
  ctx.fillText(typeLabel, PAD + 12, pillY + 16);

  // ── Big decorative open-quote ─────────────────────────────────────────────
  ctx.font = `700 120px Georgia, serif`;
  ctx.fillStyle = GOLD_A(0.07);
  ctx.textAlign = "left";
  ctx.fillText("\u201C", PAD - 8, pillY + 100);

  // ── Main text ─────────────────────────────────────────────────────────────
  const isKural = work.type === "kural";
  ctx.font = isKural
    ? "400 24px 'Noto Serif Tamil', 'Nirmala UI', serif"
    : "600 26px Georgia, serif";
  ctx.fillStyle = CREAM;
  ctx.textAlign = "left";
  let curY = pillY + pillH + 60;
  curY = wrapText(ctx, work.text, PAD, curY, TW, isKural ? 40 : 38, 5);

  // Rule after text
  curY += 16;
  ctx.strokeStyle = GOLD_A(0.2);
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, curY);
  ctx.lineTo(PAD + TW, curY);
  ctx.stroke();
  curY += 22;

  // ── Explanation (kural) ───────────────────────────────────────────────────
  if (work.explanation) {
    ctx.font      = "300 15px 'DM Sans', sans-serif";
    ctx.fillStyle = MUTED;
    curY = wrapText(ctx, work.explanation, PAD, curY, TW, 24, 3);
    curY += 8;
  }

  // ── Author / source ───────────────────────────────────────────────────────
  ctx.font      = "600 14px 'DM Sans', sans-serif";
  ctx.fillStyle = GOLD;
  ctx.textAlign = "left";
  const authorLine = `- ${work.author}${leader ? `  ·  ${leader.name}` : ""}`;
  ctx.fillText(authorLine, PAD, curY + 4);

  if (work.source) {
    curY += 26;
    ctx.font      = "400 12px 'DM Sans', sans-serif";
    ctx.fillStyle = FAINT;
    ctx.fillText(work.source, PAD, curY);
  }

  // ── Bottom bar ─────────────────────────────────────────────────────────────
  const BAR_Y = W - PAD - 44;
  ctx.strokeStyle = GOLD_A(0.18);
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, BAR_Y);
  ctx.lineTo(W - PAD, BAR_Y);
  ctx.stroke();

  if (leader) {
    ctx.font      = "400 12px 'DM Sans', sans-serif";
    ctx.fillStyle = FAINT;
    ctx.textAlign = "left";
    ctx.fillText(leader.region ?? "", PAD, BAR_Y + 24);
  }

  ctx.font      = "400 11px 'DM Sans', sans-serif";
  ctx.fillStyle = GOLD_A(0.22);
  ctx.textAlign = "center";
  ctx.fillText("Tamil Legacy", W / 2, W - 18);

  onDone();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShareModal({ item, type, t, onClose, leaderById }: Props) {
  const s         = useS();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied,  setCopied]  = useState(false);
  const [imgSrc,  setImgSrc]  = useState<string | null>(null);

  const isDark = t.bg === "#100f0d" || t.bg.startsWith("#0");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Square 750×750
    const W = 750;
    canvas.width  = W;
    canvas.height = W;

    setImgSrc(null); // reset preview while re-drawing

    const flush = () => setImgSrc(canvas.toDataURL("image/png"));

    if (type === "leader" && isLeader(item)) {
      const leader = item;

      fetchWikiImage(leader.wiki).then((url) => {
        if (!url) {
          drawLeaderCard(ctx, W, leader, null, isDark, flush);
          return;
        }
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload  = () => drawLeaderCard(ctx, W, leader, img, isDark, flush);
        img.onerror = () => drawLeaderCard(ctx, W, leader, null, isDark, flush);
        img.src = url;
      });

    } else {
      const work   = item as Work;
      const leader = leaderById(work.leader_id);
      drawWorkCard(ctx, W, work, leader, isDark, flush);
    }
  }, [item, type, isDark]);

  function download() {
    if (!imgSrc) return;
    const a = document.createElement("a");
    a.href     = imgSrc;
    a.download = `tamil-${type}-${item.id}.png`;
    a.click();
  }

  function copyLink() {
    const url = `${window.location.origin}${window.location.pathname}?${type}=${item.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, animation: "fadeIn 0.18s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: t.modal, border: `1px solid ${t.border}`,
          borderRadius: 14, padding: "24px 24px 20px",
          width: "100%", maxWidth: 560,
          boxShadow: t.shadowModal, animation: "slideUp 0.22s ease",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: t.textMuted, margin: 0 }}>
            {type === "leader" ? s.leaderCard : s.workCard}
          </p>
          <button
            onClick={onClose}
            style={{ background: t.tag.bg, border: `1px solid ${t.border}`, borderRadius: "50%", width: 28, height: 28, cursor: "pointer", color: t.textSub, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
          >×</button>
        </div>

        {/* Hidden canvas - square, rendered at 960×960 */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Preview - square aspect ratio */}
        {imgSrc
          ? (
            <img
              src={imgSrc}
              alt="share card"
              style={{
                width: "100%", aspectRatio: "1/1",
                borderRadius: 10, marginBottom: 14,
                display: "block",
                boxShadow: isDark ? "0 4px 28px rgba(0,0,0,0.6)" : "0 4px 20px rgba(0,0,0,0.1)",
              }}
            />
          ) : (
            <div style={{ width: "100%", aspectRatio: "1/1", background: t.accentSoft, borderRadius: 10, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Spinner color={t.accent} />
            </div>
          )
        }

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={download}
            disabled={!imgSrc}
            style={{ flex: 1, padding: "9px 0", background: t.pa.bg, color: t.pa.text, border: "none", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: imgSrc ? "pointer" : "not-allowed", opacity: imgSrc ? 1 : 0.4, transition: "opacity 0.15s" }}
          >
            ↓ {s.download}
          </button>
          <button
            onClick={copyLink}
            style={{ flex: 1, padding: "9px 0", background: "transparent", color: copied ? t.accent : t.textSub, border: `1px solid ${copied ? t.accentBorder : t.border}`, borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
          >
            {copied ? `✓ ${s.copied}` : `↗ ${s.copyLink}`}
          </button>
        </div>
      </div>
    </div>
  );
}