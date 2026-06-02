import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";
import CallProvider from "@/components/call/CallProvider";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded, banned")
    .eq("id", user.id)
    .single();
  if (profile?.banned) redirect("/askida");
  if (!profile?.onboarded) redirect("/onboarding");

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-20">
      <CallProvider>{children}</CallProvider>
      <BottomNav />
    </div>
  );
}
