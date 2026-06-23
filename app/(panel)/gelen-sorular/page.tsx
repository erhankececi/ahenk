import { GlassCard, Button } from "@/components/ui";
import { INCOMING_QUESTIONS } from "@/lib/mock";

export default function IncomingQuestions() {
  return (
    <div className="space-y-5 pb-4">
      <div>
        <h1 className="text-2xl font-bold">Gelen Sorular</h1>
        <p className="mt-1 text-sm text-muted">Öğrencilerden gelen soruları cevapla ve kazan.</p>
      </div>
      <div className="space-y-3">
        {INCOMING_QUESTIONS.map((q) => (
          <GlassCard key={q.id} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-secondary">{q.subject} · {q.title}</span>
              <div className="flex items-center gap-2">
                {q.priority && <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">ÖNCELİKLİ</span>}
                <span className="text-[11px] text-muted">{q.time}</span>
              </div>
            </div>
            <p className="mt-1.5 text-sm text-muted">{q.desc}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" className="flex-1">Odada Cevapla</Button>
              <Button size="sm" variant="glass" className="flex-1">Metinle Cevapla</Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
