/** Profil oluştururken kural-tabanlı "AI" öneriler. */
export interface ProfileDraft {
  bio?: string;
  interests?: string[];
  photoCount?: number;
  voiceCard?: boolean;
}

export function profilOnerileri(p: ProfileDraft): string[] {
  const tips: string[] = [];
  if (!p.bio || p.bio.trim().length < 40)
    tips.push("Biyografin çok kısa — seni anlatan 2-3 cümle ekle, eşleşme şansını artırır.");
  if ((p.interests?.length || 0) < 3)
    tips.push("En az 3 ilgi alanı seç; ortak ilgi yüzdesi böyle hesaplanıyor.");
  if ((p.photoCount || 0) < 2)
    tips.push("Birden fazla fotoğraf ekle — tek fotoğraflı profiller daha az güven veriyor.");
  if (!p.voiceCard)
    tips.push("30 saniyelik ses kartı ekle; sesin profilini çok daha canlı yapıyor.");
  if (p.bio && /\b(http|insta|whatsapp|numara)\b/i.test(p.bio))
    tips.push("Biyografide iletişim/bağlantı paylaşma — güvenlik filtresine takılır.");
  if (tips.length === 0) tips.push("Profilin harika görünüyor! Keşfetmeye hazırsın. ✨");
  return tips;
}
