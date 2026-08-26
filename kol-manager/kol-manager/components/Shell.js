"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import KolDirectory from "./KolDirectory";
import RecordForm from "./RecordForm";
import {
  CampaignView,
  Dashboard,
  DeliverablesView,
  PerformanceView,
  PipelineBoard,
} from "./Views";

const EMPTY = {
  KOL: [],
  Pipeline: [],
  Campaign: [],
  Deliverables: [],
  Performance: [],
};

// Sheet mana yang dipakai tiap tampilan.
const SHEET_OF = {
  directory: "KOL",
  pipeline: "Pipeline",
  campaign: "Campaign",
  deliverables: "Deliverables",
  performance: "Performance",
};

export default function Shell() {
  const [view, setView] = useState("dashboard");
  const [data, setData] = useState(EMPTY);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // { sheet, record }
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setPass(sessionStorage.getItem("kol-pass") || "");
  }, []);

  const headers = useCallback(() => {
    const h = { "Content-Type": "application/json" };
    if (pass) h["x-app-password"] = pass;
    return h;
  }, [pass]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sheet", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memuat data.");
      setData({ ...EMPTY, ...json.data });
      setDemo(Boolean(json.demo));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  const save = async (sheet, draft) => {
    const editing = Boolean(draft.id);
    const res = await fetch("/api/sheet", {
      method: editing ? "PUT" : "POST",
      headers: headers(),
      body: JSON.stringify({ name: sheet, id: draft.id, row: draft }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Gagal menyimpan.");
    await load();
    flash(editing ? "Perubahan tersimpan." : "Baris baru ditambahkan.");
  };

  const remove = async (sheet, id) => {
    const res = await fetch(
      `/api/sheet?name=${encodeURIComponent(sheet)}&id=${encodeURIComponent(id)}`,
      { method: "DELETE", headers: headers() }
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Gagal menghapus.");
    await load();
    flash("Baris dihapus.");
  };

  const siapkanSheet = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/bootstrap", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ withSample: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      await load();
      flash(
        json.mode === "demo"
          ? "Masih mode demo — isi env var untuk menulis ke Sheet."
          : `Sheet siap. Tab dibuat: ${json.created.length || 0}, diisi contoh: ${json.seeded.length || 0}.`
      );
    } catch (e) {
      setError(e.message || "Gagal menyiapkan spreadsheet.");
    } finally {
      setBusy(false);
    }
  };

  const kolList = useMemo(() => data.KOL.map((k) => k.nama).filter(Boolean), [data.KOL]);
  const campaignList = useMemo(
    () => data.Campaign.map((c) => c.nama).filter(Boolean),
    [data.Campaign]
  );

  const openNew = (sheet) => setModal({ sheet, record: null });
  const openEdit = (sheet) => (record) => setModal({ sheet, record });

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar view={view} setView={setView} demo={demo} />

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {demo && (
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <span className="flex-1">
              Mode demo aktif. Data yang kamu ubah tidak tersimpan permanen — isi{" "}
              <code className="font-data text-xs">GOOGLE_SHEET_ID</code>,{" "}
              <code className="font-data text-xs">GOOGLE_SERVICE_ACCOUNT_EMAIL</code>, dan{" "}
              <code className="font-data text-xs">GOOGLE_PRIVATE_KEY</code> di Vercel untuk
              menyambung ke Google Sheet.
            </span>
          </div>
        )}

        {error && (
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <span className="flex-1">{error}</span>
            <button className="btn-ghost" onClick={load}>Coba lagi</button>
          </div>
        )}

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-card border border-ink-line bg-white/60" />
            ))}
          </div>
        ) : (
          <>
            {view === "dashboard" && <Dashboard data={data} setView={setView} />}
            {view === "directory" && (
              <KolDirectory
                rows={data.KOL}
                onEdit={openEdit("KOL")}
                onNew={() => openNew("KOL")}
              />
            )}
            {view === "pipeline" && (
              <PipelineBoard
                rows={data.Pipeline}
                onEdit={openEdit("Pipeline")}
                onNew={() => openNew("Pipeline")}
              />
            )}
            {view === "campaign" && (
              <CampaignView
                rows={data.Campaign}
                performance={data.Performance}
                onEdit={openEdit("Campaign")}
                onNew={() => openNew("Campaign")}
              />
            )}
            {view === "deliverables" && (
              <DeliverablesView
                rows={data.Deliverables}
                onEdit={openEdit("Deliverables")}
                onNew={() => openNew("Deliverables")}
              />
            )}
            {view === "performance" && (
              <PerformanceView
                rows={data.Performance}
                onEdit={openEdit("Performance")}
                onNew={() => openNew("Performance")}
              />
            )}
          </>
        )}

        <footer className="mt-10 flex flex-wrap items-center gap-3 border-t border-ink-line pt-5 text-xs text-ink-mute">
          <button className="btn-ghost" onClick={load} disabled={loading}>
            Muat ulang data
          </button>
          <button className="btn-ghost" onClick={siapkanSheet} disabled={busy}>
            {busy ? "Menyiapkan…" : "Siapkan sheet"}
          </button>
          <input
            className="field h-9 w-40 py-1 text-xs"
            type="password"
            placeholder="Kunci akses (opsional)"
            value={pass}
            onChange={(e) => {
              setPass(e.target.value);
              sessionStorage.setItem("kol-pass", e.target.value);
            }}
            aria-label="Kunci akses"
          />
          <span className="ml-auto">
            {demo ? "Sumber data: contoh bawaan" : "Sumber data: Google Sheets"}
          </span>
        </footer>
      </main>

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-white shadow-pop">
          {toast}
        </div>
      )}

      <RecordForm
        open={Boolean(modal)}
        sheet={modal?.sheet || "KOL"}
        record={modal?.record}
        onClose={() => setModal(null)}
        onSave={(draft) => save(modal.sheet, draft)}
        onDelete={(id) => remove(modal.sheet, id)}
        kolList={kolList}
        campaignList={campaignList}
      />
    </div>
  );
}
