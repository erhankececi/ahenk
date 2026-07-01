import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getIncomingLikes } from "@/lib/likes";
import { isActivePremium } from "@/lib/plans";
import { getMatchListRows } from "@/lib/matchList";
import { Heart, Lock, ChevronRight, MessageCircle } from "lucide-react";
import MatchList from "@/components/MatchList";
import { cookies } from "next/headers";
import { normalizeLang, getAppDict } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function Eslesmeler() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [likes, { data: me }] = await Promise.all([
    getIncomingLikes(user!.id),
    supabase.from("profiles").select("premium_plan, premium_until").eq("id", user!.id).single(),
  ]);
  const premium = isActivePremium(me);
  const tm = getAppDict(normalizeLang(cookies().get("lang")?.value)).mesajlar;

  const rows = await getMatchListRows(user!.id, tm);

  const likesCard = likes.count > 0 && (
    <Link
      href="/begenenler"
      className="lp-panel-hover mb-4 flex items-center gap-3 p-3.5"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10">
        <Heart size={18} className="text-accent" fill="currentColor" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-text">{tm.likesTitle}</p>
        <p className="text-xs text-muted">
          {premium
            ? tm.likesPremium.replace("{n}", String(likes.count))
            : tm.likesFree.replace("{n}", String(likes.count))}
        </p>
      </div>
      {!premium && <Lock size={15} className="shrink-0 text-muted" />}
      <ChevronRight size={18} className="shrink-0 text-muted" />
    </Link>
  );

  const emptyState = (
    <div className="mt-20 flex flex-col items-center text-center">
      <span className="lp-monogram flex h-16 w-16 items-center justify-center rounded-2xl font-display text-2xl font-extrabold">
        A
      </span>
      <p className="mt-4 font-display text-lg font-semibold text-text">{tm.noChats}</p>
      <p className="mt-1.5 max-w-xs text-sm leading-6 text-muted">
        {tm.noChatsDesc}
      </p>
      <Link href="/kesfet" className="lp-cta-gold mt-6 inline-flex rounded-full px-6 py-3 text-sm font-semibold">
        {tm.goDiscover}
      </Link>
    </div>
  );

  return (
    <div className="lp-page min-h-dvh px-4 pb-28 pt-6 lg:-mb-8 lg:flex lg:h-dvh lg:min-h-0 lg:gap-0 lg:overflow-hidden lg:px-0 lg:pb-0 lg:pt-0">
      {/* Masaüstü: sol panel = eşleşme/konuşma listesi (sabit genişlik, kaydırılabilir) */}
      <div className="lg:flex lg:h-full lg:w-[380px] lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-border lg:px-4 lg:py-6">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Ahenk</p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-[-0.04em] text-text">{tm.title}</h1>
        </div>

        {likesCard}

        {rows.length === 0 ? emptyState : <MatchList meId={user!.id} rows={rows} />}
      </div>

      {/* Masaüstü: sağ panel = seçim yapılmadığında boş durum (WhatsApp Web tarzı) */}
      <div className="hidden lg:flex lg:h-full lg:flex-1 lg:flex-col lg:items-center lg:justify-center lg:gap-3 lg:text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-elevated text-muted">
          <MessageCircle size={26} />
        </span>
        <p className="font-display text-lg font-semibold text-text">{tm.title}</p>
        <p className="max-w-xs text-sm leading-6 text-muted">{tm.noChatsDesc}</p>
      </div>
    </div>
  );
}
