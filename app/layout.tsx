import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
// Başlıklar için premium display font — gövdeden ayrı, güçlü hiyerarşi.
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ahenk.live"),
  title: "Ahenk — Önce ruh, sonra yüz",
  description: "Karaktere, ilgi alanlarına ve yaşam tarzına göre tanışma uygulaması.",
  manifest: "/manifest.webmanifest",
  applicationName: "Ahenk",
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
    title: "Ahenk — Önce ruh, sonra yüz",
    description: "Karaktere göre tanış — fotoğraf değil, önce ruh. Yakınındaki uyumlu insanlarla eşleş.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ahenk — Önce ruh, sonra yüz",
    description: "Karaktere göre tanışma uygulaması.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1220",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="dark">
      <body className={`${inter.variable} ${manrope.variable}`}>
        <ThemeProvider>
          <div className="min-h-dvh bg-bg">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
