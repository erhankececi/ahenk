"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Check, Clock, X, CalendarHeart } from "lucide-react";
import { EVENT_TYPES } from "@/lib/constants";

type Ev = {
  id: string;
  title: string;
  type: string;
  description: string | null;
  city: string | null;
  starts_at: string | null;
  host_name: string;
  mesafe: number | null;
  my_status: string | null;
  mine: boolean;
};

const TYPE = (id: string) => EVENT_TYPES.find((t) => t.id === id) || EVENT_TYPES[4];

export default function Etkinlikler() {
  const [events, setEvents] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({ title: "", type: "kahve", description: "", starts_at: "" });

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
    if (!form.title.trim()) return;
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", type: "kahve", description: "", starts_at: "" });
    setComposing(false);
    load();
  }

  async function katil(id: string) {
    await fetch("/api/events/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: id }),
    });
    setEvents((es) => es.map((e) => (e.id === id ? { ...e, my_status: "bekliyor" } : e)));
  }

  return (
    <div className="px-4 pb-8 pt-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold brand-text">Etkinlikler</h1>
        <button
          onClick={() => setComposing((v) => !v)}
          className="brand-gradient flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-white"
        >
          <Plus size={16} /> Oluştur
        </button>
      </header>

      {composing && (
        <div className="mb-5 space-y-3 rounded-3xl border border-border bg-surface p-4">
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
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  form.type === t.id
                    ? "brand-gradient border-transparent text-white"
                    : "border-border text-muted"
                }`}
              >
                {t.emoji} {t.label}
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
            className="brand-gradient w-full rounded-2xl py-3 font-semibold text-white"
          >
            Yayınla
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
            <div key={e.id} className="rounded-3xl border border-border bg-surface p-4 transition duration-200 hover:border-brand/30">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold">
                    {TYPE(e.type).emoji} {e.title}
                  </p>
                  <p className="text-sm text-muted">{e.host_name} düzenliyor</p>
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
                  <span className="text-sm text-brand">Senin etkinliğin</span>
                ) : e.my_status === "bekliyor" ? (
                  <span className="flex items-center gap-1 text-sm text-muted">
                    <Clock size={14} /> İstek gönderildi
                  </span>
                ) : e.my_status === "kabul" ? (
                  <span className="flex items-center gap-1 text-sm text-brand">
                    <Check size={14} /> Katılıyorsun
                  </span>
                ) : e.my_status === "red" ? (
                  <span className="flex items-center gap-1 text-sm text-error">
                    <X size={14} /> Reddedildi
                  </span>
                ) : (
                  <button
                    onClick={() => katil(e.id)}
                    className="rounded-full border border-brand px-4 py-2 text-sm font-medium text-brand transition active:scale-95"
                  >
                    Katılmak istiyorum
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
