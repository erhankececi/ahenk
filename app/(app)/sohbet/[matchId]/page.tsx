import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { ChatWindow } from "@/components/ChatWindow";
import { previewUrl, signPhoto } from "@/lib/storage";
import { isActivePremium } from "@/lib/plans";
import { getMatchListRows } from "@/lib/matchList";
import { normalizeLang, getAppDict } from "@/lib/i18n";
import MatchList from "@/components/MatchList";

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
    .select("name, is_verified, tier, lang")
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

  // "Yüz yüze görüştük" durumu
  const { data: metRows } = await supabase
    .from("met_confirmations")
    .select("user_id")
    .eq("match_id", params.matchId);
  const metByMe = (metRows || []).some((r) => r.user_id === user!.id);
  const metBoth = (metRows || []).length >= 2;

  // Son buluşma önerisi durumu
  const { data: meetRow } = await supabase
    .from("meet_requests")
    .select("from_user, kind, status")
    .eq("match_id", params.matchId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const meetInit = meetRow
    ? { kind: meetRow.kind as string, status: meetRow.status as string, fromMe: meetRow.from_user === user!.id }
    : null;

  // Masaüstü split-pane: sol panelde eşleşme listesi (aktif sohbet vurgulanır) — sadece lg:'de kullanılır.
  const tm = getAppDict(normalizeLang(cookies().get("lang")?.value)).mesajlar;
  const rows = await getMatchListRows(user!.id, tm);

  return (
    <div className="lg:-mb-8 lg:flex lg:h-dvh lg:min-h-0">
      {/* Masaüstü: sol panel = eşleşme/konuşma listesi (WhatsApp Web tarzı split-pane) */}
      <div className="hidden lg:flex lg:h-full lg:w-[380px] lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-border lg:px-4 lg:py-6">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Ahenk</p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-[-0.04em] text-text">{tm.title}</h1>
        </div>
        {rows.length > 0 && (
          <MatchList meId={user!.id} rows={rows} activeMatchId={params.matchId} />
        )}
      </div>

      {/* Sağ panel (mobilde tam ekran, masaüstünde kalan genişlik) */}
      <div className="lg:h-full lg:flex-1 lg:min-w-0">
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
          otherLang={(other?.lang as string) || "tr"}
          myTheme={(meProf?.theme as string) || "default"}
          initialChemistry={(match.chemistry_score as number) || 0}
          metByMe={metByMe}
          metBoth={metBoth}
          meetInit={meetInit}
        />
      </div>
    </div>
  );
}
