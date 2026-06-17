import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isActivePremium } from "@/lib/plans";
import PushOptIn from "@/components/PushOptIn";
import SoundToggle from "@/components/SoundToggle";
import BildirimTercihleri from "@/components/BildirimTercihleri";
import IncognitoToggle from "@/components/IncognitoToggle";
import ThemePicker from "@/components/ThemePicker";
import VerifyRequest from "@/components/VerifyRequest";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TranslateToggle from "@/components/TranslateToggle";
import { normalizeLang, getAppDict } from "@/lib/i18n";
import { cookies } from "next/headers";
import {
  ArrowLeft, Bell, EyeOff, Shield, Ban, Languages, Crown, TrendingUp, Eye,
  MessageSquare, Trash2, ChevronRight, Palette,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Ayarlar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: p } = await supabase
    .from("profiles")
    .select("incognito, premium_plan, premium_until, theme, verification_status, is_verified")
    .eq("id", user!.id)
    .single();
  const premium = isActivePremium(p);
  const lang = normalizeLang(cookies().get("lang")?.value);
  const dict = getAppDict(lang);
  const t = dict.settings;

  const row = (href: string, Icon: any, label: string, tone = "") => (
    <Link href={href} className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-white/[0.03]">
      <Icon size={18} className={tone || "text-muted"} />
      <span className="flex-1 text-sm text-text">{label}</span>
      <ChevronRight size={16} className="text-muted" />
    </Link>
  );

  const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-5">
      <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">{title}</p>
      <div className="ahenk-panel divide-y divide-white/[0.06] overflow-hidden rounded-2xl">{children}</div>
    </div>
  );

  return (
    <div className="lp-page min-h-dvh px-4 pb-28 pt-6">
      <div className="mb-5 flex items-center gap-3">
        <Link href="/profil" className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#151318] text-text transition hover:border-accent/40 hover:text-accent" aria-label={dict.common.back}><ArrowLeft size={18} /></Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Ahenk</p>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.04em] text-text">{t.title}</h1>
        </div>
      </div>

      <Group title={t.groupNotif}>
        <div className="p-4"><PushOptIn /></div>
        <SoundToggle />
      </Group>

      <div className="mb-5">
        <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">{t.groupNotifPrefs}</p>
        <BildirimTercihleri />
      </div>

      <div className="mb-5">
        <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">{t.groupAppearance}</p>
        <div className="ahenk-panel overflow-hidden rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-3">
            <Palette size={18} className="text-accent" />
            <div>
              <p className="text-sm font-medium text-text">{t.theme}</p>
              <p className="text-xs text-muted">{t.themeDesc}</p>
            </div>
          </div>
          <ThemePicker userId={user!.id} initial={p?.theme || "default"} locked={!premium} />
        </div>
      </div>

      <Group title={t.groupPrivacy}>
        <div className="p-4"><IncognitoToggle userId={user!.id} initial={!!p?.incognito} premium={premium} /></div>
        {row("/gizlilik", EyeOff, t.privacyPolicy)}
      </Group>

      <Group title={t.groupSecurity}>
        {!p?.is_verified && (
          <div className="p-4">
            <VerifyRequest
              userId={user!.id}
              status={p?.verification_status || "none"}
              isVerified={!!p?.is_verified}
            />
          </div>
        )}
        {row("/guvenlik", Shield, t.security)}
        {row("/engellenenler", Ban, t.blocked)}
      </Group>

      <Group title={t.groupLang}>
        <div className="flex items-center justify-between p-4">
          <span className="flex items-center gap-3 text-sm"><Languages size={18} className="text-muted" /> {t.appLang}</span>
          <LanguageSwitcher current={lang} />
        </div>
        <TranslateToggle />
      </Group>

      <Group title={t.groupPremium}>
        {row("/premium", Crown, t.premiumMembership, "text-brand")}
        {row("/analiz", TrendingUp, t.analytics, "text-accent")}
        {row("/ziyaretciler", Eye, t.visitors)}
      </Group>

      <Group title={t.groupAccount}>
        {row("/oneri", MessageSquare, t.feedback)}
      </Group>

      <Link
        href="/hesap-sil"
        className="mb-4 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3.5 transition hover:border-red-500/40"
      >
        <Trash2 size={18} className="text-red-400" />
        <span className="flex-1 text-sm font-medium text-red-300">{t.deleteAccount}</span>
        <ChevronRight size={16} className="text-red-400/60" />
      </Link>
    </div>
  );
}
