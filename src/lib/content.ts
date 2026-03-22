/**
 * Content loader - single source of truth for all app data.
 *
 * File layout:
 *   content/leaders/<id>.json     - one file per leader, bilingual
 *   content/quotes/quotes.json    - all works (quotes, poems, kurals), bilingual
 *
 * To add a new leader:
 *   1. Create content/leaders/leader-N.json
 *   2. Add one import + one entry in ALL_LEADER_FILES below
 *   No other file needs to change.
 *
 * Work types:
 *   "quote"  - spoken/attributed quote
 *   "poem"   - poem or verse excerpt
 *   "kural"  - Thirukkural couplet (has extra kural_number, book, chapter fields)
 */

import type { Lang } from "@/types";
import quotesRaw from "@/../content/quotes/quotes.json";

// ─── Leader file imports ───────────────────────────────────────────────────────
import leaders from "@/../content/leaders/leaders.json";


// ─── Raw file shapes ──────────────────────────────────────────────────────────

export interface LeaderFile {
  id: string;
  wiki: string;
  born: string;
  died: string | null;
  related_figures: string[];
  related_quote_ids: string[];
  en: LeaderLocale;
  ta: LeaderLocale;
}

interface LeaderLocale {
  name: string;
  category: string;
  region: string;
  short_bio: string;
  full_bio: string;
  highlights: string[];
  tags: string[];
}

export interface WorkFile {
  id: string;
  leader_id: string;
  type: "quote" | "poem" | "kural";
  source: string | null;
  // Kural-specific (optional)
  kural_number?: number;
  book?: number;
  book_en?: string;
  book_ta?: string;
  chapter?: number;
  chapter_en?: string;
  chapter_ta?: string;
  en: WorkLocale;
  ta: WorkLocale;
}

interface WorkLocale {
  text: string;
  author: string;
  explanation?: string;
}

// ─── Normalised UI shapes ─────────────────────────────────────────────────────

export interface Leader {
  id: string;
  wiki: string;
  born: string;
  died: string | null;
  related_figures: string[];
  related_quote_ids: string[];
  // Language-resolved fields
  name: string;
  category: string;
  region: string;
  short_bio: string;
  full_bio: string;
  highlights: string[];
  tags: string[];
  // Always the Tamil name (for display alongside English name)
  tamil_name: string;
}

export interface Work {
  id: string;
  leader_id: string;
  type: "quote" | "poem" | "kural";
  source: string | null;
  // Kural metadata (only when type === "kural")
  kural_number?: number;
  book?: number;
  book_name?: string;
  chapter?: number;
  chapter_name?: string;
  // Language-resolved fields
  text: string;
  author: string;
  explanation?: string;
}


// ─── Normalisers ─────────────────────────────────────────────────────────────

function normaliseLeader(f: LeaderFile, lang: Lang): Leader {
  const loc = f[lang] ?? f.en;
  return {
    id: f.id,
    wiki: f.wiki,
    born: f.born,
    died: f.died,
    related_figures: f.related_figures,
    related_quote_ids: f.related_quote_ids,
    name: loc.name,
    category: loc.category,
    region: loc.region,
    short_bio: loc.short_bio,
    full_bio: loc.full_bio,
    highlights: loc.highlights,
    tags: loc.tags,
    tamil_name: f.ta.name,
  };
}

function normaliseWork(w: WorkFile, lang: Lang): Work {
  const loc = w[lang] ?? w.en;
  return {
    id: w.id,
    leader_id: w.leader_id,
    type: w.type,
    source: w.source,
    kural_number: w.kural_number,
    book: w.book,
    book_name: lang === "ta" ? w.book_ta : w.book_en,
    chapter: w.chapter,
    chapter_name: lang === "ta" ? w.chapter_ta : w.chapter_en,
    text: loc.text,
    author: loc.author,
    explanation: loc.explanation,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getLeaders(lang: Lang): Leader[] {
  return leaders.map((f) => normaliseLeader(f, lang));
}

export function getLeader(id: string, lang: Lang): Leader | null {
  const f = leaders.find((f) => f.id === id);
  return f ? normaliseLeader(f, lang) : null;
}

export function getLeadersByCategory(category: string, lang: Lang): Leader[] {
  return getLeaders(lang).filter(
    (l) => l.category.toLowerCase().includes(category.toLowerCase())
  );
}

export function getLeadersByTag(tag: string, lang: Lang): Leader[] {
  return getLeaders(lang).filter((l) =>
    l.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()))
  );
}

export function getWorks(lang: Lang): Work[] {
  return (quotesRaw as WorkFile[]).map((w) => normaliseWork(w, lang));
}

export function getWorksByLeader(leaderId: string, lang: Lang): Work[] {
  return getWorks(lang).filter((w) => w.leader_id === leaderId);
}

export function getWorksByType(type: Work["type"], lang: Lang): Work[] {
  return getWorks(lang).filter((w) => w.type === type);
}

export function getKuralsByChapter(chapter: number, lang: Lang): Work[] {
  return getWorks(lang).filter(
    (w) => w.type === "kural" && w.chapter === chapter
  );
}

export function getKuralsByBook(book: number, lang: Lang): Work[] {
  return getWorks(lang).filter(
    (w) => w.type === "kural" && w.book === book
  );
}