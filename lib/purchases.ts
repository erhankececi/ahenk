// RevenueCat (mağaza aboneliği) client servisi — YALNIZ native (Capacitor) bağlamda çalışır.
// Web'de no-op'tur: App Store / Google Play IAP kuralı gereği satın alma mağaza üzerinden olur.
// app_user_id = Supabase user.id (Purchases.logIn). Doğrulama + entitlement RevenueCat'te;
// kalıcı durum webhook -> apply_subscription_event ile Supabase'e yazılır.
import type { Plan } from "./plans";

/** Uygulama native (Capacitor) kabukta mı çalışıyor? */
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as any).Capacitor;
  return !!(cap && typeof cap.isNativePlatform === "function" && cap.isNativePlatform());
}

function platformApiKey(): string | null {
  if (typeof window === "undefined") return null;
  const platform = (window as any).Capacitor?.getPlatform?.();
  if (platform === "ios") return process.env.NEXT_PUBLIC_RC_IOS_KEY || null;
  if (platform === "android") return process.env.NEXT_PUBLIC_RC_ANDROID_KEY || null;
  return null;
}

let configured = false;

async function rc() {
  // Yalnız native'de çağrılır; paket native build'e dahildir.
  const mod = await import("@revenuecat/purchases-capacitor");
  return mod.Purchases;
}

/** Native'de RevenueCat'i yapılandır ve kullanıcıyı bağla. Web'de no-op. */
export async function initPurchases(userId: string): Promise<void> {
  if (!isNativeApp()) return;
  const key = platformApiKey();
  if (!key) return;
  const Purchases = await rc();
  if (!configured) {
    await Purchases.configure({ apiKey: key });
    configured = true;
  }
  try {
    await Purchases.logIn({ appUserID: userId });
  } catch {
    /* yoksay */
  }
}

export type StorePackage = {
  id: string;
  plan: Plan;
  priceString: string;
  title: string;
  raw: any;
};

// RevenueCat paket tanımlayıcısı -> plan. (Dashboard'da offering paketlerini bu id'lerle adlandır.)
function packageToPlan(identifier: string): Plan {
  const id = (identifier || "").toLowerCase();
  if (id.includes("legend") || id.includes("diamond")) return "legend";
  if (id.includes("premium") || id.includes("platinum") || id.includes("plus_plus")) return "platinum";
  return "plus";
}

/** Mevcut mağaza paketlerini getir (native). Web'de boş dizi. */
export async function getStorePackages(): Promise<StorePackage[]> {
  if (!isNativeApp()) return [];
  try {
    const Purchases = await rc();
    const offerings = await Purchases.getOfferings();
    const pkgs = (offerings.current?.availablePackages || []) as any[];
    return pkgs.map((p) => ({
      id: p.identifier,
      plan: packageToPlan(p.identifier),
      priceString: p.product?.priceString || "",
      title: p.product?.title || p.identifier,
      raw: p,
    }));
  } catch {
    return [];
  }
}

/** Paketi satın al. Başarılıysa ok:true. DB güncellemesi webhook ile gelir. */
export async function purchase(pkg: StorePackage): Promise<{ ok: boolean; error?: string }> {
  if (!isNativeApp()) return { ok: false, error: "web" };
  try {
    const Purchases = await rc();
    await Purchases.purchasePackage({ aPackage: pkg.raw });
    return { ok: true };
  } catch (e: any) {
    if (e?.userCancelled) return { ok: false, error: "cancelled" };
    return { ok: false, error: "failed" };
  }
}

/** Satın almaları geri yükle (mağaza zorunluluğu). */
export async function restorePurchases(): Promise<{ ok: boolean }> {
  if (!isNativeApp()) return { ok: false };
  try {
    const Purchases = await rc();
    await Purchases.restorePurchases();
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
