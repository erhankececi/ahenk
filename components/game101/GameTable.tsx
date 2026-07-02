"use client";

import { Container, FillGradient, Graphics } from "pixi.js";

/**
 * Masa zemini: ceviz ahşap kenar + mat pirinç trim + koyu yeşil keçe oval +
 * merkeze doğru yumuşak spot ışık. Tamamı Pixi Graphics ile (düz CSS oval YOK).
 */
export function buildGameTable(width: number, height: number): Container {
  const container = new Container();

  const cx = width / 2;
  const cy = height / 2;
  const outerRX = width * 0.48;
  const outerRY = height * 0.46;

  // 1) Ahşap dış çerçeve (birkaç katmanlı gradient + ince "damar" çizgileri).
  const woodGrad = new FillGradient(cx - outerRX, cy - outerRY, cx + outerRX, cy + outerRY);
  woodGrad.addColorStop(0, 0x4a2f1c);
  woodGrad.addColorStop(0.35, 0x3a2415);
  woodGrad.addColorStop(0.65, 0x2c1a0e);
  woodGrad.addColorStop(1, 0x1e120a);

  const wood = new Graphics()
    .ellipse(cx, cy, outerRX, outerRY)
    .fill(woodGrad);
  container.addChild(wood);

  // Ahşap dokusu hissi veren ince eş-merkezli çizgiler.
  const grain = new Graphics();
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    grain
      .ellipse(cx, cy, outerRX * (0.97 - t * 0.02), outerRY * (0.97 - t * 0.02))
      .stroke({ width: 1, color: 0x000000, alpha: 0.12 });
  }
  container.addChild(grain);

  // 2) Mat pirinç ince trim çizgisi.
  const trimRX = outerRX * 0.9;
  const trimRY = outerRY * 0.88;
  const brassGrad = new FillGradient(cx - trimRX, cy - trimRY, cx + trimRX, cy + trimRY);
  brassGrad.addColorStop(0, 0xdbbf8e);
  brassGrad.addColorStop(0.5, 0xc7a977);
  brassGrad.addColorStop(1, 0x9c8258);

  const trim = new Graphics()
    .ellipse(cx, cy, trimRX, trimRY)
    .fill(brassGrad);
  container.addChild(trim);

  // NOT: trim bir "halka" gibi görünür çünkü felt katmanı hemen üstünde,
  // biraz daha küçük yarıçapla çizilip trim'in iç kısmını örtüyor.

  // 3) Koyu yeşil keçe oval (radial gradient hissi için çok katmanlı ellipse).
  const feltRX = trimRX * 0.965;
  const feltRY = trimRY * 0.955;

  const feltBase = new Graphics()
    .ellipse(cx, cy, feltRX, feltRY)
    .fill({ color: 0x0e2a1f });
  container.addChild(feltBase);

  // Radial ışık hissi: merkeze doğru gittikçe açılan halkalar.
  const glowLayers = 10;
  for (let i = glowLayers; i >= 1; i--) {
    const t = i / glowLayers; // 1 (dış) -> 1/N (iç)
    const rx = feltRX * t;
    const ry = feltRY * t;
    const innerT = 1 - t;
    // Dıştan içe: koyu yeşilden hafif daha açık merkezi yeşile.
    const shade = mixColor(0x0a2018, 0x1f5138, innerT * 0.9);
    const layer = new Graphics().ellipse(cx, cy, rx, ry).fill({ color: shade, alpha: 1 });
    container.addChild(layer);
  }

  // Merkezde ekstra yumuşak spot (beyaza yakın, çok düşük alpha).
  const spot = new Graphics()
    .ellipse(cx, cy - outerRY * 0.08, feltRX * 0.42, feltRY * 0.4)
    .fill({ color: 0xffffff, alpha: 0.06 });
  container.addChild(spot);

  // Keçe dokusu: ince çapraz çizgiler (çok düşük alpha, kumaş hissi).
  const weave = new Graphics();
  const step = 26;
  for (let x = -feltRX; x < feltRX; x += step) {
    weave.moveTo(cx + x, cy - feltRY).lineTo(cx + x + feltRY * 0.5, cy + feltRY);
  }
  weave.stroke({ width: 1, color: 0x000000, alpha: 0.05 });
  container.addChild(weave);

  // 4) Keçe kenarına ince iç pirinç çizgi (masa kenar trim'i - felt üstünde ince halka).
  const innerRing = new Graphics()
    .ellipse(cx, cy, feltRX * 0.985, feltRY * 0.98)
    .stroke({ width: 2.5, color: 0xc7a977, alpha: 0.4 });
  container.addChild(innerRing);

  // 5) Merkez oyun alanı — hafif koyu oval zemin (deste + discard oturacak).
  const centerRX = feltRX * 0.32;
  const centerRY = feltRY * 0.3;
  const centerGrad = new FillGradient(cx - centerRX, cy - centerRY, cx + centerRX, cy + centerRY);
  centerGrad.addColorStop(0, 0x143526);
  centerGrad.addColorStop(1, 0x0a2118);
  const centerZone = new Graphics()
    .ellipse(cx, cy, centerRX, centerRY)
    .fill(centerGrad)
    .stroke({ width: 1.5, color: 0xc7a977, alpha: 0.28 });
  container.addChild(centerZone);

  return container;
}

function mixColor(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 0xff;
  const ag = (a >> 8) & 0xff;
  const ab = a & 0xff;
  const br = (b >> 16) & 0xff;
  const bg = (b >> 8) & 0xff;
  const bb = b & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const gC = Math.round(ag + (bg - ag) * t);
  const bC = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (gC << 8) | bC;
}
