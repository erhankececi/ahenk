"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * Akıllı geri: tarayıcı geçmişi varsa geri gider (geldiğin yere),
 * yoksa (doğrudan açılış) fallback rotaya düşer.
 */
export default function BackButton({
  fallback = "/kesfet",
  label = "Geri",
}: {
  fallback?: string;
  label?: string;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => (window.history.length > 1 ? router.back() : router.push(fallback))}
      className="inline-flex items-center gap-1.5 text-muted transition hover:text-text"
      aria-label={label}
    >
      <ArrowLeft size={20} />
    </button>
  );
}
