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
  common: { back: "Vegere" },
};

const APP_DICT: Record<Lang, AppDict> = { tr: appTr, en: appEn, ku: appKu };

export function getAppDict(lang?: string): AppDict {
  return APP_DICT[normalizeLang(lang)];
}
