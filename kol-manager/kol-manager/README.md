# KOL Manager

Aplikasi manajemen KOL dengan **Google Sheets sebagai database** dan **Next.js** sebagai front-end, siap deploy ke Vercel.

Sheet-nya tetap bisa kamu buka dan edit manual seperti biasa — app ini cuma jadi antarmuka yang lebih enak dipakai di atasnya.

## Isinya

| Halaman | Gunanya |
|---|---|
| **Dashboard** | Ringkasan KOL, nilai deal, ROAS, deliverable yang mendekati tenggat |
| **KOL Directory** | Database KOL + rate card, dengan filter tier/platform/niche |
| **Pipeline** | Papan tahap negosiasi: Prospek → Approach → Negosiasi → Deal |
| **Campaign** | Daftar campaign, budget, dan realisasi GMV |
| **Deliverables** | Konten yang harus tayang, tenggat, fee, link |
| **Performance** | Views, klik, order, GMV, dan ROAS per konten |

**Biaya per engagement.** Tiap kartu KOL menghitung `rate ÷ (followers × engagement%)` — berapa rupiah yang kamu bayar untuk satu engagement — lalu membandingkannya dengan median direktori. Bar hijau berarti lebih murah dari median, kuning berarti lebih mahal. Ini yang membuat direktori bisa dipakai untuk memilih, bukan cuma untuk melihat. Default urutannya pakai metrik ini.

Tier (Nano / Micro / Macro / Mega) **dihitung dari jumlah follower**, bukan diisi manual, jadi tidak pernah bentrok dengan angkanya sendiri.

## Jalan dulu tanpa setup apa pun

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Tanpa env var, app jalan dalam **mode demo** dengan data contoh di memori — semua fitur bisa dicoba, tapi perubahan tidak tersimpan permanen.

## Menyambung ke Google Sheet

### 1. Buat service account

1. Buka [Google Cloud Console](https://console.cloud.google.com) → buat project (atau pakai yang ada).
2. **APIs & Services → Library** → cari **Google Sheets API** → **Enable**.
3. **APIs & Services → Credentials → Create Credentials → Service account**. Beri nama, lalu **Create**.
4. Klik service account itu → tab **Keys → Add Key → Create new key → JSON**. File JSON otomatis terunduh.

### 2. Share spreadsheet ke service account

Buka file JSON tadi, salin nilai `client_email` (bentuknya `nama@project.iam.gserviceaccount.com`). Di Google Sheet kamu, klik **Share** → tempel email itu → beri akses **Editor**.

Ini langkah yang paling sering kelewat. Kalau nanti muncul error 403, biasanya ini penyebabnya.

### 3. Isi environment variable

Salin `.env.example` jadi `.env.local`:

```bash
GOOGLE_SHEET_ID=1d5K_Val3xxxxxxxxxxxxxxxxxxxxx
GOOGLE_SERVICE_ACCOUNT_EMAIL=nama@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

- `GOOGLE_SHEET_ID` diambil dari URL sheet: `docs.google.com/spreadsheets/d/`**`ID_INI`**`/edit`
- `GOOGLE_PRIVATE_KEY` disalin dari field `private_key` di file JSON, **apa adanya** termasuk `\n`-nya, dibungkus tanda kutip ganda.

### 4. Siapkan tab-nya

Jalankan app, lalu klik **Siapkan sheet** di bagian bawah halaman. Tombol itu membuat tab `KOL`, `Pipeline`, `Campaign`, `Deliverables`, `Performance` beserta baris header-nya, dan mengisi data contoh kalau tab-nya masih kosong.

Kalau kamu sudah punya sheet KOL sendiri, samakan saja nama header baris 1 dengan yang ada di `lib/schema.js`, dan pastikan kolom `id` terisi unik.

## Deploy ke Vercel

```bash
npm i -g vercel
vercel
```

Atau lewat dashboard: push repo ke GitHub → **Add New Project** di Vercel → pilih repo-nya. Next.js terdeteksi otomatis, tidak perlu ubah build setting.

Lalu di **Project Settings → Environment Variables**, tambahkan tiga variabel di atas untuk environment Production, Preview, dan Development.

Untuk `GOOGLE_PRIVATE_KEY`, tempel isinya termasuk `\n` literal. Vercel menyimpannya sebagai string biasa, dan app sudah mengembalikan `\n` jadi newline asli saat runtime — jadi tidak perlu diapa-apakan.

Setelah env var ditambahkan, klik **Redeploy** supaya kepakai.

## Mengunci akses

App ini tidak punya login. Dua pilihan:

**Vercel Authentication** (paling praktis) — di **Project Settings → Deployment Protection**, nyalakan **Vercel Authentication**. Hanya anggota tim Vercel kamu yang bisa membuka.

**Kunci sederhana** — isi env var `APP_PASSWORD`. Semua operasi tulis (tambah/ubah/hapus) akan menolak kalau kuncinya salah. Kuncinya diketik sekali di kolom kecil di bagian bawah halaman. Catatan: ini hanya melindungi penulisan, bukan pembacaan.

## Mengubah struktur data

Semuanya diatur dari satu file: `lib/schema.js`.

Mau menambah kolom, misalnya `agency` di KOL? Tambahkan `"agency"` **di paling akhir** array `fields` (supaya data lama tidak bergeser), lalu tambahkan kolomnya di sheet. Untuk memunculkannya di form, tambahkan entri di `FORMS.KOL.fields` pada `components/RecordForm.js`.

Kalau kolomnya berisi angka, daftarkan juga namanya di array `numeric` supaya diperlakukan sebagai angka, bukan teks.

## Struktur file

```
app/
  api/sheet/route.js      CRUD untuk semua sheet
  api/bootstrap/route.js  bikin tab + header + data contoh
  page.js, layout.js
components/
  Shell.js          state, fetch, routing antar tampilan
  Sidebar.js        navigasi
  KolDirectory.js   pencarian, filter, urutan
  KolCard.js        kartu KOL + meter biaya/engagement
  RecordForm.js     form untuk semua sheet
  Views.js          Dashboard, Pipeline, Campaign, Deliverables, Performance
  Table.js, ui.js   komponen dasar
lib/
  schema.js         struktur kolom + data contoh
  sheets.js         akses Google Sheets REST API
  format.js         format Rupiah, tier, metrik CPE
```

## Catatan teknis

Aplikasi memanggil Sheets REST API langsung lewat `fetch`, bukan lewat paket `googleapis` yang berukuran ratusan MB. Bundle serverless-nya jadi jauh lebih kecil dan cold start-nya lebih cepat.

Google Sheets API punya kuota **60 permintaan baca per menit per user**. Untuk tim kecil ini lapang, tapi kalau nanti datanya sudah ribuan baris dan dipakai banyak orang bersamaan, pertimbangkan pindah ke Postgres (Neon/Supabase) dan pakai sheet-nya khusus untuk ekspor.

## Alternatif tanpa Google Cloud

Kalau tidak mau berurusan dengan service account, kamu bisa deploy Apps Script yang sudah ada sebagai Web App (`doGet`/`doPost`, akses "Anyone"), lalu ganti isi `lib/sheets.js` supaya memanggil URL itu. Lebih cepat disiapkan, tapi endpoint-nya terbuka bagi siapa pun yang tahu URL-nya — jadi jangan dipakai untuk data yang sensitif.
