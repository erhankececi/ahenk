"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CalendarHeart, Crown, Trophy, UserPlus, Sparkles, MapPin } from "lucide-react";

type Ev = { id: string; title: string; city: string | null; starts_at: string | null };

export default function RightRail() {
  const supabase = createClient();
  const [events, setEvents] = useState<Ev[] | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await supabase
          .from("events")
          .select("id, title, city, starts_at")
          .order("starts_at", { ascending: true })
          .limit(3);
        if (active) setEvents((data as Ev[]) ?? []);
      } catch {
        if (active) setEvents([]);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <aside className="sticky top-0 hidden h-dvh w-[300px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-border px-5 py-6 no-scrollbar xl:flex">
      {/* Premium promo */}
      <div className="rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/10 to-transparent p-4">
        <div className="mb-1 flex items-center gap-2">
          <Crown size={18} className="text-accent" />
          <p className="font-display font-bold">Ahenk Premium</p>
        </div>
        <p className="mb-3 text-sm text-muted">
          Seni beğenenleri gör, sınırsız beğen, öne çık. Ayrıcalıklı bir deneyim.
        </p>
        <Link
          href="/premium"
          className="block rounded-xl bg-gradient-to-r from-brand-2 to-brand py-2 text-center text-sm font-semibold text-[#1c1407] transition hover:brightness-110"
        >
          Premium'u keşfet
        </Link>
      </div>

      {/* Yaklaşan etkinlikler */}
      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="flex items-center gap-2 font-semibold">
            <CalendarHeart size={17} className="text-brand" /> Etkinlikler
          </p>
          <Link href="/etkinlikler" className="text-xs text-muted hover:text-text">
            Tümü
          </Link>
        </div>
        {events == null ? (
          <div className="space-y-2">
            <div className="h-10 animate-pulse rounded-lg bg-elevated" />
            <div className="h-10 animate-pulse rounded-lg bg-elevated" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted">Yakında yeni etkinlikler.</p>
        ) : (
          <div className="space-y-2">
            {events.map((e) => (
              <Link
                key={e.id}
                href="/etkinlikler"
                className="block rounded-lg border border-border/60 px-3 py-2 transition hover:border-brand/40"
              >
                <p className="truncate text-sm font-medium">{e.title}</p>
                <p className="text-xs text-muted">
                  {e.city || "Online"}
                  {e.starts_at
                    ? ` · ${new Date(e.starts_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}`
                    : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Hızlı erişim */}
      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="mb-2 font-semibold">Keşfet & kazan</p>
        <div className="space-y-1">
          <Link href="/liderlik" className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-muted transition hover:bg-elevated hover:text-text">
            <Trophy size={16} className="text-accent" /> Liderlik tablosu
          </Link>
          <Link href="/profil" className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-muted transition hover:bg-elevated hover:text-text">
            <UserPlus size={16} className="text-brand" /> Arkadaşını davet et
          </Link>
          <Link href="/moments" className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-muted transition hover:bg-elevated hover:text-text">
            <Sparkles size={16} className="text-accent" /> Bir an paylaş
          </Link>
          <Link href="/topluluk" className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-muted transition hover:bg-elevated hover:text-text">
            <MapPin size={16} className="text-brand" /> Şehir topluluğun
          </Link>
        </div>
      </div>

      <p className="px-1 text-xs text-muted/70">
        Ahenk · Önce ruh, sonra yüz
      </p>
    </aside>
  );
}
