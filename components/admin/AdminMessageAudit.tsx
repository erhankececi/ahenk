"use client";

import { useState } from "react";
import { Search, ShieldAlert } from "lucide-react";

type Msg = { id: string; fromTarget: boolean; withUser: string; type: string; body: string | null; created_at: string };

export default function AdminMessageAudit() {
  const [memberNo, setMemberNo] = useState("");
  const [reason, setReason] = useState("");
  const [data, setData] = useState<{ target: any; messages: Msg[] } | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function incele() {
    const mn = memberNo.replace(/\D/g, "");
    if (!mn) { setErr("Üye no gir (sadece rakam)."); return; }
    setLoading(true); setErr(""); setData(null);
    const r = await fetch(`/api/admin/messages?memberNo=${mn}&reason=${encodeURIComponent(reason)}`);
    const j = await r.json().catch(() => ({}));
    setLoading(false);
    if (!r.ok) { setErr(j.error || "İncelenemedi."); return; }
    setData(j);
  }

  return (
    <div className="rounded-2xl border border-warning/30 bg-surface p-4">
      <p className="mb-1 flex items-center gap-2 text-sm font-medium text-warning">
        <ShieldAlert size={15} /> Mesaj inceleme (denetimli)
      </p>
      <p className="mb-3 text-xs text-muted">Her inceleme audit kaydına yazılır (kim/ne zaman/kime). Yalnız şikayet/yasal sebeple kullan.</p>
      <div className="flex flex-wrap gap-2">
        <input
          value={memberNo}
          onChange={(e) => setMemberNo(e.target.value)}
          placeholder="Üye no (ör. 100023)"
          className="w-36 rounded-xl border border-border bg-elevated px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Sebep (şikayet no / yasal talep)"
          className="min-w-0 flex-1 rounded-xl border border-border bg-elevated px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button onClick={incele} disabled={loading} className="brand-gradient flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold disabled:opacity-50">
          <Search size={14} /> {loading ? "…" : "İncele"}
        </button>
      </div>
      {err && <p className="mt-2 text-xs text-error">{err}</p>}

      {data && (
        <div className="mt-3">
          <p className="mb-2 text-sm font-medium">
            {data.target.name} · #{data.target.member_no} · {data.target.city || "—"}
            {data.target.banned && <span className="ml-1 text-xs text-error">(yasaklı)</span>}
          </p>
          <div className="max-h-80 space-y-1.5 overflow-y-auto">
            {data.messages.length === 0 && <p className="text-sm text-muted">Mesaj yok.</p>}
            {data.messages.map((m) => (
              <div key={m.id} className={`rounded-xl border border-border px-3 py-2 text-sm ${m.fromTarget ? "bg-elevated" : "bg-surface"}`}>
                <p className="text-[11px] text-muted">
                  {m.fromTarget ? "→ gönderdi" : "← aldı"} · {m.withUser} · {new Date(m.created_at).toLocaleString("tr-TR")}
                </p>
                <p className="mt-0.5 break-words">
                  {m.type === "voice" ? (m.body ? `🎤 ${m.body}` : "🎤 sesli mesaj") : m.type === "image" ? "🖼️ fotoğraf" : m.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
