export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <linearGradient id="lm" x1="12" y1="22" x2="52" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9cf0ff" />
          <stop offset="1" stopColor="#00b8d4" />
        </linearGradient>
      </defs>
      <path d="M22 19 A14 14 0 0 1 42 19" fill="none" stroke="url(#lm)" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M26.5 23.5 A8 8 0 0 1 37.5 23.5" fill="none" stroke="url(#lm)" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="32" cy="28" r="2.4" fill="#F2C94C" />
      <path d="M32 34 C27 31 21 31 16 33 L16 49 C21 47 27 47 32 50 C37 47 43 47 48 49 L48 33 C43 31 37 31 32 34 Z" fill="none" stroke="url(#lm)" strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M32 34 L32 50" stroke="url(#lm)" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ size = 26, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={size} />
      {withText && (
        <span className="font-bold tracking-tight" style={{ fontSize: size * 0.72 }}>
          <span className="text-primary">Ahenk</span>
          <span className="text-gold">Live</span>
        </span>
      )}
    </span>
  );
}
