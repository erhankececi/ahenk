"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GlassCard, Button } from "@/components/ui";
import { statusMeta, shortDate, rpcMessage } from "@/lib/questions";
import { ArrowLeft, Zap, Camera, X, Send, HandHeart, CheckCircle2 } from "lucide-react";

export default function TeacherQuestionDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [me, setMe] = useState("");
  const [q, setQ] = useState<any>(null);
  const [img, setImg] = useState("");
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setMe(user.id);
    const { data } = await supabase.from("questions").select("*").eq("id", params.id).maybeSingle();
    setQ(data);
    if (data?.image_url) {
      const { data: s } = await supabase.storage.from("question-images").createSignedUrl(data.image_url, 3600);
      setImg(s?.signedUrl || "");
    }
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function claim() {
    setBusy(true); setError("");
    const { error: e } = await supabase.rpc("claim_question", { p_question_id: params.id });
    setBusy(false);
    if (e) { setError(rpcMessage(e.message)); return; }
    load();
  }

  async function submitAnswer() {
    if (!answer.trim() || busy) return;
    setBusy(true); setError("");
    try {
      let path: string | null = null;
      if (file) {
        const { data: { user } } = await supabase.auth.getUser();
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        path = `${user!.id}/${crypto.randomUUID()}.${ext}`;
        const { error: up } = await supabase.storage.from("question-images").upload(path, file, { contentType: file.type });
        if (up) { setError("Cevap görseli yüklenemedi."); setBusy(false); return; }
      }
      const { error: e } = await supabase.rpc("answer_question", { p_question_id: params.id, p_answer_text: answer.trim(), p_answer_image_url: path });
      setBusy(false);
      if (e) { setError(rpcMessage(e.message)); return; }
      router.push("/gelen-sorular");
      router.refresh();
    } catch {
      setError("Beklenmeyen bir hata oluştu."); setBusy(false);
    }
  }

  if (loading) return <div className="glass-card mt-2 rounded-2xl p-10 text-center text-sm text-muted">Yükleniyor…</div>;
  if (!q) return <div className="mt-2 text-center text-sm text-muted">Soru bulunamadı. <Link href="/gelen-sorular" className="text-primary">Geri dön</Link></div>;

  const s = statusMeta(q.status);
  const isPool = q.status === "open" && !q.teacher_id;
  const mine = q.teacher_id === me || q.claimed_by === me;
  const canAnswer = mine && q.status === "assigned";

  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center justify-between">
        <Link href="/gelen-sorular" className="flex items-center gap-1.5 text-sm text-muted hover:text-text"><ArrowLeft size={16} /> Gelen Sorular</Link>
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${s.cls}`}>{s.label}</span>
      </div>

      <div>
        <p className="text-xs font-semibold text-secondary">{q.subject}{q.topic ? ` · ${q.topic}` : ""}</p>
        <h1 className="mt-1 text-2xl font-bold">{q.title || "Soru"}</h1>
        <p className="mt-1 flex items-center gap-2 text-xs text-muted">
          {q.priority && <span className="flex items-center gap-0.5 font-semibold text-gold"><Zap size={11} /> Öncelikli (+18 jeton)</span>}
          {!q.priority && <span className="text-muted">+7 jeton</span>}
          · {shortDate(q.created_at)}
        </p>
      </div>

      {q.description && <GlassCard className="p-4 text-sm leading-relaxed text-text/90">{q.description}</GlassCard>}
      {img && <img src={img} alt="Soru görseli" className="w-full rounded-2xl border border-line object-contain" />}

      {error && <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {q.status === "answered" ? (
        <GlassCard className="space-y-2 p-4">
          <p className="flex items-center gap-2 font-bold text-success"><CheckCircle2 size={16} /> Cevaplandı</p>
          {q.answer_text && <p className="text-sm leading-relaxed text-text/90">{q.answer_text}</p>}
        </GlassCard>
      ) : isPool ? (
        <Button size="lg" className="w-full" disabled={busy} onClick={claim}><HandHeart size={18} /> {busy ? "Üstleniliyor…" : "Bu Soruyu Üstlen"}</Button>
      ) : canAnswer ? (
        <GlassCard className="space-y-4 p-5">
          <h2 className="font-bold">Cevabını Yaz</h2>
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={5} placeholder="Çözümü adım adım anlat…" className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-[15px] outline-none focus:border-primary/50" />
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0] || null; setFile(f); setPreview(f ? URL.createObjectURL(f) : ""); }} />
          {preview ? (
            <div className="relative overflow-hidden rounded-xl border border-line">
              <img src={preview} alt="" className="max-h-60 w-full object-contain bg-black/30" />
              <button onClick={() => { setFile(null); setPreview(""); }} className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white"><X size={15} /></button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line py-3 text-sm text-muted hover:border-primary/50 hover:text-primary"><Camera size={16} /> Cevap görseli ekle (isteğe bağlı)</button>
          )}
          <Button size="lg" className="w-full" disabled={!answer.trim() || busy} onClick={submitAnswer}>{busy ? "Gönderiliyor…" : <><Send size={18} /> Cevabı Gönder</>}</Button>
        </GlassCard>
      ) : (
        <GlassCard className="p-4 text-center text-sm text-muted">Bu soru başka bir öğretmene atanmış.</GlassCard>
      )}
    </div>
  );
}
