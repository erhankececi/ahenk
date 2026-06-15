"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Chip } from "@/components/ui";
import {
  INTERESTS, ZODIAC, LANGUAGES, CITY_NAMES, CITIES,
  SMOKING_OPTS, DRINKING_OPTS, PETS_OPTS, GOAL_OPTS, KIDS_OPTS, EXERCISE_OPTS,
} from "@/lib/constants";
import { profilOnerileri } from "@/lib/aiProfile";
import { yas, adSoyadGecerli } from "@/lib/utils";
import { ImagePlus, X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

export default function Onboarding() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(0);
  const [uid, setUid] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<any>({
    name: "",
    birthdate: "",
    gender: "kadin",
    looking_for: ["erkek"],
    city: "İstanbul",
    profession: "",
    bio: "",
    interests: [] as string[],
    hobbies: [] as string[],
    languages: ["Türkçe"] as string[],
    zodiac: "",
    smoking: "hayir",
    pets: "yok",
    drinking: "sosyal",
    relationship_goal: "ciddi",
    wants_kids: "belki",
    exercise: "bazen",
  });
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUid(user.id);
      const [{ data: p }, { count: photoCount }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("photos").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      if (!p) { setForm((f: any) => ({ ...f, name: user.user_metadata?.name || "" })); return; }
      // Mevcut alanları doldur (düzenlemede sıfırdan başlama)
      setForm((f: any) => ({
        ...f,
        name: p.name || user.user_metadata?.name || "",
        birthdate: p.birthdate || "",
        gender: p.gender || f.gender,
        looking_for: p.looking_for?.length ? p.looking_for : f.looking_for,
        city: p.city || f.city,
        profession: p.profession || "",
        bio: p.bio || "",
        interests: p.interests || [],
        hobbies: p.hobbies || [],
        languages: p.languages?.length ? p.languages : f.languages,
        zodiac: p.zodiac || "",
        smoking: p.smoking || f.smoking,
        pets: p.pets || f.pets,
        drinking: p.drinking || f.drinking,
        relationship_goal: p.relationship_goal || f.relationship_goal,
        wants_kids: p.wants_kids || f.wants_kids,
        exercise: p.exercise || f.exercise,
      }));
      // Zaten onboarded ise (düzenleme) → İLK EKSİK adıma götür
      if (p.onboarded) {
        const nameOk = !!p.name && !!p.birthdate;
        const interestsOk = (p.interests?.length || 0) > 0;
        const photoOk = (photoCount || 0) > 0;
        setStep(!nameOk ? 0 : !interestsOk ? 2 : !photoOk ? 3 : 0);
      }
    })();
  }, []);

  // Orijinali ifşa etmeyen, küçük + bulanık PUBLIC önizleme üretir (canvas).
  async function bulanikOnizleme(file: File): Promise<Blob | null> {
    try {
      const bitmap = await createImageBitmap(file);
      const W = 32;
      const H = Math.max(1, Math.round((bitmap.height / bitmap.width) * W));
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.filter = "blur(2px)";
      ctx.drawImage(bitmap, 0, 0, W, H);
      return await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.5)
      );
    } catch {
      return null;
    }
  }

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const toggle = (k: string, v: string) =>
    setForm((f: any) => {
      const arr = f[k] as string[];
      return { ...f, [k]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] };
    });

  async function kaydet() {
    setSaving(true);
    const [lat, lon] = CITIES[form.city] || [null, null];

    await supabase
      .from("profiles")
      .update({ ...form, lat, lon, onboarded: true, last_active: new Date().toISOString() })
      .eq("id", uid);

    // fotoğrafları yükle: orijinal -> private 'photos', bulanık -> public 'previews'
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop();
      const base = crypto.randomUUID();
      const path = `${uid}/${base}.${ext}`;
      const { error } = await supabase.storage.from("photos").upload(path, file);
      if (!error) {
        let preview_path: string | null = null;
        const prev = await bulanikOnizleme(file);
        if (prev) {
          const pPath = `${uid}/${base}.jpg`;
          const { error: pErr } = await supabase.storage
            .from("previews")
            .upload(pPath, prev, { contentType: "image/jpeg" });
          if (!pErr) preview_path = pPath;
        }
        await supabase.from("photos").insert({ user_id: uid, path, preview_path, position: i });
      }
    }

    router.push("/kesfet");
    router.refresh();
  }

  const steps = ["Sen kimsin?", "Nerede, ne yaparsın?", "İlgi & yaşam tarzı", "Fotoğraflar"];

  // İlk adım doğrulaması: isim + geçerli doğum tarihi (18+) + en az bir tercih.
  const age = form.birthdate ? yas(form.birthdate) : null;
  const tooYoung = age !== null && age < 18;
  const step0Valid =
    adSoyadGecerli(form.name) &&
    !!form.birthdate &&
    age !== null &&
    age >= 18 &&
    form.looking_for.length > 0;
  const canAdvance = step === 0 ? step0Valid : true;

  return (
    <div className="min-h-dvh px-6 pb-28 pt-9">
      <div className="mb-7 flex items-center gap-2.5">
        <span className="lp-monogram flex h-10 w-10 items-center justify-center rounded-xl font-display text-lg font-extrabold">
          A
        </span>
        <div>
          <p className="font-display text-sm font-bold leading-tight tracking-tight">Profilini oluştur</p>
          <p className="text-xs text-muted">Adım {step + 1} / {steps.length}</p>
        </div>
      </div>
      <div className="mb-6 flex gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition ${i <= step ? "lp-cta-gold" : "bg-white/10"}`}
          />
        ))}
      </div>
      <h2 className="mb-6 font-display text-2xl font-bold tracking-tight">{steps[step]}</h2>

      {step === 0 && (
        <div className="space-y-4 animate-fade-up">
          <Input placeholder="Ad Soyad" value={form.name} onChange={(e) => set("name", e.target.value)} />
          {form.name.trim() && !adSoyadGecerli(form.name) && (
            <p className="-mt-2 text-xs text-muted">Ad ve soyadını yaz (örn. Ahmet Yılmaz).</p>
          )}
          <div>
            <label className="mb-1 block text-sm text-muted">Doğum tarihin</label>
            <Input type="date" value={form.birthdate} onChange={(e) => set("birthdate", e.target.value)} />
            {tooYoung ? (
              <p className="mt-1 text-xs text-error">Ahenk yalnızca 18 yaş ve üzeri içindir.</p>
            ) : age !== null ? (
              <p className="mt-1 text-xs text-muted">{age} yaşındasın</p>
            ) : null}
          </div>
          <div>
            <p className="mb-2 text-sm text-muted">Cinsiyetin</p>
            <div className="flex gap-2">
              {[["kadin", "Kadın"], ["erkek", "Erkek"], ["diger", "Diğer"]].map(([v, l]) => (
                <Chip key={v} active={form.gender === v} onClick={() => set("gender", v)}>{l}</Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm text-muted">Kiminle tanışmak istersin?</p>
            <div className="flex gap-2">
              {[["kadin", "Kadın"], ["erkek", "Erkek"], ["diger", "Diğer"]].map(([v, l]) => (
                <Chip key={v} active={form.looking_for.includes(v)} onClick={() => toggle("looking_for", v)}>{l}</Chip>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4 animate-fade-up">
          <div>
            <label className="mb-1 block text-sm text-muted">Şehir</label>
            <select
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-text outline-none focus:border-brand"
            >
              {CITY_NAMES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <Input placeholder="Mesleğin" value={form.profession} onChange={(e) => set("profession", e.target.value)} />
          <textarea
            placeholder="Hakkımda — seni anlatan birkaç cümle"
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-text placeholder:text-muted outline-none focus:border-brand"
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5 animate-fade-up">
          <div>
            <p className="mb-2 text-sm text-muted">İlgi alanların</p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <Chip key={i} active={form.interests.includes(i)} onClick={() => toggle("interests", i)}>{i}</Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm text-muted">Konuştuğun diller</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <Chip key={l} active={form.languages.includes(l)} onClick={() => toggle("languages", l)}>{l}</Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm text-muted">Burç (isteğe bağlı)</p>
            <div className="flex flex-wrap gap-2">
              {ZODIAC.map((z) => (
                <Chip key={z} active={form.zodiac === z} onClick={() => set("zodiac", z)}>{z}</Chip>
              ))}
            </div>
          </div>
          <div className="lp-panel rounded-2xl p-4">
            <p className="mb-3 text-sm font-semibold text-accent">Karakter & yaşam tarzı — uyum eşleşmesi için</p>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm text-muted">Ne arıyorsun?</p>
                <div className="flex flex-wrap gap-2">
                  {GOAL_OPTS.map(([v, l]) => (
                    <Chip key={v} active={form.relationship_goal === v} onClick={() => set("relationship_goal", v)}>{l}</Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm text-muted">Çocuk</p>
                <div className="flex flex-wrap gap-2">
                  {KIDS_OPTS.map(([v, l]) => (
                    <Chip key={v} active={form.wants_kids === v} onClick={() => set("wants_kids", v)}>{l}</Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm text-muted">Sigara</p>
                <div className="flex flex-wrap gap-2">
                  {SMOKING_OPTS.map(([v, l]) => (
                    <Chip key={v} active={form.smoking === v} onClick={() => set("smoking", v)}>{l}</Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm text-muted">Alkol</p>
                <div className="flex flex-wrap gap-2">
                  {DRINKING_OPTS.map(([v, l]) => (
                    <Chip key={v} active={form.drinking === v} onClick={() => set("drinking", v)}>{l}</Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm text-muted">Evcil hayvan</p>
                <div className="flex flex-wrap gap-2">
                  {PETS_OPTS.map(([v, l]) => (
                    <Chip key={v} active={form.pets === v} onClick={() => set("pets", v)}>{l}</Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm text-muted">Spor / tempo</p>
                <div className="flex flex-wrap gap-2">
                  {EXERCISE_OPTS.map(([v, l]) => (
                    <Chip key={v} active={form.exercise === v} onClick={() => set("exercise", v)}>{l}</Chip>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-up">
          <div className="lp-panel mb-4 rounded-2xl p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-accent">
              <Sparkles size={16} /> AI profil önerileri
            </p>
            <ul className="space-y-1.5">
              {profilOnerileri({
                bio: form.bio,
                interests: form.interests,
                photoCount: files.length,
                voiceCard: false,
              }).map((t) => (
                <li key={t} className="text-sm text-muted">
                  • {t}
                </li>
              ))}
            </ul>
          </div>
          <p className="mb-4 text-sm text-muted">
            En fazla 6 fotoğraf. Merak etme — fotoğrafların karşı tarafta önce bulanık görünür,
            sohbet ilerledikçe netleşir.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {files.map((f, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-2xl">
                <img src={URL.createObjectURL(f)} className="h-full w-full object-cover" />
                <button
                  onClick={() => setFiles(files.filter((_, x) => x !== i))}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            ))}
            {files.length < 6 && (
              <label className="flex aspect-square cursor-pointer items-center justify-center rounded-2xl border border-dashed border-border text-muted">
                <ImagePlus />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) =>
                    setFiles([...files, ...Array.from(e.target.files || [])].slice(0, 6))
                  }
                />
              </label>
            )}
          </div>
        </div>
      )}

      <div className="lp-header fixed inset-x-0 bottom-0 mx-auto max-w-md p-4">
        <div className="flex items-center gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="lp-cta-ghost flex items-center gap-1 rounded-2xl px-4 py-3 font-semibold transition"
              aria-label="Önceki adım"
            >
              <ChevronLeft size={18} /> Geri
            </button>
          )}
          <div className="flex-1">
            {step < 3 ? (
              <Button full onClick={() => setStep(step + 1)} disabled={!canAdvance}>
                Devam <ChevronRight size={18} />
              </Button>
            ) : (
              <Button full onClick={kaydet} disabled={saving}>
                {saving ? "Kaydediliyor..." : "Profili tamamla"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
