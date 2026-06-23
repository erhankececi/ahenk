import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GlassCard, Avatar } from "@/components/ui";
import { QuestionComments } from "@/components/QuestionComments";
import { statusMeta, shortDate } from "@/lib/questions";
import { ArrowLeft, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function sign(supabase: any, path: string | null) {
  if (!path) return null;
  const { data } = await supabase.storage.from("question-images").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export default async function QuestionDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: q } = await supabase.from("questions").select("*").eq("id", params.id).maybeSingle();
  if (!q) notFound();

  const s = statusMeta(q.status);
  const img = await sign(supabase, q.image_url);
  const answerImg = await sign(supabase, q.answer_image_url);
  const { data: teacher } = q.teacher_id ? await supabase.from("profiles").select("full_name").eq("id", q.teacher_id).maybeSingle() : { data: null };
  const { data: comments } = await supabase.from("question_comments").select("id, user_id, message, created_at").eq("question_id", q.id).order("created_at");

  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center justify-between">
        <Link href="/sorularim" className="flex items-center gap-1.5 text-sm text-muted hover:text-text"><ArrowLeft size={16} /> Sorularım</Link>
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${s.cls}`}>{s.label}</span>
      </div>

      <div>
        <p className="text-xs font-semibold text-secondary">{q.subject}{q.topic ? ` · ${q.topic}` : ""}</p>
        <h1 className="mt-1 text-2xl font-bold">{q.title || "Soru"}</h1>
        <p className="mt-1 flex items-center gap-2 text-xs text-muted">
          {q.priority && <span className="flex items-center gap-0.5 font-semibold text-gold"><Zap size={11} /> Öncelikli</span>}
          {shortDate(q.created_at)} · {q.coin_cost} jeton
        </p>
      </div>

      {q.description && <GlassCard className="p-4 text-sm leading-relaxed text-text/90">{q.description}</GlassCard>}
      {img && <img src={img} alt="Soru görseli" className="w-full rounded-2xl border border-line object-contain" />}

      {/* Cevap */}
      {q.status === "answered" ? (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-success" />
            <h2 className="font-bold">Cevap</h2>
            {teacher && <span className="flex items-center gap-1.5 text-xs text-muted">· {teacher.full_name}</span>}
          </div>
          <GlassCard className="space-y-3 p-4">
            {q.answer_text && <p className="text-sm leading-relaxed text-text/90">{q.answer_text}</p>}
            {answerImg && <img src={answerImg} alt="Cevap görseli" className="w-full rounded-xl border border-line object-contain" />}
            <p className="text-[11px] text-muted">{q.answered_at && shortDate(q.answered_at)}</p>
          </GlassCard>
        </div>
      ) : (
        <GlassCard className="flex items-center gap-3 p-4">
          {teacher ? <Avatar name={teacher.full_name} size={36} /> : null}
          <div>
            <p className="text-sm font-semibold">{teacher ? teacher.full_name : "Havuzda"}</p>
            <p className="text-xs text-muted">{q.status === "open" ? "Bir öğretmenin üstlenmesi bekleniyor." : "Öğretmen cevap hazırlıyor."}</p>
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-4">
        <QuestionComments questionId={q.id} meId={user.id} initial={comments || []} />
      </GlassCard>
    </div>
  );
}
