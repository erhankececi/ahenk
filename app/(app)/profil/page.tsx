import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProfileActions } from "@/components/ProfileActions";
import VibeVoiceCard from "@/components/VibeVoiceCard";
import ProfilRetention from "@/components/ProfilRetention";
import { signPhoto } from "@/lib/storage";
import { yas } from "@/lib/utils";
import {
  BadgeCheck, Crown, Eye, Shield, Pencil, Zap, Wallet, Heart, Ban, MessageSquare,
  Hash, Briefcase, MapPin, Languages, Calendar, Sparkles, ChevronRight, Trophy, TrendingUp,
} from "lucide-react";
import { PremiumBadge, tierFrame, tierName, VipTag, MembershipCard } from "@/components/PremiumBadge";
import CopyButton from "@/components/CopyButton";
import { isActivePremium } from "@/lib/plans";
import { themeClass } from "@/lib/themes";
import ThemePicker from "@/components/ThemePicker";
import ProfileCompletion from "@/components/ProfileCompletion";
import VerifyRequest from "@/components/VerifyRequest";
import IncognitoToggle from "@/components/IncognitoToggle";
import PhotoManager from "@/components/PhotoManager";
import PromptEditor from "@/components/PromptEditor";
import Achievements from "@/components/Achievements";
import TrustBadge from "@/components/TrustBadge";

export const dynamic = "force-dynamic";

export default async function Profil() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    { Icon: Hash, label: "Üye No", value: p?.member_no ? String(p.member_no) : null, copy: p?.member_no ? String(p.member_no) : null },
    { Icon: Briefcase, label: "Meslek", value: p?.profession || null, copy: null },
    { Icon: MapPin, label: "Şehir", value: p?.city || null, copy: null },
    { Icon: Sparkles, label: "Burç", value: p?.zodiac || null, copy: null },
    { Icon: Languages, label: "Diller", value: p?.languages?.length ? p.languages.join(", ") : null, copy: null },
    { Icon: Calendar, label: "Katılım", value: katilim, copy: null },
  ].filter((a) => a.value);

  const completionItems = [
    { label: "Fotoğraf", done: (photos?.length || 0) > 0, href: "/onboarding" },
    { label: "Biyografi", done: !!p?.bio, href: "/onboarding" },
    { label: "İlgi alanları", done: !!p?.interests?.length, href: "/onboarding" },
    { label: "Meslek", done: !!p?.profession, href: "/onboarding" },
    { label: "Şehir", done: !!p?.city, href: "/onboarding" },
    { label: "Ses kartı", done: !!p?.voice_card_path },
  ];

  return (
    <div className={`min-h-dvh px-4 pb-8 pt-6 ${themeClass(p?.theme)}`}>
      <div className={`mb-6 flex items-center gap-4 ${premiumActive ? "lux-enter" : ""}`}>
        <div className={`rounded-3xl ${tierFrame(tier)}`}>
          <div className="relative h-20 w-20 overflow-hidden rounded-3xl bg-elevated">
            {photos?.[0]?.url ? (
              <img src={photos[0].url} className="h-full w-full object-cover" alt="" />
            ) : (
              <div className="brand-gradient h-full w-full" />
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-2xl font-bold ${tierName(tier)}`}>{p?.name}</h1>
            {p?.is_verified && <BadgeCheck className="text-brand" size={20} />}
          </div>
          <p className="text-muted">
            {yas(p?.birthdate) ? `${yas(p?.birthdate)} · ` : ""}
            {p?.city}
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <PremiumBadge tier={tier} />
            {(tier === "platinum" || tier === "legend") && <VipTag tier={tier} />}
            {boostAktif && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-medium text-amber-500">
                <Zap size={12} /> Boost aktif
              </span>
            )}
          </div>
        </div>
      </div>

      <MembershipCard tier={premiumActive ? tier : null} name={p?.name} />

      {!premiumActive && (
        <Link
          href="/premium"
          className="mb-6 flex items-center justify-between rounded-3xl border border-brand/30 bg-brand/5 p-4 transition hover:border-brand/50"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15">
              <Crown size={18} className="text-brand" />
            </div>
            <div>
              <p className="font-semibold">Ahenk Premium</p>
              <p className="text-xs text-muted">
                Sınırsız keşif, kimler ziyaret etti, görüşme ve dahası
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="shrink-0 text-muted" />
        </Link>
      )}

      <ProfileCompletion items={completionItems} />

      <div className="mb-4">
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

      <VerifyRequest
        userId={user!.id}
        status={p?.verification_status || "none"}
        isVerified={!!p?.is_verified}
      />

      <IncognitoToggle userId={user!.id} initial={!!p?.incognito} premium={premiumActive} />

      {attrs.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-3xl border border-border bg-surface">
          {attrs.map((a, i) => (
            <div
              key={a.label}
              className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border/60" : ""}`}
            >
              <a.Icon size={17} className="shrink-0 text-muted" />
              <span className="text-sm text-muted">{a.label}</span>
              <span className="ml-auto flex items-center gap-2 text-sm font-medium">
                {a.value}
                {a.copy && <CopyButton text={a.copy} />}
              </span>
            </div>
          ))}
        </div>
      )}

      <PhotoManager userId={user!.id} initial={photos} />

      <PromptEditor userId={user!.id} />

      <ProfilRetention />

      <ThemePicker userId={user!.id} initial={p?.theme || "default"} locked={!premiumActive} />

      <VibeVoiceCard
        userId={user!.id}
        initialVibe={p?.vibe}
        initialVoicePath={p?.voice_card_path}
      />

      {p?.bio && <p className="mb-6 text-sm text-text/90">{p.bio}</p>}

      {p?.interests?.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {p.interests.map((i: string) => (
            <span key={i} className="rounded-full bg-elevated px-3 py-1 text-sm">{i}</span>
          ))}
        </div>
      )}

      <div className="mb-6">
        <Achievements />
      </div>

      <div className="mb-3 space-y-2">
        <Link href="/onboarding" className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
          <Pencil size={18} /> Profili düzenle
        </Link>
        <Link href="/begenenler" className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
          <Heart size={18} className="text-accent" /> Seni beğenenler
        </Link>
        <Link href="/ziyaretciler" className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
          <Eye size={18} /> Profilimi kimler ziyaret etti
        </Link>
        <Link href="/cuzdan" className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
          <Wallet size={18} className="text-accent" /> Cüzdan & Jeton
        </Link>
        <Link href="/liderlik" className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
          <Trophy size={18} className="text-accent" /> Liderlik
        </Link>
        <Link href="/analiz" className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
          <TrendingUp size={18} className="text-accent" /> Analiz <span className="ml-auto text-[10px] font-semibold text-accent">Premium+</span>
        </Link>
        <Link href="/premium" className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
          <Crown size={18} className="text-brand" /> Premium
        </Link>
        <Link href="/guvenlik" className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
          <Shield size={18} /> Güvenlik & Topluluk
        </Link>
        <Link href="/engellenenler" className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
          <Ban size={18} /> Engellenenler
        </Link>
        <Link href="/oneri" className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
          <MessageSquare size={18} /> Öneri / Geri bildirim
        </Link>
        {p?.is_admin && (
          <Link href="/admin" className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
            <Shield size={18} /> Admin paneli
          </Link>
        )}
      </div>

      <ProfileActions />
    </div>
  );
}
