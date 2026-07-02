"use client";

import { Container, FederatedPointerEvent, Graphics, Ticker } from "pixi.js";
import type { Tile as TileModel } from "@/lib/game101/types";
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

/**
 * Alt kullanıcı ıstakası — 2 sıra, sürükle-bırak ile yer değiştirme.
 * Seçili taş scale+shadow ile büyür; bırakılan taş hedef slota yumuşak
 * easing (lerp) ile oturur (ani zıplama yok).
 *
 * onTileSelect verilirse, bir taş tıklanınca (sürükleme değil, basit tap)
 * dışarıya taşın id'si bildirilir — React tarafındaki useOkeyGame.selectTile
 * buna bağlanır.
 */
export function buildTileRack(
  tiles: TileModel[],
  ticker: Ticker,
  onTileSelect?: (tileId: string) => void,
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

  let order = [...tiles];

  const slotPos = (index: number) => {
    const row = index < COLS ? 0 : 1;
    const col = index % COLS;
    const x = -rackW / 2 + PAD + TILE_W / 2 + col * (TILE_W + GAP_X);
    const y = -rackH / 2 + PAD + TILE_H / 2 + row * (TILE_H + GAP_Y);
    return { x, y };
  };

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
    const slots = order.map((_, i) => slotPos(i));
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
  }

  function onPointerDown(id: string) {
    return (e: FederatedPointerEvent) => {
      const entry = entries.get(id)!;
      dragId = id;
      entry.dragging = true;
      entry.built.container.zIndex = 10;
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
  }

  function onPointerUp() {
    if (!dragId) return;
    const entry = entries.get(dragId)!;
    entry.dragging = false;
    entry.built.container.zIndex = 2;
    dragId = null;
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
