import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ahenk Live — Canlı Etüt, Soru Çözüm ve Sınav Koçluğu",
  description:
    "Canlı odalara katıl, öğretmenlere soru sor, sınav koçluğu al ve öğrenme sürecini tek platformdan yönet. TYT, AYT, LGS ve KPSS için canlı etüt.",
  applicationName: "Ahenk Live",
  keywords: ["Ahenk Live", "canlı etüt", "soru çözüm", "sınav koçluğu", "TYT", "AYT", "LGS", "KPSS"],
};

export const viewport: Viewport = {
  themeColor: "#050B14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
