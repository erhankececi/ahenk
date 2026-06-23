import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button, GlassCard, LiveBadge, SectionTitle, Avatar, Stars, IconBox } from "@/components/ui";
import { ROOMS, TEACHERS, STATS, FAQS } from "@/lib/mock";
import {
  Video, Camera, Users, Coins, Crown, Wallet, ChevronDown, ArrowRight, Zap, ShieldCheck, Clock, GraduationCap,
} from "lucide-react";

export default function Landing() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      {/* Üst bar */}
      <header className="sticky top-0 z-40 -mx-4 mb-2 flex items-center justify-between border-b border-line glass px-4 py-3 sm:-mx-6 sm:px-6">
        <Logo size={24} />
        <div className="flex items-center gap-2">
          <Button href="/login" variant="ghost" size="sm">Giriş</Button>
          <Button href="/register" variant="primary" size="sm">Üye Ol</Button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary">
            <span className="live-dot" /> Canlı etüt, soru çözüm ve sınav koçluğu tek platformda
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
            Ahenk Live ile <span className="text-primary">canlı etüt</span> ve soru çözüm her an yanında.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            Canlı odalara katıl, öğretmenlere soru sor, sınav koçluğu al ve öğrenme sürecini tek platformdan yönet.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/register" size="lg">Hemen Başla <ArrowRight size={18} /></Button>
            <Button href="/odalar" variant="glass" size="lg"><Video size={18} /> Canlı Odaları Gör</Button>
            <Button href="/register?rol=ogretmen" variant="ghost" size="lg"><GraduationCap size={18} /> Öğretmen Ol</Button>
          </div>
        </div>

        {/* İstatistik kartları */}
        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-3 sm:gap-4">
          {STATS.map((s) => (
            <GlassCard key={s.label} className="p-4 text-center sm:p-6">
              <p className="text-2xl font-bold text-primary sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-xs text-muted sm:text-sm">{s.label}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Canlı Çalışma Odaları */}
      <section className="py-12">
        <SectionTitle eyebrow="Canlı Çalışma Odaları" title="Binlerce öğrenciyle aynı anda çalış" desc="Canlı odalara katıl, etkileşimli oturumlarla hazırlığını güçlendir." />
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROOMS.slice(0, 3).map((r) => (
            <GlassCard key={r.id} className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-muted">{r.tag}</span>
                <LiveBadge soon={r.status === "yakinda"} label={r.status === "yakinda" ? "Yakında" : "Canlı"} />
              </div>
              <h3 className="text-lg font-bold">{r.name}</h3>
              <div className="mt-3 flex items-center gap-2">
                <Avatar name={r.teacher} size={32} />
                <div className="text-sm">
                  <p className="font-semibold">{r.teacher}</p>
                  <p className="text-xs text-muted">{r.teacherTitle}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <span className="flex items-center gap-1.5 text-xs text-muted"><Users size={14} /> {r.participants} katılımcı</span>
                <span className="text-xs font-semibold text-primary">{r.cost === 0 ? "Ücretsiz" : `${r.cost} jeton`}</span>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* İki sütun: Soru sor + Öğretmenler */}
      <section className="grid gap-6 py-12 lg:grid-cols-2">
        <GlassCard className="p-7">
          <IconBox><Camera size={20} /></IconBox>
          <h3 className="mt-4 text-xl font-bold">Fotoğrafla Soru Sor</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            Sıra sıra beklemene gerek yok. Çözemediğin sorunun fotoğrafını gönder, uzman öğretmenlerden adım adım çözüm al.
          </p>
          <Button href="/soru-sor" variant="glass" size="sm" className="mt-5"><Camera size={16} /> Soru Yükle</Button>
        </GlassCard>

        <GlassCard className="p-7">
          <IconBox tone="secondary"><Users size={20} /></IconBox>
          <h3 className="mt-4 text-xl font-bold">Öğretmenler ve Koçlar</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">Alanında uzman eğitmenlerden birebir destek al, sınav koçluğu ile başarıya odaklan.</p>
          <div className="mt-5 flex gap-3">
            {TEACHERS.slice(0, 3).map((t) => (
              <div key={t.id} className="flex flex-col items-center gap-1.5 text-center">
                <Avatar name={t.name} size={44} color="#B6C4FF" />
                <span className="text-xs font-medium">{t.name.split(" ").slice(-1)}</span>
                <span className="text-[10px] text-muted">{t.branch.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      {/* Jeton + Premium + Kazanç */}
      <section className="grid gap-6 py-12 lg:grid-cols-3">
        <GlassCard className="p-7">
          <IconBox><Coins size={20} /></IconBox>
          <h3 className="mt-4 text-xl font-bold">Jetonla Öncelikli Cevap</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">Öncelikli cevap, birebir görüşme ve sınav koçluğu ile sürecini hızlandır. Jetonla anında destek al.</p>
        </GlassCard>

        <GlassCard className="gold-card p-7">
          <IconBox tone="gold"><Crown size={20} /></IconBox>
          <h3 className="mt-4 text-xl font-bold text-premium">Öğrenci Premium</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">Sınırsız soru çözümü, öncelikli erişim, koçluk indirimi ve reklamsız deneyim.</p>
          <Button href="/premium" variant="gold" size="sm" className="mt-5">Premium'a Geç</Button>
        </GlassCard>

        <GlassCard className="p-7">
          <IconBox><Wallet size={20} /></IconBox>
          <h3 className="mt-4 text-xl font-bold">Öğretmenler İçin Kazanç Modeli</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">Uzmanlığını kazanca dönüştür. Canlı oda aç, soru çözer, özel ders vererek gelir elde et.</p>
          <Button href="/register?rol=ogretmen" variant="glass" size="sm" className="mt-5">Eğitim Başvurusu Yap</Button>
        </GlassCard>
      </section>

      {/* Güven kartları */}
      <section className="grid grid-cols-2 gap-4 py-8 sm:grid-cols-4">
        {[
          { icon: ShieldCheck, t: "Güvenli", d: "Doğrulanmış eğitmenler" },
          { icon: Zap, t: "Hızlı", d: "5 dk öncelikli cevap" },
          { icon: Clock, t: "7/24", d: "Her an canlı oda" },
          { icon: GraduationCap, t: "Tüm sınavlar", d: "TYT · AYT · LGS · KPSS" },
        ].map((c) => (
          <GlassCard key={c.t} className="p-4 text-center">
            <c.icon size={22} className="mx-auto text-primary" />
            <p className="mt-2 text-sm font-bold">{c.t}</p>
            <p className="text-xs text-muted">{c.d}</p>
          </GlassCard>
        ))}
      </section>

      {/* SSS */}
      <section className="py-12">
        <SectionTitle title="Sıkça Sorulan Sorular" center />
        <div className="mx-auto mt-7 max-w-2xl space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="glass-card group rounded-2xl p-5">
              <summary className="flex cursor-pointer items-center justify-between font-semibold marker:content-none">
                {f.q}
                <ChevronDown size={18} className="text-primary transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA bandı */}
      <section className="py-12">
        <GlassCard className="overflow-hidden p-10 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Öğrenme yolculuğun bugün başlasın.</h2>
          <p className="mx-auto mt-2 max-w-lg text-muted">Ücretsiz hesabını oluştur, ilk canlı odana katıl.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button href="/register" size="lg">Hemen Başla <ArrowRight size={18} /></Button>
          </div>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="border-t border-line py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <Logo size={22} />
            <p className="mt-3 max-w-xs text-sm text-muted">Yeni nesil canlı eğitim platformu. Öğrenme sürecini tek yerden yönet.</p>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Platform</p>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/odalar" className="hover:text-text">Canlı Odalar</Link></li>
              <li><Link href="/soru-sor" className="hover:text-text">Soru Çözüm</Link></li>
              <li><Link href="/premium" className="hover:text-text">Öğrenci Premium</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Destek</p>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/login" className="hover:text-text">Giriş Yap</Link></li>
              <li><Link href="/register" className="hover:text-text">Üye Ol</Link></li>
              <li><Link href="/register?rol=ogretmen" className="hover:text-text">Öğretmen Ol</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-muted">© 2026 Ahenk Live. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
