"use client";

import {
  compact,
  cpe,
  persen,
  rupiah,
  rupiahShort,
  tierOf,
  TIER_COLOR,
} from "@/lib/format";

function initials(nama = "") {
  return nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const RATES = [
  ["Feed", "rate_feed"],
  ["Story", "rate_story"],
  ["Reels / Video", "rate_reels"],
];

export default function KolCard({ kol, medianCpe, onEdit }) {
  const tier = tierOf(kol.followers);
  const color = TIER_COLOR[tier.key];
  const biaya = cpe(kol);

  // Rasio terhadap median: <1 berarti lebih murah per engagement.
  const ratio = biaya && medianCpe ? biaya / medianCpe : null;
  const width = ratio ? Math.max(6, Math.min(100, (ratio / 2) * 100)) : 0;
  const hemat = ratio != null && ratio <= 1;

  return (
    <article className="card group relative flex flex-col overflow-hidden text-left">
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />

      <button
        onClick={() => onEdit(kol)}
        className="flex flex-1 flex-col px-4 py-4 pl-5 text-left"
      >
        <header className="flex items-start gap-3">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg font-display text-sm font-bold text-white"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          >
            {initials(kol.nama)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-[15px] font-bold leading-tight">
              {kol.nama || "Tanpa nama"}
            </div>
            <div className="truncate font-data text-xs text-ink-mute">
              {kol.handle}
            </div>
          </div>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 font-data text-[10px] font-semibold uppercase tracking-wider"
            style={{ color, backgroundColor: color + "18" }}
          >
            {tier.label}
          </span>
        </header>

        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-ink-soft">
          {[kol.platform, kol.niche, kol.kota].filter(Boolean).map((t, i) => (
            <span key={i} className="rounded-md bg-canvas px-1.5 py-0.5">
              {t}
            </span>
          ))}
          {kol.status && kol.status !== "Aktif" && (
            <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-amber-700">
              {kol.status}
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <div className="eyebrow">Followers</div>
            <div className="num text-lg font-semibold leading-none">
              {compact(kol.followers)}
            </div>
          </div>
          <div>
            <div className="eyebrow">Engagement</div>
            <div className="num text-lg font-semibold leading-none">
              {persen(kol.engagement)}
            </div>
          </div>
        </div>

        {/* Metrik penentu: berapa rupiah untuk satu engagement. */}
        <div className="mt-4 rounded-lg bg-canvas/70 px-3 py-2.5">
          <div className="flex items-baseline justify-between">
            <span className="eyebrow">Biaya / engagement</span>
            <span className="num text-sm font-semibold" style={{ color }}>
              {biaya ? rupiah(biaya) : "—"}
            </span>
          </div>
          {ratio != null && (
            <>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-line">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${width}%`,
                    backgroundColor: hemat ? "#0E7C66" : "#B4790A",
                  }}
                />
              </div>
              <div className="mt-1.5 text-[11px] text-ink-mute">
                {hemat
                  ? `${Math.round((1 - ratio) * 100)}% lebih murah dari median`
                  : `${Math.round((ratio - 1) * 100)}% lebih mahal dari median`}
              </div>
            </>
          )}
        </div>

        <div className="mt-4 border-t border-ink-line pt-3">
          <div className="eyebrow mb-1.5">Rate card</div>
          <dl className="space-y-1">
            {RATES.map(([label, key]) => (
              <div key={key} className="flex justify-between text-[13px]">
                <dt className="text-ink-soft">{label}</dt>
                <dd className="num font-medium">{rupiahShort(kol[key])}</dd>
              </div>
            ))}
          </dl>
        </div>
      </button>
    </article>
  );
}
