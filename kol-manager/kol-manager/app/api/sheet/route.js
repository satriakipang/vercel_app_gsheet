import { NextResponse } from "next/server";
import {
  readAll,
  readSheet,
  appendRow,
  updateRow,
  deleteRow,
  newId,
  isConfigured,
} from "@/lib/sheets";
import { SHEETS } from "@/lib/schema";

export const dynamic = "force-dynamic";

function guard(req) {
  const need = process.env.APP_PASSWORD;
  if (!need) return null;
  const got = req.headers.get("x-app-password");
  if (got === need) return null;
  return NextResponse.json({ error: "Kunci akses salah." }, { status: 401 });
}

function bad(e) {
  const msg = e?.message || "Terjadi kesalahan tak terduga.";
  return NextResponse.json({ error: msg }, { status: 400 });
}

export async function GET(req) {
  try {
    const name = new URL(req.url).searchParams.get("name");
    if (!name) {
      return NextResponse.json({ data: await readAll(), demo: !isConfigured() });
    }
    if (!SHEETS[name]) return bad(new Error(`Sheet "${name}" tidak dikenal.`));
    return NextResponse.json({ rows: await readSheet(name), demo: !isConfigured() });
  } catch (e) {
    return bad(e);
  }
}

export async function POST(req) {
  const blocked = guard(req);
  if (blocked) return blocked;
  try {
    const { name, row } = await req.json();
    if (!SHEETS[name]) return bad(new Error(`Sheet "${name}" tidak dikenal.`));
    const record = { ...row, id: row.id || newId(name[0].toLowerCase()) };
    await appendRow(name, record);
    return NextResponse.json({ row: record });
  } catch (e) {
    return bad(e);
  }
}

export async function PUT(req) {
  const blocked = guard(req);
  if (blocked) return blocked;
  try {
    const { name, id, row } = await req.json();
    if (!SHEETS[name]) return bad(new Error(`Sheet "${name}" tidak dikenal.`));
    if (!id) return bad(new Error("id wajib diisi untuk memperbarui baris."));
    await updateRow(name, id, row);
    return NextResponse.json({ row: { ...row, id } });
  } catch (e) {
    return bad(e);
  }
}

export async function DELETE(req) {
  const blocked = guard(req);
  if (blocked) return blocked;
  try {
    const url = new URL(req.url);
    const name = url.searchParams.get("name");
    const id = url.searchParams.get("id");
    if (!SHEETS[name]) return bad(new Error(`Sheet "${name}" tidak dikenal.`));
    if (!id) return bad(new Error("id wajib diisi untuk menghapus baris."));
    await deleteRow(name, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return bad(e);
  }
}
