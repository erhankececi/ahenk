import { createAdminClient } from "@/lib/supabase/server";

export type PushPayload = { title: string; body: string; url?: string; tag?: string };

/**
 * Bir kullanıcının tüm WEB push aboneliklerine bildirim gönderir. YALNIZ sunucu.
 * VAPID anahtarları yoksa veya `web-push` paketi kurulu değilse SESSİZCE no-op
 * (uygulama akışını bloklamaz). Kurulum: `npm i web-push` + VAPID env'leri.
 * Native (FCM/APNs) gönderimi ayrı bir entegrasyon gerektirir (bkz. ENVIRONMENT.md).
 */
export async function sendPush(userId: string, payload: PushPayload): Promise<void> {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return;

  let webpush: any;
  try {
    // @ts-ignore — web-push opsiyonel bağımlılık (production'da: npm i web-push)
    webpush = (await import(/* webpackIgnore: true */ "web-push")).default;
  } catch {
    return; // paket kurulu değil
  }

  try {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:destek@ahenk.app", pub, priv);
  } catch {
    return;
  }

  const admin = createAdminClient();
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId)
    .eq("platform", "web");
  if (!subs?.length) return;

  const body = JSON.stringify(payload);
  await Promise.all(
    subs.map(async (s: any) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body
        );
      } catch (e: any) {
        // Süresi dolmuş/iptal abonelik → temizle.
        if (e?.statusCode === 404 || e?.statusCode === 410) {
          await admin.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
        }
      }
    })
  );
}
