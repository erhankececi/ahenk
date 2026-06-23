"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GlassCard, Button, Avatar, Stars, LiveBadge } from "@/components/ui";
import { ReportButton } from "@/components/ReportButton";
import { MessageSquare, Clock, Target } from "lucide-react";

type Item = {
  id: string;
  name: string;
  branch: string;
  desc: string;
  rating: number;
  answered: number;
  avgTime: string;
  kind: "ogretmen" | "koc";
  years?: number | null;
};

const TABS = ["Tüm Öğretmenler", "Öğretmenler", "Koçlar"];

export default function Teachers() {
  const supabase = createClient();
  const [tab, setTab] = useState("Tüm Öğretmenler");
  const [list, setList] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: t }, { data: c }] = await Promise.all([
        supabase.from("teacher_profiles").select("user_id, branch, bio, experience_years, rating, answered_questions, average_response_time, profiles(full_name)").eq("status", "approved").limit(50),
        supabase.from("coach_profiles").select("user_id, expertise, bio, rating, profiles(full_name)").eq("status", "approved").limit(50),
      ]);
      const teachers: Item[] = (t || []).map((r: any) => ({
        id: r.user_id, name: r.profiles?.full_name || "Öğretmen", branch: r.branch || "Öğretmen", desc: r.bio || "",
        rating: Number(r.rating) || 0, answered: r.answered_questions || 0, avgTime: r.average_response_time || "—", kind: "ogretmen", years: r.experience_years,
      }));
      const coaches: Item[] = (c || []).map((r: any) => ({
        id: r.user_id, name: r.profiles?.full_name || "Koç", branch: (r.expertise || []).join(", ") || "Sınav Koçu", desc: r.bio || "",
        rating: Number(r.rating) || 0, answered: 0, avgTime: "—", kind: "koc",
      }));
      setList([...teachers, ...coaches]);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = tab === "Öğretmenler" ? list.filter((x) => x.kind === "ogretmen") : tab === "Koçlar" ? list.filter((x) => x.kind === "koc") : list;

  return (
    <div className="space-y-5 pb-4">
      <div>
        <h1 className="text-2xl font-bold">Öğretmenler ve Koçlar</h1>
        <p className="mt-1 text-sm text-muted">Onaylı eğitmen ve sınav koçları ile bağlan.</p>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${tab === t ? "border-primary bg-primary/10 text-primary" : "border-line bg-surface text-muted hover:text-text"}`}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div className="glass-card rounded-2xl p-10 text-center text-sm text-muted">Yükleniyor…</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-sm text-muted">Henüz onaylı eğitmen yok. Başvurular onaylandıkça burada görünür.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((t) => {
            const koc = t.kind === "koc";
            return (
              <GlassCard key={t.id} className="overflow-hidden">
                <div className="relative h-20" style={{ background: `linear-gradient(120deg, ${koc ? "#3a2f5e" : "#0e3a44"}, #0a111f)` }} />
                <div className="-mt-8 px-5 pb-5">
                  <div className="flex items-end justify-between">
                    <span className="rounded-full p-1 ring-2 ring-surface" style={{ background: "#0A111F" }}>
                      <Avatar name={t.name} size={56} color={koc ? "#B6C4FF" : "#00E5FF"} />
                    </span>
                    <LiveBadge soon label="Müsait" />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <h3 className="text-lg font-bold">{t.name}</h3>
                    {t.rating > 0 && <Stars rating={t.rating} />}
                  </div>
                  <p className="text-xs text-primary">{t.branch}</p>
                  {t.desc && <p className="mt-2 text-sm leading-relaxed text-muted">{t.desc}</p>}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {koc ? (
                      <Stat icon={<Target size={14} />} label="Rating" value={t.rating > 0 ? t.rating.toFixed(1) : "Yeni"} />
                    ) : (
                      <Stat icon={<MessageSquare size={14} />} label="Cevaplanan" value={`${t.answered}`} />
                    )}
                    <Stat icon={<Clock size={14} />} label={koc ? "Deneyim" : "Ort. Yanıt"} value={koc ? "Koç" : t.avgTime} />
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Button size="sm" className="flex-1" variant="glass">Profili Gör</Button>
                    <ReportButton targetType={koc ? "coach" : "teacher"} targetId={t.id} />
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2.5">
      <p className="flex items-center gap-1 text-[11px] text-muted">{icon} {label}</p>
      <p className="mt-0.5 font-bold">{value}</p>
    </div>
  );
}
