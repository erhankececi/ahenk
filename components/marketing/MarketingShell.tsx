import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getDict, type Lang } from "@/lib/i18n";

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
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Ahenk
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
            <Link href="/#ozellikler" className="transition hover:text-text">{t.nav.features}</Link>
            <Link href="/guvenlik" className="transition hover:text-text">{t.nav.safety}</Link>
            <Link href="/hakkinda" className="transition hover:text-text">{t.nav.about}</Link>
            <Link href="/indir" className="transition hover:text-text">{t.nav.download}</Link>
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <LanguageSwitcher current={lang} />
            </div>
            <Link
              href="/login"
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-text/40"
            >
              {t.nav.login}
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {t.nav.signup}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 py-12 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-lg font-bold">Ahenk</p>
            <p className="mt-2 max-w-[16rem] text-sm text-muted">{t.hero.tagline}</p>
            <div className="mt-4">
              <LanguageSwitcher current={lang} />
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">{t.footer.product}</p>
            <div className="space-y-2 text-sm">
              <Link href="/#ozellikler" className="block text-muted transition hover:text-text">{t.nav.features}</Link>
              <Link href="/indir" className="block text-muted transition hover:text-text">{t.nav.download}</Link>
              <Link href="/guvenlik" className="block text-muted transition hover:text-text">{t.nav.safety}</Link>
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">{t.footer.company}</p>
            <div className="space-y-2 text-sm">
              <Link href="/hakkinda" className="block text-muted transition hover:text-text">{t.nav.about}</Link>
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">{t.footer.legal}</p>
            <div className="space-y-2 text-sm">
              <Link href="/gizlilik" className="block text-muted transition hover:text-text">{t.footer.privacy}</Link>
              <Link href="/kosullar" className="block text-muted transition hover:text-text">{t.footer.terms}</Link>
              <Link href="/kvkk" className="block text-muted transition hover:text-text">{t.footer.kvkk}</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border/60">
          <div className="mx-auto max-w-6xl px-5 py-5 text-xs text-muted">
            © {year} Ahenk. {t.footer.rights}
          </div>
        </div>
      </footer>
    </div>
  );
}
