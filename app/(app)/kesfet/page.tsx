"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles, Heart, Send, Search, BadgeCheck, MapPin, Briefcase, X, Zap,
  SlidersHorizontal, Flame, LayoutGrid, List, RefreshCw, Star,
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

const ACTIONS = [
  { type: "daha_fazla", label: "Daha fazla", icon: Search },
  { type: "ilginc", label: "İlginç geldi", icon: Sparkles },
  { type: "ortak", label: "Ortak yönler", icon: Heart },
  { type: "tanis", label: "Tanışmak isterim", icon: Send },
];

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

  const current = cands[i];
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
        data?.error === "insufficient"
          ? "Bugünkü ücretsiz süper beğenini kullandın. Bir tane daha için 30 jeton gerekli."
          : "Süper beğeni gönderilemedi, tekrar dene."
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
      setMatchPop({ name: c?.name || "Biri", matchId: data.matchId, tier: c?.tier });
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

  return (
    <div className="px-4 pt-6">
      <WelcomeTour />
      <header className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold brand-text">Keşfet</h1>
        <button
          onClick={() => setFiltersOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium transition hover:border-brand"
        >
          <SlidersHorizontal size={15} /> Filtre
        </button>
      </header>

      {tab === "profiller" && (
        <div className="mb-3">
          <DailyQuestion />
        </div>
      )}

      {/* İstatistik + aktif filtre rozetleri */}
      {tab === "profiller" && meta && (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-elevated px-2.5 py-1 font-medium">
            {meta.count} kişi
          </span>
          {meta.online > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> {meta.online} online
            </span>
          )}
          <span className="flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 font-medium text-brand">
            <MapPin size={12} /> {kmText}
          </span>
          {filter.cities.map((c) => (
            <span key={c} className="rounded-full bg-brand/10 px-2.5 py-1 font-medium text-brand">
              {c}
            </span>
          ))}
          {meta.trendVibes[0] && (
            <span className="flex items-center gap-1 rounded-full bg-elevated px-2.5 py-1 text-muted">
              <Flame size={12} className="text-accent" /> {meta.trendVibes[0].label}
            </span>
          )}
        </div>
      )}

      <StoriesBar />

      <div className="mb-4 flex gap-2 rounded-2xl bg-elevated p-1">
        {(["profiller", "anlar"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${
              tab === t ? "brand-gradient text-white" : "text-muted"
            }`}
          >
            {t === "profiller" ? "Profiller" : "Anlar"}
          </button>
        ))}
      </div>

      {tab === "anlar" && <MomentsFeed />}

      {tab === "profiller" && !loading && cands.length > 0 && (
        <div className="mb-4 flex justify-end">
          <div className="flex gap-1 rounded-full border border-border bg-surface p-1">
            <button
              onClick={() => setView("kart")}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                view === "kart" ? "bg-brand text-white" : "text-muted"
              }`}
            >
              <LayoutGrid size={14} /> Kart
            </button>
            <button
              onClick={() => setView("liste")}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                view === "liste" ? "bg-brand text-white" : "text-muted"
              }`}
            >
              <List size={14} /> Liste
            </button>
          </div>
        </div>
      )}

      {tab === "profiller" && view === "liste" && !loading && cands.length > 0 && (
        <DiscoveryList
          cands={cands}
          onAction={(id) => interactWith(id, "tanis")}
          onOpen={(idx) => {
            setI(idx);
            setRevealMore(false);
            setView("kart");
            if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {tab === "profiller" && loading && (
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

      {tab === "profiller" && view === "kart" && !loading && gunun && (
        <div className="mb-4 rounded-3xl border border-brand/30 bg-gradient-to-br from-brand/10 to-accent/5 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
            <Sparkles size={13} /> Senin için seçtik
          </p>
          <div className="flex items-center gap-3">
            <Link href={`/u/${gunun.id}`} className={`rounded-2xl ${tierFrame(gunun.tier)}`}>
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-elevated">
                {gunun.photos?.[0] ? (
                  <img src={gunun.photos[0]} className="h-full w-full scale-110 object-cover blur-lg" alt="" />
                ) : (
                  <div className="brand-gradient h-full w-full opacity-30" />
                )}
              </div>
            </Link>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {gunun.name}
                {gunun.age ? `, ${gunun.age}` : ""}
              </p>
              <p className="text-xs text-muted">
                %{gunun.ortakYuzde} ahenk uyumu{gunun.sameCity ? " · yakınında" : ""}
              </p>
            </div>
            <button
              onClick={() => interactWith(gunun.id, "tanis")}
              className="brand-gradient shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-white"
            >
              Tanış
            </button>
          </div>
        </div>
      )}

      {tab === "profiller" && view === "kart" && !loading && !current && (
        <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
          <Sparkles className="mb-4 text-brand" size={40} />
          <h2 className="text-xl font-semibold">Şimdilik bu kadar</h2>
          <p className="mt-2 text-muted">
            {filter.km !== "all" || filter.cities.length
              ? "Filtreni genişlet — mesafeyi artır veya şehir filtresini kaldır."
              : "Yeni profiller geldikçe burada görünecek. Profilini zenginleştir, daha çok kişiye öneril."}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {filter.km !== "all" || filter.cities.length > 0 ? (
              <button
                onClick={() => applyFilter(DEFAULT_FILTER)}
                className="rounded-2xl border border-border px-4 py-2 text-sm font-medium transition hover:border-brand"
              >
                Filtreyi sıfırla
              </button>
            ) : (
              <Link
                href="/onboarding"
                className="rounded-2xl border border-border px-4 py-2 text-sm font-medium transition hover:border-brand"
              >
                Profilini zenginleştir
              </Link>
            )}
            <button
              onClick={() => yukle(filter)}
              className="brand-gradient inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-semibold text-white"
            >
              <RefreshCw size={15} /> Yenile
            </button>
          </div>
        </div>
      )}

      {tab === "profiller" && view === "kart" && current && (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.98 }}
              transition={{ duration: 0.28 }}
              className={`overflow-hidden rounded-3xl border bg-surface ${tierCard(current.tier)} ${tierGlow(
                current.tier
              )} ${current.tier === "free" ? "border-border" : ""}`}
            >
              <div className="relative h-56 w-full bg-elevated">
                {photo ? (
                  <img src={photo} className={`h-full w-full object-cover ${blur} scale-110`} alt="" />
                ) : (
                  <div className="brand-gradient h-full w-full opacity-30" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                <div className="absolute left-4 top-4 rounded-2xl glass px-3 py-2">
                  <p className="text-xs text-muted">Ahenk uyumu</p>
                  <p className="text-lg font-bold brand-text">%{current.ortakYuzde}</p>
                </div>
                <div className="absolute right-4 top-4 flex flex-col items-end gap-1.5">
                  {current.vibe && (
                    <div className="rounded-2xl glass px-3 py-2 text-sm">
                      <span className="mr-1">{current.vibe.emoji}</span>
                      <span className="text-xs text-text/90">{current.vibe.label}</span>
                    </div>
                  )}
                  {current.online && (
                    <span className="flex items-center gap-1 rounded-full bg-success/90 px-2 py-0.5 text-[11px] font-semibold text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" /> Online
                    </span>
                  )}
                  {current.isNew && !current.online && (
                    <span className="rounded-full bg-brand/90 px-2 py-0.5 text-[11px] font-semibold text-white">
                      Yeni
                    </span>
                  )}
                </div>
                {current.boosted && (
                  <div className="absolute left-4 top-[4.5rem] flex items-center gap-1 rounded-full bg-amber-400/90 px-2.5 py-1 text-xs font-semibold text-black shadow">
                    <Zap size={12} /> Öne çıkan
                  </div>
                )}
                {!revealMore && (
                  <p className="absolute bottom-3 right-4 text-xs text-white/80">
                    🔒 Fotoğraf sohbet ilerledikçe netleşir
                  </p>
                )}
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/u/${current.id}`}>
                      <h2 className={`flex items-center gap-1 text-2xl font-bold ${tierName(current.tier)}`}>
                        {current.name}
                        {current.age ? `, ${current.age}` : ""}
                      </h2>
                    </Link>
                    {current.is_verified && <BadgeCheck className="text-brand" size={20} />}
                    <PremiumBadge tier={current.tier} />
                    {(current.tier === "platinum" || current.tier === "legend") && (
                      <VipTag tier={current.tier} />
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted">
                    {current.city && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} /> {current.city}
                        {current.mesafe != null &&
                          (current.sameCity || current.mesafe === 0
                            ? " · yakınında"
                            : ` · ${current.mesafe} km`)}
                      </span>
                    )}
                    {current.profession && (
                      <span className="flex items-center gap-1">
                        <Briefcase size={14} /> {current.profession}
                      </span>
                    )}
                  </div>
                </div>

                {current.reasons?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {current.reasons.map((r: string) => (
                      <span
                        key={r}
                        className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                )}

                {current.voice_card && (
                  <audio controls src={current.voice_card} className="w-full" preload="none">
                    Sesli tanıtım
                  </audio>
                )}

                {current.bio && <p className="text-sm leading-relaxed text-text/90">{current.bio}</p>}

                {current.interests?.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted">İlgi alanları</p>
                    <div className="flex flex-wrap gap-2">
                      {current.interests.map((it: string) => (
                        <span key={it} className="rounded-full bg-elevated px-3 py-1 text-sm">{it}</span>
                      ))}
                    </div>
                  </div>
                )}

                {revealMore && (
                  <div className="space-y-3 animate-fade-up">
                    {current.music?.length > 0 && (
                      <p className="text-sm text-muted">🎵 {current.music.join(", ")}</p>
                    )}
                    {current.zodiac && <Badge>{current.zodiac} burcu</Badge>}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {superMsg && (
            <p className="mt-4 rounded-2xl bg-accent/10 px-3 py-2 text-center text-xs text-accent">{superMsg}</p>
          )}
          <button
            onClick={superBegen}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-brand py-3 text-sm font-semibold text-white shadow-glow transition active:scale-95"
          >
            <Star size={18} fill="currentColor" /> Süper Beğen
            <span className="text-xs font-normal text-white/80">· günde 1 ücretsiz</span>
          </button>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {ACTIONS.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => act(type)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3 text-sm font-medium transition duration-200 hover:-translate-y-0.5 hover:border-brand active:scale-95"
              >
                <Icon size={18} className="text-brand" /> {label}
              </button>
            ))}
          </div>
          <button
            onClick={gec}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-2 text-sm text-muted"
          >
            <X size={16} /> Geç
          </button>
        </>
      )}

      {tab === "profiller" && view === "kart" && !loading && cands.length > 1 && (
        <DiscoveryRails
          cands={cands}
          onPick={(idx) => {
            setI(idx);
            setRevealMore(false);
            if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
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

              <p className="t-caption font-semibold uppercase tracking-[0.18em] text-brand">Yeni Ahenk</p>
              <h3 className="mt-1 text-2xl font-bold">{matchPop.name} ile eşleştiniz</h3>
              <p className="mt-2 text-sm text-muted">
                Karşılıklı ilgi var. İlk mesajı sen at — sohbet ettikçe fotoğraf netleşir.
              </p>

              <button
                onClick={() => router.push(`/sohbet/${matchPop.matchId}`)}
                className="brand-gradient mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-white"
              >
                <Send size={16} /> Sohbete başla
              </button>
              <button
                onClick={() => setMatchPop(null)}
                className="mt-3 text-sm text-muted transition hover:text-text"
              >
                Keşfetmeye devam
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
