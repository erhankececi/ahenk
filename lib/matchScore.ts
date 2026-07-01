import { distanceKm, overlapPercent } from "./utils";

export interface Lifestyle {
  interests?: string[];
  hobbies?: string[];
  music?: string[];
  movies?: string[];
  languages?: string[];
  smoking?: string | null;
  drinking?: string | null;
  pets?: string | null;
  relationship_goal?: string | null;
  wants_kids?: string | null;
  exercise?: string | null;
  diet?: string | null;
}

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
  me?: Lifestyle; // karakter/yaşam tarzı uyumu için (opsiyonel)
  them?: Lifestyle;
}

function ortak(a: string[] = [], b: string[] = []): string[] {
  const setB = new Set(b.map((x) => x.toLowerCase()));
  return a.filter((x) => setB.has(x.toLowerCase()));
}

export interface UyumKalemi {
  label: string; // "Aynı hedef: Ciddi ilişki"
  ok: boolean; // uyumlu mu (yeşil) yoksa zıt mı
  weight: number; // göreli önem (sıralama için)
}

/**
 * Karakter & yaşam tarzı uyumu (0-100) + somut kırılım.
 * Mesafe DEĞİL — karakter: ilgi, müzik, film, dil, sigara, alkol,
 * evcil hayvan, ilişki hedefi, çocuk planı, spor, beslenme.
 * Her boyut kendi ağırlığıyla katkı verir; veri yoksa o boyut atlanır
 * (eksik veri cezalandırılmaz, payda küçülür).
 */
export function karakterUyumu(me: Lifestyle = {}, them: Lifestyle = {}): {
  score: number;
  kalemler: UyumKalemi[];
} {
  const kalemler: UyumKalemi[] = [];
  let puan = 0;
  let payda = 0;

  // --- ilgi & hobi (en ağır) ---
  const meTags = [...(me.interests || []), ...(me.hobbies || [])];
  const themTags = [...(them.interests || []), ...(them.hobbies || [])];
  if (meTags.length && themTags.length) {
    const w = 30;
    payda += w;
    const o = overlapPercent(meTags, themTags);
    puan += (o / 100) * w;
    const shared = ortak(meTags, themTags);
    if (shared.length)
      kalemler.push({
        label: shared.length > 1 ? `${shared.length} ortak ilgi (${shared.slice(0, 2).join(", ")})` : `Ortak ilgi: ${shared[0]}`,
        ok: true,
        weight: 30,
      });
  }

  // --- müzik ---
  if ((me.music || []).length && (them.music || []).length) {
    const w = 12;
    payda += w;
    const shared = ortak(me.music, them.music);
    if (shared.length) {
      puan += w;
      kalemler.push({ label: `Benzer müzik zevki (${shared[0]})`, ok: true, weight: 12 });
    }
  }

  // --- film/dizi ---
  if ((me.movies || []).length && (them.movies || []).length) {
    const w = 10;
    payda += w;
    const shared = ortak(me.movies, them.movies);
    if (shared.length) {
      puan += w;
      kalemler.push({ label: `Ortak film/dizi (${shared[0]})`, ok: true, weight: 10 });
    }
  }

  // --- ortak dil (iletişim için kritik) ---
  if ((me.languages || []).length && (them.languages || []).length) {
    const w = 10;
    payda += w;
    const shared = ortak(me.languages, them.languages);
    if (shared.length) {
      puan += w;
      kalemler.push({ label: `Ortak dil: ${shared[0]}`, ok: true, weight: 11 });
    } else {
      kalemler.push({ label: "Ortak dil yok", ok: false, weight: 11 });
    }
  }

  // --- ilişki hedefi (gelecek planı) — eşleşmenin kalbi ---
  if (me.relationship_goal && them.relationship_goal) {
    const w = 16;
    payda += w;
    const GOAL: Record<string, string> = {
      ciddi: "Ciddi ilişki", evlilik: "Evlilik", arkadaslik: "Arkadaşlık", belirsiz: "Henüz bilmiyor",
    };
    const same = me.relationship_goal === them.relationship_goal;
    // ciddi & evlilik birbirine yakın sayılır
    const yakin = new Set([me.relationship_goal, them.relationship_goal]);
    const ciddiEvlilik = yakin.has("ciddi") && yakin.has("evlilik");
    if (same) {
      puan += w;
      kalemler.push({ label: `Aynı hedef: ${GOAL[them.relationship_goal]}`, ok: true, weight: 18 });
    } else if (ciddiEvlilik) {
      puan += w * 0.7;
      kalemler.push({ label: "Uyumlu ilişki hedefi", ok: true, weight: 16 });
    } else {
      kalemler.push({ label: `Farklı hedef: ${GOAL[them.relationship_goal]}`, ok: false, weight: 18 });
    }
  }

  // --- çocuk planı ---
  if (me.wants_kids && them.wants_kids) {
    const w = 8;
    payda += w;
    const KIDS: Record<string, string> = {
      istiyorum: "Çocuk istiyor", istemiyorum: "Çocuk istemiyor", belki: "Belki çocuk", var: "Çocuğu var",
    };
    const same = me.wants_kids === them.wants_kids;
    const zit =
      (me.wants_kids === "istiyorum" && them.wants_kids === "istemiyorum") ||
      (me.wants_kids === "istemiyorum" && them.wants_kids === "istiyorum");
    if (same) {
      puan += w;
      kalemler.push({ label: `Aynı görüş: ${KIDS[them.wants_kids]}`, ok: true, weight: 8 });
    } else if (zit) {
      kalemler.push({ label: `Çocuk planı farklı`, ok: false, weight: 8 });
    } else {
      puan += w * 0.5;
    }
  }

  // --- sigara ---
  if (me.smoking && them.smoking) {
    const w = 7;
    payda += w;
    const SM: Record<string, string> = { hayir: "İçmiyor", sosyal: "Sosyal içici", evet: "İçiyor" };
    const same = me.smoking === them.smoking;
    const zit = (me.smoking === "hayir" && them.smoking === "evet") || (me.smoking === "evet" && them.smoking === "hayir");
    if (same) {
      puan += w;
      kalemler.push({ label: `Sigara: ${SM[them.smoking]} (aynı)`, ok: true, weight: 6 });
    } else if (zit) {
      kalemler.push({ label: `Sigara tercihi farklı`, ok: false, weight: 6 });
    } else puan += w * 0.5;
  }

  // --- alkol ---
  if (me.drinking && them.drinking) {
    const w = 6;
    payda += w;
    const same = me.drinking === them.drinking;
    const zit = (me.drinking === "hayir" && them.drinking === "evet") || (me.drinking === "evet" && them.drinking === "hayir");
    if (same) {
      puan += w;
      kalemler.push({ label: `Alkol tercihi aynı`, ok: true, weight: 5 });
    } else if (zit) {
      kalemler.push({ label: `Alkol tercihi farklı`, ok: false, weight: 5 });
    } else puan += w * 0.5;
  }

  // --- evcil hayvan ---
  if (me.pets && them.pets && (me.pets !== "yok" || them.pets !== "yok")) {
    const w = 5;
    payda += w;
    const ikisiSever = me.pets !== "yok" && them.pets !== "yok";
    if (ikisiSever) {
      puan += w;
      kalemler.push({ label: "İkisi de hayvansever", ok: true, weight: 5 });
    } else puan += w * 0.4;
  }

  // --- spor / yaşam tarzı ---
  if (me.exercise && them.exercise) {
    const w = 3;
    payda += w;
    if (me.exercise === them.exercise) {
      puan += w;
      kalemler.push({ label: "Benzer yaşam temposu", ok: true, weight: 3 });
    } else puan += w * 0.5;
  }

  // --- beslenme ---
  if (me.diet && them.diet) {
    const w = 3;
    payda += w;
    if (me.diet === them.diet && me.diet !== "farketmez") {
      puan += w;
      kalemler.push({ label: "Aynı beslenme tarzı", ok: true, weight: 3 });
    } else puan += w * 0.6;
  }

  // payda yoksa (hiç ortak veri yok) nötr 50
  const score = payda > 0 ? Math.round((puan / payda) * 100) : 50;
  // en önemli + uyumlu kalemler önce
  kalemler.sort((a, b) => Number(b.ok) - Number(a.ok) || b.weight - a.weight);
  return { score: Math.min(100, score), kalemler };
}

/**
 * AHENK eşleşme skoru (0-100). Karakter-öncelikli:
 *  - %55 karakter & yaşam tarzı uyumu (ilgi/müzik/film/dil/sigara/alkol/hedef/çocuk...)
 *  - %15 yaş uyumu
 *  - %12 konum yakınlığı
 *  - %6  aktivite, %6 davranış, %6 enerji
 *  - moment yakınlık bonusu (+15)
 * Eski çağrılar (me/them vermeyen) için ilgi-temelli karaktere düşer.
 */
export function ahenkSkoru(i: ScoreInput): {
  score: number;
  ortakYuzde: number;
  mesafe: number | null;
  kalemler: UyumKalemi[];
} {
  const me: Lifestyle = i.me || { interests: i.meInterests, hobbies: i.meHobbies };
  const them: Lifestyle = i.them || { interests: i.themInterests, hobbies: i.themHobbies };
  const { score: karakter, kalemler } = karakterUyumu(me, them);

  let yasUyum = 50;
  if (i.myAge && i.theirAge) {
    const fark = Math.abs(i.myAge - i.theirAge);
    yasUyum = Math.max(0, 100 - fark * 8);
  }

  const mesafe = distanceKm(i.myLat, i.myLon, i.theirLat, i.theirLon);
  let konum = 50;
  if (mesafe != null) konum = Math.max(0, 100 - mesafe / 5); // ~500km'de 0

  const aktivite = i.theirActivity ?? 50;
  const davranis = Math.min(100, i.theirBehavior ?? 100);
  const enerji = i.theirEnergy ?? 50;

  let score =
    karakter * 0.55 +
    yasUyum * 0.15 +
    konum * 0.12 +
    aktivite * 0.06 +
    davranis * 0.06 +
    enerji * 0.06;

  score += Math.min(15, i.affinity ?? 0);

  return {
    score: Math.round(Math.min(100, score)),
    ortakYuzde: karakter,
    mesafe,
    kalemler,
  };
}
