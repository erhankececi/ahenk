import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { GlassCard } from "@/components/ui";
import { shortDate } from "@/lib/questions";
import { ArrowLeft, Users } from "lucide-react";

export const dynamic = "force-dynamic";

const ST: Record<string, { l: string; c: string }> = {
  live: { l: "Canlı", c: "text-success" },
  scheduled: { l: "Planlandı", c: "text-gold" },
  ended: { l: "Bitti", c: "text-muted" },
  canceled: { l: "İptal", c: "text-danger" },
};

export default async function AdminRooms() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (me?.role !== "admin") {
    return <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-5 text-center"><Logo size={26} /><p className="mt-6 text-muted">Bu sayfa yöneticilere özeldir.</p></div>;
  }

  const { data: rooms } = await supabase
    .from("live_rooms")
    .select("id, title, status, is_paid, coin_cost, participant_count, created_at, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between border-b border-line pb-4">
        <Link href="/admin" className="flex items-center gap-1.5 text-sm text-muted hover:text-text"><ArrowLeft size={16} /> Admin</Link>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Odalar</span>
      </header>

      <h1 className="text-2xl font-bold">Canlı Odalar</h1>

      {!rooms || rooms.length === 0 ? (
        <GlassCard className="mt-5 p-8 text-center text-sm text-muted">Henüz oda yok.</GlassCard>
      ) : (
        <div className="mt-5 space-y-2">
          {rooms.map((r: any) => (
            <GlassCard key={r.id} className="flex items-center justify-between p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{r.title}</p>
                <p className="text-xs text-muted">{r.profiles?.full_name || "Host"} · {shortDate(r.created_at)} · {r.is_paid && r.coin_cost > 0 ? `${r.coin_cost} jeton` : "Ücretsiz"}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-muted"><Users size={13} /> {r.participant_count}</span>
                {(() => { const st = ST[r.status] ?? { l: r.status, c: "text-muted" }; return <span className={`text-xs font-bold ${st.c}`}>{st.l}</span>; })()}
                <button className="rounded-lg border border-line px-2.5 py-1 text-xs text-muted">Detay</button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
