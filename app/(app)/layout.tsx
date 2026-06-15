import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";
import SideNav from "@/components/desktop/SideNav";
import CallProvider from "@/components/call/CallProvider";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded, banned, deleted_at")
    .eq("id", user.id)
    .single();
  if (profile?.deleted_at) redirect("/hesap-silindi");
  if (profile?.banned) redirect("/askida");
  if (!profile?.onboarded) redirect("/onboarding");

  return (
    <CallProvider>
      <div className="ahenk-app-shell flex w-full justify-center">
        <SideNav />
        <main className="ahenk-app-main mx-auto min-h-dvh w-full flex-1 pb-24 lg:pb-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </CallProvider>
  );
}
