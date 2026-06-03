import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Üye numarası — profesyonel format: AHK-0001A (sıralı + tahmin edilmesi zor sağlama harfi). */
export function uyeNo(n?: number | null): string | null {
  if (!n || n < 1) return null;
  const L = "ABCDEFGHJKLMNPRSTUVYZ"; // karışmayan harfler (I/O/Q yok)
  const check = L[(n * 7 + 11) % L.length];
  return `AHK-${String(n).padStart(4, "0")}${check}`;
}

/** İki coğrafi nokta arası mesafe (km) — Haversine. */
export function distanceKm(
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null
): number | null {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/** İki dizi arasındaki ortak eleman yüzdesi (Jaccard tabanlı). */
export function overlapPercent(a: string[] = [], b: string[] = []): number {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b.map((x) => x.toLowerCase()));
  const common = a.filter((x) => setB.has(x.toLowerCase())).length;
  const union = new Set([...a, ...b].map((x) => x.toLowerCase())).size;
  return Math.round((common / union) * 100);
}

export function ortakIlgiler(a: string[] = [], b: string[] = []): string[] {
  const setB = new Set(b.map((x) => x.toLowerCase()));
  return a.filter((x) => setB.has(x.toLowerCase()));
}

export function yas(birthdate?: string | null): number | null {
  if (!birthdate) return null;
  const d = new Date(birthdate);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

/** Ad + soyad zorunluluğu: en az 2 kelime, her biri en az 2 harf. */
export function adSoyadGecerli(n: string): boolean {
  const parts = (n || "").trim().split(/\s+/).filter(Boolean);
  return parts.length >= 2 && parts.every((p) => p.length >= 2);
}

/** Sohbet saati — HH:MM (tr). */
export function saat(iso: string): string {
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export function zamanFarki(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const dk = Math.floor(diff / 60000);
  if (dk < 1) return "şimdi";
  if (dk < 60) return `${dk} dk`;
  const sa = Math.floor(dk / 60);
  if (sa < 24) return `${sa} sa`;
  const g = Math.floor(sa / 24);
  return `${g} gün`;
}
