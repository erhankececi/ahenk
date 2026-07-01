import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProfileActions } from "@/components/ProfileActions";
import VibeVoiceCard from "@/components/VibeVoiceCard";
import { signPhoto } from "@/lib/storage";
import { yas, uyeNo, kurucuUye } from "@/lib/utils";
import {
  BadgeCheck,
  Crown,
  Eye,
  Shield,
  Pencil,
  Zap,
  Heart,
  Ban,
  MessageSquare,
  Hash,
  Briefcase,
  MapPin,
  Languages,
  Calendar,
  Sparkles,
  ChevronRight,
  Trophy,
  TrendingUp,
  Settings,
} from "lucide-react";
import { PremiumBadge, tierFrame, tierName, VipTag, MembershipCard } from "@/components/PremiumBadge";
import CopyButton from "@/components/CopyButton";
import { isActivePremium } from "@/lib/plans";
import { themeClass } from "@/lib/themes";
import { cookies } from "next/headers";
import { normalizeLang, getAppDict } from "@/lib/i18n";
import ProfileCompletion from "@/components/ProfileCompletion";
import PhotoManager from "@/components/PhotoManager";
import PromptEditor from "@/components/PromptEditor";
import Achievements from "@/components/Achievements";
import TrustBadge from "@/components/TrustBadge";
import StoryHighlights from "@/components/StoryHighlights";
import IlkAdimlar from "@/components/IlkAdimlar";
import ProfileTabs from "@/components/ProfileTabs";

export const dynamic = "force-dynamic";

export default async function Profil() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tpr = getAppDict(normalizeLang(cookies().get("lang")?.value)).profil;
  const { data: p } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
  const { data: photoRows } = await supabase
    .from("photos")
    .select("id, path, preview_path, position")
    .eq("user_id", user!.id)
    .order("position");

  // Kendi fotoğrafları private kovada — sahibi imzalı URL ile görür.
  const photos = await Promise.all(
    (photoRows || []).map(async (ph) => ({
      id: ph.id as string,
      path: ph.path as string,
      preview_path: (ph.preview_path as string) ?? null,
      position: (ph.position as number) ?? 0,
      url: await signPhoto(supabase, ph.path),
    }))
  );

  const boostAktif = p?.boost_until && new Date(p.boost_until) > new Date();
  const tier = p?.premium_plan || "free";
  const premiumActive = isActivePremium(p);
  const katilim = p?.created_at
    ? new Date(p.created_at).toLocaleDateString("tr-TR", { year: "numeric", month: "long" })
    : null;
  const attrs = [
    { Icon: Hash, label: tpr.attrMemberNo, value: uyeNo(p?.member_no), copy: uyeNo(p?.member_no) },
    { Icon: Briefcase, label: tpr.attrProfession, value: p?.profession || null, copy: null },
    { Icon: MapPin, label: tpr.attrCity, value: p?.city || null, copy: null },
    { Icon: Sparkles, label: tpr.attrZodiac, value: p?.zodiac || null, copy: null },
    { Icon: Languages, label: tpr.attrLanguages, value: p?.languages?.length ? p.languages.join(", ") : null, copy: null },
    { Icon: Calendar, label: tpr.attrJoined, value: katilim, copy: null },
  ].filter((a) => a.value);

  const completionItems = [
    { label: tpr.ciFoto, done: (photos?.length || 0) > 0, href: "/onboarding" },
    { label: tpr.ciBio, done: !!p?.bio, href: "/onboarding" },
    { label: tpr.ciInterests, done: !!p?.interests?.length, href: "/onboarding" },
    { label: tpr.ciProfession, done: !!p?.profession, href: "/onboarding" },
    { label: tpr.ciCity, done: !!p?.city, href: "/onboarding" },
    { label: tpr.ciVoice, done: !!p?.voice_card_path },
  ];

  const profileStats = [
    {
      Icon: Eye,
      label: tpr.statVisibility,
      value: premiumActive ? tpr.valPremium : tpr.valStandard,
    },
    {
      Icon: TrendingUp,
      label: tpr.statEnergy,
      value: typeof p?.energy_score === "number" ? `${Math.round(p.energy_score)}` : tpr.valReady,
    },
    {
      Icon: MessageSquare,
      label: tpr.statChat,
      value: p?.voice_card_path ? tpr.valVoice : tpr.valClassic,
    },
  ];

  // ——— SEKME 1: PROFİL (kimlik · görünüm · sosyal özet) ———
  const profilTab = (
    <div>
      <section className={`lp-panel mb-5 overflow-hidden p-0 ${premiumActive ? "lux-enter" : ""}`}>
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-32 bg-[#151318]" />
          <div className="absolute inset-x-0 top-0 h-px bg-[#C7A977]/30" />

          <div className="relative px-4 pb-5 pt-5">
            <div className="flex items-start gap-4">
              <div className={`rounded-[2rem] border border-[#C7A977]/30 bg-[#0E0D10] p-1 shadow-[0_22px_80px_rgba(0,0,0,0.48)] ${tierFrame(tier)}`}>
                <div className="relative h-28 w-28 overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#151318]">
                  {photos?.[0]?.url ? (
                    <img src={photos[0].url} className="h-full w-full object-cover" alt="" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#0E0D10]">
                      <span className="lp-monogram text-5xl">A</span>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
              </div>

              <div className="min-w-0 flex-1 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className={`truncate text-[28px] font-semibold tracking-[-0.05em] text-text ${tierName(tier)}`}>
                    {p?.name || tpr.nameFallback}
                  </h2>
                  {p?.is_verified && <BadgeCheck className="text-accent" size={20} />}
                </div>

                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-muted">
                  {yas(p?.birthdate) ? <span>{yas(p?.birthdate)}</span> : null}
                  {yas(p?.birthdate) && p?.city ? <span className="text-white/20">·</span> : null}
                  {p?.city ? <span>{p.city}</span> : null}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <PremiumBadge tier={tier} />
                  {(tier === "platinum" || tier === "legend") && <VipTag tier={tier} />}
                  {kurucuUye(p?.member_no) && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                      <Sparkles size={12} /> {tpr.founding}
                    </span>
                  )}
                  {boostAktif && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#C7A977]/30 bg-[#C7A977]/10 px-2.5 py-1 text-xs font-medium text-accent">
                      <Zap size={12} /> {tpr.boostActive}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {p?.bio && (
              <div className="mt-5 rounded-3xl border border-white/10 bg-black/18 p-4">
                <p className="text-sm leading-6 text-text/88">{p.bio}</p>
              </div>
            )}

            <div className="mt-4 grid grid-cols-3 gap-2">
              {profileStats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/10 bg-[#0E0D10]/70 p-3">
                  <s.Icon size={16} className="mb-2 text-accent" />
                  <p className="text-[11px] text-muted">{s.label}</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-text">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mb-5">
        <MembershipCard tier={premiumActive ? tier : null} name={p?.name} />
      </div>

      <div className="mb-5">
        <IlkAdimlar />
      </div>

      {!premiumActive && (
        <Link
          href="/premium?source=profile_card"
          className="lp-panel-hover mb-5 flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#C7A977]/30 bg-[#C7A977]/10 text-accent">
              <Crown size={19} />
            </div>
            <div>
              <p className="font-semibold text-text">{tpr.upsellTitle}</p>
              <p className="text-xs leading-5 text-muted">
                {tpr.upsellDesc}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="shrink-0 text-muted" />
        </Link>
      )}

      {attrs.length > 0 && (
        <section className="lp-panel mb-5 p-0">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
            <div>
              <h3 className="text-sm font-semibold text-text">{tpr.infoTitle}</h3>
              <p className="mt-0.5 text-xs text-muted">{tpr.infoDesc}</p>
            </div>
            <Shield size={17} className="text-accent" />
          </div>

          <div className="divide-y divide-white/10">
            {attrs.map((a) => (
              <div key={a.label} className="flex items-center gap-3 px-4 py-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#0E0D10] text-accent">
                  <a.Icon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted">{a.label}</p>
                  <p className="truncate text-sm font-medium text-text">{a.value}</p>
                </div>
                {a.copy && (
                  <div className="ml-auto">
                    <CopyButton text={a.copy} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {p?.interests?.length > 0 && (
        <section className="lp-panel p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text">{tpr.interestsTitle}</h3>
              <p className="mt-0.5 text-xs text-muted">{tpr.interestsDesc}</p>
            </div>
            <Heart size={17} className="text-accent" />
          </div>
          <div className="flex flex-wrap gap-2">
            {p.interests.map((i: string) => (
              <span key={i} className="lp-chip text-sm">
                {i}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );

  // ——— SEKME 2: İÇERİK (vitrin · düzenlenebilir) ———
  const icerikTab = (
    <div className="space-y-5">
      <section className="lp-panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text">{tpr.photosTitle}</h3>
            <p className="mt-0.5 text-xs text-muted">{tpr.photosDesc}</p>
          </div>
          <Sparkles size={17} className="text-accent" />
        </div>
        <PhotoManager userId={user!.id} initial={photos} />
      </section>

      <section className="lp-panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text">{tpr.storiesTitle}</h3>
            <p className="mt-0.5 text-xs text-muted">{tpr.storiesDesc}</p>
          </div>
          <Eye size={17} className="text-accent" />
        </div>
        <StoryHighlights userId={user!.id} mine />
      </section>

      <section className="lp-panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text">{tpr.promptsTitle}</h3>
            <p className="mt-0.5 text-xs text-muted">{tpr.promptsDesc}</p>
          </div>
          <MessageSquare size={17} className="text-accent" />
        </div>
        <PromptEditor userId={user!.id} />
      </section>

      <section className="lp-panel p-4">
        <VibeVoiceCard
          userId={user!.id}
          initialVibe={p?.vibe}
          initialVoicePath={p?.voice_card_path}
        />
      </section>
    </div>
  );

  // ——— SEKME 3: ROZETLER (güven · ilerleme) ———
  const rozetlerTab = (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#151318]/80 shadow-[0_18px_80px_rgba(0,0,0,0.24)]">
        <ProfileCompletion items={completionItems} title={tpr.completionTitle} hint={tpr.completionHint} />
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#151318]/80">
        <TrustBadge
          data={{
            created_at: p?.created_at,
            is_verified: p?.is_verified,
            verification_status: p?.verification_status,
            behavior_score: p?.behavior_score,
            photoCount: photos?.length || 0,
          }}
        />
      </div>

      <section className="lp-panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text">{tpr.achievementsTitle}</h3>
            <p className="mt-0.5 text-xs text-muted">{tpr.achievementsDesc}</p>
          </div>
          <Trophy size={17} className="text-accent" />
        </div>
        <Achievements />
      </section>
    </div>
  );

  // ——— MASAÜSTÜ: SOL SÜTUN (fotoğraf galerisi) ———
  const masaustuGaleri = (
    <div className="hidden lg:block lg:sticky lg:top-6">
      <section className="lp-panel overflow-hidden p-0">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#151318]">
          {photos?.[0]?.url ? (
            <img src={photos[0].url} className="h-full w-full object-cover" alt="" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#0E0D10]">
              <span className="lp-monogram text-6xl">A</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h2 className={`truncate text-xl font-semibold tracking-[-0.04em] text-text ${tierName(tier)}`}>
              {p?.name || tpr.nameFallback}
            </h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-sm text-white/80">
              {yas(p?.birthdate) ? <span>{yas(p?.birthdate)}</span> : null}
              {yas(p?.birthdate) && p?.city ? <span className="text-white/30">·</span> : null}
              {p?.city ? <span>{p.city}</span> : null}
            </p>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">{tpr.photosTitle}</h3>
            <Sparkles size={16} className="text-accent" />
          </div>
          <PhotoManager userId={user!.id} initial={photos} />
        </div>
      </section>
    </div>
  );

  return (
    <div className={`lp-page min-h-dvh px-4 pb-28 pt-5 ${themeClass(p?.theme)}`}>
      <div className="mx-auto w-full max-w-3xl lg:max-w-6xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{tpr.eyebrow}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-text">{tpr.title}</h1>
          </div>

          <Link
            href="/ayarlar"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#151318] text-text shadow-[0_18px_60px_rgba(0,0,0,0.35)] transition hover:border-[#C7A977]/45 hover:text-accent"
            aria-label={tpr.settingsAria}
          >
            <Settings size={18} />
          </Link>
        </div>

        <div className="lg:grid lg:grid-cols-[380px_1fr] lg:items-start lg:gap-8">
          {masaustuGaleri}

          <div className="lg:min-w-0">
            <ProfileTabs
              profil={profilTab}
              icerik={icerikTab}
              rozetler={rozetlerTab}
              labels={{ profil: tpr.tabProfil, icerik: tpr.tabContent, rozetler: tpr.tabBadges }}
            />

            <section className="mt-5 space-y-2">
              <Link href="/onboarding" className="lp-panel-hover flex items-center gap-3 px-4 py-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#151318] text-accent">
                  <Pencil size={18} />
                </div>
                <span className="font-medium text-text">{tpr.editProfile}</span>
                <ChevronRight size={17} className="ml-auto text-muted" />
              </Link>

              <Link href="/ayarlar" className="lp-panel-hover flex items-center gap-3 px-4 py-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#151318] text-accent">
                  <Settings size={18} />
                </div>
                <span className="font-medium text-text">{tpr.settings}</span>
                <ChevronRight size={17} className="ml-auto text-muted" />
              </Link>

              {p?.is_admin && (
                <Link href="/admin" className="lp-panel-hover flex items-center gap-3 px-4 py-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#151318] text-accent">
                    <Shield size={18} />
                  </div>
                  <span className="font-medium text-text">{tpr.adminPanel}</span>
                  <ChevronRight size={17} className="ml-auto text-muted" />
                </Link>
              )}
            </section>

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-[#151318]/60 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#0E0D10] text-muted">
                  <Ban size={17} />
                </div>
                <div>
                  <p className="text-sm font-medium text-text">{tpr.safeTitle}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {tpr.safeDesc}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <ProfileActions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
