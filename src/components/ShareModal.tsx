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

function drawLeaderCard(
  ctx: CanvasRenderingContext2D,
  W: number,
  leader: Leader,
  img: HTMLImageElement | null,
  isDark: boolean,
  onDone: () => void
) {
  const GOLD   = "#c9963a";
  const GOLD_A = (a: number) => `rgba(201,150,58,${a})`;
 
  // ── Layout constants (all derived from W) ────────────────────────────────
  const PAD = Math.round(W * 0.058);   // 56px @ 960  — left/right/top margin
  const TW  = W - PAD * 2;            // 848px — usable text width
 
  // TOP ZONE
  const TOP_PILL_Y  = PAD;                              // 56  — pill top edge
  const TOP_PILL_H  = Math.round(W * 0.029);            // 28  — pill height
  const TOP_TAG_Y   = TOP_PILL_Y + TOP_PILL_H + Math.round(W * 0.018); // 100 — tags top
  const TOP_TAG_H   = Math.round(W * 0.025);            // 24  — tag chip height
 
  // BOTTOM ZONE — built upward from the card bottom
  const BOT_EDGE    = W - PAD;                          // 904 — bottom margin line
  const WM_Y        = BOT_EDGE - Math.round(W * 0.005); // 899 — watermark baseline
  const RULE_FULL_Y = WM_Y - Math.round(W * 0.026);    // 874 — full-width gold rule
  const META_Y      = RULE_FULL_Y - Math.round(W * 0.022); // 853 — date·region baseline
 
  const BIO_LINES   = 3;
  const BIO_LINE_H  = Math.round(W * 0.033);            // 32  — bio line-height
  const BIO_GAP     = Math.round(W * 0.018);            // 17  — gap between meta and bio bottom
  const BIO_BOT     = META_Y - BIO_GAP;                 // 836 — bottom of bio block
  const BIO_TOP     = BIO_BOT - BIO_LINES * BIO_LINE_H; // 740 — top of bio block
 
  const DIVIDER_Y   = BIO_TOP - Math.round(W * 0.022); // 719 — short accent rule
  const DIVIDER_GAP = Math.round(W * 0.022);            // 21  — gap between rule and name baseline
  // Name font
  const NAME_FONT   = "'Noto Serif Tamil', 'Nirmala UI', serif";
  const NAME_SIZE   = Math.round(W * 0.058);
  const NAME_LINE_H = Math.round(NAME_SIZE * 1.15);     // tight leading
 
  // ── 1. Base fill ──────────────────────────────────────────────────────────
  ctx.fillStyle = "#0d0b09";
  ctx.fillRect(0, 0, W, W);
 
  // ── 2. Portrait — cover-fill, top-anchored ───────────────────────────────
  if (img) {
    const ar = img.naturalWidth / img.naturalHeight;
    let dW = W, dH = W, dX = 0, dY = 0;
    if (ar > 1) { dW = W * ar; dX = (W - dW) / 2; }
    else        { dH = W / ar; }
    ctx.drawImage(img, dX, dY, dW, dH);
  } else {
    const bg = ctx.createLinearGradient(0, 0, W, W);
    bg.addColorStop(0, "#1c1408"); bg.addColorStop(1, "#0d0b09");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, W);
    ctx.strokeStyle = GOLD_A(0.04); ctx.lineWidth = 0.5;
    for (let i = 0; i < W; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, W); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke();
    }
  }
 
  // ── 3. Gradient veil — transparent top, opaque bottom ────────────────────
  const veil = ctx.createLinearGradient(0, 0, 0, W);
  veil.addColorStop(0,    "rgba(0,0,0,0.06)");
  veil.addColorStop(0.38, "rgba(0,0,0,0.03)");
  veil.addColorStop(0.54, "rgba(0,0,0,0.26)");
  veil.addColorStop(0.70, "rgba(0,0,0,0.72)");
  veil.addColorStop(1,    "rgba(0,0,0,0.96)");
  ctx.fillStyle = veil; ctx.fillRect(0, 0, W, W);
 
  // ── 4. Card border ────────────────────────────────────────────────────────
  ctx.strokeStyle = GOLD_A(0.28); ctx.lineWidth = 1.5;
  drawRoundRect(ctx, 2, 2, W - 4, W - 4, 16); ctx.stroke();
 
  // ── 5. Category pill (top-left) ──────────────────────────────────────────
  const catFontSz = Math.round(W * 0.013);   // 12
  ctx.font = `600 ${catFontSz}px 'DM Sans', sans-serif`;
  const CAT    = leader.category.toUpperCase();
  const pillPH = Math.round(TOP_PILL_H * 0.44);          // horizontal padding
  const pillW  = ctx.measureText(CAT).width + pillPH * 2;
  ctx.fillStyle   = GOLD_A(0.15); ctx.strokeStyle = GOLD_A(0.40); ctx.lineWidth = 1;
  drawRoundRect(ctx, PAD, TOP_PILL_Y, pillW, TOP_PILL_H, TOP_PILL_H / 2);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = GOLD; ctx.textAlign = "left";
  ctx.fillText(CAT, PAD + pillPH, TOP_PILL_Y + TOP_PILL_H * 0.66);
 
  // ── 6. Tags row (top-left, below pill) ───────────────────────────────────
  const tagFontSz = Math.round(W * 0.012);   // 11
  ctx.font = `500 ${tagFontSz}px 'DM Sans', sans-serif`;
  let tagX = PAD;
  const TAG_PH = 10;  // tag horizontal padding
  leader.tags.slice(0, 6).forEach((tag) => {
    const tw = ctx.measureText(tag).width + TAG_PH * 2;
    if (tagX + tw > W - PAD) return;
    ctx.fillStyle   = "rgba(255,255,255,0.05)";
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth   = 0.75;
    drawRoundRect(ctx, tagX, TOP_TAG_Y, tw, TOP_TAG_H, 4);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.34)"; ctx.textAlign = "left";
    ctx.fillText(tag, tagX + TAG_PH, TOP_TAG_Y + TOP_TAG_H * 0.72);
    tagX += tw + 7;
  });
 
  // ── 7. Name block ─────────────────────────────────────────────────────────
  const displayName = leader.name;
  ctx.font      = `700 ${NAME_SIZE}px ${NAME_FONT}`;
  ctx.fillStyle = "#f5ead8"; ctx.textAlign = "left";
 
  const nameW = ctx.measureText(displayName).width;
  if (nameW <= TW) {
    // Single line — baseline sits at DIVIDER_Y - DIVIDER_GAP
    ctx.fillText(displayName, PAD, DIVIDER_Y - DIVIDER_GAP);
  } else {
    // Two lines — split at word boundary
    const words = displayName.split(" ");
    const mid   = Math.ceil(words.length / 2);
    const l1    = words.slice(0, mid).join(" ");
    const l2    = words.slice(mid).join(" ");
    const base  = DIVIDER_Y - DIVIDER_GAP;
    ctx.fillText(l2, PAD, base);
    ctx.fillText(l1, PAD, base - NAME_LINE_H);
  }
 
  // ── 8. Accent rule (short, left-aligned, under name) ─────────────────────
  ctx.strokeStyle = GOLD_A(0.30); ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, DIVIDER_Y);
  ctx.lineTo(PAD + Math.round(W * 0.125), DIVIDER_Y);   // ~120px wide
  ctx.stroke();
 
  // ── 9. Bio (3 lines) ──────────────────────────────────────────────────────
  const bioFontSz = Math.round(W * 0.030);   // 19
  ctx.font      = `300 ${bioFontSz}px 'DM Sans', sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.64)"; ctx.textAlign = "left";
  wrapText(ctx, leader.short_bio, PAD, BIO_TOP, TW, BIO_LINE_H, BIO_LINES);
 
  // ── 10. Date · Region meta line ───────────────────────────────────────────
  const metaFontSz = Math.round(W * 0.024);   // 13
  ctx.font      = `400 ${metaFontSz}px 'DM Sans', sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.36)"; ctx.textAlign = "left";
  ctx.fillText(`${leader.born} – ${leader.died ?? "present"}  ·  ${leader.region}`, PAD, META_Y);
 
  // ── 11. Full-width gold rule ──────────────────────────────────────────────
  ctx.strokeStyle = GOLD_A(0.24); ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, RULE_FULL_Y); ctx.lineTo(W - PAD, RULE_FULL_Y);
  ctx.stroke();
 
  // ── 12. Watermark ─────────────────────────────────────────────────────────
  const wmFontSz = Math.round(W * 0.012);   // 11
  ctx.font      = `400 ${wmFontSz}px 'DM Sans', sans-serif`;
  ctx.fillStyle = GOLD_A(0.25); ctx.textAlign = "center";
  ctx.letterSpacing = "0.14em";
  ctx.fillText("TAMIL LEGACY", W / 2, WM_Y);
  ctx.letterSpacing = "0";
 
  onDone();
}
 
// ─── Work card — editorial quote layout (960×960) ────────────────────────────
//
//  LAYOUT GRID
//
//  ┌──────────────────────────────────────────────────────┐ y=0
//  │  PAD top margin                                      │
//  │  Type badge pill  (centered)             h=2.4%      │ y≈58
//  │  ── thin top rule ─────────────────────────────      │ y≈100
//  │                                                      │
//  │       ❝  decorative quote mark  (left)               │ y≈130
//  │                                                      │
//  │       Main text block  (centered, max 6 lines)       │ y≈340–580
//  │                                                      │
//  │  ─── ornament rule ─── ◆ ─── ornament rule ───       │
//  │                                                      │
//  │       Explanation  (centered, max 3 lines)           │
//  │                                                      │
//  │       — Author  ·  Leader                            │
//  │         Source (if any)                              │
//  │                                                      │
//  │  ══ full-width gold rule ══════════════════════════  │ y≈874
//  │  TAMIL LEGACY watermark                              │ y≈899
//  └──────────────────────────────────────────────────────┘ y=W
 
function drawWorkCard(
  ctx: CanvasRenderingContext2D,
  W: number,
  work: Work,
  leader: Leader | null,
  isDark: boolean,
  onDone: () => void
) {
  const GOLD   = "#c9963a";
  const GOLD_A = (a: number) => `rgba(201,150,58,${a})`;
 
  // ── Layout constants ──────────────────────────────────────────────────────
  const PAD  = Math.round(W * 0.063);   // 60px @ 960
  const TW   = W - PAD * 2;            // 840px usable width
 
  // TOP fixed positions
  const BADGE_Y    = PAD;                              // 60  — badge top
  const BADGE_H    = Math.round(W * 0.024);            // 23  — badge height
  const TOP_RULE_Y = BADGE_Y + BADGE_H + Math.round(W * 0.044); // 105 — thin decorative rule
  const QUOTE_Y    = TOP_RULE_Y + Math.round(W * 0.16);         // 259 — " mark bottom
 
  // BOTTOM fixed positions (built upward)
  const BOT_EDGE    = W - PAD;
  const WM_Y        = BOT_EDGE - Math.round(W * 0.005);
  const RULE_FULL_Y = WM_Y - Math.round(W * 0.026);
  const SOURCE_Y    = RULE_FULL_Y - Math.round(W * 0.028);
  const AUTHOR_Y    = SOURCE_Y - Math.round(W * 0.028);
 
  // MIDDLE — explanation block anchored just above author
  const EXPL_LINES  = 3;
  const EXPL_LINE_H = Math.round(W * 0.028);           // 27
  const EXPL_GAP    = Math.round(W * 0.028);            // 27  — gap between expl bottom & author
  const EXPL_BOT    = AUTHOR_Y - EXPL_GAP;
  const EXPL_TOP    = work.explanation
    ? EXPL_BOT - EXPL_LINES * EXPL_LINE_H
    : EXPL_BOT;
 
  // Ornament rule — sits between main text and explanation
  const ORNA_RULE_Y = EXPL_TOP - Math.round(W * 0.038); // 36px above expl
 
  // Main text — centered in remaining space
  const isKural     = work.type === "kural";
  const TEXT_FONT_SZ = isKural ? Math.round(W * 0.026) : Math.round(W * 0.030); // 25/29
  const TEXT_LINE_H  = Math.round(TEXT_FONT_SZ * 1.55);  // comfortable leading
  const TEXT_MAX_L   = 6;
 
  // Center the text block vertically between QUOTE_Y and ORNA_RULE_Y
  const TEXT_ZONE_MID = QUOTE_Y + (ORNA_RULE_Y - QUOTE_Y) / 2;
  const TEXT_BLOCK_H  = TEXT_MAX_L * TEXT_LINE_H;
  const TEXT_START_Y  = TEXT_ZONE_MID - TEXT_BLOCK_H / 2 + TEXT_FONT_SZ; // approx
 
  // Type colours
  const TYPE_COLORS: Record<string, [string, string]> = {
    kural: ["#9b8fcb", "rgba(155,143,203,"],
    poem:  ["#6aab8a", "rgba(106,171,138,"],
    quote: [GOLD,      "rgba(201,150,58,"],
  };
  const [TC, TC_A_prefix] = TYPE_COLORS[work.type] ?? [GOLD, "rgba(201,150,58,"];
  const TC_A = (a: number) => `${TC_A_prefix}${a})`;
 
  const CREAM = isDark ? "#f0e6cc" : "#1a1206";
  const MUTED = isDark ? "rgba(240,230,204,0.52)" : "rgba(26,18,6,0.52)";
  const FAINT = isDark ? "rgba(240,230,204,0.26)" : "rgba(26,18,6,0.26)";
 
  // ── 1. Background gradient ────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, W, W);
  bg.addColorStop(0, isDark ? "#0f0c0a" : "#faf6ef");
  bg.addColorStop(1, isDark ? "#080604" : "#f0e9da");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, W);
 
  // Noise texture
  for (let i = 0; i < 1600; i++) {
    const nx = Math.random() * W, ny = Math.random() * W;
    const na = Math.random() * (isDark ? 0.022 : 0.015);
    ctx.fillStyle = isDark ? `rgba(255,255,255,${na})` : `rgba(0,0,0,${na})`;
    ctx.fillRect(nx, ny, 1, 1);
  }
 
  // Radial glow — centered on text zone
  const glowCY = TEXT_ZONE_MID;
  const glow   = ctx.createRadialGradient(W / 2, glowCY, 0, W / 2, glowCY, W * 0.52);
  glow.addColorStop(0,   TC_A(isDark ? 0.07 : 0.05));
  glow.addColorStop(1,   "rgba(0,0,0,0)");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, W);
 
  // ── 2. Borders ────────────────────────────────────────────────────────────
  ctx.strokeStyle = GOLD_A(0.28); ctx.lineWidth = 1.5;
  drawRoundRect(ctx, 2, 2, W - 4, W - 4, 16); ctx.stroke();
  ctx.strokeStyle = GOLD_A(0.09); ctx.lineWidth = 1;
  drawRoundRect(ctx, 10, 10, W - 20, W - 20, 12); ctx.stroke();
 
  // ── 3. Type badge (centered) ──────────────────────────────────────────────
  const badgeFontSz = Math.round(W * 0.013);   // 12
  ctx.font = `600 ${badgeFontSz}px 'DM Sans', sans-serif`;
  const typeLabel = work.type === "kural"
    ? `THIRUKKURAL${work.kural_number ? ` · ${work.kural_number}` : ""}${work.chapter_name ? ` · ${work.chapter_name.toUpperCase()}` : ""}`
    : work.type.toUpperCase();
  const badgePH   = Math.round(W * 0.015);     // horizontal padding
  const badgeW    = ctx.measureText(typeLabel).width + badgePH * 2;
  const badgeX    = (W - badgeW) / 2;
  ctx.fillStyle   = TC_A(isDark ? 0.14 : 0.10);
  ctx.strokeStyle = TC_A(0.38); ctx.lineWidth = 1;
  drawRoundRect(ctx, badgeX, BADGE_Y, badgeW, BADGE_H, BADGE_H / 2);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = TC; ctx.textAlign = "center";
  ctx.fillText(typeLabel, W / 2, BADGE_Y + BADGE_H * 0.68);
 
  // ── 4. Top decorative rule (full-width, faint) ───────────────────────────
  ctx.strokeStyle = GOLD_A(0.12); ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, TOP_RULE_Y); ctx.lineTo(W - PAD, TOP_RULE_Y);
  ctx.stroke();
 
  // ── 5. Decorative open-quote ──────────────────────────────────────────────
  const quoteSz = Math.round(W * 0.17);   // 163
  ctx.font      = `700 ${quoteSz}px Georgia, serif`;
  ctx.fillStyle = GOLD_A(isDark ? 0.055 : 0.045);
  ctx.textAlign = "left";
  ctx.fillText("\u201C", PAD - Math.round(W * 0.01), QUOTE_Y);
 
  // ── 6. Main text ──────────────────────────────────────────────────────────
  ctx.font = isKural
    ? `400 ${TEXT_FONT_SZ}px 'Noto Serif Tamil', 'Nirmala UI', serif`
    : `600 ${TEXT_FONT_SZ}px Georgia, 'Times New Roman', serif`;
  ctx.fillStyle = CREAM; ctx.textAlign = "center";
  wrapText(ctx, work.text, W / 2, TEXT_START_Y, TW, TEXT_LINE_H, TEXT_MAX_L);
 
  // ── 7. Ornament rule ──────────────────────────────────────────────────────
  const ORW = Math.round(W * 0.24);   // 230 — rule arm length each side
  ctx.strokeStyle = GOLD_A(0.26); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W / 2 - ORW / 2 - 12, ORNA_RULE_Y); ctx.lineTo(PAD, ORNA_RULE_Y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W / 2 + ORW / 2 + 12, ORNA_RULE_Y); ctx.lineTo(W - PAD, ORNA_RULE_Y); ctx.stroke();
  // Diamond ornament
  ctx.save();
  ctx.fillStyle = GOLD_A(0.55);
  ctx.translate(W / 2, ORNA_RULE_Y);
  ctx.rotate(Math.PI / 4);
  const DS = Math.round(W * 0.006);   // 5.5
  ctx.fillRect(-DS, -DS, DS * 2, DS * 2);
  ctx.restore();
 
  // ── 8. Explanation ────────────────────────────────────────────────────────
  if (work.explanation) {
    const explFontSz = Math.round(W * 0.018);   // 17
    ctx.font      = `300 ${explFontSz}px 'DM Sans', sans-serif`;
    ctx.fillStyle = MUTED; ctx.textAlign = "center";
    wrapText(ctx, work.explanation, W / 2, EXPL_TOP, TW * 0.84, EXPL_LINE_H, EXPL_LINES);
  }
 
  // ── 9. Author line ────────────────────────────────────────────────────────
  const authorFontSz = Math.round(W * 0.017);   // 16
  ctx.font      = `600 ${authorFontSz}px 'DM Sans', sans-serif`;
  ctx.fillStyle = TC; ctx.textAlign = "center";
  const authorLine = leader ? `${work.author}  ·  ${leader.name}` : work.author;
  ctx.fillText(`— ${authorLine}`, W / 2, AUTHOR_Y);
 
  // ── 10. Source ────────────────────────────────────────────────────────────
  if (work.source) {
    const srcFontSz = Math.round(W * 0.014);   // 13
    ctx.font      = `400 ${srcFontSz}px 'DM Sans', sans-serif`;
    ctx.fillStyle = FAINT; ctx.textAlign = "center";
    ctx.fillText(work.source, W / 2, SOURCE_Y);
  }
 
  // ── 11. Full-width gold rule ──────────────────────────────────────────────
  ctx.strokeStyle = GOLD_A(0.22); ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, RULE_FULL_Y); ctx.lineTo(W - PAD, RULE_FULL_Y);
  ctx.stroke();
 
  // ── 12. Watermark ─────────────────────────────────────────────────────────
  const wmFontSz = Math.round(W * 0.012);   // 11
  ctx.font      = `400 ${wmFontSz}px 'DM Sans', sans-serif`;
  ctx.fillStyle = GOLD_A(0.25); ctx.textAlign = "center";
  ctx.letterSpacing = "0.14em";
  ctx.fillText("TAMIL LEGACY", W / 2, WM_Y);
  ctx.letterSpacing = "0";
 
  onDone();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShareModal({ item, type, t, onClose, leaderById }: Props) {
  const s      = useS();
  console.log("S value in ShareModal:", s);  // Debug log to check the value of s
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied,  setCopied]  = useState(false);
  const [imgSrc,  setImgSrc]  = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isDark = t.bg === "#100f0d" || t.bg.startsWith("#0") || t.bg.startsWith("#1");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 960;
    canvas.width  = W;
    canvas.height = W;

    setImgSrc(null);
    setLoading(true);

    const flush = () => {
      setImgSrc(canvas.toDataURL("image/png"));
      setLoading(false);
    };

    if (type === "leader" && isLeader(item)) {
      fetchWikiImage(item.wiki).then((url) => {
        if (!url) {
          drawLeaderCard(ctx, W, item, null, isDark, flush);
          return;
        }
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload  = () => drawLeaderCard(ctx, W, item, img, isDark, flush);
        img.onerror = () => drawLeaderCard(ctx, W, item, null, isDark, flush);
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
    a.download = `tamil-legacy-${type}-${item.id}.png`;
    a.click();
  }

  function copyLink() {
    const url = `${window.location.origin}${window.location.pathname}?${type}=${item.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  // Derive a readable title for the modal header
  const cardTitle = isLeader(item)
    ? item.name
    : (item as Work).author;

  return (
    <>
      {/* Keyframe styles */}
      <style>{`
        @keyframes tl-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes tl-card-in {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes tl-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        .tl-btn-primary {
          position: relative;
          overflow: hidden;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .tl-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(201,150,58,0.28);
        }
        .tl-btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }
        .tl-btn-secondary {
          transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
        }
        .tl-btn-secondary:hover {
          background: rgba(201,150,58,0.06) !important;
          border-color: rgba(201,150,58,0.45) !important;
          color: #c9963a !important;
        }
        .tl-close {
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .tl-close:hover {
          background: rgba(201,150,58,0.12) !important;
          transform: rotate(90deg);
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 300,
          background: "rgba(4,3,2,0.80)",
          backdropFilter: "blur(16px) saturate(0.7)",
          WebkitBackdropFilter: "blur(16px) saturate(0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
          animation: "tl-backdrop-in 0.22s ease forwards",
        }}
      >
        {/* Modal shell */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "rgba(14,11,8,0.92)",
            border: "1px solid rgba(201,150,58,0.22)",
            borderRadius: 18,
            padding: "22px 22px 20px",
            width: "100%",
            maxWidth: 480,
            boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,150,58,0.06) inset",
            animation: "tl-card-in 0.26s cubic-bezier(0.22,1,0.36,1) forwards",
          }}
        >
          {/* Header row */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 18,
          }}>
            <div>
              {/* Label */}
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 9, fontWeight: 600,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: "rgba(201,150,58,0.55)",
                margin: "0 0 4px",
              }}>
                {type === "leader" ? s.leaderCard : s.workCard}
              </p>
              {/* Card title */}
              <p style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 16, fontWeight: 700,
                color: "#f0e6cc",
                margin: 0,
                letterSpacing: "-0.01em",
              }}>
                {cardTitle}
              </p>
            </div>

            {/* Close button */}
            <button
              className="tl-close"
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,150,58,0.18)",
                borderRadius: "50%",
                width: 32, height: 32,
                cursor: "pointer",
                color: "rgba(240,230,204,0.5)",
                fontSize: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* Hidden canvas */}
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Preview — strict 1:1 */}
          <div style={{
            width: "100%",
            aspectRatio: "1 / 1",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 16,
            background: "rgba(20,15,8,0.9)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,150,58,0.14)",
            position: "relative",
          }}>
            {loading && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 12,
              }}>
                <Spinner color="#c9963a" />
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11, color: "rgba(201,150,58,0.45)",
                  margin: 0, letterSpacing: "0.1em",
                }}>
                  Crafting card…
                </p>
              </div>
            )}
            {imgSrc && (
              <img
                src={imgSrc}
                alt="share card"
                style={{
                  width: "100%", height: "100%",
                  objectFit: "cover",
                  display: "block",
                  opacity: loading ? 0 : 1,
                  transition: "opacity 0.3s ease",
                }}
              />
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="tl-btn-primary"
              onClick={download}
              disabled={!imgSrc}
              style={{
                flex: 1,
                padding: "11px 0",
                background: imgSrc
                  ? "linear-gradient(135deg, #c9963a 0%, #a07828 100%)"
                  : "rgba(201,150,58,0.2)",
                color: imgSrc ? "#0d0b09" : "rgba(201,150,58,0.35)",
                border: "none",
                borderRadius: 10,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13, fontWeight: 700,
                cursor: imgSrc ? "pointer" : "not-allowed",
                letterSpacing: "0.02em",
              }}
            >
              ↓ {s.download}
            </button>

            <button
              className="tl-btn-secondary"
              onClick={copyLink}
              style={{
                flex: 1,
                padding: "11px 0",
                background: copied ? "rgba(201,150,58,0.08)" : "transparent",
                color: copied ? "#c9963a" : "rgba(240,230,204,0.45)",
                border: `1px solid ${copied ? "rgba(201,150,58,0.4)" : "rgba(201,150,58,0.18)"}`,
                borderRadius: 10,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13, fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >
              {copied ? `✓ ${s.copied}` : `↗ ${s.copyLink}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}