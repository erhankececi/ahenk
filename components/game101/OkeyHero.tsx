// Ahenk 101 lobi — büyük premium hero alanı.
// Saf React/Tailwind DOM component'i (PixiJS oyun component'leriyle karışmaz).

export default function OkeyHero() {
  return (
    <div className="relative overflow-hidden rounded-3xl ahenk-gold-panel px-6 py-10 text-center sm:px-10 sm:py-14">
      {/* Arka plan dekor: mat pirinç halka + taş dokusu ima eden ince desen */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(199,169,119,0.22), transparent 60%), radial-gradient(circle at 85% 100%, rgba(199,169,119,0.10), transparent 55%)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-2xl"
        style={{ background: "radial-gradient(circle, rgba(199,169,119,0.55), transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-14 -left-10 h-44 w-44 rounded-full opacity-20 blur-2xl"
        style={{ background: "radial-gradient(circle, rgba(199,169,119,0.4), transparent 70%)" }}
      />

      <div className="relative flex flex-col items-center gap-4">
        <span className="ahenk-chip inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
          Ahenk Sosyal Oyun
        </span>

        <h1 className="brand-text text-4xl font-bold tracking-tight text-text sm:text-5xl">
          Ahenk 101
        </h1>

        <p className="max-w-xs text-[15px] leading-relaxed text-muted sm:max-w-sm sm:text-base">
          Oyna, sohbet et, tanış
        </p>

        {/* Sessiz lüks dokunuşu: üç ufak taş simgesi */}
        <div className="mt-2 flex items-center gap-2">
          {["★", "7", "12"].map((mark, i) => (
            <span
              key={i}
              className="flex h-9 w-7 items-center justify-center rounded-[6px] text-sm font-extrabold"
              style={{
                background: "linear-gradient(160deg,#FBF7EE,#E6DECB)",
                color: mark === "★" ? "#B8902F" : "#1C1C20",
                boxShadow:
                  "inset 0 1px 0 #fff, inset 0 -2px 3px rgba(0,0,0,0.18), 0 3px 6px rgba(0,0,0,0.45)",
              }}
            >
              {mark}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
