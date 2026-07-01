"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Search, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function TopBar({ title, create }: { title: string; create?: boolean }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false)
      .then(({ count }) => {
        if (active) setUnread(count || 0);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 mb-4 flex items-center justify-between px-5 pb-2 pt-[calc(env(safe-area-inset-top)+18px)] backdrop-blur-xl">
      <h1 className="font-display text-[25px] font-bold tracking-[-0.03em] text-text">{title}</h1>
      <div className="flex items-center gap-2.5">
        <Link
          href="/kesfet"
          aria-label="Arama"
          className="flex h-10 w-10 items-center justify-center rounded-full text-text/82 transition duration-200 hover:bg-white/[0.04] hover:text-text"
        >
          <Search size={21} strokeWidth={1.75} />
        </Link>
        <Link
          href="/bildirimler"
          aria-label={unread > 0 ? `Bildirimler (${unread} yeni)` : "Bildirimler"}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-text/82 transition duration-200 hover:bg-white/[0.04] hover:text-text"
        >
          <Bell size={21} strokeWidth={1.75} />
          {unread > 0 && (
            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-[#D84F4F] ring-2 ring-bg" />
          )}
        </Link>
        {create && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("ahenk:moment-new"))}
            aria-label="Paylaş"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-[#1B1409] shadow-[0_10px_28px_-14px_rgba(199,169,119,0.9)] ring-1 ring-white/10 transition hover:brightness-110 active:scale-95"
          >
            <Plus size={21} strokeWidth={2.15} />
          </button>
        )}
      </div>
    </header>
  );
}
