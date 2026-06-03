import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { EmptyState } from "@/components/ui";
import { zamanFarki } from "@/lib/utils";
import { Heart, MessageCircle, Eye, Bell } from "lucide-react";
import PushOptIn from "@/components/PushOptIn";

export const dynamic = "force-dynamic";

const META: Record<string, { icon: any; href?: string; label: (p: any) => string }> = {
  match: { icon: Heart, href: "/eslesmeler", label: () => "Yeni bir ahenk yakaladın!" },
  super: { icon: Heart, href: "/begenenler", label: () => "Biri seni ÇOK beğendi 💫 — kim olduğunu gör" },
  like: { icon: Heart, href: "/begenenler", label: () => "Biri seni beğendi — kim olduğunu gör" },
  message: { icon: MessageCircle, href: "/eslesmeler", label: () => "Yeni mesajın var" },
  visit: { icon: Eye, href: "/ziyaretciler", label: () => "Profilini biri ziyaret etti" },
  system: { icon: Bell, label: (p) => p?.text || "Bildirim" },
};

export default async function Bildirimler() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
      <TopBar title="Bildirimler" />
      <div className="px-4">
        <PushOptIn />
        {(notifs || []).length === 0 ? (
          <EmptyState
            icon={<Bell size={40} />}
            title="Henüz bildirim yok"
            desc="Yeni eşleşmeler, mesajlar ve ziyaretler burada görünecek."
          />
        ) : (
          <div className="space-y-2">
            {(notifs || []).map((n) => {
              const m = META[n.type] || META.system;
              const Icon = m.icon;
              const cls = `flex items-center gap-3 rounded-2xl border border-border p-3 ${
                n.is_read ? "bg-surface" : "bg-brand/5"
              }`;
              const inner = (
                <>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                    <Icon size={18} />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm">{m.label(n.payload)}</p>
                    <p className="t-caption text-muted">{zamanFarki(n.created_at)}</p>
                  </div>
                </>
              );
              return m.href ? (
                <Link key={n.id} href={m.href} className={`${cls} transition hover:border-brand/40`}>
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
