import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Ahenk — Önce ruh, sonra yüz";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Paylaşım önizleme kartı (WhatsApp/Instagram/Twitter/Facebook link kartı).
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
          backgroundImage: "linear-gradient(135deg, #0F1117, #1b1535)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 144,
            fontWeight: 800,
            color: "#8b85ff",
            letterSpacing: "-3px",
          }}
        >
          Ahenk
        </div>
        <div style={{ display: "flex", fontSize: 50, color: "#ededf5", marginTop: 6 }}>
          Önce ruh, sonra yüz.
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#9a9cb0", marginTop: 46 }}>
          Karaktere, ilgiye ve yaşam tarzına göre tanış · ahenk.live
        </div>
      </div>
    ),
    { ...size }
  );
}
