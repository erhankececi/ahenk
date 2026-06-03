"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MessageCircle, User, CalendarHeart, Sparkles, Film } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const items = [
  { href: "/kesfet", icon: Compass, label: "Keşfet" },
  { href: "/moments", icon: Sparkles, label: "Anlar" },
  { href: "/reels", icon: Film, label: "Reels" },
  { href: "/eslesmeler", icon: MessageCircle, label: "Mesaj" },
  { href: "/etkinlikler", icon: CalendarHeart, label: "Etkinlik" },
  { href: "/profil", icon: User, label: "Profil" },
];

const ZERO = "00000000-0000-0000-0000-000000000000";

export function BottomNav() {
  const path = usePathname();
  const supabase = createClient();
  const [unread, setUnread] = useState(0);

  // Okunmamış mesaj sayısı (RLS-kapsamlı; migration yok). Gezinmede tazelenir.
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
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border glass lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
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
                "flex flex-1 flex-col items-center gap-0.5 py-1 text-xs transition",
                active ? "text-brand" : "text-muted"
              )}
            >
              <span
                className={cn(
                  "relative flex h-8 w-12 items-center justify-center rounded-full transition duration-200",
                  active && "bg-brand/12"
                )}
              >
                <Icon size={21} />
                {badge && (
                  <span className="absolute right-1.5 top-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-white">
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
