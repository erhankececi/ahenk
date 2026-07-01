// Plan / entitlement merkezi haritası — abonelik altyapısının ortak kaynağı
// (webhook + mağaza client + UI burayı kullanır). RANK için constants.ts'i tekrar etmiyoruz.
import { PLAN_RANK } from "./constants";

export type Plan = "free" | "plus" | "gold" | "platinum" | "legend";

// Mağaza/abonelik planları (jeton mağazasının verdiği geçici 'gold' burada satılmaz).
export const SUBSCRIPTION_PLANS = ["plus", "platinum", "legend"] as const;

// RevenueCat entitlement kimliği -> premium_plan
export const ENTITLEMENT_TO_PLAN: Record<string, Plan> = {
  plus: "plus",
  premium_plus: "platinum",
  legend: "legend",
};

/** entitlement_ids dizisinden en yüksek planı türet (legend > premium_plus > plus). */
export function planFromEntitlements(
  ids: string[] | undefined | null
): { entitlement: string | null; plan: Plan } {
  const list = ids || [];
  if (list.includes("legend")) return { entitlement: "legend", plan: "legend" };
  if (list.includes("premium_plus")) return { entitlement: "premium_plus", plan: "platinum" };
  if (list.includes("plus")) return { entitlement: "plus", plan: "plus" };
  return { entitlement: null, plan: "free" };
}

type Premiumish = { premium_plan?: string | null; premium_until?: string | null } | null | undefined;

/** Aktif premium: plan free değil VE süre dolmamış (null süre = süresiz/eski demo). */
export function isActivePremium(p: Premiumish): boolean {
  if (!p) return false;
  if ((PLAN_RANK[p.premium_plan || "free"] || 0) < 1) return false;
  if (!p.premium_until) return true;
  return new Date(p.premium_until).getTime() > Date.now();
}

/** Aktif Premium Plus (platinum). */
export function isActivePremiumPlus(p: Premiumish): boolean {
  return isActivePremium(p) && p?.premium_plan === "platinum";
}
