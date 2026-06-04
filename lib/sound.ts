// Ahenk — premium bildirim sesleri (Web Audio ile sentezlenir, dosya gerekmez).
// Kısa, yumuşak, rahatsız etmeyen tonlar. Tarayıcı autoplay politikası için
// AudioContext kullanıcı etkileşiminde devam ettirilir.

let ctx: AudioContext | null = null;

// Ses açık/kapalı tercihi (localStorage). Varsayılan açık.
let soundOn = true;
if (typeof window !== "undefined") soundOn = localStorage.getItem("ahenk_sound") !== "off";
export function isSoundOn(): boolean {
  if (typeof window !== "undefined") return localStorage.getItem("ahenk_sound") !== "off";
  return soundOn;
}
export function setSoundOn(v: boolean) {
  soundOn = v;
  if (typeof window !== "undefined") localStorage.setItem("ahenk_sound", v ? "on" : "off");
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

// Tek bir yumuşak nota (sinüs + zarf).
function note(freq: number, startAt: number, dur: number, peak = 0.14) {
  const c = ctx!;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  const t = c.currentTime + startAt;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(peak, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export type SoundKind =
  | "message" | "match" | "call" | "event" | "request" | "purchase" | "sent";

const PRESETS: Record<SoundKind, () => void> = {
  // kısa iki nota — gelen mesaj
  message: () => { note(660, 0, 0.18); note(880, 0.08, 0.22); },
  // yumuşak yükselen üçlü — yeni eşleşme (kutlama ama abartısız)
  match: () => { note(523, 0, 0.22); note(659, 0.11, 0.22); note(784, 0.22, 0.3); },
  // sıcak çift nota — arama daveti
  call: () => { note(587, 0, 0.3, 0.16); note(880, 0.18, 0.4, 0.16); },
  // tek net nota — etkinlik daveti
  event: () => { note(740, 0, 0.26); },
  // kısa çift tık — katılım isteği
  request: () => { note(620, 0, 0.12); note(620, 0.13, 0.12); },
  // altın "ka-ching" hissi — premium/satın alma
  purchase: () => { note(784, 0, 0.16); note(1046, 0.1, 0.3, 0.16); },
  // çok kısa tık — mesaj gönderildi (opsiyonel, hafif)
  sent: () => { note(880, 0, 0.07, 0.06); },
};

export function playSound(kind: SoundKind) {
  if (!isSoundOn()) return;
  const c = getCtx();
  if (!c) return;
  try {
    PRESETS[kind]?.();
  } catch {
    /* sessiz geç */
  }
}
