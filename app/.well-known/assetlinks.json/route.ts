import { NextResponse } from "next/server";

// Digital Asset Links — https://ahenk.live/.well-known/assetlinks.json
// Android App Links doğrulaması için Google'ın çektiği dosya.
// SHA-256 parmak izleri ENV'den gelir (secret DEĞİL, hardcode YOK):
//   ANDROID_SHA256_FINGERPRINTS = "AA:BB:...,CC:DD:..."  (virgülle çoklu: debug + release)
// Env boşken liste boş döner (geçerli JSON; parmak izi girilene kadar doğrulama geçmez).
export const dynamic = "force-dynamic";

export function GET() {
  const fingerprints = (process.env.ANDROID_SHA256_FINGERPRINTS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const body = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "app.ahenk",
        sha256_cert_fingerprints: fingerprints,
      },
    },
  ];

  return NextResponse.json(body, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
