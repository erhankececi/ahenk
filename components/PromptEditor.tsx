"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, X, Pencil } from "lucide-react";

type Prompt = { id: number; text: string };
type Answer = { prompt_id: number; answer: string };

export default function PromptEditor({ userId }: { userId: string }) {
  const supabase = createClient();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [picking, setPicking] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const [{ data: pr }, { data: ans }] = await Promise.all([
      supabase.from("prompts").select("id, text").order("id"),
      supabase.from("prompt_answers").select("prompt_id, answer").eq("user_id", userId),
    ]);
    setPrompts((pr as Prompt[]) || []);
    setAnswers((ans as Answer[]) || []);
  }
  useEffect(() => {
    load();
  }, []);

  const answeredIds = new Set(answers.map((a) => a.prompt_id));
  const textOf = (id: number) => prompts.find((p) => p.id === id)?.text || "";

  function duzenle(id: number) {
    setActiveId(id);
    setDraft(answers.find((a) => a.prompt_id === id)?.answer || "");
    setPicking(false);
  }

  async function kaydet() {
    if (activeId == null || draft.trim().length < 2) return;
    setBusy(true);
    await supabase
      .from("prompt_answers")
      .upsert({ user_id: userId, prompt_id: activeId, answer: draft.trim() }, { onConflict: "user_id,prompt_id" });
    setBusy(false);
    setActiveId(null);
    setDraft("");
    load();
  }

  async function sil(id: number) {
    setBusy(true);
    await supabase.from("prompt_answers").delete().eq("user_id", userId).eq("prompt_id", id);
    setBusy(false);
    load();
  }

  const editor = (promptId: number) => (
    <>
      <p className="mb-1 text-xs font-medium text-brand">{textOf(promptId)}</p>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={2}
        autoFocus
        placeholder="Cevabını yaz…"
        className="w-full resize-none rounded-xl border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-brand"
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => {
            setActiveId(null);
            setDraft("");
          }}
          className="rounded-full border border-border px-3 py-1 text-xs"
        >
          Vazgeç
        </button>
        <button
          onClick={kaydet}
          disabled={busy || draft.trim().length < 2}
          className="brand-gradient rounded-full px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
        >
          Kaydet
        </button>
      </div>
    </>
  );

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <p className="t-h4">Hakkımda — sorular</p>
        <span className="text-xs text-muted">{answers.length}/3</span>
      </div>

      <div className="space-y-2">
        {answers.map((a) => (
          <div key={a.prompt_id} className="rounded-2xl border border-border bg-surface p-3">
            {activeId === a.prompt_id ? (
              editor(a.prompt_id)
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-muted">{textOf(a.prompt_id)}</p>
                  <div className="flex shrink-0 gap-1.5">
                    <button onClick={() => duzenle(a.prompt_id)} aria-label="Düzenle" className="text-muted">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => sil(a.prompt_id)} aria-label="Sil" className="text-error">
                      <X size={15} />
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-sm">{a.answer}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Yeni soru cevaplama */}
      {activeId !== null && !answeredIds.has(activeId) && (
        <div className="mt-2 rounded-2xl border border-brand/30 bg-brand/5 p-3">{editor(activeId)}</div>
      )}

      {/* Soru ekle */}
      {answers.length < 3 && activeId === null && (
        picking ? (
          <div className="mt-2 max-h-64 overflow-y-auto rounded-2xl border border-border bg-surface p-1.5">
            {prompts
              .filter((p) => !answeredIds.has(p.id))
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => duzenle(p.id)}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-elevated"
                >
                  {p.text}
                </button>
              ))}
          </div>
        ) : (
          <button
            onClick={() => setPicking(true)}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border py-2.5 text-sm text-muted transition hover:border-brand"
          >
            <Plus size={16} /> Soru ekle
          </button>
        )
      )}
    </div>
  );
}
