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
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: p } = await supabase
      .from("profiles")
      .select("premium_plan, premium_until")
      .eq("id", user.id)
      .single();
    setPlan(p?.premium_plan || "free");
    setUntil(p?.premium_until || null);
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
      setMsg({ ok: true, text: "Satın alma alındı! Aboneliğin birkaç saniye içinde aktifleşecek." });
      setTimeout(load, 4000);
    } else if (r.error === "cancelled") {
      setMsg({ ok: false, text: "Satın alma iptal edildi." });
    } else {
      setMsg({ ok: false, text: "Satın alma başarısız, tekrar dene." });
    }
  }

  const aktif = isActivePremium({ premium_plan: plan, premium_until: until });

  return (
    <div className="px-4 pb-24 pt-6">
      <div className="brand-gradient mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl">
        <Crown className="text-white" />
      </div>
      <h1 className="text-center text-2xl font-bold brand-text">Ahenk Premium</h1>
      <p className="mb-4 mt-1 text-center text-muted">Daha çok kişiye ulaş, daha derin tanış.</p>

      {/* Mevcut durum */}
      <div
        className={`mb-6 rounded-2xl border p-3 text-center text-sm ${
          aktif ? "border-brand bg-brand/10 text-brand" : "border-border bg-surface text-muted"
        }`}
      >
        {aktif
          ? `Aktif plan: ${plan === "legend" ? "Legend" : plan === "platinum" ? "Premium Plus" : plan === "gold" ? "Premium" : "Plus"}${
              until ? ` · bitiş ${new Date(until).toLocaleDateString("tr-TR")}` : ""
            }`
          : "Şu an ücretsiz plandasın"}
      </div>

      {/* Web'de jeton köprüsü — IAP yalnız native; web kullanıcısı çıkmaza düşmesin. */}
      {!native && (
        <Link
          href="/cuzdan"
          className="mb-6 flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand/5 p-4 transition hover:border-brand/50"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15">
            <Coins size={20} className="text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Jetonla hemen Premium aç</p>
            <p className="text-xs text-muted">
              Görev yap, jeton kazan; 1 gün / 1 hafta Premium ya da Boost aç — uygulama gerekmez.
            </p>
          </div>
          <ChevronRight size={18} className="shrink-0 text-muted" />
        </Link>
      )}

      {/* Planlar */}
      <div className="space-y-4">
        {TIERS.map((tier) => {
          const pkg = packages.find((p) => p.plan === tier.plan);
          const buColumn = plan === tier.plan && aktif;
          return (
            <div
              key={tier.plan}
              className={`relative overflow-hidden rounded-3xl border p-4 ${tierCard(tier.plan)}`}
            >
              <p className="relative z-10 mb-3 flex items-center gap-2 font-semibold">
                <tier.Icon size={18} className="text-[#f4e6a1]" />
                <span className={tierName(tier.plan) || "brand-text"}>{tier.label}</span>
                {tier.plan === "legend" && <VipTag tier="legend" />}
              </p>
              <div className="mb-4 space-y-2">
                {tier.features.map((f) => (
                  <div key={f.title} className="flex items-start gap-2">
                    <Check className="mt-0.5 shrink-0 text-brand" size={16} />
                    <div>
                      <p className="text-sm font-medium">{f.title}</p>
                      <p className="text-xs text-muted">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {buColumn ? (
                <div className="rounded-2xl bg-brand/15 py-2.5 text-center text-sm font-semibold text-brand">
                  Bu plan aktif ✓
                </div>
              ) : native ? (
                pkg ? (
                  <Button full onClick={() => abone(pkg)} disabled={busy === pkg.id}>
                    {busy === pkg.id ? "İşleniyor…" : `Abone ol — ${pkg.priceString}`}
                  </Button>
                ) : (
                  <div className="rounded-2xl border border-border py-2.5 text-center text-sm text-muted">
                    Şu an uygun değil
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-border py-2.5 text-center text-sm text-muted">
                  <Smartphone size={15} /> Mobil uygulamadan abone ol
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Planları karşılaştır */}
      <div className="mt-8">
        <h2 className="mb-1 text-lg font-bold">Planları karşılaştır</h2>
        <p className="mb-3 t-caption text-muted">Her plan bir öncekinin tüm ayrıcalıklarını kapsar.</p>
        <div className="no-scrollbar overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[460px] text-sm">
            <thead>
              <tr className="border-b border-border bg-elevated/60">
                <th className="px-3 py-2.5 text-left font-medium text-muted">Özellik</th>
                {COMPARE_COLS.map((c) => (
                  <th key={c.key} className="px-2 py-2.5 text-center text-xs font-semibold">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((r, i) => (
                <tr key={i} className="border-b border-border/50 last:border-0">
                  <td className="px-3 py-2.5 text-left">{r.feat}</td>
                  {COMPARE_COLS.map((c) => (
                    <td key={c.key} className="px-2 py-2.5 text-center">
                      {r.on.includes(c.key) ? (
                        <Check size={15} className="mx-auto text-brand" />
                      ) : (
                        <span className="text-muted/40">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {msg && (
        <p
          className={`mt-4 rounded-2xl px-3 py-2 text-sm ${
            msg.ok ? "bg-success/15 text-success" : "bg-error/10 text-error"
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
          className="mx-auto mt-5 flex items-center gap-1.5 text-sm text-muted"
        >
          <RefreshCw size={15} /> Satın almaları geri yükle
        </button>
      )}

      {!native && (
        <p className="mt-5 text-center t-caption text-muted">
          Abonelikler güvenli şekilde App Store / Google Play üzerinden yönetilir. Web'de satın alma yapılmaz.
        </p>
      )}
    </div>
  );
}
