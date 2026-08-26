// Tier ditentukan dari jumlah follower, bukan diisi manual, supaya tidak
// pernah bentrok dengan angkanya sendiri.
export const TIERS = [
  { key: "NANO", label: "Nano", max: 10000 },
  { key: "MICRO", label: "Micro", max: 100000 },
  { key: "MACRO", label: "Macro", max: 1000000 },
  { key: "MEGA", label: "Mega", max: Infinity },
];

export function tierOf(followers) {
  const n = Number(followers) || 0;
  return TIERS.find((t) => n < t.max) || TIERS[TIERS.length - 1];
}

export const TIER_COLOR = {
  NANO: "#8A94A0",
  MICRO: "#0E7C66",
  MACRO: "#6D4AE0",
  MEGA: "#B4790A",
};

export function compact(n) {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return trim(v / 1_000_000) + "M";
  if (v >= 1_000) return trim(v / 1_000) + "K";
  return String(Math.round(v));
}

function trim(v) {
  return String(Number(v.toFixed(1))).replace(".", ",");
}

// Rp 3,5jt / Rp 900rb — format pendek ala rate card.
export function rupiahShort(n) {
  const v = Number(n) || 0;
  if (v === 0) return "—";
  if (v >= 1_000_000_000) return "Rp" + trim(v / 1_000_000_000) + "M";
  if (v >= 1_000_000) return "Rp" + trim(v / 1_000_000) + "jt";
  if (v >= 1_000) return "Rp" + trim(v / 1_000) + "rb";
  return "Rp" + Math.round(v);
}

export function rupiah(n) {
  return "Rp" + new Intl.NumberFormat("id-ID").format(Math.round(Number(n) || 0));
}

export function angka(n) {
  return new Intl.NumberFormat("id-ID").format(Math.round(Number(n) || 0));
}

export function persen(n, digits = 1) {
  return (Number(n) || 0).toFixed(digits).replace(".", ",") + "%";
}

// --- Metrik andalan --------------------------------------------------------
// CPE = biaya per satu engagement. Ini yang bikin direktori bisa dipakai
// untuk memilih, bukan cuma untuk melihat.
export function engagedAudience(kol) {
  return (Number(kol.followers) || 0) * ((Number(kol.engagement) || 0) / 100);
}

export function cpe(kol) {
  const audience = engagedAudience(kol);
  const rate = Number(kol.rate_feed) || Number(kol.rate_reels) || 0;
  if (!audience || !rate) return null;
  return rate / audience;
}

export function median(values) {
  const arr = values.filter((v) => typeof v === "number" && isFinite(v)).sort((a, b) => a - b);
  if (!arr.length) return null;
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}

export function tanggalPendek(s) {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function hariMenujuTenggat(s) {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d)) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}
