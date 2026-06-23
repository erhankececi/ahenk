import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui";
import { XCircle } from "lucide-react";

export default function PaymentCancel() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <Link href="/" className="mb-8"><Logo size={26} /></Link>
      <div className="glass-card w-full max-w-sm rounded-2xl p-8 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger/12 text-danger"><XCircle size={32} /></span>
        <h1 className="mt-4 text-xl font-bold">Ödeme Tamamlanmadı</h1>
        <p className="mt-2 text-sm text-muted">İşlem iptal edildi veya tamamlanamadı. Tekrar deneyebilirsin.</p>
        <div className="mt-6 space-y-2">
          <Button href="/cuzdan" size="lg" className="w-full">Tekrar Dene</Button>
          <Button href="/ogrenci" variant="glass" size="lg" className="w-full">Panele Dön</Button>
        </div>
      </div>
    </div>
  );
}
