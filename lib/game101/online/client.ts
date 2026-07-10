// Ahenk 101 — Görev 14 (Faz 2): Colyseus client İSKELETİ.
//
// Bu dosya bir İSKELETTİR. Hiçbir mevcut route veya component tarafından
// KULLANILMIYOR — hiçbir yerden import edilmez, bundle'a girmez. Sadece
// ileride (bir sonraki görevde) gerçek online oda entegrasyonu yapılırken
// kullanılmak üzere hazırlanmış minimal bir client wrapper'dır.
//
// Karşı taraf: server/game101/index.ts — `gameServer.define("okey101", ...)`
// (Görev 14 / Faz 1). Room adı burada da BİREBİR "okey101" olarak kullanılır.
//
// NOT: "colyseus.js" (bu dosyada kullanılan TARAYICI/client SDK'sı),
// server tarafında kurulu olan "colyseus" paketinden FARKLI bir pakettir.

import { Client, type Room } from "colyseus.js";

/** Colyseus WebSocket sunucusunun varsayılan adresi (yerel geliştirme). */
const DEFAULT_GAME101_SERVER_URL = "ws://localhost:2567";

/** server/game101/index.ts içindeki `gameServer.define("okey101", ...)` ile BİREBİR eşleşmeli. */
const OKEY101_ROOM_NAME = "okey101";

/**
 * Colyseus.Client örneği oluşturur.
 *
 * @param endpoint WebSocket sunucu adresi. Verilmezse
 *   `NEXT_PUBLIC_GAME101_SERVER_URL` ortam değişkeni, o da yoksa
 *   `ws://localhost:2567` kullanılır.
 */
export function createOkey101Client(endpoint?: string): Client {
  const resolvedEndpoint =
    endpoint ?? process.env.NEXT_PUBLIC_GAME101_SERVER_URL ?? DEFAULT_GAME101_SERVER_URL;

  return new Client(resolvedEndpoint);
}

/**
 * "okey101" odasına katılır (yoksa oluşturur).
 *
 * @param client `createOkey101Client()` ile oluşturulmuş bir Colyseus.Client.
 * @param options `client.joinOrCreate` çağrısına aynen iletilir (ör. oyuncu adı/şehir).
 */
export async function joinOkey101Room(client: Client, options?: Record<string, unknown>): Promise<Room> {
  return client.joinOrCreate(OKEY101_ROOM_NAME, options);
}

/**
 * Katılınmış bir "okey101" odasından ayrılır.
 *
 * @param room `joinOkey101Room()` çağrısından dönen Colyseus.Room.
 */
export async function leaveOkey101Room(room: Room): Promise<void> {
  await room.leave();
}
