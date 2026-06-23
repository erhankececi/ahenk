"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { GlassCard, Avatar } from "@/components/ui";
import { shortDate } from "@/lib/questions";
import { ArrowLeft, Check, X } from "lucide-react";

type App = { user_id: string; name: string; kind: "teacher" | "coach"; branch: string; bio: string; years?: number | null; status: string; created_at: string };
const TABS = [{ id: "pending", l: "Bekleyen" }, { id: "approved", l: "Onaylı" }, { id: "rejected", l: "Reddedilen" }];

export default function AdminApplications() {
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [tab, setTab] = useState("pending");
  const [busy, setBusy] = useState("");

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (me?.role !== "admin") { setIsAdmin(false); return; }
    setIsAdmin(true);
    const [{ data: t }, { data: c }] = await Promise.all([
      supabase.from("teacher_profiles").select("user_id, branch, bio, experience_years, status, created_at, profiles(full_name)"),
      supabase.from("coach_profiles").select("user_id, expertise, bio, status, created_at, profiles(full_name)"),
    ]);
    const teachers: App[] = (t || []).map((r: any) => ({ user_id: r.user_id, name: r.profiles?.full_name || "Öğretmen", kind: "teacher", branch: r.branch || "—", bio: r.bio || "", years: r.experience_years, status: r.status, created_at: r.created_at }));
    const coaches: App[] = (c || []).map((r: any) => ({ user_id: r.user_id, name: r.profiles?.full_name || "Koç", kind: "coach", branch: (r.expertise || []).join(", ") || "Koç", bio: r.bio || "", status: r.status, created_at: r.created_at }));
    setApps([...teachers, ...coaches].sort((a, b) => b.created_at.localeCompare(a.created_at)));
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function act(a: App, approve: boolean) {
    setBusy(a.user_id + a.kind);
    const fn = a.kind === "teacher" ? (approve ? "admin_approve_teacher" : "admin_reject_teacher") : (approve ? "admin_approve_coach" : "admin_reject_coach");
    await supabase.rpc(fn, approve ? { p_user_id: a.user_id } : { p_user_id: a.user_id, p_note: null });
    setBusy("");
    load();
  }

  if (isAdmin === false) return <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-5 text-center"><Logo size={26} /><p className="mt-6 text-muted">Bu sayfa yöneticilere özeldir.</p></div>;

  const filtered = apps.filter((a) => a.status === tab);

  return (
    <div className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between border-b border-line pb-4">
        <Link href="/admin" className="flex items-center gap-1.5 text-sm text-muted hover:text-text"><ArrowLeft size={16} /> Admin</Link>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Başvurular</span>
      </header>
      <h1 className="text-2xl font-bold">Öğretmen / Koç Başvuruları</h1>

      <div className="mt-5 flex gap-2">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 rounded-full border px-3 py-2 text-sm font-medium transition ${tab === t.id ? "border-primary bg-primary/10 text-primary" : "border-line bg-surface text-muted hover:text-text"}`}>
            {t.l} {apps.filter((a) => a.status === t.id).length > 0 && <span className="opacity-70">{apps.filter((a) => a.status === t.id).length}</span>}
          </button>
        ))}
      </div>

      {isAdmin === null ? (
        <div className="glass-card mt-5 rounded-2xl p-10 text-center text-sm text-muted">Yükleniyor…</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card mt-5 rounded-2xl p-10 text-center text-sm text-muted">Bu durumda başvuru yok.</div>
      ) : (
        <div className="mt-5 space-y-3">
          {filtered.map((a) => (
            <GlassCard key={a.user_id + a.kind} className="p-4">
              <div className="flex items-start gap-3">
                <Avatar name={a.name} size={44} color={a.kind === "coach" ? "#B6C4FF" : "#00E5FF"} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{a.name}</p>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase text-muted">{a.kind === "teacher" ? "Öğretmen" : "Koç"}</span>
                  </div>
                  <p className="text-xs text-primary">{a.branch}{a.years ? ` · ${a.years} yıl` : ""}</p>
                  {a.bio && <p className="mt-1 text-sm text-muted">{a.bio}</p>}
                  <p className="mt-1 text-[11px] text-muted">{shortDate(a.created_at)}</p>
                </div>
              </div>
              {a.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => act(a, true)} disabled={!!busy} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-success/15 py-2.5 text-sm font-semibold text-success disabled:opacity-50"><Check size={15} /> Onayla</button>
                  <button onClick={() => act(a, false)} disabled={!!busy} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-danger/30 py-2.5 text-sm font-semibold text-danger disabled:opacity-50"><X size={15} /> Reddet</button>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
