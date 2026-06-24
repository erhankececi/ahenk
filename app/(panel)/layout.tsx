"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { Logo } from "@/components/Logo";
import { JetonPill } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { STUDENT_NAV, TEACHER_NAV, type NavItem } from "@/lib/nav";

const TEACHER_ONLY = ["/ogretmen", "/koc", "/gelen-sorular", "/odalarim"];
const STUDENT_ONLY = ["/ogrenci", "/soru-sor", "/sorularim"];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<"ogrenci" | "ogretmen" | "koc">("ogrenci");
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const r = localStorage.getItem("ahenk_role");
    if (r === "ogretmen" || r === "koc") setRole(r);
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ count }, { data: prof }] = await Promise.all([
        supabase.from("notifications").select("*", { count: "exact", head: true }).is("read_at", null),
        supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
      ]);
      setUnread(count ?? 0);

      // Nav rolünü DB ile eşitle (localStorage eski/eksikse düzeltir)
      const dbRole = prof?.role;
      if (dbRole === "teacher") setRole("ogretmen");
      else if (dbRole === "coach") setRole("koc");
      else if (dbRole === "student") setRole("ogrenci");

      // Basit rol yönlendirmesi — RLS/RPC güvenliğini değiştirmez, sadece UX.
      const onTeacherOnly = TEACHER_ONLY.some((p) => path === p || path.startsWith(p + "/"));
      const onStudentOnly = STUDENT_ONLY.some((p) => path === p || path.startsWith(p + "/"));
      if (dbRole === "student" && onTeacherOnly) router.replace("/ogrenci");
      else if ((dbRole === "teacher" || dbRole === "coach") && onStudentOnly) router.replace(dbRole === "coach" ? "/koc" : "/ogretmen");
    })();
  }, [path]);

  const nav: NavItem[] = role === "ogretmen" ? TEACHER_NAV : STUDENT_NAV;
  const homeHref = role === "ogretmen" ? "/ogretmen" : role === "koc" ? "/koc" : "/ogrenci";

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-md pb-28">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line glass px-4 py-3">
        <Link href={homeHref} aria-label="Ahenk Live">
          <Logo size={22} />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/bildirimler" aria-label="Bildirimler" className="relative text-muted transition hover:text-text">
            <Bell size={21} strokeWidth={1.8} />
            {unread > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-bg">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
          <JetonPill amount={1250} />
        </div>
      </header>

      <main className="px-4 pt-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md px-4 pb-[calc(env(safe-area-inset-bottom)+10px)]">
        <div className="glass flex items-end justify-around rounded-2xl px-2 py-2.5 shadow-card">
          {nav.map((item, idx) => {
            const Icon = item.icon;
            const active = path === item.href;
            if (item.center) {
              return (
                <Link key={idx} href={item.href} className="flex flex-1 flex-col items-center">
                  <span className="btn-primary -mt-7 flex h-14 w-14 items-center justify-center rounded-2xl">
                    <Icon size={24} />
                  </span>
                  <span className="mt-1 text-[10px] font-medium text-muted">{item.label}</span>
                </Link>
              );
            }
            return (
              <Link
                key={idx}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-1 py-1 text-[10.5px] font-medium transition ${active ? "text-primary" : "text-muted hover:text-text"}`}
              >
                <Icon size={20} strokeWidth={active ? 2.3 : 1.8} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
