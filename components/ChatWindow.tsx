"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { spamMi } from "@/lib/moderation";
import {
  ArrowLeft, Send, BadgeCheck, Mic, Image as ImageIcon, Phone, Video, Clock, Smile, Gift, Lock,
} from "lucide-react";

// iOS Safari webm/opus SESİ ÇALAMAZ → kaydederken cihazın desteklediği formatı seç
// (öncelik audio/mp4 = AAC, iOS dahil her yerde çalar). Yoksa webm'e düş.
function pickAudioMime(): string {
  if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) return "";
  const cands = ["audio/mp4", "audio/aac", "audio/webm;codecs=opus", "audio/webm", "audio/ogg"];
  return cands.find((c) => MediaRecorder.isTypeSupported(c)) || "";
}
function mimeExt(mime: string): string {
  if (mime.includes("mp4") || mime.includes("aac")) return "m4a";
  if (mime.includes("ogg")) return "ogg";
  return "webm";
}
import { zamanFarki, saat } from "@/lib/utils";
import { useCall } from "@/components/call/CallProvider";
import SafetyMenu from "@/components/SafetyMenu";
import EmojiGifPicker from "@/components/EmojiGifPicker";
import { PremiumBadge, tierFrame, tierName, tierBubble, VipTag } from "@/components/PremiumBadge";
import type { Message } from "@/lib/types";

const REACTIONS = ["❤️", "😂", "😮", "👍", "🔥"];

// Sohbet medyası public 'media' kovasında (ses kartı/story ile aynı desen).
const MEDIA_URL = (p: string) =>
  p.startsWith("http")
    ? p
    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${p}`;

const GIFTS = [
  { key: "ates", emoji: "🔥", name: "Ateş", cost: 10 },
  { key: "gul", emoji: "🌹", name: "Gül", cost: 20 },
  { key: "kalp", emoji: "💖", name: "Kalp", cost: 50 },
  { key: "elmas", emoji: "💎", name: "Elmas", cost: 150 },
  { key: "tac", emoji: "👑", name: "Taç", cost: 500 },
];

export function ChatWindow({
  matchId,
  meId,
  otherId,
  otherName,
  otherVerified,
  otherPhoto,
  revealLevel,
  initial,
  myTier = "free",
  otherTier = "free",
  myTheme = "default",
}: {
  matchId: string;
  meId: string;
  otherId: string;
  otherName: string;
  otherVerified: boolean;
  otherPhoto: string | null;
  revealLevel: number;
  initial: Message[];
  myTier?: string;
  otherTier?: string;
  myTheme?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const { start, busy } = useCall();
  const canVoice = myTier !== "free";
  const canVideo = myTier === "platinum";
  const [messages, setMessages] = useState<Message[]>(initial);
  const [text, setText] = useState("");
  const [warn, setWarn] = useState("");
  const [reactingTo, setReactingTo] = useState<string | null>(null);
  const [histOpen, setHistOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [otherOnline, setOtherOnline] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recSec, setRecSec] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeRef = useRef<string>("audio/webm");
  const cancelRef = useRef(false);
  const recTimerRef = useRef<any>(null);
  const roomRef = useRef<any>(null);
  const typingSentRef = useRef(0);
  const typingTimer = useRef<any>(null);

  // reveal_level 0-100 -> blur 24px..0px
  const blurPx = Math.max(0, 24 - (revealLevel / 100) * 24);

  useEffect(() => {
    fetch(`/api/icebreakers?matchId=${matchId}`)
      .then((r) => r.json())
      .then((d) => setIcebreakers(d.questions || []))
      .catch(() => {});
  }, [matchId]);

  useEffect(() => {
    const channel = supabase
      .channel(`match-${matchId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
        (payload) => {
          const nm = payload.new as Message;
          setMessages((m) => (m.some((x) => x.id === nm.id) ? m : [...m, nm]));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  // Çevrimiçi durumu (presence) + "yazıyor…" (broadcast) — DB yok, ephemeral.
  useEffect(() => {
    const room = supabase.channel(`room-${matchId}`, { config: { presence: { key: meId } } });
    room.on("presence", { event: "sync" }, () => {
      const state = room.presenceState() as Record<string, any[]>;
      const present = Object.values(state)
        .flat()
        .some((m: any) => m?.userId === otherId);
      setOtherOnline(present);
    });
    room.on("broadcast", { event: "typing" }, ({ payload }: any) => {
      if (payload?.userId === otherId) {
        setOtherTyping(true);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setOtherTyping(false), 2500);
      }
    });
    room.subscribe((status: string) => {
      if (status === "SUBSCRIBED") room.track({ userId: meId });
    });
    roomRef.current = room;
    return () => {
      clearTimeout(typingTimer.current);
      supabase.removeChannel(room);
    };
  }, [matchId]);

  function notifyTyping() {
    const now = Date.now();
    if (now - typingSentRef.current > 1500) {
      typingSentRef.current = now;
      roomRef.current?.send({ type: "broadcast", event: "typing", payload: { userId: meId } });
    }
  }

  // Ses kaydı 2 dk üst sınır → otomatik gönder; unmount'ta mikrofonu kapat.
  useEffect(() => {
    if (recording && recSec >= 120) sesGonder();
  }, [recSec, recording]);
  useEffect(() => () => durdurStream(), []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
    // gelen okunmamışları okundu işaretle
    const unread = messages.filter((m) => m.sender_id !== meId && !m.read_at);
    if (unread.length) {
      supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .in("id", unread.map((m) => m.id))
        .then(() => {});
    }
  }, [messages]);

  async function gonder() {
    const t = text.trim();
    if (!t) return;
    const { spam, sebep } = spamMi(t);
    if (spam) {
      setWarn(`Mesaj engellendi: ${sebep}`);
      return;
    }
    setWarn("");
    setText("");
    // Insert dönüşünü hemen ekle (realtime round-trip'ini bekleme); realtime
    // echo'su geldiğinde id ile dedup edilir → çift render yok, anında görünür.
    const { data: inserted, error } = await supabase
      .from("messages")
      .insert({ match_id: matchId, sender_id: meId, type: "text", body: t })
      .select()
      .single();
    if (error) {
      setText(t); // mesajı kaybetme
      setWarn("Mesaj gönderilemedi — çok hızlı olabilirsin, biraz bekle.");
      return;
    }
    if (inserted) {
      setMessages((m) => (m.some((x) => x.id === inserted.id) ? m : [...m, inserted]));
      pingMesaj();
    }
  }

  // Birden çok fotoğrafı sırayla gönder (tek seferde hepsi).
  async function fotolarGonder(files: File[]) {
    for (const f of files) await fotoGonder(f);
    if (fileRef.current) fileRef.current.value = "";
  }

  // Karşı tarafa "yeni mesaj" push'u (fire-and-forget; sohbeti yavaşlatmaz).
  function pingMesaj() {
    fetch("/api/chat/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId }),
    }).catch(() => {});
  }

  async function fotoGonder(file: File) {
    if (!file.type.startsWith("image/")) {
      setWarn("Yalnız fotoğraf gönderebilirsin.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setWarn("Fotoğraf 8MB'den küçük olmalı.");
      return;
    }
    setWarn("");
    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${meId}/chat/${matchId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("media")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) {
        setWarn("Yükleme başarısız, tekrar dene.");
        return;
      }
      const { data: inserted, error: insErr } = await supabase
        .from("messages")
        .insert({ match_id: matchId, sender_id: meId, type: "image", media_path: path })
        .select()
        .single();
      if (insErr) {
        setWarn("Gönderilemedi — biraz yavaşla ve tekrar dene.");
        return;
      }
      if (inserted) {
        setMessages((m) => (m.some((x) => x.id === inserted.id) ? m : [...m, inserted]));
        pingMesaj();
      }
    } finally {
      setUploading(false);
    }
  }

  async function hediyeGonder(giftKey: string) {
    setGiftOpen(false);
    const res = await fetch("/api/gift", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_user: otherId, gift: giftKey, matchId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      setWarn(
        data?.error === "insufficient"
          ? `Yetersiz jeton — bu hediye ${data.cost} jeton. Cüzdandan jeton alabilirsin.`
          : "Hediye gönderilemedi, tekrar dene."
      );
      return;
    }
    // Hediye mesajı realtime ile gelir.
  }

  async function gifGonder(url: string) {
    setPickerOpen(false);
    const { data: inserted, error } = await supabase
      .from("messages")
      .insert({ match_id: matchId, sender_id: meId, type: "image", media_path: url })
      .select()
      .single();
    if (error) {
      setWarn("Gönderilemedi, tekrar dene.");
      return;
    }
    if (inserted) {
      setMessages((m) => (m.some((x) => x.id === inserted.id) ? m : [...m, inserted]));
      pingMesaj();
    }
  }

  function durdurStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    clearInterval(recTimerRef.current);
  }

  async function sesYukle(blob: Blob) {
    setUploading(true);
    try {
      const mime = blob.type || mimeRef.current || "audio/webm";
      const path = `${meId}/chat/${matchId}/voice-${crypto.randomUUID()}.${mimeExt(mime)}`;
      const { error } = await supabase.storage
        .from("media")
        .upload(path, blob, { contentType: mime, upsert: false });
      if (error) {
        setWarn("Ses gönderilemedi, tekrar dene.");
        return;
      }
      const { data: inserted, error: insErr } = await supabase
        .from("messages")
        .insert({ match_id: matchId, sender_id: meId, type: "voice", media_path: path })
        .select()
        .single();
      if (insErr) {
        setWarn("Ses gönderilemedi — biraz yavaşla ve tekrar dene.");
        return;
      }
      if (inserted) {
        setMessages((m) => (m.some((x) => x.id === inserted.id) ? m : [...m, inserted]));
        pingMesaj();
      }
    } finally {
      setUploading(false);
    }
  }

  async function sesBasla() {
    if (recording || uploading) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickAudioMime();
      mimeRef.current = mime || "audio/webm";
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      cancelRef.current = false;
      mr.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        durdurStream();
        setRecording(false);
        setRecSec(0);
        if (cancelRef.current) return;
        const blob = new Blob(chunksRef.current, { type: mimeRef.current });
        if (blob.size > 1200) await sesYukle(blob);
      };
      recorderRef.current = mr;
      mr.start();
      setRecording(true);
      setRecSec(0);
      recTimerRef.current = setInterval(() => setRecSec((s) => s + 1), 1000);
    } catch {
      setWarn("Mikrofona erişilemedi. Tarayıcı iznini kontrol et.");
    }
  }

  function sesGonder() {
    cancelRef.current = false;
    recorderRef.current?.stop();
  }
  function sesIptal() {
    cancelRef.current = true;
    recorderRef.current?.stop();
  }

  async function reaksiyon(messageId: string, emoji: string) {
    setReactingTo(null);
    await supabase
      .from("message_reactions")
      .upsert({ message_id: messageId, user_id: meId, emoji }, { onConflict: "message_id,user_id" });
  }

  async function aramaGecmisi() {
    const { data } = await supabase
      .from("calls")
      .select("type, status, duration_seconds, created_at, caller_id")
      .eq("match_id", matchId)
      .order("created_at", { ascending: false })
      .limit(20);
    setHistory(data || []);
    setHistOpen(true);
  }

  const myLast = [...messages].reverse().find((m) => m.sender_id === meId);
  // Arama "sohbet ilerledikçe" açılır: yeterince mesajlaşınca ya da fotoğraf tam açılınca.
  const callsUnlocked = revealLevel >= 100 || messages.length >= 8;

  return (
    <div className="flex h-dvh flex-col bg-bg">
      {/* başlık */}
      <header className="flex items-center gap-3 border-b border-border glass px-3 py-3">
        <button onClick={() => router.push("/eslesmeler")} aria-label="Eşleşmelere dön">
          <ArrowLeft />
        </button>
        <div className={`rounded-full ${tierFrame(otherTier)}`}>
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-elevated">
            {otherPhoto ? (
              <img src={otherPhoto} className="h-full w-full object-cover" style={{ filter: `blur(${blurPx}px)` }} alt="" />
            ) : (
              <div className="brand-gradient h-full w-full" />
            )}
          </div>
        </div>
        <div className="flex-1">
          <p className="flex items-center gap-1.5 font-semibold">
            <Link href={`/u/${otherId}`} className={tierName(otherTier)}>
              {otherName}
            </Link>
            {otherVerified && <BadgeCheck size={16} className="text-brand" />}
            <PremiumBadge tier={otherTier} />
            {(otherTier === "platinum" || otherTier === "legend") && <VipTag tier={otherTier} />}
          </p>
          <p className="text-xs text-muted">
            {otherTyping ? (
              <span className="text-success">yazıyor…</span>
            ) : otherOnline ? (
              <span className="flex items-center gap-1 text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> Çevrimiçi
              </span>
            ) : revealLevel >= 100 ? (
              "Fotoğraf açık"
            ) : (
              `Netlik %${revealLevel} — yazdıkça açılır`
            )}
          </p>
        </div>
        {canVoice && (
          <button
            onClick={() =>
              callsUnlocked
                ? start(matchId, "voice", { id: otherId, name: otherName, photo: otherPhoto })
                : setWarn("Arama biraz sohbet edince açılır 🔓")
            }
            disabled={busy}
            className="text-muted transition hover:text-brand disabled:opacity-40"
            aria-label={callsUnlocked ? "Sesli ara" : "Arama kilitli"}
            title={callsUnlocked ? "Sesli ara" : "Biraz sohbet edince açılır"}
          >
            {callsUnlocked ? <Phone size={20} /> : <Lock size={18} />}
          </button>
        )}
        {canVideo && (
          <button
            onClick={() =>
              callsUnlocked
                ? start(matchId, "video", { id: otherId, name: otherName, photo: otherPhoto })
                : setWarn("Görüntülü arama biraz sohbet edince açılır 🔓")
            }
            disabled={busy}
            className="text-muted transition hover:text-brand disabled:opacity-40"
            aria-label={callsUnlocked ? "Görüntülü ara" : "Arama kilitli"}
            title={callsUnlocked ? "Görüntülü ara" : "Biraz sohbet edince açılır"}
          >
            {callsUnlocked ? <Video size={20} /> : <Lock size={18} />}
          </button>
        )}
        <button
          onClick={() => setGiftOpen(true)}
          aria-label="Hediye gönder"
          className="text-muted transition hover:text-accent"
        >
          <Gift size={20} />
        </button>
        <SafetyMenu
          meId={meId}
          targetId={otherId}
          onBlocked={() => router.push("/eslesmeler")}
          extra={[{ label: "Arama geçmişi", onClick: aramaGecmisi }]}
        />
      </header>

      {/* mesajlar */}
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted">
            Eşleştiniz! Ortak yönlerinizden konuşmaya başlayın — yazdıkça fotoğraf netleşecek.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === meId;
          const isImg = m.type === "image" && !!m.media_path;
          const isVoice = m.type === "voice" && !!m.media_path;
          return (
            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              <div
                onClick={() => !mine && setReactingTo(reactingTo === m.id ? null : m.id)}
                className={`relative max-w-[78%] overflow-hidden rounded-2xl text-sm ${
                  isImg ? "p-1" : isVoice ? "p-1.5" : "px-4 py-2"
                } ${
                  mine ? "brand-gradient text-white" : `bg-surface border border-border ${tierBubble(otherTier)}`
                }`}
              >
                {isImg ? (
                  <a href={MEDIA_URL(m.media_path!)} target="_blank" rel="noopener noreferrer">
                    <img
                      src={MEDIA_URL(m.media_path!)}
                      alt="Fotoğraf"
                      loading="lazy"
                      className="max-h-72 w-full rounded-xl object-cover"
                    />
                  </a>
                ) : isVoice ? (
                  <audio
                    controls
                    preload="metadata"
                    src={MEDIA_URL(m.media_path!)}
                    className="h-10 w-56 max-w-full"
                  />
                ) : (
                  m.body
                )}
                {reactingTo === m.id && (
                  <div className="absolute -top-9 left-0 flex gap-1 rounded-full border border-border bg-surface px-2 py-1">
                    {REACTIONS.map((e) => (
                      <button key={e} onClick={() => reaksiyon(m.id, e)}>{e}</button>
                    ))}
                  </div>
                )}
              </div>
              <span className="mt-0.5 px-1 text-[10px] text-muted">{saat(m.created_at)}</span>
            </div>
          );
        })}
        {myLast?.read_at && (
          <p className="pr-1 text-right text-[11px] text-muted">okundu</p>
        )}
        {otherTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl border border-border bg-surface px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length === 0 && icebreakers.length > 0 && (
        <div className="px-4 pb-2">
          <p className="mb-2 text-xs font-medium text-muted">✨ Buz kırıcı sorular</p>
          <div className="flex flex-col gap-2">
            {icebreakers.map((q) => (
              <button
                key={q}
                onClick={() => setText(q)}
                className="rounded-2xl border border-border bg-surface px-3 py-2 text-left text-sm transition hover:border-brand"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {uploading && <p className="px-4 pb-1 text-xs text-muted">Fotoğraf yükleniyor…</p>}
      {warn && <p className="px-4 pb-1 text-xs text-brand-2">{warn}</p>}

      {/* giriş */}
      <div className="relative flex items-center gap-2 border-t border-border bg-bg p-3">
        {pickerOpen && !recording && (
          <EmojiGifPicker onEmoji={(e) => setText((t) => t + e)} onGif={gifGonder} />
        )}
        {recording ? (
          <>
            <span className="flex flex-1 items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-error" />
              Kaydediliyor… {Math.floor(recSec / 60)}:{String(recSec % 60).padStart(2, "0")}
            </span>
            <button
              onClick={sesIptal}
              className="rounded-full border border-border px-3 py-2 text-sm font-medium"
            >
              İptal
            </button>
            <button
              onClick={sesGonder}
              className="brand-gradient rounded-full px-4 py-2 text-sm font-semibold text-white"
              aria-label="Sesli mesajı gönder"
            >
              Gönder
            </button>
          </>
        ) : (
          <>
            <button
              onClick={sesBasla}
              disabled={uploading}
              title="Sesli mesaj kaydet"
              aria-label="Sesli mesaj kaydet"
              className="text-muted transition hover:text-brand disabled:opacity-50"
            >
              <Mic />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length) fotolarGonder(files);
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              title="Fotoğraf gönder"
              aria-label="Fotoğraf gönder"
              className="text-muted transition hover:text-brand disabled:opacity-50"
            >
              <ImageIcon />
            </button>
            <button
              onClick={() => setPickerOpen((v) => !v)}
              title="Emoji / GIF"
              aria-label="Emoji ve GIF"
              className={`transition hover:text-brand ${pickerOpen ? "text-brand" : "text-muted"}`}
            >
              <Smile />
            </button>
            <input
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                notifyTyping();
              }}
              onKeyDown={(e) => e.key === "Enter" && gonder()}
              placeholder="Bir mesaj yaz…"
              enterKeyHint="send"
              aria-label="Mesaj"
              className="flex-1 rounded-full border border-border bg-surface px-4 py-2.5 outline-none focus:border-brand"
            />
            <button
              onClick={gonder}
              disabled={!text.trim()}
              className="brand-gradient rounded-full p-2.5 text-white transition disabled:opacity-40"
              aria-label="Gönder"
            >
              <Send size={18} />
            </button>
          </>
        )}
      </div>

      {giftOpen && (
        <div
          className="animate-fade-in fixed inset-0 z-30 flex items-end bg-black/50"
          onClick={() => setGiftOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-slide-up w-full rounded-t-3xl border-t border-border bg-surface p-5"
          >
            <p className="t-h4 mb-1 flex items-center gap-2">
              <Gift size={18} className="text-accent" /> Hediye gönder
            </p>
            <p className="mb-4 text-xs text-muted">
              {otherName} bu hediyenin %70'ini jeton olarak kazanır.
            </p>
            <div className="grid grid-cols-5 gap-2">
              {GIFTS.map((g) => (
                <button
                  key={g.key}
                  onClick={() => hediyeGonder(g.key)}
                  className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-elevated p-2 transition hover:border-accent active:scale-95"
                >
                  <span className="text-2xl">{g.emoji}</span>
                  <span className="text-[10px] text-muted">{g.name}</span>
                  <span className="text-[11px] font-semibold text-accent">{g.cost}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {histOpen && (
        <div
          className="fixed inset-0 z-30 flex items-end bg-black/50"
          onClick={() => setHistOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[70dvh] w-full overflow-y-auto rounded-t-3xl border-t border-border bg-surface p-5"
          >
            <p className="mb-3 flex items-center gap-2 t-h4">
              <Clock size={18} /> Arama geçmişi
            </p>
            {history.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">Henüz arama yok.</p>
            ) : (
              <div className="space-y-2">
                {history.map((c, idx) => {
                  const mine = c.caller_id === meId;
                  const label =
                    c.status === "ended"
                      ? `${Math.floor((c.duration_seconds || 0) / 60)}:${String((c.duration_seconds || 0) % 60).padStart(2, "0")}`
                      : c.status === "missed"
                        ? "Cevapsız"
                        : c.status === "declined"
                          ? "Reddedildi"
                          : c.status === "cancelled"
                            ? "İptal"
                            : c.status;
                  return (
                    <div key={idx} className="flex items-center gap-3 rounded-2xl border border-border bg-elevated p-3">
                      {c.type === "video" ? (
                        <Video size={18} className="text-brand" />
                      ) : (
                        <Phone size={18} className="text-brand" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {mine ? "Giden" : "Gelen"} {c.type === "video" ? "görüntülü" : "sesli"} arama
                        </p>
                        <p className="t-caption text-muted">{label}</p>
                      </div>
                      <span className="text-xs text-muted">{zamanFarki(c.created_at)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
