"use client";

import { useState, useEffect, useMemo } from "react";
import type { Lang, Theme, Strings } from "@/types";
import type { Leader, Work } from "@/lib/content";
import { getLeaders, getWorks } from "@/lib/content";
import { THEMES } from "@/lib/theme";
import { I18nProvider } from "@/context/I18nContext";
import { STRINGS } from "@/lib/strings";
import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import RequestBanner from "@/components/RequestBanner";
import LeaderCard from "@/components/LeaderCard";
import LeaderModal from "@/components/LeaderModal";
import WorkCard from "@/components/WorkCard";
import WorkModal from "@/components/WorkModal";
import ShareModal from "@/components/ShareModal";
import Pagination from "@/components/Pagination";

const PAGE_SIZE    = 9;
const ALL_SECTIONS = ["leaders", "works"];
const SS_KEY       = "te_ui";

function writeSession(v: { sec: string; lang: Lang; dark: boolean }) {
  try { sessionStorage.setItem(SS_KEY, JSON.stringify(v)); } catch {}
}

export default function Home() {
  // Always initialise with SSR-safe defaults - never read sessionStorage here
  const [dark, setDark]   = useState<boolean>(false);
  const [lang, setLang]   = useState<Lang>("en");
  const [sec,  setSec]    = useState<string>("leaders");
  const [search,  setSearch]  = useState("");
  const [wSearch, setWSearch] = useState("");
  const [page,  setPage]  = useState(1);
  const [wPage, setWPage] = useState(1);
  const [sel,      setSel]      = useState<Leader | null>(null);
  const [selWork,  setSelWork]  = useState<Work   | null>(null);
  const [shareItem, setShareItem] = useState<Leader | Work | null>(null);
  const [shareType, setShareType] = useState<"leader" | "work" | null>(null);
  const [filterLeaderId, setFilterLeaderId] = useState<string | null>(null);

  // Restore persisted state after first client-side render only
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { sec?: string; lang?: Lang; dark?: boolean };
      if (saved.sec)           setSec(saved.sec);
      if (saved.lang)          setLang(saved.lang);
      if (saved.dark != null)  setDark(saved.dark);
    } catch {}
  }, []); // empty dep array = runs once after mount, never on server

  // Write back on every change
  useEffect(() => { writeSession({ sec, lang, dark }); }, [sec, lang, dark]);

  const t = THEMES[dark ? "dark" : "light"];
  const s = STRINGS[lang] as Strings;

  const leaders = useMemo(() => getLeaders(lang), [lang]);
  const works   = useMemo(() => getWorks(lang),   [lang]);

  const leaderById   = (id: string)   => leaders.find((l) => l.id === id) ?? null;
  const leaderByName = (name: string) => leaders.find((l) => l.name === name || l.tamil_name === name) ?? null;

  const filteredLeaders = leaders.filter((l) =>
    !search ||
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.tamil_name.includes(search) ||
    l.category.toLowerCase().includes(search.toLowerCase()) ||
    l.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  );
  const pagedLeaders = filteredLeaders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const filteredWorks = works.filter((w) => {
    const matchesLeader = !filterLeaderId || w.leader_id === filterLeaderId;
    const matchesSearch = !wSearch ||
      w.text.toLowerCase().includes(wSearch.toLowerCase()) ||
      w.author.toLowerCase().includes(wSearch.toLowerCase()) ||
      (w.source ?? "").toLowerCase().includes(wSearch.toLowerCase());
    return matchesLeader && matchesSearch;
  });
  const pagedWorks = filteredWorks.slice((wPage - 1) * PAGE_SIZE, wPage * PAGE_SIZE);

  const filteredLeaderObj = filterLeaderId ? leaderById(filterLeaderId) : null;

  function go(id: string) {
    setSec(id); setSearch(""); setWSearch(""); setPage(1); setWPage(1);
  }

  function viewLeaderWorks(leaderId: string) {
    setFilterLeaderId(leaderId); setSec("works"); setWSearch(""); setWPage(1); setSel(null);
  }

  function clearLeaderFilter() {
    setFilterLeaderId(null); setWSearch(""); setWPage(1);
  }

  function handlePageChange(p: number)  { setPage(p);  window.scrollTo({ top: 0, behavior: "smooth" }); }
  function handleWPageChange(p: number) { setWPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }

  const worksForLeader = (id: string) => works.filter((w) => w.leader_id === id).length;

  return (
    <I18nProvider lang={lang}>
      <div style={{ minHeight: "100vh", background: t.bg, transition: "background 0.2s" }}>
        <style>{`
          ::placeholder { color: ${t.textMuted} !important; }
          @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
          @keyframes slideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
          @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
          @keyframes pulse   { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1.2)} }
        `}</style>

        <NavBar lang={lang} setLang={setLang} dark={dark} setDark={setDark} sec={sec} go={go} t={t} allSections={ALL_SECTIONS} />
        <PageHeader sec={sec} t={t} />

        <main style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px 80px" }}>

          {/* ── LEADERS ── */}
          {sec === "leaders" && (
            <>
              <RequestBanner t={t} />
              <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder={s.search} t={t} />
              <CountRow count={filteredLeaders.length} label={s.leadersCount} page={page} pageSize={PAGE_SIZE} s={s} t={t} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {pagedLeaders.map((leader, i) => (
                  <div key={leader.id} style={{ animation: `fadeUp 0.4s ${i * 0.04}s ease both` }}>
                    <LeaderCard leader={leader} t={t} worksCount={worksForLeader(leader.id)} onClick={setSel} onShare={(item) => { setShareItem(item); setShareType("leader"); }} onViewWorks={viewLeaderWorks} />
                  </div>
                ))}
                {filteredLeaders.length === 0 && <EmptyState text={s.noResults(search)} t={t} />}
              </div>
              <Pagination page={page} total={filteredLeaders.length} pageSize={PAGE_SIZE} onChange={handlePageChange} t={t} />
            </>
          )}

          {/* ── WORKS ── */}
          {sec === "works" && (
            <>
              {filteredLeaderObj && (
                <div style={{ background: t.accentSoft, border: `1px solid ${t.accentBorder}`, borderRadius: 8, padding: "12px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: t.accentText, fontWeight: 500 }}>
                    <span onClick={clearLeaderFilter} style={{ cursor: "pointer", textDecoration: "underline", textDecorationColor: `${t.accentText}55` }}>{s.allWorks}</span>
                    {" "}&rsaquo;{" "}
                    {lang === "ta" ? filteredLeaderObj.tamil_name : filteredLeaderObj.name}
                  </span>
                  <button onClick={clearLeaderFilter} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: t.accentText, background: "none", border: `1px solid ${t.accentBorder}`, borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
                    ← {s.allWorks}
                  </button>
                </div>
              )}
              <SearchBar value={wSearch} onChange={(v) => { setWSearch(v); setWPage(1); }} placeholder={s.searchWorks} t={t} />
              <CountRow count={filteredWorks.length} label={s.worksCount} page={wPage} pageSize={PAGE_SIZE} s={s} t={t} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
                {pagedWorks.map((w, i) => (
                  <div key={w.id} style={{ animation: `fadeUp 0.4s ${i * 0.04}s ease both` }}>
                    <WorkCard work={w} t={t} lang={lang} onClick={setSelWork} onShare={(item) => { setShareItem(item); setShareType("work"); }} leaderById={leaderById} />
                  </div>
                ))}
                {filteredWorks.length === 0 && <EmptyState text={s.noResults(wSearch || "")} t={t} />}
              </div>
              <Pagination page={wPage} total={filteredWorks.length} pageSize={PAGE_SIZE} onChange={handleWPageChange} t={t} />
            </>
          )}
        </main>

        <LeaderModal leader={sel} t={t} lang={lang} onClose={() => setSel(null)} onOpen={setSel} onShare={(item) => { setShareItem(item); setShareType("leader"); }} onViewWorks={viewLeaderWorks} leaderById={leaderById} worksCount={sel ? worksForLeader(sel.id) : 0} />

        <WorkModal work={selWork} t={t} lang={lang} onClose={() => setSelWork(null)} onShare={(item) => { setShareItem(item); setShareType("work"); }} leaderById={leaderById} onOpenLeader={(id) => { setSelWork(null); const l = leaderById(id); if (l) setSel(l); }} />

        {shareItem && shareType && (
          <ShareModal item={shareItem} type={shareType} t={t} onClose={() => { setShareItem(null); setShareType(null); }} leaderById={leaderById} />
        )}
      </div>
    </I18nProvider>
  );
}

function SearchBar({ value, onChange, placeholder, t }: { value: string; onChange: (v: string) => void; placeholder: string; t: Theme }) {
  return (
    <div style={{ position: "relative", marginBottom: 16 }}>
      <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: t.textMuted, pointerEvents: "none" }}>⌕</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "11px 40px 11px 38px", background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none", transition: "border-color 0.15s" }}
        onFocus={(e) => (e.target.style.borderColor = `${t.accent}66`)}
        onBlur={(e) => (e.target.style.borderColor = t.border)} />
      {value && <button onClick={() => onChange("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontSize: 16 }}>×</button>}
    </div>
  );
}

function CountRow({ count, label, page, pageSize, s, t }: { count: number; label: (n: number) => string; page: number; pageSize: number; s: Strings; t: Theme }) {
  return (
    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: t.textMuted, marginBottom: 16 }}>
      {label(count)}
      {count > pageSize && <span style={{ marginLeft: 6 }}>· {s.pageOf(page, Math.ceil(count / pageSize))}</span>}
    </p>
  );
}

function EmptyState({ text, t }: { text: string; t: Theme }) {
  return (
    <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: t.textMuted }}>{text}</div>
  );
}