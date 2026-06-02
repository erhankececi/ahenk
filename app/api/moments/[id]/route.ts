import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isPremiumPlus } from "@/lib/constants";

// deleteMoment
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  await supabase.from("moments").delete().eq("id", params.id).eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}

// getMomentAnalytics (Premium Plus): görüntüleme/tepki + kim gördü
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  const { data: moment } = await supabase
    .from("moments")
    .select("user_id")
    .eq("id", params.id)
    .single();
  if (!moment || moment.user_id !== user.id)
    return NextResponse.json({ error: "yetkisiz" }, { status: 403 });

  const { data: me } = await supabase
    .from("profiles")
    .select("premium_plan")
    .eq("id", user.id)
    .single();

  const { count: views } = await supabase
    .from("moment_views")
    .select("*", { count: "exact", head: true })
    .eq("moment_id", params.id);
  const { count: reactions } = await supabase
    .from("moment_reactions")
    .select("*", { count: "exact", head: true })
    .eq("moment_id", params.id);

  // kim gördü -> sadece Premium Plus
  let viewers: string[] = [];
  if (isPremiumPlus(me?.premium_plan)) {
    const { data: vs } = await supabase
      .from("moment_views")
      .select("viewer_id")
      .eq("moment_id", params.id)
      .limit(50);
    const ids = (vs || []).map((v) => v.viewer_id);
    const { data: profs } = await supabase
      .from("profiles_card")
      .select("name")
      .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    viewers = (profs || []).map((p) => p.name);
  }

  return NextResponse.json({
    views: views ?? 0,
    reactions: reactions ?? 0,
    viewers,
    premiumPlus: isPremiumPlus(me?.premium_plan),
  });
}
