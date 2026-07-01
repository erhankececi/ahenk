"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles, Heart, Send, Search, BadgeCheck, MapPin, Briefcase, X, Zap,
  SlidersHorizontal, Flame, LayoutGrid, List, RefreshCw, Star, RotateCcw, Gift, Lock, Unlock, Gamepad2, Bell,
} from "lucide-react";
import { Badge } from "@/components/ui";
import StoriesBar from "@/components/StoriesBar";
import MomentsFeed from "@/components/MomentsFeed";
import DiscoveryFilters from "@/components/DiscoveryFilters";
import DiscoveryRails from "@/components/DiscoveryRails";
import DiscoveryList from "@/components/DiscoveryList";
import WelcomeTour from "@/components/WelcomeTour";
import DailyQuestion from "@/components/DailyQuestion";
import { PremiumBadge, tierName, tierGlow, tierCard, tierFrame, VipTag } from "@/components/PremiumBadge";
import { DEFAULT_FILTER, filterToQuery, kmLabel, type DiscoveryFilter } from "@/lib/discoveryFilters";
import { useLang } from "@/components/LangProvider";

type Meta = {
  count: number;
  online: number;
  sehir: string | null;
  filters: { km: number | null; cities: string[] };
  trendVibes: { label: string; n: number }[];
  hasMore: boolean;
};

export default function Kesfet() {
  const router = useRouter();
  const { t: tr_ } = useLang();
  const tk = tr_.kesfet;
  const [cands, setCands] = useState<any[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [i, setI] = useState(0);
  const [loading, setLoading] = useState(true);
  const [revealMore, setRevealMore] = useState(false);
  const [matchPop, setMatchPop] = useState<{ name: string; matchId: string; tier?: string } | null>(null);
  const [superMsg, setSuperMsg] = useState("");
  const [tab, setTab] = useState<"profiller" | "anlar">("profiller");
  const [filter, setFilter] = useState<DiscoveryFilter>(DEFAULT_FILTER);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<"kart" | "liste">("kart");
  const [chip, setChip] = useState("tumu");

  async function yukle(f: DiscoveryFilter) {
    setLoading(true);
    const qs = filterToQuery(f);
    const d = await fetch(`/api/discover${qs ? `?${qs}` : ""}`).then((r) => r.json());
    setCands(d.candidates || []);
    setMeta(d.meta || null);
    setI(0);
    setRevealMore(false);
    setLoading(false);
  }

  useEffect(() => {
    yukle(DEFAULT_FILTER);
  }, []);

  function applyFilter(f: DiscoveryFilter) {
    setFilter(f);
    yukle(f);
  }

  // Üst hızlı çipler (mockup): Tümü / Yakınında / Online / Yeni / Popüler
  const CHIPS = [
    { id: "tumu", label: tk.chipTumu, sort: "smart" as const },
    { id: "yakin", label: tk.chipYakin, sort: "near" as const },
    { id: "online", label: tk.chipOnline, sort: null },
    { id: "yeni", label: tk.chipYeni, sort: "new" as const },
    { id: "populer", label: tk.chipPopuler, sort: "active" as const },
  ];
  function selectChip(c: (typeof CHIPS)[number]) {
    setChip(c.id);
    setI(0);
    if (c.sort) applyFilter({ ...filter, sort: c.sort });
  }

  const deck = chip === "online" ? cands.filter((c) => c.online) : cands;
  const current = deck[i];
  // Günün profili: en yüksek ahenk uyumlu aday (geri dönüş için öne çıkar).
  const gunun = cands.length
    ? cands.reduce((best: any, c: any) => ((c.ortakYuzde ?? 0) > (best?.ortakYuzde ?? -1) ? c : best), cands[0])
    : null;

  async function act(type: string) {
    if (!current) return;
    if (type === "daha_fazla") return setRevealMore(true);
    const res = await fetch("/api/interact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_user: current.id, type }),
    });
    const data = await res.json();
    if (data.matched) setMatchPop({ name: current.name, matchId: data.matchId, tier: current.tier });
    next();
  }

  async function superBegen() {
    if (!current) return;
    const res = await fetch("/api/interact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_user: current.id, type: "super" }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSuperMsg(
        data?.error === "insufficient" ? tk.superUsedFree : tk.superFailed
      );
      setTimeout(() => setSuperMsg(""), 4500);
      return;
    }
    if (data.matched) setMatchPop({ name: current.name, matchId: data.matchId, tier: current.tier });
    next();
  }

  // Liste modunda satır-içi hızlı aksiyon (deste indeksini bozmadan, kişiyi listeden çıkarır)
  async function interactWith(id: string, type: string) {
    const res = await fetch("/api/interact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_user: id, type }),
    });
    const data = await res.json();
    if (data.matched) {
      const c = cands.find((x) => x.id === id);
      setMatchPop({ name: c?.name || tk.someone, matchId: data.matchId, tier: c?.tier });
    }
    setCands((cs) => cs.filter((x) => x.id !== id));
  }

  async function gec() {
    if (!current) return;
    await fetch("/api/interact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_user: current.id, type: "gec" }),
    });
    next();
  }

  function next() {
    setRevealMore(false);
    setI((x) => x + 1);
  }

  const blur = revealMore ? "blur-md" : "blur-2xl";
  // Keşfette fotoğraf kilitli — netlik düşük; dokununca biraz açılır ("fotoğraf sohbetle netleşir").
  const clarity = revealMore ? 45 : 15;
  const photo = current?.photos?.[0];
  const kmText = kmLabel(filter.km);
  const kmNum = filter.km !== "all" ? parseInt(filter.km, 10) : null;

  // Masaüstü yan panel: sıradaki adaylar kuyruğu (aktif kartı asla dahil etmez, salt önizleme)
  const upNext = deck.slice(i + 1, i + 1 + 5);

  return (
    <div className="px-5 pt-[calc(env(safe-area-inset-top)+18px)] lg:mx-auto lg:max-w-6xl lg:px-8">
      <WelcomeTour />

      {/* Header — Stitch referans: AHENK wordmark + tagline (sol) · filtre + bildirim (sağ) */}
      <header className="mb-5 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-display text-[15px] font-bold uppercase leading-tight tracking-[0.28em] text-accent">
            AHENK
          </span>
          <span className="mt-0.5 text-[11px] tracking-[0.04em] text-muted">{tk.tagline}</span>
        </div>
        <div className="flex items-center gap-4 text-accent">
          <button
            onClick={() => setFiltersOpen(true)}
            aria-label={tk.filter}
            className="transition hover:text-accent/75 active:scale-95"
          >
            <SlidersHorizontal size={20} strokeWidth={1.7} />
          </button>
          <Link href="/bildirimler" aria-label={tk.notifications} className="transition hover:text-accent/75 active:scale-95">
            <Bell size={20} strokeWidth={1.7} />
          </Link>
        </div>
      </header>

      <h1 className="mb-4 font-display text-[26px] font-semibold tracking-[-0.01em] text-text">{tk.title}</h1>

      {/* Hızlı çipler */}
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
        {CHIPS.map((c) => (
          <button
            key={c.id}
            onClick={() => selectChip(c)}
            className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition ${
              chip === c.id ? "ahenk-chip-active" : "ahenk-chip hover:text-text"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)_260px] lg:items-start lg:gap-8">

      {loading && (
        <div className="aspect-[3/4] overflow-hidden rounded-[28px] border border-border bg-surface lg:col-start-2">
          <div className="shimmer h-full w-full" />
        </div>
      )}

      {!loading && !current && (
        <div className="flex flex-col items-center justify-center px-8 py-16 text-center lg:col-start-2">
          <Sparkles className="mb-4 text-brand" size={36} strokeWidth={1.5} />
          <h2 className="font-display text-xl font-semibold">{tk.emptyTitle}</h2>
          <p className="mt-2 text-muted">
            {filter.cities.length || filter.verified || filter.minAge > 18 || filter.maxAge < 60
              ? tk.emptyFiltered
              : tk.emptyDefault}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {filter.km !== "all" || filter.cities.length > 0 ? (
              <button
                onClick={() => applyFilter(DEFAULT_FILTER)}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium transition hover:border-brand/50"
              >
                {tk.resetFilter}
              </button>
            ) : (
              <Link
                href="/onboarding"
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium transition hover:border-brand/50"
              >
                {tk.enrichProfile}
              </Link>
            )}
            <button
              onClick={() => yukle(filter)}
              className="brand-gradient inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-semibold"
            >
              <RefreshCw size={15} /> {tk.refresh}
            </button>
          </div>
        </div>
      )}

      {current && (
        <>
          {/* Masaüstü sol panel — hızlı filtre özeti + günlük istatistik (dekoratif/bilgi amaçlı, swipe state'ine dokunmaz) */}
          <aside className="hidden lg:sticky lg:top-6 lg:col-start-1 lg:row-start-1 lg:flex lg:flex-col lg:gap-4">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{tk.title}</p>
              <div className="mt-3 space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted">
                    <Flame size={14} strokeWidth={1.8} className="text-accent" /> {tk.chipOnline}
                  </span>
                  <span className="font-semibold text-text">{meta?.online ?? 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted">
                    <Sparkles size={14} strokeWidth={1.8} className="text-accent" /> {tk.title}
                  </span>
                  <span className="font-semibold text-text">{meta?.count ?? deck.length}</span>
                </div>
                {meta?.sehir && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted">
                      <MapPin size={14} strokeWidth={1.8} className="text-accent" /> {tk.nearArea}
                    </span>
                    <span className="font-semibold text-text">{meta.sehir}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setFiltersOpen(true)}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] py-2 text-xs font-medium transition hover:border-accent/50"
              >
                <SlidersHorizontal size={13} strokeWidth={1.8} /> {tk.filter}
              </button>
            </div>

            {meta?.trendVibes && meta.trendVibes.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{tk.chipPopuler}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {meta.trendVibes.slice(0, 8).map((v) => (
                    <span
                      key={v.label}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-muted"
                    >
                      {v.label} <span className="text-accent">{v.n}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <div className="lg:col-start-2 lg:row-start-1">
          {kmNum && (
            <p className="mb-3 flex items-center gap-1.5 text-xs text-muted">
              <MapPin size={13} strokeWidth={1.6} />
              {current.priority ? `${tk.nearArea} · 0–${kmNum} km` : `${tk.farArea} · ${kmNum}+ km`}
            </p>
          )}

          {/* Hero kart — Stitch glassmorphism: tüm içerik fotoğraf üzerinde */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.98 }}
              transition={{ duration: 0.28 }}
              className={`relative aspect-[3/4] overflow-hidden rounded-[28px] ahenk-photo-card ${tierCard(current.tier)} ${tierGlow(
                current.tier
              )}`}
            >
              <div className="absolute inset-0 bg-elevated">
                {photo ? (
                  <img src={photo} className={`h-full w-full scale-110 object-cover ${blur}`} alt="" />
                ) : (
                  <div className="brand-gradient h-full w-full opacity-30" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/15 to-black/25" />
              </div>

              <div className="absolute inset-0 flex flex-col justify-between p-6">
                {/* Üst satır: uyum pill (sol) · durum rozetleri (sağ) */}
                <div className="flex items-start justify-between">
                  {current.ortakYuzde != null && (
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 backdrop-blur-md">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                      <span className="text-[12px] font-semibold tracking-wide text-accent">
                        %{current.ortakYuzde} {tk.match}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col items-end gap-1.5">
                    {current.isNew && (
                      <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-black">{tk.newMember}</span>
                    )}
                    {current.boosted && (
                      <span className="flex items-center gap-1 rounded-full bg-accent/90 px-2.5 py-1 text-[11px] font-semibold text-black">
                        <Zap size={11} /> {tk.featured}
                      </span>
                    )}
                    {current.vibe && (
                      <span className="rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-xs text-white backdrop-blur-md">
                        {current.vibe.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Alt blok: kimlik · etiketler · alıntı · netlik */}
                <div className="flex flex-col gap-4">
                  <div>
                    <Link href={`/u/${current.id}`} className="flex items-center gap-2">
                      <h2 className="font-display text-[28px] font-semibold leading-none text-white drop-shadow-sm">
                        {current.name}
                        <span className="font-normal text-white/80">{current.age ? `, ${current.age}` : ""}</span>
                      </h2>
                      {current.is_verified && <BadgeCheck className="text-accent" size={20} />}
                    </Link>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/75">
                      {current.profession && (
                        <span className="flex items-center gap-1.5">
                          <Briefcase size={14} strokeWidth={1.6} /> {current.profession}
                        </span>
                      )}
                      {current.profession && current.city && <span className="h-1 w-1 rounded-full bg-white/30" />}
                      {current.city && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} strokeWidth={1.6} /> {current.city}
                          {current.mesafe != null &&
                            (current.sameCity || current.mesafe === 0 ? ` · ${tk.nearby}` : ` · ${current.mesafe} km`)}
                        </span>
                      )}
                      {current.online && (
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" /> {tk.online}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Karakter etiketleri (ilgi alanları) */}
                  {current.interests?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {current.interests.slice(0, 4).map((it: string) => (
                        <span
                          key={it}
                          className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md"
                        >
                          {it}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Karakter özeti / alıntı */}
                  {current.bio && (
                    <p className="border-l-2 border-accent/40 py-1 pl-3 text-[15px] italic leading-relaxed text-white/85">
                      “{current.bio}”
                    </p>
                  )}

                  {/* Netlik mekanizması — dokununca biraz daha açılır */}
                  <button
                    onClick={() => act("daha_fazla")}
                    className="flex w-full flex-col gap-2 rounded-2xl border border-white/10 bg-black/40 p-4 text-left backdrop-blur-md transition active:scale-[0.99]"
                  >
                    <div className="flex items-end justify-between">
                      <span className="text-[12px] text-white/65">{tk.photoClarity} %{clarity}</span>
                      {revealMore ? (
                        <Unlock size={15} className="text-accent" />
                      ) : (
                        <Lock size={15} className="text-accent" />
                      )}
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-accent shadow-[0_0_8px_rgba(199,169,119,0.5)] transition-[width] duration-500"
                        style={{ width: `${clarity}%` }}
                      />
                    </div>
                    <span className="mt-0.5 text-center text-[10px] uppercase tracking-widest text-white/45">{tk.photoReveal}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Ek özellikler (Stitch'te yok ama Ahenk mantığı korunur): premium · ortak yönler · ses · netleşince ekstra */}
          {(current.tier !== "free" ||
            current.voice_card ||
            current.reasons?.length > 0 ||
            (revealMore && (current.music?.length > 0 || current.zodiac))) && (
            <div className="mt-4 space-y-3">
              {current.tier !== "free" && (
                <div className="flex items-center gap-2">
                  <PremiumBadge tier={current.tier} />
                  {(current.tier === "platinum" || current.tier === "legend") && <VipTag tier={current.tier} />}
                </div>
              )}
              {current.reasons?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {current.reasons.map((r: string) => (
                    <span
                      key={r}
                      className="rounded-full border border-accent/25 bg-accent/[0.07] px-2.5 py-1 text-xs font-medium text-accent"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              )}
              {current.voice_card && (
                <audio controls src={current.voice_card} className="w-full" preload="none">
                  {tk.voiceIntro}
                </audio>
              )}
              {revealMore && (current.music?.length > 0 || current.zodiac) && (
                <div className="space-y-2 animate-fade-up">
                  {current.music?.length > 0 && (
                    <p className="text-sm text-muted">{tk.musicLabel} · {current.music.join(", ")}</p>
                  )}
                  {current.zodiac && <Badge>{current.zodiac}{tk.zodiacSuffix}</Badge>}
                </div>
              )}
            </div>
          )}

          {/* Günün Sorusu — Stitch sırası: kart → günün sorusu → aksiyonlar */}
          <div className="mt-5">
            <DailyQuestion />
          </div>

          {superMsg && (
            <p className="mt-4 rounded-2xl bg-accent/10 px-3 py-2 text-center text-xs text-accent">{superMsg}</p>
          )}

          {/* Aksiyonlar — Stitch referans: ✕ geç · ⭐ özel/süper (altın dolu, orta) · ♥ beğen */}
          <div className="mt-5 flex items-center justify-center gap-6">
            <button
              onClick={gec}
              aria-label={tk.ariaPass}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[#151318] text-text/70 transition hover:border-white/25 hover:text-text active:scale-90"
            >
              <X size={26} strokeWidth={2.2} />
            </button>
            <button
              onClick={superBegen}
              aria-label={tk.ariaSuper}
              className="flex h-14 w-14 items-center justify-center rounded-full text-[#1c1407] shadow-[0_14px_36px_-10px_rgba(199,169,119,0.5)] transition hover:brightness-105 active:scale-90"
              style={{ background: "linear-gradient(150deg,#DBBF8E,#C7A977 55%,#b2945f)" }}
            >
              <Star size={26} fill="currentColor" strokeWidth={0} />
            </button>
            <button
              onClick={() => act("tanis")}
              aria-label={tk.ariaLike}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 bg-accent/[0.10] text-accent transition hover:bg-accent/20 active:scale-90"
            >
              <Heart size={26} fill="currentColor" strokeWidth={0} />
            </button>
          </div>

          {/* İkincil ilgi sinyalleri */}
          <div className="mt-4 flex justify-center gap-2">
            <button onClick={() => act("ilginc")} className="rounded-full border border-border px-3.5 py-1.5 text-xs text-muted transition hover:border-accent/60">
              {tk.interesting}
            </button>
            <button onClick={() => act("ortak")} className="rounded-full border border-border px-3.5 py-1.5 text-xs text-muted transition hover:border-accent/60">
              {tk.inCommon}
            </button>
          </div>
          </div>

          {/* Masaüstü sağ panel — sıradaki profiller önizleme kuyruğu (dekoratif, gerçek deste indeksini değiştirmez) */}
          <aside className="hidden lg:sticky lg:top-6 lg:col-start-3 lg:row-start-1 lg:flex lg:flex-col lg:gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{tk.title} · {tk.chipYeni}</p>
            {upNext.length > 0 ? (
              upNext.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-2.5 transition hover:border-accent/40"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-elevated">
                    {c.photos?.[0] ? (
                      <img src={c.photos[0]} className="h-full w-full scale-110 object-cover blur-md" alt="" />
                    ) : (
                      <div className="brand-gradient h-full w-full opacity-30" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-text">
                      {c.name}
                      {c.age ? `, ${c.age}` : ""}
                    </p>
                    <p className="truncate text-[11px] text-muted">
                      {c.city || (c.online ? tk.online : "")}
                    </p>
                  </div>
                  {c.ortakYuzde != null && (
                    <span className="shrink-0 text-[11px] font-semibold text-accent">%{c.ortakYuzde}</span>
                  )}
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted">
                {tk.emptyDefault}
              </p>
            )}
          </aside>
        </>
      )}

      </div>

      {/* Eşleşme popup */}
      <AnimatePresence>
        {matchPop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-8"
            onClick={() => setMatchPop(null)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-surface p-8 text-center"
            >
              <div
                className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-brand/20 blur-3xl"
                aria-hidden
              />

              <div className="relative mx-auto mb-5 w-fit">
                <div className={`rounded-full ${tierFrame(matchPop.tier)}`}>
                  <div className="brand-gradient flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white">
                    {matchPop.name?.[0]?.toUpperCase() || "?"}
                  </div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 320, damping: 16 }}
                  className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white ring-4 ring-surface"
                >
                  <Heart size={16} fill="currentColor" />
                </motion.div>
              </div>

              <p className="t-caption font-semibold uppercase tracking-[0.18em] text-brand">{tk.matchEyebrow}</p>
              <h3 className="mt-1 text-2xl font-bold">{tk.matchedWith.replace("{name}", matchPop.name)}</h3>
              <p className="mt-2 text-sm text-muted">
                {tk.matchDesc}
              </p>

              <button
                onClick={() => router.push(`/sohbet/${matchPop.matchId}`)}
                className="brand-gradient mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold"
              >
                <Send size={16} /> {tk.startChat}
              </button>
              <button
                onClick={() => setMatchPop(null)}
                className="mt-3 text-sm text-muted transition hover:text-text"
              >
                {tk.keepDiscovering}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DiscoveryFilters
        open={filtersOpen}
        initial={filter}
        myCity={meta?.sehir || null}
        onClose={() => setFiltersOpen(false)}
        onApply={applyFilter}
      />
    </div>
  );
}
