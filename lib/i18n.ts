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
  mesajlar: {
    title: string; likesTitle: string; likesPremium: string; likesFree: string;
    noChats: string; noChatsDesc: string; goDiscover: string;
    voiceMsg: string; photo: string; someone: string; firstMessage: string;
    options: string; undo: string; undoTitle: string;
    archive: string; moveHidden: string; deleteForMe: string; deleteForMeDesc: string;
    pinAsk: string; pinSet: string; wrongPin: string; pinRule: string;
    tabActive: string; tabArchive: string; tabHidden: string;
    emptyActive: string; emptyArchive: string; emptyHidden: string;
    hiddenLocked: string; unlock: string;
  };
  chat: {
    bondSpecial: string; bondStrong: string; bondHarmonious: string; bondWarming: string; bondNew: string;
    callSoon: string; videoConfirm: string; insufficientCall: string; callFailed: string;
    metMarked: string; metAck: string; msgTooFast: string; onlyPhoto: string; photoMax: string;
    uploadFailed: string; sendSlow: string; giftFailed: string; sendFailed: string; voiceFailed: string; voiceSlow: string; micError: string;
    typing: string; online: string; photoOpen: string; clarity: string; metBadge: string;
    backToMatches: string; profilePhoto: string;
    voiceCall: string; callLocked: string; callSoonTitle: string;
    videoCall: string; videoCallFree: string; videoCallPaid: string;
    suggestMeet: string; sendGift: string; callHistory: string; metConfirmed: string; metFaceToFace: string;
    chemMatch: string; youSent: string; giftWord: string; photoAlt: string;
    translatedTo: string; showTranslation: string; showOriginal: string; translating: string; translate: string;
    hideText: string; toText: string; read: string; icebreakers: string;
    meetPlanned: string; meetWaiting: string; meetSuggested: string; accept: string; reject: string;
    meetTitle: string; meetDesc: string; uploadingPhoto: string;
    sendTrOn: string; sendTrOff: string;
    recording: string; cancel: string; send: string; sendVoiceAria: string;
    recordVoice: string; sendPhoto: string; emojiGif: string; messagePlaceholder: string; messageAria: string;
    noCallHistory: string; missed: string; declined: string; cancelled: string;
    outgoing: string; incoming: string; videoType: string; voiceType: string; callWord: string;
  };
  safety: {
    reasons: string[]; somethingWrong: string; reportReceived: string;
    report: string; block: string; blockTitle: string; blockDesc: string;
    cancel: string; blocking: string; reportReason: string; detailPlaceholder: string; sending: string;
  };
  onboarding: {
    headerTitle: string; stepCounter: string; steps: string[];
    namePlaceholder: string; nameError: string; birthdate: string; tooYoung: string; ageYears: string;
    gender: string; gFemale: string; gMale: string; gOther: string; lookingFor: string;
    city: string; profession: string; bio: string;
    interests: string; languages: string; zodiac: string; lifestyleTitle: string;
    goal: string; kids: string; smoking: string; drinking: string; pets: string; exercise: string;
    aiTitle: string; photoNote: string; back: string; next: string; saving: string; complete: string; prevStep: string;
    goalOpts: Record<string, string>; kidsOpts: Record<string, string>; smokingOpts: Record<string, string>;
    drinkingOpts: Record<string, string>; petsOpts: Record<string, string>; exerciseOpts: Record<string, string>;
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
  mesajlar: {
    title: "Mesajlar", likesTitle: "Seni beğenenler",
    likesPremium: "{n} kişi seninle tanışmak istiyor", likesFree: "{n} kişi seni beğendi — kim olduklarını gör",
    noChats: "Henüz sohbet yok",
    noChatsDesc: "Keşfet'ten ahengini bulan biriyle karşılıklı ilgi kur — ilk sohbetin burada açılır.",
    goDiscover: "Keşfet'e git", voiceMsg: "Sesli mesaj", photo: "Fotoğraf", someone: "Biri",
    firstMessage: "Eşleştiniz — ilk mesajı sen at!", options: "Seçenekler", undo: "Geri al", undoTitle: "Aktif sohbetlere geri al",
    archive: "Arşivle", moveHidden: "Gizli klasöre taşı", deleteForMe: "Benim için sil",
    deleteForMeDesc: "Mesajlar silinmez — tekrar yazışınca geri gelir",
    pinAsk: "Gizli klasör PIN'i:", pinSet: "Gizli klasör için 4 haneli PIN belirle:", wrongPin: "Yanlış PIN.", pinRule: "PIN 4-8 haneli rakam olmalı.",
    tabActive: "Aktif", tabArchive: "Arşiv", tabHidden: "Gizli",
    emptyActive: "Henüz aktif sohbetin yok.", emptyArchive: "Arşivde sohbet yok.", emptyHidden: "Gizli klasör boş.",
    hiddenLocked: "Gizli klasör PIN ile korunuyor.", unlock: "Kilidi aç",
  },
  chat: {
    bondSpecial: "Özel Bağ", bondStrong: "Güçlü Bağ", bondHarmonious: "Uyumlu", bondWarming: "Isınıyor", bondNew: "Yeni Tanışıyor",
    callSoon: "Arama biraz sohbet edince açılır 🔓",
    videoConfirm: "Görüntülü görüşme 50 jeton (kimya %100 olunca ücretsiz). Devam edilsin mi?",
    insufficientCall: "Yetersiz jeton — 50 jeton gerekli (Cüzdandan al).", callFailed: "Görüşme başlatılamadı.",
    metMarked: "Görüşüldü olarak işaretlendi ✓", metAck: "Onayın alındı — karşı taraf da onaylayınca rozet açılır.",
    msgTooFast: "Mesaj gönderilemedi — çok hızlı olabilirsin, biraz bekle.", onlyPhoto: "Yalnız fotoğraf gönderebilirsin.",
    photoMax: "Fotoğraf 8MB'den küçük olmalı.", uploadFailed: "Yükleme başarısız, tekrar dene.",
    sendSlow: "Gönderilemedi — biraz yavaşla ve tekrar dene.", giftFailed: "Hediye gönderilemedi, tekrar dene.",
    sendFailed: "Gönderilemedi, tekrar dene.", voiceFailed: "Ses gönderilemedi, tekrar dene.",
    voiceSlow: "Ses gönderilemedi — biraz yavaşla ve tekrar dene.", micError: "Mikrofona erişilemedi. Tarayıcı iznini kontrol et.",
    typing: "yazıyor…", online: "Çevrimiçi", photoOpen: "Fotoğraf açık", clarity: "Netlik %{n} — yazdıkça açılır", metBadge: "Görüşüldü ✓",
    backToMatches: "Eşleşmelere dön", profilePhoto: "Profil fotoğrafı",
    voiceCall: "Sesli ara", callLocked: "Arama kilitli", callSoonTitle: "Biraz sohbet edince açılır",
    videoCall: "Görüntülü ara", videoCallFree: "Görüntülü ara (ücretsiz)", videoCallPaid: "Görüntülü ara (50 jeton · %100 kimyada ücretsiz)",
    suggestMeet: "Buluşma öner", sendGift: "Hediye gönder", callHistory: "Arama geçmişi", metConfirmed: "Görüşmeyi onayladın ✓", metFaceToFace: "Yüz yüze görüştük",
    chemMatch: "%{n} uyum", youSent: "Gönderdin", giftWord: "Hediye", photoAlt: "Fotoğraf",
    translatedTo: "{lang} diline çevrildi", showTranslation: "Çeviriyi göster", showOriginal: "Orijinali göster", translating: "Çevriliyor…", translate: "Çevir",
    hideText: "Yazıyı gizle", toText: "Yazıya dök", read: "okundu", icebreakers: "✨ Buz kırıcı sorular",
    meetPlanned: "Buluşma planlandı:", meetWaiting: "{label} önerin yanıt bekliyor…", meetSuggested: "{label} buluşması önerildi", accept: "Kabul", reject: "Reddet",
    meetTitle: "Buluşma öner", meetDesc: "Gerçek hayatta tanışmak için bir öneri gönder.", uploadingPhoto: "Fotoğraf yükleniyor…",
    sendTrOn: "Mesajların {lang} diline çevriliyor", sendTrOff: "Gönderirken {lang} diline çevir",
    recording: "Kaydediliyor…", cancel: "İptal", send: "Gönder", sendVoiceAria: "Sesli mesajı gönder",
    recordVoice: "Sesli mesaj kaydet", sendPhoto: "Fotoğraf gönder", emojiGif: "Emoji ve GIF", messagePlaceholder: "Bir mesaj yaz…", messageAria: "Mesaj",
    noCallHistory: "Henüz arama yok.", missed: "Cevapsız", declined: "Reddedildi", cancelled: "İptal",
    outgoing: "Giden", incoming: "Gelen", videoType: "görüntülü", voiceType: "sesli", callWord: "arama",
  },
  safety: {
    reasons: ["Uygunsuz içerik veya fotoğraf", "Taciz, hakaret veya zorbalık", "Sahte profil / dolandırıcılık", "Spam veya reklam", "Reşit değil görünüyor", "Diğer"],
    somethingWrong: "Bir şeyler ters gitti, tekrar dene.", reportReceived: "Bildirimin alındı. Ekibimiz en kısa sürede inceleyecek.",
    report: "Şikayet et", block: "Engelle", blockTitle: "Engellensin mi?",
    blockDesc: "Bu kişi seni göremeyecek, sana yazamayacak ve arayamayacak. Varsa eşleşmeniz kaldırılır.",
    cancel: "Vazgeç", blocking: "Engelleniyor…", reportReason: "Şikayet nedeni", detailPlaceholder: "Detay ekle (isteğe bağlı)", sending: "Gönderiliyor…",
  },
  onboarding: {
    headerTitle: "Profilini oluştur", stepCounter: "Adım {n} / {t}",
    steps: ["Sen kimsin?", "Nerede, ne yaparsın?", "İlgi & yaşam tarzı", "Fotoğraflar"],
    namePlaceholder: "Ad Soyad", nameError: "Ad ve soyadını yaz (örn. Ahmet Yılmaz).",
    birthdate: "Doğum tarihin", tooYoung: "Ahenk yalnızca 18 yaş ve üzeri içindir.", ageYears: "{n} yaşındasın",
    gender: "Cinsiyetin", gFemale: "Kadın", gMale: "Erkek", gOther: "Diğer", lookingFor: "Kiminle tanışmak istersin?",
    city: "Şehir", profession: "Mesleğin", bio: "Hakkımda — seni anlatan birkaç cümle",
    interests: "İlgi alanların", languages: "Konuştuğun diller", zodiac: "Burç (isteğe bağlı)",
    lifestyleTitle: "Karakter & yaşam tarzı — uyum eşleşmesi için",
    goal: "Ne arıyorsun?", kids: "Çocuk", smoking: "Sigara", drinking: "Alkol", pets: "Evcil hayvan", exercise: "Spor / tempo",
    aiTitle: "AI profil önerileri",
    photoNote: "En fazla 6 fotoğraf. Merak etme — fotoğrafların karşı tarafta önce bulanık görünür, sohbet ilerledikçe netleşir.",
    back: "Geri", next: "Devam", saving: "Kaydediliyor...", complete: "Profili tamamla", prevStep: "Önceki adım",
    goalOpts: { ciddi: "Ciddi ilişki", evlilik: "Evlilik", arkadaslik: "Arkadaşlık", belirsiz: "Henüz bilmiyorum" },
    kidsOpts: { istiyorum: "İstiyorum", istemiyorum: "İstemiyorum", belki: "Belki", var: "Çocuğum var" },
    smokingOpts: { hayir: "Hayır", sosyal: "Sosyal", evet: "Evet" },
    drinkingOpts: { hayir: "Hayır", sosyal: "Sosyal", evet: "Evet" },
    petsOpts: { yok: "Yok", kedi: "Kedi", kopek: "Köpek", seviyorum: "Seviyorum" },
    exerciseOpts: { sik: "Sık sık", bazen: "Bazen", nadiren: "Nadiren" },
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
  mesajlar: {
    title: "Messages", likesTitle: "People who like you",
    likesPremium: "{n} people want to meet you", likesFree: "{n} people liked you — see who they are",
    noChats: "No chats yet",
    noChatsDesc: "Build mutual interest with someone who matches your vibe in Discover — your first chat opens here.",
    goDiscover: "Go to Discover", voiceMsg: "Voice message", photo: "Photo", someone: "Someone",
    firstMessage: "It's a match — send the first message!", options: "Options", undo: "Undo", undoTitle: "Move back to active chats",
    archive: "Archive", moveHidden: "Move to hidden folder", deleteForMe: "Delete for me",
    deleteForMeDesc: "Messages aren't deleted — they return if you chat again",
    pinAsk: "Hidden folder PIN:", pinSet: "Set a 4-digit PIN for the hidden folder:", wrongPin: "Wrong PIN.", pinRule: "PIN must be 4-8 digits.",
    tabActive: "Active", tabArchive: "Archive", tabHidden: "Hidden",
    emptyActive: "You have no active chats yet.", emptyArchive: "No chats in archive.", emptyHidden: "Hidden folder is empty.",
    hiddenLocked: "Hidden folder is PIN-protected.", unlock: "Unlock",
  },
  chat: {
    bondSpecial: "Special Bond", bondStrong: "Strong Bond", bondHarmonious: "In Harmony", bondWarming: "Warming Up", bondNew: "Just Met",
    callSoon: "Calls unlock after you chat a bit 🔓",
    videoConfirm: "Video call costs 50 tokens (free at 100% chemistry). Continue?",
    insufficientCall: "Insufficient tokens — 50 needed (get them in Wallet).", callFailed: "Couldn't start the call.",
    metMarked: "Marked as met ✓", metAck: "Your confirmation is in — the badge unlocks when the other side confirms too.",
    msgTooFast: "Message not sent — you may be too fast, wait a moment.", onlyPhoto: "You can only send photos.",
    photoMax: "Photo must be under 8MB.", uploadFailed: "Upload failed, try again.",
    sendSlow: "Couldn't send — slow down and try again.", giftFailed: "Gift couldn't be sent, try again.",
    sendFailed: "Couldn't send, try again.", voiceFailed: "Voice couldn't be sent, try again.",
    voiceSlow: "Voice couldn't be sent — slow down and try again.", micError: "Couldn't access the mic. Check your browser permission.",
    typing: "typing…", online: "Online", photoOpen: "Photo unlocked", clarity: "Clarity {n}% — opens as you chat", metBadge: "Met ✓",
    backToMatches: "Back to matches", profilePhoto: "Profile photo",
    voiceCall: "Voice call", callLocked: "Call locked", callSoonTitle: "Unlocks after you chat a bit",
    videoCall: "Video call", videoCallFree: "Video call (free)", videoCallPaid: "Video call (50 tokens · free at 100% chemistry)",
    suggestMeet: "Suggest a meetup", sendGift: "Send a gift", callHistory: "Call history", metConfirmed: "You confirmed the meeting ✓", metFaceToFace: "We met in person",
    chemMatch: "{n}% match", youSent: "You sent", giftWord: "Gift", photoAlt: "Photo",
    translatedTo: "translated to {lang}", showTranslation: "Show translation", showOriginal: "Show original", translating: "Translating…", translate: "Translate",
    hideText: "Hide text", toText: "Transcribe", read: "read", icebreakers: "✨ Icebreaker questions",
    meetPlanned: "Meetup planned:", meetWaiting: "Your {label} suggestion is awaiting a reply…", meetSuggested: "A {label} meetup was suggested", accept: "Accept", reject: "Decline",
    meetTitle: "Suggest a meetup", meetDesc: "Send a suggestion to meet in real life.", uploadingPhoto: "Uploading photo…",
    sendTrOn: "Your messages are translated to {lang}", sendTrOff: "Translate to {lang} when sending",
    recording: "Recording…", cancel: "Cancel", send: "Send", sendVoiceAria: "Send voice message",
    recordVoice: "Record a voice message", sendPhoto: "Send a photo", emojiGif: "Emoji and GIF", messagePlaceholder: "Write a message…", messageAria: "Message",
    noCallHistory: "No calls yet.", missed: "Missed", declined: "Declined", cancelled: "Canceled",
    outgoing: "Outgoing", incoming: "Incoming", videoType: "video", voiceType: "voice", callWord: "call",
  },
  safety: {
    reasons: ["Inappropriate content or photo", "Harassment, insults or bullying", "Fake profile / scam", "Spam or ads", "Appears underage", "Other"],
    somethingWrong: "Something went wrong, try again.", reportReceived: "Your report is in. Our team will review it shortly.",
    report: "Report", block: "Block", blockTitle: "Block this person?",
    blockDesc: "They won't be able to see you, message you or call you. Any match between you is removed.",
    cancel: "Cancel", blocking: "Blocking…", reportReason: "Report reason", detailPlaceholder: "Add details (optional)", sending: "Sending…",
  },
  onboarding: {
    headerTitle: "Build your profile", stepCounter: "Step {n} / {t}",
    steps: ["Who are you?", "Where, what do you do?", "Interests & lifestyle", "Photos"],
    namePlaceholder: "Full name", nameError: "Write your first and last name (e.g. John Smith).",
    birthdate: "Your birthdate", tooYoung: "Ahenk is for 18 and over only.", ageYears: "You're {n}",
    gender: "Your gender", gFemale: "Woman", gMale: "Man", gOther: "Other", lookingFor: "Who do you want to meet?",
    city: "City", profession: "Your profession", bio: "About me — a few lines that describe you",
    interests: "Your interests", languages: "Languages you speak", zodiac: "Zodiac (optional)",
    lifestyleTitle: "Character & lifestyle — for compatibility matching",
    goal: "What are you looking for?", kids: "Kids", smoking: "Smoking", drinking: "Drinking", pets: "Pets", exercise: "Exercise / pace",
    aiTitle: "AI profile tips",
    photoNote: "Up to 6 photos. Don't worry — your photos appear blurred to others at first and clear up as the conversation deepens.",
    back: "Back", next: "Continue", saving: "Saving...", complete: "Complete profile", prevStep: "Previous step",
    goalOpts: { ciddi: "Serious relationship", evlilik: "Marriage", arkadaslik: "Friendship", belirsiz: "Not sure yet" },
    kidsOpts: { istiyorum: "Want them", istemiyorum: "Don't want", belki: "Maybe", var: "I have kids" },
    smokingOpts: { hayir: "No", sosyal: "Socially", evet: "Yes" },
    drinkingOpts: { hayir: "No", sosyal: "Socially", evet: "Yes" },
    petsOpts: { yok: "None", kedi: "Cat", kopek: "Dog", seviyorum: "I love them" },
    exerciseOpts: { sik: "Often", bazen: "Sometimes", nadiren: "Rarely" },
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
  mesajlar: {
    title: "Peyam", likesTitle: "Yên ku ji te hez dikin",
    likesPremium: "{n} kes dixwazin bi te re nas bibin", likesFree: "{n} kesan ji te hez kir — bibîne ew kî ne",
    noChats: "Hîna axaftin tune",
    noChatsDesc: "Li Keşfê bi kesê ku li gorî te ye berjewendiyeke dualî ava bike — axaftina te ya yekem li vir vedibe.",
    goDiscover: "Here Keşfê", voiceMsg: "Peyama dengî", photo: "Wêne", someone: "Kesek",
    firstMessage: "We li hev hat — peyama yekem tu bişîne!", options: "Vebijark", undo: "Vegere", undoTitle: "Vegerîne axaftinên çalak",
    archive: "Arşîv bike", moveHidden: "Bibe peldanka veşartî", deleteForMe: "Ji bo min jê bibe",
    deleteForMeDesc: "Peyam nayên jêbirin — gava tu dîsa binivîsî vedigerin",
    pinAsk: "PIN-a peldanka veşartî:", pinSet: "Ji bo peldanka veşartî PIN-eke 4-reqemî diyar bike:", wrongPin: "PIN şaş e.", pinRule: "PIN divê 4-8 reqem be.",
    tabActive: "Çalak", tabArchive: "Arşîv", tabHidden: "Veşartî",
    emptyActive: "Hîna axaftina te ya çalak tune.", emptyArchive: "Di arşîvê de axaftin tune.", emptyHidden: "Peldanka veşartî vala ye.",
    hiddenLocked: "Peldanka veşartî bi PIN tê parastin.", unlock: "Kilît veke",
  },
  chat: {
    bondSpecial: "Girêdana Taybet", bondStrong: "Girêdana Xurt", bondHarmonious: "Lihevhatî", bondWarming: "Germ dibe", bondNew: "Nû Nas Dibin",
    callSoon: "Bang piştî hinekî axaftinê vedibe 🔓",
    videoConfirm: "Banga vîdyo 50 jeton (gava kîmya %100 be belaş). Bidome?",
    insufficientCall: "Jeton nebes — 50 jeton hewce ne (ji Berîkê bistîne).", callFailed: "Bang nehat destpêkirin.",
    metMarked: "Wek dîtin hat nîşankirin ✓", metAck: "Pejirandina te hat — gava aliyê din jî bipejirîne nîşan vedibe.",
    msgTooFast: "Peyam nehat şandin — dibe tu pir bilez bî, hinekî bisekine.", onlyPhoto: "Tu tenê dikarî wêne bişînî.",
    photoMax: "Wêne divê ji 8MB biçûktir be.", uploadFailed: "Barkirin bi ser neket, dîsa biceribîne.",
    sendSlow: "Nehat şandin — hêdî bibe û dîsa biceribîne.", giftFailed: "Diyarî nehat şandin, dîsa biceribîne.",
    sendFailed: "Nehat şandin, dîsa biceribîne.", voiceFailed: "Deng nehat şandin, dîsa biceribîne.",
    voiceSlow: "Deng nehat şandin — hêdî bibe û dîsa biceribîne.", micError: "Negihîşt mîkrofonê. Destûra geroka xwe kontrol bike.",
    typing: "dinivîse…", online: "Serhêl", photoOpen: "Wêne vekirî", clarity: "Zelalî %{n} — gava tu dinivîsî vedibe", metBadge: "Dîtin ✓",
    backToMatches: "Vegere lihevhatinan", profilePhoto: "Wêneyê profîlê",
    voiceCall: "Banga dengî", callLocked: "Bang girtî ye", callSoonTitle: "Piştî hinekî axaftinê vedibe",
    videoCall: "Banga vîdyo", videoCallFree: "Banga vîdyo (belaş)", videoCallPaid: "Banga vîdyo (50 jeton · li %100 kîmyayê belaş)",
    suggestMeet: "Hevdîtinê pêşniyar bike", sendGift: "Diyarî bişîne", callHistory: "Dîroka bangan", metConfirmed: "Te hevdîtin pejirand ✓", metFaceToFace: "Em rû bi rû hevdîtin",
    chemMatch: "%{n} lihev", youSent: "Te şand", giftWord: "Diyarî", photoAlt: "Wêne",
    translatedTo: "ji bo {lang} hat wergerandin", showTranslation: "Wergerê nîşan bide", showOriginal: "Orîjînalê nîşan bide", translating: "Tê wergerandin…", translate: "Wergerîne",
    hideText: "Nivîsê veşêre", toText: "Bike nivîs", read: "hat xwendin", icebreakers: "✨ Pirsên cemed-şikênê",
    meetPlanned: "Hevdîtin hat plankirin:", meetWaiting: "Pêşniyara te ya {label} li benda bersivê ye…", meetSuggested: "Hevdîtineke {label} hat pêşniyarkirin", accept: "Qebûl", reject: "Red bike",
    meetTitle: "Hevdîtinê pêşniyar bike", meetDesc: "Ji bo nasîna di jiyana rastîn de pêşniyarekê bişîne.", uploadingPhoto: "Wêne tê barkirin…",
    sendTrOn: "Peyamên te ji bo {lang} têne wergerandin", sendTrOff: "Gava tu dişînî ji bo {lang} wergerîne",
    recording: "Tê tomarkirin…", cancel: "Betal", send: "Bişîne", sendVoiceAria: "Peyama dengî bişîne",
    recordVoice: "Peyama dengî tomar bike", sendPhoto: "Wêne bişîne", emojiGif: "Emoji û GIF", messagePlaceholder: "Peyamekê binivîse…", messageAria: "Peyam",
    noCallHistory: "Hîna bang tune.", missed: "Bêbersiv", declined: "Red kirin", cancelled: "Betal",
    outgoing: "Derketî", incoming: "Hatî", videoType: "vîdyo", voiceType: "dengî", callWord: "bang",
  },
  safety: {
    reasons: ["Naveroka an wêneya neguncaw", "Tacîz, heqaret an zordarî", "Profîla sexte / dexesî", "Spam an reklam", "Wek bin temen xuya dike", "Yên din"],
    somethingWrong: "Tiştek çewt çû, dîsa biceribîne.", reportReceived: "Ragihandina te hat. Tîma me dê di demeke kurt de binirxîne.",
    report: "Gilî bike", block: "Asteng bike", blockTitle: "Were astengkirin?",
    blockDesc: "Ev kes nikare te bibîne, ji te re binivîse an bang li te bike. Eger hebe lihevhatina we tê rakirin.",
    cancel: "Dev jê berde", blocking: "Tê astengkirin…", reportReason: "Sedema gilî", detailPlaceholder: "Hûragahî zêde bike (bijarî)", sending: "Tê şandin…",
  },
  onboarding: {
    headerTitle: "Profîla xwe ava bike", stepCounter: "Gav {n} / {t}",
    steps: ["Tu kî yî?", "Li ku, çi dikî?", "Berjewendî & awayê jiyanê", "Wêne"],
    namePlaceholder: "Nav û paşnav", nameError: "Nav û paşnavê xwe binivîse (mînak: Ahmet Yılmaz).",
    birthdate: "Roja zayîna te", tooYoung: "Ahenk tenê ji bo 18 salî û jor e.", ageYears: "Tu {n} salî yî",
    gender: "Zayenda te", gFemale: "Jin", gMale: "Mêr", gOther: "Yên din", lookingFor: "Tu dixwazî bi kê re nas bibî?",
    city: "Bajar", profession: "Pîşeya te", bio: "Derbarê min — çend rêz ku te diyar dikin",
    interests: "Berjewendiyên te", languages: "Zimanên ku tu diaxivî", zodiac: "Burc (bijarî)",
    lifestyleTitle: "Karakter & awayê jiyanê — ji bo lihevhatinê",
    goal: "Tu li çi digerî?", kids: "Zarok", smoking: "Cixare", drinking: "Alkol", pets: "Heywanê malê", exercise: "Werziş / tempo",
    aiTitle: "Pêşniyarên profîlê yên AI",
    photoNote: "Herî zêde 6 wêne. Netirse — wêneyên te di destpêkê de li aliyê din tarî xuya dibin, gava axaftin kûr dibe zelal dibin.",
    back: "Vegere", next: "Berdewam", saving: "Tê tomarkirin...", complete: "Profîlê temam bike", prevStep: "Gava berê",
    goalOpts: { ciddi: "Têkiliya cidî", evlilik: "Zewac", arkadaslik: "Hevaltî", belirsiz: "Hîna nizanim" },
    kidsOpts: { istiyorum: "Dixwazim", istemiyorum: "Naxwazim", belki: "Belkî", var: "Zarokên min hene" },
    smokingOpts: { hayir: "Na", sosyal: "Civakî", evet: "Erê" },
    drinkingOpts: { hayir: "Na", sosyal: "Civakî", evet: "Erê" },
    petsOpts: { yok: "Tune", kedi: "Pisîk", kopek: "Kûçik", seviyorum: "Hez dikim" },
    exerciseOpts: { sik: "Pir caran", bazen: "Carinan", nadiren: "Kêm caran" },
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
