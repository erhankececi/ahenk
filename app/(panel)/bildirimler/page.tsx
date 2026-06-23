"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui";
import { shortDate } from "@/lib/questions";
import { CheckCheck, Bell } from "lucide-react";

const DOT: Record<string, string> = {
  info: "bg-secondary", question: "bg-primary", answer: "bg-success",
  room: "bg-primary", payment: "bg-gold", application: "bg-gold", warning: "bg-danger",
};

export default function Notifications() {
  const router = useRouter();
  const supabase = createClient();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
      setList(data || []);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unread = list.filter((n) => !n.read_at).length;

  async function open(n: any) {
    if (!n.read_at) {
      await supabase.rpc("mark_notification_read", { p_id: n.id });
      setList((l) => l.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)));
    }
    if (n.action_url) router.push(n.action_url);
  }
  async function markAll() {
    await supabase.rpc("mark_all_notifications_read");
    setList((l) => l.map((x) => ({ ...x, read_at: x.read_at || new Date().toISOString() })));
  }

  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bildirimler</h1>
          {unread > 0 && <p className="mt-1 text-sm text-muted">{unread} okunmamış bildirim</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted hover:text-primary">
            <CheckCheck size={14} /> Tümünü oku
          </button>
        )}
      </div>

      {loading ? (
        <div className="glass-card rounded-2xl p-10 text-center text-sm text-muted">Yükleniyor…</div>
      ) : list.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <Bell size={28} className="mx-auto text-muted" />
          <p className="mt-3 text-sm text-muted">Henüz bildirimin yok.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((n) => (
            <button key={n.id} onClick={() => open(n)} className="block w-full text-left">
              <GlassCard className={`flex items-start gap-3 p-4 transition hover:border-primary/30 ${!n.read_at ? "border-primary/20" : ""}`}>
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.read_at ? DOT[n.type] || "bg-primary" : "bg-white/15"}`} />
                <div className="flex-1">
                  <p className={`text-sm ${!n.read_at ? "font-bold" : "font-medium text-text/90"}`}>{n.title}</p>
                  <p className="mt-0.5 text-sm text-muted">{n.body}</p>
                  <p className="mt-1 text-[11px] text-muted">{shortDate(n.created_at)}</p>
                </div>
              </GlassCard>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
