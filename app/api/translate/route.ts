import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Anlık çeviri. Ücretsiz başlangıç: kaynak dili otomatik algılar, 9 dile çevirir.
// Sağlayıcı sonradan Google/DeepL ile değiştirilebilir (TRANSLATE_PROVIDER).
const ALLOWED = ["tr", "en", "ku", "ar", "fa", "de", "fr", "es", "ru"];

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  const { text, target } = await req.json().catch(() => ({}));
  const t = (text || "").toString().slice(0, 2000);
  const tgt = ALLOWED.includes(target) ? target : "tr";
  if (!t.trim()) return NextResponse.json({ error: "bos" }, { status: 400 });

  try {
    const url =
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${tgt}&dt=t&q=` +
      encodeURIComponent(t);
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) throw new Error("provider");
    const data = await r.json();
    // data[0] = segment dizisi; her segment[0] = çeviri parçası. data[2] = algılanan kaynak dil.
    const translated = (data[0] || []).map((s: any) => s[0]).join("");
    const source = data[2] || null;
    if (!translated) throw new Error("empty");
    return NextResponse.json({ ok: true, text: translated, source });
  } catch {
    return NextResponse.json({ ok: false, error: "translate_failed" }, { status: 502 });
  }
}
