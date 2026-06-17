// Hafif i18n — herkese açık (pazarlama) site + dil seçici. TR/EN ile başlar,
// yapı yeni dil eklemeye uygun. Uygulama-içi ekranlar kademeli taşınabilir.
export type Lang = "tr" | "en" | "ku";

export const LANGS: { code: Lang; label: string; native: string }[] = [
  { code: "tr", label: "Türkçe", native: "Türkçe" },
  { code: "en", label: "İngilizce", native: "English" },
  { code: "ku", label: "Kürtçe", native: "Kurdî" },
];

type Dict = {
  nav: { features: string; safety: string; about: string; download: string; login: string; signup: string };
  hero: { tagline: string; title: string; subtitle: string; ctaPrimary: string; ctaSecondary: string };
  features: { title: string; items: { t: string; d: string }[] };
  how: { title: string; steps: { t: string; d: string }[] };
  safetyBlock: { title: string; desc: string; cta: string };
  download: { title: string; subtitle: string; soon: string; web: string };
  about: { title: string; body: string[] };
  footer: { rights: string; product: string; company: string; legal: string; privacy: string; terms: string; kvkk: string; lang: string };
  legal: { privacy: string; terms: string; kvkk: string; updated: string; back: string };
};

const tr: Dict = {
  nav: { features: "Özellikler", safety: "Güvenlik", about: "Hakkında", download: "İndir", login: "Giriş yap", signup: "Üye ol" },
  hero: {
    tagline: "Önce ruh, sonra yüz.",
    title: "Karakterinle tanış,\nyüzün sonra gelir.",
    subtitle:
      "Ahenk; fotoğrafla değil, kişilik ve ortak ilgi alanlarıyla başlayan bir tanışma deneyimi. Fotoğraflar başta bulanıktır, sohbet derinleştikçe netleşir.",
    ctaPrimary: "Hemen başla",
    ctaSecondary: "Nasıl çalışır?",
  },
  features: {
    title: "Neden Ahenk?",
    items: [
      { t: "Önce karakter", d: "Eşleşmeler ilgi, yaşam tarzı ve değerlere göre kurulur — yüzeysel değil." },
      { t: "Kademeli netlik", d: "Fotoğraflar sohbet ilerledikçe açılır; önce gerçek bağ, sonra görünüm." },
      { t: "Sesli & görüntülü", d: "Eşleştiğin kişiyle güvenli sesli/görüntülü görüşme, uygulama içinde." },
      { t: "Gerçek topluluk", d: "Net topluluk kuralları, güçlü moderasyon ve engelle/bildir araçları." },
    ],
  },
  how: {
    title: "Nasıl çalışır?",
    steps: [
      { t: "Profilini oluştur", d: "İlgi alanlarını, yaşam tarzını ve sesli tanıtımını ekle." },
      { t: "Karakterle keşfet", d: "Sana uygun kişileri kişilik ve yakınlığa göre gör." },
      { t: "Tanış ve netleş", d: "Sohbet ettikçe fotoğraflar açılır, bağ derinleşir." },
    ],
  },
  safetyBlock: {
    title: "Güvenlik önce gelir",
    desc: "Topluluk kuralları, moderasyon, engelleme ve bildirme araçlarıyla herkes için saygılı bir ortam.",
    cta: "Güvenlik & topluluk",
  },
  download: {
    title: "Ahenk'i indir",
    subtitle: "iOS ve Android'de yakında. Şimdi web üzerinden katıl.",
    soon: "Yakında",
    web: "Web'de devam et",
  },
  about: {
    title: "Hakkında",
    body: [
      "Ahenk, tanışmayı yüzeysellikten kurtarmak için kuruldu. İnsanlar tek bir fotoğrafa indirgenmemeli; karakter, ilgi ve değerler önce gelmeli.",
      "İmza fikrimiz basit: fotoğraflar başta bulanıktır, gerçek bir sohbet kurdukça netleşir. Böylece bağ, görünüşten önce kurulur.",
      "Türkiye'de geliştirildi; mahremiyet ve güvenlik (KVKK/GDPR) önceliğimizdir.",
    ],
  },
  footer: { rights: "Tüm hakları saklıdır.", product: "Ürün", company: "Şirket", legal: "Yasal", privacy: "Gizlilik Politikası", terms: "Kullanım Koşulları", kvkk: "KVKK Aydınlatma", lang: "Dil" },
  legal: { privacy: "Gizlilik Politikası", terms: "Kullanım Koşulları", kvkk: "KVKK Aydınlatma Metni", updated: "Son güncelleme", back: "Ana sayfa" },
};

const en: Dict = {
  nav: { features: "Features", safety: "Safety", about: "About", download: "Download", login: "Log in", signup: "Sign up" },
  hero: {
    tagline: "Soul first, face later.",
    title: "Meet who they are,\nnot just how they look.",
    subtitle:
      "Ahenk starts with personality and shared interests, not photos. Pictures begin blurred and become clear as your conversation deepens.",
    ctaPrimary: "Get started",
    ctaSecondary: "How it works",
  },
  features: {
    title: "Why Ahenk?",
    items: [
      { t: "Character first", d: "Matches are built on interests, lifestyle and values — never just looks." },
      { t: "Gradual reveal", d: "Photos clear up as you chat; real connection comes before appearance." },
      { t: "Voice & video", d: "Safe in-app voice and video calls with the people you match." },
      { t: "Real community", d: "Clear guidelines, strong moderation and block/report tools." },
    ],
  },
  how: {
    title: "How it works",
    steps: [
      { t: "Build your profile", d: "Add your interests, lifestyle and a voice intro." },
      { t: "Discover by character", d: "See people matched on personality and closeness." },
      { t: "Meet and reveal", d: "As you chat, photos clear and the bond deepens." },
    ],
  },
  safetyBlock: {
    title: "Safety comes first",
    desc: "Community guidelines, moderation, blocking and reporting tools keep Ahenk respectful for everyone.",
    cta: "Safety & community",
  },
  download: {
    title: "Get Ahenk",
    subtitle: "Coming soon on iOS and Android. Join on the web for now.",
    soon: "Soon",
    web: "Continue on web",
  },
  about: {
    title: "About",
    body: [
      "Ahenk was built to take the shallowness out of dating. People shouldn't be reduced to a single photo — character, interests and values should come first.",
      "Our signature idea is simple: photos start blurred and clear up as you build a real conversation. Connection comes before appearance.",
      "Built in Türkiye; privacy and safety (KVKK/GDPR) are our priority.",
    ],
  },
  footer: { rights: "All rights reserved.", product: "Product", company: "Company", legal: "Legal", privacy: "Privacy Policy", terms: "Terms of Use", kvkk: "KVKK Notice", lang: "Language" },
  legal: { privacy: "Privacy Policy", terms: "Terms of Use", kvkk: "KVKK Disclosure", updated: "Last updated", back: "Home" },
};

const ku: Dict = {
  nav: { features: "Taybetmendî", safety: "Ewlehî", about: "Derbar", download: "Daxistin", login: "Têkeve", signup: "Tomar bibe" },
  hero: {
    tagline: "Pêşî giyan, paşê rû.",
    title: "Bi karakterê xwe nas bike,\nrûyê te paşê tê.",
    subtitle:
      "Ahenk; ne bi wêneyan, bi kesayetî û berjewendiyên hevpar dest pê dike. Wêne di destpêkê de tarî ne, gava axaftin kûr dibe zelal dibin.",
    ctaPrimary: "Niha dest pê bike",
    ctaSecondary: "Çawa dixebite?",
  },
  features: {
    title: "Çima Ahenk?",
    items: [
      { t: "Pêşî karakter", d: "Hevûdîtin li gorî berjewendî, awayê jiyanê û nirxan tê avakirin — ne tenê li gorî rû." },
      { t: "Zelalbûna gav bi gav", d: "Wêne gava tu diaxivî zelal dibin; pêwendiya rastîn pêşî tê, paşê xuyanî." },
      { t: "Deng û vîdyo", d: "Bi kesê ku tu pê re hevûdîtî, axaftina deng/vîdyoyê ya ewle di sepanê de." },
      { t: "Civata rastîn", d: "Rêbazên zelal, moderasyona xurt û amûrên astengkirin/ragihandinê." },
    ],
  },
  how: {
    title: "Çawa dixebite?",
    steps: [
      { t: "Profîla xwe çêke", d: "Berjewendî, awayê jiyanê û danasîna dengî zêde bike." },
      { t: "Bi karakter keşf bike", d: "Kesên ku li gorî kesayetî û nêzîkahiyê li te tên bibîne." },
      { t: "Nas bike û zelal bibe", d: "Gava tu diaxivî wêne zelal dibin, pêwendî kûr dibe." },
    ],
  },
  safetyBlock: {
    title: "Ewlehî pêşî tê",
    desc: "Bi rêbazên civatê, moderasyon, astengkirin û ragihandinê ji bo herkesî hawîrdorek bi rêz.",
    cta: "Ewlehî & civat",
  },
  download: {
    title: "Ahenk daxe",
    subtitle: "Di nêzîk de li iOS û Android. Niha li ser webê tev li bibe.",
    soon: "Di nêzîk de",
    web: "Li ser webê bidomîne",
  },
  about: {
    title: "Derbar",
    body: [
      "Ahenk hat avakirin da ku nasîn ji rûçikîbûnê rizgar bike. Mirov nabe bi tenê yek wêneyî werin kêmkirin; karakter, berjewendî û nirx divê pêşî werin.",
      "Ramana me ya sereke hêsan e: wêne di destpêkê de tarî ne û gava tu axaftineke rastîn ava dikî zelal dibin. Pêwendî beriya xuyabûnê tê.",
      "Li Tirkiyeyê hat pêşxistin; nepenîtî û ewlehî (KVKK/GDPR) pêşînneya me ne.",
    ],
  },
  footer: { rights: "Hemû maf parastî ne.", product: "Hilber", company: "Şirket", legal: "Qanûnî", privacy: "Polîtîkaya Nepenîtiyê", terms: "Mercên Bikaranînê", kvkk: "Agahdariya KVKK", lang: "Ziman" },
  legal: { privacy: "Polîtîkaya Nepenîtiyê", terms: "Mercên Bikaranînê", kvkk: "Nivîsa Agahdariya KVKK", updated: "Dawî hat nûkirin", back: "Rûpela sereke" },
};

const DICT: Record<Lang, Dict> = { tr, en, ku };

export function getDict(lang?: string): Dict {
  return DICT[(lang as Lang) in DICT ? (lang as Lang) : "tr"];
}

export function normalizeLang(lang?: string): Lang {
  return lang === "en" ? "en" : lang === "ku" ? "ku" : "tr";
}

// Yazı yönü — mevcut dillerin hepsi soldan sağa. (RTL eklenirse buraya.)
export const LANG_DIR: Record<Lang, "ltr" | "rtl"> = { tr: "ltr", en: "ltr", ku: "ltr" };

// ——— Uygulama-içi sözlük (navigasyon + ayarlar chrome'u) ———
// Uygulama ekranları kademeli olarak buraya taşınır. Şimdilik en görünür
// chrome (alt/yan navigasyon + Ayarlar) tüm dillerde çalışır.
export type AppDict = {
  nav: {
    kesfet: string; moments: string; reels: string; oyun: string;
    mesajlar: string; etkinlikler: string; profil: string; premium: string; cuzdan: string;
  };
  settings: {
    title: string;
    groupNotif: string; groupNotifPrefs: string; groupAppearance: string; groupPrivacy: string;
    groupSecurity: string; groupLang: string; groupPremium: string; groupAccount: string;
    theme: string; themeDesc: string; appLang: string;
    privacyPolicy: string; security: string; blocked: string;
    premiumMembership: string; analytics: string; visitors: string; feedback: string; deleteAccount: string;
  };
  kesfet: {
    title: string; giftStore: string; gameRoom: string; filter: string;
    chipTumu: string; chipYakin: string; chipOnline: string; chipYeni: string; chipPopuler: string;
    emptyTitle: string; emptyFiltered: string; emptyDefault: string;
    resetFilter: string; enrichProfile: string; refresh: string;
    nearArea: string; farArea: string;
    newMember: string; featured: string; online: string; photoReveal: string; nearby: string; match: string;
    interests: string; voiceIntro: string; zodiacSuffix: string; musicLabel: string;
    superUsedFree: string; superFailed: string;
    ariaRewind: string; ariaPass: string; ariaLike: string; ariaSuper: string;
    interesting: string; inCommon: string;
    matchEyebrow: string; matchedWith: string; matchDesc: string; startChat: string; keepDiscovering: string; someone: string;
  };
  daily: {
    title: string; answered: string; answer: string; placeholder: string;
    send: string; todayEarn: string;
    streak3: string; streak7: string; next3: string; next7: string; keepStreak: string;
    streakLabel: string; bonusEarned: string;
  };
  filters: {
    title: string; close: string; priorityDistance: string; allTurkey: string; priorityHint: string;
    age: string; verifiedOnly: string; sort: string;
    sortSmart: string; sortNear: string; sortActive: string; sortNew: string; sortUyum: string;
    city: string; allCities: string; myCity: string; selectCity: string; searchCity: string; apply: string;
  };
  cuzdan: {
    back: string; eyebrow: string; title: string; rate: string;
    balanceLabel: string; balanceHint: string;
    tabJeton: string; tabDavet: string; tabGecmis: string;
    withdraw: string; withdrawDesc: string;
    spendTitle: string; spendDesc: string;
    boostTitle: string; boostDesc: string; dayTitle: string; dayDesc: string; weekTitle: string; weekDesc: string; bestValue: string;
    buyTitle: string; buyDesc: string; popular: string; buy: string; paymentNote: string;
    historyTitle: string; historyDesc: string; noHistory: string; noHistoryDesc: string; movement: string;
    paid: string; canceled: string; buyClosed: string; buyFailed: string; loaded: string; connError: string;
    activated: string; insufficient: string; opFailed: string;
  };
  davet: {
    title: string; reward: string; preparing: string; copyAria: string;
    share: string; leaderboard: string; shareText: string;
  };
  premium: {
    eyebrow: string; title: string; jetonChip: string;
    club: string; memberLabel: string; memberFallback: string;
    active: string; ends: string; upsell: string; standart: string;
    tokenBridgeTitle: string; tokenBridgeDesc: string;
    packagesTitle: string; packagesDesc: string;
    plusSub: string; platinumSub: string; legendSub: string;
    planActive: string; processing: string; subscribe: string; notAvailable: string; subscribeMobile: string;
    compareTitle: string; compareDesc: string; featureCol: string;
    restore: string; restored: string; nothingRestore: string; manageNote: string;
    purchaseReceived: string; purchaseCanceled: string; purchaseFailed: string;
    featPlus: { title: string; desc: string }[];
    featPlatinum: { title: string; desc: string }[];
    featLegend: { title: string; desc: string }[];
    compareRows: string[];
  };
  common: { back: string };
};

const appTr: AppDict = {
  nav: {
    kesfet: "Keşfet", moments: "Moments", reels: "Reels", oyun: "Oyun Salonu",
    mesajlar: "Mesajlar", etkinlikler: "Etkinlikler", profil: "Profil", premium: "Premium", cuzdan: "Cüzdan",
  },
  settings: {
    title: "Ayarlar",
    groupNotif: "Bildirimler & Sesler", groupNotifPrefs: "Bildirim tercihleri", groupAppearance: "Görünüm",
    groupPrivacy: "Gizlilik", groupSecurity: "Güvenlik", groupLang: "Dil & Çeviri",
    groupPremium: "Premium", groupAccount: "Hesap",
    theme: "Tema", themeDesc: "Premium görünüm tercihlerin", appLang: "Uygulama dili",
    privacyPolicy: "Gizlilik Politikası", security: "Güvenlik & Topluluk", blocked: "Engellenenler",
    premiumMembership: "Premium üyelik", analytics: "Analiz (Premium+)", visitors: "Profil ziyaretçileri",
    feedback: "Öneri / Geri bildirim", deleteAccount: "Hesabı sil",
  },
  kesfet: {
    title: "Keşfet", giftStore: "Hediye Mağazası", gameRoom: "Oyun Salonu", filter: "Filtre",
    chipTumu: "Tümü", chipYakin: "Yakınında", chipOnline: "Online", chipYeni: "Yeni", chipPopuler: "Popüler",
    emptyTitle: "Şimdilik bu kadar",
    emptyFiltered: "Şehir, yaş veya doğrulama filtreni gevşet — mesafe artık kimseyi gizlemiyor, sadece sıralıyor.",
    emptyDefault: "Yeni profiller geldikçe burada görünecek. Profilini zenginleştir, daha çok kişiye öneril.",
    resetFilter: "Filtreyi sıfırla", enrichProfile: "Profilini zenginleştir", refresh: "Yenile",
    nearArea: "Öncelikli alan", farArea: "Daha uzaktakiler",
    newMember: "Yeni üye", featured: "Öne çıkan", online: "Online",
    photoReveal: "Fotoğraf sohbet ilerledikçe netleşir", nearby: "yakınında", match: "uyum",
    interests: "İlgi alanları", voiceIntro: "Sesli tanıtım", zodiacSuffix: " burcu", musicLabel: "Müzik",
    superUsedFree: "Bugünkü ücretsiz süper beğenini kullandın. Bir tane daha için 30 jeton gerekli.",
    superFailed: "Süper beğeni gönderilemedi, tekrar dene.",
    ariaRewind: "Geri al", ariaPass: "Geç", ariaLike: "Beğen", ariaSuper: "Süper beğen",
    interesting: "İlginç geldi", inCommon: "Ortak yönler",
    matchEyebrow: "Yeni Ahenk", matchedWith: "{name} ile eşleştiniz",
    matchDesc: "Karşılıklı ilgi var. İlk mesajı sen at — sohbet ettikçe fotoğraf netleşir.",
    startChat: "Sohbete başla", keepDiscovering: "Keşfetmeye devam", someone: "Biri",
  },
  daily: {
    title: "Günün Sorusu", answered: "Yanıtlandı", answer: "Yanıtla", placeholder: "Yanıtın…",
    send: "Gönder · +{n} jeton", todayEarn: "Bugün yanıtla, +{n} jeton kazan",
    streak3: "Süper — 3 günlük seri! Yarın da gel.", streak7: "7 günlük seri tamam — efsane!",
    next3: "Yarın 3. gün: +50 jeton bonus", next7: "Yarın 7. gün: +150 jeton bonus",
    keepStreak: "Serini koru, yarın tekrar 20 jeton",
    streakLabel: "Gün serin", bonusEarned: "+{n} seri bonusu kazandın!",
  },
  filters: {
    title: "Filtreler", close: "Kapat", priorityDistance: "Öncelik mesafesi", allTurkey: "Türkiye geneli",
    priorityHint: "Bu mesafeye kadar olanlara öncelik verilir. Üstündekiler gizlenmez — listenin sonunda, yakından uzağa sıralı görünür.",
    age: "Yaş", verifiedOnly: "Yalnız doğrulanmış profiller", sort: "Sıralama",
    sortSmart: "Akıllı", sortNear: "En yakın", sortActive: "En aktif", sortNew: "En yeni", sortUyum: "En uyumlu",
    city: "Şehir", allCities: "Tüm Türkiye", myCity: "Şehrim", selectCity: "Şehir seç", searchCity: "Şehir ara…", apply: "Uygula",
  },
  cuzdan: {
    back: "Geri", eyebrow: "Ahenk cüzdan", title: "Cüzdan & Jeton", rate: "1 jeton = ₺0,10",
    balanceLabel: "Jeton bakiyen", balanceHint: "Jetonu Boost, Premium gün/hafta açmak veya nakde çevirmek için kullan.",
    tabJeton: "Jetonlar", tabDavet: "Davet", tabGecmis: "Geçmiş",
    withdraw: "Para çek", withdrawDesc: "Kazandığın jetonu nakde çevir",
    spendTitle: "Jetonla aç", spendDesc: "Görünürlüğünü ve deneyimini yükselt",
    boostTitle: "Profil Boost", boostDesc: "24 saat keşfette en üstte",
    dayTitle: "1 Gün Premium", dayDesc: "Tüm Premium ayrıcalıkları",
    weekTitle: "1 Hafta Premium", weekDesc: "7 gün — en iyi değer", bestValue: "En iyi değer",
    buyTitle: "Jeton satın al", buyDesc: "Avantajlı paketlerle bakiyeni güçlendir", popular: "Popüler", buy: "Satın al",
    paymentNote: "Ödeme sağlayıcı bağlanınca jeton satın alma açılır. Bağlanana kadar canlıda kapalıdır. Jetonu her zaman görev ve davetle kazanabilirsin.",
    historyTitle: "Jeton geçmişi", historyDesc: "Son bakiye hareketlerin", noHistory: "Henüz hareket yok", noHistoryDesc: "Görevleri tamamla, jeton kazan.", movement: "Hareket",
    paid: "Ödeme alındı! Jetonların birazdan yüklenecek.", canceled: "Ödeme iptal edildi.",
    buyClosed: "Jeton satın alma şu an kapalı — yakında. Jetonu görev ve davetle kazanabilirsin.",
    buyFailed: "Satın alma başarısız, tekrar dene.", loaded: "+{n} jeton yüklendi!", connError: "Bağlantı hatası.",
    activated: "{title} aktifleştirildi!", insufficient: "Yetersiz bakiye — {n} jeton gerekli. Görev yap veya jeton al.", opFailed: "İşlem başarısız, tekrar dene.",
  },
  davet: {
    title: "Arkadaşını davet et",
    reward: "Davet eden {a}, davetle gelen {b} jeton kazanır.",
    preparing: "Davet kodun hazırlanıyor…", copyAria: "Davet linkini kopyala",
    share: "Paylaş", leaderboard: "Liderlikte gör",
    shareText: "Karakter önce, yüz sonra. Ahenk'e davetlisin — kayıt olunca 25 jeton hediye:",
  },
  premium: {
    eyebrow: "Ahenk üyelik", title: "Premium", jetonChip: "Jeton",
    club: "Sessiz Lüks Kulübü", memberLabel: "Üye", memberFallback: "Ahenk Üyesi",
    active: "Aktif", ends: "bitiş",
    upsell: "Statünü yükselt. Daha görünür, daha ayrıcalıklı ve daha sakin bir Ahenk deneyimi.", standart: "Standart",
    tokenBridgeTitle: "Jetonla hemen Premium aç", tokenBridgeDesc: "Görev yap, jeton kazan; 1 gün / 1 hafta Premium ya da Boost aç.",
    packagesTitle: "Üyelik paketleri", packagesDesc: "Ahenk içindeki görünürlüğünü ve deneyimini yükselt",
    plusSub: "Temel ayrıcalıklar ve görünürlük", platinumSub: "Daha güçlü keşif ve yüksek kalite", legendSub: "Ahenk’in en özel kulüp deneyimi",
    planActive: "Bu plan aktif", processing: "İşleniyor…", subscribe: "Abone ol", notAvailable: "Şu an uygun değil", subscribeMobile: "Mobil uygulamadan abone ol",
    compareTitle: "Planları karşılaştır", compareDesc: "Her plan bir öncekinin tüm ayrıcalıklarını kapsar.", featureCol: "Özellik",
    restore: "Satın almaları geri yükle", restored: "Satın almalar geri yüklendi.", nothingRestore: "Geri yüklenecek satın alma bulunamadı.",
    manageNote: "Abonelikler güvenli şekilde App Store / Google Play üzerinden yönetilir. Web tarafında jetonla günlük veya haftalık Premium açabilirsin.",
    purchaseReceived: "Satın alma alındı. Aboneliğin birkaç saniye içinde aktifleşecek.", purchaseCanceled: "Satın alma iptal edildi.", purchaseFailed: "Satın alma başarısız, tekrar dene.",
    featPlus: [
      { title: "Kimler ziyaret etti", desc: "Profiline bakan herkesi gör" },
      { title: "Sınırsız keşif", desc: "Günlük limit olmadan keşfet" },
      { title: "Gelişmiş filtreler", desc: "İlgi, burç, yaşam tarzına göre" },
      { title: "Profil öne çıkarma", desc: "Daha çok kişi seni görsün" },
      { title: "Gizli mod", desc: "Sadece beğendiklerin seni görsün" },
    ],
    featPlatinum: [
      { title: "AI profil danışmanı", desc: "Profilini sürekli güçlendiren öneriler" },
      { title: "AI sohbet önerileri", desc: "Akışı bozmadan ne yazacağını öner" },
      { title: "Profil analizi", desc: "Görüntülenme ve dönüşüm istatistiklerin" },
      { title: "Gelişmiş görünürlük", desc: "Keşfet ve Moments akışında öne çık" },
      { title: "Moment performansı", desc: "Momentlerini kim gördü, nasıl performans verdi" },
      { title: "Öncelikli destek", desc: "Sorularına önce yanıt" },
    ],
    featLegend: [
      { title: "Black Diamond profil", desc: "Siyah elmas kart + LEGEND rozeti" },
      { title: "En üst görünürlük", desc: "Keşfet ve akışta en önde" },
      { title: "1080p + VIP arama", desc: "Öncelikli bağlantı kalitesi" },
      { title: "Özel sohbet teması", desc: "Animasyonlu isim etiketi + VIP balon" },
      { title: "Tüm Premium Plus ayrıcalıkları", desc: "ve fazlası" },
    ],
    compareRows: [
      "Sınırsız keşif", "Kimler ziyaret etti", "Gelişmiş filtreler", "Profil öne çıkarma", "Gizli mod",
      "Profil temaları", "Sesli görüşme", "Görüntülü görüşme (HD)", "1080p + VIP arama", "Öncelikli görünürlük",
      "Black Diamond profil + LEGEND",
    ],
  },
  common: { back: "Geri" },
};

const appEn: AppDict = {
  nav: {
    kesfet: "Discover", moments: "Moments", reels: "Reels", oyun: "Game Room",
    mesajlar: "Messages", etkinlikler: "Events", profil: "Profile", premium: "Premium", cuzdan: "Wallet",
  },
  settings: {
    title: "Settings",
    groupNotif: "Notifications & Sounds", groupNotifPrefs: "Notification preferences", groupAppearance: "Appearance",
    groupPrivacy: "Privacy", groupSecurity: "Security", groupLang: "Language & Translation",
    groupPremium: "Premium", groupAccount: "Account",
    theme: "Theme", themeDesc: "Your premium appearance preferences", appLang: "App language",
    privacyPolicy: "Privacy Policy", security: "Safety & Community", blocked: "Blocked users",
    premiumMembership: "Premium membership", analytics: "Analytics (Premium+)", visitors: "Profile visitors",
    feedback: "Suggestion / Feedback", deleteAccount: "Delete account",
  },
  kesfet: {
    title: "Discover", giftStore: "Gift Store", gameRoom: "Game Room", filter: "Filter",
    chipTumu: "All", chipYakin: "Nearby", chipOnline: "Online", chipYeni: "New", chipPopuler: "Popular",
    emptyTitle: "That's all for now",
    emptyFiltered: "Loosen your city, age or verification filter — distance no longer hides anyone, it only sorts.",
    emptyDefault: "New profiles will show up here. Enrich your profile to be suggested to more people.",
    resetFilter: "Reset filter", enrichProfile: "Enrich your profile", refresh: "Refresh",
    nearArea: "Priority area", farArea: "Farther away",
    newMember: "New member", featured: "Featured", online: "Online",
    photoReveal: "Photo clears as the conversation deepens", nearby: "nearby", match: "match",
    interests: "Interests", voiceIntro: "Voice intro", zodiacSuffix: "", musicLabel: "Music",
    superUsedFree: "You've used today's free super like. One more costs 30 tokens.",
    superFailed: "Super like couldn't be sent, try again.",
    ariaRewind: "Rewind", ariaPass: "Pass", ariaLike: "Like", ariaSuper: "Super like",
    interesting: "Interesting", inCommon: "In common",
    matchEyebrow: "New Ahenk", matchedWith: "You matched with {name}",
    matchDesc: "The interest is mutual. Send the first message — photos clear as you chat.",
    startChat: "Start chatting", keepDiscovering: "Keep discovering", someone: "Someone",
  },
  daily: {
    title: "Question of the day", answered: "Answered", answer: "Answer", placeholder: "Your answer…",
    send: "Send · +{n} tokens", todayEarn: "Answer today, earn +{n} tokens",
    streak3: "Nice — a 3-day streak! Come back tomorrow.", streak7: "7-day streak complete — legendary!",
    next3: "Tomorrow is day 3: +50 token bonus", next7: "Tomorrow is day 7: +150 token bonus",
    keepStreak: "Keep your streak, 20 tokens again tomorrow",
    streakLabel: "Your streak", bonusEarned: "+{n} streak bonus earned!",
  },
  filters: {
    title: "Filters", close: "Close", priorityDistance: "Priority distance", allTurkey: "All of Türkiye",
    priorityHint: "People within this distance get priority. Those beyond aren't hidden — they appear at the end, sorted nearest to farthest.",
    age: "Age", verifiedOnly: "Verified profiles only", sort: "Sort",
    sortSmart: "Smart", sortNear: "Nearest", sortActive: "Most active", sortNew: "Newest", sortUyum: "Best match",
    city: "City", allCities: "All Türkiye", myCity: "My city", selectCity: "Select city", searchCity: "Search city…", apply: "Apply",
  },
  cuzdan: {
    back: "Back", eyebrow: "Ahenk wallet", title: "Wallet & Tokens", rate: "1 token = ₺0.10",
    balanceLabel: "Your token balance", balanceHint: "Use tokens for Boost, Premium day/week, or cash out.",
    tabJeton: "Tokens", tabDavet: "Invite", tabGecmis: "History",
    withdraw: "Cash out", withdrawDesc: "Turn earned tokens into cash",
    spendTitle: "Unlock with tokens", spendDesc: "Boost your visibility and experience",
    boostTitle: "Profile Boost", boostDesc: "Top of Discover for 24 hours",
    dayTitle: "1 Day Premium", dayDesc: "All Premium perks",
    weekTitle: "1 Week Premium", weekDesc: "7 days — best value", bestValue: "Best value",
    buyTitle: "Buy tokens", buyDesc: "Top up your balance with great-value packs", popular: "Popular", buy: "Buy",
    paymentNote: "Token purchase opens once a payment provider is connected. Until then it's off in production. You can always earn tokens through quests and invites.",
    historyTitle: "Token history", historyDesc: "Your recent balance activity", noHistory: "No activity yet", noHistoryDesc: "Complete quests, earn tokens.", movement: "Activity",
    paid: "Payment received! Your tokens will load shortly.", canceled: "Payment canceled.",
    buyClosed: "Token purchase is currently off — soon. You can earn tokens via quests and invites.",
    buyFailed: "Purchase failed, try again.", loaded: "+{n} tokens loaded!", connError: "Connection error.",
    activated: "{title} activated!", insufficient: "Insufficient balance — {n} tokens needed. Do a quest or buy tokens.", opFailed: "Operation failed, try again.",
  },
  davet: {
    title: "Invite a friend",
    reward: "The inviter earns {a}, the invited friend gets {b} tokens.",
    preparing: "Your invite code is being prepared…", copyAria: "Copy invite link",
    share: "Share", leaderboard: "See on leaderboard",
    shareText: "Character first, face later. You're invited to Ahenk — get 25 tokens when you sign up:",
  },
  premium: {
    eyebrow: "Ahenk membership", title: "Premium", jetonChip: "Tokens",
    club: "Quiet Luxury Club", memberLabel: "Member", memberFallback: "Ahenk Member",
    active: "Active", ends: "ends",
    upsell: "Level up your status. A more visible, more privileged and calmer Ahenk experience.", standart: "Standard",
    tokenBridgeTitle: "Unlock Premium now with tokens", tokenBridgeDesc: "Do quests, earn tokens; unlock 1 day / 1 week Premium or Boost.",
    packagesTitle: "Membership packages", packagesDesc: "Boost your visibility and experience within Ahenk",
    plusSub: "Core perks and visibility", platinumSub: "Stronger discovery and higher quality", legendSub: "Ahenk's most exclusive club experience",
    planActive: "This plan is active", processing: "Processing…", subscribe: "Subscribe", notAvailable: "Not available right now", subscribeMobile: "Subscribe from the mobile app",
    compareTitle: "Compare plans", compareDesc: "Each plan includes all perks of the one before it.", featureCol: "Feature",
    restore: "Restore purchases", restored: "Purchases restored.", nothingRestore: "No purchases found to restore.",
    manageNote: "Subscriptions are managed securely via the App Store / Google Play. On the web you can unlock daily or weekly Premium with tokens.",
    purchaseReceived: "Purchase received. Your subscription will activate in a few seconds.", purchaseCanceled: "Purchase canceled.", purchaseFailed: "Purchase failed, try again.",
    featPlus: [
      { title: "Who visited", desc: "See everyone who viewed your profile" },
      { title: "Unlimited discovery", desc: "Explore with no daily limit" },
      { title: "Advanced filters", desc: "By interest, zodiac, lifestyle" },
      { title: "Profile boost", desc: "Let more people see you" },
      { title: "Incognito mode", desc: "Only people you like see you" },
    ],
    featPlatinum: [
      { title: "AI profile advisor", desc: "Tips that keep strengthening your profile" },
      { title: "AI chat suggestions", desc: "What to write without breaking the flow" },
      { title: "Profile analytics", desc: "Your views and conversion stats" },
      { title: "Enhanced visibility", desc: "Stand out in Discover and Moments" },
      { title: "Moment performance", desc: "Who saw your moments and how they performed" },
      { title: "Priority support", desc: "Your questions answered first" },
    ],
    featLegend: [
      { title: "Black Diamond profile", desc: "Black diamond card + LEGEND badge" },
      { title: "Top visibility", desc: "First in Discover and the feed" },
      { title: "1080p + VIP calls", desc: "Priority connection quality" },
      { title: "Exclusive chat theme", desc: "Animated name tag + VIP bubble" },
      { title: "All Premium Plus perks", desc: "and more" },
    ],
    compareRows: [
      "Unlimited discovery", "Who visited", "Advanced filters", "Profile boost", "Incognito mode",
      "Profile themes", "Voice calls", "Video calls (HD)", "1080p + VIP calls", "Priority visibility",
      "Black Diamond profile + LEGEND",
    ],
  },
  common: { back: "Back" },
};

const appKu: AppDict = {
  nav: {
    kesfet: "Keşf", moments: "Moments", reels: "Reels", oyun: "Salona Lîstikê",
    mesajlar: "Peyam", etkinlikler: "Çalakî", profil: "Profîl", premium: "Premium", cuzdan: "Berîk",
  },
  settings: {
    title: "Mîheng",
    groupNotif: "Agahdarî & Deng", groupNotifPrefs: "Bijarteyên agahdariyê", groupAppearance: "Xuyang",
    groupPrivacy: "Nepenîtî", groupSecurity: "Ewlehî", groupLang: "Ziman & Wergerandin",
    groupPremium: "Premium", groupAccount: "Hesab",
    theme: "Tema", themeDesc: "Bijarteyên xuyanga premium", appLang: "Zimanê sepanê",
    privacyPolicy: "Polîtîkaya Nepenîtiyê", security: "Ewlehî & Civat", blocked: "Astengkirî",
    premiumMembership: "Endametiya Premium", analytics: "Analîz (Premium+)", visitors: "Serdana profîlê",
    feedback: "Pêşniyar / Bersiv", deleteAccount: "Hesabê jê bibe",
  },
  kesfet: {
    title: "Keşf", giftStore: "Dikana Diyariyan", gameRoom: "Salona Lîstikê", filter: "Parzûn",
    chipTumu: "Hemû", chipYakin: "Nêzîk", chipOnline: "Online", chipYeni: "Nû", chipPopuler: "Populer",
    emptyTitle: "Ji bo niha ev e",
    emptyFiltered: "Parzûna bajar, temen an pejirandinê sist bike — dûrahî êdî kesî venaşêre, tenê rêz dike.",
    emptyDefault: "Gava profîlên nû werin li vir xuya dibin. Profîla xwe dewlemend bike, ji bo bêtir kesan were pêşniyarkirin.",
    resetFilter: "Parzûnê paqij bike", enrichProfile: "Profîla xwe dewlemend bike", refresh: "Nû bike",
    nearArea: "Qada pêşîn", farArea: "Yên dûrtir",
    newMember: "Endamê nû", featured: "Berbiçav", online: "Online",
    photoReveal: "Wêne gava axaftin kûr dibe zelal dibe", nearby: "nêzîk", match: "lihev",
    interests: "Berjewendî", voiceIntro: "Danasîna dengî", zodiacSuffix: "", musicLabel: "Muzîk",
    superUsedFree: "Te superbeğeniya îro ya belaş bi kar anî. Ji bo yekê din 30 jeton hewce ne.",
    superFailed: "Superbeğenî nehat şandin, dîsa biceribîne.",
    ariaRewind: "Vegere", ariaPass: "Derbas", ariaLike: "Eciband", ariaSuper: "Super eciband",
    interesting: "Balkêş", inCommon: "Hevpar",
    matchEyebrow: "Ahengê nû", matchedWith: "Tu bi {name} re li hev hatî",
    matchDesc: "Berjewendî hevdu ye. Peyama yekem tu bişîne — gava tu diaxivî wêne zelal dibin.",
    startChat: "Dest bi axaftinê bike", keepDiscovering: "Berdewam keşf bike", someone: "Kesek",
  },
  daily: {
    title: "Pirsa rojê", answered: "Hat bersivandin", answer: "Bersivê bide", placeholder: "Bersiva te…",
    send: "Bişîne · +{n} jeton", todayEarn: "Îro bersivê bide, +{n} jeton bistîne",
    streak3: "Süper — rêzeke 3 rojan! Sibê jî were.", streak7: "Rêzeke 7 rojan temam — efsane!",
    next3: "Sibê roja 3.: +50 jeton bonus", next7: "Sibê roja 7.: +150 jeton bonus",
    keepStreak: "Rêza xwe biparêze, sibê dîsa 20 jeton",
    streakLabel: "Rêza te", bonusEarned: "+{n} bonusa rêzê qezenc kir!",
  },
  filters: {
    title: "Parzûn", close: "Bigire", priorityDistance: "Dûrahiya pêşîn", allTurkey: "Li tevahiya Tirkiyeyê",
    priorityHint: "Yên di vê dûrahiyê de pêşîn têne dayîn. Yên jê wêdetir venaşêrin — li dawiya lîsteyê, ji nêzîk ber bi dûr ve rêzkirî xuya dibin.",
    age: "Temen", verifiedOnly: "Tenê profîlên pejirandî", sort: "Rêzkirin",
    sortSmart: "Aqilmend", sortNear: "Herî nêzîk", sortActive: "Herî çalak", sortNew: "Herî nû", sortUyum: "Herî lihev",
    city: "Bajar", allCities: "Tevahiya Tirkiyeyê", myCity: "Bajarê min", selectCity: "Bajar hilbijêre", searchCity: "Li bajar bigere…", apply: "Bicîh bîne",
  },
  cuzdan: {
    back: "Vegere", eyebrow: "Berîka Ahenk", title: "Berîk & Jeton", rate: "1 jeton = ₺0,10",
    balanceLabel: "Bakiya jetonê te", balanceHint: "Jetonan ji bo Boost, Premium roj/hefte an veguhastina pere bi kar bîne.",
    tabJeton: "Jeton", tabDavet: "Vexwendin", tabGecmis: "Dîrok",
    withdraw: "Pere bikişîne", withdrawDesc: "Jetonên qezenckirî bike pere",
    spendTitle: "Bi jetonan veke", spendDesc: "Xuyabûn û ezmûna xwe bilind bike",
    boostTitle: "Boosta Profîlê", boostDesc: "24 saetan li serê Keşfê",
    dayTitle: "1 Roj Premium", dayDesc: "Hemû îmtiyazên Premium",
    weekTitle: "1 Hefte Premium", weekDesc: "7 roj — nirxa herî baş", bestValue: "Nirxa herî baş",
    buyTitle: "Jeton bikire", buyDesc: "Bi pakêtên biavantaj bakiya xwe xurt bike", popular: "Populer", buy: "Bikire",
    paymentNote: "Gava dahênerê pereyan ve girêdayî be jeton-kirîn vedibe. Heta hingê di hilberînê de girtî ye. Tu her dem dikarî bi peywir û vexwendinê jeton qezenc bikî.",
    historyTitle: "Dîroka jetonê", historyDesc: "Tevgerên dawî yên bakiyê", noHistory: "Hîna tevger tune", noHistoryDesc: "Peywiran temam bike, jeton qezenc bike.", movement: "Tevger",
    paid: "Pere hat girtin! Jetonên te di demeke kurt de werin barkirin.", canceled: "Pere hat betalkirin.",
    buyClosed: "Jeton-kirîn niha girtî ye — di nêzîk de. Tu dikarî bi peywir û vexwendinê jeton qezenc bikî.",
    buyFailed: "Kirîn bi ser neket, dîsa biceribîne.", loaded: "+{n} jeton hat barkirin!", connError: "Çewtiya girêdanê.",
    activated: "{title} hat çalakkirin!", insufficient: "Bakiya nebes — {n} jeton hewce ne. Peywirekê bike an jeton bikire.", opFailed: "Kar bi ser neket, dîsa biceribîne.",
  },
  davet: {
    title: "Hevalê xwe vexwîne",
    reward: "Vexwender {a}, hevalê bi vexwendinê tê {b} jeton qezenc dike.",
    preparing: "Koda vexwendina te tê amadekirin…", copyAria: "Lînka vexwendinê kopî bike",
    share: "Parve bike", leaderboard: "Li serketinê bibîne",
    shareText: "Pêşî karakter, paşê rû. Tu li Ahengê hatî vexwendin — gava tomar bibî 25 jeton diyarî:",
  },
  premium: {
    eyebrow: "Endametiya Ahenk", title: "Premium", jetonChip: "Jeton",
    club: "Klûba Luksa Bêdeng", memberLabel: "Endam", memberFallback: "Endamê Ahengê",
    active: "Çalak", ends: "diqede",
    upsell: "Statûya xwe bilind bike. Ezmûneke Ahengê ya bêtir xuya, bêtir bi îmtiyaz û aramtir.", standart: "Standard",
    tokenBridgeTitle: "Bi jetonan niha Premium veke", tokenBridgeDesc: "Peywiran bike, jeton qezenc bike; 1 roj / 1 hefte Premium an Boost veke.",
    packagesTitle: "Pakêtên endametiyê", packagesDesc: "Xuyabûn û ezmûna xwe ya di Ahengê de bilind bike",
    plusSub: "Îmtiyaz û xuyabûna bingehîn", platinumSub: "Keşfa xurttir û kalîteya bilind", legendSub: "Ezmûna klûba herî taybet a Ahengê",
    planActive: "Ev plan çalak e", processing: "Tê hilanîn…", subscribe: "Abone bibe", notAvailable: "Niha ne berdest e", subscribeMobile: "Ji sepana mobîl abone bibe",
    compareTitle: "Planan bidin ber hev", compareDesc: "Her plan hemû îmtiyazên ya berî xwe digire nav xwe.", featureCol: "Taybetmendî",
    restore: "Kirînan vegerîne", restored: "Kirîn hatin vegerandin.", nothingRestore: "Tu kirîn ji bo vegerandinê nehat dîtin.",
    manageNote: "Abonetî bi ewlehî bi rêya App Store / Google Play têne birêvebirin. Li ser webê tu dikarî bi jetonan Premium-a rojane an heftane vekî.",
    purchaseReceived: "Kirîn hat girtin. Abonetiya te di çend saniyeyan de çalak dibe.", purchaseCanceled: "Kirîn hat betalkirin.", purchaseFailed: "Kirîn bi ser neket, dîsa biceribîne.",
    featPlus: [
      { title: "Kê serdan kir", desc: "Her kesê li profîla te nêrî bibîne" },
      { title: "Keşfa bêsînor", desc: "Bê sînorê rojane keşf bike" },
      { title: "Parzûnên pêşketî", desc: "Li gorî berjewendî, burc, awayê jiyanê" },
      { title: "Pêşxistina profîlê", desc: "Bila bêtir kes te bibînin" },
      { title: "Moda veşartî", desc: "Tenê yên tu eciband te bibînin" },
    ],
    featPlatinum: [
      { title: "Şêwirmendê profîlê yê AI", desc: "Pêşniyarên ku profîla te xurt dikin" },
      { title: "Pêşniyarên axaftinê yên AI", desc: "Çi binivîsî bêyî ku herikîn xera bibe" },
      { title: "Analîza profîlê", desc: "Statîstîkên dîtin û veguherînê" },
      { title: "Xuyabûna pêşketî", desc: "Li Keşf û Moments derkeve pêş" },
      { title: "Performansa Momentê", desc: "Kê momentên te dîtin û çawa performans dan" },
      { title: "Piştgiriya pêşîn", desc: "Pêşî bersiva pirsên te" },
    ],
    featLegend: [
      { title: "Profîla Black Diamond", desc: "Karta elmasê reş + nîşana LEGEND" },
      { title: "Xuyabûna herî jor", desc: "Li Keşf û herikînê pêşî" },
      { title: "1080p + bangên VIP", desc: "Kalîteya girêdana pêşîn" },
      { title: "Temaya axaftinê ya taybet", desc: "Etîketa navê anîmasyon + balona VIP" },
      { title: "Hemû îmtiyazên Premium Plus", desc: "û bêtir" },
    ],
    compareRows: [
      "Keşfa bêsînor", "Kê serdan kir", "Parzûnên pêşketî", "Pêşxistina profîlê", "Moda veşartî",
      "Temayên profîlê", "Bangên dengî", "Bangên vîdyo (HD)", "1080p + bangên VIP", "Xuyabûna pêşîn",
      "Profîla Black Diamond + LEGEND",
    ],
  },
  common: { back: "Vegere" },
};

const APP_DICT: Record<Lang, AppDict> = { tr: appTr, en: appEn, ku: appKu };

export function getAppDict(lang?: string): AppDict {
  return APP_DICT[normalizeLang(lang)];
}
