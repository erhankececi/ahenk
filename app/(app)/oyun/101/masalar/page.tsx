"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MOCK_ROOMS } from "@/lib/game101/rooms";
import OkeyRoomFilters, { type RoomFilterKey } from "@/components/game101/OkeyRoomFilters";
import OkeyRoomList from "@/components/game101/OkeyRoomList";

/** Mock "kullanıcının şehri" — gerçek profil/konum entegrasyonu yok, prototip amaçlı sabit. */
const MY_CITY = "İstanbul";

export default function Okey101MasalarPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<RoomFilterKey>("tumu");

  const rooms = useMemo(() => {
    switch (filter) {
      case "sesli":
        return MOCK_ROOMS.filter((r) => r.isVoice);
      case "premium":
        return MOCK_ROOMS.filter((r) => r.isPremium);
      case "sehrimden":
        return MOCK_ROOMS.filter((r) => r.city === MY_CITY);
      case "yeni":
        return MOCK_ROOMS.filter((r) => r.tableType === "Hızlı Masa" || r.tableType === "Arkadaş Masası");
      default:
        return MOCK_ROOMS;
    }
  }, [filter]);

  function handleJoin(roomId: string) {
    router.push(`/oyun/101/oda/${roomId}`);
  }

  return (
    <div className="min-h-dvh px-4 pb-28 pt-6 lg:mx-auto lg:max-w-4xl lg:px-0">
      <header className="mb-4">
        <Link href="/oyun/101" className="mb-2 inline-flex items-center gap-1 text-sm text-muted transition hover:text-text">
          <ChevronLeft size={16} /> Ahenk 101
        </Link>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.04em] text-text lg:text-3xl">
          Masalar
        </h1>
        <p className="mt-1 text-sm text-muted">Bir masa seç ve oyuna katıl.</p>
      </header>

      <div className="mb-4">
        <OkeyRoomFilters active={filter} onChange={setFilter} />
      </div>

      <OkeyRoomList rooms={rooms} onJoin={handleJoin} />
    </div>
  );
}
