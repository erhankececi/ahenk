"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { CallManager } from "@/lib/webrtc";
import { isActivePremium } from "@/lib/plans";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, SwitchCamera, Crown, Captions } from "lucide-react";
import { useAudioLevel, SpeakingBars } from "@/components/call/AudioLevel";
import { playSound } from "@/lib/sound";

type CallType = "voice" | "video";
type Other = { id: string; name: string; photo?: string | null };

type Outgoing = { phase: "outgoing"; callId: string; type: CallType; other: Other; mgr: CallManager };
type Incoming = { phase: "incoming"; callId: string; type: CallType; other: Other };
type Active = { phase: "active"; callId: string; type: CallType; other: Other; mgr: CallManager };
type State = { phase: "idle" } | Outgoing | Incoming | Active;

type Ctx = {
  start: (matchId: string, type: CallType, other: Other) => Promise<void>;
  busy: boolean;
};
const CallCtx = createContext<Ctx>({ start: async () => {}, busy: false });
export const useCall = () => useContext(CallCtx);

const ERR: Record<string, string> = {
  need_plus: "Sesli arama için Plus aboneliği gerekli.",
  need_premium: "Görüntülü arama için Premium (veya üstü) gerekli.",
  need_premium_plus: "Görüntülü arama için Premium Plus gerekli.",
  blocked: "Bu kullanıcıyla görüşme yapılamaz.",
  not_matched: "Yalnızca eşleştiğin kişiyi arayabilirsin.",
  rate_limited: "Çok sık arama yaptın, biraz bekle.",
  already_active: "Bu sohbette zaten bir arama var.",
  unauth: "Oturum gerekli.",
};

export default function CallProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [me, setMe] = useState<string | null>(null);
  const [myTier, setMyTier] = useState<string>("free");
  const [state, setState] = useState<State>({ phase: "idle" });
  const [toast, setToast] = useState<string | null>(null);
  const stateRef = useRef<State>(state);
  stateRef.current = state;

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id || null;
      setMe(uid);
      if (uid) {
        const { data: p } = await supabase
          .from("profiles")
          .select("premium_plan, premium_until")
          .eq("id", uid)
          .single();
        setMyTier(isActivePremium(p) ? p?.premium_plan || "free" : "free");
      }
    });
  }, []);

  const callQuality = (type: CallType): "sd" | "hd" | "fhd" =>
    type !== "video" ? "sd" : myTier === "platinum" || myTier === "legend" ? "fhd" : "hd";

  // Gelen arama + durum değişimi (RLS yalnız taraflara kapalı kanal sağlar)
  useEffect(() => {
    if (!me) return;
    const ch = supabase
      .channel("calls-inbox")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "calls" }, async (p) => {
        const c = p.new as any;
        if (c.callee_id !== me || c.status !== "ringing") return;
        if (stateRef.current.phase !== "idle") return;
        const { data: prof } = await supabase
          .from("profiles_card")
          .select("name")
          .eq("id", c.caller_id)
          .single();
        playSound("call");
        setState({
          phase: "incoming",
          callId: c.id,
          type: c.type,
          other: { id: c.caller_id, name: prof?.name || "Biri" },
        });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "calls" }, (p) => {
        const c = p.new as any;
        const cur = stateRef.current;
        if (cur.phase === "idle") return;
        if ((cur as any).callId !== c.id) return;
        if (["ended", "declined", "missed", "cancelled", "failed"].includes(c.status)) {
          if ((cur as any).mgr) (cur as any).mgr.cleanup();
          setState({ phase: "idle" });
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [me]);

  async function start(matchId: string, type: CallType, other: Other) {
    if (stateRef.current.phase !== "idle") return;
    const { data, error } = await supabase.rpc("start_call", { p_match: matchId, p_type: type });
    if (error) return setToast("Arama başlatılamadı.");
    const r = data as { ok: boolean; error?: string; call_id?: string };
    if (!r?.ok) return setToast(ERR[r?.error || ""] || "Arama başlatılamadı.");
    const mgr = new CallManager(supabase, r.call_id!, type === "video", callQuality(type));
    mgr.onEnded = () => endLocal(r.call_id!, "ended", false);
    mgr.onFailed = () => {
      setToast("Bağlantı kurulamadı — ağ/güvenlik duvarı engeli olabilir. Aynı Wi-Fi'da dene.");
      endLocal(r.call_id!, "failed", true);
    };
    mgr.onRemote = () => {
      const cur = stateRef.current;
      if (cur.phase === "outgoing") setState({ ...cur, phase: "active" });
    };
    setState({ phase: "outgoing", callId: r.call_id!, type, other, mgr });
    try {
      await mgr.startAsCaller();
    } catch {
      setToast("Mikrofon/kamera izni gerekli.");
      endLocal(r.call_id!, "failed", true);
    }
  }

  async function accept(call: Incoming) {
    const { data } = await supabase.rpc("answer_call", { p_call: call.callId });
    if (!(data as any)?.ok) {
      setState({ phase: "idle" });
      return;
    }
    const mgr = new CallManager(supabase, call.callId, call.type === "video", callQuality(call.type));
    mgr.onEnded = () => endLocal(call.callId, "ended", false);
    mgr.onFailed = () => {
      setToast("Bağlantı kurulamadı — ağ/güvenlik duvarı engeli olabilir.");
      endLocal(call.callId, "failed", true);
    };
    setState({ phase: "active", callId: call.callId, type: call.type, other: call.other, mgr });
    try {
      await mgr.startAsCallee();
    } catch {
      setToast("Mikrofon/kamera izni gerekli.");
      endLocal(call.callId, "failed", true);
    }
  }

  async function endLocal(callId: string, status: string, signal: boolean) {
    const cur = stateRef.current;
    const mgr = (cur as any).mgr as CallManager | undefined;
    if (signal && mgr) mgr.signalEnd();
    mgr?.cleanup();
    setState({ phase: "idle" });
    await supabase.rpc("end_call", { p_call: callId, p_status: status, p_reason: null });
  }

  return (
    <CallCtx.Provider value={{ start, busy: state.phase !== "idle" }}>
      {children}
      {state.phase === "incoming" && (
        <IncomingScreen
          call={state}
          onAccept={() => accept(state)}
          onDecline={() => endLocal(state.callId, "declined", true)}
        />
      )}
      {(state.phase === "outgoing" || state.phase === "active") && (
        <CallScreen
          state={state}
          vip={myTier === "platinum" || myTier === "legend"}
          onConnected={() => {
            const cur = stateRef.current;
            if (cur.phase === "outgoing") setState({ ...cur, phase: "active" });
          }}
          onEnd={() => endLocal(state.callId, state.phase === "outgoing" ? "cancelled" : "ended", true)}
        />
      )}
      {toast && <Toast text={toast} onDone={() => setToast(null)} />}
    </CallCtx.Provider>
  );
}

function Avatar({ name, size = 96 }: { name: string; size?: number }) {
  return (
    <div
      className="brand-gradient flex items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, fontSize: size / 2.6 }}
    >
      {name[0]?.toUpperCase()}
    </div>
  );
}

function IncomingScreen({
  call,
  onAccept,
  onDecline,
}: {
  call: Incoming;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-between bg-bg/95 px-8 py-16 backdrop-blur">
      <div className="mt-10 flex flex-col items-center gap-4">
        <Avatar name={call.other.name} />
        <div className="text-center">
          <p className="text-2xl font-bold">{call.other.name}</p>
          <p className="mt-1 text-muted">
            Gelen {call.type === "video" ? "görüntülü" : "sesli"} arama…
          </p>
        </div>
      </div>
      <div className="flex w-full max-w-xs items-center justify-around">
        <button
          onClick={onDecline}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-error text-white"
          aria-label="Reddet"
        >
          <PhoneOff />
        </button>
        <button
          onClick={onAccept}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-success text-white"
          aria-label="Kabul et"
        >
          <Phone />
        </button>
      </div>
    </div>
  );
}

function CallScreen({
  state,
  onEnd,
  onConnected,
  vip,
}: {
  state: Outgoing | Active;
  onEnd: () => void;
  onConnected: () => void;
  vip?: boolean;
}) {
  const isVideo = state.type === "video";
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const localRef = useRef<HTMLVideoElement>(null);
  const localFsRef = useRef<HTMLVideoElement>(null);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteMic, setRemoteMic] = useState(true);
  const [remoteCam, setRemoteCam] = useState(true);
  const [cc, setCC] = useState(false);
  const [caption, setCaption] = useState("");
  const active = state.phase === "active";

  // Canlı ses seviyeleri (konuşma animasyonu + "konuşuyor" göstergesi)
  const localLevel = useAudioLevel(mic ? localStream : null);
  const remoteLevel = useAudioLevel(remoteStream);
  const remoteSpeaking = active && remoteMic && remoteLevel > 0.09;

  useEffect(() => {
    const attach = (s: MediaStream) => {
      const el = isVideo ? remoteVideoRef.current : remoteAudioRef.current;
      if (el && el.srcObject !== s) {
        el.srcObject = s;
        el.play?.().catch(() => {});
      }
      setRemoteStream(s);
      onConnected();
    };
    state.mgr.onRemote = attach;
    state.mgr.onState = (m, c) => { setRemoteMic(m); setRemoteCam(c); };
    if (state.mgr.remote) attach(state.mgr.remote);

    const t = setInterval(() => {
      if (state.mgr.local) {
        setLocalStream((cur) => cur || state.mgr.local);
        for (const el of [localRef.current, localFsRef.current]) {
          if (el && !el.srcObject) {
            el.srcObject = state.mgr.local;
            el.play?.().catch(() => {});
          }
        }
      }
    }, 300);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.mgr, isVideo]);

  useEffect(() => {
    if (!active) return;
    state.mgr.sendState();
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Canlı altyazı: kendi konuşmanı tanı → broadcast; gelen altyazıyı kendi diline çevir.
  useEffect(() => {
    if (!active || !cc) { setCaption(""); return; }
    const capLang = () => {
      const m = document.cookie.match(/(?:^|; )lang=([^;]+)/);
      return m ? decodeURIComponent(m[1]).slice(0, 2) : "tr";
    };
    const supabase = createClient();
    const ch = supabase.channel(`caption-${state.callId}`);
    let clearT: any;
    ch.on("broadcast", { event: "cap" }, async ({ payload }: any) => {
      const text = (payload?.text || "").toString();
      if (!text) return;
      let shown = text;
      try {
        const r = await fetch("/api/translate", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, target: capLang() }),
        });
        const j = await r.json().catch(() => ({}));
        if (j.ok && j.text) shown = j.text;
      } catch {}
      setCaption(shown);
      clearTimeout(clearT);
      clearT = setTimeout(() => setCaption(""), 6000);
    }).subscribe();

    let rec: any = null;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const BCP: Record<string, string> = { tr: "tr-TR", en: "en-US", de: "de-DE", fr: "fr-FR", es: "es-ES", ru: "ru-RU", ar: "ar-SA", fa: "fa-IR", ku: "tr-TR" };
      rec = new SR();
      rec.lang = BCP[capLang()] || "tr-TR";
      rec.continuous = true;
      rec.interimResults = false;
      rec.onresult = (e: any) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            const text = e.results[i][0].transcript.trim();
            if (text) ch.send({ type: "broadcast", event: "cap", payload: { text } });
          }
        }
      };
      rec.onerror = () => {};
      rec.onend = () => { try { if (cc) rec.start(); } catch {} };
      try { rec.start(); } catch {}
    }
    return () => {
      clearTimeout(clearT);
      try { if (rec) { rec.onend = null; rec.stop(); } } catch {}
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, cc, state.callId]);

  const dk = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sn = String(seconds % 60).padStart(2, "0");
  const statusText = active ? `${dk}:${sn}` : state.phase === "outgoing" ? "Çalıyor…" : "Bağlanıyor…";
  const ctrl = "flex h-14 w-14 items-center justify-center rounded-full backdrop-blur transition active:scale-95";
  function toggleMic() { const v = !mic; setMic(v); state.mgr.setMic(v); }
  function toggleCam() { const v = !cam; setCam(v); state.mgr.setCam(v); }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-gradient-to-b from-[#17151A] via-[#0E0D10] to-[#050505] text-white">
      {/* ÜST — durum */}
      <div className="absolute inset-x-0 top-0 z-10 flex flex-col items-center gap-1.5 px-6 pt-[max(2.5rem,env(safe-area-inset-top))]">
        {vip && (
          <span className="inline-flex items-center gap-1 rounded-full border border-accent/50 bg-black/40 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
            <Crown size={11} /> VIP · 1080p
          </span>
        )}
        <p className="font-display text-xl font-bold">{state.other.name}</p>
        <p className="text-sm text-white/55">
          {isVideo ? "Görüntülü görüşme" : "Sesli görüşme"} · {statusText}
        </p>
      </div>

      {/* ORTA */}
      {isVideo ? (
        <div className="relative flex-1">
          {/* Bağlanana kadar KENDİ görüntün tam ekran (FaceTime mantığı) */}
          <video ref={localFsRef} autoPlay playsInline muted className={`h-full w-full -scale-x-100 object-cover ${active ? "hidden" : "block"}`} />
          {/* Aktifken karşı taraf tam ekran */}
          <video ref={remoteVideoRef} autoPlay playsInline className={`h-full w-full object-cover ${active ? "block" : "hidden"}`} />
          {active && !remoteCam && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0E0D10]">
              <Avatar name={state.other.name} size={120} />
            </div>
          )}
          {remoteSpeaking && (
            <div className="absolute left-1/2 top-[max(7rem,calc(env(safe-area-inset-top)+5.5rem))] -translate-x-1/2 text-accent">
              <SpeakingBars level={remoteLevel} max={20} />
            </div>
          )}
          {active && !remoteMic && (
            <div className="absolute left-4 top-[max(2.5rem,env(safe-area-inset-top))] flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs">
              <MicOff size={13} /> Sessizde
            </div>
          )}
          {/* yerel önizleme (PiP) — yalnız bağlandıktan sonra */}
          {active && (
            <div className="absolute right-4 top-[max(2.5rem,env(safe-area-inset-top))] h-40 w-28 overflow-hidden rounded-2xl border border-white/15 bg-[#0E0D10] shadow-float">
              <video ref={localRef} autoPlay playsInline muted className={`h-full w-full -scale-x-100 object-cover ${cam ? "" : "hidden"}`} />
              {!cam && <div className="flex h-full w-full items-center justify-center"><Avatar name="S" size={52} /></div>}
              {!mic && <div className="absolute bottom-1 left-1 rounded-full bg-black/60 p-1"><MicOff size={12} /></div>}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <div className="relative">
            <div
              className="absolute -inset-2 rounded-full transition-all duration-100"
              style={{
                boxShadow: remoteSpeaking
                  ? `0 0 ${14 + remoteLevel * 64}px ${remoteLevel * 9}px rgba(212,176,106,${0.22 + remoteLevel * 0.4})`
                  : "none",
              }}
            />
            <div className="relative"><Avatar name={state.other.name} size={132} /></div>
          </div>
          <div className="h-7 text-accent">
            <SpeakingBars level={remoteLevel} max={28} bars={7} />
          </div>
          {!remoteMic && <p className="text-sm text-white/50">Mikrofonunu kapattı</p>}
          <audio ref={remoteAudioRef} autoPlay />
        </div>
      )}

      {/* Canlı altyazı */}
      {cc && caption && (
        <div className="pointer-events-none absolute inset-x-0 bottom-28 z-20 flex justify-center px-6">
          <p className="max-w-lg rounded-xl bg-black/65 px-4 py-2 text-center text-base text-white backdrop-blur-sm">{caption}</p>
        </div>
      )}

      {/* ALT — frosted kontrol çubuğu */}
      <div className="relative z-10 mx-auto mb-[max(2rem,env(safe-area-inset-bottom))] mt-6 flex items-center justify-center gap-4 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 backdrop-blur-xl">
        <button
          onClick={toggleMic}
          aria-label={mic ? "Mikrofonu kapat" : "Mikrofonu aç"}
          className={`${ctrl} relative ${mic ? "bg-white/12 text-white" : "bg-white text-[#0E0D10]"}`}
        >
          {mic ? <Mic /> : <MicOff />}
          {mic && active && (
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-accent">
              <SpeakingBars level={localLevel} max={9} bars={4} />
            </span>
          )}
        </button>

        {isVideo && (
          <>
            <button
              onClick={toggleCam}
              aria-label={cam ? "Kamerayı kapat" : "Kamerayı aç"}
              className={`${ctrl} ${cam ? "bg-white/12 text-white" : "bg-white text-[#0E0D10]"}`}
            >
              {cam ? <Video /> : <VideoOff />}
            </button>
            <button onClick={() => state.mgr.switchCamera()} aria-label="Kamerayı değiştir" className={`${ctrl} bg-white/12 text-white`}>
              <SwitchCamera />
            </button>
          </>
        )}

        <button
          onClick={() => setCC((v) => !v)}
          aria-label={cc ? "Altyazıyı kapat" : "Canlı altyazı"}
          className={`${ctrl} ${cc ? "bg-white text-[#0E0D10]" : "bg-white/12 text-white"}`}
        >
          <Captions />
        </button>

        <button onClick={onEnd} aria-label="Görüşmeyi bitir" className={`${ctrl} bg-error text-white`}>
          <PhoneOff />
        </button>
      </div>
    </div>
  );
}

function Toast({ text, onDone }: { text: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 rounded-2xl bg-surface px-4 py-2.5 text-sm shadow-lg ring-1 ring-border">
      {text}
    </div>
  );
}
