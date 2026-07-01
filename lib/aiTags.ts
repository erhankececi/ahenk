/** Moment metnini analiz edip etiket üretir (kural-tabanlı). */
const KEYWORDS: Record<string, string[]> = {
  Kahve: ["kahve", "espresso", "latte", "cafe", "kafe"],
  Kitap: ["kitap", "okuyorum", "roman", "sayfa"],
  Müzik: ["şarkı", "müzik", "albüm", "dinliyorum", "playlist"],
  Spor: ["koşu", "spor", "antrenman", "gym", "maç", "yürüyüş"],
  Doğa: ["doğa", "deniz", "dağ", "orman", "gökyüzü", "yıldız"],
  Yemek: ["yemek", "tarif", "kahvaltı", "akşam yemeği", "tatlı"],
  Seyahat: ["yolda", "seyahat", "şehir", "tatil", "gezi"],
  "Kişisel gelişim": ["gelişim", "hedef", "öğreniyorum", "motivasyon"],
  "Sessiz yaşam": ["sakin", "huzur", "sessiz", "mola", "dinleniyorum"],
  Sinema: ["film", "dizi", "sinema", "izliyorum"],
  "İyi moral": ["mutlu", "moralim", "keyif", "harika gün", "güzel"],
};

export function momentEtiketleri(text: string = ""): string[] {
  const t = text.toLowerCase();
  const tags = new Set<string>();
  for (const [tag, words] of Object.entries(KEYWORDS)) {
    if (words.some((w) => t.includes(w))) tags.add(tag);
  }
  return Array.from(tags).slice(0, 5);
}
