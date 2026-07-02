// 101 Okey prototip — mock masa/oda listesi.
// Gerçek backend/game server yok; yalnızca routing ve UI akışı için kullanılır.

export interface Room {
  id: string;
  name: string;
  /** Masa tipi: hızlı, sesli, arkadaş, premium, yeni başlayan vb. */
  tableType: string;
  city: string;
  isVoice: boolean;
  isPremium: boolean;
  /** 1-4 arası dolu koltuk sayısı (mock). */
  playerCount: number;
}

export const MOCK_ROOMS: Room[] = [
  {
    id: "platinum-lounge",
    name: "Platinum Lounge",
    tableType: "Premium Masa",
    city: "İstanbul",
    isVoice: true,
    isPremium: true,
    playerCount: 3,
  },
  {
    id: "van-gecesi",
    name: "Van Gecesi",
    tableType: "Arkadaş Masası",
    city: "Van",
    isVoice: false,
    isPremium: false,
    playerCount: 2,
  },
  {
    id: "sesli-muhabbet",
    name: "Sesli Muhabbet",
    tableType: "Sesli Masa",
    city: "Ankara",
    isVoice: true,
    isPremium: false,
    playerCount: 4,
  },
  {
    id: "premium-salon",
    name: "Premium Salon",
    tableType: "Premium Masa",
    city: "İzmir",
    isVoice: true,
    isPremium: true,
    playerCount: 1,
  },
  {
    id: "yeni-baslayanlar",
    name: "Yeni Başlayanlar",
    tableType: "Hızlı Masa",
    city: "Bursa",
    isVoice: false,
    isPremium: false,
    playerCount: 2,
  },
  {
    id: "arkadas-masasi",
    name: "Arkadaş Masası",
    tableType: "Arkadaş Masası",
    city: "Antalya",
    isVoice: false,
    isPremium: false,
    playerCount: 3,
  },
];

const DEFAULT_ROOM: Room = {
  id: "misafir-masasi",
  name: "Misafir Masası",
  tableType: "Hızlı Masa",
  city: "İstanbul",
  isVoice: false,
  isPremium: false,
  playerCount: 1,
};

/** roomId'ye göre mock oda bilgisini bulur; bulunamazsa makul bir varsayılan döner (notFound() atmaz — prototip). */
export function getRoomById(roomId: string): Room {
  const found = MOCK_ROOMS.find((r) => r.id === roomId);
  if (found) return found;
  return { ...DEFAULT_ROOM, id: roomId, name: DEFAULT_ROOM.name };
}
