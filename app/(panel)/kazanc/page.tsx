import { redirect } from "next/navigation";

// Kazanç artık gerçek jeton bakiyesi üzerinden /cuzdan'da gösteriliyor.
export default function Earnings() {
  redirect("/cuzdan");
}
