// Ahenk — Güven Puanı. Hesap yaşı, doğrulama, davranış puanı ve fotoğraf ile oluşur.
export type TrustInput = {
  created_at?: string | null;
  is_verified?: boolean | null;
  verification_status?: string | null;
  behavior_score?: number | null;
  photoCount?: number;
};

export type TrustResult = {
  score: number; // 0-100
  status: "Doğrulanmış" | "Kısmen Doğrulanmış" | "İnceleniyor" | "Doğrulanmamış";
  tone: "success" | "accent" | "muted";
};

export function computeTrust(p: TrustInput): TrustResult {
  let s = 15;
  if (p.is_verified) s += 42;
  else if (p.verification_status === "pending") s += 6;

  if (p.created_at) {
    const days = (Date.now() - new Date(p.created_at).getTime()) / 86400000;
    s += Math.min(15, Math.floor(days / 4)); // ~2 ayda tavan
  }
  const beh = p.behavior_score ?? 50;
  s += Math.round(Math.max(0, Math.min(100, beh)) * 0.18); // 0..18
  const pc = p.photoCount ?? 0;
  s += pc >= 3 ? 10 : pc >= 1 ? 5 : 0;

  const score = Math.max(0, Math.min(100, Math.round(s)));

  let status: TrustResult["status"];
  let tone: TrustResult["tone"];
  if (p.is_verified) {
    status = "Doğrulanmış";
    tone = "success";
  } else if (p.verification_status === "pending") {
    status = "İnceleniyor";
    tone = "accent";
  } else if (score >= 55) {
    status = "Kısmen Doğrulanmış";
    tone = "accent";
  } else {
    status = "Doğrulanmamış";
    tone = "muted";
  }
  return { score, status, tone };
}
