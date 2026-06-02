import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default function Askida() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-error/10">
        <ShieldAlert size={28} className="text-error" />
      </div>
      <h1 className="text-2xl font-bold">Hesabın askıya alındı</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Topluluk kurallarının ihlali nedeniyle hesabın erişime kapatıldı. Bir hata olduğunu
        düşünüyorsan bizimle iletişime geç.
      </p>
      <Link
        href="/login"
        className="mt-6 rounded-full border border-border px-6 py-3 text-sm font-medium transition hover:border-brand"
      >
        Giriş ekranına dön
      </Link>
    </div>
  );
}
