"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GlassCard, Button, LiveBadge } from "@/components/ui";
import { rpcMessage } from "@/lib/questions";
import { Plus, Users, Coins, Video, X } from "lucide-react";

const ROOM_TYPES = [
  { v: "study", l: "Çalışma Odası" },
  { v: "question_solution", l: "Soru Çözüm" },
  { v: "exam_analysis", l: "Deneme Analizi" },
  { v: "coaching", l: "Koçluk" },
  { v: "motivation", l: "Motivasyon" },
];

export default function MyRooms() {
  const router = useRouter();
  const supabase = createClient();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [examType, setExamType] = useState("");
  const [roomType, setRoomType] = useState("study");
  const [isPaid, setIsPaid] = useState(false);
  const [coinCost, setCoinCost] = useState("0");
  const [maxP, setMaxP] = useState("100");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("live_rooms").select("*").eq("host_id", user.id).order("created_at", { ascending: false });
    setRooms(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function create() {
    if (!title.trim() || !subject.trim() || busy) return;
    setBusy(true); setError("");
    const { data: rid, error: e } = await supabase.rpc("create_live_room", {
      p_title: title.trim(),
      p_description: description.trim() || null,
      p_subject: subject.trim(),
      p_exam_type: examType || null,
      p_room_type: roomType,
      p_is_paid: isPaid,
      p_coin_cost: isPaid ? parseInt(coinCost || "0", 10) : 0,
      p_max_participants: parseInt(maxP || "100", 10),
      p_starts_at: null,
    });
    setBusy(false);
    if (e) { setError(rpcMessage(e.message)); return; }
    router.push(`/odalar/${rid}`);
  }

  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Odalarım</h1>
          <p className="mt-1 text-sm text-muted">Canlı odalarını yönet ve yeni oturum aç.</p>
        </div>
        <Button size="sm" onClick={() => setOpen((o) => !o)}>{open ? <X size={16} /> : <Plus size={16} />} {open ? "Kapat" : "Oda Aç"}</Button>
      </div>

      {open && (
        <GlassCard className="space-y-4 p-5">
          <h2 className="font-bold">Yeni Oda Oluştur</h2>
          <Inp label="Oda başlığı" value={title} onChange={setTitle} placeholder="Örn. TYT Matematik Soru Çözüm" />
          <div>
            <Lbl>Açıklama</Lbl>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Odanın amacı…" className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-[15px] outline-none focus:border-primary/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Inp label="Ders" value={subject} onChange={setSubject} placeholder="Matematik" />
            <div>
              <Lbl>Sınav</Lbl>
              <select value={examType} onChange={(e) => setExamType(e.target.value)} className="w-full rounded-xl border border-line bg-surface px-3 py-3 text-[15px] outline-none focus:border-primary/50">
                <option value="">Genel</option>{["TYT", "AYT", "LGS", "KPSS"].map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Lbl>Oda Tipi</Lbl>
            <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className="w-full rounded-xl border border-line bg-surface px-3 py-3 text-[15px] outline-none focus:border-primary/50">
              {ROOM_TYPES.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3">
            <span className="text-sm font-medium">Jetonlu oda</span>
            <button onClick={() => setIsPaid((p) => !p)} className={`relative h-7 w-12 rounded-full transition ${isPaid ? "bg-gold" : "bg-white/10"}`}>
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${isPaid ? "left-6" : "left-1"}`} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {isPaid && <Inp label="Jeton ücreti" value={coinCost} onChange={setCoinCost} type="number" />}
            <Inp label="Maks. katılımcı" value={maxP} onChange={setMaxP} type="number" />
          </div>
          {error && <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <Button size="lg" className="w-full" disabled={!title.trim() || !subject.trim() || busy} onClick={create}>{busy ? "Oluşturuluyor…" : "Oda Oluştur"}</Button>
        </GlassCard>
      )}

      {loading ? (
        <div className="glass-card rounded-2xl p-10 text-center text-sm text-muted">Yükleniyor…</div>
      ) : rooms.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-sm text-muted">Henüz oda açmadın. “Oda Aç” ile başla.</div>
      ) : (
        <div className="space-y-3">
          {rooms.map((r) => (
            <Link key={r.id} href={`/odalar/${r.id}`} className="block">
              <GlassCard className="p-4 transition hover:border-primary/30">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">{r.title}</h3>
                  <LiveBadge soon={r.status !== "live"} label={r.status === "live" ? "Canlı" : r.status === "scheduled" ? "Yakında" : r.status === "ended" ? "Bitti" : "İptal"} />
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1"><Video size={13} /> {r.subject}</span>
                  <span className="flex items-center gap-1"><Users size={13} /> {r.participant_count}</span>
                  <span className={`flex items-center gap-1 font-semibold ${r.is_paid && r.coin_cost > 0 ? "text-gold" : "text-success"}`}>
                    {r.is_paid && r.coin_cost > 0 ? <><Coins size={12} /> {r.coin_cost}</> : "Ücretsiz"}
                  </span>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-sm font-medium text-muted">{children}</p>;
}
function Inp({ label, value, onChange, placeholder, type }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <Lbl>{label}</Lbl>
      <input type={type || "text"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-[15px] outline-none focus:border-primary/50" />
    </div>
  );
}
