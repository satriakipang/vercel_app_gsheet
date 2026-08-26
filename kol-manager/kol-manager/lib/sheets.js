import { JWT } from "google-auth-library";
import { SHEETS, SHEET_NAMES, SEED } from "./schema";

const API = "https://sheets.googleapis.com/v4/spreadsheets";
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export function isConfigured() {
  return Boolean(
    process.env.GOOGLE_SHEET_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY
  );
}

const sheetId = () => process.env.GOOGLE_SHEET_ID;

let jwt;
async function token() {
  if (!jwt) {
    jwt = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      // Vercel menyimpan newline sebagai "\n" literal, jadi dikembalikan dulu.
      key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      scopes: SCOPES,
    });
  }
  const { access_token } = await jwt.getAccessToken();
  return access_token;
}

// Memanggil Sheets REST API langsung — jauh lebih ringan daripada menarik
// seluruh paket googleapis ke dalam bundle serverless.
async function call(path, { method = "GET", body, query } = {}) {
  const url = new URL(`${API}/${sheetId()}${path}`);
  Object.entries(query || {}).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${await token()}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(pesanRamah(json?.error?.message || "", res.status));
  }
  return json;
}

// Pesan error Google cukup teknis; ini menerjemahkan yang paling sering muncul.
function pesanRamah(msg, status) {
  if (status === 403)
    return "Service account belum punya akses. Share spreadsheet-nya ke email service account sebagai Editor.";
  if (status === 404)
    return "Spreadsheet tidak ditemukan. Cek lagi GOOGLE_SHEET_ID-nya.";
  if (/Unable to parse range/i.test(msg))
    return "Tab yang diminta belum ada di spreadsheet. Klik Siapkan sheet dulu.";
  if (/invalid_grant|Invalid JWT/i.test(msg))
    return "Kredensial ditolak. Cek GOOGLE_PRIVATE_KEY — newline harus utuh sebagai \\n.";
  return msg || `Sheets API error ${status}`;
}

const range = (r) => "/values/" + encodeURIComponent(r);

// --- Mode demo -------------------------------------------------------------
// Tanpa env var, app tetap jalan pakai data contoh di memori. Berguna untuk
// preview cepat, tapi perubahan tidak tersimpan permanen.
const demo = globalThis.__kolDemo || (globalThis.__kolDemo = structuredClone(SEED));

// --- Konversi baris <-> objek ----------------------------------------------

function toObjects(name, rows) {
  const { fields, numeric = [] } = SHEETS[name];
  return rows
    .filter((r) => r && r[0])
    .map((r) => {
      const o = {};
      fields.forEach((f, i) => {
        const raw = r[i];
        o[f] = numeric.includes(f) ? num(raw) : raw == null ? "" : String(raw);
      });
      return o;
    });
}

function toRow(name, obj) {
  return SHEETS[name].fields.map((f) => (obj[f] == null ? "" : obj[f]));
}

// Sheet bisa mengirim angka sebagai teks berformat Indonesia. Ini menerima
// "Rp1.500.000", "1.234,5", "4,8", dan "4.8" tanpa salah baca.
function num(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (v === "" || v == null) return 0;

  let s = String(v).trim().replace(/[^\d.,-]/g, "");
  if (!s) return 0;

  const dots = (s.match(/\./g) || []).length;
  if (s.includes(",")) {
    // Titik = pemisah ribuan, koma = desimal.
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (dots > 1 || /\.\d{3}$/.test(s)) {
    // "1.500.000" atau "3.500" — titiknya pemisah ribuan, bukan desimal.
    s = s.replace(/\./g, "");
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function colLetter(n) {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - m) / 26);
  }
  return s;
}

export function newId(prefix) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

// --- Operasi ---------------------------------------------------------------

export async function readSheet(name) {
  if (!SHEETS[name]) throw new Error(`Sheet "${name}" tidak dikenal.`);
  if (!isConfigured()) return toObjects(name, demo[name] || []);

  const last = colLetter(SHEETS[name].fields.length);
  const json = await call(range(`${name}!A2:${last}`));
  return toObjects(name, json.values || []);
}

export async function readAll() {
  const out = {};
  await Promise.all(
    SHEET_NAMES.map(async (n) => {
      out[n] = await readSheet(n);
    })
  );
  return out;
}

export async function appendRow(name, obj) {
  const row = toRow(name, obj);
  if (!isConfigured()) {
    demo[name] = demo[name] || [];
    demo[name].push(row);
    return obj;
  }
  const last = colLetter(SHEETS[name].fields.length);
  await call(range(`${name}!A:${last}`) + ":append", {
    method: "POST",
    query: { valueInputOption: "USER_ENTERED", insertDataOption: "INSERT_ROWS" },
    body: { values: [row] },
  });
  return obj;
}

async function findRowIndex(name, id) {
  if (!isConfigured()) {
    return (demo[name] || []).findIndex((r) => String(r[0]) === String(id));
  }
  const json = await call(range(`${name}!A2:A`));
  const ids = (json.values || []).map((r) => String(r[0] ?? ""));
  return ids.findIndex((v) => v === String(id));
}

export async function updateRow(name, id, obj) {
  const i = await findRowIndex(name, id);
  if (i < 0) throw new Error(`Baris dengan id ${id} sudah tidak ada di sheet.`);
  const row = toRow(name, { ...obj, id });

  if (!isConfigured()) {
    demo[name][i] = row;
    return obj;
  }
  const last = colLetter(SHEETS[name].fields.length);
  const line = i + 2; // baris 1 = header
  await call(range(`${name}!A${line}:${last}${line}`), {
    method: "PUT",
    query: { valueInputOption: "USER_ENTERED" },
    body: { values: [row] },
  });
  return obj;
}

export async function deleteRow(name, id) {
  const i = await findRowIndex(name, id);
  if (i < 0) throw new Error(`Baris dengan id ${id} sudah tidak ada di sheet.`);

  if (!isConfigured()) {
    demo[name].splice(i, 1);
    return { ok: true };
  }
  const meta = await call("", { query: { fields: "sheets.properties" } });
  const tab = meta.sheets.find((s) => s.properties.title === name);
  if (!tab) throw new Error(`Tab "${name}" tidak ada di spreadsheet.`);

  await call(":batchUpdate", {
    method: "POST",
    body: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: tab.properties.sheetId,
              dimension: "ROWS",
              startIndex: i + 1,
              endIndex: i + 2,
            },
          },
        },
      ],
    },
  });
  return { ok: true };
}

// Membuat tab + header yang belum ada, lalu mengisi data contoh bila kosong.
export async function bootstrap({ withSample = true } = {}) {
  if (!isConfigured()) return { mode: "demo", created: [], seeded: [] };

  const meta = await call("", { query: { fields: "sheets.properties" } });
  const existing = meta.sheets.map((s) => s.properties.title);
  const missing = SHEET_NAMES.filter((n) => !existing.includes(n));

  if (missing.length) {
    await call(":batchUpdate", {
      method: "POST",
      body: {
        requests: missing.map((title) => ({ addSheet: { properties: { title } } })),
      },
    });
  }

  const created = [];
  const seeded = [];

  for (const name of SHEET_NAMES) {
    const { fields } = SHEETS[name];
    const last = colLetter(fields.length);

    const head = await call(range(`${name}!A1:${last}1`));
    if (!head.values?.[0]?.[0]) {
      await call(range(`${name}!A1:${last}1`), {
        method: "PUT",
        query: { valueInputOption: "RAW" },
        body: { values: [fields] },
      });
      created.push(name);
    }

    if (withSample && SEED[name]?.length) {
      const body = await call(range(`${name}!A2:A2`));
      if (!body.values?.length) {
        await call(range(`${name}!A:${last}`) + ":append", {
          method: "POST",
          query: { valueInputOption: "USER_ENTERED", insertDataOption: "INSERT_ROWS" },
          body: { values: SEED[name] },
        });
        seeded.push(name);
      }
    }
  }

  return { mode: "sheets", created, seeded };
}
