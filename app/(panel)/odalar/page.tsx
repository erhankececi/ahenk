"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GlassCard, LiveBadge, Avatar, Button } from "@/components/ui";
import { shortDate } from "@/lib/questions";
import { Users, Coins } from "lucide-react";

const TABS = ["Tümü", "Canlı", "Yakında", "Ücretsiz", "Jetonlu", "TYT", "AYT", "LGS", "KPSS"];

export default function Rooms() {
  const supabase = createClient();
  const [rooms, setRooms] = useState<any[]>([]);
  const [tab, setTab] = useState("Tümü");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("live_rooms")
        .select("*, profiles(full_name)")
        .in("status", ["scheduled", "live"])
        .order("created_at", { ascending: false });
      setRooms(data || []);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = rooms.filter((r) => {
    if (tab === "Tümü") return true;
    if (tab === "Canlı") return r.status === "live";
    if (tab === "Yakında") return r.status === "scheduled";
    if (tab === "Ücretsiz") return !r.is_paid || r.coin_cost === 0;
    if (tab === "Jetonlu") return r.is_paid && r.coin_cost > 0;
    return r.exam_type === tab || (r.subject || "").includes(tab);
  });

  return (
    <div className="space-y-5 pb-4">
      <div>
        <h1 className="text-2xl font-bold">Canlı Odalar</h1>
        <p className="mt-1 text-sm text-muted">Etkileşimli oturumlara katıl ve hazırlığını geliştir.</p>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${tab === t ? "border-primary bg-primary/10 text-primary" : "border-line bg-surface text-muted hover:text-text"}`}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div className="glass-card rounded-2xl p-10 text-center text-sm text-muted">Yükleniyor…</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-sm text-muted">Bu filtrede oda yok. Yakında yeni odalar açılacak.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <Link key={r.id} href={`/odalar/${r.id}`} className="block">
              <GlassCard className="p-5 transition hover:border-primary/30">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-muted">{r.exam_type || r.subject}</span>
                  <LiveBadge soon={r.status !== "live"} label={r.status === "live" ? "Canlı" : "Yakında"} />
                </div>
                <h3 className="text-lg font-bold">{r.title}</h3>
                <div className="mt-3 flex items-center gap-2.5">
                  <Avatar name={r.profiles?.full_name || "Eğitmen"} size={36} />
                  <div className="text-sm">
                    <p className="font-semibold">{r.profiles?.full_name || "Eğitmen"}</p>
                    <p className="text-xs text-muted">{r.subject}{r.starts_at ? ` · ${shortDate(r.starts_at)}` : ""}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1"><Users size={14} /> {r.participant_count}</span>
                    <span className={`flex items-center gap-1 font-semibold ${r.is_paid && r.coin_cost > 0 ? "text-gold" : "text-success"}`}>
                      {r.is_paid && r.coin_cost > 0 ? <><Coins size={12} /> {r.coin_cost}</> : "Ücretsiz"}
                    </span>
                  </div>
                  <Button size="sm">{r.status === "live" ? "Katıl" : "Gör"}</Button>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
