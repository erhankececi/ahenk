"use client";

import { Container, FillGradient, Graphics, Text, TextStyle } from "pixi.js";
import type { Player } from "@/lib/game101/types";
import { buildTileBack } from "./Tile";

export interface BuiltPlayerSeat {
  container: Container;
  setActive: (active: boolean) => void;
}

/**
 * Rakip/kullanıcı koltuğu: avatar rozeti + isim/şehir etiketi + kapalı taş sırası.
 * Avatar tıklanınca onSeatClick(playerId) tetiklenir (mini profil kartı overlay
 * fazında bunu dinleyecek — burada yalnız callback expose edilir).
 */
export function buildPlayerSeat(
  player: Player,
  orientation: "horizontal" | "vertical",
  onSeatClick: (playerId: string) => void,
): BuiltPlayerSeat {
  const container = new Container();
  container.label = `seat-${player.id}`;

  // Sıradaki oyuncu halkası (avatar arkasında glow).
  const turnRing = new Graphics().circle(0, 0, 30).stroke({ width: 3, color: 0xc7a977, alpha: 0.9 });
  turnRing.visible = !!player.isActiveTurn;
  turnRing.label = "turn-ring";

  // Avatar rozeti (baş harf ile basit dairesel avatar placeholder).
  const avatarGrad = new FillGradient(-26, -26, 26, 26);
  avatarGrad.addColorStop(0, 0xc7a977);
  avatarGrad.addColorStop(1, 0x7d6640);
  const avatar = new Graphics()
    .circle(0, 0, 24)
    .fill(avatarGrad)
    .stroke({ width: 2, color: 0x0e0d10, alpha: 0.8 });
  avatar.eventMode = "static";
  avatar.cursor = "pointer";
  avatar.on("pointertap", () => onSeatClick(player.id));

  const initial = new Text({
    text: player.name.charAt(0).toUpperCase(),
    style: new TextStyle({
      fontFamily: "Manrope, Inter, system-ui, sans-serif",
      fontSize: 20,
      fontWeight: "800",
      fill: 0x1c130d,
    }),
  });
  initial.anchor.set(0.5);
  avatar.addChild(initial);

  const avatarGroup = new Container();
  avatarGroup.addChild(turnRing, avatar);
  container.addChild(avatarGroup);

  // İsim + şehir etiketi (avatarın altında pill).
  const label = new Text({
    text: `${player.name}\n${player.city}`,
    style: new TextStyle({
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: 11,
      fontWeight: "600",
      fill: 0xf3ead4,
      align: "center",
      lineHeight: 13,
    }),
  });
  label.anchor.set(0.5, 0);
  label.position.set(0, 34);
  container.addChild(label);

  // Kapalı taş sırası (rakip elinin görsel temsili).
  const rack = new Container();
  const visibleTiles = Math.min(14, player.tileCount);
  const backW = 22;
  const backH = 30;
  const gap = 4;

  if (orientation === "horizontal") {
    const totalW = visibleTiles * (backW + gap) - gap;
    for (let i = 0; i < visibleTiles; i++) {
      const back = buildTileBack(backW, backH);
      back.position.set(-totalW / 2 + i * (backW + gap) + backW / 2, 0);
      rack.addChild(back);
    }
    rack.position.set(0, 66);
  } else {
    const totalH = visibleTiles * (backW + gap) - gap;
    for (let i = 0; i < visibleTiles; i++) {
      const back = buildTileBack(backW, backH);
      back.rotation = Math.PI / 2;
      back.position.set(0, -totalH / 2 + i * (backW + gap) + backW / 2);
      rack.addChild(back);
    }
    rack.position.set(46, 0);
  }
  container.addChild(rack);

  const setActive = (active: boolean) => {
    turnRing.visible = active;
  };

  return { container, setActive };
}
