"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard, Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { ASK_SUBJECTS, COST_NORMAL, COST_PRIORITY, rpcMessage } from "@/lib/questions";
import { Camera, Send, Zap, Coins, X, Users } from "lucide-react";

type T = { user_id: string; full_name: string; branch: string | null };

export default function AskQuestion() {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teacherId, setTeacherId] = useState(""); // "" = havuz
  const [priority, setPriority] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [balance, setBalance] = useState<number | null>(null);
  const [teachers, setTeachers] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: sp } = await supabase.from("student_profiles").select("coin_balance").eq("user_id", user.id).maybeSingle();
      setBalance(sp?.coin_balance ?? 0);
      const { data: tp } = await supabase
        .from("teacher_profiles")
        .select("user_id, branch, profiles(full_name)")
        .eq("status", "approved")
        .limit(50);
      setTeachers((tp || []).map((r: any) => ({ user_id: r.user_id, branch: r.branch, full_name: r.profiles?.full_name || "Öğretmen" })));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cost = priority ? COST_PRIORITY : COST_NORMAL;
  const insufficient = balance !== null && balance < cost;
  const canSubmit = !!subject && !insufficient && !loading;

  function pickFile(f: File | null) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : "");
  }

  async function submit() {
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      let imagePath: string | null = null;
      if (file) {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("question-images").upload(path, file, { contentType: file.type });
        if (upErr) { setError("Fotoğraf yüklenemedi, tekrar dene."); setLoading(false); return; }
        imagePath = path;
      }

      const { data: qid, error: rpcErr } = await supabase.rpc("submit_question", {
        p_subject: subject,
        p_topic: topic || null,
        p_title: title || null,
        p_description: description || null,
        p_image_url: imagePath,
        p_teacher_id: teacherId || null,
        p_priority: priority,
      });

      if (rpcErr) { setError(rpcMessage(rpcErr.message)); setLoading(false); return; }
      router.push(qid ? `/sorularim/${qid}` : "/sorularim");
      router.refresh();
    } catch {
      setError("Beklenmeyen bir hata oluştu.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Soru Sor</h1>
          <p className="mt-1 text-sm text-muted">Probleminizi yükleyin, uzman öğretmenlerden çözüm alın.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-sm font-bold text-gold">
          <Coins size={15} /> {(balance ?? 0).toLocaleString("tr-TR")}
        </span>
      </div>

      {/* 1. Fotoğraf */}
      <GlassCard className="p-5">
        <Stepno n={1} title="Soru Fotoğrafı" sub="(İsteğe bağlı)" />
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0] || null)} />
        {preview ? (
          <div className="relative mt-4 overflow-hidden rounded-xl border border-line">
            <img src={preview} alt="" className="max-h-72 w-full object-contain bg-black/30" />
            <button onClick={() => pickFile(null)} className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white"><X size={16} /></button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()} className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line py-10 text-muted transition hover:border-primary/50 hover:text-primary">
            <Camera size={28} />
            <span className="text-sm">Fotoğraf çekmek veya yüklemek için dokun</span>
          </button>
        )}
      </GlassCard>

      {/* 2. Ders + konu + başlık + açıklama */}
      <GlassCard className="space-y-4 p-5">
        <Stepno n={2} title="Soru Detayı" />
        <div>
          <Lbl>Ders</Lbl>
          <div className="no-scrollbar -mx-1 flex flex-wrap gap-2">
            {ASK_SUBJECTS.map((s) => (
              <button key={s} onClick={() => setSubject(s)} className={`rounded-full border px-3 py-1.5 text-sm transition ${subject === s ? "border-primary bg-primary/10 text-primary" : "border-line bg-surface text-muted hover:text-text"}`}>{s}</button>
            ))}
          </div>
        </div>
        <Input value={topic} onChange={setTopic} label="Konu" placeholder="Örn. Türev, Paragraf…" />
        <Input value={title} onChange={setTitle} label="Başlık" placeholder="Sorunun kısa başlığı" />
        <div>
          <Lbl>Açıklama</Lbl>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Nerede takıldığını anlat…" className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-[15px] outline-none focus:border-primary/50" />
        </div>
      </GlassCard>

      {/* 3. Öğretmen */}
      <GlassCard className="p-5">
        <Stepno n={3} title="Öğretmen Seç" sub="(İsteğe bağlı)" />
        <div className="mt-4 space-y-2">
          <button onClick={() => setTeacherId("")} className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${teacherId === "" ? "border-primary bg-primary/10" : "border-line bg-surface hover:border-white/20"}`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/12 text-primary"><Users size={16} /></span>
            <span><span className="block text-sm font-semibold">Havuza Bırak</span><span className="block text-xs text-muted">İlk uygun öğretmen üstlensin</span></span>
          </button>
          {teachers.map((t) => (
            <button key={t.user_id} onClick={() => setTeacherId(t.user_id)} className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${teacherId === t.user_id ? "border-primary bg-primary/10" : "border-line bg-surface hover:border-white/20"}`}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/15 text-xs font-bold text-secondary">{t.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
              <span><span className="block text-sm font-semibold">{t.full_name}</span><span className="block text-xs text-muted">{t.branch || "Öğretmen"}</span></span>
            </button>
          ))}
          {teachers.length === 0 && <p className="px-1 text-xs text-muted">Henüz onaylı öğretmen yok — sorun havuza düşer.</p>}
        </div>
      </GlassCard>

      {/* Öncelikli */}
      <GlassCard className="gold-card flex items-center gap-4 p-5">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold"><Zap size={20} /></span>
        <div className="flex-1">
          <p className="font-bold text-premium">Öncelikli Cevap</p>
          <p className="text-xs text-muted">5 dakikada kısa sürede cevap. <span className="font-semibold text-gold">{COST_PRIORITY} jeton</span></p>
        </div>
        <button onClick={() => setPriority((p) => !p)} className={`relative h-7 w-12 shrink-0 rounded-full transition ${priority ? "bg-gold" : "bg-white/10"}`} aria-pressed={priority}>
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${priority ? "left-6" : "left-1"}`} />
        </button>
      </GlassCard>

      {error && <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      {insufficient && !error && <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">Yetersiz jeton — bu soru {cost} jeton. Cüzdandan jeton yükle.</p>}

      <Button size="lg" className="w-full" disabled={!canSubmit} onClick={submit}>
        {loading ? "Gönderiliyor…" : <><Send size={18} /> Soruyu Gönder · {cost} jeton</>}
      </Button>
    </div>
  );
}

function Stepno({ n, title, sub }: { n: number; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/40 text-sm font-bold text-primary">{n}</span>
      <h3 className="font-bold">{title} {sub && <span className="text-xs font-normal text-muted">{sub}</span>}</h3>
    </div>
  );
}
function Lbl({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-sm font-medium text-muted">{children}</p>;
}
function Input({ value, onChange, label, placeholder }: { value: string; onChange: (v: string) => void; label: string; placeholder: string }) {
  return (
    <div>
      <Lbl>{label}</Lbl>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-[15px] outline-none focus:border-primary/50" />
    </div>
  );
}
