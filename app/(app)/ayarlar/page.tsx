import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isActivePremium } from "@/lib/plans";
import PushOptIn from "@/components/PushOptIn";
import SoundToggle from "@/components/SoundToggle";
import IncognitoToggle from "@/components/IncognitoToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TranslateToggle from "@/components/TranslateToggle";
import { normalizeLang } from "@/lib/i18n";
import { cookies } from "next/headers";
import {
  ArrowLeft, Bell, EyeOff, Shield, Ban, Languages, Crown, TrendingUp, Eye,
  MessageSquare, Trash2, ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Ayarlar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: p } = await supabase
    .from("profiles")
    .select("incognito, premium_plan, premium_until")
    .eq("id", user!.id)
    .single();
  const premium = isActivePremium(p);
  const lang = normalizeLang(cookies().get("lang")?.value);

  const row = (href: string, Icon: any, label: string, tone = "") => (
    <Link href={href} className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-elevated">
      <Icon size={18} className={tone || "text-muted"} />
      <span className="flex-1 text-sm">{label}</span>
      <ChevronRight size={16} className="text-muted" />
    </Link>
  );

  const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-5">
      <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wider text-muted">{title}</p>
      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">{children}</div>
    </div>
  );

  return (
    <div className="px-4 pb-24 pt-6">
      <div className="mb-5 flex items-center gap-3">
        <Link href="/profil" className="text-muted" aria-label="Geri"><ArrowLeft size={20} /></Link>
        <h1 className="font-display text-2xl font-bold">Ayarlar</h1>
      </div>

      <Group title="Bildirimler & Sesler">
        <div className="p-4"><PushOptIn /></div>
        <SoundToggle />
      </Group>

      <Group title="Gizlilik">
        <div className="p-4"><IncognitoToggle userId={user!.id} initial={!!p?.incognito} premium={premium} /></div>
        {row("/gizlilik", EyeOff, "Gizlilik Politikası")}
      </Group>

      <Group title="Güvenlik">
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
        {row("/hesap-sil", Trash2, "Hesabı sil")}
      </Group>
    </div>
  );
}
