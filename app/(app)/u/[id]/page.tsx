import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  Hash, Briefcase, MapPin, Sparkles, Languages, BadgeCheck, Heart, Cigarette, Wine,
  PawPrint, Baby, Activity, Check, X, Lock, Star, AudioLines,
} from "lucide-react";
import { PremiumBadge, tierFrame, tierName, VipTag } from "@/components/PremiumBadge";
import TrustBadge from "@/components/TrustBadge";
import { karakterUyumu } from "@/lib/matchScore";
import { kurucuUye } from "@/lib/utils";
import {
  etiketBul, SMOKING_OPTS, DRINKING_OPTS, PETS_OPTS, GOAL_OPTS, KIDS_OPTS, EXERCISE_OPTS,
} from "@/lib/constants";
import { themeClass } from "@/lib/themes";
import UserProfileActions from "@/components/UserProfileActions";
import BackButton from "@/components/BackButton";
import RecordVisit from "@/components/RecordVisit";
import StoryHighlights from "@/components/StoryHighlights";
import ProfileActionBar from "@/components/ProfileActionBar";
import { getAppDict, normalizeLang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const VOICE_URL = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;

export default async function UserProfile({ params }: { params: { id: string } }) {
  const t = getAppDict(normalizeLang(cookies().get("lang")?.value)).profilDetay;
  const supabase = createClient();
  const { data: p } = await supabase.from("profiles_card").select("*").eq("id", params.id).single();

  if (!p) {
    return (
      <div className="flex min-h-dvh flex-col items-center px-4 pt-24 text-center">
        <span className="lp-monogram flex h-16 w-16 items-center justify-center rounded-2xl font-display text-2xl font-extrabold">A</span>
        <p className="mt-4 text-muted">{t.notFound}</p>
        <Link href="/eslesmeler" className="mt-4 inline-block text-sm font-medium text-accent">
          {t.back}
        </Link>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: match } = user
    ? await supabase
        .from("matches")
        .select("id")
        .or(
          `and(user_a.eq.${user.id},user_b.eq.${params.id}),and(user_a.eq.${params.id},user_b.eq.${user.id})`
        )
        .maybeSingle()
    : { data: null };

  const { data: promptAnswers } = await supabase
    .from("prompt_answers")
    .select("prompt_id, answer, prompt:prompts(text)")
    .eq("user_id", params.id);

  // Görüntüleyen kullanıcının yaşam tarzı (uyum hesabı için)
  const { data: meCard } = user
    ? await supabase.from("profiles_card").select("interests, hobbies, music, movies, languages, smoking, drinking, pets, relationship_goal, wants_kids, exercise, diet").eq("id", user.id).single()
    : { data: null };

  const uyum = user && user.id !== params.id && meCard
    ? karakterUyumu(meCard as any, p as any)
    : null;

  const tier = (p.tier as string) || "free";
  const initial = p.name?.[0]?.toUpperCase() || "?";
  // Keşfette/profilde fotoğraf kilitli — netlik sohbetle artar (eşleşme varsa daha açık).
  const clarity = match ? 65 : 25;

  const attrs = [
    { Icon: Hash, label: t.attrMemberNo, value: p.member_no ? String(p.member_no) : null },
    { Icon: Briefcase, label: t.attrProfession, value: p.profession },
    { Icon: MapPin, label: t.attrCity, value: p.city },
    { Icon: Sparkles, label: t.attrZodiac, value: p.zodiac },
    { Icon: Languages, label: t.attrLanguages, value: p.languages?.length ? p.languages.join(", ") : null },
    { Icon: Heart, label: t.attrLooking, value: etiketBul(GOAL_OPTS, p.relationship_goal) },
    { Icon: Baby, label: t.attrKids, value: etiketBul(KIDS_OPTS, p.wants_kids) },
    { Icon: Cigarette, label: t.attrSmoking, value: etiketBul(SMOKING_OPTS, p.smoking) },
    { Icon: Wine, label: t.attrDrinking, value: etiketBul(DRINKING_OPTS, p.drinking) },
    { Icon: PawPrint, label: t.attrPets, value: etiketBul(PETS_OPTS, p.pets) },
    { Icon: Activity, label: t.attrTempo, value: etiketBul(EXERCISE_OPTS, p.exercise) },
  ].filter((a) => a.value);

  const isSelf = user?.id === params.id;

  return (
    <div className={`min-h-dvh ${themeClass(p.theme)}`}>
      {user && <RecordVisit meId={user.id} targetId={params.id} />}

      {/* Header — Stitch: geri · AHENK · güvenlik */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.06] bg-bg/70 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+12px)] backdrop-blur-xl lg:mx-auto lg:max-w-6xl lg:px-0 lg:pt-8">
        <div className="flex w-10 justify-start">
          <BackButton fallback="/kesfet" />
        </div>
        <span className="font-display text-[15px] font-bold uppercase tracking-[0.28em] text-accent">AHENK</span>
        <div className="flex w-10 justify-end">
          {user && !isSelf ? (
            <UserProfileActions targetId={params.id} meId={user.id} />
          ) : (
            <span className="h-9 w-9" />
          )}
        </div>
      </header>

      {/* Masaüstü: solda foto/hero, sağda bilgiler — 2 sütun */}
      <div className="lg:mx-auto lg:grid lg:max-w-6xl lg:grid-cols-[minmax(0,440px)_1fr] lg:items-start lg:gap-10 lg:px-0 lg:pb-16 lg:pt-8">
        {/* Hero — kilitli profil (foto sohbetle netleşir): monogram + onyx/pirinç degrade */}
        <section className="relative aspect-[3/4] w-full overflow-hidden lg:sticky lg:top-8 lg:rounded-[32px] lg:border lg:border-white/[0.07]">
          <div className="theme-bg absolute inset-0" />
          <div className="absolute inset-0 grid place-items-center">
            <span className="select-none font-display text-[200px] font-bold leading-none text-white/[0.06]">{initial}</span>
          </div>
          <div className="theme-accent pointer-events-none absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-current opacity-[0.08] blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/35 to-bg/10" />

          <div className="absolute inset-x-0 bottom-0 space-y-3 p-6">
            {/* Rozet satırı */}
            <div className="flex flex-wrap items-center gap-2">
              {uyum && (
                <span className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent backdrop-blur-md">
                  <Star size={12} fill="currentColor" strokeWidth={0} /> %{uyum.score} {t.uyumSuffix}
                </span>
              )}
              {p.is_verified && (
                <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                  <BadgeCheck size={12} /> {t.verified}
                </span>
              )}
            </div>

            {/* İsim · meslek · şehir */}
            <div className="space-y-1">
              <h1 className={`font-display text-[28px] font-semibold leading-none text-white drop-shadow-sm ${tierName(tier)}`}>
                {p.name}
                <span className="font-normal text-white/80">{p.age ? `, ${p.age}` : ""}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
                {p.profession && (
                  <span className="flex items-center gap-1.5"><Briefcase size={14} strokeWidth={1.6} /> {p.profession}</span>
                )}
                {p.profession && p.city && <span className="h-1 w-1 rounded-full bg-white/30" />}
                {p.city && (
                  <span className="flex items-center gap-1.5"><MapPin size={14} strokeWidth={1.6} /> {p.city}</span>
                )}
              </div>
            </div>

            {/* Netlik kartı */}
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-accent">
                  <Lock size={12} /> {t.clarityLabel} %{clarity}
                </span>
                <span className="text-[11px] text-white/55">{t.clarityHint}</span>
              </div>
              <div className="relative grid h-12 w-12 shrink-0 place-items-center">
                <svg viewBox="0 0 48 48" className="h-12 w-12 -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                  <circle
                    cx="24" cy="24" r="20" fill="none" stroke="#C7A977" strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${(clarity / 100) * 125.6} 125.6`}
                  />
                </svg>
                <span className="absolute text-[10px] font-bold text-accent">%{clarity}</span>
              </div>
            </div>
          </div>
        </section>

      {/* Gövde */}
      <section className="space-y-7 px-5 pb-44 pt-6 lg:px-0 lg:pb-16 lg:pt-0">
        {/* Premium / kurucu / güven rozetleri (Ahenk ekstra — korunur) */}
        <div className="flex flex-wrap items-center gap-2">
          <PremiumBadge tier={tier} />
          {(tier === "platinum" || tier === "legend") && <VipTag tier={tier} />}
          {kurucuUye(p.member_no) && (
            <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
              <Sparkles size={12} /> {t.founder}
            </span>
          )}
          <TrustBadge
            compact
            data={{
              is_verified: p.is_verified,
              verification_status: (p as any).verification_status,
              created_at: (p as any).created_at,
              behavior_score: (p as any).behavior_score,
            }}
          />
        </div>

        {/* Karakter Özeti */}
        {p.bio && (
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{t.summaryTitle}</h3>
            <p className="border-l-2 border-accent/30 pl-4 text-[17px] font-light italic leading-relaxed text-text/90">
              “{p.bio}”
            </p>
          </div>
        )}

        {/* İlgi alanı çipleri */}
        {p.interests?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {p.interests.map((it: string) => (
              <span
                key={it}
                className="rounded-full border border-accent/30 bg-accent/[0.06] px-4 py-2 text-xs font-medium uppercase tracking-wider text-accent"
              >
                {it}
              </span>
            ))}
          </div>
        )}

        {/* Yaşam tarzı kartları (gerçek veri) */}
        {attrs.length > 0 && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {attrs.map((a) => (
              <div
                key={a.label}
                className="space-y-1.5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 backdrop-blur-md"
              >
                <a.Icon size={18} className="text-accent" strokeWidth={1.7} />
                <p className="text-[10px] font-bold uppercase tracking-tight text-muted">{a.label}</p>
                <p className="text-[13px] font-medium leading-tight text-text">{a.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Uyum kırılımı (gerçek hesap) */}
        {uyum && uyum.kalemler.length > 0 && (
          <div className="overflow-hidden rounded-3xl border border-accent/25 bg-accent/[0.05] p-5">
            <div className="flex items-center gap-4">
              <div className="relative grid h-16 w-16 shrink-0 place-items-center">
                <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-border" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.5" fill="none"
                    className="stroke-accent" strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${(uyum.score / 100) * 97.4} 97.4`}
                  />
                </svg>
                <span className="absolute text-sm font-bold text-accent">%{uyum.score}</span>
              </div>
              <div>
                <p className="font-display text-lg font-bold">{t.uyumTitle}</p>
                <p className="text-xs text-muted">{t.uyumDesc}</p>
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              {uyum.kalemler.slice(0, 6).map((k, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {k.ok ? (
                    <Check size={15} className="shrink-0 text-emerald-400" />
                  ) : (
                    <X size={15} className="shrink-0 text-muted" />
                  )}
                  <span className={k.ok ? "text-text/90" : "text-muted"}>{k.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prompt cevapları */}
        {Array.isArray(promptAnswers) && promptAnswers.length > 0 && (
          <div className="space-y-3">
            {promptAnswers.map((pa: any) => (
              <div key={pa.prompt_id} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 backdrop-blur-md">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">{pa.prompt?.text}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-text">“{pa.answer}”</p>
              </div>
            ))}
          </div>
        )}

        {/* Ses kartı */}
        {p.voice_card_path && (
          <div className="space-y-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <AudioLines size={18} className="text-accent" strokeWidth={1.8} />
              <span className="text-sm font-bold text-text">{t.voiceTitle}</span>
              <span className="text-xs text-muted">· {t.voiceHint}</span>
            </div>
            <audio controls src={VOICE_URL(p.voice_card_path)} className="w-full" preload="none" />
          </div>
        )}

        {/* Hikaye öne çıkanlar */}
        <StoryHighlights userId={params.id} mine={isSelf} />
      </section>
      </div>

      {/* Alt aksiyonlar — mevcut endpoint/route'lar (interact / sohbet / mağaza) */}
      {user && !isSelf && (
        <ProfileActionBar
          targetId={params.id}
          matchId={match?.id ?? null}
          t={{ message: t.actionMessage, like: t.actionLike, liked: t.actionLiked, gift: t.actionGift }}
        />
      )}
    </div>
  );
}
