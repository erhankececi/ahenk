"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Profil görüntülemesini "ziyaret" olarak kaydeder (premium "kimler baktı").
 * RLS: insert yalnız visitor_id = auth.uid() için izinli → tarayıcı client'ı yeterli.
 * Tekrar görüntülemeler visited_at'i tazeler (upsert).
 */
export default function RecordVisit({ meId, targetId }: { meId: string; targetId: string }) {
  useEffect(() => {
    if (!meId || meId === targetId) return;
    const supabase = createClient();
    // RPC: ziyareti kaydet + tekrar bakışları say (visit_count++).
    supabase.rpc("record_visit", { p_visited: targetId }).then(() => {});
  }, [meId, targetId]);

  return null;
}
