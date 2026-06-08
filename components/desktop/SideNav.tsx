"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass, MessageCircle, User, CalendarHeart, Sparkles, Wallet, Crown, Film, Gamepad2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const primary = [
  { href: "/kesfet", icon: Compass, label: "Keşfet" },
  { href: "/moments", icon: Sparkles, label: "Moments" },
  { href: "/reels", icon: Film, label: "Klipler" },
  { href: "/oyun", icon: Gamepad2, label: "Oyun Salonu" },
  { href: "/eslesmeler", icon: MessageCircle, label: "Mesajlar", badge: true },
  { href: "/etkinlikler", icon: CalendarHeart, label: "Etkinlikler" },
  { href: "/profil", icon: User, label: "Profil" },
];

const ZERO = "00000000-0000-0000-0000-000000000000";

// 72px ince ikon rayı — hover'da isim açılır (Sessiz Lüks, admin-panel hissi yok).
function Item({ href, icon: Icon, label, active, badge }: any) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={label}
      className="group relative flex h-11 w-11 items-center justify-center rounded-xl transition"
    >
      <span className={cn("transition", active ? "text-accent" : "text-muted group-hover:text-text")}>
        <Icon size={23} strokeWidth={active ? 2 : 1.6} />
      </span>
      {badge && (
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#C16A55] ring-2 ring-bg" />
      )}
      {/* hover etiketi */}
      <span className="pointer-events-none absolute left-[52px] z-50 hidden whitespace-nowrap rounded-lg border border-border bg-elevated px-2.5 py-1 text-xs font-medium text-text shadow-soft group-hover:block">
        {label}
      </span>
      {active && <span className="absolute -left-2 h-5 w-[3px] rounded-full bg-accent" />}
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
    <aside className="sticky top-0 hidden h-dvh w-[72px] shrink-0 flex-col items-center gap-1 border-r border-border py-5 lg:flex">
      {/* Marka */}
      <Link href="/kesfet" aria-label="Ahenk" className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-2 to-brand font-display text-lg font-semibold text-[#1c1407] ring-1 ring-accent/30">
        A
      </Link>

      <nav className="flex flex-1 flex-col items-center gap-1.5">
        {primary.map((it) => (
          <Item key={it.href} {...it} active={path.startsWith(it.href)} badge={it.badge && unread > 0} />
        ))}
      </nav>

      <div className="flex flex-col items-center gap-1.5 border-t border-border pt-3">
        <Item href="/premium" icon={Crown} label="Premium" active={path.startsWith("/premium")} />
        <Item href="/cuzdan" icon={Wallet} label="Cüzdan" active={path.startsWith("/cuzdan")} />
      </div>
    </aside>
  );
}
