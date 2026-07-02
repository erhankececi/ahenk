"use client";

import { Container, Text, TextStyle } from "pixi.js";
import { buildTileBack } from "./Tile";

/** Ortadaki kapalı deste — istiflenmiş taş sırtlarından oluşan yığın. */
export function buildDrawPile(remaining: number): Container {
  const container = new Container();

  const stackCount = Math.min(6, Math.max(3, Math.round(remaining / 10)));
  for (let i = 0; i < stackCount; i++) {
    const back = buildTileBack(34, 46);
    back.position.set(-i * 1.1, -i * 1.6);
    back.rotation = (i % 2 === 0 ? 1 : -1) * 0.015 * i;
    container.addChild(back);
  }

  const label = new Text({
    text: String(remaining),
    style: new TextStyle({
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: 12,
      fontWeight: "700",
      fill: 0xf3ead4,
    }),
  });
  label.anchor.set(0.5);
  label.position.set(-((stackCount - 1) * 1.1) / 2, 34);
  container.addChild(label);

  return container;
}
