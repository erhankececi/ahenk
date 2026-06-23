// Ahenk Live — MVP mock verisi (ileride Supabase ile değiştirilecek)

export const EXAMS = ["TYT", "AYT", "LGS", "KPSS", "Diğer"] as const;

export const SUBJECTS = [
  "Matematik", "Fizik", "Kimya", "Biyoloji", "Türkçe", "Edebiyat", "Tarih", "Coğrafya", "Geometri", "İngilizce",
];

export const STATS = [
  { value: "1M+", label: "Aktif Öğrenci" },
  { value: "10K+", label: "Uzman Öğretmen" },
  { value: "50M+", label: "Çözülen Soru" },
];

export type Room = {
  id: string;
  name: string;
  tag: string;
  teacher: string;
  teacherTitle: string;
  status: "canli" | "yakinda";
  participants: number;
  cost: number; // 0 = ücretsiz
};

export const ROOMS: Room[] = [
  { id: "tyt-mat", name: "TYT Matematik Soru Çözüm", tag: "TYT", teacher: "Ahmet Yılmaz", teacherTitle: "Uzman Eğitmen", status: "canli", participants: 150, cost: 0 },
  { id: "paragraf", name: "Paragraf Net Artırma Odası", tag: "TYT · AYT", teacher: "Zeynep Kaya", teacherTitle: "Edebiyat", status: "canli", participants: 80, cost: 50 },
  { id: "ayt-mat", name: "AYT Matematik Kampı", tag: "AYT", teacher: "Prof. Dr. Ali Vefa", teacherTitle: "İleri Matematik", status: "yakinda", participants: 200, cost: 0 },
  { id: "lgs-mat", name: "LGS Matematik Etüt Odası", tag: "LGS", teacher: "Elif Şahin", teacherTitle: "Genel Rehberlik", status: "canli", participants: 45, cost: 20 },
  { id: "deneme", name: "Deneme Analiz Odası", tag: "Genel", teacher: "Mert Demir", teacherTitle: "Sınav Koçu", status: "canli", participants: 64, cost: 0 },
  { id: "motivasyon", name: "Sınav Motivasyon Odası", tag: "Genel", teacher: "Ayşe Çelik", teacherTitle: "Rehber Öğretmen", status: "yakinda", participants: 120, cost: 0 },
];

export type Teacher = {
  id: string;
  name: string;
  branch: string;
  desc: string;
  rating: number;
  answered: number;
  avgTime: string;
  status: "canli" | "musait";
  kind: "ogretmen" | "koc";
  successRate?: number;
};

export const TEACHERS: Teacher[] = [
  { id: "elif", name: "Dr. Elif Yılmaz", branch: "AYT Matematik", desc: "AYT Kalkülüs ve Geometri uzmanı. AYT için hızlı problem çözüm tekniklerinde uzman.", rating: 4.9, answered: 1240, avgTime: "< 2 dk", status: "canli", kind: "ogretmen" },
  { id: "ahmet", name: "Ahmet Kaya", branch: "TYT Fizik", desc: "Karmaşık fizik kavramlarını kolayca anlaşılır hale getirir. Temel kavramlara hâkim.", rating: 4.8, answered: 850, avgTime: "5 dk", status: "musait", kind: "ogretmen" },
  { id: "zeynep", name: "Zeynep Demir", branch: "Sınav Koçu", desc: "YKS sınav stratejisi, çalışma programı ve psikolojik rehberlik.", rating: 5.0, answered: 0, avgTime: "—", status: "musait", kind: "koc", successRate: 94 },
  { id: "merve", name: "Merve Aydın", branch: "TYT Türkçe", desc: "Paragraf ve dil bilgisinde net artıran sade anlatım.", rating: 4.7, answered: 620, avgTime: "3 dk", status: "musait", kind: "ogretmen" },
];

export type Question = {
  id: string;
  subject: string;
  title: string;
  desc: string;
  priority: boolean;
  time: string;
};

export const INCOMING_QUESTIONS: Question[] = [
  { id: "q1", subject: "İleri Matematik", title: "Kısmi İntegral", desc: "Pratik testindeki 4. sorunun adımlarını zorlanıyorum, çözer misiniz?", priority: true, time: "2 dk önce" },
  { id: "q2", subject: "Fizik", title: "Kinematik", desc: "Dünü canlı anlattığınız eğik atış konusunu tekrar edebilir misiniz?", priority: false, time: "12 dk önce" },
  { id: "q3", subject: "Geometri", title: "Çember", desc: "Teğet uzunluğu sorusunda takıldım.", priority: false, time: "28 dk önce" },
];

export const RECENT_ANSWERS = [
  { id: "a1", subject: "Matematik", teacher: "Dr. Elif Yılmaz", time: "1 saat önce", status: "Cevaplandı" },
  { id: "a2", subject: "Fizik", teacher: "Ahmet Kaya", time: "Dün", status: "Cevaplandı" },
];

export const REVIEWS = [
  { id: "r1", text: "Dr. Arslan karmaşık konuları çok net açıklıyor. Adapte AYT matematik dersleri harika.", author: "Sarah J.", rating: 4.9 },
  { id: "r2", text: "Fizik problemlerinde çok pratik ve yardımcı. Canlı odada gerçek zamanlı çözüm.", author: "Ali R.", rating: 5.0 },
];

export const FAQS = [
  { q: "Ahenk Live ücretli mi?", a: "Temel canlı odalara katılım ücretsizdir. Birebir soru çözümü ve bazı premium içerikler için jeton veya öğrenci premium üyeliği kullanılabilir." },
  { q: "Soru çözümleri ne kadar sürede gelir?", a: "Normal cevaplar genelde birkaç saat içinde, öncelikli cevaplar ise 5 dakika içinde uzman öğretmenlerden gelir." },
  { q: "Öğretmen olarak nasıl gelir elde ederim?", a: "Canlı oda açarak, soru çözerek ve birebir görüşme yaparak gelir elde edebilirsin. Başvurunu yap, onaylandıktan sonra yayına başla." },
  { q: "Hangi sınavlar destekleniyor?", a: "TYT, AYT, LGS ve KPSS başta olmak üzere tüm sınav türleri için canlı etüt ve soru çözüm odaları mevcut." },
];

export type Role = "ogrenci" | "ogretmen" | "koc" | "admin";

export const ROLE_LABEL: Record<Role, string> = {
  ogrenci: "Öğrenci",
  ogretmen: "Öğretmen",
  koc: "Koç",
  admin: "Admin",
};
