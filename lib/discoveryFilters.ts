// Keşfet mesafe filtresi seçenekleri (Tinder benzeri). value = /api/discover?km=...
export const KM_OPTIONS = [
  { value: "5", label: "5 km" },
  { value: "10", label: "10 km" },
  { value: "25", label: "25 km" },
  { value: "50", label: "50 km" },
  { value: "100", label: "100 km" },
  { value: "250", label: "250 km" },
  { value: "500", label: "500 km" },
  { value: "all", label: "Türkiye geneli" },
] as const;

export function kmLabel(v: string): string {
  return KM_OPTIONS.find((o) => o.value === v)?.label || v;
}

export const SORT_OPTIONS = [
  { value: "smart", label: "Akıllı" },
  { value: "near", label: "En yakın" },
  { value: "active", label: "En aktif" },
  { value: "new", label: "En yeni" },
  { value: "uyum", label: "En uyumlu" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export type DiscoveryFilter = {
  km: string; cities: string[]; sort: SortValue;
  minAge: number; maxAge: number; verified: boolean;
};

export const DEFAULT_FILTER: DiscoveryFilter = {
  km: "all", cities: [], sort: "smart", minAge: 18, maxAge: 60, verified: false,
};

/** Filtreyi /api/discover query string'ine çevir. */
export function filterToQuery(f: DiscoveryFilter): string {
  const p = new URLSearchParams();
  if (f.km && f.km !== "all") p.set("km", f.km);
  if (f.cities.length) p.set("cities", f.cities.join(","));
  if (f.sort && f.sort !== "smart") p.set("sort", f.sort);
  if (f.minAge > 18) p.set("minAge", String(f.minAge));
  if (f.maxAge < 60) p.set("maxAge", String(f.maxAge));
  if (f.verified) p.set("verified", "1");
  return p.toString();
}
