import Link from "next/link";
import { Coins } from "lucide-react";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "glass" | "ghost" | "gold";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-6 text-base py-3.5",
};

export function Button({ children, href, onClick, variant = "primary", size = "md", className = "", type = "button", disabled }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:opacity-50 disabled:pointer-events-none";
  const v =
    variant === "primary" ? "btn-primary"
    : variant === "gold" ? "bg-gradient-to-r from-gold to-gold-2 text-[#241a00] font-bold shadow-gold"
    : variant === "ghost" ? "text-muted hover:text-text"
    : "btn-glass";
  const cls = `${base} ${sizes[size]} ${v} ${className}`;
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
}

export function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass-card rounded-2xl ${className}`}>{children}</div>;
}

export function LiveBadge({ label = "Canlı", soon = false }: { label?: string; soon?: boolean }) {
  if (soon)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
      <span className="live-dot" /> {label}
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-muted">
      {children}
    </span>
  );
}

export function Avatar({ name, size = 40, color = "#00E5FF" }: { name: string; size?: number; color?: string }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-bold text-bg"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(140deg, ${color}, #B6C4FF)`,
      }}
    >
      {initials}
    </span>
  );
}

export function JetonPill({ amount }: { amount: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-sm font-bold text-gold">
      <Coins size={15} /> {amount.toLocaleString("tr-TR")}
    </span>
  );
}

export function SectionTitle({ eyebrow, title, desc, center }: { eyebrow?: string; title: string; desc?: string; center?: boolean }) {
  return (
    <div className={center ? "text-center" : ""}>
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      {desc && <p className={`mt-2 text-[15px] leading-relaxed text-muted ${center ? "mx-auto max-w-xl" : ""}`}>{desc}</p>}
    </div>
  );
}

export function Progress({ value, color = "#00E5FF" }: { value: number; color?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
      <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${value}%`, background: color, boxShadow: `0 0 12px -2px ${color}` }} />
    </div>
  );
}

export function IconBox({ children, tone = "primary" }: { children: React.ReactNode; tone?: "primary" | "gold" | "secondary" }) {
  const c = tone === "gold" ? "text-gold bg-gold/12" : tone === "secondary" ? "text-secondary bg-secondary/12" : "text-primary bg-primary/12";
  return <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${c}`}>{children}</span>;
}

export function Stars({ rating }: { rating: number }) {
  return <span className="inline-flex items-center gap-1 text-xs font-bold text-gold">★ {rating.toFixed(1)}</span>;
}

export function Field({ icon, ...props }: { icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 transition focus-within:border-primary/50">
      <span className="text-muted">{icon}</span>
      <input {...props} className="w-full bg-transparent text-[15px] text-text outline-none placeholder:text-muted" />
    </label>
  );
}
