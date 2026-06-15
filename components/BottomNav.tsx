"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, User, Sparkles, Clapperboard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const items = [
  { href: "/kesfet", icon: Home, label: "Keşfet" },
  { href: "/moments", icon: Sparkles, label: "Moments" },
  { href: "/reels", icon: Clapperboard, label: "Reels" },
  { href: "/eslesmeler", icon: MessageCircle, label: "Mesajlar" },
  { href: "/profil", icon: User, label: "Profil" },
];

const ZERO = "00000000-0000-0000-0000-000000000000";

export function BottomNav() {
  const path = usePathname();
  const supabase = createClient();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: matches } = await supabase
        .from("matches")
        .select("id")
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);
      const ids = (matches || []).map((m) => m.id);
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("match_id", ids.length ? ids : [ZERO])
        .neq("sender_id", user.id)
        .is("read_at", null);
      if (active) setUnread(count || 0);
    })();
    return () => {
      active = false;
    };
  }, [path]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[460px] px-4 pb-[calc(env(safe-area-inset-bottom)+10px)] lg:hidden">
      <div className="ahenk-bottom-nav flex items-center justify-around px-2 py-2.5">
        {items.map(({ href, icon: Icon, label }) => {
          const active = path.startsWith(href);
          const badge = href === "/eslesmeler" && unread > 0;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              aria-label={badge ? `${label}, ${unread} okunmamış` : label}
              className={cn(
                "group relative flex flex-1 flex-col items-center gap-1.5 rounded-2xl px-1 py-1.5 text-[10.5px] font-medium transition duration-300",
                active ? "text-accent" : "text-text/55 hover:text-text/80"
              )}
            >
              <span
                className={cn(
                  "relative flex h-8 w-11 items-center justify-center rounded-2xl transition duration-300",
                  active ? "bg-accent/13 ring-1 ring-accent/20" : "group-hover:bg-white/[0.03]"
                )}
              >
                <Icon size={21} strokeWidth={active ? 2.15 : 1.65} fill={active ? "currentColor" : "none"} />
                {badge && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#D84F4F] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[#151217]">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
