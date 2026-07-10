# Ahenk 101 — Game Server (Colyseus)

Bu klasör, Ahenk 101 (okey benzeri sosyal oyun) için **Colyseus tabanlı**,
bağımsız bir Node.js sunucu sürecidir. Next.js uygulamasından **ayrı**
çalışır — `next build`/`next dev` bu dosyaları derlemez/bundle etmez.

Bu, bir **İSKELET**tir: gerçek oyun motoru (deste oluşturma, dağıtım, taş
çekme/atma kuralları, meld doğrulama vb.) henüz burada YOK. Şu an sadece
oda/oyuncu yaşam döngüsü ve mesaj tipi altyapısı kurulmuştur. Gerçek
multiplayer entegrasyonu (client'ın bu sunucuya gerçekten bağlanması)
**GELECEKTE** yapılacak.

## Çalıştırma

```
bun run game101:dev
```

Port `GAME101_PORT` ortam değişkeninden okunur, verilmezse **2567**
kullanılır.

## Health check

```
GET /health  ->  { "ok": true, "service": "ahenk-101-game-server" }
```

## Room

Oda adı: **`okey101`** (bkz. `rooms/Okey101Room.ts`), `maxClients = 4`.
Oyuncu join olduğunda `state.players` içine eklenir (koltuk otomatik/basit
şekilde atanır); oyuncu ayrıldığında **silinmez**, sadece
`isConnected = false` yapılır.

## Mesajlar (`messages.ts`)

- Client -> Server: `READY`, `SIT`, `LEAVE_SEAT`, `START_GAME`,
  `GAME_COMMAND`
- Server -> Client: `ROOM_ERROR`, `GAME_EVENT`, `SYSTEM_MESSAGE`

`GAME_COMMAND` şu an sadece `console.debug` ile loglanır, state
değiştirmez. İleride `lib/game101/commands.ts` (Görev 13) içindeki
`OkeyGameCommand` yapısı buraya gerçek şekilde bağlanacak.

## State (`state/`)

`Okey101State`, `Okey101Player`, `Okey101Tile` — `@colyseus/schema`
`Schema` sınıflarıdır (TypeScript interface değil, `@type()` decorator'lı
senkronize-edilebilir state). `lib/game101/gameTypes.ts`'teki mock
tiplerle kavramsal olarak tutarlıdır ama BAĞIMSIZ tanımlanmıştır.
