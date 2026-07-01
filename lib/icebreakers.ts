import { ortakIlgiler } from "./utils";

const GENEL = [
  "Şu an ücretsiz uçak bileti kazansan nereye giderdin?",
  "Son zamanlarda dinlediğin en iyi şarkı ne?",
  "Çocukken olmak istediğin meslek neydi?",
  "Bir günlüğüne süper güç alsan ne seçerdin?",
  "Hafta sonu için kusursuz plan nedir senin için?",
];

const ILGI_SORU: Record<string, string[]> = {
  Seyahat: ["Listendeki bir sonraki şehir neresi?", "Tek yön bilet alsan nereye?"],
  Kitap: ["Herkese önerdiğin o kitap hangisi?", "Son bitirdiğin kitap nasıldı?"],
  Müzik: ["Konserine gitmek için her şeyi bırakacağın sanatçı kim?", "Şu an çalan şarkın ne?"],
  Sinema: ["Defalarca izleyebileceğin film hangisi?", "Son ağlattığın/güldürdüğün film?"],
  Kahve: ["Sade mi, sütlü mü, yoksa bambaşka bir tarif mi?", "En sevdiğin kahve mekânı neresi?"],
  Spor: ["Hangi sporu yaparken zamanı unutuyorsun?", "Maç mı, antrenman mı?"],
  Yemek: ["Gece 2'de canın ne çeker?", "En iyi yaptığın yemek ne?"],
  Doğa: ["Dağ mı deniz mi?", "Son kez ne zaman yıldızlara baktın?"],
  Sanat: ["Seni en çok etkileyen sanatçı kim?", "Hiç sergiye gider misin?"],
  Teknoloji: ["Vazgeçemediğin bir uygulama/araç var mı?", "Yapay zekayı neye kullanıyorsun?"],
};

/** Ortak ilgilere göre buz kırıcı sorular üretir (deterministik). */
export function buzKirici(meInterests: string[] = [], themInterests: string[] = []): string[] {
  const ortak = ortakIlgiler(meInterests, themInterests);
  const out: string[] = [];
  for (const ilgi of ortak) {
    const sorular = ILGI_SORU[ilgi];
    if (sorular) out.push(sorular[Math.floor(Math.random() * sorular.length)]);
    if (out.length >= 2) break;
  }
  // genel sorularla 3'e tamamla
  const kalan = GENEL.filter((g) => !out.includes(g)).sort(() => Math.random() - 0.5);
  while (out.length < 3 && kalan.length) out.push(kalan.pop()!);
  return out.slice(0, 3);
}
