// Ahenk 101 — Görev 14 (Faz 1): Colyseus Room İSKELETİ ("okey101").
//
// Bu görevde GERÇEK bir oyun motoru YOK. onJoin/onLeave dışındaki mesaj
// handler'ları (READY/SIT/LEAVE_SEAT/START_GAME) minimal/log-only bir
// iskelet olarak bırakılmıştır — aşırı mühendislik YAPILMAMIŞTIR.
// GAME_COMMAND handler'ı spesifikasyon gereği SADECE loglar, state
// DEĞİŞTİRMEZ (Görev 13'teki OkeyGameCommand yapısı ileride buraya
// gerçek şekilde bağlanacak).

import { Room, type Client } from "colyseus";
import { Okey101State } from "../state/Okey101State";
import { Okey101Player } from "../state/Okey101Player";
import { CLIENT_MESSAGES } from "../messages";

/** Odadaki 4 koltuk — basit/sıralı otomatik atama için kullanılır. */
const SEAT_ORDER = ["bottom", "top", "left", "right"] as const;

export class Okey101Room extends Room<{ state: Okey101State }> {
  maxClients = 4;

  onCreate(options: any) {
    this.setState(new Okey101State());

    this.state.roomId = (options && options.roomId) || this.roomId || "okey101-room";
    this.state.roomName = (options && options.roomName) || "Ahenk 101 Masası";
    this.state.phase = "waiting";

    console.log(`[Okey101Room] onCreate — roomId=${this.state.roomId} roomName=${this.state.roomName}`);

    // --- Mesaj handler'ları (İSKELET — Görev 14) -----------------------

    this.onMessage(CLIENT_MESSAGES.READY, (client) => {
      const player = this.state.players.get(client.sessionId);
      console.log(`[Okey101Room] READY <- ${client.sessionId}`);
      if (player) {
        player.isReady = true;
      }
    });

    this.onMessage(CLIENT_MESSAGES.SIT, (client, message) => {
      console.log(`[Okey101Room] SIT <- ${client.sessionId}`, message);
      const player = this.state.players.get(client.sessionId);
      const requestedSeat = message && typeof message.seat === "string" ? message.seat : undefined;
      if (player && requestedSeat) {
        player.seat = requestedSeat;
      }
    });

    this.onMessage(CLIENT_MESSAGES.LEAVE_SEAT, (client) => {
      console.log(`[Okey101Room] LEAVE_SEAT <- ${client.sessionId}`);
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.seat = "";
      }
    });

    this.onMessage(CLIENT_MESSAGES.START_GAME, (client) => {
      console.log(`[Okey101Room] START_GAME <- ${client.sessionId}`);
      // Gerçek oyun motoru henüz yok — sadece iskelet faz geçişi.
      this.state.phase = "playing";
    });

    this.onMessage(CLIENT_MESSAGES.GAME_COMMAND, (client, message) => {
      // Spesifikasyon gereği: SADECE logla, state DEĞİŞTİRME.
      console.debug(`[Okey101Room] GAME_COMMAND <- ${client.sessionId}`, message);
    });
  }

  onJoin(client: Client, options: any) {
    const usedSeats = new Set<string>();
    this.state.players.forEach((p) => {
      if (p.isConnected && p.seat) usedSeats.add(p.seat);
    });
    const freeSeat = SEAT_ORDER.find((seat) => !usedSeats.has(seat)) ?? "";

    const player = new Okey101Player();
    player.id = (options && options.id) || client.sessionId;
    player.name = (options && options.name) || "Oyuncu";
    player.city = (options && options.city) || "";
    player.seat = freeSeat;
    player.isReady = false;
    player.isConnected = true;
    player.voiceState = "idle";

    this.state.players.set(client.sessionId, player);

    console.log(
      `[Okey101Room] onJoin — sessionId=${client.sessionId} name=${player.name} seat=${player.seat} (players=${this.state.players.size})`
    );
  }

  onLeave(client: Client, code?: number) {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.isConnected = false;
    }
    console.log(`[Okey101Room] onLeave — sessionId=${client.sessionId} code=${code}`);
  }

  onDispose() {
    console.log(`[Okey101Room] onDispose — roomId=${this.state?.roomId}`);
  }
}
