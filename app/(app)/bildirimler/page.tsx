import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { EmptyState } from "@/components/ui";
import { zamanFarki } from "@/lib/utils";
import { Heart, MessageCircle, Eye, Bell, Gift, Sparkles } from "lucide-react";
import PushOptIn from "@/components/PushOptIn";
import { cookies } from "next/headers";
import { normalizeLang, getAppDict } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function Bildirimler() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tn = getAppDict(normalizeLang(cookies().get("lang")?.value)).bildirimler;
  const META: Record<string, { icon: any; href?: string; label: (p: any) => string }> = {
    match: { icon: Heart, href: "/eslesmeler", label: () => tn.match },
    super: { icon: Heart, href: "/begenenler", label: () => tn.superLike },
    like: { icon: Heart, href: "/begenenler", label: () => tn.like },
    message: { icon: MessageCircle, href: "/eslesmeler", label: () => tn.message },
    visit: { icon: Eye, href: "/ziyaretciler", label: () => tn.visit },
    gift: { icon: Gift, href: "/eslesmeler", label: (p) => tn.giftMsg.replace("{gift}", p?.label || tn.giftFallback) + (p?.earned ? tn.giftEarned.replace("{n}", String(p.earned)) : "") },
    daily: { icon: Sparkles, href: "/kesfet", label: (p) => p?.text || tn.dailyFallback },
    system: { icon: Bell, label: (p) => p?.text || tn.systemFallback },
  };

  const { data: notifs } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // okundu işaretle
  if (notifs?.some((n) => !n.is_read)) {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user!.id);
  }

  return (
    <div className="pb-6">
      <TopBar title={tn.title} />
      <div className="px-4">
        <PushOptIn />
        {(notifs || []).length === 0 ? (
          <EmptyState
            icon={<Bell size={40} />}
            title={tn.emptyTitle}
            desc={tn.emptyDesc}
          />
        ) : (
          <div className="space-y-2">
            {(notifs || []).map((n) => {
              const m = META[n.type] || META.system;
              const Icon = m.icon;
              const cls = `flex items-center gap-3 rounded-2xl p-3 ${
                n.is_read ? "lp-panel" : "border border-accent/30 bg-accent/[0.06]"
              }`;
              const inner = (
                <>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-accent/10 text-accent">
                    <Icon size={18} />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-text">{m.label(n.payload)}</p>
                    <p className="t-caption text-muted">{zamanFarki(n.created_at)}</p>
                  </div>
                </>
              );
              return m.href ? (
                <Link key={n.id} href={m.href} className={`${cls} transition hover:border-accent/45`}>
                  {inner}
                </Link>
              ) : (
                <div key={n.id} className={cls}>
                  {inner}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
