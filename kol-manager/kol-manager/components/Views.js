"use client";

import { useMemo } from "react";
import Table from "./Table";
import { EmptyState, Pill, SectionHead, Stat } from "./ui";
import { TAHAP_PIPELINE } from "@/lib/schema";
import {
  angka,
  compact,
  cpe,
  hariMenujuTenggat,
  median,
  persen,
  rupiah,
  rupiahShort,
  tanggalPendek,
} from "@/lib/format";

const sum = (arr, k) => arr.reduce((a, r) => a + (Number(r[k]) || 0), 0);

const STATUS_COLOR = {
  Berjalan: "#0E7C66",
  Draft: "#8A94A0",
  Selesai: "#6D4AE0",
  Batal: "#B4200A",
  Tayang: "#0E7C66",
  Revisi: "#B4790A",
  Brief: "#8A94A0",
  Deal: "#0E7C66",
  Negosiasi: "#B4790A",
  Approach: "#6D4AE0",
  Prospek: "#8A94A0",
};

function Head({ title, sub, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">{title}</h1>
        {sub && <p className="mt-0.5 text-sm text-ink-mute">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------------------------------------------------------------- Dashboard */

export function Dashboard({ data, setView }) {
  const { KOL = [], Pipeline = [], Campaign = [], Deliverables = [], Performance = [] } = data;

  const m = useMemo(() => {
    const gmv = sum(Performance, "gmv");
    const biaya = sum(Performance, "biaya");
    const deals = Pipeline.filter((p) => p.tahap === "Deal");
    const jalan = Pipeline.filter((p) => !["Deal", "Batal"].includes(p.tahap));
    const engRata = KOL.length ? sum(KOL, "engagement") / KOL.length : 0;
    return {
      gmv,
      biaya,
      roas: biaya ? gmv / biaya : 0,
      totalFollowers: sum(KOL, "followers"),
      engRata,
      medianCpe: median(KOL.map((k) => cpe(k)).filter(Boolean)),
      nilaiDeal: sum(deals, "nilai"),
      nilaiJalan: sum(jalan, "nilai"),
      campaignAktif: Campaign.filter((c) => c.status === "Berjalan").length,
      budget: sum(Campaign.filter((c) => c.status === "Berjalan"), "budget"),
    };
  }, [KOL, Pipeline, Campaign, Performance]);

  const jatuhTempo = useMemo(
    () =>
      Deliverables.filter((d) => !["Selesai"].includes(d.status))
        .map((d) => ({ ...d, sisa: hariMenujuTenggat(d.tenggat) }))
        .filter((d) => d.sisa !== null)
        .sort((a, b) => a.sisa - b.sisa)
        .slice(0, 5),
    [Deliverables]
  );

  const teratas = useMemo(() => {
    const byKol = {};
    Performance.forEach((p) => {
      const k = p.kol_nama || "—";
      byKol[k] = byKol[k] || { kol: k, gmv: 0, biaya: 0 };
      byKol[k].gmv += Number(p.gmv) || 0;
      byKol[k].biaya += Number(p.biaya) || 0;
    });
    return Object.values(byKol)
      .map((r) => ({ ...r, roas: r.biaya ? r.gmv / r.biaya : 0 }))
      .sort((a, b) => b.roas - a.roas)
      .slice(0, 5);
  }, [Performance]);

  return (
    <div>
      <Head
        title="Dashboard"
        sub="Ringkasan database KOL, pipeline, dan hasil campaign yang sudah tayang."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total KOL" value={angka(KOL.length)} sub={`${compact(m.totalFollowers)} total followers`} />
        <Stat label="Engagement rata-rata" value={persen(m.engRata)} sub={m.medianCpe ? `Median ${rupiah(m.medianCpe)}/engagement` : "—"} />
        <Stat label="Deal terkunci" value={rupiahShort(m.nilaiDeal)} sub={`${rupiahShort(m.nilaiJalan)} masih diproses`} />
        <Stat label="ROAS" value={m.roas ? m.roas.toFixed(2).replace(".", ",") + "×" : "—"} sub={`${rupiahShort(m.gmv)} GMV / ${rupiahShort(m.biaya)} biaya`} accent="#0E7C66" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section>
          <SectionHead
            title="Deliverable terdekat"
            right={
              <button className="text-xs font-semibold text-jade" onClick={() => setView("deliverables")}>
                Lihat semua →
              </button>
            }
          />
          {jatuhTempo.length === 0 ? (
            <div className="card px-4 py-8 text-center text-sm text-ink-mute">
              Belum ada deliverable dengan tenggat.
            </div>
          ) : (
            <ul className="card divide-y divide-ink-line/60">
              {jatuhTempo.map((d) => (
                <li key={d.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className="h-8 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: d.sisa < 0 ? "#B4200A" : d.sisa <= 3 ? "#B4790A" : "#DCDFE3" }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{d.kol_nama}</div>
                    <div className="truncate text-xs text-ink-mute">
                      {d.jenis} · {d.campaign}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="num text-sm font-medium">{tanggalPendek(d.tenggat)}</div>
                    <div className="text-[11px] text-ink-mute">
                      {d.sisa < 0 ? `telat ${Math.abs(d.sisa)} hari` : d.sisa === 0 ? "hari ini" : `${d.sisa} hari lagi`}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <SectionHead
            title="KOL dengan ROAS terbaik"
            right={
              <button className="text-xs font-semibold text-jade" onClick={() => setView("performance")}>
                Lihat semua →
              </button>
            }
          />
          {teratas.length === 0 ? (
            <div className="card px-4 py-8 text-center text-sm text-ink-mute">
              Belum ada data performa yang dicatat.
            </div>
          ) : (
            <ul className="card divide-y divide-ink-line/60">
              {teratas.map((r) => (
                <li key={r.kol} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{r.kol}</div>
                    <div className="text-xs text-ink-mute">
                      {rupiahShort(r.gmv)} GMV · {rupiahShort(r.biaya)} biaya
                    </div>
                  </div>
                  <span className="num text-sm font-semibold text-jade">
                    {r.roas.toFixed(2).replace(".", ",")}×
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6">
        <SectionHead title="Campaign berjalan" count={m.campaignAktif} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Campaign.filter((c) => c.status === "Berjalan").map((c) => {
            const terpakai = sum(
              Performance.filter((p) => p.campaign === c.nama),
              "biaya"
            );
            const pct = c.budget ? Math.min(100, (terpakai / c.budget) * 100) : 0;
            return (
              <div key={c.id} className="card px-4 py-3.5">
                <div className="font-display text-[15px] font-bold">{c.nama}</div>
                <div className="text-xs text-ink-mute">{c.brand} · {c.objective}</div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-line">
                  <div className="h-full rounded-full bg-jade" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] text-ink-mute">
                  <span className="num">{rupiahShort(terpakai)} terpakai</span>
                  <span className="num">{rupiahShort(c.budget)}</span>
                </div>
              </div>
            );
          })}
          {m.campaignAktif === 0 && (
            <div className="card px-4 py-8 text-center text-sm text-ink-mute sm:col-span-2 lg:col-span-3">
              Tidak ada campaign berstatus Berjalan.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ----------------------------------------------------------------- Pipeline */

export function PipelineBoard({ rows, onEdit, onNew }) {
  const kolom = TAHAP_PIPELINE.map((t) => ({
    tahap: t,
    items: rows.filter((r) => r.tahap === t),
  }));

  return (
    <div>
      <Head
        title="Pipeline"
        sub="Status negosiasi tiap KOL, dari prospek sampai deal."
        action={<button className="btn-primary" onClick={onNew}>+ Deal baru</button>}
      />
      <div className="no-bar flex gap-3 overflow-x-auto pb-2">
        {kolom.map((k) => (
          <div key={k.tahap} className="w-[260px] shrink-0">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-sm font-semibold">{k.tahap}</span>
              <span className="num text-xs text-ink-mute">
                {k.items.length} · {rupiahShort(sum(k.items, "nilai"))}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {k.items.map((r) => {
                const sisa = hariMenujuTenggat(r.tenggat);
                return (
                  <button key={r.id} onClick={() => onEdit(r)} className="card px-3 py-2.5 text-left">
                    <div className="text-sm font-semibold">{r.kol_nama}</div>
                    <div className="truncate text-xs text-ink-mute">{r.campaign || "Tanpa campaign"}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="num text-sm font-medium">{rupiahShort(r.nilai)}</span>
                      {r.pic && <span className="text-[11px] text-ink-mute">{r.pic}</span>}
                    </div>
                    {r.aksi_berikutnya && (
                      <div className="mt-2 border-t border-ink-line pt-2 text-[11px] text-ink-soft">
                        {r.aksi_berikutnya}
                        {sisa !== null && (
                          <span className={sisa < 0 ? "text-red-600" : "text-ink-mute"}>
                            {" "}· {tanggalPendek(r.tenggat)}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
              {k.items.length === 0 && (
                <div className="rounded-card border border-dashed border-ink-line px-3 py-6 text-center text-xs text-ink-mute">
                  Kosong
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- Campaign */

export function CampaignView({ rows, performance, onEdit, onNew }) {
  const cols = [
    { k: "nama", l: "Campaign", render: (r) => <span className="font-semibold">{r.nama}</span> },
    { k: "brand", l: "Brand" },
    { k: "objective", l: "Objective" },
    { k: "periode", l: "Periode", render: (r) => `${tanggalPendek(r.mulai)} – ${tanggalPendek(r.selesai)}` },
    { k: "budget", l: "Budget", align: "right", mono: true, render: (r) => rupiahShort(r.budget) },
    {
      k: "gmv", l: "GMV", align: "right", mono: true,
      render: (r) => rupiahShort(sum(performance.filter((p) => p.campaign === r.nama), "gmv")),
    },
    {
      k: "status", l: "Status",
      render: (r) => <Pill color={STATUS_COLOR[r.status]}>{r.status || "—"}</Pill>,
    },
  ];

  return (
    <div>
      <Head
        title="Campaign"
        sub="Daftar campaign, budget, dan realisasi GMV-nya."
        action={<button className="btn-primary" onClick={onNew}>+ Campaign baru</button>}
      />
      <Table
        columns={cols}
        rows={rows}
        onRowClick={onEdit}
        empty={
          <EmptyState title="Belum ada campaign" action={<button className="btn-primary" onClick={onNew}>+ Campaign baru</button>}>
            Buat campaign dulu supaya deliverable dan performa bisa dikaitkan ke sana.
          </EmptyState>
        }
      />
    </div>
  );
}

/* ------------------------------------------------------------- Deliverables */

export function DeliverablesView({ rows, onEdit, onNew }) {
  const cols = [
    { k: "kol_nama", l: "KOL", render: (r) => <span className="font-semibold">{r.kol_nama}</span> },
    { k: "campaign", l: "Campaign" },
    { k: "jenis", l: "Jenis" },
    {
      k: "tenggat", l: "Tenggat", mono: true,
      render: (r) => {
        const sisa = hariMenujuTenggat(r.tenggat);
        const telat = sisa !== null && sisa < 0 && r.status !== "Selesai";
        return <span className={telat ? "text-red-600" : ""}>{tanggalPendek(r.tenggat)}</span>;
      },
    },
    { k: "fee", l: "Fee", align: "right", mono: true, render: (r) => rupiahShort(r.fee) },
    { k: "status", l: "Status", render: (r) => <Pill color={STATUS_COLOR[r.status]}>{r.status || "—"}</Pill> },
    {
      k: "link", l: "Link",
      render: (r) =>
        r.link ? (
          <a
            href={r.link}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="font-semibold text-jade hover:underline"
          >
            Buka
          </a>
        ) : "—",
    },
  ];

  return (
    <div>
      <Head
        title="Deliverables"
        sub="Konten yang harus tayang, beserta tenggat dan fee-nya."
        action={<button className="btn-primary" onClick={onNew}>+ Deliverable</button>}
      />
      <Table
        columns={cols}
        rows={rows}
        onRowClick={onEdit}
        empty={
          <EmptyState title="Belum ada deliverable" action={<button className="btn-primary" onClick={onNew}>+ Deliverable</button>}>
            Catat konten yang disepakati supaya tenggatnya muncul di dashboard.
          </EmptyState>
        }
      />
    </div>
  );
}

/* -------------------------------------------------------------- Performance */

export function PerformanceView({ rows, onEdit, onNew }) {
  const total = useMemo(
    () => ({
      views: sum(rows, "views"),
      klik: sum(rows, "klik"),
      order: sum(rows, "order"),
      gmv: sum(rows, "gmv"),
      biaya: sum(rows, "biaya"),
    }),
    [rows]
  );
  const roas = total.biaya ? total.gmv / total.biaya : 0;
  const cvr = total.klik ? (total.order / total.klik) * 100 : 0;

  const cols = [
    { k: "kol_nama", l: "KOL", render: (r) => <span className="font-semibold">{r.kol_nama}</span> },
    { k: "campaign", l: "Campaign" },
    { k: "tanggal", l: "Tanggal", mono: true, render: (r) => tanggalPendek(r.tanggal) },
    { k: "views", l: "Views", align: "right", mono: true, render: (r) => compact(r.views) },
    { k: "klik", l: "Klik", align: "right", mono: true, render: (r) => angka(r.klik) },
    { k: "order", l: "Order", align: "right", mono: true, render: (r) => angka(r.order) },
    { k: "gmv", l: "GMV", align: "right", mono: true, render: (r) => rupiahShort(r.gmv) },
    {
      k: "roas", l: "ROAS", align: "right", mono: true,
      render: (r) => {
        const v = Number(r.biaya) ? Number(r.gmv) / Number(r.biaya) : 0;
        return (
          <span className={v >= 1 ? "font-semibold text-jade" : "text-ink-mute"}>
            {v ? v.toFixed(2).replace(".", ",") + "×" : "—"}
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <Head
        title="Performance"
        sub="Hasil aktual tiap konten yang sudah tayang."
        action={<button className="btn-primary" onClick={onNew}>+ Catat hasil</button>}
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total views" value={compact(total.views)} />
        <Stat label="Order" value={angka(total.order)} sub={`CVR ${persen(cvr)} dari klik`} />
        <Stat label="GMV" value={rupiahShort(total.gmv)} sub={`Biaya ${rupiahShort(total.biaya)}`} />
        <Stat label="ROAS" value={roas ? roas.toFixed(2).replace(".", ",") + "×" : "—"} accent="#0E7C66" />
      </div>
      <Table
        columns={cols}
        rows={rows}
        onRowClick={onEdit}
        empty={
          <EmptyState title="Belum ada hasil dicatat" action={<button className="btn-primary" onClick={onNew}>+ Catat hasil</button>}>
            Isi views, klik, order, dan GMV per konten untuk melihat ROAS per KOL.
          </EmptyState>
        }
      />
    </div>
  );
}
