import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { ChatWindow } from "@/components/ChatWindow";
import { previewUrl, signPhoto } from "@/lib/storage";
import { isActivePremium } from "@/lib/plans";

export default async function SohbetPage({ params }: { params: { matchId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: match } = await supabase
    .from("matches")
    .select("*")
    .eq("id", params.matchId)
    .single();

  if (!match || (match.user_a !== user!.id && match.user_b !== user!.id))
    redirect("/eslesmeler");

  const otherId = match.user_a === user!.id ? match.user_b : match.user_a;
  const { data: other } = await supabase
    .from("profiles_card")
    .select("name, is_verified, tier")
    .eq("id", otherId)
    .single();

  // Kendi aktif aboneliğim (arama kapısı): plan + süre kontrolü.
  const { data: meProf } = await supabase
    .from("profiles")
    .select("premium_plan, premium_until, theme")
    .eq("id", user!.id)
    .single();
  const myTier = isActivePremium(meProf) ? meProf?.premium_plan || "free" : "free";

  // Eşleşilen kişinin fotoğrafı: tam reveal (100) olunca imzalı ORİJİNAL,
  // aksi halde PUBLIC bulanık önizleme. Admin client RLS'i bypass eder.
  const admin = createAdminClient();
  const { data: photo } = await admin
    .from("photos")
    .select("path, preview_path")
    .eq("user_id", otherId)
    .order("position")
    .limit(1)
    .maybeSingle();

  let otherPhoto: string | null = null;
  if (photo) {
    otherPhoto =
      match.reveal_level >= 100
        ? await signPhoto(admin, photo.path)
        : previewUrl(photo.preview_path);
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("match_id", params.matchId)
    .order("created_at");

  return (
    <ChatWindow
      matchId={params.matchId}
      meId={user!.id}
      otherId={otherId}
      otherName={other?.name || "Biri"}
      otherVerified={other?.is_verified || false}
      otherPhoto={otherPhoto}
      revealLevel={match.reveal_level}
      initial={messages || []}
      myTier={myTier}
      otherTier={(other?.tier as string) || "free"}
      myTheme={(meProf?.theme as string) || "default"}
    />
  );
}
