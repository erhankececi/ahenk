import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Users, Heart, Flag, Crown, Activity, TrendingUp, MessageSquare, ShieldAlert, BadgeCheck, Lightbulb } from "lucide-react";
import AdminReportResolve from "@/components/admin/AdminReportResolve";
import AdminUserActions from "@/components/admin/AdminUserActions";
import AdminVerifyReview from "@/components/admin/AdminVerifyReview";
import AdminFeedbackResolve from "@/components/admin/AdminFeedbackResolve";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!me?.is_admin) redirect("/kesfet");

  // service role ile tüm verilere eriş
  const admin = createAdminClient();
  const dayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const weekAgo = new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString();

  const [
    { count: users },
    { count: matches },
    { data: reports },
    { data: recent },
    { count: premium },
    { count: dau },
    { count: interactions },
    { count: messages },
    { count: churned },
    { data: modQueue },
    { data: verifs },
    { data: feedback },
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("matches").select("*", { count: "exact", head: true }),
    admin.from("reports").select("*").order("created_at", { ascending: false }).limit(20),
    admin.from("profiles").select("id,name,city,behavior_score,is_verified,banned,created_at").order("created_at", { ascending: false }).limit(15),
    admin.from("profiles").select("*", { count: "exact", head: true }).neq("premium_plan", "free"),
    admin.from("profiles").select("*", { count: "exact", head: true }).gt("last_active", dayAgo),
    admin.from("interactions").select("*", { count: "exact", head: true }).neq("type", "gec"),
    admin.from("messages").select("*", { count: "exact", head: true }),
    admin.from("profiles").select("*", { count: "exact", head: true }).lt("last_active", weekAgo),
    admin.from("moderation_queue").select("*").eq("status", "acik").order("created_at", { ascending: false }).limit(10),
    admin.from("profiles").select("id,name,verification_path").eq("verification_status", "pending").limit(15),
    admin.from("feedback").select("id,message,created_at,user_id").eq("handled", false).order("created_at", { ascending: false }).limit(20),
  ]);

  // Doğrulama selfie'leri private 'photos' kovasında → admin için imzalı URL.
  const pendingVerifs = await Promise.all(
    (verifs || []).map(async (v) => ({
      id: v.id as string,
      name: v.name as string,
      url: v.verification_path
        ? (await admin.storage.from("photos").createSignedUrl(v.verification_path as string, 600)).data?.signedUrl || null
        : null,
    }))
  );

  // Öneri sahiplerinin adları.
  const fbIds = Array.from(new Set((feedback || []).map((f) => f.user_id).filter(Boolean)));
  const fbNames = new Map<string, string>();
  if (fbIds.length) {
    const { data: fbProfs } = await admin.from("profiles_card").select("id,name").in("id", fbIds as string[]);
    (fbProfs || []).forEach((p: any) => fbNames.set(p.id, p.name));
  }

  const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

  const stats = [
    { icon: Users, label: "Kullanıcı", value: users ?? 0 },
    { icon: Heart, label: "Eşleşme", value: matches ?? 0 },
    { icon: Flag, label: "Açık şikayet", value: (reports || []).filter((r) => r.status === "acik").length },
    { icon: Crown, label: "Premium", value: premium ?? 0 },
  ];

  const analytics = [
    { icon: Activity, label: "Günlük aktif (DAU)", value: `${dau ?? 0}` },
    { icon: TrendingUp, label: "Eşleşme dönüşümü", value: `%${pct(matches ?? 0, interactions ?? 0)}` },
    { icon: Crown, label: "Premium dönüşümü", value: `%${pct(premium ?? 0, users ?? 0)}` },
    { icon: Activity, label: "Kayıp oranı (churn)", value: `%${pct(churned ?? 0, users ?? 0)}` },
    { icon: MessageSquare, label: "Eşleşme başına mesaj", value: matches ? (Math.round(((messages ?? 0) / matches) * 10) / 10).toString() : "0" },
    { icon: MessageSquare, label: "Toplam mesaj", value: `${messages ?? 0}` },
  ];

  return (
    <div className="px-4 pb-10 pt-6">
      <h1 className="mb-5 text-2xl font-bold brand-text">Admin Paneli</h1>

      <div className="mb-6 grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface p-4">
            <s.icon className="mb-2 text-brand" size={20} />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-2 font-semibold">Analitik</h2>
      <div className="mb-6 grid grid-cols-2 gap-3">
        {analytics.map((a) => (
          <div key={a.label} className="rounded-2xl border border-border bg-surface p-4">
            <a.icon className="mb-2 text-brand-2" size={18} />
            <p className="text-xl font-bold">{a.value}</p>
            <p className="text-xs text-muted">{a.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-2 flex items-center gap-2 font-semibold">
        <BadgeCheck size={18} className="text-brand" /> Doğrulama istekleri
      </h2>
      <div className="mb-6 space-y-2">
        {pendingVerifs.length === 0 && (
          <p className="text-sm text-muted">Bekleyen doğrulama yok.</p>
        )}
        {pendingVerifs.map((v) => (
          <div key={v.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
            {v.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={v.url} alt="selfie" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
            ) : (
              <div className="h-14 w-14 shrink-0 rounded-xl bg-elevated" />
            )}
            <p className="flex-1 truncate text-sm font-medium">{v.name}</p>
            <AdminVerifyReview userId={v.id} />
          </div>
        ))}
      </div>

      <h2 className="mb-2 flex items-center gap-2 font-semibold">
        <ShieldAlert size={18} className="text-brand-2" /> Moderasyon kuyruğu
      </h2>
      <div className="mb-6 space-y-2">
        {(modQueue || []).length === 0 && (
          <p className="text-sm text-muted">Bekleyen moderasyon kaydı yok.</p>
        )}
        {(modQueue || []).map((m) => (
          <div key={m.id} className="rounded-2xl border border-border bg-surface p-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Şüpheli hesap</span>
              <span className="rounded-full bg-elevated px-2 py-0.5 text-xs">risk {m.risk_score ?? "-"}</span>
            </div>
            {Array.isArray(m.reasons) && m.reasons.length > 0 && (
              <p className="mt-1 text-muted">{(m.reasons as string[]).join(", ")}</p>
            )}
          </div>
        ))}
      </div>

      <h2 className="mb-2 font-semibold">Son şikayetler</h2>
      <div className="mb-6 space-y-2">
        {(reports || []).length === 0 && <p className="text-sm text-muted">Şikayet yok.</p>}
        {(reports || []).map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-surface p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{r.reason}</span>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-elevated px-2 py-0.5 text-xs">{r.status}</span>
                <AdminReportResolve reportId={r.id} status={r.status} />
              </div>
            </div>
            {r.details && <p className="mt-1 text-muted">{r.details}</p>}
          </div>
        ))}
      </div>

      <h2 className="mb-2 flex items-center gap-2 font-semibold">
        <Lightbulb size={18} className="text-accent" /> Öneriler & geri bildirim
      </h2>
      <div className="mb-6 space-y-2">
        {(feedback || []).length === 0 && <p className="text-sm text-muted">Henüz öneri yok.</p>}
        {(feedback || []).map((f) => (
          <div key={f.id} className="rounded-2xl border border-border bg-surface p-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="flex-1 whitespace-pre-wrap">{f.message}</p>
              <AdminFeedbackResolve feedbackId={f.id} />
            </div>
            <p className="t-caption mt-1 text-muted">
              {f.user_id ? fbNames.get(f.user_id) || "Bir kullanıcı" : "Silinmiş kullanıcı"} ·{" "}
              {new Date(f.created_at).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mb-2 font-semibold">Son kullanıcılar</h2>
      <div className="space-y-2">
        {(recent || []).map((u) => (
          <div key={u.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium">
                {u.name}
                {u.banned && <span className="ml-1.5 text-xs text-error">(yasaklı)</span>}
              </p>
              <p className="truncate text-muted">
                {u.city} · puan {u.behavior_score}
              </p>
            </div>
            <AdminUserActions userId={u.id} verified={u.is_verified} banned={!!u.banned} />
          </div>
        ))}
      </div>
    </div>
  );
}
