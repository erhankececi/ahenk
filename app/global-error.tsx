"use client";

// Kök layout'taki hataları yakalar (kendi <html>/<body>'sini render eder).
// globals.css yüklenemeyebileceği için inline stil kullanılır.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
          background: "#0a0a0f",
          color: "#fff",
          textAlign: "center",
          padding: "0 1.5rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Bir şeyler ters gitti</h1>
          <p style={{ marginTop: "0.5rem", opacity: 0.7, fontSize: "0.9rem" }}>
            Beklenmeyen bir hata oluştu.
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "999px",
              border: "none",
              background: "linear-gradient(135deg,#6c63ff,#8b85ff)",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tekrar dene
          </button>
        </div>
      </body>
    </html>
  );
}
