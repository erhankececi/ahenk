"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Chip } from "@/components/ui";
import { INTERESTS, ZODIAC, LANGUAGES, CITY_NAMES, CITIES } from "@/lib/constants";
import { profilOnerileri } from "@/lib/aiProfile";
import { yas } from "@/lib/utils";
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
  });
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/login");
      else {
        setUid(data.user.id);
        setForm((f: any) => ({ ...f, name: data.user!.user_metadata?.name || "" }));
      }
    });
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
    form.name.trim().length >= 2 &&
    !!form.birthdate &&
    age !== null &&
    age >= 18 &&
    form.looking_for.length > 0;
  const canAdvance = step === 0 ? step0Valid : true;

  return (
    <div className="min-h-dvh px-6 pb-28 pt-10">
      <div className="mb-6 flex gap-1">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${i <= step ? "brand-gradient" : "bg-border"}`}
          />
        ))}
      </div>
      <h2 className="mb-6 text-2xl font-bold">{steps[step]}</h2>

      {step === 0 && (
        <div className="space-y-4 animate-fade-up">
          <Input placeholder="Adın" value={form.name} onChange={(e) => set("name", e.target.value)} />
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
          <div className="flex gap-6">
            <div>
              <p className="mb-2 text-sm text-muted">Sigara</p>
              <div className="flex gap-2">
                {[["hayir", "Hayır"], ["sosyal", "Sosyal"], ["evet", "Evet"]].map(([v, l]) => (
                  <Chip key={v} active={form.smoking === v} onClick={() => set("smoking", v)}>{l}</Chip>
                ))}
              </div>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm text-muted">Evcil hayvan</p>
            <div className="flex flex-wrap gap-2">
              {[["yok", "Yok"], ["kedi", "Kedi"], ["kopek", "Köpek"], ["seviyorum", "Seviyorum"]].map(([v, l]) => (
                <Chip key={v} active={form.pets === v} onClick={() => set("pets", v)}>{l}</Chip>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-up">
          <div className="mb-4 rounded-2xl border border-brand/40 bg-brand/5 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium brand-text">
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

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md border-t border-border bg-bg/90 p-4 backdrop-blur">
        <div className="flex items-center gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 rounded-2xl border border-border px-4 py-3 font-semibold text-text transition hover:border-brand"
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
