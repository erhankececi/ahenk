import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getDict, type Lang } from "@/lib/i18n";
import { Instagram, Twitter, Youtube } from "lucide-react";

export default function MarketingShell({
  lang,
  children,
}: {
  lang: Lang;
  children: React.ReactNode;
}) {
  const t = getDict(lang);
  const year = new Date().getFullYear();

  return (
    <div className="lp-page flex min-h-dvh flex-col text-text">
      {/* ---------- Header ---------- */}
      <header className="lp-header sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="lp-monogram flex h-9 w-9 items-center justify-center rounded-xl font-display text-lg font-extrabold">
              A
            </span>
            <span className="font-display text-[19px] font-bold tracking-tight">Ahenk</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            <Link href="/#kesfet" className="transition hover:text-text">Keşfet</Link>
            <Link href="/#moments" className="transition hover:text-text">Moments</Link>
            <Link href="/#premium" className="transition hover:text-text">Premium</Link>
            <Link href="/guvenlik" className="transition hover:text-text">Güvenlik</Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:block">
              <LanguageSwitcher current={lang} />
            </div>
            <Link
              href="/login"
              className="lp-cta-ghost rounded-full px-4 py-2 text-sm font-medium transition"
            >
              Giriş Yap
            </Link>
            <Link
              href="/register"
              className="lp-cta-gold rounded-full px-4 py-2 text-sm font-semibold transition"
            >
              Ahenk’e Katıl
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-white/[0.07]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 py-14 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="lp-monogram flex h-9 w-9 items-center justify-center rounded-xl font-display text-lg font-extrabold">
                A
              </span>
              <span className="font-display text-lg font-bold tracking-tight">Ahenk</span>
            </Link>
            <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-muted">
              Karakter önce, yüz sonra. Premium sosyal keşif platformu.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-muted transition hover:border-accent/40 hover:text-accent" aria-label="Instagram">
                <Instagram size={17} strokeWidth={1.7} />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-muted transition hover:border-accent/40 hover:text-accent" aria-label="X">
                <Twitter size={17} strokeWidth={1.7} />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-muted transition hover:border-accent/40 hover:text-accent" aria-label="YouTube">
                <Youtube size={17} strokeWidth={1.7} />
              </span>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Ürün</p>
            <div className="space-y-2 text-sm">
              <Link href="/#kesfet" className="block text-muted transition hover:text-text">Keşfet</Link>
              <Link href="/#moments" className="block text-muted transition hover:text-text">Moments</Link>
              <Link href="/#premium" className="block text-muted transition hover:text-text">Premium</Link>
              <Link href="/indir" className="block text-muted transition hover:text-text">{t.nav.download}</Link>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Şirket</p>
            <div className="space-y-2 text-sm">
              <Link href="/hakkinda" className="block text-muted transition hover:text-text">{t.nav.about}</Link>
              <Link href="/guvenlik" className="block text-muted transition hover:text-text">Güvenlik</Link>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Yasal</p>
            <div className="space-y-2 text-sm">
              <Link href="/gizlilik" className="block text-muted transition hover:text-text">{t.footer.privacy}</Link>
              <Link href="/kosullar" className="block text-muted transition hover:text-text">{t.footer.terms}</Link>
              <Link href="/kvkk" className="block text-muted transition hover:text-text">{t.footer.kvkk}</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/[0.07]">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-muted sm:flex-row">
            <span>© {year} Ahenk. {t.footer.rights}</span>
            <span className="text-muted/70">Türkiye’nin premium sosyal keşif platformu</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
