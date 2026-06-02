"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell } from "lucide-react";

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export default function PushOptIn() {
  const supabase = createClient();
  const [state, setState] = useState<"idle" | "off" | "granted" | "denied" | "busy">("off");

  useEffect(() => {
    if (
      !VAPID ||
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      typeof Notification === "undefined"
    ) {
      setState("off");
      return;
    }
    if (Notification.permission === "granted") setState("granted");
    else if (Notification.permission === "denied") setState("denied");
    else setState("idle");
  }, []);

  async function etkinlestir() {
    if (!VAPID) return;
    setState("busy");
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState("denied");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID),
      });
      const j: any = sub.toJSON();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("push_subscriptions").upsert(
          {
            user_id: user.id,
            endpoint: j.endpoint,
            p256dh: j.keys?.p256dh,
            auth: j.keys?.auth,
            platform: "web",
          },
          { onConflict: "endpoint" }
        );
      }
      setState("granted");
    } catch {
      setState("idle");
    }
  }

  // Anahtar yoksa / desteklenmiyorsa / zaten açıksa gösterme.
  if (state === "off" || state === "granted") return null;

  return (
    <button
      onClick={etkinlestir}
      disabled={state === "busy" || state === "denied"}
      className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-brand/30 bg-brand/5 p-3.5 text-left transition hover:border-brand/50 disabled:opacity-60"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/15">
        <Bell size={18} className="text-brand" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Bildirimleri aç</p>
        <p className="text-xs text-muted">
          {state === "denied"
            ? "Tarayıcı izni kapalı — site ayarlarından açabilirsin."
            : state === "busy"
              ? "Ayarlanıyor…"
              : "Yeni beğeni ve eşleşmeleri kaçırma."}
        </p>
      </div>
    </button>
  );
}
