// Re-export content types as primary app types
export type { Leader, Work } from "@/lib/content";

export type Lang = "en" | "ta";

export interface SectionStrings {
  title: string;
  desc: string;
}

export interface Strings {
  appName: string;
  tagline: string;
  nav: Record<string, string>;
  section: Record<string, SectionStrings>;
  search: string;
  searchWorks: string;
  leadersCount: (n: number) => string;
  worksCount: (n: number) => string;
  pageOf: (p: number, t: number) => string;
  viewWorks: (n: number) => string;
  biography: string;
  highlights: string;
  relatedFigures: string;
  tags: string;
  notYet: string;
  light: string;
  dark: string;
  noResults: (q: string) => string;
  present: string;
  requestLeader: string;
  requestDesc: string;
  requestBtn: string;
  shareCard: string;
  download: string;
  copyLink: string;
  copied: string;
  leaderCard: string;
  workCard: string;
  by: string;
  workTypeLabel: Record<string, string>;
  kuralNumber: (n: number) => string;
  allWorks: string;
  backToAll: string;
  readMoreButton: string;
}

export interface PillStyle {
  bg: string;
  border: string;
  text: string;
}

export interface Theme {
  bg: string;
  surface: string;
  surfaceHover: string;
  modal: string;
  border: string;
  text: string;
  textSub: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  accentBorder: string;
  accentText: string;
  nav: string;
  pill: PillStyle;
  tag: PillStyle;
  disabled: PillStyle;
  shadow: string;
  shadowModal: string;
  toggle: PillStyle;
  pa: { bg: string; text: string };
  pi: { bg: string; border: string; text: string };
  banner: PillStyle;
  request: { bg: string; border: string };
  sharePanel: { bg: string; border: string };
}

export type ShareType = "leader" | "work";
export type ShareItem = import("@/lib/content").Leader | import("@/lib/content").Work;

export interface I18nContextValue {
  lang: Lang;
  s: Strings;
}
