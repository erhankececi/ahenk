// Ahenk 101 — ana giriş/lobi ekranı.
// app/(app)/ route group içinde: header + SideNav + BottomNav mevcut Ahenk sayfası
// gibi görünür. Gerçek backend/game server yok; kartlar /oyun/101/masalar'a yönlendirir.

import { Zap, Mic, Users, Crown, MapPin } from "lucide-react";
import OkeyHero from "@/components/game101/OkeyHero";
import OkeyModeCard from "@/components/game101/OkeyModeCard";
import OkeySafetyNote from "@/components/game101/OkeySafetyNote";

const MODES = [
  {
    icon: Zap,
    title: "Hızlı Masa",
    description: "Bekleme yok, hemen otur, hemen oyna.",
    href: "/oyun/101/masalar?tip=hizli",
  },
  {
    icon: Mic,
    title: "Sesli Masa",
    description: "Mikrofonu aç, masadakilerle sohbet ederek oyna.",
    href: "/oyun/101/masalar?tip=sesli",
    badge: "Sesli",
  },
  {
    icon: Users,
    title: "Arkadaş Masası",
    description: "Tanıdıklarınla veya yeni tanışacağın kişilerle rahat bir masa.",
    href: "/oyun/101/masalar?tip=arkadas",
  },
  {
    icon: Crown,
    title: "Premium Masa",
    description: "Seçkin oyuncular, daha zarif bir salon deneyimi.",
    href: "/oyun/101/masalar?tip=premium",
    badge: "Premium",
  },
  {
    icon: MapPin,
    title: "Şehrimden Oyuncular",
    description: "Bulunduğun şehirdeki oyuncularla aynı masaya otur.",
    href: "/oyun/101/masalar?tip=sehrimden",
  },
] as const;

export default function Okey101LobiPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-6 sm:px-6 sm:pt-8">
      <OkeyHero />

      <div className="flex flex-col gap-3">
        {MODES.map((mode) => (
          <OkeyModeCard
            key={mode.title}
            icon={mode.icon}
            title={mode.title}
            description={mode.description}
            href={mode.href}
            badge={"badge" in mode ? mode.badge : undefined}
          />
        ))}
      </div>

      <OkeySafetyNote />
    </div>
  );
}
