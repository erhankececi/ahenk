"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell } from "lucide-react";
import { useLang } from "@/components/LangProvider";

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export default function PushOptIn({ compact = false }: { compact?: boolean }) {
  const { t } = useLang();
  const tp = t.settings.push;
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

  const desc =
    state === "denied"
      ? tp.denied
      : state === "busy"
        ? tp.busy
        : tp.desc;

  if (compact) {
    return (
      <button
        onClick={etkinlestir}
        disabled={state === "busy" || state === "denied"}
        className="mt-3 flex w-full items-center gap-2.5 rounded-xl border border-accent/30 bg-accent/[0.08] px-3 py-2.5 text-left transition hover:border-accent/50 disabled:opacity-60"
      >
        <Bell size={15} className="shrink-0 text-accent" />
        <span className="min-w-0 flex-1 text-xs leading-4 text-text/85">
          {state === "denied" ? desc : tp.compact}
        </span>
        <span className="shrink-0 rounded-lg border border-accent/35 bg-accent/12 px-2 py-1 text-[11px] font-semibold text-accent">
          {state === "busy" ? "…" : tp.on}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={etkinlestir}
      disabled={state === "busy" || state === "denied"}
      className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-accent/30 bg-accent/[0.07] p-3.5 text-left transition hover:border-accent/50 disabled:opacity-60"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10">
        <Bell size={18} className="text-accent" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-text">{tp.title}</p>
        <p className="text-xs leading-4 text-muted">{desc}</p>
      </div>
    </button>
  );
}
