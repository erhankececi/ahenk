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
    // Production: canlı domain (ahenk.live). Geliştirme: bilgisayarının LAN IP'si (örn. http://192.168.1.20:3000).
    url: process.env.CAP_SERVER_URL || "https://ahenk.live",
    // Geliştirmede http (cleartext) gerekebilir; production https'te false yapabilirsin.
    cleartext: true,
  },
  ios: { contentInset: "always" },
  plugins: {
    // Native Google Sign-In: serverClientId = Supabase'te tanımlı WEB OAuth client ID.
    // Secret DEĞİL; env'den gelir (GOOGLE_SERVER_CLIENT_ID). Boşsa native giriş çalışmaz,
    // web OAuth akışı etkilenmez.
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: process.env.GOOGLE_SERVER_CLIENT_ID || "",
      forceCodeForRefreshToken: false,
    },
  },
};

export default config;
