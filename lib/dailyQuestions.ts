// Ahenk — Günün Sorusu havuzu. Gün indeksine göre döner (deterministik).
export const DAILY_QUESTIONS = [
  "Bugün seni en çok ne mutlu etti?",
  "Hayalindeki ilk buluşma nasıl olurdu?",
  "Vazgeçemediğin küçük bir alışkanlığın ne?",
  "Bir şarkı seçsen, seni en iyi hangisi anlatır?",
  "Hafta sonu için ideal planın ne?",
  "Son zamanlarda öğrendiğin en ilginç şey neydi?",
  "Bir yeteneğe sahip olabilseydin ne olurdu?",
  "Seni güldüren en saçma şey ne?",
  "En sevdiğin yemek ve onu kiminle paylaşmak isterdin?",
  "Hangi şehirde yaşamak hayalindi?",
  "Bir günlüğüne ünlü olsan ne yapardın?",
  "Sana göre iyi bir sohbetin sırrı ne?",
  "En son seni ne heyecanlandırdı?",
  "Çocukken hayalindeki meslek neydi?",
  "Bugün kendine ne için teşekkür ederdin?",
];

/** Yılın gününe göre soru indeksi (server'da new Date() serbest). */
export function todayQuestion(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return { idx: dayOfYear % DAILY_QUESTIONS.length, text: DAILY_QUESTIONS[dayOfYear % DAILY_QUESTIONS.length] };
}
