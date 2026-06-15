"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, MessageCircle, User, CalendarHeart, Sparkles, Wallet, Crown, Clapperboard, Gamepad2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const primary = [
  { href: "/kesfet", icon: Home, label: "Keşfet" },
  { href: "/moments", icon: Sparkles, label: "Moments" },
  { href: "/reels", icon: Clapperboard, label: "Reels" },
  { href: "/oyun", icon: Gamepad2, label: "Oyun Salonu" },
  { href: "/eslesmeler", icon: MessageCircle, label: "Mesajlar", badge: true },
  { href: "/etkinlikler", icon: CalendarHeart, label: "Etkinlikler" },
  { href: "/profil", icon: User, label: "Profil" },
];

const ZERO = "00000000-0000-0000-0000-000000000000";

function Item({ href, icon: Icon, label, active, badge }: any) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={label}
      className={cn(
        "group relative flex h-11 w-11 items-center justify-center rounded-2xl transition duration-300",
        active ? "bg-accent/13 text-accent ring-1 ring-accent/20" : "text-text/48 hover:bg-white/[0.04] hover:text-text/82"
      )}
    >
      <Icon size={22} strokeWidth={active ? 2 : 1.55} fill={active ? "currentColor" : "none"} />
      {badge && (
        <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-[#D84F4F] ring-2 ring-bg" />
      )}
      <span className="pointer-events-none absolute left-[54px] z-50 hidden whitespace-nowrap rounded-xl border border-white/10 bg-[#17151A] px-3 py-1.5 text-xs font-medium text-text shadow-[0_16px_36px_-20px_rgba(0,0,0,0.95)] group-hover:block">
        {label}
      </span>
      {active && <span className="absolute -left-3 h-5 w-[3px] rounded-full bg-accent" />}
    </Link>
  );
}

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
    <aside className="sticky top-0 hidden h-dvh w-[84px] shrink-0 flex-col items-center gap-1 border-r border-white/[0.06] bg-black/12 py-5 backdrop-blur lg:flex">
      <Link href="/kesfet" aria-label="Ahenk" className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/25 bg-[#151318] font-display text-[28px] font-semibold text-accent shadow-[0_16px_42px_-28px_rgba(0,0,0,0.95)]">
        A
      </Link>

      <nav className="flex flex-1 flex-col items-center gap-2">
        {primary.map((it) => (
          <Item key={it.href} {...it} active={path.startsWith(it.href)} badge={it.badge && unread > 0} />
        ))}
      </nav>

      <div className="flex flex-col items-center gap-2 border-t border-white/[0.06] pt-4">
        <Item href="/premium" icon={Crown} label="Premium" active={path.startsWith("/premium")} />
        <Item href="/cuzdan" icon={Wallet} label="Cüzdan" active={path.startsWith("/cuzdan")} />
      </div>
    </aside>
  );
}
