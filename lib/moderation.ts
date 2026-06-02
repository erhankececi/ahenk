/** Basit kural tabanlı spam/sahte hesap katmanı (AI ile sonra güçlendirilecek). */

const SPAM_PATTERNS = [
  /https?:\/\/\S+/i,
  /\b(whatsapp|telegram|instagram|insta|wp|numaram|para|iban|kazan[çc])\b/i,
  /(.)\1{6,}/, // aynı karakterin tekrarı
];

export function spamMi(text: string): { spam: boolean; sebep?: string } {
  const t = (text || "").trim();
  if (t.length === 0) return { spam: false };
  for (const re of SPAM_PATTERNS) {
    if (re.test(t)) return { spam: true, sebep: "şüpheli içerik (bağlantı/iletişim/spam)" };
  }
  const upper = t.replace(/[^A-ZÇĞİÖŞÜ]/g, "").length;
  if (t.length > 12 && upper / t.length > 0.7)
    return { spam: true, sebep: "aşırı büyük harf" };
  return { spam: false };
}

export interface FraudSignals {
  hasPhoto: boolean;
  bioLength: number;
  interestsCount: number;
  accountAgeMinutes: number;
  reportsReceived: number;
  swipesPerMinute?: number;   // çok hızlı swipe
  spamMessages?: number;      // spam'e takılan mesaj sayısı
  duplicateContentRatio?: number; // tekrarlayan içerik oranı 0-1
}

/** Sahte hesap risk skoru 0-100 (yüksek = riskli) + gerekçeler. */
export function fraudRiski(s: FraudSignals): { score: number; reasons: string[] } {
  let r = 0;
  const reasons: string[] = [];
  if (!s.hasPhoto) { r += 25; reasons.push("Fotoğraf yok"); }
  if (s.bioLength < 10) { r += 12; reasons.push("Biyografi çok kısa/yok"); }
  if (s.interestsCount < 2) { r += 10; reasons.push("İlgi alanı yetersiz"); }
  if (s.accountAgeMinutes < 5) { r += 10; reasons.push("Çok yeni hesap"); }
  if (s.reportsReceived) { r += Math.min(30, s.reportsReceived * 10); reasons.push(`${s.reportsReceived} şikayet`); }
  if ((s.swipesPerMinute ?? 0) > 30) { r += 15; reasons.push("Anormal hızlı swipe"); }
  if ((s.spamMessages ?? 0) > 0) { r += Math.min(20, s.spamMessages! * 5); reasons.push("Spam mesajlar"); }
  if ((s.duplicateContentRatio ?? 0) > 0.5) { r += 10; reasons.push("Tekrarlayan içerik"); }
  return { score: Math.min(100, r), reasons };
}

/** Yüksek riskli hesaplar moderasyon kuyruğuna alınmalı mı? */
export function moderasyonaGonder(score: number): boolean {
  return score >= 50;
}
