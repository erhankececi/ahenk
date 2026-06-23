import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui";
import { CheckCircle2 } from "lucide-react";

export default function PaymentSuccess() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <Link href="/" className="mb-8"><Logo size={26} /></Link>
      <div className="glass-card w-full max-w-sm rounded-2xl p-8 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/12 text-success"><CheckCircle2 size={32} /></span>
        <h1 className="mt-4 text-xl font-bold">Ödeme Başarılı</h1>
        <p className="mt-2 text-sm text-muted">Jetonların hesabına yüklendi. Hemen soru sormaya başlayabilirsin.</p>
        <div className="mt-6 space-y-2">
          <Button href="/soru-sor" size="lg" className="w-full">Soru Sor</Button>
          <Button href="/cuzdan" variant="glass" size="lg" className="w-full">Cüzdana Dön</Button>
        </div>
      </div>
    </div>
  );
}
