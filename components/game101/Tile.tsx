"use client";

import { Container, FillGradient, Graphics, Text, TextStyle } from "pixi.js";
import type { Tile as TileModel } from "@/lib/game101/types";

/** Klasik okey renk şeması — sıcak/ivory zemin üstünde okunaklı canlı tonlar. */
const TILE_NUMBER_COLORS: Record<TileModel["color"], number> = {
  red: 0xc0392b,
  blue: 0x1f5fa8,
  gold: 0xb8862f,
  navy: 0x1c2440,
};

export const TILE_W = 64;
export const TILE_H = 88;

export interface BuiltTile {
  container: Container;
  base: Graphics;
  tile: TileModel;
  setSelected: (selected: boolean) => void;
}

/**
 * Tek bir açık (okunabilir) taş çizer — ivory/bone gradient zemin, ince brass
 * kenarlık, kabartma hissi veren iç gölge katmanları, büyük numara.
 * Seçim durumu scale+shadow geçişiyle (dıştan RAF ile) yönetilir; burada
 * yalnız hedef görsel durumu hazırlayan bir yardımcı (setSelected) dönülür.
 */
export function buildOpenTile(tile: TileModel): BuiltTile {
  const container = new Container();
  container.pivot.set(TILE_W / 2, TILE_H / 2);

  // Zemin drop-shadow katmanı (ayrı, hafif ofsetli koyu şekil).
  const shadow = new Graphics()
    .roundRect(-TILE_W / 2 + 3, -TILE_H / 2 + 6, TILE_W, TILE_H, 10)
    .fill({ color: 0x000000, alpha: 0.35 });
  container.addChild(shadow);

  const base = new Graphics();
  drawTileBase(base, false);
  container.addChild(base);

  // Üst parlaklık şeridi (kabartma hissi).
  const sheen = new Graphics()
    .roundRect(-TILE_W / 2 + 5, -TILE_H / 2 + 4, TILE_W - 10, TILE_H * 0.32, 8)
    .fill({ color: 0xffffff, alpha: 0.14 });
  container.addChild(sheen);

  if (tile.isJoker) {
    const star = new Text({
      text: "★",
      style: new TextStyle({
        fontFamily: "Manrope, Inter, system-ui, sans-serif",
        fontSize: 30,
        fontWeight: "700",
        fill: 0xb8862f,
      }),
    });
    star.anchor.set(0.5);
    star.position.set(0, -8);
    container.addChild(star);

    const label = new Text({
      text: "OKEY",
      style: new TextStyle({
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 11,
        fontWeight: "600",
        fill: 0x8a6a2c,
        letterSpacing: 1.5,
      }),
    });
    label.anchor.set(0.5);
    label.position.set(0, 24);
    container.addChild(label);
  } else {
    const num = new Text({
      text: String(tile.value),
      style: new TextStyle({
        fontFamily: "Manrope, Inter, system-ui, sans-serif",
        fontSize: 32,
        fontWeight: "800",
        fill: TILE_NUMBER_COLORS[tile.color],
      }),
    });
    num.anchor.set(0.5);
    num.position.set(0, -6);
    container.addChild(num);

    const dot = new Graphics()
      .circle(0, 22, 3)
      .fill({ color: TILE_NUMBER_COLORS[tile.color], alpha: 0.55 });
    container.addChild(dot);
  }

  container.eventMode = "static";
  container.cursor = "grab";

  const setSelected = (selected: boolean) => {
    drawTileBase(base, selected);
  };

  return { container, base, tile, setSelected };
}

function drawTileBase(g: Graphics, selected: boolean) {
  g.clear();
  const grad = new FillGradient(0, -TILE_H / 2, 0, TILE_H / 2);
  grad.addColorStop(0, selected ? 0xffffff : 0xfbf7ee);
  grad.addColorStop(0.55, 0xf3ead4);
  grad.addColorStop(1, 0xe6dbc0);

  g.roundRect(-TILE_W / 2, -TILE_H / 2, TILE_W, TILE_H, 10)
    .fill(grad)
    .stroke({
      width: selected ? 2.5 : 1.4,
      color: selected ? 0xc7a977 : 0xcbb98f,
      alpha: selected ? 1 : 0.7,
    });

  // İç kabartma çizgisi.
  g.roundRect(-TILE_W / 2 + 3, -TILE_H / 2 + 3, TILE_W - 6, TILE_H - 6, 8).stroke({
    width: 1,
    color: 0xffffff,
    alpha: 0.5,
  });
}

/** Rakip elindeki kapalı taş sırtı — brass/ahşap desenli küçük dikdörtgen. */
export function buildTileBack(width = 30, height = 42): Container {
  const container = new Container();
  container.pivot.set(width / 2, height / 2);

  const shadow = new Graphics()
    .roundRect(-width / 2 + 1.5, -height / 2 + 3, width, height, 6)
    .fill({ color: 0x000000, alpha: 0.3 });
  container.addChild(shadow);

  const grad = new FillGradient(0, -height / 2, 0, height / 2);
  grad.addColorStop(0, 0x3a2a1d);
  grad.addColorStop(0.5, 0x2a1d14);
  grad.addColorStop(1, 0x1c130d);

  const base = new Graphics()
    .roundRect(-width / 2, -height / 2, width, height, 6)
    .fill(grad)
    .stroke({ width: 1.2, color: 0xc7a977, alpha: 0.55 });
  container.addChild(base);

  const inset = new Graphics()
    .roundRect(-width / 2 + 4, -height / 2 + 4, width - 8, height - 8, 4)
    .stroke({ width: 1, color: 0xc7a977, alpha: 0.35 });
  container.addChild(inset);

  const diamond = new Graphics()
    .poly([0, -6, 6, 0, 0, 6, -6, 0])
    .fill({ color: 0xc7a977, alpha: 0.5 });
  container.addChild(diamond);

  return container;
}
