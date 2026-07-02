"use client";

// Ahenk 101 — oda bekleme ekranı (Görev 3).
// Kullanıcı masa listesinden "Katıl" dedikten sonra buraya gelir: boş koltuğa
// oturur, hazır olur, mock olarak oyunu başlatır ve /oyun/101/oda/{roomId}/oyna
// route'una geçer. Backend/Supabase/socket yok — tamamen local React state.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Room } from "@/lib/game101/rooms";
import { getMockOpponents } from "@/lib/game101/waitingRoom";
import RoomHeaderCard from "./RoomHeaderCard";
import RoomSeatMap from "./RoomSeatMap";
import ReadyControls from "./ReadyControls";
import RoomChatPreview from "./RoomChatPreview";
import RoomRulesCard from "./RoomRulesCard";

/** Mock "benim" profilim — gerçek profil entegrasyonu yok, prototip amaçlı sabit. */
const MY_NAME = "Sen";
const MY_CITY = "İstanbul";

export interface OkeyWaitingRoomPageProps {
  room: Room;
}

export default function OkeyWaitingRoomPage({ room }: OkeyWaitingRoomPageProps) {
  const router = useRouter();
  const opponents = useMemo(() => getMockOpponents(room.id), [room.id]);

  const [isSeated, setIsSeated] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const me = isSeated ? { name: MY_NAME, city: MY_CITY, isReady } : null;
  const seatedCount = opponents.length + (isSeated ? 1 : 0);
  const allSeatedReady = isReady && opponents.every((o) => o.isReady);

  function handleSit() {
    setIsSeated(true);
    setNotice(null);
  }

  function handleStand() {
    setIsSeated(false);
    setIsReady(false);
    setNotice(null);
  }

  function handleToggleReady() {
    setIsReady((prev) => !prev);
    setNotice(null);
  }

  function handleStart() {
    if (!isSeated || !isReady) {
      setNotice("Başlamak için önce hazır olmalısın.");
      return;
    }
    router.push(`/oyun/101/oda/${room.id}/oyna`);
  }

  function handleLeave() {
    router.push("/oyun/101/masalar");
  }

  return (
    <div className="min-h-dvh px-4 pb-28 pt-6 lg:mx-auto lg:max-w-4xl lg:px-0">
      <header className="mb-4">
        <Link
          href="/oyun/101/masalar"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted transition hover:text-text"
        >
          <ChevronLeft size={16} /> Masalar
        </Link>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.04em] text-text lg:text-3xl">
          Oda Bekleme Salonu
        </h1>
        <p className="mt-1 text-sm text-muted">
          Boş koltuğa otur, hazır ol ve masadakilerle oyuna başla.
        </p>
      </header>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="flex flex-col gap-4">
          <RoomHeaderCard room={room} seatedCount={seatedCount} />
          <RoomSeatMap me={me} opponents={opponents} onSit={handleSit} />
          <ReadyControls
            isSeated={isSeated}
            isReady={isReady}
            canStart={allSeatedReady}
            onSit={handleSit}
            onStand={handleStand}
            onToggleReady={handleToggleReady}
            onStart={handleStart}
            onLeave={handleLeave}
          />
          {notice ? (
            <p className="-mt-2 text-center text-[12px] font-medium text-warning">{notice}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          <RoomChatPreview />
          <RoomRulesCard />
        </div>
      </div>
    </div>
  );
}
