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
import { normalizeLang } from "@/lib/i18n";
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
        <Link href="/profil" className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#151318] text-text transition hover:border-accent/40 hover:text-accent" aria-label="Geri"><ArrowLeft size={18} /></Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Ahenk</p>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.04em] text-text">Ayarlar</h1>
        </div>
      </div>

      <Group title="Bildirimler & Sesler">
        <div className="p-4"><PushOptIn /></div>
        <SoundToggle />
      </Group>

      <div className="mb-5">
        <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Bildirim tercihleri</p>
        <BildirimTercihleri />
      </div>

      <div className="mb-5">
        <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Görünüm</p>
        <div className="ahenk-panel overflow-hidden rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-3">
            <Palette size={18} className="text-accent" />
            <div>
              <p className="text-sm font-medium text-text">Tema</p>
              <p className="text-xs text-muted">Premium görünüm tercihlerin</p>
            </div>
          </div>
          <ThemePicker userId={user!.id} initial={p?.theme || "default"} locked={!premium} />
        </div>
      </div>

      <Group title="Gizlilik">
        <div className="p-4"><IncognitoToggle userId={user!.id} initial={!!p?.incognito} premium={premium} /></div>
        {row("/gizlilik", EyeOff, "Gizlilik Politikası")}
      </Group>

      <Group title="Güvenlik">
        {!p?.is_verified && (
          <div className="p-4">
            <VerifyRequest
              userId={user!.id}
              status={p?.verification_status || "none"}
              isVerified={!!p?.is_verified}
            />
          </div>
        )}
        {row("/guvenlik", Shield, "Güvenlik & Topluluk")}
        {row("/engellenenler", Ban, "Engellenenler")}
      </Group>

      <Group title="Dil & Çeviri">
        <div className="flex items-center justify-between p-4">
          <span className="flex items-center gap-3 text-sm"><Languages size={18} className="text-muted" /> Uygulama dili</span>
          <LanguageSwitcher current={lang} />
        </div>
        <TranslateToggle />
      </Group>

      <Group title="Premium">
        {row("/premium", Crown, "Premium üyelik", "text-brand")}
        {row("/analiz", TrendingUp, "Analiz (Premium+)", "text-accent")}
        {row("/ziyaretciler", Eye, "Profil ziyaretçileri")}
      </Group>

      <Group title="Hesap">
        {row("/oneri", MessageSquare, "Öneri / Geri bildirim")}
      </Group>

      <Link
        href="/hesap-sil"
        className="mb-4 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3.5 transition hover:border-red-500/40"
      >
        <Trash2 size={18} className="text-red-400" />
        <span className="flex-1 text-sm font-medium text-red-300">Hesabı sil</span>
        <ChevronRight size={16} className="text-red-400/60" />
      </Link>
    </div>
  );
}
