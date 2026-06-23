"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";
import { rpcMessage } from "@/lib/questions";
import { LogIn } from "lucide-react";

export function JoinRoomButton({ roomId, isPaid, coinCost }: { roomId: string; isPaid: boolean; coinCost: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function join() {
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error: e } = await supabase.rpc("join_live_room", { p_room_id: roomId });
    setBusy(false);
    if (e) { setError(rpcMessage(e.message)); return; }
    router.refresh();
  }

  return (
    <div>
      <Button size="lg" className="w-full" disabled={busy} onClick={join}>
        <LogIn size={18} /> {busy ? "Katılınıyor…" : isPaid && coinCost > 0 ? `Odaya Katıl · ${coinCost} jeton` : "Odaya Katıl"}
      </Button>
      {error && <p className="mt-2 text-center text-sm text-danger">{error}</p>}
    </div>
  );
}
