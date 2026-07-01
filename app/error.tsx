"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Production'da bir hata izleme servisine (Sentry vb.) gönderilebilir.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-error/10 text-3xl">
        ⚠️
      </div>
      <h1 className="text-xl font-bold">Bir şeyler ters gitti</h1>
      <p className="mt-2 max-w-xs text-sm text-muted">
        Beklenmeyen bir hata oluştu. Tekrar dene; sorun sürerse biraz sonra yeniden gel.
      </p>
      <button
        onClick={reset}
        className="brand-gradient mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
      >
        <RotateCw size={16} /> Tekrar dene
      </button>
    </div>
  );
}
