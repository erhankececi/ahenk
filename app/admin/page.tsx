import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { GlassCard } from "@/components/ui";
import { shortDate } from "@/lib/questions";
import { Users, UserCheck, MessageSquare, HelpCircle, CheckCircle2, Coins, CreditCard, Wallet, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

async function count(supabase: any, table: string, filter?: [string, string]) {
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) q = q.eq(filter[0], filter[1]);
  const { count } = await q;
  return count ?? 0;
}

export default async function Admin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

  if (profile?.role !== "admin") {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-5 text-center">
        <Logo size={26} />
        <p className="mt-6 text-muted">Bu sayfa yöneticilere özeldir.</p>
        <Link href="/ogrenci" className="mt-4 text-sm font-medium text-primary">Panele dön</Link>
      </div>
    );
  }

  const [pendingTeachers, pendingCoaches, totalQ, openQ, answeredQ] = await Promise.all([
    count(supabase, "teacher_profiles", ["status", "pending"]),
    count(supabase, "coach_profiles", ["status", "pending"]),
    count(supabase, "questions"),
    count(supabase, "questions", ["status", "open"]),
    count(supabase, "questions", ["status", "answered"]),
  ]);
  const { data: tx } = await supabase.from("coin_transactions").select("id, amount, type, description, created_at").order("created_at", { ascending: false }).limit(8);

  const [totalPay, paidPay, pendingPay] = await Promise.all([
    count(supabase, "payment_orders"),
    count(supabase, "payment_orders", ["status", "paid"]),
    count(supabase, "payment_orders", ["status", "pending"]),
  ]);
  const { data: paidOrders } = await supabase.from("payment_orders").select("total_coins").eq("status", "paid");
  const coinsSold = (paidOrders || []).reduce((s: number, o: any) => s + (o.total_coins || 0), 0);

  const metrics = [
    { icon: UserCheck, label: "Bekleyen Öğretmen", value: pendingTeachers, tone: "gold" },
    { icon: Users, label: "Bekleyen Koç", value: pendingCoaches, tone: "gold" },
    { icon: HelpCircle, label: "Toplam Soru", value: totalQ, tone: "primary" },
    { icon: MessageSquare, label: "Açık Soru", value: openQ, tone: "primary" },
    { icon: CheckCircle2, label: "Cevaplanan Soru", value: answeredQ, tone: "primary" },
    { icon: CreditCard, label: "Toplam Ödeme", value: totalPay, tone: "primary" },
    { icon: Wallet, label: "Başarılı Ödeme", value: paidPay, tone: "gold" },
    { icon: Clock, label: "Bekleyen Ödeme", value: pendingPay, tone: "primary" },
    { icon: Coins, label: "Satılan Jeton", value: coinsSold, tone: "gold" },
  ];

  return (
    <div className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between border-b border-line pb-4">
        <Link href="/"><Logo size={22} /></Link>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Admin Panel</span>
      </header>

      <h1 className="text-2xl font-bold">Genel Bakış</h1>
      <p className="mt-1 text-sm text-muted">Başvuru onayı SQL ile: <code className="text-primary">update teacher_profiles set status='approved' where user_id='…';</code></p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {metrics.map((m) => (
          <GlassCard key={m.label} className="p-5">
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${m.tone === "gold" ? "bg-gold/12 text-gold" : "bg-primary/12 text-primary"}`}><m.icon size={20} /></span>
            <p className="mt-3 text-3xl font-bold">{m.value}</p>
            <p className="mt-1 text-xs leading-tight text-muted">{m.label}</p>
          </GlassCard>
        ))}
      </div>

      <Link href="/admin/payments" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">Tüm ödeme kayıtlarını gör →</Link>

      <h2 className="mt-8 mb-3 font-bold">Son Coin Hareketleri</h2>
      <GlassCard className="divide-y divide-line p-2">
        {(!tx || tx.length === 0) && <p className="px-3 py-4 text-sm text-muted">Henüz hareket yok.</p>}
        {(tx || []).map((t) => (
          <div key={t.id} className="flex items-center justify-between px-3 py-3">
            <div>
              <p className="text-sm font-medium">{t.description || t.type}</p>
              <p className="text-xs text-muted">{shortDate(t.created_at)}</p>
            </div>
            <span className={`font-bold ${t.amount < 0 ? "text-danger" : "text-success"}`}>{t.amount > 0 ? "+" : ""}{t.amount}</span>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}
