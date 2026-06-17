"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles, Heart, Send, Search, BadgeCheck, MapPin, Briefcase, X, Zap,
  SlidersHorizontal, Flame, LayoutGrid, List, RefreshCw, Star, RotateCcw, Gift, Lock, Gamepad2,
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
  const photo = current?.photos?.[0];
  const kmText = kmLabel(filter.km);
  const kmNum = filter.km !== "all" ? parseInt(filter.km, 10) : null;

  return (
    <div className="px-5 pt-[calc(env(safe-area-inset-top)+18px)]">
      <WelcomeTour />
      <header className="mb-4 flex items-center justify-between">
        <Link href="/magaza" aria-label={tk.giftStore} className="flex h-11 w-11 items-center justify-center rounded-full border border-accent/25 bg-[#151318] font-display text-[26px] font-semibold text-accent shadow-[0_12px_30px_-18px_rgba(0,0,0,0.9)]">
          A
        </Link>
        <h1 className="font-display text-[25px] font-bold tracking-[-0.03em]">{tk.title}</h1>
        <div className="flex items-center gap-4 text-muted">
          <Link href="/oyun" aria-label={tk.gameRoom} className="transition hover:text-text">
            <Gamepad2 size={20} strokeWidth={1.7} />
          </Link>
          <button onClick={() => setFiltersOpen(true)} aria-label={tk.filter} className="transition hover:text-text">
            <SlidersHorizontal size={20} strokeWidth={1.7} />
          </button>
        </div>
      </header>

      {/* Hızlı çipler — mockup: Tümü / Yakınında / Online / Yeni / Popüler */}
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

      <div className="mb-4">
        <DailyQuestion />
      </div>

      {loading && (
        <div className="overflow-hidden rounded-3xl border border-border bg-surface">
          <div className="shimmer h-56 w-full" />
          <div className="space-y-3 p-5">
            <div className="shimmer h-7 w-2/3 rounded-lg" />
            <div className="shimmer h-4 w-1/2 rounded" />
            <div className="shimmer h-4 w-full rounded" />
            <div className="flex gap-2">
              <div className="shimmer h-7 w-16 rounded-full" />
              <div className="shimmer h-7 w-20 rounded-full" />
              <div className="shimmer h-7 w-14 rounded-full" />
            </div>
          </div>
        </div>
      )}

      {!loading && !current && (
        <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
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
          {kmNum && (
            <p className="mb-3 flex items-center gap-1.5 text-xs text-muted">
              <MapPin size={13} strokeWidth={1.6} />
              {current.priority ? `${tk.nearArea} · 0–${kmNum} km` : `${tk.farArea} · ${kmNum}+ km`}
            </p>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.98 }}
              transition={{ duration: 0.28 }}
              className={`overflow-hidden rounded-[28px] ahenk-photo-card ${tierCard(current.tier)} ${tierGlow(
                current.tier
              )}`}
            >
              <div className="relative aspect-[4/5] w-full bg-elevated">
                {photo ? (
                  <img src={photo} className={`h-full w-full object-cover ${blur} scale-110`} alt="" />
                ) : (
                  <div className="brand-gradient h-full w-full opacity-30" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/10 to-black/20" />

                {/* Uyum skoru — altın progress halkası (premium) */}
                <div className="absolute left-3 top-3 flex h-[58px] w-[58px] items-center justify-center rounded-full bg-black/45 backdrop-blur-md">
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36" aria-hidden>
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" />
                    <circle
                      cx="18" cy="18" r="15.5" fill="none" stroke="#C7A977" strokeWidth="2.5" strokeLinecap="round"
                      strokeDasharray={`${Math.max(0, Math.min(100, current.ortakYuzde ?? 0)) * 0.974} 97.4`}
                    />
                  </svg>
                  <div className="text-center leading-none">
                    <span className="block text-[13px] font-bold text-accent">%{current.ortakYuzde}</span>
                    <span className="block text-[7px] uppercase tracking-[0.12em] text-white/55">{tk.match}</span>
                  </div>
                </div>

                {/* Sağ üst: yeni üye / vibe / öne çıkan */}
                <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
                  {current.isNew && (
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-black">{tk.newMember}</span>
                  )}
                  {current.boosted && (
                    <span className="flex items-center gap-1 rounded-full bg-accent/90 px-2.5 py-1 text-[11px] font-semibold text-black">
                      <Zap size={11} /> {tk.featured}
                    </span>
                  )}
                  {current.vibe && (
                    <span className="rounded-full bg-black/45 px-2.5 py-1 text-xs text-white backdrop-blur-md">
                      {current.vibe.label}
                    </span>
                  )}
                </div>

                {/* Alt overlay: isim · doğrulama · konum · online */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <Link href={`/u/${current.id}`} className="flex items-center gap-2">
                    <h2 className="font-display text-[30px] font-semibold leading-none text-white drop-shadow-sm">
                      {current.name}<span className="font-normal text-white/80">{current.age ? `, ${current.age}` : ""}</span>
                    </h2>
                    {current.is_verified && <BadgeCheck className="text-sky-400" size={20} />}
                  </Link>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80">
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
                  {!revealMore && (
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-white/50">
                      <Lock size={11} strokeWidth={1.8} /> {tk.photoReveal}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4 p-5">
                {(current.profession || current.tier !== "free") && (
                  <div className="flex flex-wrap items-center gap-2">
                    {current.profession && (
                      <span className="flex items-center gap-1.5 text-sm text-muted">
                        <Briefcase size={14} /> {current.profession}
                      </span>
                    )}
                    <span className="ml-auto flex items-center gap-2">
                      <PremiumBadge tier={current.tier} />
                      {(current.tier === "platinum" || current.tier === "legend") && (
                        <VipTag tier={current.tier} />
                      )}
                    </span>
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

                {current.bio && <p className="text-sm leading-relaxed text-text/90">{current.bio}</p>}

                {current.interests?.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted">{tk.interests}</p>
                    <div className="flex flex-wrap gap-2">
                      {current.interests.map((it: string) => (
                        <span key={it} className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-sm text-text/80">{it}</span>
                      ))}
                    </div>
                  </div>
                )}

                {revealMore && (
                  <div className="space-y-3 animate-fade-up">
                    {current.music?.length > 0 && (
                      <p className="text-sm text-muted">{tk.musicLabel} · {current.music.join(", ")}</p>
                    )}
                    {current.zodiac && <Badge>{current.zodiac}{tk.zodiacSuffix}</Badge>}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {superMsg && (
            <p className="mt-4 rounded-2xl bg-accent/10 px-3 py-2 text-center text-xs text-accent">{superMsg}</p>
          )}

          {/* Aksiyonlar — mockup birebir: altın geri · kırmızı geç · pembe beğen · mor süper */}
          <div className="mt-6 flex items-center justify-center gap-5">
            <button
              onClick={() => act("daha_fazla")}
              aria-label={tk.ariaRewind}
              className="flex items-center justify-center rounded-full border border-white/10 bg-[#151318] text-accent shadow-[0_10px_30px_-12px_rgba(0,0,0,0.9)] transition hover:border-accent/40 active:scale-90"
              style={{ height: 52, width: 52 }}
            >
              <RotateCcw size={22} strokeWidth={1.9} />
            </button>
            <button
              onClick={gec}
              aria-label={tk.ariaPass}
              className="flex items-center justify-center rounded-full border border-white/10 bg-[#151318] text-text/70 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.9)] transition hover:border-white/25 hover:text-text active:scale-90"
              style={{ height: 60, width: 60 }}
            >
              <X size={26} strokeWidth={2.2} />
            </button>
            <button
              onClick={() => act("tanis")}
              aria-label={tk.ariaLike}
              className="flex items-center justify-center rounded-full text-[#1c1407] shadow-[0_14px_36px_-10px_rgba(199,169,119,0.5)] transition hover:brightness-105 active:scale-90"
              style={{ height: 68, width: 68, background: "linear-gradient(150deg,#DBBF8E,#C7A977 55%,#b2945f)" }}
            >
              <Heart size={30} fill="currentColor" strokeWidth={0} />
            </button>
            <button
              onClick={superBegen}
              aria-label={tk.ariaSuper}
              className="flex items-center justify-center rounded-full border border-accent/35 bg-accent/[0.12] text-accent shadow-[0_10px_30px_-12px_rgba(199,169,119,0.35)] transition hover:bg-accent/20 active:scale-90"
              style={{ height: 60, width: 60 }}
            >
              <Star size={26} fill="currentColor" strokeWidth={0} />
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
        </>
      )}

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
