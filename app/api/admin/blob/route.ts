export const runtime = "edge";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { sanitizeFileName } from "@/lib/slug";
import { getUploadSignedUrl, getPublicUrl } from "@/lib/r2";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
};

function resolveContentType(filename: string, providedType: string): { ok: true; contentType: string } | { ok: false; error: string } {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const mapped = ALLOWED_TYPES[ext];
  
  if (mapped) {
    return { ok: true, contentType: mapped };
  }
  
  if (providedType && Object.values(ALLOWED_TYPES).includes(providedType)) {
    return { ok: true, contentType: providedType };
  }
  
  return { ok: false, error: "Tipo de archivo no permitido" };
}

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json();
  const filename = String(body.filename ?? "").trim();
  const providedContentType = String(body.contentType ?? "").trim();
  const size = Number(body.size ?? 0);

  if (!filename) {
    return NextResponse.json({ error: "Filename requerido" }, { status: 400 });
  }

  if (!Number.isFinite(size) || size <= 0 || size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Tamaño de archivo inválido (máx 10MB)" },
      { status: 400 }
    );
  }

  const safeName = sanitizeFileName(filename);
  const resolved = resolveContentType(safeName, providedContentType);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: 400 });
  }

  const blobName = `${Date.now()}-${safeName}`;
  const contentType = resolved.contentType;

  // Generar URL firmada para subida directa a R2
  const uploadUrl = await getUploadSignedUrl(blobName, contentType);
  
  if (!uploadUrl) {
    return NextResponse.json(
      { error: "Error generando URL de subida" },
      { status: 500 }
    );
  }

  const publicUrl = getPublicUrl(blobName);

  return NextResponse.json({ uploadUrl, publicUrl, blobName, contentType });
}
