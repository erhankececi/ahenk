// Ahenk — başarı/rozet tanımları. Mevcut verilerden hesaplanır (migration yok).
export type Badge = {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  need: number;
  stat: string;
};

export const BADGES: Badge[] = [
  { id: "first_match", label: "İlk Eşleşme", emoji: "💘", desc: "İlk eşleşmeni yap", need: 1, stat: "matches" },
  { id: "first_msg", label: "İlk Mesaj", emoji: "✉️", desc: "İlk mesajını gönder", need: 1, stat: "messages" },
  { id: "msg_100", label: "Sohbet Ustası", emoji: "💬", desc: "100 mesaj gönder", need: 100, stat: "messages" },
  { id: "first_voice", label: "İlk Ses", emoji: "📞", desc: "İlk sesli görüşme", need: 1, stat: "voiceCalls" },
  { id: "first_video", label: "İlk Görüntü", emoji: "🎥", desc: "İlk görüntülü görüşme", need: 1, stat: "videoCalls" },
  { id: "first_event", label: "Etkinlikçi", emoji: "🎉", desc: "İlk etkinliğe katıl", need: 1, stat: "eventsJoined" },
  { id: "event_leader", label: "Etkinlik Lideri", emoji: "🏆", desc: "3 etkinlik düzenle", need: 3, stat: "eventsHosted" },
  { id: "first_gift", label: "Cömert", emoji: "🎁", desc: "İlk hediyeni gönder", need: 1, stat: "giftsSent" },
  { id: "streak_7", label: "7 Gün Seri", emoji: "🔥", desc: "7 gün üst üste gir", need: 7, stat: "streak" },
  { id: "streak_30", label: "30 Gün Seri", emoji: "⭐", desc: "30 gün üst üste gir", need: 30, stat: "streak" },
  { id: "community", label: "Topluluk Lideri", emoji: "👑", desc: "5 kişi davet et", need: 5, stat: "invited" },
];
