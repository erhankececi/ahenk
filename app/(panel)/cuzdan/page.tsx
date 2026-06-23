import { Placeholder } from "@/components/Placeholder";
import { Coins, Receipt } from "lucide-react";

export default function Wallet() {
  return (
    <Placeholder
      title="Cüzdan"
      desc="Jeton bakiyeni yönet, paket satın al ve geçmişini gör."
      cards={[
        { icon: Coins, label: "Jeton Bakiyen", value: "1.250" },
        { icon: Receipt, label: "Bu Ay Harcanan", value: "320" },
      ]}
      note="Jeton paketleri ve güvenli ödeme bir sonraki sürümde aktifleşecek."
    />
  );
}
