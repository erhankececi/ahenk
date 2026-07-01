import { cookies } from "next/headers";
import {
  ShieldCheck, UserCheck, Heart, Ban, AlertTriangle, Flag, Lock, Scale,
} from "lucide-react";
import MarketingShell from "@/components/marketing/MarketingShell";
import { normalizeLang } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Güvenlik & Topluluk — Ahenk",
  description: "Ahenk topluluk kuralları, güvenlik ipuçları ve bildirme/engelleme rehberi.",
};

const KURALLAR = [
  { Icon: UserCheck, t: "Gerçek ol", d: "Kendi fotoğraflarını ve gerçek bilgilerini kullan. Sahte hesap ve başkasının kimliğine bürünme yasaktır." },
  { Icon: Heart, t: "Saygılı iletişim", d: "Taciz, tehdit, nefret söylemi ve zorbalığa yer yok. Karşındakinin sınırlarına saygı göster." },
  { Icon: Ban, t: "Uygunsuz içerik yok", d: "Çıplaklık, cinsel içerik, şiddet, silah ve kendine zarar görselleri paylaşılamaz." },
  { Icon: ShieldCheck, t: "Yalnızca yetişkinler", d: "Ahenk yalnızca 18 yaş ve üzeri içindir. Reşit olmayan içerik kesinlikle yasaktır." },
  { Icon: Lock, t: "Mahremiyete saygı", d: "Telefon, adres, finansal bilgi gibi kişisel verileri herkese açık paylaşma; başkasının bilgisini ifşa etme." },
  { Icon: AlertTriangle, t: "Ticari kullanım yok", d: "Ahenk tanışmak içindir; reklam, satış, dolandırıcılık ve spam yasaktır." },
  { Icon: Scale, t: "Yasalara uy", d: "Yasa dışı içerik ve faaliyetler yasaktır. Tek kişi, tek hesap ilkesi geçerlidir." },
];

const IPUCLARI = [
  "İlk buluşmayı kalabalık, halka açık bir yerde yap; eve veya tenha yere gitme.",
  "Nereye, kiminle gittiğini güvendiğin birine önceden haber ver.",
  "Görüşmeye kendi ulaşımınla git; kontrolü elinde tut.",
  "Kimseye para gönderme; senden para isteyen kişilere şüpheyle yaklaş.",
  "Kişisel ve finansal bilgilerini erkenden paylaşma.",
  "Rahatsız olursan görüşmeyi bitir — kimseye açıklama borçlu değilsin.",
];

export default function Guvenlik() {
  const lang = normalizeLang(cookies().get("lang")?.value);
  return (
    <MarketingShell lang={lang}>
      <div className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-3xl font-bold sm:text-4xl">Güvenlik &amp; Topluluk</h1>
        <p className="mt-4 text-muted">
          Ahenk; herkesin kendini güvende ve saygı görerek hissettiği bir topluluk olsun diye var.
          Aşağıdaki ilkeler herkes için geçerlidir; ihlal eden hesaplar uyarılır veya kapatılır.
        </p>

        <h2 className="mb-3 mt-12 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Topluluk Kuralları</h2>
        <div className="space-y-3">
          {KURALLAR.map(({ Icon, t, d }) => (
            <div key={t} className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-elevated">
                <Icon size={18} className="text-brand" />
              </div>
              <div>
                <p className="font-semibold">{t}</p>
                <p className="mt-0.5 text-sm text-muted">{d}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mb-3 mt-12 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Güvenlik İpuçları</h2>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <ul className="space-y-3">
            {IPUCLARI.map((i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-brand" />
                <span>{i}</span>
              </li>
            ))}
          </ul>
        </div>

        <h2 className="mb-3 mt-12 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Bildir &amp; Engelle</h2>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="mb-3 flex items-center gap-2 font-semibold">
            <Flag size={18} className="text-brand" /> Rahatsız eden biri mi var?
          </p>
          <p className="text-sm text-muted">
            Herhangi bir sohbette sağ üstteki <span className="font-medium text-text">⋮</span> menüsünden
            <span className="font-medium text-text"> Şikayet et</span> veya
            <span className="font-medium text-text"> Engelle</span> seçeneklerini kullanabilirsin.
            Engellediğin kişi seni göremez, sana yazamaz ve arayamaz. Şikayetler moderasyon ekibimizce
            incelenir. Acil bir tehlike varsa önce <span className="font-medium text-text">112</span>'yi ara.
          </p>
        </div>
      </div>
    </MarketingShell>
  );
}
