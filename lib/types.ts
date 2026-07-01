export type Gender = "kadin" | "erkek" | "diger";
export type InteractionType = "ilginc" | "tanis" | "ortak" | "daha_fazla" | "gec";
export type MessageType = "text" | "voice" | "image";

export interface Profile {
  id: string;
  name: string;
  birthdate: string | null;
  gender: Gender | null;
  looking_for: Gender[] | null;
  city: string | null;
  lat: number | null;
  lon: number | null;
  profession: string | null;
  bio: string | null;
  interests: string[];
  hobbies: string[];
  music: string[];
  movies: string[];
  languages: string[];
  zodiac: string | null;
  smoking: "hayir" | "sosyal" | "evet" | null;
  pets: "yok" | "kedi" | "kopek" | "diger" | "seviyorum" | null;
  is_verified: boolean;
  is_admin: boolean;
  hidden_mode: boolean;
  premium_plan: "free" | "plus" | "gold" | "platinum";
  premium_until: string | null;
  boost_until: string | null;
  jeton: number;
  activity_score: number;
  behavior_score: number;
  onboarded: boolean;
  last_active: string;
}

export interface Photo {
  id: string;
  user_id: string;
  path: string;
  position: number;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  type: MessageType;
  body: string | null;
  media_path: string | null;
  created_at: string;
  read_at: string | null;
  orig_body?: string | null;
}

export interface MatchRow {
  id: string;
  user_a: string;
  user_b: string;
  reveal_level: number;
  created_at: string;
  last_message_at: string | null;
}
