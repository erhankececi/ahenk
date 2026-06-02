import { distanceKm, overlapPercent } from "./utils";

export interface ScoreInput {
  meInterests: string[];
  themInterests: string[];
  meHobbies?: string[];
  themHobbies?: string[];
  myAge?: number | null;
  theirAge?: number | null;
  myLat?: number | null;
  myLon?: number | null;
  theirLat?: number | null;
  theirLon?: number | null;
  theirActivity?: number;
  theirBehavior?: number;
  theirEnergy?: number;
  affinity?: number; // moment tepkilerinden gelen yakınlık (0+)
}

/**
 * AHENK eşleşme skoru (0-100). Ağırlıklar:
 *  - %40 ilgi/hobi benzerliği
 *  - %20 yaş uyumu
 *  - %20 konum yakınlığı
 *  - %10 aktivite düzeyi
 *  - %10 davranış puanı (sohbet kalitesi/güven)
 */
export function ahenkSkoru(i: ScoreInput): {
  score: number;
  ortakYuzde: number;
  mesafe: number | null;
} {
  const ilgi = overlapPercent(
    [...(i.meInterests || []), ...(i.meHobbies || [])],
    [...(i.themInterests || []), ...(i.themHobbies || [])]
  );

  let yasUyum = 50;
  if (i.myAge && i.theirAge) {
    const fark = Math.abs(i.myAge - i.theirAge);
    yasUyum = Math.max(0, 100 - fark * 8);
  }

  const mesafe = distanceKm(i.myLat, i.myLon, i.theirLat, i.theirLon);
  let konum = 50;
  if (mesafe != null) konum = Math.max(0, 100 - mesafe / 5); // ~500km'de 0

  const aktivite = i.theirActivity ?? 50;
  const davranis = i.theirBehavior ?? 100;
  const enerji = i.theirEnergy ?? 50;

  // temel skor (ağırlıklar): %35 ilgi, %18 yaş, %18 konum,
  // %9 aktivite, %9 davranış, %11 enerji
  let score =
    ilgi * 0.35 +
    yasUyum * 0.18 +
    konum * 0.18 +
    aktivite * 0.09 +
    Math.min(100, davranis) * 0.09 +
    enerji * 0.11;

  // moment tepkilerinden gelen yakınlık bonusu (en fazla +15)
  score += Math.min(15, i.affinity ?? 0);

  return {
    score: Math.round(Math.min(100, score)),
    ortakYuzde: ilgi,
    mesafe,
  };
}
