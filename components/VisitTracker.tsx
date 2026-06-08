"use client";

import { useEffect } from "react";

// Site girişini oturum başına 1 kez kaydeder (anonim dahil). Sessiz, fire-and-forget.
export default function VisitTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("ahenk_visit")) return;
      sessionStorage.setItem("ahenk_visit", "1");
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({ path: location.pathname, ref: document.referrer || "" }),
      }).catch(() => {});
    } catch {}
  }, []);
  return null;
}
