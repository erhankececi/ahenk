"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TableVoice } from "@/lib/tableVoice";
import { tierFrame } from "@/components/PremiumBadge";
import GiftStore from "@/components/GiftStore";
import GiftAnimation from "@/components/GiftAnimation";
import { giftByKey, type Gift as GiftT } from "@/lib/gifts";
import { useLang } from "@/components/LangProvider";
import {
  Plus, Lock, Crown, Mic, Video, Users, Zap, X, LogOut, Play, Gamepad2, Trophy, Gift, User,
} from "lucide-react";

// Okey taşı (fildişi fayans + kabartma sayı; fj = sahte okey/joker)
const TILE_COLORS = ["#C0392B", "#1F5FA8", "#1C1C20", "#1F8A50"]; // kırmızı/mavi/siyah/yeşil
function OkeyTile({ code, onClick, dim, big }: { code: string; onClick?: () => void; dim?: boolean; big?: boolean }) {
  const joker = code === "fj";
  const [c, n] = joker ? [0, 0] : code.split("-").map(Number);
  const sz = big ? "h-[58px] w-[42px] text-xl" : "h-12 w-9 text-base";
  return (
    <button
      onClick={onClick}
      className={`relative flex ${sz} shrink-0 items-center justify-center rounded-[7px] font-extrabold transition ${onClick ? "hover:-translate-y-1.5 active:scale-95" : ""} ${dim ? "opacity-50" : ""}`}
      style={{
        background: "linear-gradient(160deg,#FBF7EE,#E6DECB)",
        boxShadow: "inset 0 1px 0 #fff, inset 0 -2px 3px rgba(0,0,0,0.18), 0 3px 5px rgba(0,0,0,0.45)",
        color: joker ? "#B8902F" : TILE_COLORS[c],
      }}
    >
      {joker ? "★" : n}
      <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full" style={{ background: joker ? "#B8902F" : TILE_COLORS[c], opacity: 0.5 }} />
    </button>
  );
}

// Masa etrafındaki oyuncu kartı (avatar + sıra parıltısı + konuşma + el sayısı)
function Seat({ p, level, active, voiceOn, onTap }: { p: Player | null; level: number; active: boolean; voiceOn: boolean; onTap?: () => void }) {
  if (!p) return (
    <div className="flex flex-col items-center gap-1 opacity-50">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-white/20 text-white/40"><Plus size={16} /></span>
      <span className="text-[10px] text-white/40">Boş</span>
    </div>
  );
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onTap}
        className={`relative rounded-full transition-transform duration-100 ${tierFrame(p.tier)}`}
        style={{
          transform: `scale(${1 + level * 0.14})`,
          boxShadow: active
            ? "0 0 0 3px rgba(199,169,119,0.9), 0 0 18px 3px rgba(199,169,119,0.55)"
            : level > 0.04 ? `0 0 ${8 + level * 26}px ${level * 5}px rgba(199,169,119,${0.2 + level * 0.5})` : undefined,
        }}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand/50 to-accent/40 text-base font-bold text-white">
          {p.name[0]?.toUpperCase()}
        </span>
        {voiceOn && level > 0.06 && <Mic size={11} className="absolute -bottom-0.5 -right-0.5 rounded-full bg-black/70 p-0.5 text-accent" />}
      </button>
      <span className="max-w-[72px] truncate text-[11px] font-medium text-white/90">{p.me ? "Sen" : p.name}</span>
    </div>
  );
}

type GameView = {
  started: boolean; turn?: number; phase?: string; deckCount?: number;
  gosterge?: { code: string }; okey?: string; finishedBy?: number | null;
  yourSeat?: number; yourHand?: { id: string; code: string }[];
  seats?: { seat: number; handCount: number; topDiscard: { code: string } | null; discardCount: number }[];
};

type Player = { seat: number; uid: string; name: string; tier: string; me: boolean };

// Taş sıralama: renk sonra sayı; okey/joker sona
function sortHand(tiles: { id: string; code: string }[]) {
  return [...tiles].sort((a, b) => {
    const aj = a.code === "fj", bj = b.code === "fj";
    if (aj !== bj) return aj ? 1 : -1;
    const [ac, an] = a.code.split("-").map(Number);
    const [bc, bn] = b.code.split("-").map(Number);
    return ac - bc || an - bn;
  });
}
type Table = {
  id: string; name: string; capacity: number; kind: string; voice: boolean; video: boolean;
  status: string; locked: boolean; host: string; players: Player[]; seated: number; mine: boolean;
};

export default function Oyun() {
  const supabase = createClient();
  const to = useLang().t.oyun;
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({ name: "", capacity: 4, kind: "acik", password: "", voice: true, video: false });
  const [busy, setBusy] = useState(false);
  const [warn, setWarn] = useState("");
  const [game, setGame] = useState<GameView | null>(null);
  const [finishMode, setFinishMode] = useState(false);
  const gameChan = useRef<any>(null);
  const [meId, setMeId] = useState("");
  const [voiceOn, setVoiceOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [levels, setLevels] = useState<Record<number, number>>({});
  const tvRef = useRef<TableVoice | null>(null);
  const [actionFor, setActionFor] = useState<{ uid: string; name: string } | null>(null);
  const [giftFor, setGiftFor] = useState<{ uid: string; name: string } | null>(null);
  const [giftAnim, setGiftAnim] = useState<GiftT | null>(null);
  const [sorted, setSorted] = useState(true);

  async function hediyeGonder(key: string) {
    const target = giftFor; setGiftFor(null);
    if (!target) return;
    const r = await fetch("/api/gift", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to_user: target.uid, gift: key }) }).then((x) => x.json()).catch(() => ({}));
    if (r.ok) { const g = giftByKey(key); if (g) setGiftAnim(g); }
    else setWarn(r.error === "insufficient" ? "Yetersiz jeton." : "Hediye gönderilemedi.");
  }

  const room = tables.find((t) => t.mine) || null;
  const roomId = room?.id || null;
  const mySeat = room?.players.find((p) => p.me)?.seat ?? 0;

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setMeId(data.user?.id || "")); }, []);

  // Masadan ayrılınca/masaya değişince sesi kapat
  useEffect(() => {
    return () => { tvRef.current?.stop(); tvRef.current = null; };
  }, []);
  useEffect(() => {
    if (!roomId && tvRef.current) { tvRef.current.stop(); tvRef.current = null; setVoiceOn(false); setLevels({}); }
  }, [roomId]);

  async function seseKatil() {
    if (!roomId || !meId || tvRef.current) return;
    try {
      const tv = new TableVoice(supabase, roomId, meId, mySeat);
      tv.onLevels = (l) => setLevels(l);
      tvRef.current = tv;
      await tv.start();
      setVoiceOn(true); setMicOn(true);
    } catch { setWarn("Mikrofona erişilemedi."); tvRef.current = null; }
  }
  function sesBirak() { tvRef.current?.stop(); tvRef.current = null; setVoiceOn(false); setLevels({}); }
  function micToggle() { const v = !micOn; setMicOn(v); tvRef.current?.setMic(v); }

  // Masa odasındayken oyun durumu + canlı tik
  useEffect(() => {
    if (!roomId) { setGame(null); return; }
    const fetchState = () => fetch(`/api/games/state?tableId=${roomId}`).then((r) => r.json()).then(setGame).catch(() => {});
    fetchState();
    const ch = supabase.channel(`game-${roomId}`).on("broadcast", { event: "tick" }, fetchState).subscribe();
    gameChan.current = ch;
    return () => { supabase.removeChannel(ch); gameChan.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  function tick() { gameChan.current?.send({ type: "broadcast", event: "tick", payload: {} }); }

  async function oyunHamle(action: string, extra: any = {}) {
    if (!roomId) return;
    const r = await fetch("/api/games/move", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId: roomId, action, ...extra }),
    }).then((x) => x.json()).catch(() => ({}));
    if (r.ok && r.view) { setGame(r.view); setFinishMode(false); setWarn(""); tick(); }
    else setWarn(
      r.error === "sira_degil" ? "Sıra sende değil."
      : r.error === "az_oyuncu" ? "En az 2 oyuncu gerekli."
      : r.error === "yalniz_sahibi" ? "Yalnızca masa sahibi başlatır."
      : r.error === "once_cek" ? "Önce taş çek."
      : r.error === "once_at" ? "Önce taş at."
      : r.error === "atilan_yok" ? "Soldaki oyuncu henüz taş atmadı."
      : r.error === "deste_bitti" ? "Deste bitti."
      : r.error === "gecersiz_el" ? "Bu taşı atınca el geçerli değil — başka taş dene."
      : "Hamle yapılamadı.");
  }

  function load() {
    fetch("/api/games").then((r) => r.json()).then((d) => { setTables(d.tables || []); setLoading(false); });
  }
  useEffect(() => {
    load();
    const ch = supabase
      .channel("game-lobby")
      .on("postgres_changes", { event: "*", schema: "public", table: "game_seats" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "game_tables" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function kur() {
    if (busy) return;
    setBusy(true); setWarn("");
    const r = await fetch("/api/games", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...form, name: form.name.trim() || to.defaultName }),
    }).then((x) => x.json()).catch(() => ({}));
    setBusy(false);
    if (r.ok) { setComposing(false); setForm({ name: "", capacity: 4, kind: "acik", password: "", voice: true, video: false }); load(); }
    else setWarn(to.errCreate);
  }

  async function otur(t: Table) {
    let password = "";
    if (t.locked) { password = prompt(to.passPrompt) || ""; if (!password) return; }
    const r = await fetch("/api/games", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join", tableId: t.id, password }),
    }).then((x) => x.json()).catch(() => ({}));
    if (!r.ok) setWarn(r.error === "sifre" ? to.errPass : r.error === "dolu" ? to.errFull : to.errSit);
    else load();
  }

  async function kalk(t: Table) {
    await fetch("/api/games", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "leave", tableId: t.id }) });
    load();
  }

  async function hizliEslesme() {
    const m = tables.find((t) => t.kind === "acik" && t.seated < t.capacity && !t.mine);
    if (m) return otur(m);
    setForm((f) => ({ ...f, name: to.quickName, kind: "acik" })); setComposing(true);
  }

  // ---- MASA ODASI ----
  if (room) {
    const opps = room.players.filter((p) => !p.me).sort((a, b) => a.seat - b.seat);
    const meP = room.players.find((p) => p.me) || null;
    const started = !!game?.started;
    const myTurn = started && game!.turn === game!.yourSeat;
    // rakip konumları (mobil felt üstünde)
    const POS: Record<number, React.CSSProperties[]> = {
      1: [{ top: 10, left: "50%", transform: "translateX(-50%)" }],
      2: [{ top: 10, left: "16%" }, { top: 10, right: "16%" }],
      3: [{ top: "42%", left: 8 }, { top: 10, left: "50%", transform: "translateX(-50%)" }, { top: "42%", right: 8 }],
    };
    const seatData = (seat: number) => (game?.seats || []).find((s) => s.seat === seat);

    return (
      <div className="min-h-dvh px-3 pb-28 pt-4">
        <header className="mb-3 flex items-center justify-between px-1">
          <div className="min-w-0">
            <h1 className="truncate font-display text-lg font-bold tracking-tight">{room.name}</h1>
            <p className="text-xs text-muted">101 · {room.seated}/{room.capacity} · {room.kind === "vip" ? "VIP" : room.kind === "sifreli" ? "Şifreli" : "Açık"}</p>
          </div>
          <div className="flex items-center gap-2">
            {room.voice && (voiceOn ? (
              <button onClick={micToggle} className={`flex h-9 w-9 items-center justify-center rounded-full transition ${micOn ? "bg-accent/15 text-accent" : "border border-border text-muted"}`} aria-label="Mikrofon"><Mic size={16} /></button>
            ) : (
              <button onClick={seseKatil} className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/40 text-accent" aria-label="Sese katıl"><Mic size={16} /></button>
            ))}
            <button onClick={() => kalk(room)} className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-muted transition hover:border-error/50 hover:text-error">
              <LogOut size={14} /> Kalk
            </button>
          </div>
        </header>

        {/* ÇUHA MASA */}
        <div
          className="relative mb-4 h-[340px] overflow-hidden rounded-[44px] border-[6px] border-[#1a140c] shadow-float"
          style={{ background: "radial-gradient(120% 90% at 50% 38%, #1f5a3e 0%, #15402c 55%, #0e2c1e 100%)" }}
        >
          <div className="pointer-events-none absolute inset-3 rounded-[36px] ring-1 ring-accent/20" />

          {/* rakipler */}
          {opps.map((p, i) => {
            const sd = seatData(p.seat);
            return (
              <div key={p.seat} className="absolute flex flex-col items-center" style={(POS[opps.length] || POS[1])[i]}>
                <Seat p={p} level={levels[p.seat] || 0} active={started && game!.turn === p.seat} voiceOn={voiceOn} onTap={() => setActionFor({ uid: p.uid, name: p.name })} />
                {started && (
                  <div className="mt-1 flex items-center gap-1">
                    <span className="rounded-full bg-black/40 px-1.5 text-[10px] text-white/70">{sd?.handCount ?? "-"}</span>
                    {sd?.topDiscard ? <OkeyTile code={sd.topDiscard.code} dim /> : null}
                  </div>
                )}
              </div>
            );
          })}

          {/* MERKEZ: gösterge + deste */}
          <div className="absolute left-1/2 top-[46%] flex -translate-x-1/2 -translate-y-1/2 items-center gap-3">
            {started ? (
              <>
                <div className="flex flex-col items-center">
                  <span className="mb-1 text-[10px] uppercase tracking-wider text-white/60">Gösterge</span>
                  {game!.gosterge && <OkeyTile code={game!.gosterge.code} big />}
                </div>
                <div className="flex flex-col items-center rounded-2xl bg-black/30 px-3 py-2">
                  <span className="text-[10px] text-white/60">Deste</span>
                  <span className="font-display text-xl font-bold text-white">{game!.deckCount}</span>
                  <span className="text-[10px] text-accent">Okey: {game!.okey}</span>
                </div>
              </>
            ) : (
              <div className="text-center">
                <Gamepad2 size={28} className="mx-auto mb-1 text-accent/70" />
                <p className="text-sm text-white/70">Masa hazırlanıyor</p>
              </div>
            )}
          </div>

          {/* SEN (altta) */}
          {meP && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <Seat p={meP} level={levels[meP.seat] || 0} active={myTurn} voiceOn={voiceOn} />
            </div>
          )}

          {/* sıra bandı */}
          {started && (
            <div className="absolute left-1/2 top-2.5 -translate-x-1/2 rounded-full bg-black/45 px-3 py-0.5 text-[11px] font-semibold text-accent backdrop-blur">
              {myTurn ? (game!.phase === "draw" ? "Sıra sende — taş çek" : finishMode ? "Bitir: bir taşa dokun" : "Sıra sende — taş at") : "Rakipte…"}
            </div>
          )}
        </div>

        {/* OYUN BAŞLADIYSA: ıstaka */}
        {started ? (
          <>
          <div>
            <div className="mb-1.5 flex items-center justify-between px-1">
              <span className="text-xs text-muted">Elin · {game!.yourHand?.length || 0} taş</span>
              <button onClick={() => setSorted((v) => !v)} className="rounded-full border border-border px-3 py-1 text-[11px] text-muted transition hover:border-accent/50 hover:text-text">
                {sorted ? "Sıralı ✓" : "Sırala"}
              </button>
            </div>
            {/* ıstaka (taş rafı) */}
            <div
              className={`mb-3 flex flex-wrap gap-1.5 rounded-2xl border-b-[5px] p-3 ${finishMode ? "border-accent" : "border-[#1a140c]"}`}
              style={{ background: "linear-gradient(160deg,#2a2018,#16110b)" }}
            >
              {(sorted ? sortHand(game!.yourHand || []) : (game!.yourHand || [])).map((t) => (
                <OkeyTile key={t.id} code={t.code} big
                  onClick={() => { if (myTurn && game!.phase === "discard") oyunHamle(finishMode ? "finish" : "discard", { tileId: t.id }); }}
                />
              ))}
            </div>

            {/* aksiyonlar */}
            {myTurn && game!.phase === "draw" && (
              <div className="flex gap-2">
                <button onClick={() => oyunHamle("draw", { source: "deck" })} className="brand-gradient flex-1 rounded-2xl py-3 text-sm font-semibold">Desteden çek</button>
                <button onClick={() => oyunHamle("draw", { source: "discard" })} className="flex-1 rounded-2xl border border-border py-3 text-sm font-semibold transition hover:border-accent/50">Yerden al</button>
              </div>
            )}
            {myTurn && game!.phase === "discard" && (
              <button onClick={() => setFinishMode((v) => !v)} className={`w-full rounded-2xl py-3 text-sm font-semibold transition ${finishMode ? "border border-accent text-accent" : "bg-gradient-to-r from-accent to-brand text-[#1c1407]"}`}>
                {finishMode ? "Bitirmeyi iptal et" : "Bitir (el aç)"}
              </button>
            )}
          </div>

          {/* Bitiş ekranı */}
          {game!.finishedBy != null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-8">
              <div className="w-full max-w-sm rounded-3xl border border-accent/30 bg-surface p-6 text-center">
                <Trophy size={40} className="mx-auto mb-3 text-accent" />
                <h3 className="font-display text-xl font-bold">
                  {game!.finishedBy === game!.yourSeat ? "Kazandın! 🎉" : `${room.players.find((p) => p.seat === game!.finishedBy)?.name || "Rakip"} bitirdi`}
                </h3>
                <p className="mt-1 text-sm text-muted">El bitti. Puanlar liderliğe işlendi.</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => oyunHamle("newhand")} className="brand-gradient flex-1 rounded-2xl py-3 text-sm font-semibold">Yeni el</button>
                  <button onClick={() => kalk(room)} className="flex-1 rounded-2xl border border-border py-3 text-sm font-semibold">Masadan kalk</button>
                </div>
              </div>
            </div>
          )}
          </>
        ) : (
          <>
            <button
              onClick={() => oyunHamle("start")}
              disabled={room.seated < 2}
              className="brand-gradient flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold disabled:opacity-50"
            >
              <Play size={18} /> Oyunu başlat
            </button>
            <p className="mt-2 text-center text-xs text-muted">En az 2 oyuncu oturunca <b className="text-text">masa sahibi</b> başlatır.</p>
          </>
        )}
        {warn && <p className="mt-2 text-center text-xs text-error">{warn}</p>}

        {/* Oyuncu aksiyonları (avatara dokununca) */}
        {actionFor && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm" onClick={() => setActionFor(null)}>
            <div onClick={(e) => e.stopPropagation()} className="w-full rounded-t-3xl border-t border-border bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <p className="mb-3 font-display font-bold">{actionFor.name}</p>
              <button onClick={() => { setGiftFor(actionFor); setActionFor(null); }} className="brand-gradient mb-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold">
                <Gift size={17} /> Hediye gönder
              </button>
              <Link href={`/u/${actionFor.uid}`} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 font-semibold transition hover:border-accent/50">
                <User size={17} /> Profili gör
              </Link>
            </div>
          </div>
        )}
        {giftFor && <GiftStore otherName={giftFor.name} onSend={hediyeGonder} onClose={() => setGiftFor(null)} />}
        {giftAnim && <GiftAnimation gift={giftAnim} fromMe onDone={() => setGiftAnim(null)} />}
      </div>
    );
  }

  // ---- LOBİ ----
  return (
    <div className="lp-page min-h-dvh px-4 pb-28 pt-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{to.eyebrow}</p>
          <h1 className="flex items-center gap-2 font-display text-2xl font-semibold tracking-[-0.04em] text-text">
            <Gamepad2 size={22} className="text-accent" /> {to.title}
          </h1>
        </div>
        <Link href="/liderlik" className="text-muted transition hover:text-text" aria-label={to.leaderboard}><Trophy size={20} strokeWidth={1.7} /></Link>
      </header>

      <div className="mb-4 flex gap-2">
        <button onClick={() => setComposing(true)} className="brand-gradient flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 font-semibold">
          <Plus size={18} /> {to.createTable}
        </button>
        <button onClick={hizliEslesme} className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border py-3 font-semibold text-text transition hover:border-accent/50">
          <Zap size={18} className="text-accent" /> {to.quickMatch}
        </button>
      </div>
      {warn && <p className="mb-2 text-center text-xs text-error">{warn}</p>}

      {loading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="shimmer h-20 rounded-2xl" />)}</div>
      ) : tables.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent"><Gamepad2 size={26} strokeWidth={1.6} /></span>
          <p className="font-display text-lg font-semibold text-text">{to.emptyTitle}</p>
          <p className="mt-1.5 text-sm text-muted">{to.emptyDesc}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tables.map((t) => (
            <div key={t.id} className="lp-panel-hover flex items-center gap-3 rounded-2xl p-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0E0D10]">
                {t.kind === "vip" ? <Crown size={20} className="text-accent" /> : t.locked ? <Lock size={18} className="text-muted" /> : <Gamepad2 size={20} className="text-accent" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate font-semibold">
                  {t.name}
                  {t.voice && <Mic size={12} className="text-accent" />}
                  {t.video && <Video size={12} className="text-accent" />}
                </p>
                <p className="flex items-center gap-1 text-xs text-muted">
                  <Users size={12} /> {t.seated}/{t.capacity} · {t.host} · 101
                </p>
              </div>
              <button
                onClick={() => otur(t)}
                disabled={t.seated >= t.capacity}
                className="brand-gradient shrink-0 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-40"
              >
                {t.seated >= t.capacity ? to.full : to.sit}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Masa kur modalı */}
      {composing && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm sm:items-center sm:justify-center" onClick={() => setComposing(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl border-t border-border bg-surface p-5 sm:rounded-3xl sm:border">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display font-bold">{to.modalTitle}</h3>
              <button onClick={() => setComposing(false)} className="text-muted"><X size={18} /></button>
            </div>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={to.tableName} className="mb-3 w-full rounded-2xl border border-border bg-elevated px-4 py-3 outline-none focus:border-brand" />

            <p className="mb-1.5 text-sm text-muted">{to.playerCount}</p>
            <div className="mb-3 flex gap-2">
              {[2, 3, 4].map((n) => (
                <button key={n} onClick={() => setForm({ ...form, capacity: n })} className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${form.capacity === n ? "bg-accent text-[#1c1407]" : "bg-elevated text-muted"}`}>{n} {to.personSuffix}</button>
              ))}
            </div>

            <p className="mb-1.5 text-sm text-muted">{to.tableType}</p>
            <div className="mb-3 flex gap-2">
              {([["acik", to.typeOpen], ["sifreli", to.typeLocked], ["vip", to.typeVip]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setForm({ ...form, kind: k })} className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${form.kind === k ? "bg-accent text-[#1c1407]" : "bg-elevated text-muted"}`}>{l}</button>
              ))}
            </div>
            {form.kind === "sifreli" && (
              <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={to.tablePassword} className="mb-3 w-full rounded-2xl border border-border bg-elevated px-4 py-3 outline-none focus:border-brand" />
            )}

            <div className="mb-4 flex gap-2">
              <button onClick={() => setForm({ ...form, voice: !form.voice })} className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm transition ${form.voice ? "bg-accent/15 text-accent" : "border border-border text-muted"}`}><Mic size={15} /> {to.voice}</button>
              <button onClick={() => setForm({ ...form, video: !form.video })} className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm transition ${form.video ? "bg-accent/15 text-accent" : "border border-border text-muted"}`}><Video size={15} /> {to.video}</button>
            </div>

            <button onClick={kur} disabled={busy} className="brand-gradient w-full rounded-2xl py-3 font-semibold disabled:opacity-50">{busy ? to.creating : to.create}</button>
          </div>
        </div>
      )}
    </div>
  );
}
