import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuestionCard } from "@/components/QuestionCard";
import { Button } from "@/components/ui";
import { MessageSquarePlus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MyQuestions() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sorularım</h1>
          <p className="mt-1 text-sm text-muted">Gönderdiğin soruları ve cevap durumunu takip et.</p>
        </div>
        <Button href="/soru-sor" size="sm"><MessageSquarePlus size={16} /> Yeni</Button>
      </div>

      {!questions || questions.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <p className="text-sm text-muted">Henüz soru sormadın.</p>
          <Button href="/soru-sor" className="mt-4">İlk Soruyu Sor</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => <QuestionCard key={q.id} q={q} href={`/sorularim/${q.id}`} />)}
        </div>
      )}
    </div>
  );
}
