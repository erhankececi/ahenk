// Ahenk 101 — oda bekleme ekranı route'u.
// app/(app)/ route group içinde: header + SideNav + BottomNav mevcut Ahenk sayfası
// gibi görünür. Gerçek oyun ekranı /oyun/101/oda/[roomId]/oyna route'unda (kökte,
// fullscreen) açılır — bu sayfa yalnızca koltuk/hazır ol akışını yönetir.

import { getRoomById } from "@/lib/game101/rooms";
import OkeyWaitingRoomPage from "@/components/game101/OkeyWaitingRoomPage";

export default function Game101WaitingRoomPage({
  params,
}: {
  params: { roomId: string };
}) {
  const room = getRoomById(params.roomId);

  return <OkeyWaitingRoomPage room={room} />;
}
