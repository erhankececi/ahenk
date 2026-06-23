import { Placeholder } from "@/components/Placeholder";
import { TrendingUp, Wallet } from "lucide-react";

export default function Earnings() {
  return (
    <Placeholder
      title="Kazanç"
      desc="Gelirini takip et ve ödeme talebi oluştur."
      cards={[
        { icon: Wallet, label: "Bu Ay", value: "₺4.250" },
        { icon: TrendingUp, label: "Toplam", value: "₺38.900" },
      ]}
      note="Ödeme ve para çekme altyapısı bir sonraki sürümde aktifleşecek."
    />
  );
}
