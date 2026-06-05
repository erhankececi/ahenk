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
    // RLS yalnız kendi bildirimlerini döndürür; okunmamış sayısı için head count.
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
    <header className="sticky top-0 z-30 mb-4 flex items-center justify-between border-b border-border glass px-4 py-3">
      <h1 className="t-h2 brand-text">{title}</h1>
      <div className="flex items-center gap-1">
        <Link
          href="/kesfet"
          aria-label="Arama"
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-muted transition duration-200 hover:bg-elevated hover:text-text"
        >
          <Search size={20} />
        </Link>
        <Link
          href="/bildirimler"
          aria-label={unread > 0 ? `Bildirimler (${unread} yeni)` : "Bildirimler"}
          className="relative flex h-10 w-10 items-center justify-center rounded-2xl text-muted transition duration-200 hover:bg-elevated hover:text-text"
        >
          <Bell size={20} />
          {unread > 0 && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-bg" />
          )}
        </Link>
        {create && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("ahenk:moment-new"))}
            aria-label="Paylaş"
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-2 to-brand text-[#1c1407] transition hover:brightness-110"
          >
            <Plus size={20} strokeWidth={2.4} />
          </button>
        )}
      </div>
    </header>
  );
}
