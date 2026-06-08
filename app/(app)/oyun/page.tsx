"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TableVoice } from "@/lib/tableVoice";
import { tierFrame } from "@/components/PremiumBadge";
import GiftStore from "@/components/GiftStore";
import GiftAnimation from "@/components/GiftAnimation";
import { giftByKey, type Gift as GiftT } from "@/lib/gifts";
import {
  Plus, Lock, Crown, Mic, Video, Users, Zap, X, LogOut, Play, Gamepad2, Trophy, Gift, User,
} from "lucide-react";

// Okey taşı (krem fayans + renkli sayı; fj = sahte okey/joker)
const TILE_COLORS = ["#C0533D", "#3B6EA5", "#2A2A2E", "#B8902F"]; // kırmızı/mavi/siyah/sarı
function OkeyTile({ code, onClick, dim }: { code: string; onClick?: () => void; dim?: boolean }) {
  const joker = code === "fj";
  const [c, n] = joker ? [0, 0] : code.split("-").map(Number);
  return (
    <button
      onClick={onClick}
      className={`flex h-12 w-9 shrink-0 items-center justify-center rounded-md border border-black/20 bg-[#F3EEE4] text-base font-bold shadow-sm transition ${onClick ? "hover:-translate-y-1" : ""} ${dim ? "opacity-50" : ""}`}
      style={{ color: joker ? "#B8902F" : TILE_COLORS[c] }}
    >
      {joker ? "★" : n}
    </button>
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
      body: JSON.stringify({ action: "create", ...form, name: form.name.trim() || "101 Masası" }),
    }).then((x) => x.json()).catch(() => ({}));
    setBusy(false);
    if (r.ok) { setComposing(false); setForm({ name: "", capacity: 4, kind: "acik", password: "", voice: true, video: false }); load(); }
    else setWarn("Masa kurulamadı.");
  }

  async function otur(t: Table) {
    let password = "";
    if (t.locked) { password = prompt("Masa şifresi:") || ""; if (!password) return; }
    const r = await fetch("/api/games", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join", tableId: t.id, password }),
    }).then((x) => x.json()).catch(() => ({}));
    if (!r.ok) setWarn(r.error === "sifre" ? "Yanlış şifre." : r.error === "dolu" ? "Masa dolu." : "Oturulamadı.");
    else load();
  }

  async function kalk(t: Table) {
    await fetch("/api/games", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "leave", tableId: t.id }) });
    load();
  }

  async function hizliEslesme() {
    const m = tables.find((t) => t.kind === "acik" && t.seated < t.capacity && !t.mine);
    if (m) return otur(m);
    setForm((f) => ({ ...f, name: "Hızlı Masa", kind: "acik" })); setComposing(true);
  }

  // ---- MASA ODASI ----
  if (room) {
    const seats = Array.from({ length: room.capacity }, (_, i) => room.players.find((p) => p.seat === i) || null);
    return (
      <div className="px-4 pb-24 pt-6">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">{room.name}</h1>
            <p className="text-sm text-muted">101 · {room.seated}/{room.capacity} oyuncu · {room.kind === "vip" ? "VIP" : room.kind === "sifreli" ? "Şifreli" : "Açık"} masa</p>
          </div>
          <button onClick={() => kalk(room)} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-muted transition hover:border-error/50 hover:text-error">
            <LogOut size={15} /> Kalk
          </button>
        </header>

        {/* Oyun tahtası placeholder + koltuklar */}
        <div className="relative mb-5 overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-b from-[#14241d] to-[#0b1612] p-5">
          <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(60% 60% at 50% 40%, rgba(199,169,119,0.15), transparent 70%)" }} />
          <div className="relative grid grid-cols-2 gap-4">
            {seats.map((p, i) => (
              <div key={i} className="flex flex-col items-center gap-2 rounded-2xl border border-white/5 bg-black/20 p-4">
                {p ? (
                  <>
                    <button
                      type="button"
                      onClick={() => !p.me && setActionFor({ uid: p.uid, name: p.name })}
                      className={`rounded-full transition-transform duration-100 ${tierFrame(p.tier)} ${p.me ? "" : "cursor-pointer"}`}
                      style={{
                        transform: `scale(${1 + (levels[i] || 0) * 0.14})`,
                        boxShadow: (levels[i] || 0) > 0.04 ? `0 0 ${8 + (levels[i] || 0) * 26}px ${(levels[i] || 0) * 5}px rgba(199,169,119,${0.2 + (levels[i] || 0) * 0.5})` : undefined,
                      }}
                    >
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand/40 to-accent/40 text-lg font-semibold">
                        {p.name[0]?.toUpperCase()}
                      </span>
                    </button>
                    <span className="text-sm font-medium">{p.name}{p.me ? " (sen)" : ""}</span>
                    {voiceOn && (levels[i] || 0) > 0.06 ? <Mic size={13} className="animate-pulse text-accent" /> : room.voice ? <Mic size={13} className="text-muted" /> : null}
                  </>
                ) : (
                  <>
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-white/15 text-muted"><Plus size={20} /></span>
                    <span className="text-xs text-muted">Boş</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Masa içi sesli sohbet */}
        {room.voice && (
          <div className="mb-4 flex items-center gap-2">
            {!voiceOn ? (
              <button onClick={seseKatil} className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-accent/40 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/10">
                <Mic size={16} /> Sesli sohbete katıl
              </button>
            ) : (
              <>
                <button onClick={micToggle} className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-semibold transition ${micOn ? "bg-accent/15 text-accent" : "border border-border text-muted"}`}>
                  <Mic size={16} /> {micOn ? "Mikrofon açık" : "Mikrofon kapalı"}
                </button>
                <button onClick={sesBirak} className="rounded-2xl border border-border px-4 py-2.5 text-sm text-muted transition hover:border-error/50 hover:text-error">Sesten çık</button>
              </>
            )}
          </div>
        )}

        {/* OYUN BAŞLADIYSA: tahta */}
        {game?.started ? (
          <>
          <div>
            <div className="mb-3 flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-2.5">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-[10px] text-muted">Gösterge</p>
                  {game.gosterge && <OkeyTile code={game.gosterge.code} />}
                </div>
                <div className="text-xs text-muted">
                  <p>Deste: <b className="text-text">{game.deckCount}</b></p>
                  <p>Sıra: <b className={game.turn === game.yourSeat ? "text-accent" : "text-text"}>{game.turn === game.yourSeat ? "SEN" : `${game.turn}. koltuk`}</b></p>
                </div>
              </div>
              {/* diğer oyuncuların attığı son taş */}
              <div className="flex gap-2">
                {(game.seats || []).filter((s) => s.seat !== game.yourSeat).map((s) => (
                  <div key={s.seat} className="text-center">
                    <p className="text-[10px] text-muted">{s.handCount} taş</p>
                    {s.topDiscard ? <OkeyTile code={s.topDiscard.code} dim /> : <span className="block h-12 w-9 rounded-md border border-dashed border-border" />}
                  </div>
                ))}
              </div>
            </div>

            {/* senin elin */}
            <p className="mb-1.5 text-xs text-muted">
              Elin ({game.yourHand?.length || 0} taş)
              {game.turn === game.yourSeat && game.phase === "discard" ? (finishMode ? " — BİTİR: atılacak taşa dokun" : " — atmak için taşa dokun") : ""}
            </p>
            <div className="mb-1 flex justify-end">
              <button onClick={() => setSorted((v) => !v)} className="rounded-full border border-border px-3 py-1 text-[11px] text-muted transition hover:border-accent/50 hover:text-text">
                {sorted ? "Sıralı ✓" : "Sırala"}
              </button>
            </div>
            <div className={`mb-3 flex flex-wrap gap-1.5 rounded-2xl border p-3 ${finishMode ? "border-accent bg-accent/5" : "border-border bg-surface"}`}>
              {(sorted ? sortHand(game.yourHand || []) : (game.yourHand || [])).map((t) => (
                <OkeyTile
                  key={t.id}
                  code={t.code}
                  onClick={() => {
                    if (game.turn !== game.yourSeat || game.phase !== "discard") return;
                    oyunHamle(finishMode ? "finish" : "discard", { tileId: t.id });
                  }}
                />
              ))}
            </div>

            {/* aksiyonlar */}
            {game.turn === game.yourSeat && game.phase === "draw" && (
              <div className="flex gap-2">
                <button onClick={() => oyunHamle("draw", { source: "deck" })} className="brand-gradient flex-1 rounded-2xl py-3 text-sm font-semibold">Desteden çek</button>
                <button onClick={() => oyunHamle("draw", { source: "discard" })} className="flex-1 rounded-2xl border border-border py-3 text-sm font-semibold transition hover:border-accent/50">Soldan al</button>
              </div>
            )}
            {game.turn === game.yourSeat && game.phase === "discard" && (
              <button onClick={() => setFinishMode((v) => !v)} className={`mt-2 w-full rounded-2xl py-3 text-sm font-semibold transition ${finishMode ? "border border-accent text-accent" : "bg-gradient-to-r from-accent to-brand text-[#1c1407]"}`}>
                {finishMode ? "Bitirmeyi iptal et" : "Bitir (el aç)"}
              </button>
            )}
            {game.turn !== game.yourSeat && <p className="text-center text-sm text-muted">Sıra rakipte… bekle</p>}
          </div>

          {/* Bitiş ekranı */}
          {game.finishedBy != null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-8">
              <div className="w-full max-w-sm rounded-3xl border border-accent/30 bg-surface p-6 text-center">
                <Trophy size={40} className="mx-auto mb-3 text-accent" />
                <h3 className="font-display text-xl font-bold">
                  {game.finishedBy === game.yourSeat ? "Kazandın! 🎉" : `${room.players.find((p) => p.seat === game.finishedBy)?.name || "Rakip"} bitirdi`}
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
    <div className="px-4 pb-24 pt-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight">
          <Gamepad2 size={22} className="text-accent" /> Oyun Salonu
        </h1>
        <Link href="/liderlik" className="text-muted transition hover:text-text" aria-label="Liderlik"><Trophy size={20} strokeWidth={1.7} /></Link>
      </header>

      <div className="mb-4 flex gap-2">
        <button onClick={() => setComposing(true)} className="brand-gradient flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 font-semibold">
          <Plus size={18} /> Masa kur
        </button>
        <button onClick={hizliEslesme} className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border py-3 font-semibold text-text transition hover:border-accent/50">
          <Zap size={18} className="text-accent" /> Hızlı eşleşme
        </button>
      </div>
      {warn && <p className="mb-2 text-center text-xs text-error">{warn}</p>}

      {loading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-surface" />)}</div>
      ) : tables.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Gamepad2 size={36} className="mb-3 text-accent" strokeWidth={1.5} />
          <p className="font-display text-lg font-semibold">Henüz açık masa yok</p>
          <p className="mt-1 text-sm text-muted">İlk 101 masasını sen kur — arkadaşlarını davet et.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tables.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-elevated">
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
                {t.seated >= t.capacity ? "Dolu" : "Otur"}
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
              <h3 className="font-display font-bold">Masa kur</h3>
              <button onClick={() => setComposing(false)} className="text-muted"><X size={18} /></button>
            </div>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Masa adı" className="mb-3 w-full rounded-2xl border border-border bg-elevated px-4 py-3 outline-none focus:border-brand" />

            <p className="mb-1.5 text-sm text-muted">Kişi sayısı</p>
            <div className="mb-3 flex gap-2">
              {[2, 3, 4].map((n) => (
                <button key={n} onClick={() => setForm({ ...form, capacity: n })} className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${form.capacity === n ? "bg-accent text-[#1c1407]" : "bg-elevated text-muted"}`}>{n} kişi</button>
              ))}
            </div>

            <p className="mb-1.5 text-sm text-muted">Masa türü</p>
            <div className="mb-3 flex gap-2">
              {[["acik", "Açık"], ["sifreli", "Şifreli"], ["vip", "VIP"]].map(([k, l]) => (
                <button key={k} onClick={() => setForm({ ...form, kind: k })} className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${form.kind === k ? "bg-accent text-[#1c1407]" : "bg-elevated text-muted"}`}>{l}</button>
              ))}
            </div>
            {form.kind === "sifreli" && (
              <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Masa şifresi" className="mb-3 w-full rounded-2xl border border-border bg-elevated px-4 py-3 outline-none focus:border-brand" />
            )}

            <div className="mb-4 flex gap-2">
              <button onClick={() => setForm({ ...form, voice: !form.voice })} className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm transition ${form.voice ? "bg-accent/15 text-accent" : "border border-border text-muted"}`}><Mic size={15} /> Sesli</button>
              <button onClick={() => setForm({ ...form, video: !form.video })} className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm transition ${form.video ? "bg-accent/15 text-accent" : "border border-border text-muted"}`}><Video size={15} /> Görüntülü (VIP)</button>
            </div>

            <button onClick={kur} disabled={busy} className="brand-gradient w-full rounded-2xl py-3 font-semibold disabled:opacity-50">{busy ? "Kuruluyor…" : "Masayı kur ve otur"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
