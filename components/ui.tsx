"use client";

import { cn } from "@/lib/utils";
import { forwardRef, useRef, useState } from "react";
import { Eye, EyeOff, Search, Check, ChevronDown, X } from "lucide-react";

/* =====================================================================
   BUTTON SİSTEMİ
   primary · secondary · ghost · outline · danger
   ===================================================================== */
type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

const BTN_VARIANTS: Record<ButtonVariant, string> = {
  primary: "brand-gradient text-white shadow-glow hover:brightness-110",
  secondary: "bg-brand/15 text-brand hover:bg-brand/25",
  ghost: "text-muted hover:bg-elevated hover:text-text",
  outline: "border border-border text-text hover:border-brand",
  danger: "bg-error/15 text-error hover:bg-error/25",
};

const BTN_SIZES: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-3.5 text-base",
};

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    full?: boolean;
  }
>(({ className, variant = "primary", size = "md", full, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(BTN_BASE, BTN_VARIANTS[variant], BTN_SIZES[size], full && "w-full", className)}
    {...props}
  />
));
Button.displayName = "Button";

export const IconButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }
>(({ className, variant = "outline", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex h-11 w-11 items-center justify-center rounded-2xl transition duration-200 active:scale-90 disabled:opacity-50",
      BTN_VARIANTS[variant],
      className
    )}
    {...props}
  />
));
IconButton.displayName = "IconButton";

/** Floating Action Button — sağ alt köşe için sabit. */
export function Fab({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "brand-gradient fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-float transition duration-200 active:scale-90",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* =====================================================================
   INPUT SİSTEMİ — validasyon durumları: default · error · success
   ===================================================================== */
type FieldState = "default" | "error" | "success";

const fieldRing = (state: FieldState) =>
  state === "error"
    ? "border-error focus:border-error"
    : state === "success"
      ? "border-success focus:border-success"
      : "border-border focus:border-brand";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { state?: FieldState }
>(({ className, state = "default", ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full rounded-2xl border bg-surface px-4 py-3 text-text placeholder:text-muted outline-none transition duration-200",
      fieldRing(state),
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { state?: FieldState }
>(({ className, state = "default", rows = 4, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={cn(
      "w-full rounded-2xl border bg-surface px-4 py-3 text-text placeholder:text-muted outline-none transition duration-200",
      fieldRing(state),
      className
    )}
    {...props}
  />
));
TextArea.displayName = "TextArea";

export function SearchInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
      <input
        className={cn(
          "w-full rounded-2xl border border-border bg-surface py-3 pl-11 pr-4 text-text placeholder:text-muted outline-none transition duration-200 focus:border-brand",
          className
        )}
        {...props}
      />
    </div>
  );
}

export const PasswordInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { state?: FieldState }
>(({ className, state = "default", ...props }, ref) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        ref={ref}
        type={show ? "text" : "password"}
        className={cn(
          "w-full rounded-2xl border bg-surface py-3 pl-4 pr-11 text-text placeholder:text-muted outline-none transition duration-200",
          fieldRing(state),
          className
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        aria-label={show ? "Gizle" : "Göster"}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

/** OTP / doğrulama kodu girişi. */
export function OtpInput({
  length = 6,
  value,
  onChange,
}: {
  length?: number;
  value: string;
  onChange: (v: string) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = value.padEnd(length).slice(0, length).split("");

  function set(i: number, c: string) {
    const digit = c.replace(/\D/g, "").slice(-1);
    const next = value.split("");
    next[i] = digit;
    onChange(next.join("").slice(0, length));
    if (digit && i < length - 1) refs.current[i + 1]?.focus();
  }

  return (
    <div className="flex justify-between gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          value={chars[i]?.trim() || ""}
          onChange={(e) => set(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !chars[i]?.trim() && i > 0) refs.current[i - 1]?.focus();
          }}
          className="h-14 w-12 rounded-2xl border border-border bg-surface text-center text-xl font-bold text-text outline-none transition duration-200 focus:border-brand"
        />
      ))}
    </div>
  );
}

/** Çoklu seçim (etiket tabanlı). */
export function MultiSelect({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (o: string) =>
    onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => toggle(o)}
          className={cn(
            "flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition duration-200",
            value.includes(o)
              ? "brand-gradient border-transparent text-white"
              : "border-border text-muted hover:text-text"
          )}
        >
          {value.includes(o) && <Check size={14} />} {o}
        </button>
      ))}
    </div>
  );
}

export function Dropdown({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-2xl border border-border bg-surface px-4 py-3 pr-10 text-text outline-none transition duration-200 focus:border-brand"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
    </div>
  );
}

/* =====================================================================
   CHIP · BADGE (geriye dönük uyumlu)
   ===================================================================== */
export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm transition duration-200",
        active
          ? "brand-gradient border-transparent text-white"
          : "border-border text-muted hover:text-text"
      )}
    >
      {children}
    </button>
  );
}

type BadgeTone = "brand" | "success" | "warning" | "error" | "accent";
const BADGE_TONES: Record<BadgeTone, string> = {
  brand: "bg-brand/15 text-brand",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  error: "bg-error/15 text-error",
  accent: "bg-accent/15 text-accent",
};

export function Badge({
  children,
  tone = "brand",
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        BADGE_TONES[tone]
      )}
    >
      {children}
    </span>
  );
}

/* =====================================================================
   CARD
   ===================================================================== */
export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-3xl border border-border bg-surface shadow-card", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/* =====================================================================
   LOADING · EMPTY · ERROR
   ===================================================================== */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-2xl", className)} />;
}

export function CardSkeleton() {
  return (
    <div className="space-y-3 rounded-3xl border border-border bg-surface p-4">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center animate-fade-in">
      {icon && <div className="mb-4 text-brand">{icon}</div>}
      <h3 className="t-h3">{title}</h3>
      {desc && <p className="mt-2 text-muted">{desc}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Bir şeyler ters gitti",
  desc,
  onRetry,
}: {
  title?: string;
  desc?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center animate-fade-in">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error/15 text-error">
        <X size={26} />
      </div>
      <h3 className="t-h3">{title}</h3>
      {desc && <p className="mt-2 text-muted">{desc}</p>}
      {onRetry && (
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          Tekrar dene
        </Button>
      )}
    </div>
  );
}
