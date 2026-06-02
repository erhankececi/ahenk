/** Görünmez enerji puanı (0-100). Eşleşme algoritmasına girer. */
export interface EnergySignals {
  profileCompletion: number; // 0-1
  daysSinceActive: number;
  replyRate: number;         // 0-1 (gelen mesaja cevap oranı)
  reportsReceived: number;
  chatQuality: number;       // 0-100 (ortalama mesaj uzunluğu/karşılıklılık)
}

export function computeEnergy(s: EnergySignals): number {
  const completion = s.profileCompletion * 30;            // %30
  const activity = Math.max(0, 25 - s.daysSinceActive * 5); // %25
  const reply = s.replyRate * 20;                          // %20
  const quality = (s.chatQuality / 100) * 15;             // %15
  const penalty = Math.min(10, s.reportsReceived * 5);    // -%10'a kadar
  return Math.round(Math.max(0, Math.min(100, completion + activity + reply + quality + 10 - penalty)));
}

/** Profil tamamlanma oranı (0-1). */
export function profilTamamlanma(p: any): number {
  const checks = [
    !!p.name,
    !!p.birthdate,
    !!p.city,
    !!p.bio && p.bio.length > 20,
    (p.interests?.length || 0) >= 3,
    !!p.profession,
    !!p.voice_card_path,
    (p.photoCount || 0) >= 2,
  ];
  return checks.filter(Boolean).length / checks.length;
}
