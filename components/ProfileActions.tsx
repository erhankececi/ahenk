"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun, LogOut, Trash2, AlertTriangle, CreditCard } from "lucide-react";

export function ProfileActions() {
  const router = useRouter();
  const supabase = createClient();
  const { theme, toggle } = useTheme();
  const [stage, setStage] = useState<0 | 1 | 2>(0); // 0 kapalı · 1 uyarı · 2 yaz-onayla
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function kapat() {
    if (busy) return;
    setStage(0);
    setTyped("");
    setErr("");
  }

  async function cikis() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function sil() {
    if (busy || !onayli) return;
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/account/delete", { method: "POST" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) {
        setErr("Hesap silinemedi. Lütfen tekrar dene.");
        setBusy(false);
        return;
      }
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch {
      setErr("Bağlantı hatası.");
      setBusy(false);
    }
  }

  // tr-TR locale: "SİL" → "sil" (varsayılan locale'de "SİL".toLowerCase() ≠ "sil").
  const onayli = typed.trim().toLocaleLowerCase("tr-TR") === "sil";

  return (
    <div className="space-y-2">
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3"
      >
        <span className="flex items-center gap-2">
          {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />} Tema
        </span>
        <span className="text-sm text-muted">{theme === "dark" ? "Koyu" : "Açık"}</span>
      </button>
      <button
        onClick={cikis}
        className="flex w-full items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-brand-2"
      >
        <LogOut size={18} /> Çıkış yap
      </button>
      <button
        onClick={() => setStage(1)}
        className="flex w-full items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-error transition hover:border-error/40"
      >
        <Trash2 size={18} /> Hesabımı sil
      </button>

      {stage > 0 && (
        <div
          className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={kapat}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-scale-in w-full max-w-sm rounded-3xl border border-border bg-surface p-5 shadow-float"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-error/10">
              <AlertTriangle size={22} className="text-error" />
            </div>

            {stage === 1 ? (
              <>
                <h3 className="t-h4 text-center">Hesabını sil</h3>
                <p className="mt-1.5 text-center text-sm text-muted">
                  Hesabın devre dışı kalır ve profilin gizlenir. Verilerin <b className="text-text">korunur</b> —
                  fikrini değiştirirsen tekrar giriş yapıp <b className="text-text">geri yükleyebilirsin</b>.
                </p>
                <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-warning/30 bg-warning/10 p-3">
                  <CreditCard size={16} className="mt-0.5 shrink-0 text-warning" />
                  <p className="text-xs text-muted">
                    <b className="text-text">Aboneliğin varsa:</b> hesabı silmek App Store / Google Play
                    aboneliğini iptal <b className="text-text">etmez</b>. Faturalandırmayı durdurmak için
                    aboneliğini mağazandan ayrıca iptal et.
                  </p>
                </div>
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={kapat}
                    className="flex-1 rounded-full border border-border py-2.5 text-sm font-medium"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={() => setStage(2)}
                    className="flex-1 rounded-full bg-error/15 py-2.5 text-sm font-semibold text-error transition hover:bg-error/25"
                  >
                    Devam et
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="t-h4 text-center">Son adım</h3>
                <p className="mt-1.5 text-center text-sm text-muted">
                  Bu son onay. Onaylamak için aşağıya <b className="text-text">SİL</b> yaz.
                </p>
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder="SİL"
                  aria-label="Onay metni"
                  autoFocus
                  className="mt-3 w-full rounded-xl border border-border bg-surface px-3 py-2 text-center text-sm outline-none focus:border-error"
                />
                {err && <p className="mt-2 text-center text-xs text-error">{err}</p>}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setStage(1);
                      setTyped("");
                      setErr("");
                    }}
                    disabled={busy}
                    className="flex-1 rounded-full border border-border py-2.5 text-sm font-medium disabled:opacity-50"
                  >
                    Geri
                  </button>
                  <button
                    onClick={sil}
                    disabled={!onayli || busy}
                    className="flex-1 rounded-full bg-error py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
                  >
                    {busy ? "Siliniyor…" : "Hesabımı sil"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
