"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles, Heart, Send, Search, BadgeCheck, MapPin, Briefcase, X, Zap,
  SlidersHorizontal, Flame, LayoutGrid, List, RefreshCw, Star, RotateCcw, Gift, Lock,
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
    { id: "tumu", label: "Tümü", sort: "smart" as const },
    { id: "yakin", label: "Yakınında", sort: "near" as const },
    { id: "online", label: "Online", sort: null },
    { id: "yeni", label: "Yeni", sort: "new" as const },
    { id: "populer", label: "Popüler", sort: "active" as const },
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
  const kmNum = filter.km !== "all" ? parseInt(filter.km, 10) : null;

  return (
    <div className="px-4 pt-6">
      <WelcomeTour />
      <header className="mb-4 flex items-center justify-between">
        <Link href="/magaza" aria-label="Hediye Mağazası" className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-2 to-brand font-display text-base font-bold text-[#1c1407] ring-1 ring-accent/30">
          A
        </Link>
        <h1 className="font-display text-xl font-bold tracking-tight">Keşfet</h1>
        <button onClick={() => setFiltersOpen(true)} aria-label="Filtre" className="text-muted transition hover:text-text">
          <SlidersHorizontal size={20} strokeWidth={1.7} />
        </button>
      </header>

      {/* Hızlı çipler — mockup: Tümü / Yakınında / Online / Yeni / Popüler */}
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {CHIPS.map((c) => (
          <button
            key={c.id}
            onClick={() => selectChip(c)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
              chip === c.id ? "bg-elevated text-text ring-1 ring-border" : "text-muted hover:text-text"
            }`}
          >
            {c.label}
          </button>
        ))}
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
          <h2 className="font-display text-xl font-semibold">Şimdilik bu kadar</h2>
          <p className="mt-2 text-muted">
            {filter.cities.length || filter.verified || filter.minAge > 18 || filter.maxAge < 60
              ? "Şehir, yaş veya doğrulama filtreni gevşet — mesafe artık kimseyi gizlemiyor, sadece sıralıyor."
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

      {current && (
        <>
          {kmNum && (
            <p className="mb-3 flex items-center gap-1.5 text-xs text-muted">
              <MapPin size={13} strokeWidth={1.6} />
              {current.priority ? `Öncelikli alan · 0–${kmNum} km` : `Daha uzaktakiler · ${kmNum} km üstü`}
            </p>
          )}
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
              <div className="relative aspect-[4/5] w-full bg-elevated">
                {photo ? (
                  <img src={photo} className={`h-full w-full object-cover ${blur} scale-110`} alt="" />
                ) : (
                  <div className="brand-gradient h-full w-full opacity-30" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/15" />

                {/* Uyum rozeti */}
                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 backdrop-blur-md">
                  <span className="text-[10px] uppercase tracking-wider text-white/70">Uyum</span>
                  <span className="text-sm font-bold text-accent">%{current.ortakYuzde}</span>
                </div>

                {/* Sağ üst: yeni üye / vibe / öne çıkan */}
                <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
                  {current.isNew && (
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-black">Yeni üye</span>
                  )}
                  {current.boosted && (
                    <span className="flex items-center gap-1 rounded-full bg-accent/90 px-2.5 py-1 text-[11px] font-semibold text-black">
                      <Zap size={11} /> Öne çıkan
                    </span>
                  )}
                  {current.vibe && (
                    <span className="rounded-full bg-black/45 px-2.5 py-1 text-xs text-white backdrop-blur-md">
                      <span className="mr-1">{current.vibe.emoji}</span>{current.vibe.label}
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
                          (current.sameCity || current.mesafe === 0 ? " · yakınında" : ` · ${current.mesafe} km`)}
                      </span>
                    )}
                    {current.online && (
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" /> Online
                      </span>
                    )}
                  </div>
                  {!revealMore && (
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-white/50">
                      <Lock size={11} strokeWidth={1.8} /> Fotoğraf sohbet ilerledikçe netleşir
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
                        className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-text/80"
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
                      <p className="text-sm text-muted">Müzik · {current.music.join(", ")}</p>
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

          {/* Aksiyonlar — mockup birebir: altın geri · kırmızı geç · pembe beğen · mor süper */}
          <div className="mt-6 flex items-center justify-center gap-5">
            <button
              onClick={() => act("daha_fazla")}
              aria-label="Geri al"
              className="flex h-13 w-13 items-center justify-center rounded-full bg-elevated text-amber-400 shadow-card transition hover:brightness-110 active:scale-90"
              style={{ height: 52, width: 52 }}
            >
              <RotateCcw size={22} strokeWidth={2} />
            </button>
            <button
              onClick={gec}
              aria-label="Geç"
              className="flex items-center justify-center rounded-full bg-elevated text-rose-500 shadow-card transition hover:brightness-110 active:scale-90"
              style={{ height: 60, width: 60 }}
            >
              <X size={26} strokeWidth={2.4} />
            </button>
            <button
              onClick={() => act("tanis")}
              aria-label="Beğen"
              className="flex items-center justify-center rounded-full text-white shadow-[0_12px_30px_-8px_rgba(236,72,120,0.55)] transition hover:brightness-110 active:scale-90"
              style={{ height: 68, width: 68, background: "linear-gradient(150deg,#FF5C8A,#E63973)" }}
            >
              <Heart size={30} fill="currentColor" strokeWidth={0} />
            </button>
            <button
              onClick={superBegen}
              aria-label="Süper beğen"
              className="flex items-center justify-center rounded-full text-white shadow-[0_12px_30px_-8px_rgba(124,92,246,0.55)] transition hover:brightness-110 active:scale-90"
              style={{ height: 60, width: 60, background: "linear-gradient(150deg,#7C5CF6,#5B43D6)" }}
            >
              <Star size={26} fill="currentColor" strokeWidth={0} />
            </button>
          </div>

          {/* İkincil ilgi sinyalleri */}
          <div className="mt-4 flex justify-center gap-2">
            <button onClick={() => act("ilginc")} className="rounded-full border border-border px-3.5 py-1.5 text-xs text-muted transition hover:border-accent/60">
              İlginç geldi
            </button>
            <button onClick={() => act("ortak")} className="rounded-full border border-border px-3.5 py-1.5 text-xs text-muted transition hover:border-accent/60">
              Ortak yönler
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
