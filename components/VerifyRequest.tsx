"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BadgeCheck, Camera, Clock } from "lucide-react";
import { useLang } from "@/components/LangProvider";

/**
 * Selfie ile profil doğrulama isteği. Selfie private 'photos' kovasına yüklenir,
 * profiles.verification_status='pending' yapılır (is_verified KORUNUR → guard v18;
 * mavi tiki yalnız admin onayı service_role ile verir).
 */
export default function VerifyRequest({
  userId,
  status,
  isVerified,
}: {
  userId: string;
  status: string;
  isVerified: boolean;
}) {
  const { t } = useLang();
  const tv = t.settings.verify;
  const supabase = createClient();
  const router = useRouter();
  const [st, setSt] = useState(status);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (isVerified) return null;

  async function yukle(file: File) {
    if (busy) return;
    if (!file.type.startsWith("image/")) {
      setErr(tv.pickSelfie);
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErr(tv.tooBig);
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${userId}/verify-${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("photos")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (upErr) {
        setErr(tv.uploadFailed);
        return;
      }
      const { error: updErr } = await supabase
        .from("profiles")
        .update({ verification_status: "pending", verification_path: path })
        .eq("id", userId);
      if (updErr) {
        setErr(tv.sendFailed);
        return;
      }
      setSt("pending");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (st === "pending") {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-3xl border border-border bg-surface p-4">
        <Clock size={18} className="shrink-0 text-warning" />
        <div>
          <p className="text-sm font-medium">{tv.pendingTitle}</p>
          <p className="text-xs text-muted">{tv.pendingDesc}</p>
        </div>
      </div>
    );
  }

  return (
    <label className="mb-6 flex cursor-pointer items-center gap-3 rounded-3xl border border-brand/30 bg-brand/5 p-4 transition hover:border-brand/50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/15">
        <BadgeCheck size={18} className="text-brand" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          {st === "rejected" ? tv.rejected : tv.cta}
        </p>
        <p className="text-xs text-muted">
          {busy ? tv.uploading : tv.hint}
        </p>
        {err && <p className="mt-1 text-xs text-error">{err}</p>}
      </div>
      <Camera size={18} className="shrink-0 text-muted" />
      <input
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) yukle(f);
        }}
      />
    </label>
  );
}
