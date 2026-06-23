// Ahenk Live — soru sistemi ortak sabitler/yardımcılar

export const ASK_SUBJECTS = [
  "TYT Matematik", "TYT Türkçe", "TYT Fen", "TYT Sosyal",
  "AYT Matematik", "AYT Edebiyat", "LGS Matematik", "LGS Türkçe",
  "KPSS", "Sınav Koçluğu",
];

export const COST_NORMAL = 10;
export const COST_PRIORITY = 25;

export type QStatus = "open" | "assigned" | "answered" | "closed" | "canceled";

export const STATUS_META: Record<QStatus, { label: string; cls: string }> = {
  open: { label: "Açık", cls: "border-secondary/30 bg-secondary/10 text-secondary" },
  assigned: { label: "Atandı", cls: "border-primary/30 bg-primary/10 text-primary" },
  answered: { label: "Cevaplandı", cls: "border-success/30 bg-success/10 text-success" },
  closed: { label: "Kapandı", cls: "border-white/15 bg-white/5 text-muted" },
  canceled: { label: "İptal Edildi", cls: "border-danger/30 bg-danger/10 text-danger" },
};

export function statusMeta(s: string) {
  return STATUS_META[(s as QStatus)] ?? STATUS_META.open;
}

export function shortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function rpcMessage(msg?: string): string {
  const m = msg || "";
  if (m.includes("Yetersiz jeton")) return "Yetersiz jeton. Cüzdandan jeton yükleyebilirsin.";
  if (m.includes("zaten üstlenilmiş")) return "Bu soru başka bir öğretmen tarafından üstlenilmiş.";
  if (m.includes("zaten cevaplanmış")) return "Bu soru zaten cevaplanmış.";
  if (m.includes("atanmamış")) return "Bu soru sana atanmamış.";
  if (m) return m;
  return "Bir hata oluştu, lütfen tekrar dene.";
}

export type Question = {
  id: string;
  student_id: string;
  teacher_id: string | null;
  claimed_by: string | null;
  subject: string;
  topic: string | null;
  title: string | null;
  description: string | null;
  image_url: string | null;
  answer_text: string | null;
  answer_image_url: string | null;
  status: QStatus;
  priority: boolean;
  coin_cost: number;
  created_at: string;
  answered_at: string | null;
};
