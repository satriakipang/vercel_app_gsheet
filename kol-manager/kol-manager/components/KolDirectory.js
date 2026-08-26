"use client";

import { useMemo, useState } from "react";
import KolCard from "./KolCard";
import { EmptyState } from "./ui";
import { cpe, median, tierOf, TIERS } from "@/lib/format";

const SORTS = [
  { value: "cpe", label: "Paling efisien (biaya/engagement)" },
  { value: "followers", label: "Followers terbanyak" },
  { value: "engagement", label: "Engagement tertinggi" },
  { value: "murah", label: "Rate feed termurah" },
  { value: "nama", label: "Nama A–Z" },
];

export default function KolDirectory({ rows, onEdit, onNew }) {
  const [q, setQ] = useState("");
  const [tier, setTier] = useState("");
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("");
  const [sort, setSort] = useState("cpe");

  const niches = useMemo(
    () => [...new Set(rows.map((r) => r.niche).filter(Boolean))].sort(),
    [rows]
  );
  const platforms = useMemo(
    () => [...new Set(rows.map((r) => r.platform).filter(Boolean))].sort(),
    [rows]
  );

  const medianCpe = useMemo(
    () => median(rows.map((r) => cpe(r)).filter(Boolean)),
    [rows]
  );

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    const out = rows.filter((r) => {
      if (tier && tierOf(r.followers).key !== tier) return false;
      if (niche && r.niche !== niche) return false;
      if (platform && r.platform !== platform) return false;
      if (!term) return true;
      return [r.nama, r.handle, r.niche, r.kota, r.catatan]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });

    const by = {
      cpe: (a, b) => (cpe(a) ?? Infinity) - (cpe(b) ?? Infinity),
      followers: (a, b) => b.followers - a.followers,
      engagement: (a, b) => b.engagement - a.engagement,
      murah: (a, b) => (a.rate_feed || Infinity) - (b.rate_feed || Infinity),
      nama: (a, b) => String(a.nama).localeCompare(String(b.nama)),
    };
    return [...out].sort(by[sort]);
  }, [rows, q, tier, niche, platform, sort]);

  const reset = () => {
    setQ("");
    setTier("");
    setNiche("");
    setPlatform("");
  };
  const filtered = q || tier || niche || platform;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            KOL Directory
          </h1>
          <p className="mt-0.5 text-sm text-ink-mute">
            Database KOL &amp; rate card. Diurutkan dari yang paling efisien.
          </p>
        </div>
        <button className="btn-primary" onClick={onNew}>
          + KOL baru
        </button>
      </div>

      <div className="card mb-5 flex flex-col gap-2.5 p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[180px] flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"
            width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            className="field pl-9"
            placeholder="Cari nama, handle, kota…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Cari KOL"
          />
        </div>
        <select className="field sm:w-auto" value={tier} onChange={(e) => setTier(e.target.value)} aria-label="Tier">
          <option value="">Semua tier</option>
          {TIERS.map((t) => (
            <option key={t.key} value={t.key}>{t.label}</option>
          ))}
        </select>
        <select className="field sm:w-auto" value={platform} onChange={(e) => setPlatform(e.target.value)} aria-label="Platform">
          <option value="">Semua platform</option>
          {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="field sm:w-auto" value={niche} onChange={(e) => setNiche(e.target.value)} aria-label="Niche">
          <option value="">Semua niche</option>
          {niches.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <select className="field sm:w-auto" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Urutkan">
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        {filtered && (
          <button className="btn-ghost" onClick={reset}>
            Hapus filter
          </button>
        )}
      </div>

      <p className="mb-3 text-xs text-ink-mute">
        Menampilkan <span className="num font-semibold text-ink">{shown.length}</span> dari{" "}
        <span className="num">{rows.length}</span> KOL. Bar hijau = biaya per engagement di
        bawah median direktori.
      </p>

      {shown.length === 0 ? (
        <EmptyState
          title={filtered ? "Tidak ada yang cocok" : "Direktori masih kosong"}
          action={
            filtered ? (
              <button className="btn-ghost" onClick={reset}>Hapus filter</button>
            ) : (
              <button className="btn-primary" onClick={onNew}>+ KOL baru</button>
            )
          }
        >
          {filtered
            ? "Longgarkan filter atau ubah kata kuncinya."
            : "Tambah KOL pertama, atau jalankan Siapkan Sheet untuk mengisi data contoh."}
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((k) => (
            <KolCard key={k.id} kol={k} medianCpe={medianCpe} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
