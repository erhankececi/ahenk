"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { spamMi } from "@/lib/moderation";
import {
  ArrowLeft, Send, BadgeCheck, Mic, Image as ImageIcon, Phone, Video, Clock, Smile, Gift, Lock, Languages,
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

// Kimya seviyesi (0-100 → etiket)
function bondLevel(s: number) {
  if (s >= 80) return { label: "Özel Bağ", emoji: "💞" };
  if (s >= 60) return { label: "Güçlü Bağ", emoji: "💗" };
  if (s >= 40) return { label: "Uyumlu", emoji: "💓" };
  if (s >= 20) return { label: "Isınıyor", emoji: "💛" };
  return { label: "Yeni Tanışıyor", emoji: "🤍" };
}
import { zamanFarki, saat } from "@/lib/utils";
import { playSound } from "@/lib/sound";
import PhotoLightbox from "@/components/PhotoLightbox";
import GiftStore from "@/components/GiftStore";
import GiftAnimation from "@/components/GiftAnimation";
import { giftByName, giftByKey, RARITY, type Gift as GiftT } from "@/lib/gifts";
import { MEET_KINDS, meetByKey } from "@/lib/meet";
import { CalendarDays } from "lucide-react";
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
  initialChemistry = 0,
  metByMe = false,
  metBoth = false,
  meetInit = null,
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
  initialChemistry?: number;
  metByMe?: boolean;
  metBoth?: boolean;
  meetInit?: { kind: string; status: string; fromMe: boolean } | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const { start, busy } = useCall();
  const canVoice = true; // eşleşen herkes sesli arayabilir (v45 ile gating kaldırıldı)
  const canVideo = true; // herkes deneyebilir; kimya<100 ise ücretli (50 jeton), >=100 ücretsiz
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
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [giftAnim, setGiftAnim] = useState<{ gift: GiftT; fromMe: boolean; senderName?: string } | null>(null);
  const giftAnimRef = useRef<any>(null);
  const giftQ = useRef<any[]>([]);
  function enqueueGift(item: { gift: GiftT; fromMe: boolean; senderName?: string }) {
    if (giftAnimRef.current) {
      giftQ.current.push(item);
    } else {
      giftAnimRef.current = item;
      setGiftAnim(item);
    }
  }
  function giftDone() {
    const next = giftQ.current.shift() || null;
    giftAnimRef.current = next;
    setGiftAnim(next);
  }
  // RARE hediye → sohbet ekranı kısa süre sallanır
  const [shake, setShake] = useState(false);
  useEffect(() => {
    if (giftAnim?.gift.rarity === "rare") {
      setShake(true);
      const t = setTimeout(() => setShake(false), 700);
      return () => clearTimeout(t);
    }
  }, [giftAnim]);
  const [chemistry, setChemistry] = useState(initialChemistry);
  const [met, setMet] = useState({ mine: metByMe, both: metBoth });
  const [meet, setMeet] = useState(meetInit);
  const [meetOpen, setMeetOpen] = useState(false);
  // Anlık çeviri (mesaj başına)
  const [trans, setTrans] = useState<Record<string, { text: string; source?: string }>>({});
  const [transShow, setTransShow] = useState<Record<string, boolean>>({});
  function myLang(): string {
    if (typeof document === "undefined") return "tr";
    const m = document.cookie.match(/(?:^|; )lang=([^;]+)/);
    return m ? decodeURIComponent(m[1]).slice(0, 2) : "tr";
  }
  async function cevir(m: Message) {
    if (trans[m.id]) { setTransShow((s) => ({ ...s, [m.id]: !s[m.id] })); return; }
    setTransShow((s) => ({ ...s, [m.id]: true }));
    const r = await fetch("/api/translate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: m.body, target: myLang() }),
    });
    const j = await r.json().catch(() => ({}));
    if (j.ok) setTrans((t) => ({ ...t, [m.id]: { text: j.text, source: j.source } }));
    else setTransShow((s) => ({ ...s, [m.id]: false }));
  }

  async function bulusmaOner(kind: string) {
    setMeetOpen(false);
    setMeet({ kind, status: "bekliyor", fromMe: true });
    await fetch("/api/meet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, action: "propose", kind }),
    });
  }
  const videoFree = chemistry >= 100 || myTier === "platinum" || myTier === "legend";
  async function videoBaslat() {
    if (!callsUnlocked) { setWarn("Arama biraz sohbet edince açılır 🔓"); return; }
    if (videoFree) {
      start(matchId, "video", { id: otherId, name: otherName, photo: otherPhoto });
      return;
    }
    if (!confirm("Görüntülü görüşme 50 jeton (kimya %100 olunca ücretsiz). Devam edilsin mi?")) return;
    const r = await fetch("/api/call/pay-video", { method: "POST" });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.ok) start(matchId, "video", { id: otherId, name: otherName, photo: otherPhoto });
    else setWarn(j.error === "insufficient" ? "Yetersiz jeton — 50 jeton gerekli (Cüzdandan al)." : "Görüşme başlatılamadı.");
  }
  async function bulusmaYanit(action: "accept" | "reject") {
    setMeet((m) => (m ? { ...m, status: action === "accept" ? "kabul" : "red" } : m));
    await fetch("/api/meet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, action }),
    });
  }

  async function gorustukOnayla() {
    if (met.mine) return;
    const r = await fetch("/api/met", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId }),
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.ok) {
      setMet({ mine: true, both: !!j.both });
      setWarn(j.both ? "Görüşüldü olarak işaretlendi ✓" : "Onayın alındı — karşı taraf da onaylayınca rozet açılır.");
    }
  }
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
          // Hediye mesajı → tam ekran olay. Kendi gönderdiğim anında (hediyeGonder)
          // tetiklenir; realtime'da yalnız KARŞI tarafınkini oynat (çift oynatma yok).
          const isGiftMsg = nm.type === "text" && nm.body?.startsWith("🎁");
          if (isGiftMsg) {
            if (nm.sender_id !== meId) {
              const g = giftByName(nm.body || "");
              if (g) enqueueGift({ gift: g, fromMe: false, senderName: otherName });
            }
          } else if (nm.sender_id !== meId) {
            playSound("message");
          }
          // Kimya artışı (DB trigger ile uyumlu; hediye daha çok artırır)
          setChemistry((c) => Math.min(100, c + (isGiftMsg ? 10 : 2)));
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
    // Gönderende ANINDA tam ekran olay oynat (realtime echo'su beklenmez;
    // realtime'da kendi mesajım atlanır → çift oynatma olmaz).
    const g = giftByKey(giftKey);
    if (g) enqueueGift({ gift: g, fromMe: true });
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

  function fotoAc(clicked: Message) {
    const imgs = messages
      .filter((x) => x.type === "image" && x.media_path)
      .map((x) => MEDIA_URL(x.media_path!));
    const url = MEDIA_URL(clicked.media_path!);
    setLightbox({ images: imgs, index: Math.max(0, imgs.indexOf(url)) });
  }

  const myLast = [...messages].reverse().find((m) => m.sender_id === meId);
  // Arama "sohbet ilerledikçe" açılır: yeterince mesajlaşınca ya da fotoğraf tam açılınca.
  const callsUnlocked = revealLevel >= 100 || messages.length >= 8;

  return (
    <div className={`flex h-dvh flex-col overflow-x-hidden bg-bg ${shake ? "gift-shake" : ""}`}>
      {/* başlık */}
      <header className="flex items-center gap-3 border-b border-border glass px-3 py-3">
        <button onClick={() => router.push("/eslesmeler")} aria-label="Eşleşmelere dön">
          <ArrowLeft />
        </button>
        <button
          type="button"
          onClick={() => otherPhoto && revealLevel >= 100 && setLightbox({ images: [otherPhoto], index: 0 })}
          className={`rounded-full ${tierFrame(otherTier)}`}
          aria-label="Profil fotoğrafı"
        >
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-elevated">
            {otherPhoto ? (
              <img src={otherPhoto} className="h-full w-full object-cover" style={{ filter: `blur(${blurPx}px)` }} alt="" />
            ) : (
              <div className="brand-gradient h-full w-full" />
            )}
          </div>
        </button>
        <div className="flex-1">
          <p className="flex items-center gap-1.5 font-semibold">
            <Link href={`/u/${otherId}`} className={tierName(otherTier)}>
              {otherName}
            </Link>
            {otherVerified && <BadgeCheck size={16} className="text-brand" />}
            {met.both && (
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                Görüşüldü ✓
              </span>
            )}
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
            onClick={videoBaslat}
            disabled={busy}
            className="relative text-muted transition hover:text-brand disabled:opacity-40"
            aria-label={callsUnlocked ? "Görüntülü ara" : "Arama kilitli"}
            title={!callsUnlocked ? "Biraz sohbet edince açılır" : videoFree ? "Görüntülü ara (ücretsiz)" : "Görüntülü ara (50 jeton · %100 kimyada ücretsiz)"}
          >
            {!callsUnlocked ? <Lock size={18} /> : <Video size={20} />}
            {callsUnlocked && !videoFree && (
              <span className="absolute -right-1.5 -top-1.5 rounded-full bg-accent px-1 text-[8px] font-bold text-[#0E0D10]">50</span>
            )}
          </button>
        )}
        <button
          onClick={() => setMeetOpen(true)}
          aria-label="Buluşma öner"
          className="text-muted transition hover:text-brand"
        >
          <CalendarDays size={20} />
        </button>
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
          extra={[
            { label: "Arama geçmişi", onClick: aramaGecmisi },
            {
              label: met.mine ? "Görüşmeyi onayladın ✓" : "Yüz yüze görüştük",
              onClick: gorustukOnayla,
            },
          ]}
        />
      </header>

      {/* Kimya / Uyum çubuğu — iki tarafta da görünür, mesajlaştıkça dolar */}
      <div className="border-b border-border bg-surface/40 px-4 py-2">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 font-medium">
            {bondLevel(chemistry).emoji} {bondLevel(chemistry).label}
          </span>
          <span className="text-muted">%{chemistry} uyum</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-elevated">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-[width] duration-700 ease-out"
            style={{ width: `${chemistry}%` }}
          />
        </div>
      </div>

      {/* mesajlar */}
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted">İlk mesajı sen at 👋</p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === meId;
          const isImg = m.type === "image" && !!m.media_path;
          const isVoice = m.type === "voice" && !!m.media_path;

          // Hediye mesajı → mesaj balonundan AYRI, nadirlik renkli özel kart
          if (m.type === "text" && m.body?.startsWith("🎁")) {
            const g = giftByName(m.body);
            const rr = g ? RARITY[g.rarity] : null;
            return (
              <div key={m.id} className="flex flex-col items-center py-1">
                <div
                  className="flex items-center gap-2.5 rounded-2xl px-4 py-2"
                  style={rr ? { background: `linear-gradient(135deg, ${rr.from}, ${rr.to})`, boxShadow: `0 0 0 1px ${rr.ring}, 0 6px 18px -10px ${rr.ring}` } : undefined}
                >
                  <span className="text-2xl leading-none">{g?.emoji || "🎁"}</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{mine ? "Gönderdin" : `${otherName}`}: {g?.name || "Hediye"}</p>
                    {rr && <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: rr.text }}>{rr.label}</p>}
                  </div>
                </div>
                <span className="mt-0.5 text-[10px] text-muted">{saat(m.created_at)}</span>
              </div>
            );
          }

          return (
            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              <div
                onClick={() => !mine && setReactingTo(reactingTo === m.id ? null : m.id)}
                className={`relative max-w-[78%] overflow-hidden whitespace-pre-wrap break-words rounded-2xl text-sm ${
                  isImg ? "p-1" : isVoice ? "p-1.5" : "px-4 py-2"
                } ${
                  mine ? "brand-gradient text-[#1c1407]" : `bg-surface border border-border ${tierBubble(otherTier)}`
                }`}
              >
                {isImg ? (
                  <img
                    src={MEDIA_URL(m.media_path!)}
                    alt="Fotoğraf"
                    loading="lazy"
                    onClick={(e) => { e.stopPropagation(); fotoAc(m); }}
                    className="max-h-72 w-full cursor-pointer rounded-xl object-cover"
                  />
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
              {/* Anlık çeviri — yalnız gelen metin mesajları */}
              {!mine && !isImg && !isVoice && m.body && (
                <div className="mt-1 max-w-[78%] px-1">
                  {transShow[m.id] && (
                    <p className="rounded-xl border border-border bg-surface/60 px-3 py-1.5 text-sm text-text/90">
                      {trans[m.id]?.text || "Çevriliyor…"}
                    </p>
                  )}
                  <button
                    onClick={() => cevir(m)}
                    className="mt-1 flex items-center gap-1 text-[11px] font-medium text-muted transition hover:text-accent"
                  >
                    <Languages size={12} />
                    {!transShow[m.id]
                      ? "Çevir"
                      : trans[m.id]
                        ? `Orijinali göster${trans[m.id]?.source ? ` · ${trans[m.id]!.source!.toUpperCase()}` : ""}`
                        : "Çevir"}
                  </button>
                </div>
              )}
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

      {/* Buluşma durumu */}
      {meet && meet.status !== "red" && (
        <div className="mx-4 mb-1 rounded-2xl border border-brand/30 bg-brand/5 px-3 py-2 text-sm">
          {meet.status === "kabul" ? (
            <span className="flex items-center gap-2 font-medium text-success">
              <CalendarDays size={15} /> Buluşma planlandı: {meetByKey(meet.kind)?.emoji} {meetByKey(meet.kind)?.label} 🎉
            </span>
          ) : meet.fromMe ? (
            <span className="flex items-center gap-2 text-muted">
              <CalendarDays size={15} /> {meetByKey(meet.kind)?.label} önerin yanıt bekliyor…
            </span>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-medium">
                <CalendarDays size={15} className="text-brand" /> {meetByKey(meet.kind)?.emoji} {meetByKey(meet.kind)?.label} buluşması önerildi
              </span>
              <span className="flex shrink-0 gap-1.5">
                <button onClick={() => bulusmaYanit("accept")} className="rounded-full bg-success px-3 py-1 text-xs font-semibold text-white">Kabul</button>
                <button onClick={() => bulusmaYanit("reject")} className="rounded-full border border-border px-3 py-1 text-xs">Reddet</button>
              </span>
            </div>
          )}
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
        <GiftStore
          otherName={otherName}
          onSend={(key) => hediyeGonder(key)}
          onClose={() => setGiftOpen(false)}
        />
      )}

      {giftAnim && (
        <GiftAnimation gift={giftAnim.gift} fromMe={giftAnim.fromMe} senderName={giftAnim.senderName} onDone={giftDone} />
      )}

      {meetOpen && (
        <div className="fixed inset-0 z-40 flex items-end bg-black/50" onClick={() => setMeetOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="animate-slide-up w-full rounded-t-3xl border-t border-border bg-surface p-5">
            <p className="t-h4 mb-1 flex items-center gap-2">
              <CalendarDays size={18} className="text-brand" /> Buluşma öner
            </p>
            <p className="mb-4 text-xs text-muted">Gerçek hayatta tanışmak için bir öneri gönder.</p>
            <div className="grid grid-cols-3 gap-2.5">
              {MEET_KINDS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => bulusmaOner(m.key)}
                  className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-elevated p-3 transition hover:border-brand active:scale-95"
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[11px] text-muted">{m.label}</span>
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

      {lightbox && (
        <PhotoLightbox
          images={lightbox.images}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
