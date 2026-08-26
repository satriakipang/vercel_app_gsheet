import { NextResponse } from "next/server";
import { bootstrap, isConfigured } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const need = process.env.APP_PASSWORD;
  if (need && req.headers.get("x-app-password") !== need) {
    return NextResponse.json({ error: "Kunci akses salah." }, { status: 401 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const result = await bootstrap({ withSample: body.withSample !== false });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Gagal menyiapkan spreadsheet." },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ configured: isConfigured() });
}
