"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, MapPin, Check } from "lucide-react";
import { KM_OPTIONS, SORT_OPTIONS, type DiscoveryFilter, type SortValue } from "@/lib/discoveryFilters";
import { CITY_NAMES } from "@/lib/constants";
import { useLang } from "@/components/LangProvider";

export default function DiscoveryFilters({
  open,
  initial,
  myCity,
  onClose,
  onApply,
}: {
  open: boolean;
  initial: DiscoveryFilter;
  myCity: string | null;
  onClose: () => void;
  onApply: (f: DiscoveryFilter) => void;
}) {
  const { t } = useLang();
  const tf = t.filters;
  const sortLabel: Record<SortValue, string> = {
    smart: tf.sortSmart, near: tf.sortNear, active: tf.sortActive, new: tf.sortNew, uyum: tf.sortUyum,
  };
  const [kmIdx, setKmIdx] = useState(() =>
    Math.max(0, KM_OPTIONS.findIndex((o) => o.value === initial.km))
  );
  const [mode, setMode] = useState<"all" | "mine" | "select">(
    initial.cities.length ? "select" : "all"
  );
  const [cities, setCities] = useState<string[]>(initial.cities);
  const [sort, setSort] = useState<SortValue>(initial.sort || "smart");
  const [minAge, setMinAge] = useState(initial.minAge ?? 18);
  const [maxAge, setMaxAge] = useState(initial.maxAge ?? 60);
  const [verified, setVerified] = useState(!!initial.verified);
  const [q, setQ] = useState("");

  const km = KM_OPTIONS[kmIdx];
  const filtered = q
    ? CITY_NAMES.filter((c) => c.toLocaleLowerCase("tr").includes(q.toLocaleLowerCase("tr")))
    : CITY_NAMES;

  function toggleCity(c: string) {
    setCities((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  function uygula() {
    let cs: string[] = [];
    if (mode === "mine" && myCity) cs = [myCity];
    else if (mode === "select") cs = cities;
    onApply({ km: km.value, cities: cs, sort, minAge, maxAge, verified });
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="max-h-[85dvh] w-full overflow-y-auto rounded-t-3xl border-t border-border bg-surface p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{tf.title}</h2>
              <button onClick={onClose} aria-label={tf.close}>
                <X />
              </button>
            </div>

            {/* Mesafe slider */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium">{tf.priorityDistance}</p>
                <span className="rounded-full bg-brand/15 px-3 py-1 text-sm font-semibold text-brand">
                  {km.value === "all" ? tf.allTurkey : km.label}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={KM_OPTIONS.length - 1}
                step={1}
                value={kmIdx}
                onChange={(e) => setKmIdx(parseInt(e.target.value))}
                className="w-full accent-brand"
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted">
                <span>5 km</span>
                <span>{tf.allTurkey}</span>
              </div>
              <p className="mt-2 text-xs text-muted">
                {tf.priorityHint}
              </p>
            </div>

            {/* Yaş aralığı */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium">{tf.age}</p>
                <span className="rounded-full bg-brand/15 px-3 py-1 text-sm font-semibold text-brand">{minAge}–{maxAge}</span>
              </div>
              <div className="flex items-center gap-3">
                <input type="range" min={18} max={70} value={minAge} onChange={(e) => setMinAge(Math.min(parseInt(e.target.value), maxAge))} className="w-full accent-brand" />
                <input type="range" min={18} max={70} value={maxAge} onChange={(e) => setMaxAge(Math.max(parseInt(e.target.value), minAge))} className="w-full accent-brand" />
              </div>
            </div>

            {/* Doğrulanmış */}
            <button onClick={() => setVerified((v) => !v)} className="mb-6 flex w-full items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3">
              <span className="text-sm font-medium">{tf.verifiedOnly}</span>
              <span className={`relative h-6 w-11 rounded-full transition ${verified ? "bg-brand" : "bg-border"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${verified ? "left-[22px]" : "left-0.5"}`} />
              </span>
            </button>

            {/* Sıralama */}
            <div className="mb-6">
              <p className="mb-2 font-medium">{tf.sort}</p>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSort(s.value)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                      sort === s.value ? "border-brand bg-brand/10 text-brand" : "border-border text-muted"
                    }`}
                  >
                    {sortLabel[s.value]}
                  </button>
                ))}
              </div>
            </div>

            {/* Şehir */}
            <div className="mb-6">
              <p className="mb-2 font-medium">{tf.city}</p>
              <div className="mb-3 grid grid-cols-3 gap-2">
                {([["all", tf.allCities], ["mine", tf.myCity], ["select", tf.selectCity]] as const).map(
                  ([m, l]) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      disabled={m === "mine" && !myCity}
                      className={`rounded-xl border px-2 py-2 text-xs font-medium ${
                        mode === m ? "border-brand bg-brand/10 text-brand" : "border-border"
                      } ${m === "mine" && !myCity ? "opacity-40" : ""}`}
                    >
                      {l}
                    </button>
                  )
                )}
              </div>

              {mode === "select" && (
                <>
                  <div className="mb-2 flex items-center gap-2 rounded-2xl border border-border bg-elevated px-3">
                    <Search size={16} className="text-muted" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder={tf.searchCity}
                      className="w-full bg-transparent py-2.5 text-sm outline-none"
                    />
                  </div>
                  {cities.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {cities.map((c) => (
                        <button
                          key={c}
                          onClick={() => toggleCity(c)}
                          className="flex items-center gap-1 rounded-full bg-brand/15 px-2.5 py-1 text-xs text-brand"
                        >
                          {c} <X size={12} />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="max-h-44 overflow-y-auto rounded-2xl border border-border">
                    {filtered.slice(0, 80).map((c) => (
                      <button
                        key={c}
                        onClick={() => toggleCity(c)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-elevated"
                      >
                        <span className="flex items-center gap-2">
                          <MapPin size={14} className="text-muted" /> {c}
                        </span>
                        {cities.includes(c) && <Check size={16} className="text-brand" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={uygula}
              className="brand-gradient w-full rounded-2xl py-3 font-semibold text-white"
            >
              {tf.apply}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
