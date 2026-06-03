import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";
import SideNav from "@/components/desktop/SideNav";
import RightRail from "@/components/desktop/RightRail";
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
      {/* Responsive kabuk: mobil tek kolon + alt nav; desktop 3 kolon (sol nav / içerik / sağ panel) */}
      <div className="mx-auto flex w-full max-w-[1280px] justify-center">
        <SideNav />
        <main className="min-h-dvh w-full max-w-[620px] flex-1 pb-24 lg:border-x lg:border-border lg:pb-10">
          {children}
        </main>
        <RightRail />
      </div>
      <BottomNav />
    </CallProvider>
  );
}
