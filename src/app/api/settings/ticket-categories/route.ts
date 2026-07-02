import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const record = await db.setting.findUnique({ where: { key: "ticket_categories" } });
    const cats = (record?.value as string[])?.filter(Boolean);
    return NextResponse.json({ categories: cats?.length ? cats : ["Pagos", "Descargas", "Cuenta", "Técnico", "Otro"] });
  } catch {
    return NextResponse.json({ categories: [] });
  }
}
