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
      {/* Responsive kabuk: mobil tek kolon + alt nav; desktop ince ikon rayı + ortalı 720px içerik */}
      <div className="flex w-full justify-center">
        <SideNav />
        <main className="mx-auto min-h-dvh w-full max-w-[720px] flex-1 pb-24 lg:border-x lg:border-border lg:pb-10">
          {children}
        </main>
      </div>
      <BottomNav />
    </CallProvider>
  );
}
