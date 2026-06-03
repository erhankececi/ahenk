"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { CallManager } from "@/lib/webrtc";
import { isActivePremium } from "@/lib/plans";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, SwitchCamera, Crown } from "lucide-react";

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
  // Görüntülü aramada <video> hem görüntü hem sesi oynatır; sesli aramada ayrı <audio>.
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const localRef = useRef<HTMLVideoElement>(null);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const active = state.phase === "active";

  useEffect(() => {
    // Uzak medyayı doğru elemana bağla + autoplay politikasını aşmak için play() çağır.
    const attach = (s: MediaStream) => {
      const el = isVideo ? remoteVideoRef.current : remoteAudioRef.current;
      if (el && el.srcObject !== s) {
        el.srcObject = s;
        el.play?.().catch(() => {/* autoplay engeli — kullanıcı etkileşiminde tekrar denenir */});
      }
      onConnected();
    };
    state.mgr.onRemote = attach;
    if (state.mgr.remote) attach(state.mgr.remote);

    // Yerel önizleme (yalnız görüntülü) — stream hazır olunca bağla.
    const t = setInterval(() => {
      if (state.mgr.local && localRef.current && !localRef.current.srcObject) {
        localRef.current.srcObject = state.mgr.local;
        localRef.current.play?.().catch(() => {});
      }
    }, 400);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.mgr, isVideo]);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [active]);

  const dk = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sn = String(seconds % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      {/* Uzak taraf */}
      <div className="relative flex flex-1 items-center justify-center">
        {isVideo ? (
          <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
        ) : (
          <>
            <div className="flex flex-col items-center gap-4">
              <Avatar name={state.other.name} size={120} />
              <p className="text-xl font-bold text-white">{state.other.name}</p>
            </div>
            <audio ref={remoteAudioRef} autoPlay />
          </>
        )}

        {/* Yerel önizleme (video) */}
        {isVideo && (
          <video
            ref={localRef}
            autoPlay
            playsInline
            muted
            className="absolute right-4 top-4 h-40 w-28 rounded-2xl border border-white/20 object-cover"
          />
        )}

        {/* Durum / süre */}
        <div className="absolute left-0 right-0 top-8 flex flex-col items-center gap-1 text-center">
          {vip && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#d4af37]/60 bg-black/60 px-2.5 py-0.5 text-[11px] font-bold text-[#f4e6a1]">
              <Crown size={11} /> VIP Görüşme · 1080p
            </span>
          )}
          <p className={`text-lg font-semibold ${vip ? "name-premium" : "text-white"}`}>{state.other.name}</p>
          <p className="text-sm text-white/70">
            {active ? `${dk}:${sn}` : state.phase === "outgoing" ? "Çalıyor…" : "Bağlanıyor…"}
          </p>
        </div>
      </div>

      {/* Kontroller */}
      <div className="flex items-center justify-center gap-4 bg-black/40 px-6 py-8">
        <button
          onClick={() => {
            const v = !mic;
            setMic(v);
            state.mgr.setMic(v);
          }}
          className={`flex h-14 w-14 items-center justify-center rounded-full ${mic ? "bg-white/15 text-white" : "bg-white text-black"}`}
        >
          {mic ? <Mic /> : <MicOff />}
        </button>

        {isVideo && (
          <>
            <button
              onClick={() => {
                const v = !cam;
                setCam(v);
                state.mgr.setCam(v);
              }}
              className={`flex h-14 w-14 items-center justify-center rounded-full ${cam ? "bg-white/15 text-white" : "bg-white text-black"}`}
            >
              {cam ? <Video /> : <VideoOff />}
            </button>
            <button
              onClick={() => state.mgr.switchCamera()}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white"
            >
              <SwitchCamera />
            </button>
          </>
        )}

        {!isVideo && (
          <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white">
            <Volume2 />
          </button>
        )}

        <button
          onClick={onEnd}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-error text-white"
          aria-label="Bitir"
        >
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
