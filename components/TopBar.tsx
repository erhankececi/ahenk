"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Search, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function TopBar({ title }: { title: string }) {
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
        <Link
          href="/profil"
          aria-label="Ayarlar"
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-muted transition duration-200 hover:bg-elevated hover:text-text"
        >
          <Settings size={20} />
        </Link>
      </div>
    </header>
  );
}
