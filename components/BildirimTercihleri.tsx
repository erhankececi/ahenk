"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Prefs = Record<string, boolean>;

const ROWS: { key: string; label: string; desc: string }[] = [
  { key: "daily", label: "Günlük soru ve gün serisi", desc: "Serini koru, 20 jeton hatırlatması" },
  { key: "etkilesim", label: "Beğeni ve ziyaretler", desc: "Biri seni beğendi / profilini gezdi" },
  { key: "mesaj", label: "Mesajlar", desc: "Yeni mesaj ve eşleşmeler" },
  { key: "hediye", label: "Hediye, davet ve jeton", desc: "Hediye geldi / davetin katıldı" },
];

export default function BildirimTercihleri() {
  const supabase = createClient();
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [uid, setUid] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUid(data.user.id);
      const { data: p } = await supabase.from("profiles").select("notif_prefs").eq("id", data.user.id).single();
      setPrefs((p?.notif_prefs as Prefs) || {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const acik = (k: string) => !prefs || prefs[k] !== false; // eksik = açık

  async function degistir(k: string) {
    if (!prefs || !uid) return;
    const next = { ...prefs, [k]: !acik(k) };
    setPrefs(next);
    await supabase.from("profiles").update({ notif_prefs: next }).eq("id", uid);
  }

  return (
    <div>
      <p className="px-1 pb-2 text-xs leading-4 text-muted">
        Ahenk'te hangi önemli gelişmelerden haberdar olmak istediğini seç.
      </p>
      <div className="ahenk-panel divide-y divide-white/[0.06] overflow-hidden rounded-2xl">
        {ROWS.map((r) => {
          const on = acik(r.key);
          return (
            <button
              key={r.key}
              onClick={() => degistir(r.key)}
              disabled={!prefs}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.03] disabled:opacity-60"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text">{r.label}</p>
                <p className="text-xs text-muted">{r.desc}</p>
              </div>
              <span
                className={`relative h-6 w-10 shrink-0 rounded-full transition ${
                  on ? "bg-accent" : "border border-white/15 bg-white/[0.06]"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-[#0E0D10] transition-all ${
                    on ? "left-[1.125rem]" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
