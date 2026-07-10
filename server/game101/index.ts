// Ahenk 101 — Görev 14 (Faz 1): Colyseus game server giriş noktası.
//
// Express + Colyseus (WebSocketTransport) aynı HTTP sunucusunu paylaşır:
// `createServer(app)` ile oluşturulan http.Server, hem bizim Express
// route'larımızı (ör. /health) hem de Colyseus'un matchmake/WS upgrade
// trafiğini aynı portta karşılar (node_modules/@colyseus/ws-transport ve
// @colyseus/core kaynak kodu okunarak doğrulanmış kurulum kalıbı — bkz.
// server/game101/README.md).
//
// Çalıştırma: bun run game101:dev  (package.json -> "tsx server/game101/index.ts")

import { createServer } from "node:http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { Okey101Room } from "./rooms/Okey101Room";

const PORT = Number(process.env.GAME101_PORT) || 2567;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "ahenk-101-game-server" });
});

const httpServer = createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer }),
});

gameServer.define("okey101", Okey101Room);

gameServer.listen(PORT).then(() => {
  console.log(`[game101] Ahenk 101 Colyseus server listening on port ${PORT}`);
  console.log(`[game101] health check: http://localhost:${PORT}/health`);
  console.log(`[game101] room: "okey101" (maxClients=4)`);
});
