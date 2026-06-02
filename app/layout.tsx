import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
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
};

export const viewport: Viewport = {
  themeColor: "#0F1117",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="dark">
      <body className={inter.variable}>
        <ThemeProvider>
          <div className="min-h-dvh bg-bg">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
