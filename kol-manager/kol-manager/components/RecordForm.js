"use client";

import { useEffect, useState } from "react";
import { Modal, Field } from "./ui";
import { compact, persen, rupiah, tierOf, cpe } from "@/lib/format";
import { PLATFORMS, STATUS_DELIVERABLE, TAHAP_PIPELINE } from "@/lib/schema";

// Spesifikasi form per sheet. `w` = lebar kolom pada grid 2 kolom.
export const FORMS = {
  KOL: {
    title: "KOL",
    fields: [
      { k: "nama", l: "Nama lengkap", req: true },
      { k: "handle", l: "Handle", ph: "@namaakun" },
      { k: "platform", l: "Platform", type: "select", opts: PLATFORMS },
      { k: "niche", l: "Niche", ph: "Beauty, Kuliner, …" },
      { k: "kota", l: "Kota" },
      { k: "status", l: "Status", type: "select", opts: ["Aktif", "Jeda", "Blacklist"] },
      { k: "followers", l: "Followers", type: "number", ph: "78000" },
      { k: "engagement", l: "Engagement (%)", type: "number", step: "0.1", ph: "4.8" },
      { k: "rate_feed", l: "Rate feed (Rp)", type: "number" },
      { k: "rate_story", l: "Rate story (Rp)", type: "number" },
      { k: "rate_reels", l: "Rate reels / video (Rp)", type: "number" },
      { k: "telepon", l: "Telepon" },
      { k: "email", l: "Email", type: "email" },
      { k: "catatan", l: "Catatan", type: "textarea", w: 2 },
    ],
  },
  Pipeline: {
    title: "deal",
    fields: [
      { k: "kol_nama", l: "KOL", type: "kol", req: true, w: 2 },
      { k: "campaign", l: "Campaign", type: "campaign", w: 2 },
      { k: "tahap", l: "Tahap", type: "select", opts: TAHAP_PIPELINE },
      { k: "nilai", l: "Nilai deal (Rp)", type: "number" },
      { k: "pic", l: "PIC" },
      { k: "tenggat", l: "Tenggat", type: "date" },
      { k: "aksi_berikutnya", l: "Aksi berikutnya", w: 2, ph: "Kirim PO, follow up DM, …" },
      { k: "catatan", l: "Catatan", type: "textarea", w: 2 },
    ],
  },
  Campaign: {
    title: "campaign",
    fields: [
      { k: "nama", l: "Nama campaign", req: true, w: 2 },
      { k: "brand", l: "Brand" },
      { k: "objective", l: "Objective", type: "select", opts: ["GMV", "Awareness", "Traffic", "Engagement"] },
      { k: "mulai", l: "Mulai", type: "date" },
      { k: "selesai", l: "Selesai", type: "date" },
      { k: "budget", l: "Budget (Rp)", type: "number" },
      { k: "status", l: "Status", type: "select", opts: ["Draft", "Berjalan", "Selesai", "Batal"] },
      { k: "catatan", l: "Catatan", type: "textarea", w: 2 },
    ],
  },
  Deliverables: {
    title: "deliverable",
    fields: [
      { k: "kol_nama", l: "KOL", type: "kol", req: true },
      { k: "campaign", l: "Campaign", type: "campaign" },
      { k: "jenis", l: "Jenis", type: "select", opts: ["Feed", "Story", "Reels / Video", "Live", "Review"] },
      { k: "status", l: "Status", type: "select", opts: STATUS_DELIVERABLE },
      { k: "tenggat", l: "Tenggat", type: "date" },
      { k: "fee", l: "Fee (Rp)", type: "number" },
      { k: "link", l: "Link konten", w: 2, ph: "https://" },
      { k: "catatan", l: "Catatan", type: "textarea", w: 2 },
    ],
  },
  Performance: {
    title: "hasil",
    fields: [
      { k: "kol_nama", l: "KOL", type: "kol", req: true },
      { k: "campaign", l: "Campaign", type: "campaign" },
      { k: "tanggal", l: "Tanggal", type: "date" },
      { k: "views", l: "Views", type: "number" },
      { k: "likes", l: "Likes", type: "number" },
      { k: "komentar", l: "Komentar", type: "number" },
      { k: "klik", l: "Klik", type: "number" },
      { k: "order", l: "Order", type: "number" },
      { k: "gmv", l: "GMV (Rp)", type: "number" },
      { k: "biaya", l: "Biaya (Rp)", type: "number" },
    ],
  },
};

export default function RecordForm({
  sheet,
  record,
  open,
  onClose,
  onSave,
  onDelete,
  kolList = [],
  campaignList = [],
}) {
  const spec = FORMS[sheet];
  const [draft, setDraft] = useState({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setDraft(record || {});
    setErr("");
  }, [record, open]);

  if (!spec) return null;
  const editing = Boolean(record?.id);
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  const submit = async () => {
    const missing = spec.fields.find((f) => f.req && !String(draft[f.k] || "").trim());
    if (missing) return setErr(`${missing.l} belum diisi.`);
    setBusy(true);
    setErr("");
    try {
      await onSave(draft);
      onClose();
    } catch (e) {
      setErr(e.message || "Gagal menyimpan.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await onDelete(record.id);
      onClose();
    } catch (e) {
      setErr(e.message || "Gagal menghapus.");
      setBusy(false);
    }
  };

  const preview = sheet === "KOL" ? previewKol(draft) : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? `Ubah ${spec.title}` : `Tambah ${spec.title}`}
      subtitle={
        editing ? "Perubahan langsung ditulis ke Google Sheet." : "Baris baru ditambahkan di bawah."
      }
      footer={
        <>
          {editing && (
            <button
              className="btn mr-auto text-sm font-semibold text-red-600 hover:bg-red-50"
              onClick={remove}
              disabled={busy}
            >
              Hapus
            </button>
          )}
          <button className="btn-ghost" onClick={onClose} disabled={busy}>
            Batal
          </button>
          <button className="btn-primary" onClick={submit} disabled={busy}>
            {busy ? "Menyimpan…" : "Simpan"}
          </button>
        </>
      }
    >
      {err && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      {preview && (
        <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 rounded-lg bg-canvas px-3 py-2.5 text-sm">
          <span className="text-ink-mute">
            Tier <b className="text-ink">{preview.tier}</b>
          </span>
          <span className="text-ink-mute">
            Audiens engaged <b className="num text-ink">{preview.engaged}</b>
          </span>
          <span className="text-ink-mute">
            Biaya / engagement <b className="num text-ink">{preview.cpe}</b>
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {spec.fields.map((f) => (
          <Field
            key={f.k}
            label={f.l + (f.req ? " *" : "")}
            className={f.w === 2 ? "sm:col-span-2" : ""}
          >
            {f.type === "textarea" ? (
              <textarea
                className="field min-h-[72px] resize-y"
                value={draft[f.k] ?? ""}
                onChange={(e) => set(f.k, e.target.value)}
                placeholder={f.ph}
              />
            ) : f.type === "select" ? (
              <select
                className="field"
                value={draft[f.k] ?? ""}
                onChange={(e) => set(f.k, e.target.value)}
              >
                <option value="">— pilih —</option>
                {f.opts.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : f.type === "kol" || f.type === "campaign" ? (
              <>
                <input
                  className="field"
                  list={`list-${f.type}`}
                  value={draft[f.k] ?? ""}
                  onChange={(e) => set(f.k, e.target.value)}
                  placeholder={f.type === "kol" ? "Pilih atau ketik nama" : "Pilih atau ketik campaign"}
                />
                <datalist id={`list-${f.type}`}>
                  {(f.type === "kol" ? kolList : campaignList).map((o) => (
                    <option key={o} value={o} />
                  ))}
                </datalist>
              </>
            ) : (
              <input
                className="field"
                type={f.type || "text"}
                step={f.step}
                value={draft[f.k] ?? ""}
                onChange={(e) => set(f.k, e.target.value)}
                placeholder={f.ph}
              />
            )}
          </Field>
        ))}
      </div>
    </Modal>
  );
}

function previewKol(d) {
  const followers = Number(d.followers) || 0;
  const eng = Number(d.engagement) || 0;
  if (!followers) return null;
  const c = cpe({ followers, engagement: eng, rate_feed: d.rate_feed, rate_reels: d.rate_reels });
  return {
    tier: tierOf(followers).label,
    engaged: compact(followers * (eng / 100)),
    cpe: c ? rupiah(c) : "—",
  };
}
