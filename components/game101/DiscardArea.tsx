"use client";

import { Container, FillGradient, Graphics } from "pixi.js";
import type { Tile as TileModel } from "@/lib/game101/types";
import { buildOpenTile } from "./Tile";

/** Açık/atılan son taş alanı — hafif oyuk zemin üstünde tek açık taş. */
export function buildDiscardArea(tile: TileModel | null): Container {
  const container = new Container();

  const socketW = 76;
  const socketH = 100;
  const grad = new FillGradient(0, -socketH / 2, 0, socketH / 2);
  grad.addColorStop(0, 0x0a2016);
  grad.addColorStop(1, 0x143526);

  const socket = new Graphics()
    .roundRect(-socketW / 2, -socketH / 2, socketW, socketH, 12)
    .fill(grad)
    .stroke({ width: 1.5, color: 0xc7a977, alpha: 0.35 });
  container.addChild(socket);

  if (tile) {
    const built = buildOpenTile(tile);
    built.container.rotation = 0.04;
    container.addChild(built.container);
  }

  return container;
}
