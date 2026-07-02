import GameScreen from "@/components/game101/GameScreen";
import { getRoomById } from "@/lib/game101/rooms";

export default function Game101RoomPage({
  params,
}: {
  params: { roomId: string };
}) {
  const room = getRoomById(params.roomId);

  return (
    <GameScreen
      roomId={room.id}
      roomName={room.name}
      tableType={room.tableType}
    />
  );
}
