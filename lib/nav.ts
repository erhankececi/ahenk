import { Home, Video, Camera, Users, Crown, MessageSquare, Wallet, Plus, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon; center?: boolean };

export const STUDENT_NAV: NavItem[] = [
  { href: "/ogrenci", label: "Ana Sayfa", icon: Home },
  { href: "/odalar", label: "Odalar", icon: Video },
  { href: "/soru-sor", label: "Soru Sor", icon: Camera, center: true },
  { href: "/ogretmenler", label: "Öğretmenler", icon: Users },
  { href: "/premium", label: "Premium", icon: Crown },
];

export const TEACHER_NAV: NavItem[] = [
  { href: "/ogretmen", label: "Ana Panel", icon: Home },
  { href: "/odalarim", label: "Odalarım", icon: Video },
  { href: "/odalarim", label: "Oda Aç", icon: Plus, center: true },
  { href: "/gelen-sorular", label: "Sorular", icon: MessageSquare },
  { href: "/kazanc", label: "Kazanç", icon: Wallet },
];
