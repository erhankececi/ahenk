import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Ahenk — Karakter önce, yüz sonra.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Paylaşım önizleme kartı (WhatsApp / X / LinkedIn / Telegram link kartı) — VISION V1: onyx + mat pirinç.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0E0D10",
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(199,169,119,0.18), transparent 60%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 92,
              height: 92,
              borderRadius: 24,
              backgroundImage: "linear-gradient(150deg, #DBBF8E, #C7A977 55%, #9c8052)",
              color: "#1c1407",
              fontSize: 60,
              fontWeight: 800,
            }}
          >
            A
          </div>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 800, color: "#F3EEE4", letterSpacing: "-3px" }}>
            Ahenk
          </div>
        </div>

        <div style={{ display: "flex", marginTop: 40, fontSize: 64, fontWeight: 700, color: "#F3EEE4", letterSpacing: "-2px" }}>
          Karakter önce,
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, color: "#C7A977", letterSpacing: "-2px" }}>
          yüz sonra.
        </div>

        <div style={{ display: "flex", fontSize: 28, color: "#A39E95", marginTop: 44 }}>
          Premium sosyal keşif platformu · ahenk.live
        </div>
      </div>
    ),
    { ...size }
  );
}
