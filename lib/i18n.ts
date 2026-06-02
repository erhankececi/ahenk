// Hafif i18n — herkese açık (pazarlama) site + dil seçici. TR/EN ile başlar,
// yapı yeni dil eklemeye uygun. Uygulama-içi ekranlar kademeli taşınabilir.
export type Lang = "tr" | "en";

export const LANGS: { code: Lang; label: string; native: string }[] = [
  { code: "tr", label: "Türkçe", native: "Türkçe" },
  { code: "en", label: "İngilizce", native: "English" },
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

const DICT: Record<Lang, Dict> = { tr, en };

export function getDict(lang?: string): Dict {
  return DICT[(lang as Lang) in DICT ? (lang as Lang) : "tr"];
}

export function normalizeLang(lang?: string): Lang {
  return lang === "en" ? "en" : "tr";
}
