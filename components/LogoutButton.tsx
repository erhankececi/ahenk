"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    try { localStorage.removeItem("ahenk_role"); } catch {}
    router.push("/login");
    router.refresh();
  }
  return (
    <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-xl border border-line py-3 text-sm font-medium text-danger transition hover:border-danger/40">
      <LogOut size={16} /> Çıkış Yap
    </button>
  );
}
