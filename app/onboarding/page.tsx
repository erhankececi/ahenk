"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { EXAMS, SUBJECTS } from "@/lib/mock";
import { GraduationCap, Presentation, Compass, Check, Clock, ArrowRight } from "lucide-react";

type Role = "ogrenci" | "ogretmen" | "koc";

function OnboardingInner() {
  const router = useRouter();
  const supabase = createClient();
  const preset = useSearchParams().get("rol") as Role | null;
  const [role, setRole] = useState<Role | null>(preset && ["ogrenci", "ogretmen", "koc"].includes(preset) ? preset : null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // öğrenci
  const [exam, setExam] = useState("");
  const [grade, setGrade] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  // öğretmen / koç
  const [branch, setBranch] = useState("");
  const [years, setYears] = useState("");
  const [bio, setBio] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [pending, setPending] = useState(false);

  function toggle(arr: string[], set: (v: string[]) => void, val: string) {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  async function getUid(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return null; }
    return user.id;
  }

  async function saveStudent(): Promise<boolean> {
    setErr(""); setSaving(true);
    const uid = await getUid();
    if (!uid) { setSaving(false); return false; }
    const { error: e1 } = await supabase.from("profiles").update({ role: "student", onboarded: true }).eq("id", uid);
    const { error: e2 } = await supabase.from("student_profiles").upsert(
      { user_id: uid, exam_type: exam || null, grade_level: grade || null, subjects },
      { onConflict: "user_id" },
    );
    setSaving(false);
    if (e1 || e2) { setErr("Bilgiler kaydedilemedi, lütfen tekrar dene."); return false; }
    try { localStorage.setItem("ahenk_role", "ogrenci"); } catch {}
    return true;
  }

  async function saveApplicant(): Promise<boolean> {
    setErr(""); setSaving(true);
    const uid = await getUid();
    if (!uid) { setSaving(false); return false; }
    const isKoc = role === "koc";
    const { error: e1 } = await supabase.from("profiles").update({ role: isKoc ? "coach" : "teacher", onboarded: true }).eq("id", uid);
    const { error: e2 } = isKoc
      ? await supabase.from("coach_profiles").upsert({ user_id: uid, expertise: [branch, ...services].filter(Boolean), bio, status: "pending" }, { onConflict: "user_id" })
      : await supabase.from("teacher_profiles").upsert({ user_id: uid, branch, experience_years: years ? parseInt(years, 10) : null, bio, status: "pending" }, { onConflict: "user_id" });
    setSaving(false);
    if (e1 || e2) { setErr("Başvuru kaydedilemedi, lütfen tekrar dene."); return false; }
    try { localStorage.setItem("ahenk_role", isKoc ? "koc" : "ogretmen"); } catch {}
    return true;
  }

  // ---- ROL SEÇİMİ ----
  if (!role) {
    const roles = [
      { id: "ogrenci", icon: GraduationCap, t: "Öğrenci", d: "Canlı odalara katıl, soru sor, koçluk al" },
      { id: "ogretmen", icon: Presentation, t: "Öğretmen", d: "Canlı oda aç, soru çöz, gelir elde et" },
      { id: "koc", icon: Compass, t: "Koç", d: "Öğrencilere sınav stratejisi ve rehberlik ver" },
    ] as const;
    return (
      <Shell title="Seni nasıl tanıyalım?" desc="Devam etmek için rolünü seç.">
        <div className="space-y-3">
          {roles.map((r) => (
            <button key={r.id} onClick={() => { setRole(r.id); setStep(0); }} className="glass-card flex w-full items-center gap-4 rounded-2xl p-5 text-left transition hover:border-primary/40">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/12 text-primary"><r.icon size={24} /></span>
              <span className="flex-1">
                <span className="block font-bold">{r.t}</span>
                <span className="block text-sm text-muted">{r.d}</span>
              </span>
              <ArrowRight size={18} className="text-muted" />
            </button>
          ))}
        </div>
      </Shell>
    );
  }

  // ---- BAŞVURU BEKLEMEDE ----
  if (pending) {
    return (
      <Shell title="Başvurun alındı" desc="Ekibimiz başvurunu inceliyor.">
        <div className="glass-card rounded-2xl p-7 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/12 text-gold"><Clock size={30} /></span>
          <h3 className="mt-4 text-lg font-bold">Başvuru Beklemede</h3>
          <p className="mt-2 text-sm text-muted">
            {role === "koc" ? "Koçluk" : "Öğretmenlik"} başvurun değerlendirme aşamasında. Onaylandığında panelin tam aktifleşecek; o zamana kadar paneli önizleyebilirsin.
          </p>
          <Button size="lg" className="mt-6 w-full" onClick={() => router.push(role === "koc" ? "/koc" : "/ogretmen")}>
            Paneli Önizle <ArrowRight size={18} />
          </Button>
        </div>
      </Shell>
    );
  }

  // ---- ÖĞRENCİ AKIŞI ----
  if (role === "ogrenci") {
    return (
      <Shell title="Öğrenci profilin" desc={`Adım ${step + 1} / 3`} onBack={() => (step === 0 ? setRole(null) : setStep(step - 1))}>
        {step === 0 && (
          <Step title="Hangi sınava hazırlanıyorsun?">
            <Grid>{EXAMS.map((e) => <Pick key={e} active={exam === e} onClick={() => setExam(e)}>{e}</Pick>)}</Grid>
            <Next disabled={!exam} onClick={() => setStep(1)} />
          </Step>
        )}
        {step === 1 && (
          <Step title="Sınıf seviyen nedir?">
            <Grid>{["9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf", "Mezun", "Ortaokul"].map((g) => <Pick key={g} active={grade === g} onClick={() => setGrade(g)}>{g}</Pick>)}</Grid>
            <Next disabled={!grade} onClick={() => setStep(2)} />
          </Step>
        )}
        {step === 2 && (
          <Step title="İlgilendiğin dersler?">
            <Chips>{SUBJECTS.map((s) => <Chip key={s} active={subjects.includes(s)} onClick={() => toggle(subjects, setSubjects, s)}>{s}</Chip>)}</Chips>
            {err && <Err>{err}</Err>}
            <Button size="lg" className="mt-7 w-full" disabled={subjects.length === 0 || saving} onClick={async () => { if (await saveStudent()) router.push("/ogrenci"); }}>
              {saving ? "Kaydediliyor…" : <>Panele Git <ArrowRight size={18} /></>}
            </Button>
          </Step>
        )}
      </Shell>
    );
  }

  // ---- ÖĞRETMEN / KOÇ AKIŞI ----
  const isKoc = role === "koc";
  return (
    <Shell title={isKoc ? "Koç başvurusu" : "Öğretmen başvurusu"} desc="Birkaç bilgi ile başvurunu tamamla." onBack={() => setRole(null)}>
      <div className="space-y-4">
        <Labeled label={isKoc ? "Uzmanlık alanın" : "Branşın"}>
          <input value={branch} onChange={(e) => setBranch(e.target.value)} placeholder={isKoc ? "Örn. YKS Sınav Koçluğu" : "Örn. AYT Matematik"} className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-[15px] outline-none focus:border-primary/50" />
        </Labeled>
        {!isKoc ? (
          <Labeled label="Deneyim yılın">
            <input value={years} onChange={(e) => setYears(e.target.value)} type="number" min={0} placeholder="Örn. 8" className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-[15px] outline-none focus:border-primary/50" />
          </Labeled>
        ) : (
          <Labeled label="Hizmetlerin">
            <Chips>{["Deneme Analizi", "Çalışma Programı", "Rehberlik"].map((s) => <Chip key={s} active={services.includes(s)} onClick={() => toggle(services, setServices, s)}>{s}</Chip>)}</Chips>
          </Labeled>
        )}
        <Labeled label="Kısa profil açıklaması">
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Kendini ve yaklaşımını kısaca anlat…" className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-[15px] outline-none focus:border-primary/50" />
        </Labeled>
        {err && <Err>{err}</Err>}
        <Button size="lg" className="mt-2 w-full" disabled={!branch || saving} onClick={async () => { if (await saveApplicant()) setPending(true); }}>
          {saving ? "Gönderiliyor…" : <>Başvuruyu Gönder <ArrowRight size={18} /></>}
        </Button>
      </div>
    </Shell>
  );
}

/* ---------- yapı taşları ---------- */
function Shell({ title, desc, children, onBack }: { title: string; desc?: string; children: React.ReactNode; onBack?: () => void }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-8">
      <div className="mb-7 flex items-center justify-between">
        <Logo size={22} />
        {onBack && <button onClick={onBack} className="text-sm text-muted hover:text-text">Geri</button>}
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      {desc && <p className="mt-1 text-sm text-muted">{desc}</p>}
      <div className="mt-6 flex-1">{children}</div>
    </div>
  );
}
function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h2 className="mb-4 font-semibold">{title}</h2>{children}</div>;
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}
function Pick({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-xl border px-4 py-4 text-center font-semibold transition ${active ? "border-primary bg-primary/10 text-primary" : "border-line bg-surface text-text hover:border-white/20"}`}>
      {children}
    </button>
  );
}
function Chips({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1 rounded-full border px-3.5 py-2 text-sm transition ${active ? "border-primary bg-primary/10 text-primary" : "border-line bg-surface text-muted hover:text-text"}`}>
      {active && <Check size={13} />} {children}
    </button>
  );
}
function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="mb-2 text-sm font-medium text-muted">{label}</p>{children}</div>;
}
function Next({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return <Button size="lg" className="mt-7 w-full" disabled={disabled} onClick={onClick}>Devam Et <ArrowRight size={18} /></Button>;
}
function Err({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{children}</p>;
}

export default function Onboarding() {
  return <Suspense fallback={null}><OnboardingInner /></Suspense>;
}
