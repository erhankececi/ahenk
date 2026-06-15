"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PREMIUM_FEATURES, PREMIUM_PLUS_FEATURES } from "@/lib/constants";
import { isActivePremium } from "@/lib/plans";
import {
  isNativeApp,
  initPurchases,
  getStorePackages,
  purchase,
  restorePurchases,
  type StorePackage,
} from "@/lib/purchases";
import { Crown, Check, Sparkles, Smartphone, RefreshCw, Gem, Coins, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui";
import { tierCard, tierName, VipTag } from "@/components/PremiumBadge";

const LEGEND_FEATURES = [
  { title: "Black Diamond profil", desc: "Siyah elmas kart + LEGEND rozeti" },
  { title: "En üst görünürlük", desc: "Keşfet ve akışta en önde" },
  { title: "1080p + VIP arama", desc: "Öncelikli bağlantı kalitesi" },
  { title: "Özel sohbet teması", desc: "Animasyonlu isim etiketi + VIP balon" },
  { title: "Tüm Premium Plus ayrıcalıkları", desc: "ve fazlası" },
];

const TIERS = [
  { plan: "plus", label: "Plus", Icon: Crown, features: PREMIUM_FEATURES },
  { plan: "platinum", label: "Premium Plus", Icon: Sparkles, features: PREMIUM_PLUS_FEATURES },
  { plan: "legend", label: "Legend", Icon: Gem, features: LEGEND_FEATURES },
] as const;

const COMPARE_COLS = [
  { key: "free", label: "Free" },
  { key: "plus", label: "Plus" },
  { key: "gold", label: "Premium" },
  { key: "platinum", label: "Premium+" },
  { key: "legend", label: "Legend" },
];

const COMPARE_ROWS: { feat: string; on: string[] }[] = [
  { feat: "Sınırsız keşif", on: ["plus", "gold", "platinum", "legend"] },
  { feat: "Kimler ziyaret etti", on: ["plus", "gold", "platinum", "legend"] },
  { feat: "Gelişmiş filtreler", on: ["plus", "gold", "platinum", "legend"] },
  { feat: "Profil öne çıkarma", on: ["plus", "gold", "platinum", "legend"] },
  { feat: "Gizli mod", on: ["plus", "gold", "platinum", "legend"] },
  { feat: "Profil temaları", on: ["plus", "gold", "platinum", "legend"] },
  { feat: "Sesli görüşme", on: ["plus", "gold", "platinum", "legend"] },
  { feat: "Görüntülü görüşme (HD)", on: ["gold", "platinum", "legend"] },
  { feat: "1080p + VIP arama", on: ["platinum", "legend"] },
  { feat: "Öncelikli görünürlük", on: ["platinum", "legend"] },
  { feat: "Black Diamond profil + LEGEND", on: ["legend"] },
];

export default function Premium() {
  const supabase = createClient();
  const [native, setNative] = useState(false);
  const [packages, setPackages] = useState<StorePackage[]>([]);
  const [plan, setPlan] = useState<string>("free");
  const [until, setUntil] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [memberNo, setMemberNo] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: p } = await supabase
      .from("profiles")
      .select("premium_plan, premium_until, name, member_no")
      .eq("id", user.id)
      .single();
    setPlan(p?.premium_plan || "free");
    setUntil(p?.premium_until || null);
    setName(p?.name || "");
    setMemberNo(p?.member_no ?? null);
    if (isNativeApp()) {
      setNative(true);
      await initPurchases(user.id);
      setPackages(await getStorePackages());
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function abone(pkg: StorePackage) {
    setBusy(pkg.id);
    setMsg(null);
    const r = await purchase(pkg);
    setBusy(null);
    if (r.ok) {
      setMsg({ ok: true, text: "Satın alma alındı. Aboneliğin birkaç saniye içinde aktifleşecek." });
      setTimeout(load, 4000);
    } else if (r.error === "cancelled") {
      setMsg({ ok: false, text: "Satın alma iptal edildi." });
    } else {
      setMsg({ ok: false, text: "Satın alma başarısız, tekrar dene." });
    }
  }

  const aktif = isActivePremium({ premium_plan: plan, premium_until: until });
  const tierLabel = plan === "legend" ? "Legend" : plan === "platinum" ? "Premium+" : plan === "gold" ? "Premium" : aktif ? "Plus" : "Standart";

  // Kart malzemesi — Amex Black / Apple Card / Raya hissi
  const cardBg =
    plan === "legend"
      ? "linear-gradient(150deg,#181717,#050506 74%)"
      : plan === "platinum"
        ? "linear-gradient(150deg,#1b1710,#070605 74%)"
        : plan === "gold"
          ? "linear-gradient(150deg,#211a0e,#080706 74%)"
          : "linear-gradient(150deg,#17151a,#070608 74%)";

  return (
    <div className="lp-page min-h-dvh px-4 pb-28 pt-5">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Ahenk üyelik</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-text">Premium</h1>
          </div>

          <Link href="/cuzdan" className="lp-chip hidden items-center gap-2 sm:inline-flex">
            <Coins size={14} />
            Jeton
          </Link>
        </div>

        {/* Üyelik kartı — statü, özellik değil */}
        <section className="lp-panel mb-4 overflow-hidden p-0">
          <div className="relative p-5">
            <div className="absolute right-[-90px] top-[-90px] h-56 w-56 rounded-full bg-[#C7A977]/10 blur-3xl" />
            <div className="absolute bottom-[-100px] left-[-80px] h-52 w-52 rounded-full bg-white/[0.035] blur-3xl" />

            <div
              className="relative mx-auto flex aspect-[1.6/1] max-w-[420px] flex-col justify-between overflow-hidden rounded-[1.8rem] border border-[#C7A977]/30 p-5 shadow-[0_28px_100px_rgba(0,0,0,0.48)]"
              style={{ background: cardBg }}
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#C7A977]/45" />
              <span
                className="pointer-events-none absolute inset-0 opacity-80"
                style={{
                  background:
                    "linear-gradient(115deg, transparent 38%, rgba(199,169,119,0.10) 48%, transparent 60%)",
                }}
              />
              <span className="pointer-events-none absolute right-5 top-5 h-24 w-24 rounded-full border border-[#C7A977]/10" />
              <span className="pointer-events-none absolute right-9 top-9 h-16 w-16 rounded-full border border-[#C7A977]/10" />

              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <span className="font-display text-base font-bold uppercase tracking-[0.32em] text-accent">
                    Ahenk
                  </span>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted">Sessiz Lüks Kulübü</p>
                </div>

                <span className="rounded-full border border-[#C7A977]/30 bg-[#C7A977]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                  {tierLabel}
                </span>
              </div>

              <div className="relative z-10 mt-1 flex h-9 w-12 items-center justify-center rounded-lg border border-[#C7A977]/25 bg-[#C7A977]/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                <div className="grid h-6 w-8 grid-cols-2 gap-1 rounded-md border border-[#C7A977]/20 p-1">
                  <span className="rounded-sm bg-[#C7A977]/35" />
                  <span className="rounded-sm bg-[#C7A977]/18" />
                  <span className="rounded-sm bg-[#C7A977]/18" />
                  <span className="rounded-sm bg-[#C7A977]/35" />
                </div>
              </div>

              <div className="relative z-10 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted">Üye</p>
                  <p className="truncate font-display text-lg font-semibold text-text">{name || "Ahenk Üyesi"}</p>
                </div>
                <p className="shrink-0 font-mono text-xs tracking-widest text-muted">
                  {memberNo ? `AHK ${String(memberNo).padStart(4, "0").slice(-4)}` : "AHK 0000"}
                </p>
              </div>
            </div>

            <p className="mt-4 text-center text-sm leading-6 text-muted">
              {aktif
                ? `Aktif · ${tierLabel}${until ? ` · bitiş ${new Date(until).toLocaleDateString("tr-TR")}` : ""}`
                : "Statünü yükselt. Daha görünür, daha ayrıcalıklı ve daha sakin bir Ahenk deneyimi."}
            </p>
          </div>
        </section>

        {/* Web'de jeton köprüsü — IAP yalnız native; web kullanıcısı çıkmaza düşmesin. */}
        {!native && (
          <Link href="/cuzdan" className="lp-panel-hover mb-5 flex items-center gap-3 px-4 py-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#C7A977]/30 bg-[#C7A977]/10 text-accent">
              <Coins size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-text">Jetonla hemen Premium aç</p>
              <p className="text-xs leading-5 text-muted">
                Görev yap, jeton kazan; 1 gün / 1 hafta Premium ya da Boost aç.
              </p>
            </div>
            <ChevronRight size={18} className="shrink-0 text-muted" />
          </Link>
        )}

        {/* Planlar */}
        <section className="mb-5">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold text-text">Üyelik paketleri</p>
              <p className="mt-0.5 text-xs text-muted">Ahenk içindeki görünürlüğünü ve deneyimini yükselt</p>
            </div>
            <Crown size={18} className="text-accent" />
          </div>

          <div className="space-y-4">
            {TIERS.map((tier) => {
              const pkg = packages.find((p) => p.plan === tier.plan);
              const buColumn = plan === tier.plan && aktif;
              const legacyTierClass = tierCard(tier.plan);

              return (
                <div
                  key={tier.plan}
                  data-tier-class={legacyTierClass}
                  className={`lp-panel-hover relative overflow-hidden p-0 ${
                    tier.plan === "legend" ? "border-[#C7A977]/45" : ""
                  }`}
                >
                  <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#C7A977]/8 blur-3xl" />
                  <div className="relative p-4">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#C7A977]/30 bg-[#C7A977]/10 text-accent shadow-[0_16px_60px_rgba(199,169,119,0.09)]">
                          <tier.Icon size={21} />
                        </div>

                        <div>
                          <p className="flex flex-wrap items-center gap-2 font-semibold text-text">
                            <span className={tierName(tier.plan) || ""}>{tier.label}</span>
                            {tier.plan === "legend" && <VipTag tier="legend" />}
                          </p>
                          <p className="mt-0.5 text-xs text-muted">
                            {tier.plan === "plus"
                              ? "Temel ayrıcalıklar ve görünürlük"
                              : tier.plan === "platinum"
                                ? "Daha güçlü keşif ve yüksek kalite"
                                : "Ahenk’in en özel kulüp deneyimi"}
                          </p>
                        </div>
                      </div>

                      {buColumn && (
                        <span className="shrink-0 rounded-full border border-[#C7A977]/30 bg-[#C7A977]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
                          Aktif
                        </span>
                      )}
                    </div>

                    <div className="mb-4 grid gap-2">
                      {tier.features.map((f) => (
                        <div key={f.title} className="flex items-start gap-2.5 rounded-2xl border border-white/10 bg-[#0E0D10]/55 p-3">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#C7A977]/30 bg-[#C7A977]/10 text-accent">
                            <Check size={12} />
                          </span>
                          <div>
                            <p className="text-sm font-medium text-text">{f.title}</p>
                            <p className="mt-0.5 text-xs leading-5 text-muted">{f.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {buColumn ? (
                      <div className="rounded-2xl border border-[#C7A977]/30 bg-[#C7A977]/10 py-3 text-center text-sm font-semibold text-accent">
                        Bu plan aktif
                      </div>
                    ) : native ? (
                      pkg ? (
                        <Button
                          full
                          variant="outline"
                          onClick={() => abone(pkg)}
                          disabled={busy === pkg.id}
                          className="lp-cta-gold border-[#C7A977]/35 text-[#0E0D10]"
                        >
                          {busy === pkg.id ? "İşleniyor…" : `Abone ol — ${pkg.priceString}`}
                        </Button>
                      ) : (
                        <div className="rounded-2xl border border-white/10 bg-[#0E0D10]/60 py-3 text-center text-sm text-muted">
                          Şu an uygun değil
                        </div>
                      )
                    ) : (
                      <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0E0D10]/60 py-3 text-center text-sm text-muted">
                        <Smartphone size={15} /> Mobil uygulamadan abone ol
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Planları karşılaştır */}
        <section className="lp-panel mb-5 p-0">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
            <div>
              <h2 className="text-sm font-semibold text-text">Planları karşılaştır</h2>
              <p className="mt-0.5 text-xs text-muted">Her plan bir öncekinin tüm ayrıcalıklarını kapsar.</p>
            </div>
            <Sparkles size={17} className="text-accent" />
          </div>

          <div className="no-scrollbar overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-[#0E0D10]/65">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    Özellik
                  </th>
                  {COMPARE_COLS.map((c) => (
                    <th key={c.key} className="px-2 py-3 text-center text-xs font-semibold text-text">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((r, i) => (
                  <tr key={i} className="border-b border-white/10 last:border-0">
                    <td className="px-4 py-3 text-left text-text">{r.feat}</td>
                    {COMPARE_COLS.map((c) => (
                      <td key={c.key} className="px-2 py-3 text-center">
                        {r.on.includes(c.key) ? (
                          <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full border border-[#C7A977]/30 bg-[#C7A977]/10 text-accent">
                            <Check size={13} />
                          </span>
                        ) : (
                          <span className="text-muted/35">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {msg && (
          <p
            className={`mb-5 rounded-[1.4rem] border px-4 py-3 text-sm leading-6 shadow-[0_18px_70px_rgba(0,0,0,0.20)] ${
              msg.ok
                ? "border-[#C7A977]/30 bg-[#C7A977]/10 text-text"
                : "border-red-400/20 bg-red-500/10 text-red-200"
            }`}
          >
            {msg.text}
          </p>
        )}

        {native && (
          <button
            onClick={async () => {
              setMsg(null);
              const r = await restorePurchases();
              setMsg(
                r.ok
                  ? { ok: true, text: "Satın almalar geri yüklendi." }
                  : { ok: false, text: "Geri yüklenecek satın alma bulunamadı." }
              );
              load();
            }}
            className="mx-auto mt-5 flex items-center gap-1.5 rounded-full border border-white/10 bg-[#151318] px-4 py-2 text-sm text-muted transition hover:border-[#C7A977]/35 hover:text-accent"
          >
            <RefreshCw size={15} /> Satın almaları geri yükle
          </button>
        )}

        {!native && (
          <p className="mt-5 text-center text-xs leading-5 text-muted">
            Abonelikler güvenli şekilde App Store / Google Play üzerinden yönetilir. Web tarafında jetonla günlük veya haftalık Premium açabilirsin.
          </p>
        )}
      </div>
    </div>
  );
}
