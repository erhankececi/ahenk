"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

export function BuyPackageButton({ packageId, featured }: { packageId: string; featured?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function buy() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/create-coin-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.checkoutUrl) {
        setError(data.error || "Ödeme başlatılamadı, tekrar dene.");
        setLoading(false);
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Bağlantı hatası, tekrar dene.");
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={buy} disabled={loading} size="sm" variant={featured ? "gold" : "primary"} className="w-full">
        {loading ? "Başlatılıyor…" : "Satın Al"}
      </Button>
      {error && <p className="mt-1.5 text-center text-xs text-danger">{error}</p>}
    </>
  );
}
