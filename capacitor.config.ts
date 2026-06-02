import type { CapacitorConfig } from "@capacitor/cli";

// Ahenk Next.js SSR uygulaması statik export EDİLEMEZ (server components + API + middleware +
// Supabase SSR auth). Bu yüzden native kabuk, BARINDIRILAN siteyi `server.url` ile yükler;
// RevenueCat IAP eklentisi native tarafta bağımsız çalışır.
const config: CapacitorConfig = {
  appId: "app.ahenk",
  appName: "Ahenk",
  // server.url kullanıldığı için webDir yalnız bir yer tutucudur (cap sync ister).
  webDir: "public",
  server: {
    // Production: kendi domain'in. Geliştirme: bilgisayarının LAN IP'si (örn. http://192.168.1.20:3000).
    url: process.env.CAP_SERVER_URL || "https://ahenk.app",
    // Geliştirmede http (cleartext) gerekebilir; production https'te false yapabilirsin.
    cleartext: true,
  },
  ios: { contentInset: "always" },
};

export default config;
