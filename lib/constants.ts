export const INTERACTIONS = [
  { type: "ilginc", label: "İlginç geldi", icon: "Sparkles" },
  { type: "ortak", label: "Ortak yönlerimiz var", icon: "Heart" },
  { type: "tanis", label: "Tanışmak isterim", icon: "Send" },
  { type: "daha_fazla", label: "Daha fazla öğren", icon: "Search" },
] as const;

export const INTERESTS = [
  "Seyahat", "Kitap", "Sinema", "Müzik", "Spor", "Yoga", "Kahve", "Yemek",
  "Doğa", "Fotoğrafçılık", "Sanat", "Teknoloji", "Oyun", "Dans", "Konser",
  "Yürüyüş", "Bisiklet", "Yüzme", "Kamp", "Tarih", "Felsefe", "Girişimcilik",
  "Hayvanlar", "Gönüllülük", "Moda", "Resim", "Yazmak", "Podcast", "Astronomi",
];

export const ZODIAC = [
  "Koç", "Boğa", "İkizler", "Yengeç", "Aslan", "Başak",
  "Terazi", "Akrep", "Yay", "Oğlak", "Kova", "Balık",
];

export const LANGUAGES = ["Türkçe", "İngilizce", "Almanca", "Fransızca", "Arapça", "İspanyolca", "Rusça"];

// 81 il merkez koordinatları (yaklaşık)
export const CITIES: Record<string, [number, number]> = {
  "Adana": [37.0, 35.32], "Adıyaman": [37.76, 38.28], "Afyonkarahisar": [38.76, 30.54],
  "Ağrı": [39.72, 43.05], "Amasya": [40.65, 35.83], "Ankara": [39.93, 32.85],
  "Antalya": [36.9, 30.7], "Artvin": [41.18, 41.82], "Aydın": [37.85, 27.84],
  "Balıkesir": [39.65, 27.88], "Bilecik": [40.15, 29.98], "Bingöl": [38.88, 40.5],
  "Bitlis": [38.4, 42.11], "Bolu": [40.74, 31.61], "Burdur": [37.72, 30.29],
  "Bursa": [40.19, 29.06], "Çanakkale": [40.15, 26.41], "Çankırı": [40.6, 33.62],
  "Çorum": [40.55, 34.95], "Denizli": [37.78, 29.09], "Diyarbakır": [37.91, 40.24],
  "Edirne": [41.68, 26.56], "Elazığ": [38.68, 39.22], "Erzincan": [39.75, 39.5],
  "Erzurum": [39.9, 41.27], "Eskişehir": [39.78, 30.52], "Gaziantep": [37.07, 37.38],
  "Giresun": [40.91, 38.39], "Gümüşhane": [40.46, 39.48], "Hakkari": [37.58, 43.74],
  "Hatay": [36.4, 36.35], "Isparta": [37.76, 30.55], "Mersin": [36.81, 34.64],
  "İstanbul": [41.01, 28.98], "İzmir": [38.42, 27.14], "Kars": [40.6, 43.1],
  "Kastamonu": [41.39, 33.78], "Kayseri": [38.73, 35.49], "Kırklareli": [41.74, 27.22],
  "Kırşehir": [39.15, 34.16], "Kocaeli": [40.85, 29.88], "Konya": [37.87, 32.48],
  "Kütahya": [39.42, 29.98], "Malatya": [38.35, 38.31], "Manisa": [38.61, 27.43],
  "Kahramanmaraş": [37.58, 36.93], "Mardin": [37.31, 40.74], "Muğla": [37.22, 28.36],
  "Muş": [38.74, 41.49], "Nevşehir": [38.62, 34.71], "Niğde": [37.97, 34.68],
  "Ordu": [40.98, 37.88], "Rize": [41.02, 40.52], "Sakarya": [40.78, 30.4],
  "Samsun": [41.29, 36.33], "Siirt": [37.93, 41.94], "Sinop": [42.03, 35.15],
  "Sivas": [39.75, 37.02], "Tekirdağ": [40.98, 27.51], "Tokat": [40.31, 36.55],
  "Trabzon": [41.0, 39.72], "Tunceli": [39.11, 39.55], "Şanlıurfa": [37.17, 38.79],
  "Uşak": [38.68, 29.41], "Van": [38.49, 43.41], "Yozgat": [39.82, 34.81],
  "Zonguldak": [41.45, 31.79], "Aksaray": [38.37, 34.03], "Bayburt": [40.26, 40.22],
  "Karaman": [37.18, 33.22], "Kırıkkale": [39.85, 33.51], "Batman": [37.88, 41.13],
  "Şırnak": [37.52, 42.46], "Bartın": [41.64, 32.34], "Ardahan": [41.11, 42.7],
  "Iğdır": [39.92, 44.04], "Yalova": [40.65, 29.28], "Karabük": [41.2, 32.62],
  "Kilis": [36.72, 37.12], "Osmaniye": [37.07, 36.25], "Düzce": [40.84, 31.16],
};

export const CITY_NAMES = Object.keys(CITIES).sort((a, b) => a.localeCompare(b, "tr"));

export const PREMIUM_FEATURES = [
  { title: "Kimler ziyaret etti", desc: "Profiline bakan herkesi gör" },
  { title: "Sınırsız keşif", desc: "Günlük limit olmadan keşfet" },
  { title: "Gelişmiş filtreler", desc: "İlgi, burç, yaşam tarzına göre" },
  { title: "Profil öne çıkarma", desc: "Daha çok kişi seni görsün" },
  { title: "Gizli mod", desc: "Sadece beğendiklerin seni görsün" },
];

export const PREMIUM_PLUS_FEATURES = [
  { title: "AI profil danışmanı", desc: "Profilini sürekli güçlendiren öneriler" },
  { title: "AI sohbet önerileri", desc: "Akışı bozmadan ne yazacağını öner" },
  { title: "Profil analizi", desc: "Görüntülenme ve dönüşüm istatistiklerin" },
  { title: "Gelişmiş görünürlük", desc: "Keşfet ve Moments akışında öne çık" },
  { title: "Moment performansı", desc: "Momentlerini kim gördü, nasıl performans verdi" },
  { title: "Öncelikli destek", desc: "Sorularına önce yanıt" },
];

export const EVENT_TYPES = [
  { id: "kahve", label: "Kahve içelim", emoji: "☕" },
  { id: "yuruyus", label: "Yürüyüş", emoji: "🚶" },
  { id: "film", label: "Film gecesi", emoji: "🎬" },
  { id: "konser", label: "Konser", emoji: "🎤" },
  { id: "diger", label: "Diğer", emoji: "📍" },
] as const;

/** Plan sıralaması: legend (Black Diamond) en üst. */
export const PLAN_RANK: Record<string, number> = { free: 0, plus: 1, gold: 2, platinum: 3, legend: 4 };
export const isPremium = (plan?: string) => (PLAN_RANK[plan || "free"] || 0) >= 1;
export const isPremiumPlus = (plan?: string) => (plan || "") === "platinum" || (plan || "") === "legend";
