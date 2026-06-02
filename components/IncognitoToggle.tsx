"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { EyeOff, Lock } from "lucide-react";

export default function IncognitoToggle({
  userId,
  initial,
  premium,
}: {
  userId: string;
  initial: boolean;
  premium: boolean;
}) {
  const supabase = createClient();
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!premium || busy) return;
    setBusy(true);
    const next = !on;
    const { error } = await supabase.from("profiles").update({ incognito: next }).eq("id", userId);
    setBusy(false);
    if (!error) setOn(next);
  }

  return (
    <div className="mb-6 flex items-center gap-3 rounded-3xl border border-border bg-surface p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-elevated">
        <EyeOff size={18} className={on && premium ? "text-brand" : "text-muted"} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Gizli mod</p>
        <p className="text-xs text-muted">
          Profilleri görüntülerken iz bırakma — "kim baktı" listesinde görünmezsin.
        </p>
      </div>
      {premium ? (
        <button
          onClick={toggle}
          disabled={busy}
          role="switch"
          aria-checked={on}
          aria-label="Gizli mod"
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-brand" : "bg-elevated"}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
              on ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      ) : (
        <Link
          href="/premium"
          aria-label="Premium ile aç"
          className="flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted transition hover:border-brand"
        >
          <Lock size={13} /> Premium
        </Link>
      )}
    </div>
  );
}
