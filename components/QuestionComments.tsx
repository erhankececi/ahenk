"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send } from "lucide-react";

type C = { id: string; user_id: string; message: string; created_at: string; author?: string };

export function QuestionComments({ questionId, meId, initial }: { questionId: string; meId: string; initial: C[] }) {
  const supabase = createClient();
  const [list, setList] = useState<C[]>(initial);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    const msg = text.trim();
    if (!msg || busy) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("question_comments")
      .insert({ question_id: questionId, user_id: meId, message: msg })
      .select("id, user_id, message, created_at")
      .single();
    setBusy(false);
    if (!error && data) {
      setList((l) => [...l, data as C]);
      setText("");
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="font-bold">Mesajlar</h2>
      {list.length === 0 && <p className="text-sm text-muted">Henüz mesaj yok. İlk mesajı yaz.</p>}
      <div className="space-y-2">
        {list.map((c) => {
          const mine = c.user_id === meId;
          return (
            <div key={c.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${mine ? "btn-primary rounded-br-md" : "glass rounded-bl-md"}`}>
                {c.message}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Bir mesaj yaz…"
          className="flex-1 rounded-full border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary/50"
        />
        <button onClick={send} disabled={!text.trim() || busy} className="btn-primary flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-40">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
