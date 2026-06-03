import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Hash, Briefcase, MapPin, Sparkles, Languages, BadgeCheck, MessageCircle } from "lucide-react";
import { PremiumBadge, tierFrame, tierName, VipTag } from "@/components/PremiumBadge";
import TrustBadge from "@/components/TrustBadge";
import { themeClass } from "@/lib/themes";
import UserProfileActions from "@/components/UserProfileActions";
import BackButton from "@/components/BackButton";
import RecordVisit from "@/components/RecordVisit";

export const dynamic = "force-dynamic";

const VOICE_URL = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;

export default async function UserProfile({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: p } = await supabase.from("profiles_card").select("*").eq("id", params.id).single();

  if (!p) {
    return (
      <div className="px-4 py-24 text-center">
        <p className="text-muted">Profil bulunamadı.</p>
        <Link href="/eslesmeler" className="mt-4 inline-block text-sm text-brand">
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

  const tier = (p.tier as string) || "free";
  const attrs = [
    { Icon: Hash, label: "Üye No", value: p.member_no ? String(p.member_no) : null },
    { Icon: Briefcase, label: "Meslek", value: p.profession },
    { Icon: MapPin, label: "Şehir", value: p.city },
    { Icon: Sparkles, label: "Burç", value: p.zodiac },
    { Icon: Languages, label: "Diller", value: p.languages?.length ? p.languages.join(", ") : null },
  ].filter((a) => a.value);

  return (
    <div className={`min-h-dvh px-4 pb-24 pt-6 ${themeClass(p.theme)}`}>
      <div className="mb-2 flex items-center justify-between">
        <BackButton fallback="/kesfet" />
        {user && <UserProfileActions targetId={params.id} meId={user.id} />}
      </div>
      {user && <RecordVisit meId={user.id} targetId={params.id} />}

      <div className="flex flex-col items-center text-center">
        <div className={`rounded-3xl ${tierFrame(tier)}`}>
          <div className="brand-gradient flex h-24 w-24 items-center justify-center rounded-3xl text-3xl font-bold text-white">
            {p.name?.[0]?.toUpperCase() || "?"}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <h1 className={`text-2xl font-bold ${tierName(tier)}`}>
            {p.name}
            {p.age ? `, ${p.age}` : ""}
          </h1>
          {p.is_verified && <BadgeCheck size={20} className="text-brand" />}
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
            className="brand-gradient mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
          >
            <MessageCircle size={16} /> Mesaj gönder
          </Link>
        )}
      </div>

      {p.voice_card_path && (
        <audio controls src={VOICE_URL(p.voice_card_path)} className="mt-6 w-full" preload="none" />
      )}

      {attrs.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-surface">
          {attrs.map((a, i) => (
            <div
              key={a.label}
              className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border/60" : ""}`}
            >
              <a.Icon size={17} className="shrink-0 text-muted" />
              <span className="text-sm text-muted">{a.label}</span>
              <span className="ml-auto text-sm font-medium">{a.value}</span>
            </div>
          ))}
        </div>
      )}

      {p.bio && <p className="mt-6 text-sm leading-relaxed text-text/90">{p.bio}</p>}

      {Array.isArray(promptAnswers) && promptAnswers.length > 0 && (
        <div className="mt-6 space-y-2">
          {promptAnswers.map((pa: any) => (
            <div key={pa.prompt_id} className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-medium text-brand">{pa.prompt?.text}</p>
              <p className="mt-1 text-sm leading-relaxed">{pa.answer}</p>
            </div>
          ))}
        </div>
      )}

      {p.interests?.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {p.interests.map((it: string) => (
            <span key={it} className="rounded-full bg-elevated px-3 py-1 text-sm">
              {it}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
