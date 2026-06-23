import { Placeholder } from "@/components/Placeholder";
import { Radio, Users } from "lucide-react";

export default function MyRooms() {
  return (
    <Placeholder
      title="Odalarım"
      desc="Canlı odalarını yönet ve yeni oturum aç."
      cards={[
        { icon: Radio, label: "Aktif Oda", value: "4 / 10" },
        { icon: Users, label: "Toplam Katılımcı", value: "338" },
      ]}
      note="Canlı yayın ve sesli oda altyapısı bir sonraki sürümde eklenecek."
    />
  );
}
