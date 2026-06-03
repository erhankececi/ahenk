"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass, MessageCircle, User, CalendarHeart, Sparkles, Trophy, Wallet, Crown, Bell,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const primary = [
  { href: "/kesfet", icon: Compass, label: "Keşfet" },
  { href: "/moments", icon: Sparkles, label: "Moments" },
  { href: "/eslesmeler", icon: MessageCircle, label: "Mesajlar", badge: true },
  { href: "/etkinlikler", icon: CalendarHeart, label: "Etkinlikler" },
  { href: "/bildirimler", icon: Bell, label: "Bildirimler" },
  { href: "/liderlik", icon: Trophy, label: "Liderlik" },
  { href: "/profil", icon: User, label: "Profil" },
];

const ZERO = "00000000-0000-0000-0000-000000000000";

export default function SideNav() {
  const path = usePathname();
  const supabase = createClient();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: matches } = await supabase
        .from("matches").select("id").or(`user_a.eq.${user.id},user_b.eq.${user.id}`);
      const ids = (matches || []).map((m) => m.id);
      const { count } = await supabase
        .from("messages").select("*", { count: "exact", head: true })
        .in("match_id", ids.length ? ids : [ZERO]).neq("sender_id", user.id).is("read_at", null);
      if (active) setUnread(count || 0);
    })();
    return () => { active = false; };
  }, [path]);

  return (
    <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col gap-1 border-r border-border px-4 py-6 lg:flex">
      {/* Marka */}
      <Link href="/kesfet" className="mb-5 flex items-center gap-2.5 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-brand text-base font-extrabold text-[#0B1220]">
          A
        </span>
        <span className="font-display text-xl font-extrabold tracking-tight">Ahenk</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {primary.map(({ href, icon: Icon, label, badge }) => {
          const active = path.startsWith(href);
          const showBadge = badge && unread > 0;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition",
                active ? "bg-brand/10 text-brand" : "text-muted hover:bg-surface hover:text-text"
              )}
            >
              <Icon size={20} className="shrink-0" />
              {label}
              {showBadge && (
                <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Alt: Premium + Cüzdan */}
      <div className="mt-2 space-y-2 border-t border-border pt-3">
        <Link
          href="/premium"
          className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2.5 text-[15px] font-semibold text-accent transition hover:bg-accent/15"
        >
          <Crown size={19} /> Premium
        </Link>
        <Link
          href="/cuzdan"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-muted transition hover:bg-surface hover:text-text"
        >
          <Wallet size={20} /> Cüzdan
        </Link>
      </div>
    </aside>
  );
}
