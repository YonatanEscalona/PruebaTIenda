import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { fileExistsInR2 } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json();
  const blobName = String(body.blobName ?? "").trim();
  
  if (!blobName) {
    return NextResponse.json({ error: "Blob requerido" }, { status: 400 });
  }

  try {
    const exists = await fileExistsInR2(blobName);
    
    if (!exists) {
      return NextResponse.json(
        { error: "Archivo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "No se pudo verificar archivo" },
      { status: 500 }
    );
  }
}
