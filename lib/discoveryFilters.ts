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

export type DiscoveryFilter = { km: string; cities: string[] };

export const DEFAULT_FILTER: DiscoveryFilter = { km: "all", cities: [] };

/** Filtreyi /api/discover query string'ine çevir. */
export function filterToQuery(f: DiscoveryFilter): string {
  const p = new URLSearchParams();
  if (f.km && f.km !== "all") p.set("km", f.km);
  if (f.cities.length) p.set("cities", f.cities.join(","));
  return p.toString();
}
