"use client";

import { Container, FederatedPointerEvent, Graphics, Ticker } from "pixi.js";
import type { Tile as TileModel } from "@/lib/game101/types";
import type { OkeyGameTile } from "@/lib/game101/gameTypes";
import { findPairCandidates, findRunCandidates, findSetCandidates } from "@/lib/game101/handAnalysis";
import { buildOpenTile, TILE_H, TILE_W } from "./Tile";
import {
  RACK_SLOTS_PER_ROW,
  RACK_TOTAL_SLOTS,
  compactAssignment,
  findFirstEmptySlotIndex,
  findSlotIndexByTileId,
  hasSameTileIdSet,
  reconcileAssignment,
  swapSlots,
  type RackSlotAssignment,
} from "@/lib/game101/rackSlots";

export interface BuiltTileRack {
  container: Container;
  destroy: () => void;
  /** Dışarıdan (React state'i) seçili taşı senkron etmek için — tam rebuild gerektirmez. */
  setSelected: (id: string | null) => void;
}

/**
 * Istakadaki her taşın (Tile.tsx'in paylaşılan TILE_W/TILE_H tabanına göre)
 * uygulanan NOMİNAL (hedeflenen, sahne genişliğine göre henüz kısıtlanmamış)
 * görsel büyütme katsayısı. Alt oyuncunun ıstakası "ana odak" olduğundan
 * diğer alanlardan (DiscardArea/DrawPile/openedMelds vb., hepsi Tile.tsx'in
 * paylaşılan sabitlerini kullanır) belirgin şekilde daha büyük görünmesi için
 * sadece BURADA, container ölçeğiyle uygulanır — TILE_W/TILE_H kendisi
 * DEĞİŞMEZ (diğer tüketicileri etkilememek için). Gerçekte uygulanan ölçek
 * getEffectiveRackTileScale() ile sahne genişliğine göre küçültülebilir.
 */
const RACK_TILE_SCALE = 1.2;

const GAP_X = 4;
const GAP_Y = 8;
const PAD = 12;
const EASE = 0.22; // yumuşak yerleşim easing katsayısı
const GROUP_HINT_COLOR = 0xc7a977;

/**
 * Nominal RACK_TILE_SCALE (1.2) ile sabit 15 slot/satır, dar sahnelerde
 * (fullscreen isteği başarısız olduğunda, küçük pencerede, veya bu oyunun
 * zaten desteklediği mobil landscape modunda — bkz. RotateDeviceNotice/
 * fullscreen+orientation-lock kodu — telefon genişlikleri 1280'den ÇOK daha
 * dar olabilir) ıstakayı sahne genişliğinin dışına taşırabilir:
 * 15*(64*1.2+4)-4+24 ≈ 1232px. Bu fonksiyon, ıstakanın mevcut sahne
 * genişliğinin %92'sine TAM OLARAK sığacak ölçeği DOĞRUSAL DENKLEMİ ÇÖZEREK
 * hesaplar (orantısal/yaklaşık ölçekleme YANLIŞ sonuç verir, çünkü GAP_X/PAD
 * taş boyutuyla birlikte küçülmez — sabit kalır — bu yüzden basit oran
 * hesaplaması dar sahnelerde taşmayı ÖNLEYEMEZ, gerçek denklem çözülmeli).
 * Alt sınır (0.3) yalnızca patolojik (ör. stageWidth<=0) girdilere karşı
 * savunmadır — normal/gerçekçi genişliklerde asla devreye girmez ve TAŞMAMA
 * garantisini BOZMAZ (taşmamak, sabit bir okunabilirlik tabanından daha
 * öncelikli — 15 slot/satır sabit olduğundan çok dar ekranlarda taşlar
 * küçülmek zorunda, alternatifi taşmadır ki bu daha kötü).
 * GameCanvas.tsx'teki rackHalfHeight() de dikey konumlandırmayı TUTARLI
 * tutmak için AYNI fonksiyonu kullanır.
 */
export function getEffectiveRackTileScale(stageWidth: number): number {
  const maxRackW = stageWidth * 0.92;
  const nominalRackW = RACK_SLOTS_PER_ROW * (TILE_W * RACK_TILE_SCALE + GAP_X) - GAP_X + PAD * 2;
  if (nominalRackW <= maxRackW) return RACK_TILE_SCALE;

  // rackW(scale) = RACK_SLOTS_PER_ROW*TILE_W*scale + (RACK_SLOTS_PER_ROW-1)*GAP_X + PAD*2
  // rackW(scale) <= maxRackW için scale'i tam olarak çöz (yaklaşık DEĞİL).
  const fixedWidth = (RACK_SLOTS_PER_ROW - 1) * GAP_X + PAD * 2;
  const fitScale = (maxRackW - fixedWidth) / (RACK_SLOTS_PER_ROW * TILE_W);
  return Math.max(0.3, Math.min(RACK_TILE_SCALE, fitScale));
}

/**
 * Alt kullanıcı ıstakası — SABİT 2 sıra x 15 sütun (30 slot) grid. El kaç taş
 * içerirse içersin (21/22/23...) ıstaka her zaman aynı 30 slotu çizer; boş
 * slotlar da görsel olarak (boş kanal) yer kaplamaya devam eder. Slot
 * yerleşimi (hangi taş hangi slotta) kalıcı bir React ref üzerinden
 * (assignmentRef, GameCanvas'ta tutulur) build çağrıları arasında KORUNUR —
 * bkz. lib/game101/rackSlots.ts.
 *
 * Sürükle-bırak ile serbest yerleştirme: boş slota bırakılan taş oraya
 * taşınır; dolu slota bırakılan taş SWAP yapar (iki taş yer değiştirir).
 *
 * onTileSelect verilirse, bir taş tıklanınca (sürükleme değil, basit tap)
 * dışarıya taşın id'si bildirilir — React tarafındaki useOkeyGame.selectTile
 * buna bağlanır.
 *
 * analysisTiles verilirse (useOkeyGame.myHand — OkeyGameTile[]), algılanan
 * run/set/pair aday grupları ıstaka üzerinde abartısız ince bir brass çizgi
 * katmanıyla vurgulanır (isOkey parıltısı / isFakeOkey yıldızıyla ÇAKIŞMAZ —
 * ayrı, taşların ALTINDA duran bir katmandır).
 *
 * assignmentRef: GameCanvas'ın kendi useRef'i — Pixi Application her
 * rebuild'de sıfırdan kurulsa da bu ref React component instance'ında
 * yaşamaya devam eder, böylece slot yerleşimi TAŞ ÇEK/AT gibi işlemler
 * arasında korunur.
 *
 * stageWidth: GameCanvas'ın o anki sahne genişliği — getEffectiveRackTileScale
 * ile ıstakanın sahne dışına taşmasını önlemek için kullanılır.
 */
export function buildTileRack(
  tiles: TileModel[],
  ticker: Ticker,
  onTileSelect: ((tileId: string) => void) | undefined,
  analysisTiles: OkeyGameTile[] | undefined,
  assignmentRef: { current: RackSlotAssignment | null },
  stageWidth: number,
): BuiltTileRack {
  const container = new Container();
  container.sortableChildren = true;

  const scale = getEffectiveRackTileScale(stageWidth);
  const scaleSelected = scale * 1.12;
  const slotW = TILE_W * scale;
  const slotH = TILE_H * scale;

  const rackW = RACK_SLOTS_PER_ROW * (slotW + GAP_X) - GAP_X + PAD * 2;
  const rackH = 2 * (slotH + GAP_Y) - GAP_Y + PAD * 2;

  // Istaka gövdesi: ceviz ahşap + brass trim tepsi.
  const trayGrad = new Graphics();
  trayGrad
    .roundRect(-rackW / 2, -rackH / 2, rackW, rackH, 18)
    .fill({ color: 0x2a1c11 })
    .stroke({ width: 2, color: 0xc7a977, alpha: 0.6 });
  trayGrad.zIndex = 0;
  container.addChild(trayGrad);

  const inset = new Graphics()
    .roundRect(-rackW / 2 + 8, -rackH / 2 + 8, rackW - 16, rackH - 16, 12)
    .fill({ color: 0x1c130d, alpha: 0.5 });
  inset.zIndex = 1;
  container.addChild(inset);

  // Slot kanal/ayraç çizgileri: ince, abartısız — gerçek iki sıralı ıstaka
  // hissi için her slot arası zayıf bir dikey çizgi + sıra ortası yatay çizgi.
  const channelLines = new Graphics();
  channelLines.zIndex = 1.2;
  for (let col = 1; col < RACK_SLOTS_PER_ROW; col++) {
    const x = -rackW / 2 + PAD + col * (slotW + GAP_X) - GAP_X / 2;
    channelLines
      .moveTo(x, -rackH / 2 + 10)
      .lineTo(x, rackH / 2 - 10)
      .stroke({ width: 1, color: 0xc7a977, alpha: 0.08 });
  }
  channelLines
    .moveTo(-rackW / 2 + 8, 0)
    .lineTo(rackW / 2 - 8, 0)
    .stroke({ width: 1, color: 0xc7a977, alpha: 0.12 });
  container.addChild(channelLines);

  // Grup ipucu katmanı: taşların ALTINDA, gövdenin ÜSTÜNDE — Tile.tsx'teki
  // isOkey/isFakeOkey efektlerine hiç dokunmadan ayrı bir Graphics katmanı.
  const groupHintLayer = new Graphics();
  groupHintLayer.zIndex = 1.5;
  container.addChild(groupHintLayer);

  // Sürükleme sırasında hedef slotu belirten hafif brass glow/placeholder.
  const dropHintLayer = new Graphics();
  dropHintLayer.zIndex = 1.8;
  container.addChild(dropHintLayer);

  /** Sabit slot index (0-29) -> yerel koordinat. row0=0..14, row1=15..29. */
  const slotPos = (slotIndex: number) => {
    const row = slotIndex < RACK_SLOTS_PER_ROW ? 0 : 1;
    const col = slotIndex % RACK_SLOTS_PER_ROW;
    const x = -rackW / 2 + PAD + slotW / 2 + col * (slotW + GAP_X);
    const y = -rackH / 2 + PAD + slotH / 2 + row * (slotH + GAP_Y);
    return { x, y };
  };

  const allSlotPositions = () => {
    const positions: { x: number; y: number }[] = [];
    for (let i = 0; i < RACK_TOTAL_SLOTS; i++) positions.push(slotPos(i));
    return positions;
  };

  // --- Slot ataması: önceki assignment varsa uzlaştır/yeniden diz, yoksa
  // ilk kurulumda boşluksuz sırala. ---
  const tileIds = tiles.map((t) => t.id);
  let assignment: RackSlotAssignment;
  if (!assignmentRef.current) {
    assignment = compactAssignment(tileIds);
  } else {
    const assignedIds = assignmentRef.current.filter((v): v is string => v !== null);
    if (hasSameTileIdSet(assignedIds, tileIds)) {
      // Aynı küme (sadece sıra değişmiş olabilir) -> RENK DİZ/SAYI DİZ/ÇİFT
      // DİZ/ELİ TOPLA gibi bir yeniden-sıralama işlemi: boşlukları temizle,
      // yeni sıraya göre baştan diz.
      assignment = compactAssignment(tileIds);
    } else {
      // Küme değişmiş (TAŞ ÇEK/AT/SERİ AÇ/ÇİFT AÇ/İŞLE/BİTİR) -> mevcut
      // pozisyonları ve boşlukları koruyarak uzlaştır.
      assignment = reconcileAssignment(assignmentRef.current, tileIds);
    }
  }
  assignmentRef.current = assignment;

  const tileById = new Map(tiles.map((t) => [t.id, t]));

  interface Entry {
    built: ReturnType<typeof buildOpenTile>;
    target: { x: number; y: number };
    selected: boolean;
    dragging: boolean;
  }

  const entries = new Map<string, Entry>();

  assignment.forEach((tileId, slotIndex) => {
    if (!tileId) return;
    const tile = tileById.get(tileId);
    if (!tile) return; // savunma: teorik olarak olmamalı (reconcile/compact garanti eder)
    const built = buildOpenTile(tile);
    const pos = slotPos(slotIndex);
    built.container.position.set(pos.x, pos.y);
    built.container.scale.set(scale);
    built.container.zIndex = 2;
    container.addChild(built.container);
    entries.set(tile.id, { built, target: pos, selected: false, dragging: false });
  });

  /** Grup ipucu çizgilerini (run/set/pair) mevcut assignment'a göre yeniden çizer. */
  function redrawGroupHints() {
    groupHintLayer.clear();
    if (!analysisTiles || analysisTiles.length === 0) return;

    const drawUnderline = (ids: string[], color: number) => {
      ids.forEach((id) => {
        const slotIndex = findSlotIndexByTileId(assignmentRef.current ?? assignment, id);
        if (slotIndex === -1) return;
        const pos = slotPos(slotIndex);
        const lineY = pos.y + slotH / 2 - 4;
        groupHintLayer
          .moveTo(pos.x - slotW / 2 + 6, lineY)
          .lineTo(pos.x + slotW / 2 - 6, lineY)
          .stroke({ width: 2, color, alpha: 0.55 });
      });
    };

    const runGroups = findRunCandidates(analysisTiles);
    const setGroups = findSetCandidates(analysisTiles);
    const pairGroups = findPairCandidates(analysisTiles);

    // Run/set adayları biraz daha belirgin, çiftler daha ince — dashboard
    // gibi durmaması için tek renk (brass) ve tek kalınlık ailesi kullanılır.
    runGroups.forEach((group) => drawUnderline(group.map((t) => t.id), GROUP_HINT_COLOR));
    setGroups.forEach((group) => drawUnderline(group.map((t) => t.id), GROUP_HINT_COLOR));
    pairGroups.forEach((group) => drawUnderline(group.map((t) => t.id), 0x9c8258));
  }

  redrawGroupHints();

  let selectedId: string | null = null;
  let dragId: string | null = null;
  let dragOffset = { x: 0, y: 0 };

  function setSelected(id: string | null) {
    if (selectedId && entries.has(selectedId)) {
      const prev = entries.get(selectedId)!;
      prev.selected = false;
      prev.built.setSelected(false);
    }
    selectedId = id;
    if (id && entries.has(id)) {
      const next = entries.get(id)!;
      next.selected = true;
      next.built.setSelected(true);
    }
  }

  /** Verilen yerel pozisyona en yakın slotu (dolu ya da boş, TÜM 30 slot arasından) bulur. */
  function nearestSlotIndex(pos: { x: number; y: number }): number {
    const slots = allSlotPositions();
    let bestIdx = 0;
    let bestDist = Infinity;
    slots.forEach((slot, idx) => {
      const d = (pos.x - slot.x) ** 2 + (pos.y - slot.y) ** 2;
      if (d < bestDist) {
        bestDist = d;
        bestIdx = idx;
      }
    });
    return bestIdx;
  }

  function drawDropHint(slotIdx: number | null) {
    dropHintLayer.clear();
    if (slotIdx === null) return;
    const pos = slotPos(slotIdx);
    dropHintLayer
      .roundRect(pos.x - slotW / 2 - 2, pos.y - slotH / 2 - 2, slotW + 4, slotH + 4, 11)
      .fill({ color: 0xf3d17a, alpha: 0.1 })
      .stroke({ width: 1.75, color: 0xf3d17a, alpha: 0.65 });
  }

  /** Sürüklenen taşı bırakma noktasına en yakın slota yerleştirir (boşsa taşı, doluysa SWAP). */
  function dropAtNearestSlot(id: string) {
    const entry = entries.get(id);
    if (!entry) return;
    const current = assignmentRef.current ?? assignment;
    const fromIndex = findSlotIndexByTileId(current, id);
    const toIndex = nearestSlotIndex(entry.built.container.position);

    let next: RackSlotAssignment;
    if (fromIndex === -1) {
      // Teorik olarak olmamalı ama savunma: bulunamazsa ilk boş slota koy.
      const empty = findFirstEmptySlotIndex(current);
      next = current.slice();
      if (empty !== -1) next[empty] = id;
    } else if (toIndex === fromIndex) {
      next = current.slice();
    } else {
      // Boş slota taşıma da, dolu slotla SWAP da aynı swapSlots ile
      // yapılabilir (biri null olsa bile çalışır — rackSlots.ts'e bakınız).
      next = swapSlots(current, fromIndex, toIndex);
    }

    assignment = next;
    assignmentRef.current = next;

    // Tüm taşların hedeflerini yeni assignment'a göre güncelle.
    next.forEach((tileId, slotIndex) => {
      if (!tileId) return;
      const e = entries.get(tileId);
      if (e) e.target = slotPos(slotIndex);
    });

    redrawGroupHints();
  }

  function onPointerDown(id: string) {
    return (e: FederatedPointerEvent) => {
      const entry = entries.get(id)!;
      dragId = id;
      entry.dragging = true;
      entry.built.container.zIndex = 100;
      // Sürüklenen taşı en son child olarak yeniden ekle — sortableChildren
      // ile zIndex zaten en üste taşır, ama aynı frame'de eklenen/kaldırılan
      // başka görsellerle render sırası belirsizliğini önlemek için container
      // child listesinde de en sona alınır (diğer taşların ÜSTÜNDE görünür).
      container.addChild(entry.built.container);
      const local = container.toLocal(e.global);
      dragOffset = {
        x: local.x - entry.built.container.position.x,
        y: local.y - entry.built.container.position.y,
      };
      setSelected(id);
      onTileSelect?.(id);
      container.sortChildren();
    };
  }

  function onPointerMove(e: FederatedPointerEvent) {
    if (!dragId) return;
    const entry = entries.get(dragId);
    if (!entry) return;
    const local = container.toLocal(e.global);
    entry.built.container.position.set(local.x - dragOffset.x, local.y - dragOffset.y);

    const targetSlot = nearestSlotIndex(entry.built.container.position);
    drawDropHint(targetSlot);
  }

  function onPointerUp() {
    if (!dragId) return;
    const entry = entries.get(dragId)!;
    entry.dragging = false;
    entry.built.container.zIndex = 2;
    const id = dragId;
    dragId = null;
    drawDropHint(null);
    dropAtNearestSlot(id);
    container.sortChildren();
  }

  entries.forEach((entry, id) => {
    entry.built.container.eventMode = "static";
    entry.built.container.cursor = "grab";
    entry.built.container.on("pointerdown", onPointerDown(id));
  });

  container.eventMode = "static";
  container.on("globalpointermove", onPointerMove);
  container.on("pointerup", onPointerUp);
  container.on("pointerupoutside", onPointerUp);

  // Yumuşak yerleşim animasyonu: her frame'de hedefe doğru lerp.
  const tickFn = () => {
    entries.forEach((entry) => {
      if (entry.dragging) return;
      const pos = entry.built.container.position;
      pos.x += (entry.target.x - pos.x) * EASE;
      pos.y += (entry.target.y - pos.y) * EASE;

      // Seçili taş hafif büyür (base scale = sahneye göre uyarlanmış scale,
      // seçiliyken scaleSelected — mevcut seçili-taş büyüme mantığıyla orantılı).
      const targetScale = entry.selected ? scaleSelected : scale;
      entry.built.container.scale.x += (targetScale - entry.built.container.scale.x) * 0.25;
      entry.built.container.scale.y += (targetScale - entry.built.container.scale.y) * 0.25;
    });
  };
  ticker.add(tickFn);

  const destroy = () => {
    ticker.remove(tickFn);
    // NOT: assignmentRef'e KASITLI olarak dokunulmuyor — ref, bu TileRack
    // instance'ından bağımsız olarak GameCanvas component'inde yaşamaya
    // devam etmeli (bir sonraki rebuild'de slot yerleşimini korumak için).
  };

  return { container, destroy, setSelected };
}
