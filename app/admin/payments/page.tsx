import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { GlassCard } from "@/components/ui";
import { shortDate } from "@/lib/questions";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = { pending: "text-gold", paid: "text-success", failed: "text-danger", canceled: "text-muted", refunded: "text-secondary" };

export default async function AdminPayments() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (me?.role !== "admin") {
    return <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-5 text-center"><Logo size={26} /><p className="mt-6 text-muted">Bu sayfa yöneticilere özeldir.</p></div>;
  }

  const { data: orders } = await supabase
    .from("payment_orders")
    .select("id, status, amount_try, total_coins, provider_payment_id, created_at, profiles(full_name), coin_packages(name)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between border-b border-line pb-4">
        <Link href="/admin" className="flex items-center gap-1.5 text-sm text-muted hover:text-text"><ArrowLeft size={16} /> Admin</Link>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Ödemeler</span>
      </header>

      <h1 className="text-2xl font-bold">Ödeme Kayıtları</h1>

      {!orders || orders.length === 0 ? (
        <GlassCard className="mt-5 p-8 text-center text-sm text-muted">Henüz ödeme kaydı yok.</GlassCard>
      ) : (
        <div className="mt-5 space-y-2">
          {orders.map((o: any) => (
            <GlassCard key={o.id} className="flex items-center justify-between p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{o.profiles?.full_name || "Kullanıcı"} · {o.coin_packages?.name || `${o.total_coins} jeton`}</p>
                <p className="text-xs text-muted">{shortDate(o.created_at)} · {o.amount_try} TL · {o.provider_payment_id || "—"}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold ${STATUS[o.status] ?? "text-muted"}`}>{o.status}</span>
                <button className="rounded-lg border border-line px-2.5 py-1 text-xs text-muted">Detay</button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
