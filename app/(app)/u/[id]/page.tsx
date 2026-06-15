import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Hash, Briefcase, MapPin, Sparkles, Languages, BadgeCheck, MessageCircle, Heart, Cigarette, Wine, PawPrint, Baby, Activity, Check, X } from "lucide-react";
import { PremiumBadge, tierFrame, tierName, VipTag } from "@/components/PremiumBadge";
import TrustBadge from "@/components/TrustBadge";
import { karakterUyumu } from "@/lib/matchScore";
import {
  etiketBul, SMOKING_OPTS, DRINKING_OPTS, PETS_OPTS, GOAL_OPTS, KIDS_OPTS, EXERCISE_OPTS,
} from "@/lib/constants";
import { themeClass } from "@/lib/themes";
import UserProfileActions from "@/components/UserProfileActions";
import BackButton from "@/components/BackButton";
import RecordVisit from "@/components/RecordVisit";
import StoryHighlights from "@/components/StoryHighlights";

export const dynamic = "force-dynamic";

const VOICE_URL = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;

export default async function UserProfile({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: p } = await supabase.from("profiles_card").select("*").eq("id", params.id).single();

  if (!p) {
    return (
      <div className="lp-page flex min-h-dvh flex-col items-center px-4 pt-24 text-center">
        <span className="lp-monogram flex h-16 w-16 items-center justify-center rounded-2xl font-display text-2xl font-extrabold">A</span>
        <p className="mt-4 text-muted">Profil bulunamadı.</p>
        <Link href="/eslesmeler" className="mt-4 inline-block text-sm font-medium text-accent">
          Geri dön
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
  const attrs = [
    { Icon: Hash, label: "Üye No", value: p.member_no ? String(p.member_no) : null },
    { Icon: Briefcase, label: "Meslek", value: p.profession },
    { Icon: MapPin, label: "Şehir", value: p.city },
    { Icon: Sparkles, label: "Burç", value: p.zodiac },
    { Icon: Languages, label: "Diller", value: p.languages?.length ? p.languages.join(", ") : null },
    { Icon: Heart, label: "Arıyor", value: etiketBul(GOAL_OPTS, p.relationship_goal) },
    { Icon: Baby, label: "Çocuk", value: etiketBul(KIDS_OPTS, p.wants_kids) },
    { Icon: Cigarette, label: "Sigara", value: etiketBul(SMOKING_OPTS, p.smoking) },
    { Icon: Wine, label: "Alkol", value: etiketBul(DRINKING_OPTS, p.drinking) },
    { Icon: PawPrint, label: "Evcil hayvan", value: etiketBul(PETS_OPTS, p.pets) },
    { Icon: Activity, label: "Tempo", value: etiketBul(EXERCISE_OPTS, p.exercise) },
  ].filter((a) => a.value);

  return (
    <div className={`lp-page min-h-dvh px-4 pb-28 pt-6 ${themeClass(p.theme)}`}>
      <div className="mb-2 flex items-center justify-between">
        <BackButton fallback="/kesfet" />
        {user && <UserProfileActions targetId={params.id} meId={user.id} />}
      </div>
      {user && <RecordVisit meId={user.id} targetId={params.id} />}

      <div className="flex flex-col items-center text-center">
        <div className={`rounded-3xl ${tierFrame(tier)}`}>
          <div className="lp-monogram flex h-24 w-24 items-center justify-center rounded-3xl text-3xl font-bold">
            {p.name?.[0]?.toUpperCase() || "?"}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <h1 className={`text-2xl font-bold ${tierName(tier)}`}>
            {p.name}
            {p.age ? `, ${p.age}` : ""}
          </h1>
          {p.is_verified && <BadgeCheck size={20} className="text-accent" />}
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <PremiumBadge tier={tier} />
          {(tier === "platinum" || tier === "legend") && <VipTag tier={tier} />}
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
        {match && (
          <Link
            href={`/sohbet/${match.id}`}
            className="lp-cta-gold mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
          >
            <MessageCircle size={16} /> Mesaj gönder
          </Link>
        )}
      </div>

      <StoryHighlights userId={params.id} mine={user?.id === params.id} />

      {p.voice_card_path && (
        <audio controls src={VOICE_URL(p.voice_card_path)} className="mt-6 w-full" preload="none" />
      )}

      {uyum && uyum.kalemler.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent p-5">
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
              <p className="font-display text-lg font-bold">Uyum</p>
              <p className="text-xs text-muted">Karakter & yaşam tarzına göre</p>
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

      {attrs.length > 0 && (
        <div className="lp-panel mt-6 overflow-hidden rounded-3xl">
          {attrs.map((a, i) => (
            <div
              key={a.label}
              className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-white/[0.06]" : ""}`}
            >
              <a.Icon size={17} className="shrink-0 text-accent" />
              <span className="text-sm text-muted">{a.label}</span>
              <span className="ml-auto text-sm font-medium text-text">{a.value}</span>
            </div>
          ))}
        </div>
      )}

      {p.bio && <p className="mt-6 text-sm leading-relaxed text-text/90">{p.bio}</p>}

      {Array.isArray(promptAnswers) && promptAnswers.length > 0 && (
        <div className="mt-6 space-y-2">
          {promptAnswers.map((pa: any) => (
            <div key={pa.prompt_id} className="lp-panel rounded-2xl p-4">
              <p className="text-xs font-medium text-accent">{pa.prompt?.text}</p>
              <p className="mt-1 text-sm leading-relaxed text-text">{pa.answer}</p>
            </div>
          ))}
        </div>
      )}

      {p.interests?.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {p.interests.map((it: string) => (
            <span key={it} className="lp-chip rounded-full px-3 py-1 text-sm">
              {it}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
