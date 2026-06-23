import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaymentProvider } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const packageId = body.packageId || body.p_package_id;
  if (!packageId) return NextResponse.json({ error: "Paket seçilmedi." }, { status: 400 });

  const { data: order, error } = await supabase.rpc("create_coin_order", { p_package_id: packageId });
  if (error || !order) {
    return NextResponse.json({ error: error?.message || "Sipariş oluşturulamadı." }, { status: 400 });
  }

  const provider = getPaymentProvider();
  const checkout = await provider.startCheckout(order as any, { siteUrl: process.env.NEXT_PUBLIC_SITE_URL });

  return NextResponse.json({
    ok: true,
    orderId: (order as any).id,
    conversationId: checkout.conversationId,
    checkoutUrl: checkout.checkoutUrl,
    mock: checkout.mock,
  });
}
