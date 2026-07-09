"use client";

import { Container, FederatedPointerEvent, Graphics, Ticker } from "pixi.js";
import type { Tile as TileModel } from "@/lib/game101/types";
import type { OkeyGameTile } from "@/lib/game101/gameTypes";
import { findPairCandidates, findRunCandidates, findSetCandidates } from "@/lib/game101/handAnalysis";
import { buildOpenTile, TILE_H, TILE_W } from "./Tile";

export interface BuiltTileRack {
  container: Container;
  destroy: () => void;
  /** Dışarıdan (React state'i) seçili taşı senkron etmek için — tam rebuild gerektirmez. */
  setSelected: (id: string | null) => void;
}

const COLS = 11;
const GAP_X = 6;
const GAP_Y = 10;
const PAD = 14;
const EASE = 0.22; // yumuşak yerleşim easing katsayısı
const GROUP_HINT_COLOR = 0xc7a977;

/**
 * Verilen taş sayısını 2 satıra dengeli böler (ör. 21 -> 11+10, 22 -> 11+11).
 * Her satır en fazla COLS taş barındırabilir; ilk satır her zaman ceil(n/2)
 * (COLS'u aşmayacak şekilde), ikinci satır kalanı alır. Böylece taş sayısı
 * 21'den 22'ye çıktığında (TAŞ ÇEK sonrası) satırlar simetrik/dengeli kalır
 * ve taşlar üst üste binmez.
 */
function rowSplit(count: number): { row0: number; row1: number } {
  const row0 = Math.min(COLS, Math.ceil(count / 2));
  const row1 = Math.min(COLS, count - row0);
  return { row0, row1 };
}

/**
 * Alt kullanıcı ıstakası — 2 sıra, sürükle-bırak ile yer değiştirme.
 * Seçili taş scale+shadow ile büyür; bırakılan taş hedef slota yumuşak
 * easing (lerp) ile oturur (ani zıplama yok).
 *
 * onTileSelect verilirse, bir taş tıklanınca (sürükleme değil, basit tap)
 * dışarıya taşın id'si bildirilir — React tarafındaki useOkeyGame.selectTile
 * buna bağlanır.
 *
 * analysisTiles verilirse (useOkeyGame.myHand — OkeyGameTile[]), algılanan
 * run/set/pair aday grupları ıstaka üzerinde abartısız ince bir brass çizgi
 * katmanıyla vurgulanır (isOkey parıltısı / isFakeOkey yıldızıyla ÇAKIŞMAZ —
 * ayrı, taşların ALTINDA duran bir katmandır).
 */
export function buildTileRack(
  tiles: TileModel[],
  ticker: Ticker,
  onTileSelect?: (tileId: string) => void,
  analysisTiles?: OkeyGameTile[],
): BuiltTileRack {
  const container = new Container();
  container.sortableChildren = true;

  const rackW = COLS * (TILE_W + GAP_X) - GAP_X + PAD * 2;
  const rackH = 2 * (TILE_H + GAP_Y) - GAP_Y + PAD * 2;

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

  // Grup ipucu katmanı: taşların ALTINDA, gövdenin ÜSTÜNDE — Tile.tsx'teki
  // isOkey/isFakeOkey efektlerine hiç dokunmadan ayrı bir Graphics katmanı.
  const groupHintLayer = new Graphics();
  groupHintLayer.zIndex = 1.5;
  container.addChild(groupHintLayer);

  // Sürükleme sırasında hedef slotu belirten hafif brass glow/placeholder.
  const dropHintLayer = new Graphics();
  dropHintLayer.zIndex = 1.8;
  container.addChild(dropHintLayer);

  let order = [...tiles];

  const slotPos = (index: number) => {
    const { row0 } = rowSplit(order.length);
    const row = index < row0 ? 0 : 1;
    const col = index < row0 ? index : index - row0;
    const x = -rackW / 2 + PAD + TILE_W / 2 + col * (TILE_W + GAP_X);
    const y = -rackH / 2 + PAD + TILE_H / 2 + row * (TILE_H + GAP_Y);
    return { x, y };
  };

  const allSlotPositions = () => order.map((_, i) => slotPos(i));

  interface Entry {
    built: ReturnType<typeof buildOpenTile>;
    target: { x: number; y: number };
    selected: boolean;
    dragging: boolean;
  }

  const entries = new Map<string, Entry>();

  order.forEach((tile, i) => {
    const built = buildOpenTile(tile);
    const pos = slotPos(i);
    built.container.position.set(pos.x, pos.y);
    built.container.zIndex = 2;
    container.addChild(built.container);
    entries.set(tile.id, { built, target: pos, selected: false, dragging: false });
  });

  /** Grup ipucu çizgilerini (run/set/pair) mevcut `order`e göre yeniden çizer. */
  function redrawGroupHints() {
    groupHintLayer.clear();
    if (!analysisTiles || analysisTiles.length === 0) return;

    const positionById = new Map<string, { x: number; y: number }>();
    order.forEach((tile, i) => {
      positionById.set(tile.id, slotPos(i));
    });

    const runGroups = findRunCandidates(analysisTiles);
    const setGroups = findSetCandidates(analysisTiles);
    const pairGroups = findPairCandidates(analysisTiles);

    const drawUnderline = (ids: string[], color: number) => {
      ids.forEach((id) => {
        const pos = positionById.get(id);
        if (!pos) return;
        const lineY = pos.y + TILE_H / 2 - 3;
        groupHintLayer
          .moveTo(pos.x - TILE_W / 2 + 6, lineY)
          .lineTo(pos.x + TILE_W / 2 - 6, lineY)
          .stroke({ width: 2, color, alpha: 0.55 });
      });
    };

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

  function reorderFromPositions() {
    // Her taşın en yakın boş slotuna göre yeni sırayı hesapla (basit greedy).
    const items = order.map((t) => entries.get(t.id)!);
    const slots = allSlotPositions();
    const used = new Array(slots.length).fill(false);
    const assignment: (string | null)[] = new Array(slots.length).fill(null);

    items.forEach((entry, tileIdx) => {
      const cur = entry.built.container.position;
      let bestSlot = 0;
      let bestDist = Infinity;
      slots.forEach((slot, slotIdx) => {
        if (used[slotIdx]) return;
        const d = (cur.x - slot.x) ** 2 + (cur.y - slot.y) ** 2;
        if (d < bestDist) {
          bestDist = d;
          bestSlot = slotIdx;
        }
      });
      used[bestSlot] = true;
      assignment[bestSlot] = order[tileIdx].id;
    });

    order = assignment.map((id) => order.find((t) => t.id === id)!);
    order.forEach((tile, i) => {
      const entry = entries.get(tile.id)!;
      entry.target = slotPos(i);
    });
    redrawGroupHints();
  }

  /** Sürüklenen taşa en yakın boş (başka taşın hedefi olmayan) slotu bulur — drop placeholder için. */
  function nearestSlotIndex(pos: { x: number; y: number }, excludeId: string): number {
    const slots = allSlotPositions();
    const occupiedByOthers = new Set(
      order
        .filter((t) => t.id !== excludeId)
        .map((t) => {
          const e = entries.get(t.id)!;
          const s = slots.reduce(
            (best, slot, idx) => {
              const d = (e.target.x - slot.x) ** 2 + (e.target.y - slot.y) ** 2;
              return d < best.d ? { d, idx } : best;
            },
            { d: Infinity, idx: -1 },
          );
          return s.idx;
        }),
    );
    let bestIdx = 0;
    let bestDist = Infinity;
    slots.forEach((slot, idx) => {
      if (occupiedByOthers.has(idx)) return;
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
    const slots = allSlotPositions();
    const pos = slots[slotIdx];
    if (!pos) return;
    dropHintLayer
      .roundRect(pos.x - TILE_W / 2 - 2, pos.y - TILE_H / 2 - 2, TILE_W + 4, TILE_H + 4, 11)
      .fill({ color: 0xf3d17a, alpha: 0.1 })
      .stroke({ width: 1.75, color: 0xf3d17a, alpha: 0.65 });
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

    const targetSlot = nearestSlotIndex(entry.built.container.position, dragId);
    drawDropHint(targetSlot);
  }

  function onPointerUp() {
    if (!dragId) return;
    const entry = entries.get(dragId)!;
    entry.dragging = false;
    entry.built.container.zIndex = 2;
    dragId = null;
    drawDropHint(null);
    reorderFromPositions();
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

      // Seçili taş hafif yukarı kalkar (scale zaten setSelected'ta stroke ile
      // vurgulanıyor; burada ek olarak y ofseti + scale lerp uygulanır).
      const targetScale = entry.selected ? 1.12 : 1;
      entry.built.container.scale.x += (targetScale - entry.built.container.scale.x) * 0.25;
      entry.built.container.scale.y += (targetScale - entry.built.container.scale.y) * 0.25;
    });
  };
  ticker.add(tickFn);

  const destroy = () => {
    ticker.remove(tickFn);
  };

  return { container, destroy, setSelected };
}
