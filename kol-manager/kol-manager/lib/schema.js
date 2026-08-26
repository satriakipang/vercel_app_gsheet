// Satu sumber kebenaran untuk struktur tiap tab di Google Sheet.
// Urutan field = urutan kolom di sheet. Tambah field baru di paling kanan
// supaya data lama tidak bergeser.

export const SHEETS = {
  KOL: {
    title: "KOL",
    fields: [
      "id",
      "nama",
      "handle",
      "platform",
      "niche",
      "kota",
      "followers",
      "engagement",
      "rate_feed",
      "rate_story",
      "rate_reels",
      "telepon",
      "email",
      "status",
      "catatan",
      "dibuat",
    ],
    numeric: [
      "followers",
      "engagement",
      "rate_feed",
      "rate_story",
      "rate_reels",
    ],
  },
  Pipeline: {
    title: "Pipeline",
    fields: [
      "id",
      "kol_id",
      "kol_nama",
      "campaign",
      "tahap",
      "nilai",
      "pic",
      "aksi_berikutnya",
      "tenggat",
      "catatan",
      "diperbarui",
    ],
    numeric: ["nilai"],
  },
  Campaign: {
    title: "Campaign",
    fields: [
      "id",
      "nama",
      "brand",
      "objective",
      "mulai",
      "selesai",
      "budget",
      "status",
      "catatan",
    ],
    numeric: ["budget"],
  },
  Deliverables: {
    title: "Deliverables",
    fields: [
      "id",
      "campaign",
      "kol_nama",
      "jenis",
      "tenggat",
      "status",
      "link",
      "fee",
      "catatan",
    ],
    numeric: ["fee"],
  },
  Performance: {
    title: "Performance",
    fields: [
      "id",
      "campaign",
      "kol_nama",
      "tanggal",
      "views",
      "likes",
      "komentar",
      "klik",
      "order",
      "gmv",
      "biaya",
    ],
    numeric: ["views", "likes", "komentar", "klik", "order", "gmv", "biaya"],
  },
};

export const SHEET_NAMES = Object.keys(SHEETS);

export const TAHAP_PIPELINE = [
  "Prospek",
  "Approach",
  "Negosiasi",
  "Deal",
  "Batal",
];

export const STATUS_DELIVERABLE = [
  "Brief",
  "Draft",
  "Revisi",
  "Tayang",
  "Selesai",
];

export const PLATFORMS = ["Instagram", "TikTok", "YouTube", "X", "Facebook"];

// Dipakai saat sheet masih kosong, dan sebagai isi mode demo.
export const SEED = {
  KOL: [
    ["k1", "Sinta Maharani", "@sintadaily", "Instagram", "Lifestyle", "Jakarta", 78000, 4.8, 3500000, 1200000, 5000000, "0812-1000-0001", "sinta@mail.com", "Aktif", "", "2026-01-12"],
    ["k2", "Budi Pratama", "@budimasak", "TikTok", "Kuliner", "Bandung", 320000, 7.2, 6000000, 2000000, 8000000, "0812-1000-0002", "budi@mail.com", "Aktif", "Respon cepat, suka barter", "2026-01-12"],
    ["k3", "Rara Wibowo", "@rara.beauty", "Instagram", "Beauty", "Surabaya", 45000, 5.5, 2500000, 900000, 4000000, "0812-1000-0003", "rara@mail.com", "Aktif", "", "2026-01-14"],
    ["k4", "Deni Kurniawan", "@denitech", "YouTube", "Teknologi", "Jakarta", 210000, 3.1, 12000000, 3000000, 15000000, "0812-1000-0004", "deni@mail.com", "Aktif", "Butuh lead time 3 minggu", "2026-02-02"],
    ["k5", "Maya Anggraini", "@mayafit", "Instagram", "Fitness", "Depok", 62000, 6.1, 3000000, 1000000, 4500000, "0812-1000-0005", "maya@mail.com", "Aktif", "", "2026-02-08"],
    ["k6", "Fajar Ramadhan", "@fajartravels", "TikTok", "Travel", "Yogyakarta", 156000, 4.4, 5000000, 1500000, 7000000, "0812-1000-0006", "fajar@mail.com", "Jeda", "Sedang eksklusif brand lain s/d Sep", "2026-02-08"],
  ],
  Campaign: [
    ["c1", "Ramadan Beauty Push", "Elvicto", "GMV", "2026-03-01", "2026-03-28", 120000000, "Berjalan", ""],
    ["c2", "Kuliner Weekend Deal", "Sedaap Kitchen", "Awareness", "2026-02-15", "2026-04-15", 60000000, "Berjalan", ""],
    ["c3", "Back to Campus", "Denitech Store", "Traffic", "2026-06-01", "2026-07-15", 90000000, "Draft", ""],
  ],
  Pipeline: [
    ["p1", "k3", "Rara Wibowo", "Ramadan Beauty Push", "Deal", 6500000, "Satria", "Kirim PO", "2026-03-02", "", "2026-02-24"],
    ["p2", "k1", "Sinta Maharani", "Ramadan Beauty Push", "Negosiasi", 4700000, "Satria", "Nego bundling reels", "2026-02-28", "Minta +1 story gratis", "2026-02-25"],
    ["p3", "k2", "Budi Pratama", "Kuliner Weekend Deal", "Deal", 8000000, "Rina", "Jadwal shooting", "2026-03-05", "", "2026-02-26"],
    ["p4", "k5", "Maya Anggraini", "Ramadan Beauty Push", "Approach", 3000000, "Rina", "Follow up DM", "2026-03-01", "", "2026-02-26"],
    ["p5", "k4", "Deni Kurniawan", "Back to Campus", "Prospek", 15000000, "Satria", "Kirim deck", "2026-04-10", "", "2026-02-26"],
  ],
  Deliverables: [
    ["d1", "Ramadan Beauty Push", "Rara Wibowo", "Reels / Video", "2026-03-08", "Tayang", "https://instagram.com/p/contoh1", 4000000, ""],
    ["d2", "Ramadan Beauty Push", "Rara Wibowo", "Story", "2026-03-09", "Selesai", "https://instagram.com/stories/contoh", 900000, ""],
    ["d3", "Ramadan Beauty Push", "Sinta Maharani", "Feed", "2026-03-12", "Draft", "", 3500000, "Nunggu approval brand"],
    ["d4", "Kuliner Weekend Deal", "Budi Pratama", "Reels / Video", "2026-03-10", "Revisi", "", 8000000, "Revisi CTA di detik 3"],
    ["d5", "Kuliner Weekend Deal", "Budi Pratama", "Feed", "2026-03-18", "Brief", "", 6000000, ""],
  ],
  Performance: [
    ["v1", "Ramadan Beauty Push", "Rara Wibowo", "2026-03-08", 182000, 9800, 410, 3100, 168, 21400000, 4000000],
    ["v2", "Ramadan Beauty Push", "Rara Wibowo", "2026-03-09", 54000, 2100, 88, 900, 41, 5200000, 900000],
    ["v3", "Kuliner Weekend Deal", "Budi Pratama", "2026-03-10", 640000, 46000, 1900, 8200, 310, 38500000, 8000000],
    ["v4", "Ramadan Beauty Push", "Sinta Maharani", "2026-03-12", 96000, 4300, 210, 1400, 62, 7800000, 3500000],
  ],
};
