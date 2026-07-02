"use client";

export interface GameToastProps {
  /** Gösterilecek metin. null/boş ise hiçbir şey render edilmez. */
  message: string | null;
}

/**
 * Kısa ömürlü, premium görünümlü bir bilgi toast'ı — ekranın alt-orta
 * kısmında belirir. Otomatik kaybolma zamanlaması (setTimeout) çağıran
 * component'te (ActionButtons) yönetilir; bu component yalnızca görseldir.
 */
export default function GameToast({ message }: GameToastProps) {
  if (!message) return null;

  return (
    <div className="pointer-events-none absolute bottom-24 left-1/2 z-20 -translate-x-1/2 sm:bottom-28">
      <div
        className={[
          "rounded-full border border-brand/40 bg-gradient-to-b from-[#241c12]/95 to-[#171310]/95",
          "px-4 py-2 shadow-[0_1px_0_rgb(255_255_255/0.08)_inset,0_6px_18px_-6px_rgb(0_0_0/0.7)]",
          "backdrop-blur-sm transition-all duration-200 ease-out",
        ].join(" ")}
      >
        <p className="whitespace-nowrap text-[11px] font-semibold tracking-wide text-brand-2 sm:text-xs">
          {message}
        </p>
      </div>
    </div>
  );
}
