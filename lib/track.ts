// Granüler event gönderici (client). Ateşle-unut; hata yutulur.
export function trackEvent(event: string, metadata?: Record<string, string | number>) {
  try {
    fetch("/api/events/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, metadata }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}
