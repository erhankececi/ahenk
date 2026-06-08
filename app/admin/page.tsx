import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Users, Heart, Flag, Crown, Activity, TrendingUp, MessageSquare, ShieldAlert, BadgeCheck, Lightbulb, Banknote, Trash2, UserPlus, Globe, BarChart3 } from "lucide-react";
import AdminReportResolve from "@/components/admin/AdminReportResolve";
import AdminUserActions from "@/components/admin/AdminUserActions";
import AdminVerifyReview from "@/components/admin/AdminVerifyReview";
import AdminFeedbackResolve from "@/components/admin/AdminFeedbackResolve";
import AdminWithdrawAction from "@/components/admin/AdminWithdrawAction";
import AdminRestoreAction from "@/components/admin/AdminRestoreAction";

export const dynamic = "force-dynamic";

// Basit CSS bar grafiği (server-render; etkileşim yok)
function Bars({ data, color = "bg-accent" }: { data: { label: string; n: number }[]; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.n));
  return (
    <div className="flex h-24 items-end gap-px">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center justify-end" title={`${d.label}: ${d.n}`}>
          <div className={`w-full rounded-t ${color}`} style={{ height: `${(d.n / max) * 100}%`, minHeight: d.n ? 3 : 0 }} />
        </div>
      ))}
    </div>
  );
}

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
    { data: withdrawals },
    { data: deletedAccounts },
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
    admin.from("withdrawals").select("id,user_id,jeton,amount_try,iban,full_name,created_at").eq("status", "pending").order("created_at", { ascending: true }).limit(30),
    admin.from("profiles").select("id,name,city,deleted_at").not("deleted_at", "is", null).order("deleted_at", { ascending: false }).limit(50),
  ]);

  // --- Üye & Trafik analitiği ---
  const nowMs = Date.now();
  const D = 24 * 3600 * 1000;
  const isoT = (ms: number) => new Date(ms).toISOString();
  const [
    { count: newToday }, { count: new7d }, { count: new30d },
    { count: wau }, { count: mau }, { count: referredCount },
    { count: vToday }, { count: v7d }, { count: v30d }, { count: vTotal },
    { data: signupRows }, { data: visitRows },
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }).gt("created_at", isoT(nowMs - D)),
    admin.from("profiles").select("*", { count: "exact", head: true }).gt("created_at", isoT(nowMs - 7 * D)),
    admin.from("profiles").select("*", { count: "exact", head: true }).gt("created_at", isoT(nowMs - 30 * D)),
    admin.from("profiles").select("*", { count: "exact", head: true }).gt("last_active", isoT(nowMs - 7 * D)),
    admin.from("profiles").select("*", { count: "exact", head: true }).gt("last_active", isoT(nowMs - 30 * D)),
    admin.from("profiles").select("*", { count: "exact", head: true }).not("referred_by", "is", null),
    admin.from("site_visits").select("*", { count: "exact", head: true }).gt("created_at", isoT(nowMs - D)),
    admin.from("site_visits").select("*", { count: "exact", head: true }).gt("created_at", isoT(nowMs - 7 * D)),
    admin.from("site_visits").select("*", { count: "exact", head: true }).gt("created_at", isoT(nowMs - 30 * D)),
    admin.from("site_visits").select("*", { count: "exact", head: true }),
    admin.from("profiles").select("created_at").gt("created_at", isoT(nowMs - 30 * D)).limit(100000),
    admin.from("site_visits").select("created_at").gt("created_at", isoT(nowMs - 30 * D)).limit(200000),
  ]);

  const dailyT = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(nowMs - (29 - i) * D);
    return { key: d.toISOString().slice(0, 10), label: d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" }), n: 0 };
  });
  const hourlyT = Array.from({ length: 24 }, (_, i) => ({ label: `${i}`, n: 0 }));
  const di = new Map(dailyT.map((d, i) => [d.key, i]));
  const signupDaily = dailyT.map((d) => ({ ...d }));
  const signupHourly = hourlyT.map((h) => ({ ...h }));
  const visitDaily = dailyT.map((d) => ({ ...d, n: 0 }));
  (signupRows || []).forEach((r: any) => {
    const dk = new Date(r.created_at).toISOString().slice(0, 10);
    if (di.has(dk)) signupDaily[di.get(dk)!].n++;
    if (new Date(r.created_at).getTime() > nowMs - D) signupHourly[new Date(r.created_at).getHours()].n++;
  });
  (visitRows || []).forEach((r: any) => {
    const dk = new Date(r.created_at).toISOString().slice(0, 10);
    if (di.has(dk)) visitDaily[di.get(dk)!].n++;
  });

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

  // Moderasyon kuyruğundaki hesapların bilgisi (isim + aksiyon için).
  const modIds = Array.from(new Set((modQueue || []).map((m) => m.user_id).filter(Boolean)));
  const modInfo = new Map<string, any>();
  if (modIds.length) {
    const { data: mp } = await admin.from("profiles").select("id,name,is_verified,banned").in("id", modIds as string[]);
    (mp || []).forEach((p: any) => modInfo.set(p.id, p));
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

      {/* Üyeler & Trafik */}
      <h2 className="mb-2 flex items-center gap-2 font-semibold">
        <BarChart3 size={18} className="text-accent" /> Üyeler & Trafik
      </h2>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: UserPlus, label: "Bugün katılan", value: newToday ?? 0 },
          { icon: UserPlus, label: "Bu hafta", value: new7d ?? 0 },
          { icon: UserPlus, label: "Bu ay", value: new30d ?? 0 },
          { icon: Users, label: "Toplam üye", value: users ?? 0 },
          { icon: Globe, label: "Bugün siteye giren", value: vToday ?? 0 },
          { icon: Globe, label: "Bu hafta ziyaret", value: v7d ?? 0 },
          { icon: Globe, label: "Bu ay ziyaret", value: v30d ?? 0 },
          { icon: Globe, label: "Toplam ziyaret", value: vTotal ?? 0 },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface p-3">
            <s.icon className="mb-1.5 text-accent" size={17} />
            <p className="text-xl font-bold">{(s.value as number).toLocaleString("tr-TR")}</p>
            <p className="text-[11px] text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-3 grid grid-cols-3 gap-3">
        {[
          { label: "Aktif (24s)", value: dau ?? 0 },
          { label: "Aktif (7g)", value: wau ?? 0 },
          { label: "Aktif (30g)", value: mau ?? 0 },
        ].map((a) => (
          <div key={a.label} className="rounded-2xl border border-border bg-surface p-3 text-center">
            <p className="text-lg font-bold">{(a.value as number).toLocaleString("tr-TR")}</p>
            <p className="text-[11px] text-muted">{a.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-3 rounded-2xl border border-border bg-surface p-3">
        <p className="mb-2 text-xs text-muted">Üye katılımı — son 30 gün</p>
        <Bars data={signupDaily} color="bg-accent" />
      </div>
      <div className="mb-3 rounded-2xl border border-border bg-surface p-3">
        <p className="mb-2 text-xs text-muted">Site ziyaretleri — son 30 gün</p>
        <Bars data={visitDaily} color="bg-brand" />
      </div>
      <div className="mb-3 rounded-2xl border border-border bg-surface p-3">
        <p className="mb-2 text-xs text-muted">Bugünkü katılım — saatlik (0–23)</p>
        <Bars data={signupHourly} color="bg-accent" />
      </div>
      <div className="mb-6 rounded-2xl border border-border bg-surface p-4">
        <p className="mb-2 text-xs text-muted">Üye kaynağı</p>
        <div className="flex items-center justify-around text-center">
          <div><p className="text-xl font-bold">{((users ?? 0) - (referredCount ?? 0)).toLocaleString("tr-TR")}</p><p className="text-xs text-muted">Organik</p></div>
          <div><p className="text-xl font-bold text-accent">{(referredCount ?? 0).toLocaleString("tr-TR")}</p><p className="text-xs text-muted">Davetle gelen</p></div>
          <div><p className="text-xl font-bold">%{users ? Math.round(((referredCount ?? 0) / users) * 100) : 0}</p><p className="text-xs text-muted">Davet oranı</p></div>
        </div>
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
        {(modQueue || []).map((m) => {
          const u = modInfo.get(m.user_id);
          return (
            <div key={m.id} className="rounded-2xl border border-border bg-surface p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">
                  {u?.name || "Şüpheli hesap"}
                  {u?.banned && <span className="ml-1 text-xs text-error">(yasaklı)</span>}
                </span>
                <span className="shrink-0 rounded-full bg-elevated px-2 py-0.5 text-xs">risk {m.risk_score ?? "-"}</span>
              </div>
              {Array.isArray(m.reasons) && m.reasons.length > 0 && (
                <p className="mt-1 text-muted">{(m.reasons as string[]).join(", ")}</p>
              )}
              {u && (
                <div className="mt-2 flex justify-end">
                  <AdminUserActions userId={m.user_id} verified={!!u.is_verified} banned={!!u.banned} />
                </div>
              )}
            </div>
          );
        })}
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

      <h2 className="mb-2 flex items-center gap-2 font-semibold">
        <Banknote size={18} className="text-success" /> Para çekme talepleri
        {(withdrawals || []).length > 0 && (
          <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs text-success">
            {(withdrawals || []).length}
          </span>
        )}
      </h2>
      <div className="mb-6 space-y-2">
        {(withdrawals || []).length === 0 && (
          <p className="text-sm text-muted">Bekleyen para çekme talebi yok.</p>
        )}
        {(withdrawals || []).map((w: any) => (
          <div key={w.id} className="rounded-2xl border border-border bg-surface p-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-success">
                  ₺{w.amount_try} <span className="text-muted">· {w.jeton} jeton</span>
                </p>
                <p className="truncate">{w.full_name}</p>
                <p className="select-all break-all font-mono text-xs text-muted">{w.iban}</p>
                <p className="t-caption mt-0.5 text-muted">
                  {new Date(w.created_at).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <AdminWithdrawAction withdrawId={w.id} />
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-2 flex items-center gap-2 font-semibold">
        <Trash2 size={18} className="text-warning" /> Silinen Hesaplar
        {(deletedAccounts || []).length > 0 && (
          <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs text-warning">
            {(deletedAccounts || []).length}
          </span>
        )}
      </h2>
      <div className="mb-6 space-y-2">
        {(deletedAccounts || []).length === 0 && (
          <p className="text-sm text-muted">Silinmiş hesap yok.</p>
        )}
        {(deletedAccounts || []).map((u: any) => (
          <div key={u.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium">{u.name || "İsimsiz"}</p>
              <p className="t-caption text-muted">
                {u.city || "—"} · silindi:{" "}
                {new Date(u.deleted_at).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <AdminRestoreAction userId={u.id} />
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
