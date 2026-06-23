"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { QuestionCard } from "@/components/QuestionCard";

const TABS = [
  { id: "pool", label: "Havuz" },
  { id: "assigned", label: "Atanmış" },
  { id: "answered", label: "Cevaplanan" },
] as const;

export default function TeacherQuestions() {
  const supabase = createClient();
  const [me, setMe] = useState("");
  const [all, setAll] = useState<any[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("pool");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setMe(user.id);
      const { data } = await supabase.from("questions").select("*").order("created_at", { ascending: false });
      setAll(data || []);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lists: Record<string, any[]> = {
    pool: all.filter((q) => q.status === "open" && !q.teacher_id),
    assigned: all.filter((q) => q.status === "assigned" && (q.teacher_id === me || q.claimed_by === me)),
    answered: all.filter((q) => q.status === "answered" && q.teacher_id === me),
  };
  const current = lists[tab];

  return (
    <div className="space-y-5 pb-4">
      <div>
        <h1 className="text-2xl font-bold">Gelen Sorular</h1>
        <p className="mt-1 text-sm text-muted">Havuzdan soru üstlen veya sana atanmış soruları cevapla.</p>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 rounded-full border px-3 py-2 text-sm font-medium transition ${tab === t.id ? "border-primary bg-primary/10 text-primary" : "border-line bg-surface text-muted hover:text-text"}`}>
            {t.label} {lists[t.id].length > 0 && <span className="ml-0.5 opacity-70">{lists[t.id].length}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass-card rounded-2xl p-10 text-center text-sm text-muted">Yükleniyor…</div>
      ) : current.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-sm text-muted">
          {tab === "pool" ? "Havuzda bekleyen soru yok." : tab === "assigned" ? "Sana atanmış aktif soru yok." : "Henüz cevapladığın soru yok."}
        </div>
      ) : (
        <div className="space-y-3">
          {current.map((q) => <QuestionCard key={q.id} q={q} href={`/gelen-sorular/${q.id}`} />)}
        </div>
      )}
    </div>
  );
}
