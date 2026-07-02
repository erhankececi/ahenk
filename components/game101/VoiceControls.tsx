"use client";

import { useState } from "react";
import { Mic, MicOff, MessageCircle, Settings, Volume2, VolumeX } from "lucide-react";

/**
 * Sağ üst köşe kontrol çemberleri: mikrofon (aç/kapa), ses, sohbet, ayarlar.
 * Saf DOM overlay — Pixi canvas'ın ÜSTÜNE (z-index ile) oturur, oyun mantığına
 * dokunmaz. Tıklamalar yalnız local state / görsel geri bildirim üretir.
 * Konumlandırma üst orkestratöre (GameScreen) bırakılmıştır — bu bileşen
 * yalnız buton grubunu render eder ve dış konteynerin flex akışına katılır.
 */
export default function VoiceControls() {
  const [micOn, setMicOn] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <VoiceButton
        active={micOn}
        activeGlow
        label={micOn ? "Mikrofonu kapat" : "Mikrofonu aç"}
        icon={micOn ? <Mic size={16} /> : <MicOff size={16} />}
        onClick={() => setMicOn((v) => !v)}
      />
      <VoiceButton
        active={soundOn}
        label={soundOn ? "Sesi kapat" : "Sesi aç"}
        icon={soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        onClick={() => setSoundOn((v) => !v)}
      />
      <VoiceButton
        active={chatOpen}
        label="Sohbet"
        icon={<MessageCircle size={16} />}
        onClick={() => setChatOpen((v) => !v)}
      />
      <VoiceButton
        active={settingsOpen}
        label="Ayarlar"
        icon={<Settings size={16} />}
        onClick={() => setSettingsOpen((v) => !v)}
      />
    </div>
  );
}

function VoiceButton({
  icon,
  active,
  activeGlow,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  active: boolean;
  activeGlow?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`relative flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-sm transition-colors duration-200 ${
        active
          ? "border-brand/40 bg-black/40 text-brand"
          : "border-border/60 bg-black/40 text-muted"
      } hover:border-brand/60 hover:text-brand`}
    >
      {icon}
      {activeGlow && active ? (
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-success shadow-[0_0_6px_rgb(var(--success))]" />
      ) : null}
    </button>
  );
}
