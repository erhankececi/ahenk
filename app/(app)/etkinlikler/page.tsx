"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Plus, Check, Clock, X, CalendarHeart, Star, HelpCircle, Users, ImagePlus, Loader2 } from "lucide-react";
import { EVENT_TYPES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

type Attendee = { user_id: string; name: string; status: string; rsvp: string | null };
type Ev = {
  id: string;
  title: string;
  type: string;
  description: string | null;
  city: string | null;
  starts_at: string | null;
  host_name: string;
  cover: string | null;
  mesafe: number | null;
  my_status: string | null;
  my_rsvp: string | null;
  mine: boolean;
  attendees?: Attendee[];
};

const RSVPS = [
  { key: "gidecek", label: "Katılacağım", Icon: Check },
  { key: "belki", label: "Belki", Icon: HelpCircle },
  { key: "ilgileniyor", label: "İlgileniyorum", Icon: Star },
  { key: "gelemem", label: "Katılamam", Icon: X },
];
const RSVP_LABEL: Record<string, string> = {
  gidecek: "Katılacak", belki: "Belki", ilgileniyor: "İlgileniyor", gelemem: "Gelemez",
};

const TYPE = (id: string) => EVENT_TYPES.find((t) => t.id === id) || EVENT_TYPES[4];

export default function Etkinlikler() {
  const [events, setEvents] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({ title: "", type: "kahve", description: "", starts_at: "" });
  const [cover, setCover] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  function load() {
    fetch("/api/events")
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.events || []);
        setLoading(false);
      });
  }
  useEffect(load, []);

  async function olustur() {
    if (!form.title.trim() || saving) return;
    setSaving(true);
    try {
      let cover_path: string | null = null;
      if (cover) {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          const ext = (cover.name.split(".").pop() || "jpg").toLowerCase();
          const path = `${data.user.id}/events/${crypto.randomUUID()}.${ext}`;
          const { error } = await supabase.storage.from("media").upload(path, cover, { contentType: cover.type, upsert: false });
          if (!error) cover_path = path;
        }
      }
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cover_path }),
      });
      setForm({ title: "", type: "kahve", description: "", starts_at: "" });
      setCover(null);
      setComposing(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function rsvpVer(id: string, rsvp: string) {
    setEvents((es) => es.map((e) => (e.id === id ? { ...e, my_rsvp: rsvp } : e)));
    await fetch("/api/events/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: id, rsvp }),
    });
  }

  async function yonet(eventId: string, userId: string, status: string) {
    setEvents((es) =>
      es.map((e) =>
        e.id === eventId
          ? { ...e, attendees: (e.attendees || []).map((a) => (a.user_id === userId ? { ...a, status } : a)) }
          : e
      )
    );
    await fetch("/api/events/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: eventId, user_id: userId, status }),
    });
  }

  return (
    <div className="px-4 pb-8 pt-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight">Etkinlikler</h1>
        <button
          onClick={() => setComposing((v) => !v)}
          className="brand-gradient flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-white"
        >
          <Plus size={16} /> Oluştur
        </button>
      </header>

      {composing && (
        <div className="mb-5 space-y-3 rounded-3xl border border-border bg-surface p-4">
          {/* Kapak görseli */}
          {cover ? (
            <div className="relative overflow-hidden rounded-2xl">
              <img src={URL.createObjectURL(cover)} alt="" className="h-40 w-full object-cover" />
              <button onClick={() => setCover(null)} className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white"><X size={15} /></button>
            </div>
          ) : (
            <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border text-muted transition hover:border-accent/50">
              <ImagePlus size={24} strokeWidth={1.6} />
              <span className="text-sm font-medium">Kapak görseli ekle</span>
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setCover(f); }} />
            </label>
          )}
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Etkinlik başlığı"
            className="w-full rounded-2xl border border-border bg-elevated px-4 py-3 outline-none focus:border-brand"
          />
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setForm({ ...form, type: t.id })}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  form.type === t.id
                    ? "border-transparent bg-accent text-[#1c1407]"
                    : "border-border text-muted hover:text-text"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Açıklama (isteğe bağlı)"
            rows={2}
            className="w-full rounded-2xl border border-border bg-elevated px-4 py-3 outline-none focus:border-brand"
          />
          <input
            type="datetime-local"
            value={form.starts_at}
            onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
            className="w-full rounded-2xl border border-border bg-elevated px-4 py-3 outline-none focus:border-brand"
          />
          <button
            onClick={olustur}
            disabled={saving || !form.title.trim()}
            className="brand-gradient flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold disabled:opacity-50"
          >
            {saving ? <><Loader2 size={18} className="animate-spin" /> Yayınlanıyor…</> : "Yayınla"}
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-3xl border border-border bg-surface p-4">
              <div className="shimmer h-6 w-2/3 rounded-lg" />
              <div className="shimmer mt-2 h-4 w-1/3 rounded" />
              <div className="shimmer mt-3 h-9 w-36 rounded-full" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10">
            <CalendarHeart size={26} className="text-brand" />
          </div>
          <h2 className="text-lg font-semibold">Yakında etkinlik yok</h2>
          <p className="mt-1 max-w-xs text-sm text-muted">
            Bir kahve, yürüyüş ya da film gecesi — ilk etkinliği sen başlat.
          </p>
          <button
            onClick={() => setComposing(true)}
            className="brand-gradient mt-5 rounded-full px-6 py-3 text-sm font-semibold text-white"
          >
            Etkinlik oluştur
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="overflow-hidden rounded-3xl border border-border bg-surface transition duration-200 hover:border-brand/30">
              {e.cover && (
                <div className="relative h-44 w-full">
                  <img src={e.cover} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                </div>
              )}
              <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-lg font-semibold">{e.title}</p>
                  <p className="text-sm text-muted">{TYPE(e.type).label} · {e.host_name}</p>
                </div>
                {e.mesafe != null && (
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <MapPin size={12} /> {e.mesafe} km
                  </span>
                )}
              </div>
              {e.description && <p className="mt-2 text-sm text-text/90">{e.description}</p>}
              {e.starts_at && (
                <p className="mt-2 flex items-center gap-1 text-xs text-muted">
                  <Clock size={12} /> {new Date(e.starts_at).toLocaleString("tr-TR")}
                </p>
              )}
              <div className="mt-3">
                {e.mine ? (
                  <OwnerPanel e={e} onManage={yonet} />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {RSVPS.map((r) => {
                      const on = e.my_rsvp === r.key;
                      return (
                        <button
                          key={r.key}
                          onClick={() => rsvpVer(e.id, r.key)}
                          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition active:scale-95 ${
                            on ? "border-transparent bg-accent text-[#1c1407]" : "border-border text-muted hover:text-text"
                          }`}
                        >
                          <r.Icon size={14} /> {r.label}
                        </button>
                      );
                    })}
                    {e.my_status === "kabul" && (
                      <span className="flex items-center gap-1 px-1 text-xs text-success">
                        <Check size={13} /> Sahibi onayladı
                      </span>
                    )}
                    {e.my_status === "red" && (
                      <span className="flex items-center gap-1 px-1 text-xs text-error">
                        <X size={13} /> Sahibi reddetti
                      </span>
                    )}
                  </div>
                )}
              </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OwnerPanel({
  e,
  onManage,
}: {
  e: Ev;
  onManage: (eventId: string, userId: string, status: string) => void;
}) {
  const att = e.attendees || [];
  const counts: Record<string, number> = {};
  att.forEach((a) => { if (a.rsvp) counts[a.rsvp] = (counts[a.rsvp] || 0) + 1; });
  const yonetilecek = att.filter((a) => a.rsvp && a.rsvp !== "gelemem");

  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm font-medium text-brand">
        <Users size={14} /> Senin etkinliğin
      </p>
      {att.length === 0 ? (
        <p className="text-xs text-muted">Henüz yanıt veren yok.</p>
      ) : (
        <>
          <div className="mb-2 flex flex-wrap gap-1.5 text-xs">
            {RSVPS.map((r) =>
              counts[r.key] ? (
                <span key={r.key} className="rounded-full bg-elevated px-2 py-0.5 text-muted">
                  {RSVP_LABEL[r.key]}: <b className="text-text">{counts[r.key]}</b>
                </span>
              ) : null
            )}
          </div>
          <div className="space-y-1.5">
            {yonetilecek.map((a) => (
              <div key={a.user_id} className="flex items-center gap-2 rounded-xl border border-border bg-elevated px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.name}</p>
                  <p className="text-[11px] text-muted">
                    {a.rsvp ? RSVP_LABEL[a.rsvp] : "—"}
                    {a.status === "kabul" ? " · onaylı" : a.status === "red" ? " · reddedildi" : ""}
                  </p>
                </div>
                {a.status !== "kabul" && (
                  <button onClick={() => onManage(e.id, a.user_id, "kabul")} aria-label="Onayla" className="rounded-full bg-success/15 p-1.5 text-success">
                    <Check size={15} />
                  </button>
                )}
                {a.status !== "red" && (
                  <button onClick={() => onManage(e.id, a.user_id, "red")} aria-label="Reddet" className="rounded-full bg-error/15 p-1.5 text-error">
                    <X size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
