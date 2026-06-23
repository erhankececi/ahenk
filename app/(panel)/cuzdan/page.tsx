import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui";
import { BuyPackageButton } from "@/components/BuyPackageButton";
import { shortDate } from "@/lib/questions";
import { Coins, Gift, Clock, ArrowDownLeft, ArrowUpRight, Wallet as WalletIcon } from "lucide-react";

export const dynamic = "force-dynamic";

const ORDER_STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Bekliyor", cls: "text-gold" },
  paid: { label: "Tamamlandı", cls: "text-success" },
  failed: { label: "Başarısız", cls: "text-danger" },
  canceled: { label: "İptal", cls: "text-muted" },
  refunded: { label: "İade", cls: "text-secondary" },
};

export default async function Wallet() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = profile?.role;

  // ---- Öğretmen / Koç cüzdanı ----
  if (role === "teacher" || role === "coach") {
    let coins = 0;
    if (role === "teacher") {
      const { data } = await supabase.from("teacher_profiles").select("coin_balance").eq("user_id", user.id).maybeSingle();
      coins = data?.coin_balance ?? 0;
    }
    const { data: txs } = await supabase.from("coin_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(12);
    return (
      <div className="space-y-5 pb-4">
        <h1 className="text-2xl font-bold">Kazanç</h1>
        <GlassCard className="p-6">
          <p className="text-xs uppercase tracking-wide text-muted">Jeton Kazancın</p>
          <p className="mt-1 flex items-center gap-2 text-4xl font-bold text-gold"><Coins size={28} /> {coins.toLocaleString("tr-TR")}</p>
        </GlassCard>
        <GlassCard className="gold-card p-5 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/12 text-gold"><WalletIcon size={24} /></span>
          <p className="mt-3 font-bold text-premium">Kazanç Çekimi</p>
          <p className="mt-1 text-sm text-muted">Banka çekimi yakında aktif olacak. Cevapladığın her soru kazancını artırır.</p>
        </GlassCard>
        <Transactions txs={txs || []} />
      </div>
    );
  }

  // ---- Öğrenci cüzdanı ----
  const { data: sp } = await supabase.from("student_profiles").select("coin_balance").eq("user_id", user.id).maybeSingle();
  const coins = sp?.coin_balance ?? 0;
  const { data: packages } = await supabase.from("coin_packages").select("*").eq("active", true).order("sort_order");
  const { data: orders } = await supabase.from("payment_orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(8);
  const { data: txs } = await supabase.from("coin_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(12);

  return (
    <div className="space-y-6 pb-4">
      <h1 className="text-2xl font-bold">Cüzdan</h1>

      {/* Bakiye */}
      <div className="glass-card overflow-hidden rounded-2xl p-6" style={{ background: "radial-gradient(120% 100% at 100% 0%, rgba(0,229,255,0.12), transparent 60%), rgba(13,20,29,0.8)" }}>
        <p className="text-xs uppercase tracking-wide text-muted">Jeton Bakiyen</p>
        <p className="mt-1 flex items-center gap-2 text-4xl font-bold text-gold"><Coins size={30} /> {coins.toLocaleString("tr-TR")}</p>
      </div>

      {/* Paketler */}
      <section>
        <h2 className="mb-3 font-bold">Jeton Paketleri</h2>
        {!packages || packages.length === 0 ? (
          <GlassCard className="p-6 text-center text-sm text-muted">Paketler yükleniyor veya henüz tanımlı değil.</GlassCard>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {packages.map((p) => {
              const featured = p.badge === "En Avantajlı";
              return (
                <GlassCard key={p.id} className={`p-5 ${featured ? "gold-card" : ""}`}>
                  {p.badge && <span className={`mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${featured ? "bg-gold/15 text-gold" : "bg-primary/15 text-primary"}`}>{p.badge}</span>}
                  <p className="flex items-center gap-1.5 text-2xl font-bold"><Coins size={20} className="text-gold" /> {p.coins.toLocaleString("tr-TR")}</p>
                  {p.bonus_coins > 0 && <p className="flex items-center gap-1 text-xs text-success"><Gift size={12} /> +{p.bonus_coins} bonus</p>}
                  <p className="mt-2 text-lg font-bold">{p.price_try} <span className="text-sm font-normal text-muted">TL</span></p>
                  <div className="mt-3"><BuyPackageButton packageId={p.id} featured={featured} /></div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </section>

      {/* Ödeme geçmişi */}
      <section>
        <h2 className="mb-3 font-bold">Ödeme Geçmişi</h2>
        {!orders || orders.length === 0 ? (
          <GlassCard className="p-5 text-center text-sm text-muted">Henüz ödeme yok.</GlassCard>
        ) : (
          <GlassCard className="divide-y divide-line p-2">
            {orders.map((o) => {
              const s = ORDER_STATUS[o.status] ?? ORDER_STATUS.pending;
              return (
                <div key={o.id} className="flex items-center justify-between px-3 py-3">
                  <div>
                    <p className="text-sm font-semibold">{o.total_coins.toLocaleString("tr-TR")} jeton</p>
                    <p className="text-xs text-muted">{shortDate(o.created_at)} · {o.amount_try} TL</p>
                  </div>
                  <span className={`text-xs font-bold ${s.cls}`}>{s.label}</span>
                </div>
              );
            })}
          </GlassCard>
        )}
      </section>

      <Transactions txs={txs || []} />
    </div>
  );
}

function Transactions({ txs }: { txs: any[] }) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 font-bold"><Clock size={18} className="text-primary" /> Jeton Hareketleri</h2>
      {txs.length === 0 ? (
        <GlassCard className="p-5 text-center text-sm text-muted">Henüz hareket yok.</GlassCard>
      ) : (
        <GlassCard className="divide-y divide-line p-2">
          {txs.map((t) => {
            const pos = t.amount > 0;
            return (
              <div key={t.id} className="flex items-center gap-3 px-3 py-3">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${pos ? "bg-success/12 text-success" : "bg-danger/12 text-danger"}`}>
                  {pos ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.description || t.type}</p>
                  <p className="text-xs text-muted">{shortDate(t.created_at)}</p>
                </div>
                <span className={`font-bold ${pos ? "text-success" : "text-danger"}`}>{pos ? "+" : ""}{t.amount}</span>
              </div>
            );
          })}
        </GlassCard>
      )}
    </section>
  );
}
