import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("coin_packages")
    .select("id, name, coins, price_try, bonus_coins, badge, sort_order")
    .eq("active", true)
    .order("sort_order");
  if (error) return NextResponse.json({ error: "Paketler alınamadı." }, { status: 500 });
  return NextResponse.json({ packages: data || [] });
}
