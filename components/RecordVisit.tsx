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
    supabase
      .from("profile_visits")
      .upsert(
        { visitor_id: meId, visited_id: targetId, visited_at: new Date().toISOString() },
        { onConflict: "visitor_id,visited_id" }
      )
      .then(() => {});
  }, [meId, targetId]);

  return null;
}
