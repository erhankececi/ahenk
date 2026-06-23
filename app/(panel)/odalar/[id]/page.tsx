import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GlassCard, Avatar, LiveBadge } from "@/components/ui";
import { RoomChat } from "@/components/RoomChat";
import { JoinRoomButton } from "@/components/JoinRoomButton";
import { ReportButton } from "@/components/ReportButton";
import { ArrowLeft, Users, Coins, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RoomDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: room } = await supabase.from("live_rooms").select("*").eq("id", params.id).maybeSingle();
  if (!room) notFound();

  const { data: host } = await supabase.from("profiles").select("full_name").eq("id", room.host_id).maybeSingle();
  const { data: part } = await supabase.from("room_participants").select("id, left_at").eq("room_id", room.id).eq("user_id", user.id).maybeSingle();
  const isHost = room.host_id === user.id;
  const canChat = isHost || (!!part && !part.left_at);

  let initial: any[] = [];
  if (canChat) {
    const { data: msgs } = await supabase.from("room_messages").select("id, user_id, message, message_type, created_at").eq("room_id", room.id).order("created_at").limit(100);
    initial = msgs || [];
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <Link href="/odalar" className="flex items-center gap-1.5 text-sm text-muted hover:text-text"><ArrowLeft size={16} /> Odalar</Link>
        <div className="flex items-center gap-2">
          <LiveBadge soon={room.status !== "live"} label={room.status === "live" ? "Canlı" : room.status === "scheduled" ? "Yakında" : "Bitti"} />
          {!isHost && <ReportButton targetType="room" targetId={room.id} compact />}
        </div>
      </div>

      <div>
        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-muted">{room.exam_type || room.subject}</span>
        <h1 className="mt-2 text-2xl font-bold">{room.title}</h1>
        {room.description && <p className="mt-1 text-sm text-muted">{room.description}</p>}
        <div className="mt-3 flex items-center gap-3">
          <Avatar name={host?.full_name || "Eğitmen"} size={36} />
          <div className="text-sm">
            <p className="font-semibold">{host?.full_name || "Eğitmen"}</p>
            <p className="text-xs text-muted">{room.subject}</p>
          </div>
          <span className="ml-auto flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1"><Users size={13} /> {room.participant_count}</span>
            <span className={`flex items-center gap-1 font-semibold ${room.is_paid && room.coin_cost > 0 ? "text-gold" : "text-success"}`}>
              {room.is_paid && room.coin_cost > 0 ? <><Coins size={12} /> {room.coin_cost}</> : "Ücretsiz"}
            </span>
          </span>
        </div>
      </div>

      <GlassCard className="p-4">
        {canChat ? (
          <RoomChat roomId={room.id} meId={user.id} hostId={room.host_id} isHost={isHost} initial={initial} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-muted"><Lock size={26} /></span>
            <p className="max-w-xs text-sm text-muted">Sohbeti görmek ve mesaj yazmak için odaya katıl.{room.is_paid && room.coin_cost > 0 ? ` Bu oda ${room.coin_cost} jeton.` : " Bu oda ücretsiz."}</p>
            <div className="w-full max-w-xs"><JoinRoomButton roomId={room.id} isPaid={room.is_paid} coinCost={room.coin_cost} /></div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
