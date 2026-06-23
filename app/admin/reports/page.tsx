"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { GlassCard } from "@/components/ui";
import { shortDate } from "@/lib/questions";
import { ArrowLeft, Check, X } from "lucide-react";

const TABS = [{ id: "open", l: "Açık" }, { id: "reviewing", l: "İnceleniyor" }, { id: "resolved", l: "Çözüldü" }, { id: "rejected", l: "Reddedildi" }];
const TARGET: Record<string, string> = { question: "Soru", answer: "Cevap", room: "Oda", message: "Mesaj", teacher: "Öğretmen", coach: "Koç", user: "Kullanıcı" };

export default function AdminReports() {
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [tab, setTab] = useState("open");
  const [busy, setBusy] = useState("");

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (me?.role !== "admin") { setIsAdmin(false); return; }
    setIsAdmin(true);
    const { data } = await supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(100);
    setReports(data || []);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function resolve(id: string, status: string) {
    setBusy(id);
    await supabase.rpc("admin_resolve_report", { p_report_id: id, p_status: status, p_note: null });
    setBusy("");
    load();
  }

  if (isAdmin === false) return <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-5 text-center"><Logo size={26} /><p className="mt-6 text-muted">Bu sayfa yöneticilere özeldir.</p></div>;

  const filtered = reports.filter((r) => r.status === tab);

  return (
    <div className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between border-b border-line pb-4">
        <Link href="/admin" className="flex items-center gap-1.5 text-sm text-muted hover:text-text"><ArrowLeft size={16} /> Admin</Link>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Bildirimler</span>
      </header>
      <h1 className="text-2xl font-bold">İçerik Bildirimleri</h1>

      <div className="mt-5 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition ${tab === t.id ? "border-primary bg-primary/10 text-primary" : "border-line bg-surface text-muted hover:text-text"}`}>
            {t.l} {reports.filter((r) => r.status === t.id).length > 0 && <span className="opacity-70">{reports.filter((r) => r.status === t.id).length}</span>}
          </button>
        ))}
      </div>

      {isAdmin === null ? (
        <div className="glass-card mt-5 rounded-2xl p-10 text-center text-sm text-muted">Yükleniyor…</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card mt-5 rounded-2xl p-10 text-center text-sm text-muted">Bu durumda bildirim yok.</div>
      ) : (
        <div className="mt-5 space-y-3">
          {filtered.map((r) => (
            <GlassCard key={r.id} className="p-4">
              <div className="flex items-center justify-between">
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-muted">{TARGET[r.target_type] || r.target_type}</span>
                <span className="text-[11px] text-muted">{shortDate(r.created_at)}</span>
              </div>
              <p className="mt-2 font-bold text-danger">{r.reason}</p>
              {r.description && <p className="mt-1 text-sm text-muted">{r.description}</p>}
              {(tab === "open" || tab === "reviewing") && (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => resolve(r.id, "resolved")} disabled={!!busy} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-success/15 py-2 text-sm font-semibold text-success disabled:opacity-50"><Check size={15} /> Çözüldü</button>
                  <button onClick={() => resolve(r.id, "rejected")} disabled={!!busy} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line py-2 text-sm font-semibold text-muted disabled:opacity-50"><X size={15} /> Reddet</button>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
