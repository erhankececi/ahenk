import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import VisitTracker from "@/components/VisitTracker";

export const metadata: Metadata = {
  metadataBase: new URL("https://ahenk.live"),
  title: "Ahenk | Karakter Önce, Yüz Sonra",
  description: "Ahenk; karakter uyumu, gizlilik odaklı profil keşfi, moments, sohbet ve premium sosyal deneyimi tek zarif platformda birleştirir.",
  manifest: "/manifest.webmanifest",
  applicationName: "Ahenk",
  keywords: ["Ahenk", "sosyal keşif", "tanışma", "karakter uyumu", "premium", "moments", "Türkiye"],
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
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
  return (
    <html lang="tr" className="dark">
      <body>
        <ThemeProvider>
          <VisitTracker />
          <div className="min-h-dvh bg-bg">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
