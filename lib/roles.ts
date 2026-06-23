export type AppRole = "student" | "teacher" | "coach" | "admin";

// DB rolü -> dashboard yolu
export const ROLE_HOME: Record<string, string> = {
  student: "/ogrenci",
  teacher: "/ogretmen",
  coach: "/koc",
  admin: "/admin",
};

// Onboarding UI rol kodu -> DB rolü
export const UI_TO_DB: Record<string, AppRole> = {
  ogrenci: "student",
  ogretmen: "teacher",
  koc: "coach",
};

// DB rolü -> (panel) layout localStorage değeri
export const DB_TO_UI: Record<string, "ogrenci" | "ogretmen" | "koc"> = {
  student: "ogrenci",
  teacher: "ogretmen",
  coach: "koc",
};

// Supabase auth hata mesajlarını kullanıcı dostu Türkçe'ye çevir
export function authMessage(msg?: string): string {
  const m = (msg || "").toLowerCase();
  if (m.includes("already registered") || m.includes("already exists")) return "Bu e-posta zaten kayıtlı. Giriş yapmayı dene.";
  if (m.includes("password should be at least")) return "Şifre en az 6 karakter olmalı.";
  if (m.includes("invalid login credentials")) return "E-posta veya şifre hatalı.";
  if (m.includes("email not confirmed")) return "E-postanı henüz doğrulamadın. Gelen kutunu kontrol et.";
  if (m.includes("unable to validate email") || m.includes("invalid email")) return "Geçerli bir e-posta adresi gir.";
  if (m.includes("rate limit") || m.includes("too many")) return "Çok fazla deneme. Biraz sonra tekrar dene.";
  return "Bir hata oluştu, lütfen tekrar dene.";
}
