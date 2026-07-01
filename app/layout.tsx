import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import VisitTracker from "@/components/VisitTracker";
import { LangProvider } from "@/components/LangProvider";
import { normalizeLang, LANG_DIR } from "@/lib/i18n";

export const metadata: Metadata = {
  metadataBase: new URL("https://ahenk.live"),
  title: "Ahenk | Karakter Önce, Yüz Sonra",
  description: "Ahenk; karakter uyumu, gizlilik odaklı profil keşfi, moments, sohbet ve premium sosyal deneyimi tek zarif platformda birleştirir.",
  manifest: "/manifest.webmanifest",
  applicationName: "Ahenk",
  keywords: ["Ahenk", "sosyal keşif", "tanışma", "karakter uyumu", "premium", "moments", "Türkiye"],
  // İkonlar app/icon.png + app/apple-icon.png dosya konvansiyonundan gelir
  // (Next otomatik hash'li URL üretir → favicon cache-bust).
  appleWebApp: {
    capable: true,
    title: "Ahenk",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://ahenk.live",
    siteName: "Ahenk",
    title: "Ahenk — Karakter önce, yüz sonra.",
    description: "Fotoğrafların değil karakterin öne çıktığı, güvenli ve premium sosyal keşif platformu.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ahenk — Karakter önce, yüz sonra.",
    description: "Fotoğrafların değil karakterin öne çıktığı, güvenli ve premium sosyal keşif platformu.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0E0D10",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = normalizeLang(cookies().get("lang")?.value);
  return (
    <html lang={lang} dir={LANG_DIR[lang]} className="dark">
      <body>
        <ThemeProvider>
          <LangProvider lang={lang}>
            <VisitTracker />
            <div className="min-h-dvh bg-bg">{children}</div>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
